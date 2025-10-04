import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Store,
} from '@mui/icons-material';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { storesAPI } from '../../api/stores';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('My App');
  const { logout } = useAuth();
  const { currentStore } = useStore();
  const { storeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Fetch store name when storeId changes or from context
    fetchStoreName();
  }, [storeId, currentStore]);

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

  const fetchStoreName = async () => {
    try {
      // If we have storeId from URL params, fetch store details
      if (storeId) {
        const store = await storesAPI.getStore(storeId); // You'll need to create this API method
        setStoreName(store.name);
      } 
      // If we have current store from context, use that
      else if (currentStore) {
        setStoreName(currentStore.name);
      }
      // Default fallback
      else {
        setStoreName('My App');
      }
    } catch (error) {
      console.error('Failed to fetch store name:', error);
      setStoreName('My App'); // Fallback to default
    }
  };

  // Function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const baseUrl = 'http://localhost:8000';
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
    navigate('/profile');
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
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Store fontSize="small" />
            {storeName}
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
                src={getFullImageUrl(userProfile?.profile_image)}
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
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Avatar 
                  sx={{ width: 40, height: 40 }}
                  src={getFullImageUrl(userProfile?.profile_image)}
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