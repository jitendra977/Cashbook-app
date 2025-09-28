// src/api/auth.js
import api from './index.js';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('auth/login/', credentials, {
        timeout: 10000, // 10 second timeout
        timeoutErrorMessage: 'Connection timeout. Please try again.'
      });
      return response.data;
    } catch (error) {
      // Enhance error object with more details
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 }; // No response means connection failed
      }
      throw error;
    }
  },

  register: async (userData) => {
    const isFormData = userData instanceof FormData;

    const config = {
      timeout: 10000,
      timeoutErrorMessage: 'Connection timeout. Please try again.'
    };
    
    if (isFormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }

    try {
      const response = await api.post('auth/users/register/', userData, config);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('auth/token/refresh/', { refresh: refreshToken }, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};