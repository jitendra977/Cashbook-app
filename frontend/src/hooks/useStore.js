// src/hooks/useStores.js
import { useState, useCallback } from 'react';
import { storesAPI } from '../api/stores';

export const useStores = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStores = useCallback((params) => 
    request(() => storesAPI.getAllStores(params)), [request]);

  const createStore = useCallback((data) => 
    request(() => storesAPI.createStore(data)), [request]);

  const updateStore = useCallback((id, data) => 
    request(() => storesAPI.updateStore(id, data)), [request]);

  const deleteStore = useCallback((id) => 
    request(() => storesAPI.deleteStore(id)), [request]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    fetchStores,
    createStore,
    updateStore,
    deleteStore
  };
};