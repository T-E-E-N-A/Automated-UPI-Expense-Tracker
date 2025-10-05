import express from 'express';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { requireClerkUser } from '../middleware/clerkAuth.js';
import { body } from 'express-validator';

const router = express.Router();

// @route   GET /api/notifications/alerts
// @desc    Get spending alerts and notifications
// @access  Private
router.get('/alerts', requireClerkUser, async (req, res) => {
  try {
    const alerts = [];
    
    // Check budget alerts
    const budget = await Budget.findOne({ userId: req.user._id });
    if (budget) {
      const utilizationPercentage = budget.utilizationPercentage;
      
      if (budget.isExceeded()) {
        alerts.push({
          type: 'critical',
          title: 'Budget Exceeded',
          message: `You've exceeded your monthly budget by ₹${Math.abs(budget.remainingBudget)}.`,
          timestamp: new Date(),
          action: 'Review your expenses and consider adjusting your budget.'
        });
      } else if (budget.isCriticalThresholdReached()) {
        alerts.push({
          type: 'warning',
          title: 'Budget Critical',
          message: `You've used ${utilizationPercentage}% of your monthly budget.`,
          timestamp: new Date(),
          action: 'Consider reducing expenses to stay within budget.'
        });
      } else if (budget.isWarningThresholdReached()) {
        alerts.push({
          type: 'info',
          title: 'Budget Warning',
          message: `You've used ${utilizationPercentage}% of your monthly budget.`,
          timestamp: new Date(),
          action: 'Monitor your spending to avoid exceeding your budget.'
        });
      }
    }

    // Check for unusual spending patterns
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [lastWeekExpenses, lastMonthExpenses] = await Promise.all([
      Expense.find({ userId: req.user._id, date: { $gte: lastWeek } }),
      Expense.find({ userId: req.user._id, date: { $gte: lastMonth } })
    ]);

    const lastWeekTotal = lastWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgWeeklySpending = lastMonthTotal / 4;

    if (lastWeekTotal > avgWeeklySpending * 1.5) {
      alerts.push({
        type: 'warning',
        title: 'Unusual Spending Pattern',
        message: `Your spending this week (₹${Math.round(lastWeekTotal)}) is significantly higher than your average.`,
        timestamp: new Date(),
        action: 'Review your recent expenses to identify any unusual transactions.'
      });
    }

    // Check for high-frequency transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayExpenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: today }
    });

    if (todayExpenses.length > 10) {
      alerts.push({
        type: 'info',
        title: 'High Transaction Frequency',
        message: `You've made ${todayExpenses.length} transactions today.`,
        timestamp: new Date(),
        action: 'Consider consolidating similar purchases to better track your spending.'
      });
    }

    res.json({
      success: true,
      alerts,
      summary: {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.type === 'critical').length,
        warningAlerts: alerts.filter(a => a.type === 'warning').length,
        infoAlerts: alerts.filter(a => a.type === 'info').length
      }
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/notifications/send
// @desc    Send overspending alert (for future Firebase integration)
// @access  Private
router.post('/send', requireClerkUser, [
  body('type')
    .isIn(['budget_warning', 'budget_critical', 'budget_exceeded', 'unusual_spending'])
    .withMessage('Invalid notification type'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const { type, message, userId } = req.body;

    // For now, just log the notification
    // In the future, integrate with Firebase Cloud Messaging
    console.log('Notification sent:', {
      type,
      message,
      userId: userId || req.user._id,
      timestamp: new Date()
    });

    // Update budget alerts triggered count
    if (type.startsWith('budget_')) {
      await Budget.findOneAndUpdate(
        { userId: req.user._id },
        { 
          $inc: { alertsTriggered: 1 },
          $set: { lastAlertSent: new Date() }
        }
      );
    }

    res.json({
      success: true,
      message: 'Notification sent successfully',
      notification: {
        type,
        message,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/notifications/settings
// @desc    Get notification settings
// @access  Private
router.get('/settings', requireClerkUser, async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });
    
    const settings = {
      budgetAlerts: {
        enabled: true,
        warningThreshold: budget?.alertThresholds?.warning || 80,
        criticalThreshold: budget?.alertThresholds?.critical || 95
      },
      spendingAlerts: {
        enabled: true,
        unusualSpendingThreshold: 1.5, // 150% of average
        highFrequencyThreshold: 10 // transactions per day
      },
      emailNotifications: {
        enabled: false, // Will be implemented with email service
        frequency: 'daily'
      },
      pushNotifications: {
        enabled: false, // Will be implemented with Firebase
        types: ['budget_warning', 'budget_critical', 'unusual_spending']
      }
    };

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/notifications/settings
// @desc    Update notification settings
// @access  Private
router.put('/settings', requireClerkUser, [
  body('budgetAlerts.warningThreshold')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Warning threshold must be between 0 and 100'),
  body('budgetAlerts.criticalThreshold')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Critical threshold must be between 0 and 100')
], async (req, res) => {
  try {
    const { budgetAlerts } = req.body;

    if (budgetAlerts) {
      const updateData = {};
      
      if (budgetAlerts.warningThreshold !== undefined) {
        updateData['alertThresholds.warning'] = budgetAlerts.warningThreshold;
      }
      
      if (budgetAlerts.criticalThreshold !== undefined) {
        updateData['alertThresholds.critical'] = budgetAlerts.criticalThreshold;
      }

      if (Object.keys(updateData).length > 0) {
        await Budget.findOneAndUpdate(
          { userId: req.user._id },
          { $set: updateData },
          { upsert: true }
        );
      }
    }

    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/notifications/mark-read
// @desc    Mark alerts as read
// @access  Private
router.post('/mark-read', requireClerkUser, [
  body('alertIds')
    .isArray()
    .withMessage('Alert IDs must be an array'),
  body('alertIds.*')
    .isString()
    .withMessage('Each alert ID must be a string')
], async (req, res) => {
  try {
    const { alertIds } = req.body;

    // For now, just acknowledge the request
    // In the future, implement proper alert tracking
    console.log('Marked alerts as read:', {
      userId: req.user._id,
      alertIds,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Alerts marked as read',
      readCount: alertIds.length
    });

  } catch (error) {
    console.error('Mark alerts as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alerts as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
