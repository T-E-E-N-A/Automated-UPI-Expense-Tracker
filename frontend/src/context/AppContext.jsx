import { useUser } from '@clerk/clerk-react';
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import apiService from '../services/api';
import { formatForTransaction, parseSMS, validateParsedSMS } from '../utils/smsParser';

const initialState = {
  expenses: [],
  income: [],
  sidebarOpen: false,
  loading: false,
  error: null,
  mlProcessing: false,
  mlResult: null,
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
    case 'SET_ML_PROCESSING':
      return { ...state, mlProcessing: action.payload };
    case 'SET_ML_RESULT':
      return { ...state, mlResult: action.payload };
    case 'CLEAR_ML_RESULT':
      return { ...state, mlResult: null };
    default:
      return state;
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useUser();

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  // API calls
  const loadExpenses = useCallback(async () => {
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
  }, [user]);

  const loadIncome = useCallback(async () => {
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
  }, [user]);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadExpenses();
      loadIncome();
    }
  }, [user, loadExpenses, loadIncome]);

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
      const updatedExpense = await apiService.updateExpense(id, expenseData, user);
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
      return updatedExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      const updatedIncome = await apiService.updateIncome(id, incomeData, user);
      dispatch({ type: 'UPDATE_INCOME', payload: updatedIncome });
      return updatedIncome;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await apiService.deleteExpense(id, user);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteIncome = async (id) => {
    try {
      await apiService.deleteIncome(id, user);
      dispatch({ type: 'DELETE_INCOME', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // ML Processing functions
  const processSMSMessage = async (smsText) => {
    try {
      dispatch({ type: 'SET_ML_PROCESSING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Parse SMS to extract basic information
      const parsedData = parseSMS(smsText);
      const validation = validateParsedSMS(parsedData);

      if (!validation.isValid) {
        throw new Error(`SMS parsing failed: ${validation.errors.join(', ')}`);
      }

      // Format for transaction creation
      const transactionData = formatForTransaction(parsedData);
      if (!transactionData) {
        throw new Error('Could not format transaction data');
      }

      // Get ML categorization for both expenses and income
      let mlCategorization = null;
      try {
        if (transactionData.type === 'expense') {
          mlCategorization = await apiService.categorizeExpense(
            smsText, 
            transactionData.merchant, 
            user
          );
        } else if (transactionData.type === 'income') {
          // For income, we can use a similar categorization approach
          mlCategorization = await apiService.categorizeIncome(
            smsText, 
            transactionData.source, 
            user
          );
        }
      } catch (mlError) {
        console.warn('ML categorization failed, using default:', mlError);
        // ML categorization failed, but we can still proceed with default category
      }

      // Combine parsed data with ML categorization
      const result = {
        ...transactionData,
        parsedData,
        mlCategorization,
        originalSMS: smsText,
        confidence: parsedData.confidence
      };

      dispatch({ type: 'SET_ML_RESULT', payload: result });
      return result;

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_ML_PROCESSING', payload: false });
    }
  };

  const createTransactionFromML = async (mlResult, userConfirmation = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const transactionData = {
        amount: mlResult.amount,
        date: mlResult.date,
        description: mlResult.description,
        ...userConfirmation // User can override any field
      };

      let newTransaction;
      if (mlResult.type === 'expense') {
        newTransaction = await addExpense({
          ...transactionData,
          category: userConfirmation.category || 
                   (mlResult.mlCategorization?.category) || 
                   'Other',
          merchant: userConfirmation.merchant || mlResult.merchant || 'Unknown'
        });
      } else {
        newTransaction = await addIncome({
          ...transactionData,
          source: userConfirmation.sourceType || 
                 (mlResult.mlCategorization?.category) || 
                 'Other',
          notes: userConfirmation.source || mlResult.merchant || 'Unknown'
        });
      }

      // Clear ML result after successful creation
      dispatch({ type: 'CLEAR_ML_RESULT' });
      return newTransaction;

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearMLResult = () => {
    dispatch({ type: 'CLEAR_ML_RESULT' });
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

  // Filtering helper functions
  const filterExpenses = (filters = {}) => {
    let filteredExpenses = [...state.expenses];

    // Filter by category
    if (filters.category) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.category === filters.category
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filteredExpenses = filteredExpenses.filter(expense => 
        new Date(expense.date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filteredExpenses = filteredExpenses.filter(expense => 
        new Date(expense.date) <= new Date(filters.endDate)
      );
    }

    // Filter by amount range
    if (filters.minAmount) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.amount >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.amount <= parseFloat(filters.maxAmount)
      );
    }

    // Sort by date (newest first)
    return filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filterIncome = (filters = {}) => {
    let filteredIncome = [...state.income];

    // Filter by source
    if (filters.source) {
      filteredIncome = filteredIncome.filter(income => 
        income.source === filters.source
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filteredIncome = filteredIncome.filter(income => 
        new Date(income.date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filteredIncome = filteredIncome.filter(income => 
        new Date(income.date) <= new Date(filters.endDate)
      );
    }

    // Filter by amount range
    if (filters.minAmount) {
      filteredIncome = filteredIncome.filter(income => 
        income.amount >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filteredIncome = filteredIncome.filter(income => 
        income.amount <= parseFloat(filters.maxAmount)
      );
    }

    // Sort by date (newest first)
    return filteredIncome.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(state.expenses.map(expense => expense.category))];
    return categories.sort();
  };

  const getUniqueSources = () => {
    const sources = [...new Set(state.income.map(income => income.source))];
    return sources.sort();
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
    filterExpenses,
    filterIncome,
    getUniqueCategories,
    getUniqueSources,
    processSMSMessage,
    createTransactionFromML,
    clearMLResult,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
