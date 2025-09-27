import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/forms/UserForm';
import {
  Box,
  Paper,
  Typography,
  Container,
  Button
} from '@mui/material';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
          if (key !== 'profile_image') { // Skip empty profile_image
            userData[key] = value;
          }
        }
      }

      await register(userData);
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
      
      // Handle backend validation errors
      if (err.response && err.response.data) {
        const backendErrors = {};
        const errorData = err.response.data;
        
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
        setErrors({ 
          general: 'Registration failed. Please try again or choose a different username.' 
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

          {/* UserForm Component */}
          <UserForm
            open={true}
            onClose={handleClose}
            onSubmit={handleSubmit}
            user={null}
            loading={loading}
            errors={errors}
            embedded={true} // Add this prop to render without Dialog
            isRegistration={true} // Add this to customize form behavior
          />

          {/* Alternative Login Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Sign In Here
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;