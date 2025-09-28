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
  Tooltip,
  useTheme,
  alpha
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
  CloudUpload
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
      return { label: 'Super Admin', color: 'error', icon: <Star /> };
    }
    if (profile?.is_staff) {
      return { label: 'Staff', color: 'primary', icon: <Verified /> };
    }
    return { label: 'User', color: 'default', icon: <Person /> };
  };

  const getStatusBadge = () => {
    if (profile?.is_active) {
      return { label: 'Active', color: 'success', variant: 'filled' };
    }
    return { label: 'Inactive', color: 'error', variant: 'filled' };
  };

  const roleBadge = getRoleBadge();
  const statusBadge = getStatusBadge();

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        mb: 3, 
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
        }
      }}
    >
      <Box 
        display="flex" 
        alignItems="center" 
        flexDirection={{ xs: 'column', md: 'row' }} 
        gap={4}
      >
        {/* Profile Image Section */}
        <Box position="relative" sx={{ flexShrink: 0 }}>
          <Avatar
            src={imagePreview || profile?.profile_image}
            sx={{
              width: 140,
              height: 140,
              border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              fontSize: '3rem',
              '& img': {
                objectFit: 'cover'
              },
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.4),
                transform: editing ? 'scale(1.05)' : 'none'
              }
            }}
          >
            {!imagePreview && !profile?.profile_image && (
              <Person sx={{ fontSize: 60, color: theme.palette.primary.main }} />
            )}
          </Avatar>
          
          {/* Edit Image Button */}
          {editing && (
            <>
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
                    transition: 'all 0.2s ease',
                    boxShadow: 3,
                    width: 48,
                    height: 48
                  }}
                  disabled={imageLoading}
                >
                  {imageLoading ? (
                    <CloudUpload />
                  ) : (
                    <CameraAlt />
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
                      transition: 'all 0.2s ease',
                      boxShadow: 3,
                      width: 40,
                      height: 40
                    }}
                    disabled={imageLoading}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>

        {/* Profile Information Section */}
        <Box flex={1} sx={{ minWidth: 0 }}>
          {/* Name and Username */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                color: theme.palette.text.primary,
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.2
              }}
            >
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.username
              }
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              @{profile?.username}
            </Typography>
            
            {/* Role and Status Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                icon={roleBadge.icon}
                label={roleBadge.label}
                color={roleBadge.color}
                variant="outlined"
                size="small"
              />
              <Chip
                label={statusBadge.label}
                color={statusBadge.color}
                variant={statusBadge.variant}
                size="small"
              />
            </Stack>
          </Box>

          {/* Contact Information */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5
              }}
            >
              {profile?.email}
            </Typography>
            
            {profile?.phone_number && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {profile.phone_number}
              </Typography>
            )}
          </Box>

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
                fontWeight: 600,
                minWidth: 160
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
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              Change Password
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Additional Info Bar */}
      <Box 
        sx={{ 
          mt: 3,
          pt: 3,
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Member since: {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'N/A'}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Last login: {profile?.last_login ? new Date(profile.last_login).toLocaleDateString() : 'N/A'}
        </Typography>
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
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            zIndex: 1
          }}
        >
          <Box textAlign="center">
            <Typography variant="h6" color="primary" gutterBottom>
              Uploading Image...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we update your profile picture
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ProfileHeader;