// src/components/profile/ChangePasswordDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  IconButton,
  CircularProgress,
  Box,
  Slide
} from '@mui/material';
import { 
  Lock, 
  Save, 
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChangePasswordDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  loading,
  errors,
  onErrorClear
}) => {
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (errors[name] && onErrorClear) {
      onErrorClear(name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors = {};
    
    if (!passwordData.old_password) {
      newErrors.old_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      // Handle client-side errors if needed
      return;
    }

    const success = await onSubmit(passwordData);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: ''
    });
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Choose a strong password with at least 8 characters
          </Alert>
          
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Current Password"
              name="old_password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.old_password}
              onChange={handleChange}
              error={!!errors?.old_password}
              helperText={errors?.old_password}
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
              onChange={handleChange}
              error={!!errors?.new_password}
              helperText={errors?.new_password || 'Minimum 8 characters'}
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
              onChange={handleChange}
              error={!!errors?.confirm_password}
              helperText={errors?.confirm_password}
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
            onClick={handleClose}
            sx={{ borderRadius: 2 }}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ borderRadius: 2, minWidth: 140 }}
            size="large"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ChangePasswordDialog;