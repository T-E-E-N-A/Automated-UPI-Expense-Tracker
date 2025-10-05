import express from 'express';
import Budget from '../models/Budget.js';
import { requireClerkUser } from '../middleware/clerkAuth.js';
import { validateBudget } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/budget
// @desc    Get user's budget information
// @access  Private
router.get('/', requireClerkUser, async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.user._id });
    
    if (!budget) {
      // Create default budget if none exists
      budget = new Budget({
        userId: req.user._id,
        monthlyLimit: 0,
        currentMonthSpent: 0
      });
      await budget.save();
    }

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
    const { monthlyLimit, alertThresholds } = req.body;

    const updateData = {
      monthlyLimit,
      updatedAt: new Date()
    };

    if (alertThresholds) {
      updateData.alertThresholds = {
        warning: alertThresholds.warning || 80,
        critical: alertThresholds.critical || 95
      };
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

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

    const status = {
      hasBudget: true,
      utilizationPercentage: budget.utilizationPercentage,
      remainingBudget: budget.remainingBudget,
      isExceeded: budget.isExceeded(),
      status: budget.isExceeded() ? 'exceeded' : 
              budget.isCriticalThresholdReached() ? 'critical' :
              budget.isWarningThresholdReached() ? 'warning' : 'good',
      alerts: []
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
