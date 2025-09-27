import api from './index';

export const transactionAPI = {
  list: async () => {
    const response = await api.get('/transactions/transactions/');
    return response.data;
  },

  retrieve: async (id) => {
    const response = await api.get(`/transactions/transactions/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/transactions/transactions/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/transactions/transactions/${id}/`, data);
    return response.data;
  },

  partialUpdate: async (id, data) => {
    const response = await api.patch(`/transactions/transactions/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/transactions/${id}/`);
    return response.data;
  },
};