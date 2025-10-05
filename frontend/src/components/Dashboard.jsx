import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ExpenseChart from './charts/ExpenseChart';
import IncomeChart from './charts/IncomeChart';
import AddExpenseForm from './AddExpenseForm';
import AddIncomeForm from './AddIncomeForm';

const Dashboard = () => {
  const {
    getTotalExpenses,
    getTotalIncome,
    getRecentExpenses,
    getRecentIncome,
    getExpensesByCategory
  } = useApp();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);

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
    </div>
  );
};

export default Dashboard;
