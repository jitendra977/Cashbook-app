// src/pages/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Alert,
  Box,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  LinearProgress,
  Tooltip,
  Snackbar,
  Zoom,
  Chip,
  Stack,
  useTheme,
  alpha,
  Slide
} from '@mui/material';
import {
  Delete,
  ArrowBack,
  CloudUpload
} from '@mui/icons-material';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ProfileHeader,
  ChangePasswordDialog,
  ProfileForm,
  ProfileView
} from '../../components/profile';
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    try {
      const data = await usersAPI.getProfile();

      // Add timestamp to profile image to prevent caching
      if (data.profile_image) {
        data.profile_image = addTimestampToImageUrl(data.profile_image);
      }

      setProfile(data);
      setFormData(data);
      setImagePreview(data.profile_image);
    } catch (error) {
      showSnackbar('Error fetching profile data', 'error');
      console.error('Error fetching profile:', error);
    }
  };
  // Helper function to add timestamp to image URL
  const addTimestampToImageUrl = (url) => {
    if (!url) return url;
    const timestamp = new Date().getTime();
    return `${url}${url.includes('?') ? '&' : '?'}_t=${timestamp}`;
  };
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    clearError(name);
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

      clearError('profile_image');
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

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('profile_image', imageFile);

      const updatedProfile = await usersAPI.updateProfile(uploadFormData);

      // Add timestamp to the new image URL
      if (updatedProfile.profile_image) {
        updatedProfile.profile_image = addTimestampToImageUrl(updatedProfile.profile_image);
      }

      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setImageFile(null);
      setImagePreview(updatedProfile.profile_image);

      // Update auth context with timestamped URL
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
      let dataToSend;

      if (imageFile) {
        dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (key !== 'profile_image' && formData[key] !== null && formData[key] !== undefined) {
            dataToSend.append(key, formData[key]);
          }
        });
        dataToSend.append('profile_image', imageFile);
      } else {
        dataToSend = { ...formData };
        if (dataToSend.profile_image === profile?.profile_image) {
          delete dataToSend.profile_image;
        }
      }

      const updatedProfile = await usersAPI.updateProfile(dataToSend);

      // Add timestamp to image URL if it exists
      if (updatedProfile.profile_image) {
        updatedProfile.profile_image = addTimestampToImageUrl(updatedProfile.profile_image);
      }

      setProfile(updatedProfile);
      setEditing(false);

      // Update auth context
      if (updateUser) {
        updateUser(updatedProfile);
      }

      // Reset image states
      setImageFile(null);
      setImagePreview(updatedProfile.profile_image);

      showSnackbar('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
        const firstError = Object.values(error.response.data)[0];
        showSnackbar(Array.isArray(firstError) ? firstError[0] : firstError, 'error');
      } else {
        showSnackbar('Failed to update profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (passwordData) => {
    setPasswordLoading(true);

    try {
      await usersAPI.updatePassword(passwordData);
      showSnackbar('Password updated successfully!', 'success');
      return true; // Success
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      showSnackbar('Failed to update password', 'error');
      return false; // Failure
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

  const handleEditToggle = () => {
    if (editing) {
      handleCancel();
    } else {
      setEditing(true);
    }
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
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          editing={editing}
          onEditToggle={handleEditToggle}
          onPasswordChange={() => setPasswordDialogOpen(true)}
          onImageSelect={handleImageChange}
          onImageDelete={() => setDeleteDialogOpen(true)}
          imagePreview={imagePreview}
        />

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
            <ProfileForm
              formData={formData}
              errors={errors}
              loading={loading}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          ) : (
            <ProfileView profile={profile} />
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
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSubmit={handlePasswordUpdate}
        loading={passwordLoading}
        errors={errors}
        onErrorClear={clearError}
      />

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