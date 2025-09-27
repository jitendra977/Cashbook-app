import api from './index';

export const transactionCategoryAPI = {
  list: async () => {
    const response = await api.get('/transactions/transaction-categories/');
    return response.data;
  },

  retrieve: async (id) => {
    const response = await api.get(`/transactions/transaction-categories/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/transactions/transaction-categories/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/transactions/transaction-categories/${id}/`, data);
    return response.data;
  },

  partialUpdate: async (id, data) => {
    const response = await api.patch(`/transactions/transaction-categories/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/transaction-categories/${id}/`);
    return response.data;
  },
};