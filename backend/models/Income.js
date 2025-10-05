import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: [
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
    ],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    max: [999999999, 'Amount cannot exceed 999,999,999']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, source: 1 });
incomeSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted amount
incomeSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Virtual for formatted date
incomeSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});

// Instance method to check if income is recent
incomeSchema.methods.isRecent = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.date >= cutoffDate;
};

// Static method to get total income for a user
incomeSchema.statics.getTotalIncome = async function(userId, startDate, endDate) {
  const matchQuery = { userId };
  if (startDate && endDate) {
    matchQuery.date = { $gte: startDate, $lte: endDate };
  }
  
  const result = await this.aggregate([
    { $match: matchQuery },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get income by source
incomeSchema.statics.getIncomeBySource = async function(userId, startDate, endDate) {
  const matchQuery = { userId };
  if (startDate && endDate) {
    matchQuery.date = { $gte: startDate, $lte: endDate };
  }
  
  return await this.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$source', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

const Income = mongoose.model('Income', incomeSchema);

export default Income;
