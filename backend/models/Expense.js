import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
    ],
    index: true
  },
  merchant: {
    type: String,
    required: [true, 'Merchant/UPI ID is required'],
    trim: true,
    maxlength: [100, 'Merchant name cannot exceed 100 characters']
  },
  upiId: {
    type: String,
    trim: true,
    maxlength: [50, 'UPI ID cannot exceed 50 characters']
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
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'Cash', 'Bank Transfer', 'Other'],
    default: 'UPI'
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
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ merchant: 'text', notes: 'text' });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Virtual for formatted date
expenseSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});

// Instance method to check if expense is recent
expenseSchema.methods.isRecent = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.date >= cutoffDate;
};

// Static method to get total expenses for a user
expenseSchema.statics.getTotalExpenses = async function(userId, startDate, endDate) {
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

// Static method to get expenses by category
expenseSchema.statics.getExpensesByCategory = async function(userId, startDate, endDate) {
  const matchQuery = { userId };
  if (startDate && endDate) {
    matchQuery.date = { $gte: startDate, $lte: endDate };
  }
  
  return await this.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
