// src/api/users.js
import api from './index.js';

export const usersAPI = {
  // Profile management
  getProfile: async () => {
    try {
      const response = await api.get('auth/users/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

// Email verification methods 
 verifyEmail: async (token) => {
    try {
      console.log('Sending verification token:', token);
      
      const response = await api.post('auth/users/verify_email/', { 
        token: token 
      });
      
      console.log('Verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verification error details:', {
        status: error.response?.status,
        data: error.response?.data,
        token: token
      });
      throw error;
    }
  },

  resendVerification: async () => {
    try {
      const response = await api.post('auth/users/resend_verification/');
      return response.data;
    } catch (error) {
      console.error('Error resending verification:', error);
      throw error;
    }
  },


  updateProfile: async (userData) => {
    try {
      const config = {};

      if (userData instanceof FormData) {
        // For FormData (file uploads), let browser set Content-Type with boundary
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      } else {
        // For JSON data, set Content-Type explicitly
        config.headers = {
          'Content-Type': 'application/json',
        };
        // Convert object to JSON string
        userData = JSON.stringify(userData);
      }

      const response = await api.put('auth/users/profile/', userData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  // Password management
  updatePassword: async (passwordData) => {
    try {
      // Transform field names to match backend expectations
      const backendData = {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      };

      const response = await api.post('auth/users/change_password/', backendData);
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },



  // Profile image management
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profile_image', imageFile);

      const response = await api.patch('auth/users/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('Upload progress:', percentCompleted);
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  deleteProfileImage: async () => {
    try {
      const response = await api.patch('auth/users/profile/', {
        profile_image: null
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting profile image:', error);
      throw error;
    }
  },

  // User management (for admin users)
  getAllUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `auth/users?${queryString}` : 'auth/users/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      const response = await api.get(`auth/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const config = {};

      if (userData instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      }

      const response = await api.post('auth/users/', userData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const config = {};

      if (userData instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      }

      const response = await api.patch(`auth/users/${id}/`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`auth/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Account settings
  updateAccountSettings: async (settings) => {
    try {
      const response = await api.patch('auth/users/settings/', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating account settings:', error);
      throw error;
    }
  },

  getAccountSettings: async () => {
    try {
      const response = await api.get('auth/users/settings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching account settings:', error);
      throw error;
    }
  },

  // Account deactivation
  deactivateAccount: async (password) => {
    try {
      const response = await api.post('auth/users/deactivate/', { password });
      return response.data;
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  },

  // Export user data (GDPR compliance)
  exportUserData: async () => {
    try {
      const response = await api.get('auth/users/export/', {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user-data.json');
      document.body.appendChild(link);
      link.click();
      link.remove();

      return response.data;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
};
export const debugVerification = {
  checkToken: async (token) => {
    try {
      console.log('Verification Token:', token);
      console.log('Token Type:', typeof token);
      console.log('API Base URL:', process.env.REACT_APP_API_URL);
      return true;
    } catch (error) {
      console.error('Debug error:', error);
      return false;
    }
  }
};