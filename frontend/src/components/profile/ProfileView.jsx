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
  alpha,
  useTheme,
  Paper,
  Container,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  Info,
  Security,
  AccountCircle,
  Email,
  Person,
  ContactMail as Map,
  Phone,
  CheckCircle,
  ErrorOutline,
  VerifiedUser,
  Badge,
  Lock,
  Star,
  Warning,
  AdminPanelSettings
} from '@mui/icons-material';

const ProfileView = ({ profile }) => {
  const theme = useTheme();

  // Enhanced profile fields with categories and metadata
  const profileSections = [
    {
      title: 'Basic Information',
      icon: <Person />,
      fields: [
        { 
          icon: AccountCircle, 
          label: 'Username', 
          value: profile?.username,
          required: true,
          verification: 'unique',
          description: 'Your unique identifier'
        },
        { 
          icon: Person, 
          label: 'First Name', 
          value: profile?.first_name,
          category: 'personal',
          description: 'Your legal first name'
        },
        { 
          icon: Person, 
          label: 'Last Name', 
          value: profile?.last_name,
          category: 'personal',
          description: 'Your legal last name'
        }
      ]
    },
    {
      title: 'Contact Details',
      icon: <Map />,
      fields: [
        { 
          icon: Email, 
          label: 'Email Address', 
          value: profile?.email,
          required: true,
          verification: profile?.is_verified ? 'verified' : 'unverified',
          description: 'Primary email for communication'
        },
        { 
          icon: Phone, 
          label: 'Phone Number', 
          value: profile?.phone_number,
          category: 'contact',
          description: 'Your contact number'
        },
        { 
          icon: Map, 
          label: 'Address', 
          value: profile?.address,
          category: 'contact',
          description: 'Your physical address'
        }
      ]
    }
  ];

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    const allFields = profileSections.flatMap(section => section.fields);
    const filledFields = allFields.filter(field => field.value && field.value.trim() !== '').length;
    return Math.round((filledFields / allFields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const getVerificationIcon = (verification) => {
    switch (verification) {
      case 'verified':
        return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'unverified':
        return <ErrorOutline sx={{ color: 'warning.main', fontSize: 20 }} />;
      default:
        return <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />;
    }
  };

  const getStatusConfig = (type) => {
    const configs = {
      active: {
        icon: <CheckCircle />,
        label: 'Active',
        description: 'Account is active and accessible',
        color: 'success',
        colorValue: theme.palette.success.main,
        gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
      },
      verified: {
        icon: <VerifiedUser />,
        label: 'Verified',
        description: 'Email address is verified',
        color: 'info',
        colorValue: theme.palette.info.main,
        gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`
      },
      staff: {
        icon: profile?.is_superuser ? <Star /> : <AdminPanelSettings />,
        label: profile?.is_superuser ? 'Super Admin' : 'Staff',
        description: profile?.is_superuser ? 'Full system administrator' : 'Staff member with privileges',
        color: 'warning',
        colorValue: theme.palette.warning.main,
        gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
      }
    };
    return configs[type];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Profile Completion Card */}
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Profile Completion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your profile to unlock all features
            </Typography>
          </Box>
          <Chip 
            label={`${profileCompletion}%`} 
            color={profileCompletion === 100 ? 'success' : profileCompletion > 70 ? 'primary' : 'warning'}
            variant="filled"
            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
          />
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={profileCompletion}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }
          }}
        />
        
        {profileCompletion < 100 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {6 - Math.floor(profileCompletion / 16.67)} fields remaining to complete your profile
          </Typography>
        )}
      </Paper>

      {/* Profile Information Sections */}
      {profileSections.map((section, sectionIndex) => (
        <Paper 
          key={section.title}
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.background.paper
          }}
        >
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              {React.cloneElement(section.icon, { 
                sx: { color: 'primary.main', fontSize: 24 } 
              })}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.fields.filter(f => f.value).length} of {section.fields.length} fields completed
              </Typography>
            </Box>
          </Box>

          {/* Fields Grid */}
          <Grid container spacing={3}>
            {section.fields.map((field, fieldIndex) => (
              <Grid item xs={12} md={6} key={field.label}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    background: field.value ? alpha(theme.palette.primary.main, 0.02) : alpha(theme.palette.warning.main, 0.02),
                    '&:hover': {
                      border: `1px solid ${alpha(field.value ? theme.palette.primary.main : theme.palette.warning.main, 0.3)}`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(field.value ? theme.palette.primary.main : theme.palette.warning.main, 0.1)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Tooltip title={field.description}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(field.value ? theme.palette.primary.main : theme.palette.warning.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <field.icon sx={{ 
                            color: field.value ? 'primary.main' : 'warning.main', 
                            fontSize: 22
                          }} />
                        </Box>
                      </Tooltip>
                      
                      <Box flex={1} sx={{ minWidth: 0 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                            {field.label}
                          </Typography>
                          {field.required && (
                            <Chip 
                              label="Required" 
                              size="small" 
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          )}
                        </Box>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 500,
                            color: field.value ? 'text.primary' : 'text.secondary',
                            fontStyle: field.value ? 'normal' : 'italic',
                            wordBreak: 'break-word'
                          }}
                        >
                          {field.value || 'Not provided'}
                        </Typography>
                        
                        {field.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {field.description}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ flexShrink: 0 }}>
                        {getVerificationIcon(field.verification)}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      {/* Account Status Section */}
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.5)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <Security sx={{ color: 'warning.main', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              Account Status & Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current account configuration and access levels
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {[
            { type: 'active', condition: profile?.is_active },
            { type: 'verified', condition: profile?.is_verified },
            { type: 'staff', condition: profile?.is_staff || profile?.is_superuser }
          ].map(({ type, condition }) => {
            const config = getStatusConfig(type);
            return (
              <Grid item xs={12} md={4} key={type}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    background: condition ? alpha(config.colorValue, 0.05) : alpha(theme.palette.grey[500], 0.05),
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${alpha(condition ? config.colorValue : theme.palette.grey[500], 0.15)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: condition ? config.gradient : `linear-gradient(135deg, ${theme.palette.grey[400]}, ${theme.palette.grey[600]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 24px ${alpha(condition ? config.colorValue : theme.palette.grey[500], 0.3)}`
                      }}
                    >
                      {React.cloneElement(config.icon, { 
                        sx: { color: 'white', fontSize: 30 } 
                      })}
                    </Box>
                    
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {condition ? config.label : `Not ${config.label}`}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {condition ? config.description : `Account ${config.label.toLowerCase()} status is inactive`}
                    </Typography>
                    
                    <Chip 
                      label={condition ? 'Active' : 'Inactive'} 
                      color={condition ? config.color : 'default'}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Additional Security Info */}
        <Box 
          sx={{ 
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock fontSize="small" />
            Security Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(profile?.is_verified ? theme.palette.success.main : theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {profile?.is_verified ? (
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <Warning sx={{ color: 'warning.main', fontSize: 20 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="600">
                    Email Verification
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {profile?.is_verified ? 'Verified and secure' : 'Pending verification'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(profile?.is_active ? theme.palette.success.main : theme.palette.error.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {profile?.is_active ? (
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <ErrorOutline sx={{ color: 'error.main', fontSize: 20 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="600">
                    Account Status
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {profile?.is_active ? 'Active and accessible' : 'Suspended or inactive'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileView;