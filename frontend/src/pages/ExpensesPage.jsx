import { useState } from 'react';
import FilterPanel from '../components/FilterPanel';
import { useApp } from '../context/AppContext';

const ExpensesPage = () => {
  const { filterExpenses, getUniqueCategories, getLast30DaysExpenses } = useApp();
  const [filters, setFilters] = useState({});
  
  // Get all expenses and apply filters
  const allExpenses = getLast30DaysExpenses();
  const filteredExpenses = filterExpenses(filters);
  const categories = getUniqueCategories();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Utilities': '⚡',
      'Other': '📝'
    };
    return icons[category] || '📝';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-red-100 text-red-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Expenses</h1>
        <p className="text-gray-600">Your expense history for the last 30 days</p>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {Object.values(filters).some(v => v !== '') ? 'Filtered Expenses' : 'Total Expenses (30 days)'}
            </h2>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(filteredExpenses.reduce((total, expense) => total + expense.amount, 0))}
            </p>
            {Object.values(filters).some(v => v !== '') && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredExpenses.length} of {allExpenses.length} expenses
              </p>
            )}
          </div>
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-3xl">💸</span>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        showCategoryFilter={true}
        showSourceFilter={false}
        showDateFilter={true}
        showAmountFilter={true}
        title="Filter Expenses"
      />

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Expense Details</h2>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {Object.values(filters).some(v => v !== '') ? 'No expenses match your filters' : 'No expenses found'}
            </h3>
            <p className="text-gray-500">
              {Object.values(filters).some(v => v !== '') 
                ? 'Try adjusting your filter criteria to see more results.' 
                : 'You haven\'t recorded any expenses in the last 30 days.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant/UPI
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        <span className="mr-1">{getCategoryIcon(expense.category)}</span>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.merchant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 text-right">
                      -{formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
