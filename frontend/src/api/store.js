import api from './index';

export const storeAPI = {
  list: async () => {
    const response = await api.get('/stores/');
    return response.data;
  },

  retrieve: async (id) => {
    const response = await api.get(`/stores/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/stores/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/stores/${id}/`, data);
    return response.data;
  },

  partialUpdate: async (id, data) => {
    const response = await api.patch(`/stores/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/stores/${id}/`);
    return response.data;
  },
};