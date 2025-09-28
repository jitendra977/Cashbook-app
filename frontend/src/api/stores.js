// src/api/stores.js
import api from './index';

export const storesAPI = {
  // Store management
  getAllStores: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `stores/?${queryString}` : 'stores/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  },

  getStore: async (id) => {
    try {
      const response = await api.get(`stores/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store:', error);
      throw error;
    }
  },

  createStore: async (storeData) => {
    try {
      const response = await api.post('stores/', storeData);
      return response.data;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  },

  updateStore: async (id, storeData) => {
    try {
      const response = await api.patch(`stores/${id}/`, storeData);
      return response.data;
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  },

  deleteStore: async (id) => {
    try {
      const response = await api.delete(`stores/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  },

  // Store cashbooks
  getStoreCashbooks: async (storeId) => {
    try {
      const response = await api.get(`stores/${storeId}/cashbooks/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store cashbooks:', error);
      throw error;
    }
  },

  // Store users
  getStoreUsers: async (storeId) => {
    try {
      const response = await api.get(`stores/${storeId}/users/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store users:', error);
      throw error;
    }
  }
};

export const storeUsersAPI = {
  // Store user management
  getAllStoreUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `store-users/?${queryString}` : 'store-users/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching store users:', error);
      throw error;
    }
  },

  getStoreUser: async (id) => {
    try {
      const response = await api.get(`store-users/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching store user:', error);
      throw error;
    }
  },

  createStoreUser: async (storeUserData) => {
    try {
      const response = await api.post('store-users/', storeUserData);
      return response.data;
    } catch (error) {
      console.error('Error creating store user:', error);
      throw error;
    }
  },

  updateStoreUser: async (id, storeUserData) => {
    try {
      const response = await api.patch(`store-users/${id}/`, storeUserData);
      return response.data;
    } catch (error) {
      console.error('Error updating store user:', error);
      throw error;
    }
  },

  deleteStoreUser: async (id) => {
    try {
      const response = await api.delete(`store-users/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting store user:', error);
      throw error;
    }
  },

  // My stores
  getMyStores: async () => {
    try {
      const response = await api.get('store-users/my_stores/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my stores:', error);
      throw error;
    }
  }
};

export const cashbooksAPI = {
  // Cashbook management
  getAllCashbooks: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `cashbooks/?${queryString}` : 'cashbooks/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching cashbooks:', error);
      throw error;
    }
  },

  getCashbook: async (id) => {
    try {
      const response = await api.get(`cashbooks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cashbook:', error);
      throw error;
    }
  },

  createCashbook: async (cashbookData) => {
    try {
      const response = await api.post('cashbooks/', cashbookData);
      return response.data;
    } catch (error) {
      console.error('Error creating cashbook:', error);
      throw error;
    }
  },

  updateCashbook: async (id, cashbookData) => {
    try {
      const response = await api.patch(`cashbooks/${id}/`, cashbookData);
      return response.data;
    } catch (error) {
      console.error('Error updating cashbook:', error);
      throw error;
    }
  },

  deleteCashbook: async (id) => {
    try {
      const response = await api.delete(`cashbooks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting cashbook:', error);
      throw error;
    }
  },

  // Cashbook transactions
  getCashbookTransactions: async (cashbookId) => {
    try {
      const response = await api.get(`cashbooks/${cashbookId}/transactions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cashbook transactions:', error);
      throw error;
    }
  }
};