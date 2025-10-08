import express from 'express';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import { requireClerkUser } from '../middleware/clerkAuth.js';
import { validateDateRange } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/reports/category
// @desc    Get category-wise expense summary
// @access  Private
router.get('/category', requireClerkUser, validateDateRange, async (req, res) => {
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

    // Calculate total for percentage calculation
    const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.total, 0);

    // Add percentage to each category
    const categoriesWithPercentage = expensesByCategory.map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? Math.round((item.total / totalExpenses) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        categories: categoriesWithPercentage,
        totalExpenses,
        period: {
          startDate: dateFilter.$gte,
          endDate: dateFilter.$lte
        }
      }
    });
  } catch (error) {
    console.error('Category report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/income/source
// @desc    Get source-wise income summary
// @access  Private
router.get('/income/source', requireClerkUser, validateDateRange, async (req, res) => {
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

    // Calculate total for percentage calculation
    const totalIncome = incomeBySource.reduce((sum, item) => sum + item.total, 0);

    // Add percentage to each source
    const sourcesWithPercentage = incomeBySource.map(item => ({
      ...item,
      percentage: totalIncome > 0 ? Math.round((item.total / totalIncome) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        sources: sourcesWithPercentage,
        totalIncome,
        period: {
          startDate: dateFilter.$gte,
          endDate: dateFilter.$lte
        }
      }
    });
  } catch (error) {
    console.error('Income source report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get income source report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/monthly/expenses
// @desc    Get monthly expense trends
// @access  Private
router.get('/monthly/expenses', requireClerkUser, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const trends = [];
    const now = new Date();
    
    // Get specified number of months
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const totalExpenses = await Expense.getTotalExpenses(req.user._id, startOfMonth, endOfMonth);
      
      trends.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalExpenses
      });
    }

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Monthly expenses report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly expenses report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/monthly/income
// @desc    Get monthly income trends
// @access  Private
router.get('/monthly/income', requireClerkUser, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const trends = [];
    const now = new Date();
    
    // Get specified number of months
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const totalIncome = await Income.getTotalIncome(req.user._id, startOfMonth, endOfMonth);
      
      trends.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalIncome
      });
    }

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Monthly income report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly income report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/daily/expenses
// @desc    Get daily expense trends for the last 30 days
// @access  Private
router.get('/daily/expenses', requireClerkUser, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = [];
    const now = new Date();
    
    // Get specified number of days
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      
      const totalExpenses = await Expense.getTotalExpenses(req.user._id, startOfDay, endOfDay);
      
      trends.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        totalExpenses
      });
    }

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Daily expenses report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily expenses report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/merchant/top
// @desc    Get top merchants by expense amount
// @access  Private
router.get('/merchant/top', requireClerkUser, validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
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

    const topMerchants = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: dateFilter
        }
      },
      {
        $group: {
          _id: '$merchant',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: {
        merchants: topMerchants,
        period: {
          startDate: dateFilter.$gte,
          endDate: dateFilter.$lte
        }
      }
    });
  } catch (error) {
    console.error('Top merchants report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top merchants report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
