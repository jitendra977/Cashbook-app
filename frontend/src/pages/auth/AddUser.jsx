// pages/AddUser.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
  Card,
  CardContent,
  Grid,
  Divider,
  TextField,
  Avatar,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  PersonAdd,
  Home,
  People,
  CheckCircle,
  CloudUpload
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api/users';

const AddUser = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: currentUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    address:'',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    profile_image: null,
    is_active: true,
    is_staff: false,
    is_superuser: false
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (name === 'profile_image') {
      const file = files[0];
      setFormData({ ...formData, profile_image: file });
      
      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Client-side validation
    if (formData.password !== formData.password_confirm) {
      setErrors({ password_confirm: ['Passwords do not match'] });
      setLoading(false);
      return;
    }

    try {
      // Prepare FormData
      const data = new FormData();
      
      Object.keys(formData).forEach((key) => {
        if (key === 'password_confirm') return;
        
        if (key === 'profile_image') {
          if (formData[key] instanceof File) {
            data.append(key, formData[key]);
          }
        } else if (typeof formData[key] === 'boolean') {
          data.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const newUser = await usersAPI.createUser(data);
      setCreatedUser(newUser);
      setSuccess(true);
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
      
    } catch (err) {
      console.error('Error creating user:', err);
      
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({
          general: err.response?.data?.detail || err.message || 'Failed to create user'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const removeImage = () => {
    setFormData({ ...formData, profile_image: null });
    setImagePreview(null);
  };

  // Check permissions
  const hasPermission = currentUser?.is_staff || currentUser?.is_superuser;

  if (!hasPermission) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          py: 3
        }}
      >
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              Access Denied
            </Alert>
            <Typography variant="h5" gutterBottom>
              Insufficient Permissions
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              You don't have permission to add new users. Please contact an administrator.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
            >
              Go Back
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 3
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 3,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: alpha('#fff', 0.1),
            }}
          />

          <Box position="relative" zIndex={1}>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{ 
                mb: 2,
                '& .MuiBreadcrumbs-separator, & a, & span': {
                  color: 'rgba(255, 255, 255, 0.8)'
                }
              }}
            >
              <Link
                underline="hover"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { color: 'white' }
                }}
                onClick={() => navigate('/dashboard')}
              >
                <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <PersonAdd sx={{ mr: 0.5 }} fontSize="inherit" />
                Add User
              </Typography>
            </Breadcrumbs>

            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  <PersonAdd sx={{ mr: 2, fontSize: 'inherit' }} />
                  Add New User
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Create a new user account with custom permissions
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.8)',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Go Back
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Success Message */}
        {success && createdUser && (
          <Card 
            elevation={0} 
            sx={{ 
              mb: 4, 
              border: `2px solid ${theme.palette.success.main}`,
              backgroundColor: alpha(theme.palette.success.main, 0.1)
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    User Created Successfully!
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Redirecting to dashboard in 5 seconds...
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Username:</Typography>
                  <Typography variant="body1" fontWeight="medium">@{createdUser.username}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Email:</Typography>
                  <Typography variant="body1" fontWeight="medium">{createdUser.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Address:</Typography>
                  <Typography variant="body1" fontWeight="medium">{createdUser.address}</Typography>
                </Grid>
              </Grid>

              <Box mt={3} display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSuccess(false);
                    setCreatedUser(null);
                    setErrors({});
                    setFormData({
                      username: '',
                      email: '',
                      first_name: '',
                      last_name: '',
                      phone_number: '',
                      password: '',
                      password_confirm: '',
                      profile_image: null,
                      is_active: true,
                      is_staff: false,
                      is_superuser: false
                    });
                    setImagePreview(null);
                  }}
                >
                  Add Another User
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {!success && (
          <Paper elevation={0} sx={{ borderRadius: 3, p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              User Information
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
              Fill in the details below to create a new user account. Required fields are marked with an asterisk (*).
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                
                {/* Profile Image */}
                <Grid item xs={12}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar
                      src={imagePreview}
                      sx={{ width: 100, height: 100 }}
                    >
                      {formData.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        size="small"
                      >
                        Upload Image
                        <input
                          type="file"
                          name="profile_image"
                          onChange={handleChange}
                          accept="image/*"
                          hidden
                        />
                      </Button>
                      
                      {imagePreview && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={removeImage}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    
                    {errors.profile_image && (
                      <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
                        {Array.isArray(errors.profile_image) ? errors.profile_image[0] : errors.profile_image}
                      </Alert>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Basic Information */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username *"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    error={!!errors.username}
                    helperText={Array.isArray(errors.username) ? errors.username[0] : errors.username}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!!errors.email}
                    helperText={Array.isArray(errors.email) ? errors.email[0] : errors.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={!!errors.first_name}
                    helperText={Array.isArray(errors.first_name) ? errors.first_name[0] : errors.first_name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={!!errors.last_name}
                    helperText={Array.isArray(errors.last_name) ? errors.last_name[0] : errors.last_name}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    error={!!errors.phone_number}
                    helperText={Array.isArray(errors.phone_number) ? errors.phone_number[0] : errors.phone_number}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Password Settings
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={!!errors.password}
                    helperText={Array.isArray(errors.password) ? errors.password[0] : errors.password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password *"
                    name="password_confirm"
                    type="password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    error={!!errors.password_confirm || (formData.password !== formData.password_confirm && formData.password_confirm !== '')}
                    helperText={
                      Array.isArray(errors.password_confirm) ? errors.password_confirm[0] : 
                      errors.password_confirm || 
                      (formData.password !== formData.password_confirm && formData.password_confirm !== '' ? 'Passwords do not match' : '')
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Permissions
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                    }
                    label="Active User"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="is_staff"
                        checked={formData.is_staff}
                        onChange={handleChange}
                      />
                    }
                    label="Staff Member"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="is_superuser"
                        checked={formData.is_superuser}
                        onChange={handleChange}
                      />
                    }
                    label="Super Admin"
                  />
                </Grid>
              </Grid>

              {/* General Errors */}
              {(errors.general || errors.non_field_errors) && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {errors.general || errors.non_field_errors}
                </Alert>
              )}

              {/* Actions */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleGoBack}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || (formData.password !== formData.password_confirm)}
                  startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                >
                  {loading ? 'Creating User...' : 'Create User'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AddUser;