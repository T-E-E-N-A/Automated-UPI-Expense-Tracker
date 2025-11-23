import { useState } from 'react';

const MLConfirmationModal = ({ isOpen, onClose, mlResult, onConfirm, onCancel }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !mlResult) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({});
    onCancel();
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const expenseCategories = [
    'Food & Dining',
    'Transportation', 
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Other'
  ];

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment',
    'Business',
    'Gift',
    'Refund',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {mlResult.type === 'expense' ? 'Expense Detected' : 'Income Detected'}
                </h2>
                <p className="text-sm text-gray-600">
                  Review and confirm the transaction details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Original SMS */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original SMS Message
            </label>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border">
              {mlResult.originalSMS}
            </div>
          </div>

          {/* Parsed Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Parsed Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="text-lg font-semibold text-gray-800">
                  {formatCurrency(mlResult.amount)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="text-sm text-gray-600">
                  {new Date(mlResult.date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="text-sm text-gray-600 capitalize">
                  {mlResult.type}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence
                </label>
                <div className="text-sm text-gray-600">
                  {Math.round(mlResult.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* ML Categorization (for both expenses and income) */}
          {mlResult.mlCategorization && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">AI Suggestion</h3>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800">
                    Suggested {mlResult.type === 'expense' ? 'Category' : 'Source Type'}
                  </span>
                  <span className="text-sm text-purple-600">
                    {Math.round(mlResult.mlCategorization.confidence * 100)}% confidence
                  </span>
                </div>
                <div className="text-lg font-semibold text-purple-900">
                  {mlResult.mlCategorization.category}
                </div>
                {mlResult.mlCategorization.alternatives && mlResult.mlCategorization.alternatives.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-purple-600">Other options: </span>
                    <span className="text-xs text-purple-600">
                      {mlResult.mlCategorization.alternatives.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form for user confirmation */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount || mlResult.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date || mlResult.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category/Source Type */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  {mlResult.type === 'expense' ? 'Category' : 'Source Type'}
                </label>
                <select
                  id="category"
                  value={formData.category || formData.sourceType || mlResult.mlCategorization?.category || 'Other'}
                  onChange={(e) => setFormData({...formData, 
                    [mlResult.type === 'expense' ? 'category' : 'sourceType']: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {(mlResult.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Merchant/Source */}
              <div>
                <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
                  {mlResult.type === 'expense' ? 'Merchant' : 'Source'}
                </label>
                <input
                  type="text"
                  id="merchant"
                  value={formData.merchant || formData.source || mlResult.merchant || ''}
                  onChange={(e) => setFormData({...formData, 
                    [mlResult.type === 'expense' ? 'merchant' : 'source']: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={mlResult.type === 'expense' ? 'Merchant name' : 'Income source'}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || mlResult.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="Transaction description"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Create {mlResult.type === 'expense' ? 'Expense' : 'Income'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MLConfirmationModal;

