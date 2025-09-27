import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { validateLoginForm, hasFormErrors } from '../../utils/validators';
import {
  Box,
  Paper,
  Typography,
  Container,
  Stack
} from '@mui/material';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setErrors({ 
        general: 'Invalid credentials. Please check your username and password.' 
      });
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
                <Typography 
                  color="error" 
                  variant="body2" 
                  sx={{ 
                    textAlign: 'center', 
                    backgroundColor: '#ffebee', 
                    padding: 1, 
                    borderRadius: 1 
                  }}
                >
                  {errors.general}
                </Typography>
              )}

              <Input
                type="text"
                label="Username"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                error={errors.username}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                required
              />

              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button type="submit" size="large" variant="primary" fullWidth>
                  Login
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={() => navigate('/register')}
                  fullWidth
                >
                  Register
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;