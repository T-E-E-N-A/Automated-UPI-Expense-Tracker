import express from 'express';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { requireClerkUser } from '../middleware/clerkAuth.js';
import { validateBudget } from '../middleware/validation.js';

const router = express.Router();

const getMonthKey = (date = new Date()) => date.toISOString().slice(0, 7);

const getMonthDateRange = (monthKey) => {
  if (!monthKey) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const buildExpenseSnapshot = async (userId, monthKey, categoriesFilter = null) => {
  const { start, end } = getMonthDateRange(monthKey);
  const match = {
    userId,
    date: { $gte: start, $lte: end }
  };

  if (Array.isArray(categoriesFilter) && categoriesFilter.length > 0) {
    match.category = { $in: categoriesFilter };
  }

  const categoryTotals = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    }
  ]);

  const categories = categoryTotals.reduce((acc, entry) => {
    acc[entry._id] = entry.total;
    return acc;
  }, {});

  const total = categoryTotals.reduce((sum, entry) => sum + entry.total, 0);

  return { total, categories };
};

const syncBudgetWithExpenses = async (budget, userId) => {
  const snapshot = await buildExpenseSnapshot(userId, budget.currentMonth);
  let changed = false;

  if (budget.currentMonthSpent !== snapshot.total) {
    budget.currentMonthSpent = snapshot.total;
    changed = true;
  }

  if (budget.categoryBudgets && budget.categoryBudgets.length) {
    budget.categoryBudgets.forEach(entry => {
      const categoryTotal = snapshot.categories[entry.category] || 0;
      if (entry.currentMonthSpent !== categoryTotal) {
        entry.currentMonthSpent = categoryTotal;
        changed = true;
      }
    });
  }

  if (changed) {
    budget.updatedAt = new Date();
    await budget.save();
  }

  return budget;
};

// @route   GET /api/budget
// @desc    Get user's budget information
// @access  Private
router.get('/', requireClerkUser, async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.user._id });
    
    if (!budget) {
      budget = new Budget({
        userId: req.user._id,
        monthlyLimit: 0,
        currentMonthSpent: 0,
        categoryBudgets: []
      });
      await budget.save();
    } else {
      await budget.syncToMonth();
    }

    await syncBudgetWithExpenses(budget, req.user._id);

    res.json({
      success: true,
      budget: {
        id: budget._id,
        monthlyLimit: budget.monthlyLimit,
        currentMonthSpent: budget.currentMonthSpent,
        remainingBudget: budget.remainingBudget,
        utilizationPercentage: budget.utilizationPercentage,
        isExceeded: budget.isExceeded(),
        alertThresholds: budget.alertThresholds,
        alertsTriggered: budget.alertsTriggered,
        lastAlertSent: budget.lastAlertSent,
        currentMonth: budget.currentMonth,
        categoryBudgets: budget.categoryBudgets,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt
      }
    });

  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get budget information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/budget
// @desc    Update user's budget
// @access  Private
router.put('/', requireClerkUser, validateBudget, async (req, res) => {
  try {
    const { monthlyLimit, alertThresholds, categoryBudgets } = req.body;
    let existingBudget = await Budget.findOne({ userId: req.user._id });
    if (existingBudget) {
      await existingBudget.syncToMonth();
    }

    const updateData = {
      monthlyLimit,
      updatedAt: new Date()
    };

    if (alertThresholds) {
      updateData.alertThresholds = {
        warning: alertThresholds.warning ?? 80,
        critical: alertThresholds.critical ?? 95
      };
    }

    if (Array.isArray(categoryBudgets)) {
      const seen = new Set();
      const normalized = [];
      const categoriesNeedingSnapshot = [];

      categoryBudgets.forEach(entry => {
        if (!entry?.category || !entry?.limit || entry.limit < 0) return;
        const categoryKey = entry.category.trim();
        if (!categoryKey || seen.has(categoryKey)) return;
        seen.add(categoryKey);

        const existingEntry = existingBudget?.getCategoryBudget(categoryKey);
        if (!existingEntry) {
          categoriesNeedingSnapshot.push(categoryKey);
        }

        normalized.push({
          category: categoryKey,
          limit: entry.limit,
          existingEntry,
          alertThresholds: {
            warning: entry.alertThresholds?.warning ?? existingEntry?.alertThresholds?.warning ?? 80,
            critical: entry.alertThresholds?.critical ?? existingEntry?.alertThresholds?.critical ?? 95
          },
          isActive: entry.isActive ?? existingEntry?.isActive ?? true
        });
      });

      let snapshotMap = {};
      if (categoriesNeedingSnapshot.length > 0) {
        const monthKey = existingBudget?.currentMonth || getMonthKey();
        const snapshot = await buildExpenseSnapshot(
          req.user._id,
          monthKey,
          categoriesNeedingSnapshot
        );
        snapshotMap = snapshot.categories;
      }

      updateData.categoryBudgets = normalized.map(entry => ({
        category: entry.category,
        limit: entry.limit,
        currentMonthSpent: entry.existingEntry
          ? entry.existingEntry.currentMonthSpent
          : snapshotMap[entry.category] || 0,
        alertsTriggered: entry.existingEntry?.alertsTriggered || 0,
        alertThresholds: entry.alertThresholds,
        isActive: entry.isActive,
        lastAlertSent: entry.existingEntry?.lastAlertSent || null
      }));
    }

    let budget = await Budget.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    await budget.syncToMonth();
    budget = await syncBudgetWithExpenses(budget, req.user._id);

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget: {
        id: budget._id,
        monthlyLimit: budget.monthlyLimit,
        currentMonthSpent: budget.currentMonthSpent,
        remainingBudget: budget.remainingBudget,
        utilizationPercentage: budget.utilizationPercentage,
        isExceeded: budget.isExceeded(),
        alertThresholds: budget.alertThresholds,
        currentMonth: budget.currentMonth,
        categoryBudgets: budget.categoryBudgets,
        updatedAt: budget.updatedAt
      }
    });

  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/budget/reset
// @desc    Reset monthly budget (start new month)
// @access  Private
router.post('/reset', requireClerkUser, async (req, res) => {
  try {
    const budget = await Budget.resetMonthlyBudget(req.user._id);

    res.json({
      success: true,
      message: 'Budget reset for new month',
      budget: {
        id: budget._id,
        monthlyLimit: budget.monthlyLimit,
        currentMonthSpent: budget.currentMonthSpent,
        remainingBudget: budget.remainingBudget,
        utilizationPercentage: budget.utilizationPercentage,
        currentMonth: budget.currentMonth,
        categoryBudgets: budget.categoryBudgets,
        updatedAt: budget.updatedAt
      }
    });

  } catch (error) {
    console.error('Reset budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset budget',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/budget/status
// @desc    Get budget status and alerts
// @access  Private
router.get('/status', requireClerkUser, async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });
    
    if (!budget) {
      return res.json({
        success: true,
        status: {
          hasBudget: false,
          message: 'No budget set. Create a budget to track your spending.'
        }
      });
    }

    await budget.syncToMonth();
    await syncBudgetWithExpenses(budget, req.user._id);

    const status = {
      hasBudget: true,
      utilizationPercentage: budget.utilizationPercentage,
      remainingBudget: budget.remainingBudget,
      isExceeded: budget.isExceeded(),
      status: budget.isExceeded() ? 'exceeded' : 
              budget.isCriticalThresholdReached() ? 'critical' :
              budget.isWarningThresholdReached() ? 'warning' : 'good',
      alerts: [],
      categoryBudgets: budget.categoryBudgets
    };

    // Generate status messages
    if (budget.isExceeded()) {
      status.alerts.push({
        type: 'critical',
        message: `Budget exceeded by ₹${Math.abs(budget.remainingBudget)}`
      });
    } else if (budget.isCriticalThresholdReached()) {
      status.alerts.push({
        type: 'warning',
        message: `Budget usage at ${budget.utilizationPercentage}% - approaching limit`
      });
    } else if (budget.isWarningThresholdReached()) {
      status.alerts.push({
        type: 'info',
        message: `Budget usage at ${budget.utilizationPercentage}% - monitor spending`
      });
    }

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get budget status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
