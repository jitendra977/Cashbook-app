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
};

export default transactionsAPI;