// src/components/profile/ProfileForm.jsx
import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  
} from '@mui/material';
import { 
  Edit, 
  Save,
  AccountCircle,
  Email,
  Person,
  Phone
} from '@mui/icons-material';

// If you have a separate ProfileForm component, make sure it handles the form correctly
const ProfileForm = ({ formData, errors, loading, onChange, onSubmit, onCancel }) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username || ''}
            onChange={onChange}
            error={!!errors.username}
            helperText={errors.username}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={onChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="first_name"
            value={formData.first_name || ''}
            onChange={onChange}
            error={!!errors.first_name}
            helperText={errors.first_name}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="last_name"
            value={formData.last_name || ''}
            onChange={onChange}
            error={!!errors.last_name}
            helperText={errors.last_name}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number || ''}
            onChange={onChange}
            error={!!errors.phone_number}
            helperText={errors.phone_number}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address || ''}
            onChange={onChange}
            error={!!errors.address}
            helperText={errors.address}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={onCancel} 
          disabled={loading}
          size="large"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          size="large"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </Box>
    </Box>
  );
};
export default ProfileForm;
