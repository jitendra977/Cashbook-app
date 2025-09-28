import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/forms/UserForm';
import {
  Box,
  Paper,
  Typography,
  Container,
  Button,
  Alert,
  Stack
} from '@mui/material';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getErrorMessage = (error) => {
    // If it's already a string error message
    if (typeof error === 'string') {
      return error;
    }

    // If it's our enhanced error object
    if (error.type) {
      switch (error.type) {
        case 'OFFLINE_ERROR':
          return '📱 You are offline. Please check your internet connection and try again.';
        
        case 'TIMEOUT_ERROR':
          return '⏰ Connection timeout. The server is taking too long to respond. Please try again.';
        
        case 'SERVER_UNREACHABLE':
          return '🔌 Cannot connect to the server. Please check:\n• Server is running\n• Correct API URL\n• Network connectivity';
        
        case 'CORS_ERROR':
          return '🛡️ CORS error. Please contact administrator or check server configuration.';
        
        case 'ENDPOINT_NOT_FOUND':
          return '🔍 Registration endpoint not found. Please check if the API URL is correct.';
        
        case 'SERVER_ERROR':
          return '🚨 Server error. Please try again later or contact support.';
        
        case 'REQUEST_CONFIG_ERROR':
          return '⚙️ Request configuration error. Please try again.';
        
        default:
          return error.details || 'An unexpected error occurred. Please try again.';
      }
    }

    // Handle Axios original errors
    if (error.response) {
      if (error.response.status === 0) {
        return '🔌 Connection failed. Please check if the server is running.';
      } else if (error.response.status >= 500) {
        return `🚨 Server error (${error.response.status}). Please try again later.`;
      } else if (error.response.status === 404) {
        return '🔍 Registration endpoint not found. Please check API configuration.';
      }
    }

    // Generic network errors
    if (error.message === 'Network Error') {
      if (!navigator.onLine) {
        return '📱 You are offline. Please check your internet connection.';
      } else {
        return '🔌 Cannot connect to server. The server may be down or the URL is incorrect.';
      }
    }

    // Default fallback
    return 'Registration failed. Please try again.';
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setErrors({});

    try {
      // For registration, we need to send FormData directly if there's a file
      // or convert to JSON if no file upload
      let userData;
      let hasFile = false;
      
      // Check if there's a file in the FormData
      for (let [key, value] of formData.entries()) {
        if (key === 'profile_image' && value instanceof File) {
          hasFile = true;
          break;
        }
      }

      if (hasFile) {
        // Send FormData directly for file uploads
        userData = formData;
      } else {
        // Convert to regular object for JSON requests
        userData = {};
        for (let [key, value] of formData.entries()) {
          if (key !== 'profile_image' || (key === 'profile_image' && value instanceof File)) {
            userData[key] = value;
          }
        }
      }

      const result = await register(userData);
      
      if (result.success) {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login to continue.',
            type: 'success'
          }
        });
      } else {
        // Handle API errors (connection errors, validation errors, etc.)
        if (result.originalError?.response?.data) {
          // Backend validation errors
          const backendErrors = {};
          const errorData = result.originalError.response.data;
          
          // Map backend errors to form fields
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              backendErrors[key] = errorData[key][0];
            } else {
              backendErrors[key] = errorData[key];
            }
          });
          
          setErrors(backendErrors);
        } else {
          // Connection or other errors
          setErrors({ 
            general: getErrorMessage(result.originalError || result.error) 
          });
        }
      }
    } catch (err) {
      console.error('Registration failed:', err);
      
      // Handle different types of errors
      if (err.response && err.response.data) {
        // Backend validation errors
        const backendErrors = {};
        const errorData = err.response.data;
        
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            backendErrors[key] = errorData[key][0];
          } else {
            backendErrors[key] = errorData[key];
          }
        });
        
        setErrors(backendErrors);
      } else {
        // Connection errors
        setErrors({ 
          general: getErrorMessage(err) 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: '#333',
              marginBottom: 3,
            }}
          >
            Create Your Account
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#666',
              marginBottom: 4,
            }}
          >
            Fill in the information below to create your new account
          </Typography>

          {/* Display general errors */}
          {errors.general && (
            <Alert 
              severity="error"
              sx={{ 
                mb: 3,
                borderRadius: 1,
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {errors.general}
              </Typography>
            </Alert>
          )}

          {/* UserForm Component */}
          <UserForm
            open={true}
            onClose={handleClose}
            onSubmit={handleSubmit}
            user={null}
            loading={loading}
            errors={errors}
            embedded={true}
            isRegistration={true}
          />

          {/* Alternative Login Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', fontWeight: 600 }}
                disabled={loading}
              >
                Sign In Here
              </Button>
            </Typography>
          </Box>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
              </Typography>
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;