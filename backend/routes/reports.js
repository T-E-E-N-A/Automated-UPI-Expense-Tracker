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

// Helper function to convert data to CSV
const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  return [csvHeaders, ...csvRows].join('\n');
};

// @route   GET /api/reports/download/expenses
// @desc    Download expenses report as CSV
// @access  Private
router.get('/download/expenses', requireClerkUser, async (req, res) => {
  try {
    const { startDate, endDate, category, minAmount, maxAmount } = req.query;
    
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

    // Amount filters
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Get expenses
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .select('-userId -__v');

    // Prepare CSV data
    const headers = ['Date', 'Category', 'Merchant/UPI', 'Amount', 'Payment Method', 'Notes'];
    const csvData = expenses.map(expense => ({
      'Date': new Date(expense.date).toLocaleDateString('en-IN'),
      'Category': expense.category || '',
      'Merchant/UPI': expense.merchant || expense.upiId || '',
      'Amount': expense.amount.toFixed(2),
      'Payment Method': expense.paymentMethod || 'UPI',
      'Notes': expense.notes || ''
    }));

    const csv = convertToCSV(csvData, headers);
    
    // Calculate totals
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const summary = `\n\nSummary\nTotal Expenses: ${expenses.length}\nTotal Amount: ₹${totalAmount.toFixed(2)}`;
    const finalCSV = csv + summary;

    // Set headers for CSV download
    const filename = `expenses-report-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(finalCSV);
  } catch (error) {
    console.error('Download expenses report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download expenses report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/download/income
// @desc    Download income report as CSV
// @access  Private
router.get('/download/income', requireClerkUser, async (req, res) => {
  try {
    const { startDate, endDate, source, minAmount, maxAmount } = req.query;
    
    // Build query
    const query = { userId: req.user._id };

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Source filter
    if (source) {
      query.source = source;
    }

    // Amount filters
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Get income
    const income = await Income.find(query)
      .sort({ date: -1, createdAt: -1 })
      .select('-userId -__v');

    // Prepare CSV data
    const headers = ['Date', 'Source', 'Amount', 'Notes'];
    const csvData = income.map(incomeItem => ({
      'Date': new Date(incomeItem.date).toLocaleDateString('en-IN'),
      'Source': incomeItem.source || '',
      'Amount': incomeItem.amount.toFixed(2),
      'Notes': incomeItem.notes || ''
    }));

    const csv = convertToCSV(csvData, headers);
    
    // Calculate totals
    const totalAmount = income.reduce((sum, inc) => sum + inc.amount, 0);
    const summary = `\n\nSummary\nTotal Income Entries: ${income.length}\nTotal Amount: ₹${totalAmount.toFixed(2)}`;
    const finalCSV = csv + summary;

    // Set headers for CSV download
    const filename = `income-report-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(finalCSV);
  } catch (error) {
    console.error('Download income report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download income report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reports/download/combined
// @desc    Download combined expenses and income report as CSV
// @access  Private
router.get('/download/combined', requireClerkUser, async (req, res) => {
  try {
    const { startDate, endDate, category, source, minAmount, maxAmount } = req.query;
    
    // Build expense query
    const expenseQuery = { userId: req.user._id };
    if (startDate && endDate) {
      expenseQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (category) expenseQuery.category = category;
    if (minAmount || maxAmount) {
      expenseQuery.amount = {};
      if (minAmount) expenseQuery.amount.$gte = parseFloat(minAmount);
      if (maxAmount) expenseQuery.amount.$lte = parseFloat(maxAmount);
    }

    // Build income query
    const incomeQuery = { userId: req.user._id };
    if (startDate && endDate) {
      incomeQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (source) incomeQuery.source = source;
    if (minAmount || maxAmount) {
      incomeQuery.amount = {};
      if (minAmount) incomeQuery.amount.$gte = parseFloat(minAmount);
      if (maxAmount) incomeQuery.amount.$lte = parseFloat(maxAmount);
    }

    // Get expenses and income
    const [expenses, income] = await Promise.all([
      Expense.find(expenseQuery).sort({ date: -1 }).select('-userId -__v'),
      Income.find(incomeQuery).sort({ date: -1 }).select('-userId -__v')
    ]);

    // Prepare CSV data
    const headers = ['Date', 'Type', 'Category/Source', 'Merchant/UPI', 'Amount', 'Payment Method', 'Notes'];
    const csvData = [];

    // Add expenses
    expenses.forEach(expense => {
      csvData.push({
        'Date': new Date(expense.date).toLocaleDateString('en-IN'),
        'Type': 'Expense',
        'Category/Source': expense.category || '',
        'Merchant/UPI': expense.merchant || expense.upiId || '',
        'Amount': `-${expense.amount.toFixed(2)}`,
        'Payment Method': expense.paymentMethod || 'UPI',
        'Notes': expense.notes || ''
      });
    });

    // Add income
    income.forEach(incomeItem => {
      csvData.push({
        'Date': new Date(incomeItem.date).toLocaleDateString('en-IN'),
        'Type': 'Income',
        'Category/Source': incomeItem.source || '',
        'Merchant/UPI': '',
        'Amount': `+${incomeItem.amount.toFixed(2)}`,
        'Payment Method': '',
        'Transaction Type': '',
        'Notes': incomeItem.notes || ''
      });
    });

    // Sort by date
    csvData.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    const csv = convertToCSV(csvData, headers);
    
    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    const summary = `\n\nSummary\nTotal Expenses: ${expenses.length} (₹${totalExpenses.toFixed(2)})\nTotal Income: ${income.length} (₹${totalIncome.toFixed(2)})\nNet Amount: ₹${netAmount.toFixed(2)}`;
    const finalCSV = csv + summary;

    // Set headers for CSV download
    const filename = `combined-report-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(finalCSV);
  } catch (error) {
    console.error('Download combined report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download combined report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
