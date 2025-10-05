import { createContext, useContext, useReducer, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import apiService from '../services/api';

const initialState = {
  expenses: [],
  income: [],
  sidebarOpen: false,
  loading: false,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_INCOME':
      return { ...state, income: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'ADD_INCOME':
      return { ...state, income: [action.payload, ...state.income] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    case 'UPDATE_INCOME':
      return {
        ...state,
        income: state.income.map(income =>
          income.id === action.payload.id ? action.payload : income
        )
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    case 'DELETE_INCOME':
      return {
        ...state,
        income: state.income.filter(income => income.id !== action.payload)
      };
    default:
      return state;
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useUser();

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadExpenses();
      loadIncome();
    }
  }, [user]);

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  // API calls
  const loadExpenses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const expenses = await apiService.getExpenses({}, user);
      dispatch({ type: 'SET_EXPENSES', payload: expenses });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to load expenses:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadIncome = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const income = await apiService.getIncome({}, user);
      dispatch({ type: 'SET_INCOME', payload: income });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to load income:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addExpense = async (expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newExpense = await apiService.addExpense(expenseData, user);
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      return newExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addIncome = async (incomeData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newIncome = await apiService.addIncome(incomeData, user);
      dispatch({ type: 'ADD_INCOME', payload: newIncome });
      return newIncome;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const updatedExpense = await apiService.updateExpense(id, expenseData);
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
      return updatedExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      const updatedIncome = await apiService.updateIncome(id, incomeData);
      dispatch({ type: 'UPDATE_INCOME', payload: updatedIncome });
      return updatedIncome;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await apiService.deleteExpense(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteIncome = async (id) => {
    try {
      await apiService.deleteIncome(id);
      dispatch({ type: 'DELETE_INCOME', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Computed values
  const getTotalExpenses = () => {
    return state.expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalIncome = () => {
    return state.income.reduce((total, income) => total + income.amount, 0);
  };

  const getRecentExpenses = (limit = 5) => {
    return state.expenses.slice(0, limit);
  };

  const getRecentIncome = (limit = 5) => {
    return state.income.slice(0, limit);
  };

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    state.expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  const getLast30DaysExpenses = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return state.expenses.filter(expense => new Date(expense.date) >= thirtyDaysAgo);
  };

  const getLast30DaysIncome = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return state.income.filter(income => new Date(income.date) >= thirtyDaysAgo);
  };

  const value = {
    ...state,
    toggleSidebar,
    addExpense,
    addIncome,
    updateExpense,
    updateIncome,
    deleteExpense,
    deleteIncome,
    loadExpenses,
    loadIncome,
    getTotalExpenses,
    getTotalIncome,
    getRecentExpenses,
    getRecentIncome,
    getExpensesByCategory,
    getLast30DaysExpenses,
    getLast30DaysIncome,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
