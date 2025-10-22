// src/contexts/TransactionsContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import transactionsAPI from '../api/transactions';

const TransactionsContext = createContext();

export const useTransactionsContext = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactionsContext must be used within TransactionsProvider');
  }
  return context;
};

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [transactionCategories, setTransactionCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });

  // Check if Chrome storage is available
  const isChromeStorageAvailable = useCallback(() => {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }, []);

  // Chrome Storage Management
  const STORAGE_KEYS = {
    TRANSACTIONS: 'transactions',
    TRANSACTION_TYPES: 'transactionTypes',
    TRANSACTION_CATEGORIES: 'transactionCategories',
    SUMMARY: 'transactionSummary',
    BALANCES: 'transactionBalances'
  };

  // Storage quota management
  const cleanupOldTransactions = useCallback(async () => {
    if (!isChromeStorageAvailable()) return null;
    
    try {
      const { transactions: storedTransactions } = await chrome.storage.local.get(STORAGE_KEYS.TRANSACTIONS);
      if (storedTransactions && storedTransactions.length > 500) {
        const recentTransactions = storedTransactions.slice(-300);
        await chrome.storage.local.set({ [STORAGE_KEYS.TRANSACTIONS]: recentTransactions });
        setTransactions(recentTransactions);
        return recentTransactions;
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
    return null;
  }, [isChromeStorageAvailable]);

  const saveToStorage = useCallback(async (key, data) => {
    if (!isChromeStorageAvailable()) return;
    
    try {
      await chrome.storage.local.set({ [key]: data });
    } catch (error) {
      if (error.message.includes('quota')) {
        console.warn('Storage quota exceeded, cleaning up old data...');
        await cleanupOldTransactions();
        await chrome.storage.local.set({ [key]: data });
      } else {
        console.warn('Storage save failed:', error);
      }
    }
  }, [isChromeStorageAvailable, cleanupOldTransactions]);

  const loadFromStorage = useCallback(async (key, defaultValue = []) => {
    if (!isChromeStorageAvailable()) return defaultValue;
    
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from storage:`, error);
      return defaultValue;
    }
  }, [isChromeStorageAvailable]);

  // Initialize data from Chrome storage on mount
  useEffect(() => {
    const initializeFromStorage = async () => {
      try {
        setLoading(true);
        
        const [
          storedTransactions,
          storedTypes,
          storedCategories,
          storedSummary,
          storedBalances
        ] = await Promise.all([
          loadFromStorage(STORAGE_KEYS.TRANSACTIONS),
          loadFromStorage(STORAGE_KEYS.TRANSACTION_TYPES),
          loadFromStorage(STORAGE_KEYS.TRANSACTION_CATEGORIES),
          loadFromStorage(STORAGE_KEYS.SUMMARY, null),
          loadFromStorage(STORAGE_KEYS.BALANCES)
        ]);

        setTransactions(Array.isArray(storedTransactions) ? storedTransactions : []);
        setTransactionTypes(Array.isArray(storedTypes) ? storedTypes : []);
        setTransactionCategories(Array.isArray(storedCategories) ? storedCategories : []);
        setSummary(storedSummary);
        setBalances(Array.isArray(storedBalances) ? storedBalances : []);

        // Fetch fresh data in background
        Promise.allSettled([
          fetchTransactionTypes(),
          fetchTransactionCategories(),
          fetchLatestBalances()
        ]);
      } catch (error) {
        console.error('Failed to initialize from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeFromStorage();
  }, [loadFromStorage]);

  // Helper to extract pagination info
  const extractPagination = useCallback((data) => {
    return {
      count: data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
      currentPage: data.current_page || 1
    };
  }, []);

  // ==================== Transaction Types ====================

  const fetchTransactionTypes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionTypes(params);
      const typesArray = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setTransactionTypes(typesArray);
      await saveToStorage(STORAGE_KEYS.TRANSACTION_TYPES, typesArray);
      return typesArray;
    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? 'Transaction types endpoint not found' 
        : err.message || 'Failed to fetch transaction types';
      setError(errorMsg);
      const storedTypes = await loadFromStorage(STORAGE_KEYS.TRANSACTION_TYPES);
      return Array.isArray(storedTypes) ? storedTypes : [];
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, loadFromStorage]);

  const fetchActiveTransactionTypes = useCallback(async () => {
    try {
      const data = await transactionsAPI.getActiveTransactionTypes();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch active types:', err);
      return transactionTypes.filter(t => t.is_active);
    }
  }, [transactionTypes]);

  const fetchTransactionTypesByNature = useCallback(async (nature) => {
    try {
      const data = await transactionsAPI.getTransactionTypesByNature(nature);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch types by nature:', err);
      return transactionTypes.filter(t => t.nature === nature && t.is_active);
    }
  }, [transactionTypes]);

  const createTransactionType = useCallback(async (typeData) => {
    setLoading(true);
    setError(null);
    try {
      const newType = await transactionsAPI.createTransactionType(typeData);
      setTransactionTypes(prev => {
        const updated = Array.isArray(prev) ? [...prev, newType] : [newType];
        saveToStorage(STORAGE_KEYS.TRANSACTION_TYPES, updated);
        return updated;
      });
      return newType;
    } catch (err) {
      setError(err.message || 'Failed to create transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const updateTransactionType = useCallback(async (id, typeData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.updateTransactionType(id, typeData);
      setTransactionTypes(prev => {
        const updatedTypes = Array.isArray(prev) 
          ? prev.map(type => type.id === id ? updated : type)
          : [updated];
        saveToStorage(STORAGE_KEYS.TRANSACTION_TYPES, updatedTypes);
        return updatedTypes;
      });
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const deleteTransactionType = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransactionType(id);
      setTransactionTypes(prev => {
        const updatedTypes = Array.isArray(prev) 
          ? prev.filter(type => type.id !== id)
          : [];
        saveToStorage(STORAGE_KEYS.TRANSACTION_TYPES, updatedTypes);
        return updatedTypes;
      });
    } catch (err) {
      setError(err.message || 'Failed to delete transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  // ==================== Transaction Categories ====================

  const fetchTransactionCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionCategories(params);
      const categoriesArray = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setTransactionCategories(categoriesArray);
      await saveToStorage(STORAGE_KEYS.TRANSACTION_CATEGORIES, categoriesArray);
      return categoriesArray;
    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? 'Transaction categories endpoint not found' 
        : err.message || 'Failed to fetch transaction categories';
      setError(errorMsg);
      const storedCategories = await loadFromStorage(STORAGE_KEYS.TRANSACTION_CATEGORIES);
      return Array.isArray(storedCategories) ? storedCategories : [];
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, loadFromStorage]);

  const fetchActiveTransactionCategories = useCallback(async () => {
    try {
      const data = await transactionsAPI.getActiveTransactionCategories();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch active categories:', err);
      return transactionCategories.filter(c => c.is_active);
    }
  }, [transactionCategories]);

  const createTransactionCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await transactionsAPI.createTransactionCategory(categoryData);
      setTransactionCategories(prev => {
        const updated = Array.isArray(prev) ? [...prev, newCategory] : [newCategory];
        saveToStorage(STORAGE_KEYS.TRANSACTION_CATEGORIES, updated);
        return updated;
      });
      return newCategory;
    } catch (err) {
      setError(err.message || 'Failed to create transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const updateTransactionCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.updateTransactionCategory(id, categoryData);
      setTransactionCategories(prev => {
        const updatedCategories = Array.isArray(prev)
          ? prev.map(cat => cat.id === id ? updated : cat)
          : [updated];
        saveToStorage(STORAGE_KEYS.TRANSACTION_CATEGORIES, updatedCategories);
        return updatedCategories;
      });
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const deleteTransactionCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransactionCategory(id);
      setTransactionCategories(prev => {
        const updatedCategories = Array.isArray(prev)
          ? prev.filter(cat => cat.id !== id)
          : [];
        saveToStorage(STORAGE_KEYS.TRANSACTION_CATEGORIES, updatedCategories);
        return updatedCategories;
      });
    } catch (err) {
      setError(err.message || 'Failed to delete transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  // ==================== Transactions ====================

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactions(params);
      const transactionsData = Array.isArray(data.results) ? data.results : 
                             Array.isArray(data) ? data : [];
      setTransactions(transactionsData);
      setPagination(extractPagination(data));
      await saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactionsData);
      return transactionsData;
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
      const storedTransactions = await loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
      return Array.isArray(storedTransactions) ? storedTransactions : [];
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, loadFromStorage, extractPagination]);

  const fetchTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransaction(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Format transaction data for API
  const formatTransactionData = useCallback((data) => {
    return {
      cashbook: parseInt(data.cashbook),
      type: parseInt(data.type),
      category: data.category ? parseInt(data.category) : null,
      amount: data.amount.toString(),
      transaction_date: data.transaction_date,
      value_date: data.value_date || null,
      description: data.description || null,
      reference_number: data.reference_number || null,
      status: data.status || 'completed',
      is_recurring: Boolean(data.is_recurring),
      recurring_pattern: data.recurring_pattern || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  }, []);

  const createTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const formattedData = formatTransactionData(transactionData);
      const newTransaction = await transactionsAPI.createTransaction(formattedData);
      setTransactions(prev => {
        const updated = Array.isArray(prev) ? [newTransaction, ...prev] : [newTransaction];
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
        return updated;
      });
      return newTransaction;
    } catch (err) {
      const errorMessage = err.response?.data 
        ? (typeof err.response.data === 'string' 
            ? err.response.data 
            : JSON.stringify(err.response.data))
        : err.message || 'Failed to create transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, formatTransactionData]);

  const updateTransaction = useCallback(async (id, transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const formattedData = formatTransactionData(transactionData);
      const updated = await transactionsAPI.updateTransaction(id, formattedData);
      setTransactions(prev => {
        const updatedTransactions = Array.isArray(prev)
          ? prev.map(trans => trans.id === id ? updated : trans)
          : [updated];
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
        return updatedTransactions;
      });
      return updated;
    } catch (err) {
      const errorMessage = err.response?.data 
        ? (typeof err.response.data === 'string' 
            ? err.response.data 
            : JSON.stringify(err.response.data))
        : err.message || 'Failed to update transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, formatTransactionData]);

  const partialUpdateTransaction = useCallback(async (id, transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.partialUpdateTransaction(id, transactionData);
      setTransactions(prev => {
        const updatedTransactions = Array.isArray(prev)
          ? prev.map(trans => trans.id === id ? updated : trans)
          : [updated];
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
        return updatedTransactions;
      });
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const deleteTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransaction(id);
      setTransactions(prev => {
        const updatedTransactions = Array.isArray(prev)
          ? prev.filter(trans => trans.id !== id)
          : [];
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
        return updatedTransactions;
      });
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const fetchTransactionsByStore = useCallback(async (storeId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionsByStore(storeId, params);
      const transactionsData = Array.isArray(data.results) ? data.results : 
                             Array.isArray(data) ? data : [];
      setTransactions(transactionsData);
      setPagination(extractPagination(data));
      await saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactionsData);
      return transactionsData;
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions by store');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, extractPagination]);

  const fetchTransactionsByCashbook = useCallback(async (cashbookId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionsByCashbook(cashbookId, params);
      const transactionsData = Array.isArray(data.results) ? data.results : 
                             Array.isArray(data) ? data : [];
      setTransactions(transactionsData);
      setPagination(extractPagination(data));
      await saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactionsData);
      return transactionsData;
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions by cashbook');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, extractPagination]);

  const fetchTransactionsByDateRange = useCallback(async (startDate, endDate, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionsByDateRange(startDate, endDate, params);
      const transactionsData = Array.isArray(data.results) ? data.results : 
                             Array.isArray(data) ? data : [];
      setTransactions(transactionsData);
      setPagination(extractPagination(data));
      await saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactionsData);
      return transactionsData;
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions by date range');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage, extractPagination]);

  const fetchRecentTransactions = useCallback(async (days = 7, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getRecentTransactions(days, params);
      const transactionsData = Array.isArray(data.results) ? data.results : 
                             Array.isArray(data) ? data : [];
      setTransactions(transactionsData);
      setPagination(extractPagination(data));
      return transactionsData;
    } catch (err) {
      setError(err.message || 'Failed to fetch recent transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractPagination]);

  const fetchPendingTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getPendingTransactions(params);
      const transactionsData = Array.isArray(data.results) ? data.results : 
                             Array.isArray(data) ? data : [];
      setTransactions(transactionsData);
      setPagination(extractPagination(data));
      return transactionsData;
    } catch (err) {
      setError(err.message || 'Failed to fetch pending transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractPagination]);

  const bulkCreateTransactions = useCallback(async (transactionsList) => {
    setLoading(true);
    setError(null);
    try {
      const created = await transactionsAPI.bulkCreateTransactions(transactionsList);
      setTransactions(prev => {
        const updated = Array.isArray(prev) ? [...created, ...prev] : created;
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
        return updated;
      });
      return created;
    } catch (err) {
      setError(err.message || 'Failed to create transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  // ==================== Transaction Summary & Analytics ====================

  const fetchTransactionSummary = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionSummary(params);
      setSummary(data);
      await saveToStorage(STORAGE_KEYS.SUMMARY, data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch transaction summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const fetchTransactionsByCategory = useCallback(async (params = {}) => {
    try {
      const data = await transactionsAPI.getTransactionsByCategory(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch transactions by category:', err);
      throw err;
    }
  }, []);

  const fetchTransactionsByType = useCallback(async (params = {}) => {
    try {
      const data = await transactionsAPI.getTransactionsByType(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch transactions by type:', err);
      throw err;
    }
  }, []);

  const exportTransactions = useCallback(async (params = {}) => {
  setLoading(true);
  setError(null);
  try {
    const data = await transactionsAPI.exportTransactions(params);
    return data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message || 'Failed to export transactions';
    setError(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

const exportTransactionsAsExcel = useCallback(async (params = {}) => {
  setLoading(true);
  setError(null);
  try {
    const response = await transactionsAPI.exportTransactionsAsExcel(params);
    return response;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message || 'Failed to export as Excel';
    setError(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

const exportTransactionsAsPDF = useCallback(async (params = {}) => {
  setLoading(true);
  setError(null);
  try {
    const response = await transactionsAPI.exportTransactionsAsPDF(params);
    return response;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message || 'Failed to export as PDF';
    setError(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

const exportTransactionsAsJSON = useCallback(async (params = {}) => {
  setLoading(true);
  setError(null);
  try {
    const data = await transactionsAPI.exportTransactionsAsJSON(params);
    return data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message || 'Failed to export as JSON';
    setError(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  // ==================== Cashbook Balances ====================

  const fetchCashbookBalances = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getCashbookBalances(params);
      const balancesData = Array.isArray(data.results) ? data.results : 
                          Array.isArray(data) ? data : [];
      setBalances(balancesData);
      await saveToStorage(STORAGE_KEYS.BALANCES, balancesData);
      return balancesData;
    } catch (err) {
      setError(err.message || 'Failed to fetch cashbook balances');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const fetchBalancesByCashbook = useCallback(async (cashbookId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getBalancesByCashbook(cashbookId, params);
      const balancesData = Array.isArray(data.results) ? data.results : 
                          Array.isArray(data) ? data : [];
      setBalances(balancesData);
      await saveToStorage(STORAGE_KEYS.BALANCES, balancesData);
      return balancesData;
    } catch (err) {
      setError(err.message || 'Failed to fetch balances by cashbook');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  const fetchLatestBalances = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getLatestBalances(params);
      const balancesData = Array.isArray(data) ? data : [];
      setBalances(balancesData);
      await saveToStorage(STORAGE_KEYS.BALANCES, balancesData);
      return balancesData;
    } catch (err) {
      setError(err.message || 'Failed to fetch latest balances');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  // ==================== Storage Management ====================

  const clearLocalData = useCallback(async () => {
    try {
      if (isChromeStorageAvailable()) {
        await chrome.storage.local.remove(Object.values(STORAGE_KEYS));
      }
      setTransactions([]);
      setTransactionTypes([]);
      setTransactionCategories([]);
      setSummary(null);
      setBalances([]);
      setError(null);
    } catch (error) {
      console.error('Failed to clear local data:', error);
    }
  }, [isChromeStorageAvailable]);

  const value = {
    // State
    transactions,
    transactionTypes,
    transactionCategories,
    summary,
    balances,
    loading,
    error,
    pagination,

    // Transaction Types Methods
    fetchTransactionTypes,
    fetchActiveTransactionTypes,
    fetchTransactionTypesByNature,
    createTransactionType,
    updateTransactionType,
    deleteTransactionType,

    // Transaction Categories Methods
    fetchTransactionCategories,
    fetchActiveTransactionCategories,
    createTransactionCategory,
    updateTransactionCategory,
    deleteTransactionCategory,
    // Export
    exportTransactions,
    exportTransactionsAsExcel,
    exportTransactionsAsPDF,
    exportTransactionsAsJSON,
        
    // Transactions Methods
    fetchTransactions,
    fetchTransaction,
    fetchTransactionsByStore,
    fetchTransactionsByCashbook,
    fetchTransactionsByDateRange,
    fetchRecentTransactions,
    fetchPendingTransactions,
    createTransaction,
    updateTransaction,
    partialUpdateTransaction,
    deleteTransaction,
    bulkCreateTransactions,

    // Analytics & Summary Methods
    fetchTransactionSummary,
    fetchTransactionsByCategory,
    fetchTransactionsByType,


    // Cashbook Balances Methods
    fetchCashbookBalances,
    fetchBalancesByCashbook,
    fetchLatestBalances,

    // Storage Management
    clearLocalData,
    cleanupOldTransactions,
// Export

    // Utility
    setError,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};