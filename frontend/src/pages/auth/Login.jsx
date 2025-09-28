// src/components/Login/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useLocation } from 'react-router-dom';
import { validateLoginForm, hasFormErrors } from '../../utils/validators';
import { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Container,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';

const Login = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to avoid showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  {
    successMessage && (
      <Alert
        severity="success"
        sx={{
          mb: 2,
          borderRadius: 1,
          alignItems: 'center'
        }}
      >
        <Typography variant="body2">
          {successMessage}
        </Typography>
      </Alert>
    )
  }
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
          return '🔍 Login endpoint not found. Please check if the API URL is correct.';

        case 'SERVER_ERROR':
          return '🚨 Server error. Please try again later or contact support.';

        case 'UNAUTHORIZED':
          return '❌ Invalid username or password. Please check your credentials.';

        case 'REQUEST_CONFIG_ERROR':
          return '⚙️ Request configuration error. Please try again.';

        default:
          return error.details || 'An unexpected error occurred. Please try again.';
      }
    }

    // Handle Axios original errors
    if (error.response) {
      if (error.response.status === 401) {
        return '❌ Invalid username or password.';
      } else if (error.response.status >= 500) {
        return `🚨 Server error (${error.response.status}). Please try again later.`;
      } else {
        return error.response.data?.message || `Error: ${error.response.status}`;
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
    return 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form using validators
    const validationErrors = validateLoginForm(form);

    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(form);

      if (result.success) {
        navigate('/');
      } else {
        setErrors({
          general: getErrorMessage(result.error || result.originalError)
        });
      }
    } catch (err) {
      console.error('Login error details:', err);
      setErrors({ general: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
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
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                color: '#333',
                marginBottom: 3,
              }}
            >
              Login
            </Typography>

            <Stack spacing={2}>
              {errors.general && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 1,
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {errors.general}
                  </Typography>
                </Alert>
              )}

              <Input
                type="text"
                label="Username"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                error={errors.username}
                required
                disabled={isLoading}
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                required
                disabled={isLoading}
              />

              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  size="large"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={() => navigate('/register')}
                  fullWidth
                  disabled={isLoading}
                >
                  Register
                </Button>
              </Stack>

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;