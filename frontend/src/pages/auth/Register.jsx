import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { validateRegisterForm, hasFormErrors } from '../../utils/validators';
import {
  Box,
  Paper,
  Typography,
  Container,
  Stack
} from '@mui/material';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form using validators
    const validationErrors = validateRegisterForm(form);
    
    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
      setErrors({ 
        general: 'Registration failed. Please try again or choose a different username.' 
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
              Register
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
                helperText={!errors.username ? "At least 3 characters, letters, numbers, and underscores only" : undefined}
                required
              />

              <Input
                type="email"
                label="Email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                helperText={!errors.email ? "We'll never share your email" : undefined}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                helperText={!errors.password ? "At least 6 characters" : undefined}
                required
              />

              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button type="submit" size="large" variant="success" fullWidth>
                  Register
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={() => navigate('/login')}
                  fullWidth
                >
                  Back to Login
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;