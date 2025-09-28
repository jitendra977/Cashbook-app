// src/components/EmailVerification.jsx - Updated version
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { CheckCircle, Error, Email, Refresh } from '@mui/icons-material';
import { usersAPI } from '../../api/users';

const EmailVerification = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for token in URL parameters or query string
    const verificationToken = token || searchParams.get('token');
    
    if (verificationToken) {
      verifyEmail(verificationToken);
    } else {
      setStatus('error');
      setMessage('Invalid verification link: No token found');
    }
  }, [token, searchParams]);

  const verifyEmail = async (verificationToken) => {
    try {
      setLoading(true);
      console.log('Verifying token:', verificationToken);
      
      // Make POST request with token in request body
      const response = await usersAPI.verifyEmail(verificationToken);
      
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');
    } catch (error) {
      console.error('Verification error details:', {
        status: error.response?.status,
        data: error.response?.data,
        token: verificationToken
      });
      
      setStatus('error');
      const errorDetail = error.response?.data?.detail || 
                         error.response?.data?.token?.[0] ||
                         error.response?.data?.error ||
                         'Invalid or expired verification link';
      setMessage(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.resendVerification();
      setMessage(response.message || 'Verification email sent!');
      setStatus('success');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to send verification email');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: '100%' }}>
          <Box textAlign="center">
            {status === 'verifying' && (
              <Card>
                <CardContent sx={{ py: 4 }}>
                  {loading ? (
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                  ) : (
                    <Refresh sx={{ fontSize: 60, mb: 3, color: 'primary.main' }} />
                  )}
                  <Typography variant="h5" gutterBottom>
                    Verifying Your Email...
                  </Typography>
                  <Typography color="textSecondary">
                    Please wait while we verify your email address.
                  </Typography>
                  {token && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                      Token: {token.substring(0, 8)}...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {status === 'success' && (
              <Card sx={{ border: '2px solid', borderColor: 'success.main' }}>
                <CardContent sx={{ py: 4 }}>
                  <CheckCircle sx={{ fontSize: 60, mb: 2, color: 'success.main' }} />
                  <Typography variant="h5" gutterBottom>
                    Email Verified Successfully!
                  </Typography>
                  <Typography sx={{ mb: 3 }} color="textSecondary">
                    {message}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    size="large"
                    sx={{ minWidth: 200 }}
                  >
                    Continue to Login
                  </Button>
                </CardContent>
              </Card>
            )}

            {status === 'error' && (
              <Card sx={{ border: '2px solid', borderColor: 'error.main' }}>
                <CardContent sx={{ py: 4 }}>
                  <Error sx={{ fontSize: 60, mb: 2, color: 'error.main' }} />
                  <Typography variant="h5" gutterBottom>
                    Verification Failed
                  </Typography>
                  <Typography sx={{ mb: 3 }} color="textSecondary">
                    {message}
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                    <Typography variant="body2">
                      If you need a new verification link, please try resending or contact support.
                    </Typography>
                  </Alert>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/login')}
                      disabled={loading}
                    >
                      Go to Login
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleResendVerification}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={16} /> : <Email />}
                    >
                      {loading ? 'Sending...' : 'Resend Email'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification;