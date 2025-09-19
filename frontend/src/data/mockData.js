// Mock transaction data - JavaScript version
export const mockTransactions = [
  // Recent expenses
  { id: '1', type: 'expense', amount: 45.50, category: 'Food', description: 'Lunch at cafe', date: '2024-01-15' },
  { id: '2', type: 'expense', amount: 120.00, category: 'Shopping', description: 'Clothes shopping', date: '2024-01-14' },
  { id: '3', type: 'expense', amount: 25.99, category: 'Transport', description: 'Uber ride', date: '2024-01-13' },
  { id: '4', type: 'expense', amount: 89.99, category: 'Bills', description: 'Internet bill', date: '2024-01-12' },
  { id: '5', type: 'expense', amount: 15.75, category: 'Food', description: 'Coffee', date: '2024-01-11' },
  
  // More expenses for detailed view
  { id: '6', type: 'expense', amount: 200.00, category: 'Bills', description: 'Electric bill', date: '2024-01-10' },
  { id: '7', type: 'expense', amount: 35.99, category: 'Food', description: 'Grocery shopping', date: '2024-01-09' },
  { id: '8', type: 'expense', amount: 12.50, category: 'Transport', description: 'Bus ticket', date: '2024-01-08' },
  { id: '9', type: 'expense', amount: 75.00, category: 'Entertainment', description: 'Movie tickets', date: '2024-01-07' },
  { id: '10', type: 'expense', amount: 55.25, category: 'Food', description: 'Dinner', date: '2024-01-06' },

  // Recent income
  { id: '11', type: 'income', amount: 3500.00, category: 'Salary', description: 'Monthly salary', date: '2024-01-01' },
  { id: '12', type: 'income', amount: 500.00, category: 'Freelance', description: 'Web design project', date: '2024-01-05' },
  { id: '13', type: 'income', amount: 150.00, category: 'Investment', description: 'Dividend payment', date: '2024-01-10' },
  { id: '14', type: 'income', amount: 75.00, category: 'Other', description: 'Cashback reward', date: '2024-01-12' },
  { id: '15', type: 'income', amount: 200.00, category: 'Freelance', description: 'Logo design', date: '2024-01-14' },
];

// Mock chart data for the last 6 months
export const mockChartData = [
  { month: 'Aug', expenses: 2100, income: 3500 },
  { month: 'Sep', expenses: 2350, income: 3200 },
  { month: 'Oct', expenses: 1950, income: 3800 },
  { month: 'Nov', expenses: 2200, income: 3600 },
  { month: 'Dec', expenses: 2800, income: 4000 },
  { month: 'Jan', expenses: 2150, income: 3750 },
];

// Helper functions
export const getTotalExpenses = () => {
  return mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getTotalIncome = () => {
  return mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getRecentExpenses = (limit = 5) => {
  return mockTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getRecentIncome = (limit = 5) => {
  return mockTransactions
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getExpensesByCategory = () => {
  const expenses = mockTransactions.filter(t => t.type === 'expense');
  const categories = {};
  
  expenses.forEach(expense => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });
  
  return Object.entries(categories).map(([category, amount]) => ({
    category,
    amount,
    percentage: Math.round((amount / getTotalExpenses()) * 100)
  }));
};