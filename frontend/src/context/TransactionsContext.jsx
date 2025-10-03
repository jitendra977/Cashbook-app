// src/contexts/TransactionsContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transaction Types
  const fetchTransactionTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionTypes();
      setTransactionTypes(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction types');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransactionType = useCallback(async (typeData) => {
    setLoading(true);
    setError(null);
    try {
      const newType = await transactionsAPI.createTransactionType(typeData);
      setTransactionTypes(prev => [...prev, newType]);
      return newType;
    } catch (err) {
      setError(err.details || 'Failed to create transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransactionType = useCallback(async (id, typeData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.updateTransactionType(id, typeData);
      setTransactionTypes(prev => 
        prev.map(type => type.id === id ? updated : type)
      );
      return updated;
    } catch (err) {
      setError(err.details || 'Failed to update transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransactionType = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransactionType(id);
      setTransactionTypes(prev => prev.filter(type => type.id !== id));
    } catch (err) {
      setError(err.details || 'Failed to delete transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Transaction Categories
  const fetchTransactionCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionCategories();
      setTransactionCategories(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransactionCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await transactionsAPI.createTransactionCategory(categoryData);
      setTransactionCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err.details || 'Failed to create transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransactionCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.updateTransactionCategory(id, categoryData);
      setTransactionCategories(prev => 
        prev.map(cat => cat.id === id ? updated : cat)
      );
      return updated;
    } catch (err) {
      setError(err.details || 'Failed to update transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransactionCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransactionCategory(id);
      setTransactionCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err.details || 'Failed to delete transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Transactions
  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactions(params);
      setTransactions(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransaction(id);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const newTransaction = await transactionsAPI.createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err.details || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id, transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.updateTransaction(id, transactionData);
      setTransactions(prev => 
        prev.map(trans => trans.id === id ? updated : trans)
      );
      return updated;
    } catch (err) {
      setError(err.details || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const partialUpdateTransaction = useCallback(async (id, transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.partialUpdateTransaction(id, transactionData);
      setTransactions(prev => 
        prev.map(trans => trans.id === id ? updated : trans)
      );
      return updated;
    } catch (err) {
      setError(err.details || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransaction(id);
      setTransactions(prev => prev.filter(trans => trans.id !== id));
    } catch (err) {
      setError(err.details || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactionSummary = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionSummary(params);
      setSummary(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    transactions,
    transactionTypes,
    transactionCategories,
    summary,
    loading,
    error,

    // Transaction Types Methods
    fetchTransactionTypes,
    createTransactionType,
    updateTransactionType,
    deleteTransactionType,

    // Transaction Categories Methods
    fetchTransactionCategories,
    createTransactionCategory,
    updateTransactionCategory,
    deleteTransactionCategory,

    // Transactions Methods
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    partialUpdateTransaction,
    deleteTransaction,
    fetchTransactionSummary,

    // Utility
    setError,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};