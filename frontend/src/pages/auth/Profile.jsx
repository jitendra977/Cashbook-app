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
  Divider,
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
  alpha
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
  AccountCircle
} from '@mui/icons-material';
import { usersAPI } from '../../api/users';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, profile_image: 'Please select a valid image file' });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, profile_image: 'Image size must be less than 5MB' });
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setErrors({ ...errors, profile_image: '' });
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    
    setImageLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('profile_image', imageFile);

    try {
      const updatedProfile = await usersAPI.updateProfile(uploadFormData);
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setImageFile(null);
      setImagePreview(updatedProfile.profile_image);
      alert('Profile image updated successfully!');
    } catch (error) {
      if (error.response?.data) {
        setErrors({ ...errors, profile_image: error.response.data.profile_image?.[0] || 'Failed to upload image' });
      }
    } finally {
      setImageLoading(false);
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
      alert('Profile image removed successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to remove profile image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const updatedProfile = await usersAPI.updateProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setErrors({});
    setImagePreview(profile?.profile_image || null);
    setImageFile(null);
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || 'U';
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
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
        py: 4
      }}
    >
      {/* Go Back Button */}
      <Fab
        color="primary"
        aria-label="go back"
        onClick={() => navigate(-1)}
        sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          boxShadow: 3
        }}
      >
        <ArrowBack />
      </Fab>

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper 
          elevation={0}
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: alpha('#fff', 0.1),
              borderRadius: '50%',
              transform: 'translate(100px, -100px)',
            }
          }}
        >
          <Box position="relative" zIndex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                  My Profile
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage your personal information and settings
                </Typography>
              </Box>
              <Button
                variant={editing ? "outlined" : "contained"}
                startIcon={editing ? <Cancel /> : <Edit />}
                onClick={editing ? handleCancel : () => setEditing(true)}
                sx={{
                  bgcolor: editing ? 'transparent' : 'rgba(255,255,255,0.2)',
                  borderColor: editing ? 'rgba(255,255,255,0.5)' : 'transparent',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: editing ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                  },
                  px: 3,
                  py: 1,
                  borderRadius: 2
                }}
                size="large"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            {/* Profile Image Section */}
            <Box display="flex" justifyContent="center" mt={4}>
              <Box position="relative">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    editing && (
                      <Box>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        <Fab
                          size="small"
                          color="secondary"
                          aria-label="upload picture"
                          component="span"
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            boxShadow: 3,
                            '&:hover': { transform: 'scale(1.1)' },
                            transition: 'transform 0.2s'
                          }}
                        >
                          <PhotoCamera />
                        </Fab>
                      </Box>
                    )
                  }
                >
                  <Avatar
                    src={imagePreview || profile.profile_image}
                    sx={{ 
                      width: 150, 
                      height: 150,
                      fontSize: '3rem',
                      border: '6px solid rgba(255,255,255,0.2)',
                      boxShadow: 3,
                      bgcolor: alpha('#fff', 0.2)
                    }}
                  >
                    {!(imagePreview || profile.profile_image) && getInitials(profile.first_name, profile.last_name)}
                  </Avatar>
                </Badge>
                
                {editing && (imagePreview || profile.profile_image) && (
                  <Fab
                    size="small"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      boxShadow: 3,
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s'
                    }}
                  >
                    <Delete />
                  </Fab>
                )}
              </Box>
            </Box>

            {/* User Info */}
            <Box textAlign="center" mt={3}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.username
                }
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                @{profile.username}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Image Upload Actions */}
        {editing && imageFile && (
          <Box display="flex" justifyContent="center" gap={2} mb={3}>
            <Button
              variant="contained"
              onClick={handleImageUpload}
              disabled={imageLoading}
              startIcon={imageLoading ? <CircularProgress size={20} /> : <Save />}
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 3 }}
            >
              {imageLoading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setImageFile(null);
                setImagePreview(profile?.profile_image || null);
                setErrors({ ...errors, profile_image: '' });
              }}
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 3 }}
            >
              Cancel Image
            </Button>
          </Box>
        )}

        {/* Error display for image */}
        {errors.profile_image && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errors.profile_image}
          </Alert>
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
                Edit Profile Information
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username?.[0]}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: <AccountCircle sx={{ color: 'action.active', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email?.[0]}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
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
                    helperText={errors.first_name?.[0]}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
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
                    helperText={errors.last_name?.[0]}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
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
                    helperText={errors.phone_number?.[0]}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />
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
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    }
                  }}
                >
                  {loading ? 'Updating...' : 'Save Changes'}
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
                Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                        <AccountCircle sx={{ color: 'primary.main', fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Username
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {profile.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                        <Email sx={{ color: 'primary.main', fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Email Address
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {profile.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                        <Person sx={{ color: 'primary.main', fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            First Name
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {profile.first_name || (
                              <Typography component="span" color="textSecondary" fontStyle="italic">
                                Not provided
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                        <Person sx={{ color: 'primary.main', fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Last Name
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {profile.last_name || (
                              <Typography component="span" color="textSecondary" fontStyle="italic">
                                Not provided
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                        <Phone sx={{ color: 'primary.main', fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Phone Number
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {profile.phone_number || (
                              <Typography component="span" color="textSecondary" fontStyle="italic">
                                Not provided
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Delete Image Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Remove Profile Image
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove your profile image? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImageDelete} 
            color="error" 
            variant="contained"
            disabled={imageLoading}
            startIcon={imageLoading ? <CircularProgress size={20} /> : <Delete />}
            sx={{ borderRadius: 2 }}
          >
            {imageLoading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;