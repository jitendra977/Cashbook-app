// src/pages/profile/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Stack,
  useTheme,
  alpha,
  Slide,
  Zoom,
  Chip,
  LinearProgress,
  Tooltip,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { 
  Edit, 
  Save, 
  Cancel, 
  PhotoCamera, 
  Delete,
  Person,
  ArrowBack,
  Email,
  Phone,
  AccountCircle,
  CloudUpload,
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  ErrorOutline,
  Info,
  Security,
  Notifications,
  Settings as SettingsIcon,
  Upload
} from '@mui/icons-material';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await usersAPI.getProfile();
      setProfile(data);
      setFormData(data);
      if (data.profile_image) {
        setImagePreview(data.profile_image);
      }
    } catch (error) {
      showSnackbar('Error fetching profile data', 'error');
      console.error('Error fetching profile:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please select a valid image file', 'error');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size must be less than 5MB', 'error');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setErrors({ ...errors, profile_image: '' });
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    
    setImageLoading(true);
    const progressInterval = simulateProgress();
    
    const uploadFormData = new FormData();
    uploadFormData.append('profile_image', imageFile);

    try {
      const updatedProfile = await usersAPI.updateProfile(uploadFormData);
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setImageFile(null);
      setImagePreview(updatedProfile.profile_image);
      
      // Update auth context
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      showSnackbar('Profile image updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar(
        error.response?.data?.profile_image?.[0] || 'Failed to upload image',
        'error'
      );
    } finally {
      clearInterval(progressInterval);
      setImageLoading(false);
      setUploadProgress(0);
    }
  };

  const handleImageDelete = async () => {
    setImageLoading(true);
    try {
      const updatedProfile = await usersAPI.updateProfile({ profile_image: null });
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setImagePreview(null);
      setImageFile(null);
      setDeleteDialogOpen(false);
      
      // Update auth context
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      showSnackbar('Profile image removed successfully!', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      showSnackbar('Failed to remove profile image', 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updatedProfile = await usersAPI.updateProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
      
      // Update auth context
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      showSnackbar('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      showSnackbar('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);

    try {
      await usersAPI.updatePassword(passwordData);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordDialogOpen(false);
      showSnackbar('Password updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      showSnackbar('Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setErrors({});
    setImagePreview(profile?.profile_image || null);
    setImageFile(null);
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    const fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'profile_image'];
    const completedFields = fields.filter(field => profile[field]);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  if (!profile) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your profile...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
        py: 3
      }}
    >
      {/* Back Button */}
      <Tooltip title="Go Back">
        <Fab
          color="primary"
          aria-label="go back"
          onClick={() => navigate(-1)}
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 1000,
            boxShadow: 4,
            '&:hover': { transform: 'scale(1.1)' },
            transition: 'transform 0.2s'
          }}
        >
          <ArrowBack />
        </Fab>
      </Tooltip>

      <Container maxWidth="lg">
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 4,
            p: 4,
            mb: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decorations */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: alpha('#fff', 0.1),
              zIndex: 0
            }}
          />

          <Box position="relative" zIndex={1}>
            {/* Top section with title and actions */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                  Profile Settings
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Manage your account information and preferences
                </Typography>
                
                {/* Profile completion */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Profile Completion: {getCompletionPercentage()}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getCompletionPercentage()} 
                    sx={{ 
                      flex: 1, 
                      maxWidth: 200,
                      bgcolor: alpha('#fff', 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#fff'
                      }
                    }} 
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.8)',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Change Password
                </Button>
                
                <Button
                  variant={editing ? "outlined" : "contained"}
                  startIcon={editing ? <Cancel /> : <Edit />}
                  onClick={editing ? handleCancel : () => setEditing(true)}
                  sx={{
                    bgcolor: editing ? 'transparent' : 'rgba(255,255,255,0.2)',
                    borderColor: editing ? 'rgba(255,255,255,0.5)' : 'transparent',
                    color: 'white',
                    '&:hover': {
                      bgcolor: editing ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                    },
                    minWidth: 120
                  }}
                  size="large"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Stack>
            </Box>

            {/* Profile image and user info */}
            <Box display="flex" alignItems="center" gap={4}>
              {/* Profile Image */}
              <Box position="relative">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    editing && (
                      <Tooltip title="Change Profile Picture">
                        <Fab
                          size="small"
                          color="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            boxShadow: 4,
                            '&:hover': { transform: 'scale(1.1)' },
                            transition: 'transform 0.2s'
                          }}
                        >
                          <PhotoCamera />
                        </Fab>
                      </Tooltip>
                    )
                  }
                >
                  <Avatar
                    src={imagePreview || profile.profile_image}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      fontSize: '2.5rem',
                      border: '4px solid rgba(255,255,255,0.3)',
                      boxShadow: 4,
                      bgcolor: alpha('#fff', 0.2)
                    }}
                  >
                    {!(imagePreview || profile.profile_image) && 
                      getInitials(profile.first_name, profile.last_name, profile.username)
                    }
                  </Avatar>
                </Badge>
                
                {editing && (imagePreview || profile.profile_image) && (
                  <Tooltip title="Remove Picture">
                    <Fab
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        boxShadow: 4,
                        '&:hover': { transform: 'scale(1.1)' },
                        transition: 'transform 0.2s'
                      }}
                    >
                      <Delete />
                    </Fab>
                  </Tooltip>
                )}
              </Box>

              {/* User Info */}
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.username
                  }
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  @{profile.username}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {profile.email}
                </Typography>
                
                {/* Status badges */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip 
                    label={profile.is_active ? 'Active' : 'Inactive'}
                    color={profile.is_active ? 'success' : 'error'}
                    size="small"
                    sx={{ color: 'white' }}
                  />
                  {profile.is_staff && (
                    <Chip 
                      label="Staff" 
                      color="info" 
                      size="small"
                      sx={{ color: 'white' }}
                    />
                  )}
                  {profile.is_verified && (
                    <Chip 
                      label="Verified" 
                      color="success" 
                      size="small"
                      sx={{ color: 'white' }}
                    />
                  )}
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </Paper>

        {/* Image Upload Actions */}
        {editing && imageFile && (
          <Zoom in timeout={300}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Upload New Profile Image
                </Typography>
                <Chip 
                  label={`${(imageFile.size / 1024 / 1024).toFixed(2)} MB`}
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              {imageLoading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleImageUpload}
                  disabled={imageLoading}
                  startIcon={imageLoading ? <CircularProgress size={20} /> : <CloudUpload />}
                  size="large"
                >
                  {imageLoading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(profile?.profile_image || null);
                    setUploadProgress(0);
                  }}
                  size="large"
                  disabled={imageLoading}
                >
                  Cancel
                </Button>
              </Stack>
            </Paper>
          </Zoom>
        )}

        {/* Main Content */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {editing ? (
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                <Edit sx={{ mr: 2, verticalAlign: 'middle' }} />
                Edit Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: <AccountCircle sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number || 'Format: +1234567890'}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box mt={4} display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  size="large"
                  sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                <Info sx={{ mr: 2, verticalAlign: 'middle' }} />
                Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                {[
                  { 
                    icon: AccountCircle, 
                    label: 'Username', 
                    value: profile.username,
                    required: true
                  },
                  { 
                    icon: Email, 
                    label: 'Email Address', 
                    value: profile.email,
                    required: true
                  },
                  { 
                    icon: Person, 
                    label: 'First Name', 
                    value: profile.first_name
                  },
                  { 
                    icon: Person, 
                    label: 'Last Name', 
                    value: profile.last_name
                  },
                  { 
                    icon: Phone, 
                    label: 'Phone Number', 
                    value: profile.phone_number
                  }
                ].map((field, index) => (
                  <Grid item xs={12} md={index < 2 ? 12 : 6} key={field.label}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <field.icon sx={{ 
                            color: 'primary.main', 
                            fontSize: 32,
                            opacity: field.value ? 1 : 0.5
                          }} />
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <Typography variant="subtitle2" color="textSecondary">
                                {field.label}
                              </Typography>
                              {field.required && (
                                <Chip 
                                  label="Required" 
                                  size="small" 
                                  color="primary"
                                  sx={{ height: 16, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                color: field.value ? 'text.primary' : 'text.secondary',
                                fontStyle: field.value ? 'normal' : 'italic'
                              }}
                            >
                              {field.value || 'Not provided'}
                            </Typography>
                          </Box>
                          {field.value ? (
                            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                          ) : (
                            <ErrorOutline sx={{ color: 'warning.main', fontSize: 20 }} />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Account Status */}
              <Divider sx={{ my: 4 }} />
              
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Status
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: profile.is_active ? 'success.main' : 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <CheckCircle sx={{ color: 'white', fontSize: 30 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {profile.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Account Status
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: profile.is_verified ? 'info.main' : 'grey.400',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <CheckCircle sx={{ color: 'white', fontSize: 30 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {profile.is_verified ? 'Verified' : 'Unverified'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Email Verification
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: profile.is_staff ? 'warning.main' : 'grey.400',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <Security sx={{ color: 'white', fontSize: 30 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {profile.is_staff ? 'Staff' : 'User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Account Type
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Delete Image Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 400 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
            <Delete sx={{ mr: 1, color: 'error.main' }} />
            Remove Profile Image
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone
          </Alert>
          <Typography>
            Are you sure you want to remove your profile image? You can always upload a new one later.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImageDelete} 
            color="error" 
            variant="contained"
            disabled={imageLoading}
            startIcon={imageLoading ? <CircularProgress size={20} /> : <Delete />}
            sx={{ borderRadius: 2, minWidth: 120 }}
            size="large"
          >
            {imageLoading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
            <Lock sx={{ mr: 1, color: 'primary.main' }} />
            Change Password
          </Typography>
        </DialogTitle>
        <Box component="form" onSubmit={handlePasswordUpdate}>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Choose a strong password with at least 8 characters
            </Alert>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Current Password"
                name="current_password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                error={!!errors.current_password}
                helperText={errors.current_password}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="New Password"
                name="new_password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                error={!!errors.new_password}
                helperText={errors.new_password || 'Minimum 8 characters'}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirm_password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => {
                setPasswordDialogOpen(false);
                setPasswordData({
                  current_password: '',
                  new_password: '',
                  confirm_password: ''
                });
                setErrors({});
              }}
              sx={{ borderRadius: 2 }}
              size="large"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={passwordLoading}
              startIcon={passwordLoading ? <CircularProgress size={20} /> : <Save />}
              sx={{ borderRadius: 2, minWidth: 140 }}
              size="large"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;