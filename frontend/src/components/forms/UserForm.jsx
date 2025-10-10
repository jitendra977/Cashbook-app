// components/forms/UserForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Avatar,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';

const UserForm = ({ open, onClose, onSubmit, user = null, loading = false, errors = {} }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    address: '',
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
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        address: user.address,
        password: '', // Always empty for security
        password_confirm: '', // Always empty for security
        profile_image: null,
        is_active: user.is_active ?? true,
        is_staff: user.is_staff ?? false,
        is_superuser: user.is_superuser ?? false
      });
      // Set existing profile image preview
      if (user.profile_image) {
        setImagePreview(user.profile_image);
      }
      setShowPasswords(false); // Don't show password fields by default for edit
    } else {
      // Reset form for new user
      setFormData({
        username: '',
        email: '',
        address: '',
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
      setShowPasswords(true); // Show password fields for new user
    }
  }, [user, open]);

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
        setImagePreview(user?.profile_image || null);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!user && (!formData.password || !formData.password_confirm)) {
      return;
    }

    if (formData.password !== formData.password_confirm) {
      return;
    }

    // Prepare data
    const data = new FormData();

    // Add all form fields
    Object.keys(formData).forEach((key) => {
      if (key === 'password_confirm') return; // Don't send confirm password

      if (key === 'profile_image') {
        // Only add image if a new file was selected
        if (formData[key] instanceof File) {
          data.append(key, formData[key]);
        }
      } else if (key === 'password') {
        // Only add password if it's not empty (for updates)
        if (formData[key].trim() !== '') {
          data.append(key, formData[key]);
        }
      } else if (typeof formData[key] === 'boolean') {
        data.append(key, formData[key]);
      } else if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    onSubmit(data);
  };

  const handleClose = () => {
    setImagePreview(null);
    onClose();
  };

  const removeImage = () => {
    setFormData({ ...formData, profile_image: null });
    setImagePreview(user?.profile_image || null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {user ? 'Edit User' : 'Create New User'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>

            {/* Profile Image Section */}
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
                  <Alert severity="error" sx={{ width: '100%' }}>
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
                label="Username"
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
                label="Email"
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={Array.isArray(errors.address) ? errors.address[0] : errors.address}
              />
            </Grid>
            {/* Password Section */}
            <Grid item xs={12}>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Password Settings
                </Typography>
                {user && (
                  <Button
                    size="small"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? 'Hide' : 'Change Password'}
                  </Button>
                )}
              </Box>
            </Grid>

            {(showPasswords || !user) && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!user}
                    error={!!errors.password}
                    helperText={Array.isArray(errors.password) ? errors.password[0] : errors.password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="password_confirm"
                    type="password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required={!user}
                    error={!!errors.password_confirm || (formData.password !== formData.password_confirm && formData.password_confirm !== '')}
                    helperText={
                      Array.isArray(errors.password_confirm) ? errors.password_confirm[0] :
                        errors.password_confirm ||
                        (formData.password !== formData.password_confirm && formData.password_confirm !== '' ? 'Passwords do not match' : '')
                    }
                  />
                </Grid>
              </>
            )}

            {/* Permissions Section */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
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
                label="Active"
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
                label="Staff"
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
                label="Superuser"
              />
            </Grid>
          </Grid>

          {/* General Errors */}
          {(errors.general || errors.non_field_errors) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.general || errors.non_field_errors}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (formData.password !== formData.password_confirm && (showPasswords || !user))}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;