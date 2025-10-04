// src/hooks/useTransactions.js
import { useCallback } from 'react';
import { useTransactionsContext } from '../contexts/TransactionsContext';

/**
 * Main hook for transaction operations
 * Provides all transaction-related methods from context
 */
export const useTransactions = (storeId = null, cashbookId = null) => {
  const context = useTransactionsContext();

  // Auto-fetch transactions based on store/cashbook
  const fetchData = useCallback(async (params = {}) => {
    if (cashbookId) {
      return await context.fetchTransactionsByCashbook(cashbookId, params);
    } else if (storeId) {
      return await context.fetchTransactionsByStore(storeId, params);
    } else {
      return await context.fetchTransactions(params);
    }
  }, [context, storeId, cashbookId]);

  return {
    // State
    transactions: context.transactions,
    loading: context.loading,
    error: context.error,
    pagination: context.pagination,

    // Methods
    fetchTransactions: fetchData,
    fetchTransaction: context.fetchTransaction,
    createTransaction: context.createTransaction,
    updateTransaction: context.updateTransaction,
    partialUpdateTransaction: context.partialUpdateTransaction,
    deleteTransaction: context.deleteTransaction,
    bulkCreate: context.bulkCreateTransactions,
    exportTransactions: context.exportTransactions,

    // Filtered fetches
    fetchByStore: context.fetchTransactionsByStore,
    fetchByCashbook: context.fetchTransactionsByCashbook,
    fetchRecent: context.fetchRecentTransactions,
    fetchPending: context.fetchPendingTransactions,
  };
};

/**
 * Hook for transaction types
 */
export const useTransactionTypes = () => {
  const context = useTransactionsContext();

  return {
    types: context.transactionTypes,
    loading: context.loading,
    error: context.error,
    
    fetchTypes: context.fetchTransactionTypes,
    fetchActiveTypes: context.fetchActiveTransactionTypes,
    fetchTypesByNature: context.fetchTransactionTypesByNature,
    createType: context.createTransactionType,
    updateType: context.updateTransactionType,
    deleteType: context.deleteTransactionType,
  };
};

/**
 * Hook for transaction categories
 */
export const useTransactionCategories = () => {
  const context = useTransactionsContext();

  return {
    categories: context.transactionCategories,
    loading: context.loading,
    error: context.error,
    
    fetchCategories: context.fetchTransactionCategories,
    fetchActiveCategories: context.fetchActiveTransactionCategories,
    createCategory: context.createTransactionCategory,
    updateCategory: context.updateTransactionCategory,
    deleteCategory: context.deleteTransactionCategory,
  };
};

/**
 * Hook for transaction summary and analytics
 */
export const useTransactionSummary = (storeId = null, cashbookId = null) => {
  const context = useTransactionsContext();

  const fetchSummary = useCallback(async (dateRange = {}) => {
    const params = { ...dateRange };
    if (storeId) params.store = storeId;
    if (cashbookId) params.cashbook = cashbookId;
    
    return await context.fetchTransactionSummary(params);
  }, [context, storeId, cashbookId]);

  const fetchByCategory = useCallback(async (dateRange = {}) => {
    const params = { ...dateRange };
    if (storeId) params.store = storeId;
    if (cashbookId) params.cashbook = cashbookId;
    
    return await context.fetchTransactionsByCategory(params);
  }, [context, storeId, cashbookId]);

  const fetchByType = useCallback(async (dateRange = {}) => {
    const params = { ...dateRange };
    if (storeId) params.store = storeId;
    if (cashbookId) params.cashbook = cashbookId;
    
    return await context.fetchTransactionsByType(params);
  }, [context, storeId, cashbookId]);

  return {
    summary: context.summary,
    loading: context.loading,
    error: context.error,
    
    fetchSummary,
    fetchByCategory,
    fetchByType,
  };
};

/**
 * Hook for cashbook balances
 */
export const useCashbookBalances = (cashbookId = null) => {
  const context = useTransactionsContext();

  const fetchBalances = useCallback(async (params = {}) => {
    if (cashbookId) {
      return await context.fetchBalancesByCashbook(cashbookId, params);
    } else {
      return await context.fetchCashbookBalances(params);
    }
  }, [context, cashbookId]);

  return {
    balances: context.balances,
    loading: context.loading,
    error: context.error,
    
    fetchBalances,
    fetchLatestBalances: context.fetchLatestBalances,
  };
};

/**
 * Hook for recent transactions with auto-refresh
 */
export const useRecentTransactions = (days = 7, autoRefresh = false, refreshInterval = 60000) => {
  const context = useTransactionsContext();

  const fetchRecent = useCallback(async () => {
    return await context.fetchRecentTransactions(days);
  }, [context, days]);

  // Auto-refresh logic can be added here if needed
  // useEffect(() => {
  //   if (autoRefresh) {
  //     const interval = setInterval(fetchRecent, refreshInterval);
  //     return () => clearInterval(interval);
  //   }
  // }, [autoRefresh, refreshInterval, fetchRecent]);

  return {
    transactions: context.transactions,
    loading: context.loading,
    error: context.error,
    fetchRecent,
  };
};

/**
 * Hook for pending transactions
 */
export const usePendingTransactions = () => {
  const context = useTransactionsContext();

  return {
    transactions: context.transactions,
    loading: context.loading,
    error: context.error,
    fetchPending: context.fetchPendingTransactions,
  };
};

/**
 * Hook for transaction form operations
 * Provides validation and formatting helpers
 */
export const useTransactionForm = () => {
  const context = useTransactionsContext();

  const validateTransaction = useCallback((data) => {
    const errors = {};

    if (!data.cashbook) errors.cashbook = 'Cashbook is required';
    if (!data.type) errors.type = 'Transaction type is required';
    if (!data.amount || parseFloat(data.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (!data.transaction_date) errors.transaction_date = 'Transaction date is required';
    
    if (data.value_date && data.transaction_date) {
      if (new Date(data.value_date) < new Date(data.transaction_date)) {
        errors.value_date = 'Value date cannot be before transaction date';
      }
    }

    if (data.is_recurring && !data.recurring_pattern) {
      errors.recurring_pattern = 'Recurring pattern is required for recurring transactions';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const createTransaction = useCallback(async (data) => {
    const validation = validateTransaction(data);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }
    return await context.createTransaction(data);
  }, [context, validateTransaction]);

  const updateTransaction = useCallback(async (id, data) => {
    const validation = validateTransaction(data);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }
    return await context.updateTransaction(id, data);
  }, [context, validateTransaction]);

  return {
    validateTransaction,
    createTransaction,
    updateTransaction,
    loading: context.loading,
    error: context.error,
  };
};

/**
 * Hook for bulk operations
 */
export const useBulkTransactions = () => {
  const context = useTransactionsContext();

  const bulkCreate = useCallback(async (transactionsList) => {
    return await context.bulkCreateTransactions(transactionsList);
  }, [context]);

  const bulkDelete = useCallback(async (transactionIds) => {
    const promises = transactionIds.map(id => context.deleteTransaction(id));
    return await Promise.all(promises);
  }, [context]);

  return {
    bulkCreate,
    bulkDelete,
    loading: context.loading,
    error: context.error,
  };
};

/**
 * Hook for exporting transactions
 */
export const useTransactionExport = () => {
  const context = useTransactionsContext();

  const exportToCSV = useCallback(async (params = {}) => {
    const data = await context.exportTransactions(params);
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No data to export');
    }

    // Convert to CSV
    const headers = Object.keys(data.data[0]).join(',');
    const rows = data.data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    
    // Create download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return csv;
  }, [context]);

  const exportToJSON = useCallback(async (params = {}) => {
    const data = await context.exportTransactions(params);
    
    const json = JSON.stringify(data.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return json;
  }, [context]);

  return {
    exportToCSV,
    exportToJSON,
    loading: context.loading,
    error: context.error,
  };
};