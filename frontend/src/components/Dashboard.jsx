import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AddExpenseForm from './AddExpenseForm';
import AddIncomeForm from './AddIncomeForm';
import ExpenseChart from './charts/ExpenseChart';
import IncomeChart from './charts/IncomeChart';
import MLConfirmationModal from './MLConfirmationModal';

const Dashboard = () => {
  const {
    getTotalExpenses,
    getTotalIncome,
    getRecentExpenses,
    getRecentIncome,
    getExpensesByCategory,
    processSMSMessage,
    createTransactionFromML,
    clearMLResult,
    mlProcessing,
    mlResult,
    error
  } = useApp();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [bankMessage, setBankMessage] = useState('');
  const [showMLModal, setShowMLModal] = useState(false);

  const totalExpenses = getTotalExpenses();
  const totalIncome = getTotalIncome();
  const recentExpenses = getRecentExpenses();
  const recentIncome = getRecentIncome();
  const expensesByCategory = getExpensesByCategory();

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

  const handleProcessMessage = async () => {
    if (!bankMessage.trim()) return;
    
    try {
      const result = await processSMSMessage(bankMessage);
      if (result) {
        setShowMLModal(true);
        setBankMessage(''); // Clear the input after successful processing
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // Error is already handled in the context
    }
  };

  const handleMLConfirm = async (formData) => {
    try {
      await createTransactionFromML(mlResult, formData);
      setShowMLModal(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  const handleMLCancel = () => {
    clearMLResult();
    setShowMLModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Net Balance</p>
              <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Message Processing Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Smart Message Processing</h2>
            <p className="text-sm text-gray-600">Paste your bank SMS messages here for automatic expense tracking</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="bankMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Bank Message
            </label>
            <textarea
              id="bankMessage"
              value={bankMessage}
              onChange={(e) => setBankMessage(e.target.value)}
              placeholder="Paste your bank SMS message here...&#10;&#10;Example:&#10;Rs.500.00 debited from A/c **1234 on 15-Dec-23 at 2:30 PM. UPI/123456789012/PAYTM/UPI. Avl Bal Rs.15,000.00"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
              disabled={mlProcessing}
            />
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {bankMessage.length > 0 && `${bankMessage.length} characters`}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setBankMessage('')}
                disabled={mlProcessing || !bankMessage.trim()}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleProcessMessage}
                disabled={mlProcessing || !bankMessage.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {mlProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Process Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  + Add
                </button>
                <Link
                  to="/expenses"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Show More →
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm">💸</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{expense.category}</p>
                      <p className="text-sm text-gray-500">{expense.merchant}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Income */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Recent Income</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddIncome(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  + Add
                </button>
                <Link
                  to="/income"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Show More →
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentIncome.map((income) => (
                <div key={income.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm">💰</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{income.source}</p>
                      <p className="text-sm text-gray-500">Income</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{formatCurrency(income.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(income.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Expenses by Category</h2>
          </div>
          <div className="p-6">
            <ExpenseChart data={expensesByCategory} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Income Trends</h2>
          </div>
          <div className="p-6">
            <IncomeChart data={recentIncome} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseForm onClose={() => setShowAddExpense(false)} />
      )}
      {showAddIncome && (
        <AddIncomeForm onClose={() => setShowAddIncome(false)} />
      )}
      
      {/* ML Confirmation Modal */}
      <MLConfirmationModal
        isOpen={showMLModal}
        onClose={() => setShowMLModal(false)}
        mlResult={mlResult}
        onConfirm={handleMLConfirm}
        onCancel={handleMLCancel}
      />
    </div>
  );
};

export default Dashboard;
