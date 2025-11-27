import express from 'express';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import { evaluateBudgetThresholds, formatINR, pushNotification } from '../utils/notificationHelper.js';
import { authenticateClerkUser, requireClerkUser } from '../middleware/clerkAuth.js';
import { validateExpense, validatePagination, validateDateRange, validateObjectId } from '../middleware/validation.js';


const router = express.Router();

// @route   POST /api/expenses/add
// @desc    Add new expense
// @access  Private
router.post('/add', authenticateClerkUser, validateExpense, async (req, res) => {
  try {
    const { 
      date, 
      category, 
      merchant, 
      upiId, 
      amount, 
      notes, 
      paymentMethod, 
      tags
    } = req.body;
    
    const expense = new Expense({
      userId: req.user._id,
      date: date ? new Date(date) : new Date(),
      category,
      merchant,
      upiId,
      amount,
      notes,
      paymentMethod: paymentMethod || 'UPI',
      tags: tags || []
    });

    await expense.save();

    // Update budget if exists
    try {
      const { budget, previousSpent } = await Budget.updateCurrentMonthSpent(req.user._id, amount);
      await evaluateBudgetThresholds({
        userId: req.user._id,
        scope: 'overall',
        limit: budget.monthlyLimit,
        thresholds: budget.alertThresholds,
        previousValue: previousSpent,
        currentValue: budget.currentMonthSpent
      });

      const categoryResult = await Budget.updateCategoryBudget(req.user._id, category, amount);
      if (categoryResult?.categoryBudget) {
        await evaluateBudgetThresholds({
          userId: req.user._id,
          scope: 'category',
          category,
          limit: categoryResult.categoryBudget.limit,
          thresholds: categoryResult.categoryBudget.alertThresholds,
          previousValue: categoryResult.previousSpent,
          currentValue: categoryResult.categoryBudget.currentMonthSpent
        });
      }
    } catch (budgetError) {
      console.warn('Budget update failed:', budgetError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense: {
        id: expense._id,
        date: expense.date,
        category: expense.category,
        merchant: expense.merchant,
        amount: expense.amount,
        notes: expense.notes,
        paymentMethod: expense.paymentMethod,
        tags: expense.tags,
        createdAt: expense.createdAt
      }
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add expense',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/expenses
// @desc    Get user expenses
// @access  Private
router.get('/', requireClerkUser, async (req, res) => {
  try {
    const { page = 1, limit = 30, startDate, endDate, category, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { userId: req.user._id };

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { merchant: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Get expenses
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .select('-userId');

    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get single expense by ID
// @access  Private
router.get('/:id', requireClerkUser, validateObjectId, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', requireClerkUser, validateObjectId, validateExpense, async (req, res) => {
  try {
    const { date, category, merchant, upiId, amount, notes, paymentMethod, tags } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Store old amount for budget update
    const oldAmount = expense.amount;
    const oldCategory = expense.category;

    // Update expense
    expense.date = date ? new Date(date) : expense.date;
    expense.category = category;
    expense.merchant = merchant;
    expense.upiId = upiId;
    expense.amount = amount;
    expense.notes = notes;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    expense.tags = tags || expense.tags;

    await expense.save();

    // Update budget with amount difference
    try {
      const amountDifference = amount - oldAmount;
      if (amountDifference !== 0) {
        const { budget, previousSpent } = await Budget.updateCurrentMonthSpent(req.user._id, amountDifference);
        await evaluateBudgetThresholds({
          userId: req.user._id,
          scope: 'overall',
          limit: budget.monthlyLimit,
          thresholds: budget.alertThresholds,
          previousValue: previousSpent,
          currentValue: budget.currentMonthSpent
        });
      }

      // Adjust category budgets
      if (oldCategory === expense.category) {
        const categoryDelta = amount - oldAmount;
        if (categoryDelta !== 0) {
          const categoryUpdate = await Budget.updateCategoryBudget(req.user._id, expense.category, categoryDelta);
          if (categoryUpdate?.categoryBudget && categoryDelta > 0) {
            await evaluateBudgetThresholds({
              userId: req.user._id,
              scope: 'category',
              category: expense.category,
              limit: categoryUpdate.categoryBudget.limit,
              thresholds: categoryUpdate.categoryBudget.alertThresholds,
              previousValue: categoryUpdate.previousSpent,
              currentValue: categoryUpdate.categoryBudget.currentMonthSpent
            });
          }
        }
      } else {
        await Budget.updateCategoryBudget(req.user._id, oldCategory, -oldAmount);
        const newCategoryUpdate = await Budget.updateCategoryBudget(req.user._id, expense.category, expense.amount);
        if (newCategoryUpdate?.categoryBudget) {
          await evaluateBudgetThresholds({
            userId: req.user._id,
            scope: 'category',
            category: expense.category,
            limit: newCategoryUpdate.categoryBudget.limit,
            thresholds: newCategoryUpdate.categoryBudget.alertThresholds,
            previousValue: newCategoryUpdate.previousSpent,
            currentValue: newCategoryUpdate.categoryBudget.currentMonthSpent
          });
        }
      }
    } catch (budgetError) {
      console.warn('Budget update failed:', budgetError.message);
    }

    // Notify transaction update
    await pushNotification({
      userId: req.user._id,
      type: 'transaction_update',
      title: 'Expense updated',
      message: `Updated ${expense.category} expense to ${formatINR(expense.amount)}.`,
      data: {
        entity: 'expense',
        expenseId: expense._id,
        category: expense.category,
        merchant: expense.merchant,
        amount: expense.amount
      }
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', requireClerkUser, validateObjectId, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update budget by subtracting the amount
    try {
      await Budget.updateCurrentMonthSpent(req.user._id, -expense.amount);
      await Budget.updateCategoryBudget(req.user._id, expense.category, -expense.amount);
    } catch (budgetError) {
      console.warn('Budget update failed:', budgetError.message);
    }

    await pushNotification({
      userId: req.user._id,
      type: 'transaction_delete',
      title: 'Expense deleted',
      message: `Deleted ${expense.category} expense of ${formatINR(expense.amount)}.`,
      data: {
        entity: 'expense',
        expenseId: expense._id,
        category: expense.category,
        merchant: expense.merchant,
        amount: expense.amount
      }
    });

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/expenses/categories/list
// @desc    Get available expense categories
// @access  Private
router.get('/categories/list', requireClerkUser, (req, res) => {
  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Education',
    'Travel',
    'Insurance',
    'Other'
  ];

  res.json({
    success: true,
    categories
  });
});

// @route   GET /api/expenses/recent
// @desc    Get recent expenses (last 5)
// @access  Private
router.get('/recent', requireClerkUser, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .select('-userId');

    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    console.error('Get recent expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
