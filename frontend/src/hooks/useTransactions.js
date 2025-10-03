// src/hooks/useTransactions.js
import { useState, useEffect, useCallback } from 'react';
import transactionsAPI from '../api/transactions';

// Hook for fetching transactions with filters
export const useTransactions = (initialParams = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchTransactions = useCallback(async (newParams) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = newParams || params;
      const data = await transactionsAPI.getTransactions(queryParams);
      setTransactions(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refresh = useCallback(() => {
    return fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [params]);

  return {
    transactions,
    loading,
    error,
    params,
    updateParams,
    refresh,
    setTransactions,
  };
};

// Hook for a single transaction
export const useTransaction = (id) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransaction = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransaction(id);
      setTransaction(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return {
    transaction,
    loading,
    error,
    refresh: fetchTransaction,
  };
};

// Hook for transaction types
export const useTransactionTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionTypes();
      setTypes(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction types');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createType = useCallback(async (typeData) => {
    setLoading(true);
    setError(null);
    try {
      const newType = await transactionsAPI.createTransactionType(typeData);
      setTypes(prev => [...prev, newType]);
      return newType;
    } catch (err) {
      setError(err.details || 'Failed to create transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateType = useCallback(async (id, typeData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.updateTransactionType(id, typeData);
      setTypes(prev => prev.map(type => type.id === id ? updated : type));
      return updated;
    } catch (err) {
      setError(err.details || 'Failed to update transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteType = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransactionType(id);
      setTypes(prev => prev.filter(type => type.id !== id));
    } catch (err) {
      setError(err.details || 'Failed to delete transaction type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    types,
    loading,
    error,
    refresh: fetchTypes,
    createType,
    updateType,
    deleteType,
  };
};

// Hook for transaction categories
export const useTransactionCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getTransactionCategories();
      setCategories(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await transactionsAPI.createTransactionCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err.details || 'Failed to create transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await transactionsAPI.updateTransactionCategory(id, categoryData);
      setCategories(prev => prev.map(cat => cat.id === id ? updated : cat));
      return updated;
    } catch (err) {
      setError(err.details || 'Failed to update transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transactionsAPI.deleteTransactionCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err.details || 'Failed to delete transaction category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

// Hook for transaction summary
export const useTransactionSummary = (initialParams = {}) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchSummary = useCallback(async (newParams) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = newParams || params;
      const data = await transactionsAPI.getTransactionSummary(queryParams);
      setSummary(data);
      return data;
    } catch (err) {
      setError(err.details || 'Failed to fetch transaction summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [params]);

  return {
    summary,
    loading,
    error,
    params,
    updateParams,
    refresh: fetchSummary,
  };
};

// Hook for creating/updating transactions with form handling
export const useTransactionForm = (initialData = null, onSuccess) => {
  const [formData, setFormData] = useState(initialData || {
    cashbook: '',
    type: '',
    category: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (initialData?.id) {
        result = await transactionsAPI.updateTransaction(initialData.id, formData);
      } else {
        result = await transactionsAPI.createTransaction(formData);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err.details || 'Failed to save transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData, initialData, onSuccess]);

  const reset = useCallback(() => {
    setFormData(initialData || {
      cashbook: '',
      type: '',
      category: '',
      amount: '',
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setError(null);
  }, [initialData]);

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    setFormData,
    reset,
  };
};