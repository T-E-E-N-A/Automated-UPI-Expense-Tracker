import express from 'express';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import { requireClerkUser } from '../middleware/clerkAuth.js';
import { validateDateRange } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary (overall expenses, income, balance)
// @access  Private
router.get('/summary', requireClerkUser, validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set default date range to current month if not provided
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    }

    // Get total expenses
    const totalExpenses = await Expense.getTotalExpenses(req.user._id, dateFilter.$gte, dateFilter.$lte);
    
    // Get total income
    const totalIncome = await Income.getTotalIncome(req.user._id, dateFilter.$gte, dateFilter.$lte);
    
    // Calculate balance
    const balance = totalIncome - totalExpenses;
    
    // Get budget info if exists
    let budgetInfo = null;
    try {
      const budget = await Budget.findOne({ userId: req.user._id });
      if (budget) {
        budgetInfo = {
          monthlyLimit: budget.monthlyLimit,
          currentMonthSpent: budget.currentMonthSpent,
          remainingBudget: budget.remainingBudget,
          utilizationPercentage: budget.utilizationPercentage,
          isExceeded: budget.isExceeded()
        };
      }
    } catch (budgetError) {
      console.warn('Budget info failed:', budgetError.message);
    }

    res.json({
      success: true,
      summary: {
        totalExpenses,
        totalIncome,
        balance,
        budgetInfo,
        period: {
          startDate: dateFilter.$gte,
          endDate: dateFilter.$lte
        }
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/expenses/recent
// @desc    Get recent expenses for dashboard
// @access  Private
router.get('/expenses/recent', requireClerkUser, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
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

// @route   GET /api/dashboard/income/recent
// @desc    Get recent income for dashboard
// @access  Private
router.get('/income/recent', requireClerkUser, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const income = await Income.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-userId');

    res.json({
      success: true,
      income
    });
  } catch (error) {
    console.error('Get recent income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent income',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/expenses/categories
// @desc    Get expenses by category for dashboard charts
// @access  Private
router.get('/expenses/categories', requireClerkUser, validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    }

    const expensesByCategory = await Expense.getExpensesByCategory(
      req.user._id, 
      dateFilter.$gte, 
      dateFilter.$lte
    );

    res.json({
      success: true,
      data: expensesByCategory
    });
  } catch (error) {
    console.error('Get expenses by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expenses by category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/income/sources
// @desc    Get income by source for dashboard charts
// @access  Private
router.get('/income/sources', requireClerkUser, validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    }

    const incomeBySource = await Income.getIncomeBySource(
      req.user._id, 
      dateFilter.$gte, 
      dateFilter.$lte
    );

    res.json({
      success: true,
      data: incomeBySource
    });
  } catch (error) {
    console.error('Get income by source error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get income by source',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/trends/monthly
// @desc    Get monthly trends for the last 6 months
// @access  Private
router.get('/trends/monthly', requireClerkUser, async (req, res) => {
  try {
    const months = [];
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const [totalExpenses, totalIncome] = await Promise.all([
        Expense.getTotalExpenses(req.user._id, startOfMonth, endOfMonth),
        Income.getTotalIncome(req.user._id, startOfMonth, endOfMonth)
      ]);
      
      months.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses
      });
    }

    res.json({
      success: true,
      trends: months
    });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly trends',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
