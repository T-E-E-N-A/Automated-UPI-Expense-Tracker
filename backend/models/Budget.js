import mongoose from 'mongoose';

const getCurrentMonth = (input) => {
  const date = input instanceof Date ? input : new Date();
  return date.toISOString().slice(0, 7);
};

const categoryBudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  limit: {
    type: Number,
    required: [true, 'Category limit is required'],
    min: [0, 'Category limit must be positive'],
    max: [999999999, 'Category limit cannot exceed 999,999,999']
  },
  currentMonthSpent: {
    type: Number,
    default: 0,
    min: [0, 'Current month spent cannot be negative']
  },
  alertsTriggered: {
    type: Number,
    default: 0,
    min: [0, 'Alerts triggered cannot be negative']
  },
  alertThresholds: {
    warning: {
      type: Number,
      default: 80,
      min: [0, 'Warning threshold must be between 0-100'],
      max: [100, 'Warning threshold must be between 0-100']
    },
    critical: {
      type: Number,
      default: 95,
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
  }
}, { _id: false });

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
    default: getCurrentMonth // YYYY-MM format
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
  },
  categoryBudgets: {
    type: [categoryBudgetSchema],
    default: []
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

budgetSchema.methods.getCategoryBudget = function(category) {
  if (!category || !this.categoryBudgets?.length) return null;
  return this.categoryBudgets.find(entry => entry.category === category) || null;
};

const resetCategoryState = (budgetDoc) => {
  if (!budgetDoc.categoryBudgets || !budgetDoc.categoryBudgets.length) return;
  budgetDoc.categoryBudgets = budgetDoc.categoryBudgets.map(entry => ({
    ...(typeof entry.toObject === 'function' ? entry.toObject() : entry),
    currentMonthSpent: 0,
    alertsTriggered: 0,
    lastAlertSent: null
  }));
};

const ensureCurrentMonthState = (budgetDoc, currentMonth) => {
  if (budgetDoc.currentMonth === currentMonth) return false;
  budgetDoc.currentMonth = currentMonth;
  budgetDoc.currentMonthSpent = 0;
  budgetDoc.alertsTriggered = 0;
  budgetDoc.lastAlertSent = null;
  resetCategoryState(budgetDoc);
  return true;
};

budgetSchema.methods.syncToMonth = async function(referenceDate = new Date()) {
  const targetMonth = getCurrentMonth(referenceDate);
  const changed = ensureCurrentMonthState(this, targetMonth);
  if (changed) {
    this.updatedAt = new Date();
    await this.save();
  }
  return changed;
};

// Static method to update current month spent
budgetSchema.statics.updateCurrentMonthSpent = async function(userId, amount) {
  const currentMonth = getCurrentMonth();
  let budget = await this.findOne({ userId });

  if (!budget) {
    budget = new this({
      userId,
      monthlyLimit: 0,
      currentMonthSpent: 0,
      currentMonth
    });
  }

  ensureCurrentMonthState(budget, currentMonth);

  const previousSpent = budget.currentMonthSpent;
  budget.currentMonthSpent = Math.max(0, previousSpent + amount);
  budget.updatedAt = new Date();

  await budget.save();

  return { budget, previousSpent };
};

budgetSchema.statics.updateCategoryBudget = async function(userId, category, amount) {
  if (!category) return null;
  const budget = await this.findOne({ userId });
  if (!budget) return null;

  ensureCurrentMonthState(budget, getCurrentMonth());

  const entry = budget.getCategoryBudget(category);
  if (!entry) return null;

  const previousSpent = entry.currentMonthSpent;
  entry.currentMonthSpent = Math.max(0, previousSpent + amount);
  budget.updatedAt = new Date();

  await budget.save();

  return { budget, categoryBudget: entry, previousSpent };
};

// Static method to reset monthly budget
budgetSchema.statics.resetMonthlyBudget = async function(userId) {
  const currentMonth = getCurrentMonth();
  let budget = await this.findOne({ userId });

  if (!budget) {
    budget = new this({
      userId,
      monthlyLimit: 0,
      currentMonthSpent: 0
    });
  }

  ensureCurrentMonthState(budget, currentMonth);
  budget.updatedAt = new Date();
  await budget.save();

  return budget;
};

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
