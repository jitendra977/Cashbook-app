/ src/components/VerificationPending.jsx - Show when user needs to verify
import React, { useState } from 'react';
import {
  Box,
  Alert,
  Button,
  Typography,
  Snackbar
} from '@mui/material';
import { Email, Refresh } from '@mui/icons-material';
import { usersAPI } from '../api/users';

const VerificationPending = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.resendVerification();
      setSnackbar({
        open: true,
        message: response.message || 'Verification email sent!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to send verification email',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.is_verified) {
    return null;
  }

  return (
    <>
      <Alert 
        severity="warning" 
        sx={{ mb: 2 }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleResendVerification}
              disabled={loading}
              startIcon={loading ? <Refresh /> : <Email />}
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </Button>
            <Button color="inherit" size="small" onClick={onClose}>
              Dismiss
            </Button>
          </Box>
        }
      >
        <Typography variant="body2">
          <strong>Please verify your email address</strong>
          <br />
          We sent a verification link to <strong>{user?.email}</strong>. 
          Click the link in the email to activate your account.
        </Typography>
      </Alert>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
