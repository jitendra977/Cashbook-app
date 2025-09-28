// src/api/index.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create a custom axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    // Enhanced request error handling
    const enhancedError = new Error('Request configuration failed');
    enhancedError.type = 'REQUEST_CONFIG_ERROR';
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

// Enhanced response interceptor with better error detection
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Create enhanced error object with detailed information
    const enhancedError = {
      ...error,
      type: 'UNKNOWN_ERROR',
      details: 'An unexpected error occurred',
      isConnectionError: false,
      isTimeout: false,
      isServerDown: false,
      isNetworkIssue: false
    };

    // No response received (connection issues)
    if (!error.response) {
      enhancedError.type = 'CONNECTION_ERROR';
      enhancedError.isConnectionError = true;
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        enhancedError.type = 'TIMEOUT_ERROR';
        enhancedError.details = 'Server took too long to respond';
        enhancedError.isTimeout = true;
      } else if (error.message === 'Network Error') {
        // Check different network scenarios
        if (navigator.onLine === false) {
          enhancedError.type = 'OFFLINE_ERROR';
          enhancedError.details = 'You are offline. Please check your internet connection';
          enhancedError.isNetworkIssue = true;
        } else {
          enhancedError.type = 'SERVER_UNREACHABLE';
          enhancedError.details = 'Cannot connect to server. Server may be down or URL is incorrect';
          enhancedError.isServerDown = true;
        }
      }
    } 
    // Response received with error status
    else {
      const status = error.response.status;
      
      if (status === 0) {
        enhancedError.type = 'CORS_ERROR';
        enhancedError.details = 'CORS policy blocked the request. Check server configuration';
      } else if (status >= 500) {
        enhancedError.type = 'SERVER_ERROR';
        enhancedError.details = `Server error (${status}). Please try again later`;
      } else if (status === 401) {
        enhancedError.type = 'UNAUTHORIZED';
        enhancedError.details = 'Invalid credentials';
      } else if (status === 404) {
        enhancedError.type = 'ENDPOINT_NOT_FOUND';
        enhancedError.details = 'Login endpoint not found. Check API URL';
      }
    }

    // Handle token refresh only for 401 errors with response
    if (error.response?.status === 401 && !error.config._retry) {
      enhancedError.config._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken
          }, { timeout: 10000 });
          
          localStorage.setItem('access_token', response.data.access);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return api(error.config);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(enhancedError);
  }
);

export default api;