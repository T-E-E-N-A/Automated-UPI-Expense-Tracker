import express from 'express';
import axios from 'axios';
import { requireClerkUser } from '../middleware/clerkAuth.js';
import { body } from 'express-validator';

const router = express.Router();

// @route   POST /api/ml/categorize
// @desc    Send expense text to ML service for categorization
// @access  Private
router.post('/categorize', requireClerkUser, [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Text must be between 1 and 500 characters'),
  body('merchant')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Merchant name cannot exceed 100 characters'),
  body('type')
    .optional()
    .isIn(['expense', 'income'])
    .withMessage('Type must be expense or income')
], async (req, res) => {
  try {
    const { text, merchant, type = 'expense' } = req.body;

    // If ML service is not configured, return default categorization
    if (!process.env.ML_SERVICE_URL) {
      let defaultCategories, suggestedCategory;
      
      if (type === 'income') {
        defaultCategories = [
          'Salary',
          'Freelance',
          'Investment',
          'Business',
          'Gift',
          'Refund',
          'Other'
        ];
        
        // Simple keyword-based categorization for income
        const textLower = text.toLowerCase();
        suggestedCategory = 'Other';
        
        if (textLower.includes('salary') || textLower.includes('payroll') || textLower.includes('wage')) {
          suggestedCategory = 'Salary';
        } else if (textLower.includes('freelance') || textLower.includes('contract') || textLower.includes('gig')) {
          suggestedCategory = 'Freelance';
        } else if (textLower.includes('dividend') || textLower.includes('interest') || textLower.includes('investment')) {
          suggestedCategory = 'Investment';
        } else if (textLower.includes('business') || textLower.includes('profit') || textLower.includes('revenue')) {
          suggestedCategory = 'Business';
        } else if (textLower.includes('gift') || textLower.includes('bonus') || textLower.includes('reward')) {
          suggestedCategory = 'Gift';
        } else if (textLower.includes('refund') || textLower.includes('return') || textLower.includes('reversal')) {
          suggestedCategory = 'Refund';
        }
      } else {
        // Expense categories
        defaultCategories = [
          'Food & Dining',
          'Transportation', 
          'Shopping',
          'Entertainment',
          'Healthcare',
          'Utilities',
          'Other'
        ];
        
        // Simple keyword-based categorization for expenses
        const textLower = text.toLowerCase();
        suggestedCategory = 'Other';
        
        if (textLower.includes('food') || textLower.includes('restaurant') || textLower.includes('swiggy') || textLower.includes('zomato')) {
          suggestedCategory = 'Food & Dining';
        } else if (textLower.includes('uber') || textLower.includes('ola') || textLower.includes('transport')) {
          suggestedCategory = 'Transportation';
        } else if (textLower.includes('amazon') || textLower.includes('flipkart') || textLower.includes('shopping')) {
          suggestedCategory = 'Shopping';
        } else if (textLower.includes('netflix') || textLower.includes('movie') || textLower.includes('entertainment')) {
          suggestedCategory = 'Entertainment';
        } else if (textLower.includes('hospital') || textLower.includes('pharmacy') || textLower.includes('medical')) {
          suggestedCategory = 'Healthcare';
        } else if (textLower.includes('electricity') || textLower.includes('water') || textLower.includes('utility')) {
          suggestedCategory = 'Utilities';
        }
      }

      return res.json({
        success: true,
        category: suggestedCategory,
        confidence: 0.7,
        alternatives: defaultCategories.filter(cat => cat !== suggestedCategory).slice(0, 3)
      });
    }

    // Call ML service
    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/categorize`, {
      text,
      merchant,
      type,
      userId: req.user._id
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ML_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    res.json({
      success: true,
      category: mlResponse.data.category,
      confidence: mlResponse.data.confidence,
      alternatives: mlResponse.data.alternatives || []
    });

  } catch (error) {
    console.error('ML categorization error:', error);
    
    // Fallback to default categorization on ML service error
    const defaultCategories = [
      'Food & Dining',
      'Transportation',
      'Shopping', 
      'Entertainment',
      'Healthcare',
      'Utilities',
      'Other'
    ];

    res.json({
      success: true,
      category: 'Other',
      confidence: 0.5,
      alternatives: defaultCategories.slice(0, 3),
      warning: 'ML service unavailable, using default categorization'
    });
  }
});

// @route   POST /api/ml/predict
// @desc    Call ML service for overspending forecast
// @access  Private
router.post('/predict', requireClerkUser, [
  body('timeframe')
    .optional()
    .isIn(['week', 'month', 'quarter'])
    .withMessage('Timeframe must be week, month, or quarter')
], async (req, res) => {
  try {
    const { timeframe = 'month' } = req.body;

    // If ML service is not configured, return basic prediction
    if (!process.env.ML_SERVICE_URL) {
      // Basic prediction based on historical data
      const now = new Date();
      let startDate, endDate;
      
      if (timeframe === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (timeframe === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else { // quarter
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);
      }

      // Get historical spending data
      const { default: Expense } = await import('../models/Expense.js');
      const historicalExpenses = await Expense.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: new Date() }
      }).sort({ date: -1 });

      if (historicalExpenses.length === 0) {
        return res.json({
          success: true,
          prediction: {
            timeframe,
            predictedAmount: 0,
            confidence: 0.5,
            riskLevel: 'low',
            factors: ['Insufficient historical data']
          }
        });
      }

      // Simple average-based prediction
      const totalAmount = historicalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const avgDaily = totalAmount / Math.max(1, historicalExpenses.length);
      
      let predictedAmount;
      if (timeframe === 'week') {
        predictedAmount = avgDaily * 7;
      } else if (timeframe === 'month') {
        predictedAmount = avgDaily * 30;
      } else {
        predictedAmount = avgDaily * 90;
      }

      const riskLevel = predictedAmount > (totalAmount * 1.2) ? 'high' : 
                       predictedAmount > (totalAmount * 1.1) ? 'medium' : 'low';

      return res.json({
        success: true,
        prediction: {
          timeframe,
          predictedAmount: Math.round(predictedAmount),
          confidence: 0.6,
          riskLevel,
          factors: [
            'Historical spending patterns',
            'Average daily expenditure',
            'Recent transaction trends'
          ]
        }
      });
    }

    // Call ML service for prediction
    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      userId: req.user._id,
      timeframe
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ML_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    });

    res.json({
      success: true,
      prediction: mlResponse.data
    });

  } catch (error) {
    console.error('ML prediction error:', error);
    
    // Fallback prediction on ML service error
    res.json({
      success: true,
      prediction: {
        timeframe: req.body.timeframe || 'month',
        predictedAmount: 0,
        confidence: 0.3,
        riskLevel: 'unknown',
        factors: ['ML service unavailable'],
        warning: 'Prediction may not be accurate due to service unavailability'
      }
    });
  }
});

// @route   GET /api/ml/insights
// @desc    Get AI-powered spending insights
// @access  Private
router.get('/insights', requireClerkUser, async (req, res) => {
  try {
    const { default: Expense } = await import('../models/Expense.js');
    const { default: Income } = await import('../models/Income.js');
    
    // Get last 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [expenses, income] = await Promise.all([
      Expense.find({ userId: req.user._id, date: { $gte: thirtyDaysAgo } }),
      Income.find({ userId: req.user._id, date: { $gte: thirtyDaysAgo } })
    ]);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Generate basic insights
    const insights = [];
    
    // Spending pattern insight
    const avgDailyExpense = totalExpenses / 30;
    if (avgDailyExpense > 1000) {
      insights.push({
        type: 'warning',
        title: 'High Daily Spending',
        message: `Your average daily spending is ₹${Math.round(avgDailyExpense)}. Consider reviewing your expenses.`,
        suggestion: 'Try to reduce unnecessary expenses and set a daily budget limit.'
      });
    }

    // Category analysis
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory && topCategory[1] > totalExpenses * 0.4) {
      insights.push({
        type: 'info',
        title: 'Top Spending Category',
        message: `${topCategory[0]} accounts for ${Math.round((topCategory[1] / totalExpenses) * 100)}% of your expenses.`,
        suggestion: 'Consider if this spending aligns with your financial goals.'
      });
    }

    // Savings insight
    const savings = totalIncome - totalExpenses;
    if (savings < 0) {
      insights.push({
        type: 'critical',
        title: 'Overspending Alert',
        message: `You've spent ₹${Math.abs(savings)} more than your income this month.`,
        suggestion: 'Review your expenses and consider reducing non-essential spending.'
      });
    } else if (savings < totalIncome * 0.1) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        message: `You're saving only ${Math.round((savings / totalIncome) * 100)}% of your income.`,
        suggestion: 'Aim to save at least 20% of your income for better financial health.'
      });
    }

    res.json({
      success: true,
      insights,
      summary: {
        totalExpenses,
        totalIncome,
        savings,
        avgDailyExpense: Math.round(avgDailyExpense)
      }
    });

  } catch (error) {
    console.error('ML insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
