// src/components/profile/ProfileHeader.jsx
import React, { useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Badge,
  Fab,
  Chip,
  LinearProgress,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Edit, 
  Cancel, 
  PhotoCamera, 
  Delete,
  Security
} from '@mui/icons-material';

const ProfileHeader = ({ 
  profile, 
  editing, 
  onEditToggle, 
  onPasswordChange, 
  onImageSelect,
  onImageDelete,
  imagePreview 
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    const fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'profile_image'];
    const completedFields = fields.filter(field => profile[field]);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        borderRadius: 4,
        p: 4,
        mb: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
          zIndex: 0
        }}
      />

      <Box position="relative" zIndex={1}>
        {/* Top section with title and actions */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Profile Settings
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Manage your account information and preferences
            </Typography>
            
            {/* Profile completion */}
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Profile Completion: {getCompletionPercentage()}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getCompletionPercentage()} 
                sx={{ 
                  flex: 1, 
                  maxWidth: 200,
                  bgcolor: alpha('#fff', 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#fff'
                  }
                }} 
              />
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Security />}
              onClick={onPasswordChange}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.8)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Change Password
            </Button>
            
            <Button
              variant={editing ? "outlined" : "contained"}
              startIcon={editing ? <Cancel /> : <Edit />}
              onClick={onEditToggle}
              sx={{
                bgcolor: editing ? 'transparent' : 'rgba(255,255,255,0.2)',
                borderColor: editing ? 'rgba(255,255,255,0.5)' : 'transparent',
                color: 'white',
                '&:hover': {
                  bgcolor: editing ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                },
                minWidth: 120
              }}
              size="large"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Stack>
        </Box>

        {/* Profile image and user info */}
        <Box display="flex" alignItems="center" gap={4}>
          {/* Profile Image */}
          <Box position="relative">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                editing && (
                  <Tooltip title="Change Profile Picture">
                    <Fab
                      size="small"
                      color="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        boxShadow: 4,
                        '&:hover': { transform: 'scale(1.1)' },
                        transition: 'transform 0.2s'
                      }}
                    >
                      <PhotoCamera />
                    </Fab>
                  </Tooltip>
                )
              }
            >
              <Avatar
                src={imagePreview || profile.profile_image}
                sx={{ 
                  width: 120, 
                  height: 120,
                  fontSize: '2.5rem',
                  border: '4px solid rgba(255,255,255,0.3)',
                  boxShadow: 4,
                  bgcolor: alpha('#fff', 0.2)
                }}
              >
                {!(imagePreview || profile.profile_image) && 
                  getInitials(profile.first_name, profile.last_name, profile.username)
                }
              </Avatar>
            </Badge>
            
            {editing && (imagePreview || profile.profile_image) && (
              <Tooltip title="Remove Picture">
                <Fab
                  size="small"
                  color="error"
                  onClick={onImageDelete}
                  sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    boxShadow: 4,
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'transform 0.2s'
                  }}
                >
                  <Delete />
                </Fab>
              </Tooltip>
            )}
          </Box>

          {/* User Info */}
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile.first_name && profile.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile.username
              }
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              @{profile.username}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              {profile.email}
            </Typography>
            
            {/* Status badges */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip 
                label={profile.is_active ? 'Active' : 'Inactive'}
                color={profile.is_active ? 'success' : 'error'}
                size="small"
                sx={{ color: 'white' }}
              />
              {profile.is_staff && (
                <Chip 
                  label="Staff" 
                  color="info" 
                  size="small"
                  sx={{ color: 'white' }}
                />
              )}
              {profile.is_verified && (
                <Chip 
                  label="Verified" 
                  color="success" 
                  size="small"
                  sx={{ color: 'white' }}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onImageSelect}
        style={{ display: 'none' }}
      />
    </Paper>
  );
};

export default ProfileHeader;