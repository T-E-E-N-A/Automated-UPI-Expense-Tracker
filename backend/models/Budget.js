import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Monthly limit is required'],
    min: [0, 'Monthly limit must be positive'],
    max: [999999999, 'Monthly limit cannot exceed 999,999,999']
  },
  currentMonthSpent: {
    type: Number,
    default: 0,
    min: [0, 'Current month spent cannot be negative']
  },
  currentMonth: {
    type: String,
    default: () => new Date().toISOString().slice(0, 7) // YYYY-MM format
  },
  alertsTriggered: {
    type: Number,
    default: 0,
    min: [0, 'Alerts triggered cannot be negative']
  },
  alertThresholds: {
    warning: {
      type: Number,
      default: 80, // 80% of budget
      min: [0, 'Warning threshold must be between 0-100'],
      max: [100, 'Warning threshold must be between 0-100']
    },
    critical: {
      type: Number,
      default: 95, // 95% of budget
      min: [0, 'Critical threshold must be between 0-100'],
      max: [100, 'Critical threshold must be between 0-100']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastAlertSent: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
budgetSchema.index({ userId: 1 });
budgetSchema.index({ currentMonth: 1 });

// Virtual for budget utilization percentage
budgetSchema.virtual('utilizationPercentage').get(function() {
  if (this.monthlyLimit === 0) return 0;
  return Math.round((this.currentMonthSpent / this.monthlyLimit) * 100);
});

// Virtual for remaining budget
budgetSchema.virtual('remainingBudget').get(function() {
  return Math.max(0, this.monthlyLimit - this.currentMonthSpent);
});

// Virtual for formatted monthly limit
budgetSchema.virtual('formattedMonthlyLimit').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.monthlyLimit);
});

// Virtual for formatted current month spent
budgetSchema.virtual('formattedCurrentMonthSpent').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.currentMonthSpent);
});

// Instance method to check if budget is exceeded
budgetSchema.methods.isExceeded = function() {
  return this.currentMonthSpent > this.monthlyLimit;
};

// Instance method to check if warning threshold is reached
budgetSchema.methods.isWarningThresholdReached = function() {
  const threshold = (this.monthlyLimit * this.alertThresholds.warning) / 100;
  return this.currentMonthSpent >= threshold;
};

// Instance method to check if critical threshold is reached
budgetSchema.methods.isCriticalThresholdReached = function() {
  const threshold = (this.monthlyLimit * this.alertThresholds.critical) / 100;
  return this.currentMonthSpent >= threshold;
};

// Static method to update current month spent
budgetSchema.statics.updateCurrentMonthSpent = async function(userId, amount) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return await this.findOneAndUpdate(
    { userId },
    {
      $inc: { currentMonthSpent: amount },
      $set: { currentMonth, updatedAt: new Date() }
    },
    { upsert: true, new: true }
  );
};

// Static method to reset monthly budget
budgetSchema.statics.resetMonthlyBudget = async function(userId) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return await this.findOneAndUpdate(
    { userId },
    {
      $set: {
        currentMonthSpent: 0,
        currentMonth,
        alertsTriggered: 0,
        lastAlertSent: null,
        updatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
