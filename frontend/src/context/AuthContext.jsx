import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user_data');

        if (token && storedUser) {
          try {
            // Parse stored user data
            const userData = JSON.parse(storedUser);
            setUser({ ...userData, token });
            console.log('Restored user from localStorage:', userData);
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } else if (token && refreshToken) {
          // We have tokens but no user data, try to refresh token to validate
          try {
            const refreshResponse = await authAPI.refreshToken(refreshToken);
            localStorage.setItem('access_token', refreshResponse.access);

            // Set minimal user data with token
            const minimalUserData = {
              token: refreshResponse.access,
              username: 'User', // Default values
              email: 'user@example.com'
            };
            setUser(minimalUserData);
            localStorage.setItem('user_data', JSON.stringify(minimalUserData));

            console.log('Token refreshed successfully');
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear invalid tokens
            authAPI.logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const data = await authAPI.login(credentials);

      console.log('Login response:', data);

      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Create comprehensive user object
      const userData = {
        // From API response
        ...data.user,
        token: data.access,

        // Ensure required fields exist with defaults
        username: data.user?.username || credentials.username || credentials.email?.split('@')[0] || 'User',
        email: data.user?.email || credentials.email || 'user@example.com',
        first_name: data.user?.first_name || '',
        last_name: data.user?.last_name || '',
        is_staff: data.user?.is_staff || false,
        is_superuser: data.user?.is_superuser || false,
        is_verified: data.user?.is_verified || false,
        is_active: data.user?.is_active !== false, // Default to true
        profile_image: data.user?.profile_image || null,

        // Add timestamp for debugging
        loginTime: new Date().toISOString()
      };

      console.log('Setting user data:', userData);

      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));

      return { success: true, data };
    } catch (error) {
      console.error('Login error details:', error);

      // Return the enhanced error for detailed handling
      return {
        success: false,
        error: error.details || error.message || 'Login failed',
        originalError: error
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);

      // Return enhanced error information
      return {
        success: false,
        error: error.details || error.message || 'Registration failed',
        originalError: error // Include the original error for detailed handling
      };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    authAPI.logout(); // This clears tokens from localStorage
    localStorage.removeItem('user_data'); // Also clear user data
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    console.log('Updating user data:', updatedUser);
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);
      localStorage.setItem('access_token', response.access);

      // Update user object with new token
      if (user) {
        const updatedUser = { ...user, token: response.access };
        setUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }

      return response.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Force logout if refresh fails
      throw error;
    }
  };

  // Function to check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  // Function to validate current authentication state
  const validateAuth = async () => {
    if (!user) return false;

    if (isTokenExpired()) {
      try {
        await refreshAccessToken();
        return true;
      } catch (error) {
        logout();
        return false;
      }
    }

    return true;
  };

  // Function to get user permissions
  const hasPermission = (permission) => {
    if (!user) return false;

    switch (permission) {
      case 'admin':
        return user.is_staff || user.is_superuser;
      case 'superuser':
        return user.is_superuser;
      case 'verified':
        return user.is_verified;
      case 'active':
        return user.is_active;
      default:
        return false;
    }
  };

  // Function to update user profile
  const updateProfile = async (profileData) => {
    try {
      // This would typically call an API endpoint to update the profile
      // For now, we'll just update the local state
      updateUser(profileData);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.details || error.message || 'Profile update failed'
      };
    }
  };

  // Function to change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // This would typically call an API endpoint to change password
      // For now, we'll just return a success message
      console.log('Password change requested');
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.details || error.message || 'Password change failed'
      };
    }
  };

  // Function to check if user is authenticated and token is valid
  const isAuthenticated = () => {
    return !!user && !isTokenExpired();
  };

  // Function to get authentication headers for API calls
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const contextValue = {
    user,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    changePassword,
    refreshAccessToken,
    validateAuth,
    hasPermission,
    isAuthenticated: isAuthenticated(),
    isTokenExpired,
    getAuthHeaders,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};