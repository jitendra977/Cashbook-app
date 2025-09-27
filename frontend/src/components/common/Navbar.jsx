import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Settings,
  Logout,
  Person,
} from '@mui/icons-material';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext'
const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await usersAPI.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Prepend your API base URL to the relative path
    const baseUrl = 'http://localhost:8000'; // Change this to your actual base URL
    return `${baseUrl}${imagePath}`;
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    console.log('Profile clicked');
  };

  const handleSettings = () => {
    handleMenuClose();
    console.log('Settings clicked');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const getUserInitial = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (userProfile?.username) {
      return userProfile.username[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return userProfile?.username || 'User';
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            My App
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button color="inherit">Home</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Contact</Button>
          </Box>

          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <IconButton
              onClick={handleMenuOpen}
              sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
            >
              <Avatar 
                sx={{ width: 32, height: 32 }}
                src={getFullImageUrl(userProfile?.profile_image)} // Use full URL
                alt={getUserDisplayName()}
              >
                {getUserInitial()}
              </Avatar>
            </IconButton>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200, mt: 1.5 }
            }}
          >
            {/* User Info with full image URL */}
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Avatar 
                  sx={{ width: 40, height: 40 }}
                  src={getFullImageUrl(userProfile?.profile_image)} // Use full URL
                >
                  {getUserInitial()}
                </Avatar>
              </ListItemIcon>
              <Box>
                <ListItemText 
                  primary={getUserDisplayName()} 
                  secondary={userProfile?.email}
                />
              </Box>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;