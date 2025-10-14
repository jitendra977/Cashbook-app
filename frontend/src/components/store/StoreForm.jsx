// src/components/stores/StoreForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Typography, Box, useTheme,
  FormControlLabel, Switch
} from '@mui/material';
import { Phone, Email, Public, Store } from '@mui/icons-material';

const StoreForm = ({ 
  open, 
  onClose, 
  onSave, 
  store = null, 
  loading = false 
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contact_number: '',
    email: '',
    website: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  // Load existing store data when editing
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        address: store.address || '',
        contact_number: store.contact_number || '',
        email: store.email || '',
        website: store.website || '',
        is_active: store.is_active !== undefined ? store.is_active : true
      });
    } else {
      resetForm();
    }
  }, [store, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      contact_number: '',
      email: '',
      website: '',
      is_active: true
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name is required and unique
    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Store name must not exceed 255 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 255) {
      newErrors.description = 'Description must not exceed 255 characters';
    }

    // Address validation
    if (formData.address && formData.address.length > 255) {
      newErrors.address = 'Address must not exceed 255 characters';
    }

    // Contact number validation
    if (formData.contact_number && formData.contact_number.length > 20) {
      newErrors.contact_number = 'Contact number must not exceed 20 characters';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Website validation
    if (formData.website) {
      if (formData.website.length > 255) {
        newErrors.website = 'Website URL must not exceed 255 characters';
      } else if (!/^https?:\/\/.+/.test(formData.website)) {
        newErrors.website = 'Website must start with http:// or https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare data - only send non-empty optional fields
      const dataToSend = {
        name: formData.name.trim(),
        is_active: formData.is_active
      };

      // Add optional fields only if they have values
      if (formData.description && formData.description.trim()) {
        dataToSend.description = formData.description.trim();
      }
      if (formData.address && formData.address.trim()) {
        dataToSend.address = formData.address.trim();
      }
      if (formData.contact_number && formData.contact_number.trim()) {
        dataToSend.contact_number = formData.contact_number.trim();
      }
      if (formData.email && formData.email.trim()) {
        dataToSend.email = formData.email.trim();
      }
      if (formData.website && formData.website.trim()) {
        dataToSend.website = formData.website.trim();
      }

      onSave(dataToSend);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`, 
          pb: 2 
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Store color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="600">
              {store ? 'Edit Store' : 'Create New Store'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {store ? 'Update store information' : 'Add a new store to your portfolio'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Store Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              error={!!errors.name}
              helperText={errors.name || 'Required, max 255 characters'}
              autoFocus
              placeholder="Enter store name"
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Brief description of your store..."
              error={!!errors.description}
              helperText={errors.description || 'Optional, max 255 characters'}
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              placeholder="Street address, city, state, zip code"
              error={!!errors.address}
              helperText={errors.address || 'Optional, max 255 characters'}
            />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              error={!!errors.contact_number}
              helperText={errors.contact_number || 'Optional, max 20 characters'}
              InputProps={{ 
                startAdornment: (
                  <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                )
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              type="email"
              placeholder="store@example.com"
              error={!!errors.email}
              helperText={errors.email || 'Optional'}
              InputProps={{ 
                startAdornment: (
                  <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                )
              }}
            />

            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              margin="normal"
              placeholder="https://www.example.com"
              error={!!errors.website}
              helperText={errors.website || 'Optional, max 255 characters'}
              InputProps={{ 
                startAdornment: (
                  <Public sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                )
              }}
            />

            <Box mt={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      Active Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.is_active 
                        ? 'Store is currently active and operational' 
                        : 'Store is currently inactive'}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 2
        }}
      >
        <Button 
          onClick={handleClose} 
          color="inherit"
          size="large"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          size="large"
        >
          {loading ? 'Saving...' : store ? 'Update Store' : 'Create Store'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreForm;