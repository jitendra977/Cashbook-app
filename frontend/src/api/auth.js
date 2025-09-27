// src/api/auth.js
import api from './index.js';

export const authAPI = {
  login: async (credentials) => {
    // ✅ Corrected endpoint
    const response = await api.post('/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    // ✅ Send as FormData if needed
    const isFormData = userData instanceof FormData;

    const config = {};
    if (isFormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }

    // ✅ Corrected registration endpoint
    const response = await api.post('/users/register/', userData, config);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};