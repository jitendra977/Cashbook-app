
// src/api/auth.js
import api from './index.js';

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/login/', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/users/register/', userData);
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
  }