// src/api/users.js
import api from './index.js';

export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.patch('/users/profile/', userData);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  }
};