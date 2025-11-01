import React, { createContext, useContext, useReducer, useCallback } from 'react';
import transactionAPI from '../api/transactions';

const TransactionContext = createContext();

// Action types
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_TRANSACTION: 'SET_TRANSACTION',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_FILTERS: 'SET_FILTERS',
  SET_SUMMARY: 'SET_SUMMARY',
  SET_STATS: 'SET_STATS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_TYPES: 'SET_TYPES',
  SET_CATEGORIES: 'SET_CATEGORIES'
};

// Initial state
const initialState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  filters: {
    cashbook: '',
    type: '',
    category: '',
    start_date: '',
    end_date: '',
    status: '',
    search: ''
  },
  summary: {
    total_income: 0,
    total_expense: 0,
    net_flow: 0,
    transaction_count: 0,
    average_transaction: 0
  },
  stats: {
    "total_count": 0,
    "completed_count": 0,
    "pending_count": 0,
    "cancelled_count": 0,
    "income_count": 0,
    "expense_count": 0,
    "transfer_count": 0,
    "total_amount": 0.0,
    "avg_amount": 0.0,
    "max_amount": 0.0,
    "min_amount": 0.0,
    "income_total": 0.0,
    "expense_total": 0.0,
    "transfer_total": 0.0,
    "net_flow": 0.0,
    "completion_rate": 0.0
},
  transactionTypes: [],
  transactionCategories: [],
  pagination: {
    count: 0,
    next: null,
    previous: null
  }
};

// Reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTION_TYPES.SET_TRANSACTIONS:
      return { 
        ...state, 
        transactions: action.payload.results || action.payload,
        pagination: {
          count: action.payload.count || action.payload.length,
          next: action.payload.next || null,
          previous: action.payload.previous || null
        },
        loading: false 
      };

    case ACTION_TYPES.SET_TRANSACTION:
      return { ...state, currentTransaction: action.payload, loading: false };

    case ACTION_TYPES.ADD_TRANSACTION:
      return { 
        ...state, 
        transactions: [action.payload, ...state.transactions],
        loading: false 
      };

    case ACTION_TYPES.UPDATE_TRANSACTION:
      return { 
        ...state, 
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
        currentTransaction: action.payload,
        loading: false 
      };

    case ACTION_TYPES.DELETE_TRANSACTION:
      return { 
        ...state, 
        transactions: state.transactions.filter(t => t.id !== action.payload),
        loading: false 
      };

    case ACTION_TYPES.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case ACTION_TYPES.SET_SUMMARY:
      return { ...state, summary: { ...state.summary, ...action.payload }, loading: false };

    case ACTION_TYPES.SET_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload }, loading: false };

    case ACTION_TYPES.SET_TYPES:
      return { ...state, transactionTypes: action.payload, loading: false };

    case ACTION_TYPES.SET_CATEGORIES:
      return { ...state, transactionCategories: action.payload, loading: false };

    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// Provider component
export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Action creators
  const setLoading = (loading) => 
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });

  const setError = (error) => {
    const errorMessage = typeof error === 'string' 
      ? error 
      : error?.message || error?.detail || 'An error occurred';
    dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
  };

  const clearError = () => 
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

  const setFilters = (filters) => 
    dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: filters });

  // API actions
  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const params = { ...state.filters, ...filters };
      const data = await transactionAPI.getAll(params);
      
      dispatch({ type: ACTION_TYPES.SET_TRANSACTIONS, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [state.filters]);

  const fetchTransaction = useCallback(async (id) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.getById(id);
      dispatch({ type: ACTION_TYPES.SET_TRANSACTION, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const createTransaction = useCallback(async (transactionData) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.create(transactionData);
      dispatch({ type: ACTION_TYPES.ADD_TRANSACTION, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (id, transactionData) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.update(id, transactionData);
      dispatch({ type: ACTION_TYPES.UPDATE_TRANSACTION, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      setLoading(true);
      clearError();
      
      await transactionAPI.delete(id);
      dispatch({ type: ACTION_TYPES.DELETE_TRANSACTION, payload: id });
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const duplicateTransaction = useCallback(async (id) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.duplicate(id);
      dispatch({ type: ACTION_TYPES.ADD_TRANSACTION, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const bulkCreateTransactions = useCallback(async (transactions) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.bulkCreate(transactions);
      // Refresh transactions list
      await fetchTransactions();
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [fetchTransactions]);

  const fetchSummary = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.getSummary(params);
      dispatch({ type: ACTION_TYPES.SET_SUMMARY, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const fetchMonthlySummary = useCallback(async (params = {}) => {
    try {
      clearError();
      
      const data = await transactionAPI.getMonthlySummary(params);
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const fetchCategoryBreakdown = useCallback(async (params = {}) => {
    try {
      clearError();
      
      const data = await transactionAPI.getCategoryBreakdown(params);
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const fetchStats = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.getStats(params);
      dispatch({ type: ACTION_TYPES.SET_STATS, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const fetchTransactionTypes = useCallback(async () => {
    try {
      clearError();
      
      const data = await transactionAPI.getTransactionTypes();
      dispatch({ type: ACTION_TYPES.SET_TYPES, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const fetchTransactionCategories = useCallback(async () => {
    try {
      clearError();
      
      const data = await transactionAPI.getTransactionCategories();
      dispatch({ type: ACTION_TYPES.SET_CATEGORIES, payload: data });
      return data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  const exportTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const data = await transactionAPI.exportTransactions(params);
      
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  // Value to be provided by context
  const value = {
    // State
    ...state,
    
    // Actions
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    bulkCreateTransactions,
    fetchSummary,
    fetchMonthlySummary,
    fetchCategoryBreakdown,
    fetchStats,
    fetchTransactionTypes,
    fetchTransactionCategories,
    exportTransactions,
    setFilters,
    setLoading,
    clearError
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use transaction context
export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export default TransactionContext;