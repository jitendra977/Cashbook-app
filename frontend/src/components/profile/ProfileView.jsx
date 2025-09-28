// src/components/profile/ProfileView.jsx
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Info,
  Security,
  AccountCircle,
  Email,
  Person,
  Phone,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';

const ProfileView = ({ profile }) => {
  const theme = useTheme();

  const profileFields = [
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
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        <Info sx={{ mr: 2, verticalAlign: 'middle' }} />
        Profile Information
      </Typography>
      
      <Grid container spacing={3}>
        {profileFields.map((field, index) => (
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
  );
};

export default ProfileView;