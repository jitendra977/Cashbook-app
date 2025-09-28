// src/context/StoreContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { storesAPI, storeUsersAPI, cashbooksAPI } from '../api/stores';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState([]);
  const [myStores, setMyStores] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [storeUsers, setStoreUsers] = useState([]);
  const [cashbooks, setCashbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear error
  const clearError = useCallback(() => setError(''), []);

  // Store operations
  const fetchStores = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await storesAPI.getAllStores(params);
      setStores(data.results || data);
      return data.results || data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch stores';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStore = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const store = await storesAPI.getStore(id);
      setCurrentStore(store);
      return store;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch store';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStore = useCallback(async (storeData) => {
    setLoading(true);
    setError('');
    try {
      const newStore = await storesAPI.createStore(storeData);
      setStores(prev => [...prev, newStore]);
      return newStore;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create store';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStore = useCallback(async (id, storeData) => {
    setLoading(true);
    setError('');
    try {
      const updatedStore = await storesAPI.updateStore(id, storeData);
      setStores(prev => prev.map(store => 
        store.id === id ? updatedStore : store
      ));
      if (currentStore?.id === id) {
        setCurrentStore(updatedStore);
      }
      return updatedStore;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update store';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentStore]);

  const deleteStore = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      await storesAPI.deleteStore(id);
      setStores(prev => prev.filter(store => store.id !== id));
      if (currentStore?.id === id) {
        setCurrentStore(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete store';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentStore]);

  // My stores
  const fetchMyStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await storeUsersAPI.getMyStores();
      setMyStores(data.results || data);
      return data.results || data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch my stores';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Store user operations
  const fetchStoreUsers = useCallback(async (storeId) => {
    setLoading(true);
    setError('');
    try {
      const data = await storesAPI.getStoreUsers(storeId);
      setStoreUsers(data.results || data);
      return data.results || data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch store users';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStoreUser = useCallback(async (storeUserData) => {
    setLoading(true);
    setError('');
    try {
      const newStoreUser = await storeUsersAPI.createStoreUser(storeUserData);
      setStoreUsers(prev => [...prev, newStoreUser]);
      return newStoreUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create store user';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStoreUser = useCallback(async (id, storeUserData) => {
    setLoading(true);
    setError('');
    try {
      const updatedStoreUser = await storeUsersAPI.updateStoreUser(id, storeUserData);
      setStoreUsers(prev => prev.map(user => 
        user.id === id ? updatedStoreUser : user
      ));
      return updatedStoreUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update store user';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStoreUser = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      await storeUsersAPI.deleteStoreUser(id);
      setStoreUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete store user';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cashbook operations
  const fetchStoreCashbooks = useCallback(async (storeId) => {
    setLoading(true);
    setError('');
    try {
      const data = await storesAPI.getStoreCashbooks(storeId);
      setCashbooks(data.results || data);
      return data.results || data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch cashbooks';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCashbook = useCallback(async (cashbookData) => {
    setLoading(true);
    setError('');
    try {
      const newCashbook = await cashbooksAPI.createCashbook(cashbookData);
      setCashbooks(prev => [...prev, newCashbook]);
      return newCashbook;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create cashbook';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCashbook = useCallback(async (id, cashbookData) => {
    setLoading(true);
    setError('');
    try {
      const updatedCashbook = await cashbooksAPI.updateCashbook(id, cashbookData);
      setCashbooks(prev => prev.map(cashbook => 
        cashbook.id === id ? updatedCashbook : cashbook
      ));
      return updatedCashbook;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update cashbook';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCashbook = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      await cashbooksAPI.deleteCashbook(id);
      setCashbooks(prev => prev.filter(cashbook => cashbook.id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete cashbook';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    stores,
    myStores,
    currentStore,
    storeUsers,
    cashbooks,
    loading,
    error,
    
    // Store actions
    fetchStores,
    fetchStore,
    createStore,
    updateStore,
    deleteStore,
    setCurrentStore,
    
    // My stores
    fetchMyStores,
    
    // Store user actions
    fetchStoreUsers,
    createStoreUser,
    updateStoreUser,
    deleteStoreUser,
    
    // Cashbook actions
    fetchStoreCashbooks,
    createCashbook,
    updateCashbook,
    deleteCashbook,
    
    // Utility
    clearError
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};