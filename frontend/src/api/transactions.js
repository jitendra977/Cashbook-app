// src/api/transactions.js
import api from './index';

const transactionsAPI = {
  // Transaction Types
  getTransactionTypes: async () => {
    const response = await api.get('/transactions/types/');
    return response.data;
  },

  createTransactionType: async (data) => {
    const response = await api.post('/transactions/types/', data);
    return response.data;
  },

  updateTransactionType: async (id, data) => {
    const response = await api.put(`/transactions/types/${id}/`, data);
    return response.data;
  },

  deleteTransactionType: async (id) => {
    const response = await api.delete(`/transactions/types/${id}/`);
    return response.data;
  },

  // Transaction Categories
  getTransactionCategories: async () => {
    const response = await api.get('/transactions/categories/');
    return response.data;
  },

  createTransactionCategory: async (data) => {
    const response = await api.post('/transactions/categories/', data);
    return response.data;
  },

  updateTransactionCategory: async (id, data) => {
    const response = await api.put(`/transactions/categories/${id}/`, data);
    return response.data;
  },

  deleteTransactionCategory: async (id) => {
    const response = await api.delete(`/transactions/categories/${id}/`);
    return response.data;
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  },
// NEW: Get transactions by store with fallback
  getTransactionsByStore: async (storeId, params = {}) => {
    try {
      const response = await api.get('/transactions/by-store/', {
        params: { store: storeId, ...params }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback to regular transactions endpoint with store filter
        console.warn('by-store endpoint not found, falling back to regular endpoint');
        const response = await api.get('/transactions/', {
          params: { cashbook__store: storeId, ...params }
        });
        return response.data;
      }
      throw error;
    }
  },

  // NEW: Get transactions by cashbook with fallback
  getTransactionsByCashbook: async (cashbookId, params = {}) => {
    try {
      const response = await api.get('/transactions/by-cashbook/', {
        params: { cashbook: cashbookId, ...params }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback to regular transactions endpoint with cashbook filter
        console.warn('by-cashbook endpoint not found, falling back to regular endpoint');
        const response = await api.get('/transactions/', {
          params: { cashbook: cashbookId, ...params }
        });
        return response.data;
      }
      throw error;
    }
  },

  // NEW: Get transactions by store and cashbook with fallback
  getTransactionsByStoreAndCashbook: async (storeId, cashbookId, params = {}) => {
    try {
      const response = await api.get('/transactions/by-store-and-cashbook/', {
        params: { store: storeId, cashbook: cashbookId, ...params }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback to regular transactions endpoint with both filters
        console.warn('by-store-and-cashbook endpoint not found, falling back to regular endpoint');
        const queryParams = { ...params };
        if (storeId) queryParams.cashbook__store = storeId;
        if (cashbookId) queryParams.cashbook = cashbookId;
        
        const response = await api.get('/transactions/', { params: queryParams });
        return response.data;
      }
      throw error;
    }
  },

  createTransaction: async (data) => {
    const response = await api.post('/transactions/', data);
    return response.data;
  },

  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}/`, data);
    return response.data;
  },

  partialUpdateTransaction: async (id, data) => {
    const response = await api.patch(`/transactions/${id}/`, data);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}/`);
    return response.data;
  },

  // Transaction Summary
  getTransactionSummary: async (params = {}) => {
    const response = await api.get('/transactions/summary/', { params });
    return response.data;
  },
// Export Methods - all use the same endpoint with format parameter
  exportTransactions: async (params = {}) => {
    const response = await api.get('/transactions/export/', { params });
    return response.data;
  },

  exportTransactionsAsExcel: async (params = {}) => {
    const response = await api.get('/transactions/export/', {
      params: { ...params, format: 'excel' },
      responseType: 'blob'
    });
    return response;
  },

  exportTransactionsAsPDF: async (params = {}) => {
    const response = await api.get('/transactions/export/', {
      params: { ...params, format: 'pdf' },
      responseType: 'blob'
    });
    return response;
  },

  exportTransactionsAsJSON: async (params = {}) => {
    const response = await api.get('/transactions/export/', {
      params: { ...params, format: 'json' }
    });
    return response.data;
  },



};

export default transactionsAPI;