// src/components/profile/ProfileHeader.jsx
import React from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Grid,
  Tooltip,
  useTheme,
  alpha,
  LinearProgress,
  Fade
} from '@mui/material';
import {
  Edit,
  Close,
  Lock,
  Delete,
  CameraAlt,
  Person,
  Verified,
  Star,
  CloudUpload,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Security,
  AutoAwesome
} from '@mui/icons-material';

export const ProfileHeader = ({ 
  profile, 
  editing, 
  onEditToggle, 
  onPasswordChange, 
  onImageSelect, 
  onImageDelete,
  imagePreview,
  imageLoading = false
}) => {
  const theme = useTheme();

  const getRoleBadge = () => {
    if (profile?.is_superuser) {
      return { 
        label: 'Super Admin', 
        color: 'error', 
        icon: <Star />,
        gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
      };
    }
    if (profile?.is_staff) {
      return { 
        label: 'Staff', 
        color: 'primary', 
        icon: <Security />,
        gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
      };
    }
    return { 
      label: 'User', 
      color: 'default', 
      icon: <Person />,
      gradient: `linear-gradient(135deg, ${theme.palette.grey[500]}, ${theme.palette.grey[700]})`
    };
  };

  const getStatusBadge = () => {
    if (profile?.is_active) {
      return { 
        label: 'Active', 
        color: 'success', 
        variant: 'filled',
        gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
      };
    }
    return { 
      label: 'Inactive', 
      color: 'error', 
      variant: 'filled',
      gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
    };
  };

  const getVerificationBadge = () => {
    if (profile?.is_verified) {
      return { 
        label: 'Verified', 
        color: 'success', 
        icon: <Verified />,
        gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
      };
    }
    return { 
      label: 'Unverified', 
      color: 'warning', 
      icon: <Close />,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
    };
  };

  const roleBadge = getRoleBadge();
  const statusBadge = getStatusBadge();
  const verificationBadge = getVerificationBadge();

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return profile?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 0,
        mb: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          zIndex: 0
        }
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
          zIndex: 0
        }}
      />

      <Box position="relative" zIndex={1}>
        {/* Header Background Section */}
        <Box 
          sx={{ 
            height: 120,
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            px: 4,
            pb: 2
          }}
        >
          {/* Status Badges */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              ml: 'auto',
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}
          >
            <Chip
              icon={roleBadge.icon}
              label={roleBadge.label}
              sx={{
                background: roleBadge.gradient,
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'white' }
              }}
              size="small"
            />
            <Chip
              label={statusBadge.label}
              sx={{
                background: statusBadge.gradient,
                color: 'white',
                fontWeight: 600
              }}
              size="small"
            />
          </Stack>
        </Box>

        {/* Main Content */}
        <Box 
          sx={{ 
            px: 4,
            pb: 4,
            mt: -8
          }}
        >
          <Box 
            display="flex" 
            alignItems="flex-start" 
            flexDirection={{ xs: 'column', md: 'row' }} 
            gap={4}
          >
            {/* Profile Image Section */}
            <Box position="relative" sx={{ flexShrink: 0 }}>
              <Avatar
                src={imagePreview || profile?.profile_image}
                sx={{
                  width: 160,
                  height: 160,
                  border: `4px solid ${theme.palette.background.paper}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  fontSize: '3.5rem',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    transform: editing ? 'scale(1.02)' : 'none',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.2)'
                  }
                }}
              >
                {getInitials()}
              </Avatar>
              
              {/* Edit Image Button */}
              {editing && (
                <Fade in={editing}>
                  <Box>
                    <Tooltip title="Change profile picture">
                      <IconButton
                        component="label"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': { 
                            bgcolor: theme.palette.primary.dark,
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease',
                          boxShadow: 3,
                          width: 44,
                          height: 44
                        }}
                        disabled={imageLoading}
                      >
                        {imageLoading ? (
                          <CloudUpload fontSize="small" />
                        ) : (
                          <CameraAlt fontSize="small" />
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={onImageSelect}
                          disabled={imageLoading}
                        />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Remove Image Button */}
                    {(imagePreview || profile?.profile_image) && (
                      <Tooltip title="Remove profile picture">
                        <IconButton
                          onClick={onImageDelete}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: theme.palette.error.main,
                            color: 'white',
                            '&:hover': { 
                              bgcolor: theme.palette.error.dark,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.3s ease',
                            boxShadow: 3,
                            width: 36,
                            height: 36
                          }}
                          disabled={imageLoading}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Profile Information Section */}
            <Box flex={1} sx={{ minWidth: 0, mt: 2 }}>
              {/* Name and Username */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ 
                    color: theme.palette.text.primary,
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    lineHeight: 1.1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textFillColor: 'transparent'
                  }}
                >
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile?.username
                  }
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    @{profile?.username}
                  </Typography>
                  
                  <Chip
                    icon={verificationBadge.icon}
                    label={verificationBadge.label}
                    sx={{
                      background: verificationBadge.gradient,
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Contact Information Grid */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Email
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                          {profile?.email}
                        </Typography>
                      </Box>
                    </Box>

                    {profile?.phone_number && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Phone sx={{ color: 'info.main', fontSize: 20 }} />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Phone
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {profile.phone_number}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    {profile?.address && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 0.5
                          }}
                        >
                          <LocationOn sx={{ color: 'warning.main', fontSize: 20 }} />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Address
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {profile.address}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ flexWrap: 'wrap' }}
              >
                <Button
                  variant={editing ? "outlined" : "contained"}
                  onClick={onEditToggle}
                  startIcon={editing ? <Close /> : <Edit />}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    fontWeight: 700,
                    minWidth: 160,
                    background: editing ? 'transparent' : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    border: editing ? `2px solid ${theme.palette.primary.main}` : 'none',
                    '&:hover': {
                      background: editing ? alpha(theme.palette.primary.main, 0.1) : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {editing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={onPasswordChange}
                  startIcon={<Lock />}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    fontWeight: 600,
                    minWidth: 160,
                    borderWidth: 2,
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: theme.palette.secondary.dark,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Change Password
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Stats Bar */}
          <Box 
            sx={{ 
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3
            }}
          >
            {[
              { label: 'Member since', value: formatDate(profile?.date_joined), icon: <CalendarToday /> },
              { label: 'Last login', value: formatDate(profile?.last_login), icon: <AutoAwesome /> },
              { label: 'Profile updated', value: formatDate(profile?.updated_at), icon: <Edit /> }
            ].map((stat, index) => (
              <Box 
                key={stat.label}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {React.cloneElement(stat.icon, { 
                    sx: { color: 'primary.main', fontSize: 20 } 
                  })}
                </Box>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      display: 'block'
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.primary,
                      fontWeight: 700
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Loading Overlay */}
      {imageLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            zIndex: 2
          }}
        >
          <Box textAlign="center" sx={{ maxWidth: 300 }}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom fontWeight={600}>
              Uploading Image
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please wait while we update your profile picture
            </Typography>
            <LinearProgress 
              sx={{ 
                borderRadius: 2,
                height: 6,
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }} 
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ProfileHeader;