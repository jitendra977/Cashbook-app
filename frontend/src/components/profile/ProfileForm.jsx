// src/components/profile/ProfileForm.jsx
import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Edit, 
  Save,
  AccountCircle,
  Email,
  Person,
  Phone
} from '@mui/icons-material';

const ProfileForm = ({ 
  formData, 
  errors, 
  loading, 
  onChange, 
  onSubmit, 
  onCancel 
}) => {
  const theme = useTheme();

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ p: 4 }}>
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
          onClick={onCancel}
          size="large"
          sx={{ px: 4, py: 1.5, borderRadius: 3 }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileForm;
