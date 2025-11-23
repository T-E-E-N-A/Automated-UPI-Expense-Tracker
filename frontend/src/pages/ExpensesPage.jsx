import { useState, useEffect, useRef } from 'react';
import FilterPanel from '../components/FilterPanel';
import { useApp } from '../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import api from '../services/api';
import AddExpenseForm from '../components/AddExpenseForm';

const ExpensesPage = () => {
  const { filterExpenses, getUniqueCategories, getLast30DaysExpenses, deleteExpense, loadExpenses } = useApp();
  const { user } = useUser();
  const [filters, setFilters] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const notificationRef = useRef(null);

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm(`Are you sure you want to delete this expense of ${formatCurrency(expense.amount)}?`)) {
      return;
    }

    try {
      const expenseId = expense.id || expense._id;
      setDeletingExpenseId(expenseId);
      await deleteExpense(expenseId);
      loadExpenses();
    } catch (error) {
      alert('Failed to delete expense: ' + error.message);
    } finally {
      setDeletingExpenseId(null);
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.getNotifications(user);
        setAlerts(res.alerts || []);
      } catch (e) {
        // ignore errors
      }
    };
    if (user) fetchAlerts();
  }, [user]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);
  
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Expenses</h1>
            <p className="text-gray-600">Your expense history for the last 30 days</p>
          </div>
          {/* Notification Bell - Only show on laptop screens (when Header is hidden) */}
          <div ref={notificationRef} className="hidden lg:block relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">
                  {alerts.length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100 font-medium text-gray-700">Notifications</div>
                <div className="max-h-80 overflow-auto">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm">No notifications</div>
                  ) : (
                    alerts.map((a, i) => (
                      <div key={i} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                        <div className="text-sm font-medium text-gray-800">{a.title || a.type}</div>
                        <div className="text-sm text-gray-600">{a.message}</div>
                        {a.action && <div className="text-xs text-gray-400 mt-1">{a.action}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
        reportType="both"
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id || expense._id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit expense"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          disabled={deletingExpenseId === (expense.id || expense._id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Delete expense"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <AddExpenseForm
          expense={editingExpense}
          onClose={() => {
            setEditingExpense(null);
            loadExpenses();
          }}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
