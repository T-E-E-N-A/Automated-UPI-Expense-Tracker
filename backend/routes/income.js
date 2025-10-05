import express from 'express';
import Income from '../models/Income.js';
import { authenticateClerkUser, requireClerkUser } from '../middleware/clerkAuth.js';
import { validateIncome, validatePagination, validateDateRange, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/income/add
// @desc    Add new income
// @access  Private
router.post('/add', authenticateClerkUser, validateIncome, async (req, res) => {
  try {
    const { date, source, amount, notes, tags } = req.body;
    
    const income = new Income({
      userId: req.user._id,
      date: date ? new Date(date) : new Date(),
      source,
      amount,
      notes,
      tags: tags || []
    });

    await income.save();

    res.status(201).json({
      success: true,
      message: 'Income added successfully',
      income: {
        id: income._id,
        date: income.date,
        source: income.source,
        amount: income.amount,
        notes: income.notes,
        tags: income.tags,
        createdAt: income.createdAt
      }
    });
  } catch (error) {
    console.error('Add income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add income',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/income
// @desc    Get user income
// @access  Private
router.get('/', requireClerkUser, async (req, res) => {
  try {
    const { page = 1, limit = 30, startDate, endDate, source, search } = req.query;
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

    // Source filter
    if (source) {
      query.source = source;
    }

    // Search filter
    if (search) {
      query.$or = [
        { source: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Get income
    const income = await Income.find(query)
      .sort({ date: -1, createdAt: -1 })
      .select('-userId');

    res.json({
      success: true,
      income
    });
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get income',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/income/:id
// @desc    Get single income by ID
// @access  Private
router.get('/:id', requireClerkUser, validateObjectId, async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    res.json({
      success: true,
      income
    });
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get income',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/income/:id
// @desc    Update income
// @access  Private
router.put('/:id', requireClerkUser, validateObjectId, validateIncome, async (req, res) => {
  try {
    const { date, source, amount, notes, tags } = req.body;

    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    // Update income
    income.date = date ? new Date(date) : income.date;
    income.source = source;
    income.amount = amount;
    income.notes = notes;
    income.tags = tags || income.tags;

    await income.save();

    res.json({
      success: true,
      message: 'Income updated successfully',
      income
    });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update income',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/income/:id
// @desc    Delete income
// @access  Private
router.delete('/:id', requireClerkUser, validateObjectId, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    res.json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete income',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/income/sources/list
// @desc    Get available income sources
// @access  Private
router.get('/sources/list', requireClerkUser, (req, res) => {
  const sources = [
    'Salary',
    'Freelance',
    'Investment Returns',
    'Bonus',
    'Gift',
    'Side Business',
    'Rental Income',
    'Dividends',
    'Interest',
    'Other'
  ];

  res.json({
    success: true,
    sources
  });
});

// @route   GET /api/income/recent
// @desc    Get recent income (last 5)
// @access  Private
router.get('/recent', requireClerkUser, async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
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

export default router;
