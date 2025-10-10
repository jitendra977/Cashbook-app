/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  Badge,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon as ListItemIconBase,
  ListItemText as ListItemTextBase,
} from '@mui/material';
import {
  Settings,
  Logout,
  Person,
  Store,
  AccountBalance,
  Home,
  Info,
  ContactMail,
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  TrendingUp,
  Notifications,
  ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('FinanceHub');
  const [cashbookName, setCashbookName] = useState(null);
  
  const { logout, user } = useAuth();
  const { storeId, cashbookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Fetch user profile
  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  // Fetch store and cashbook names
  useEffect(() => {
    if (storeId || cashbookId) {
      fetchContextNames();
    } else {
      setStoreName('FinanceHub');
      setCashbookName(null);
    }
  }, [storeId, cashbookId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      } else {
        setUserProfile(user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const fetchContextNames = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

      let url;
      if (storeId && cashbookId) {
        url = `${baseUrl}/transactions/by-cashbook/?cashbook=${cashbookId}&page_size=1`;
      } else if (storeId) {
        url = `${baseUrl}/transactions/by-store/?store=${storeId}&page_size=1`;
      } else if (cashbookId) {
        url = `${baseUrl}/transactions/by-cashbook/?cashbook=${cashbookId}&page_size=1`;
      }

      if (url) {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const transactions = data?.results || (Array.isArray(data) ? data : []);

          if (transactions.length > 0) {
            const tx = transactions[0];
            if (tx.store_name) {
              setStoreName(tx.store_name);
            }
            if (tx.cashbook_name) {
              setCashbookName(tx.cashbook_name);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch context names:', error);
    }
  };

  // Get full image URL
  const getFullImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${imagePath}`;
  }, []);

  // Menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  // User display helpers
  const getUserInitial = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (userProfile?.username) {
      return userProfile.username[0].toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (userProfile?.username) {
      return userProfile.username;
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'User';
  };

  // Check if route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Navigation items
  const navItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/' },
    { label: 'Transactions', icon: <Receipt />, path: '/transactions' },
    { label: 'Analytics', icon: <TrendingUp />, path: '/analytics' },
    { label: 'About', icon: <Info />, path: '/about' },
    { label: 'Contact', icon: <ContactMail />, path: '/contact' },
  ];

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ gap: 2, py: 1 }}>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ 
                display: { md: 'none' },
                mr: 1
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo/Brand Section */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                cursor: 'pointer',
                flexGrow: { xs: 1, md: 0 }
              }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: alpha('#fff', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Store sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: '800', 
                    lineHeight: 1.2,
                    background: 'linear-gradient(45deg, #fff 30%, #e0e0e0 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {storeName}
                </Typography>
                {cashbookName && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      color: alpha('#fff', 0.8),
                      fontWeight: 500
                    }}
                  >
                    <AccountBalance fontSize="inherit" />
                    {cashbookName}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Navigation Links - Hidden on mobile */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 0.5, 
              flexGrow: 1, 
              ml: 4,
              alignItems: 'center'
            }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    fontWeight: isActiveRoute(item.path) ? '700' : '400',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    minWidth: 'auto',
                    backgroundColor: isActiveRoute(item.path) ? alpha('#fff', 0.15) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.1),
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Context Chips */}
            {(storeId || cashbookId) && (
              <Box sx={{ 
                display: { xs: 'none', lg: 'flex' }, 
                gap: 1, 
                mr: 2,
                alignItems: 'center'
              }}>
                {storeId && storeName !== 'FinanceHub' && (
                  <Chip
                    icon={<Store sx={{ fontSize: 16 }} />}
                    label={storeName}
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.15),
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-icon': { color: 'white' },
                      borderRadius: 1.5,
                    }}
                  />
                )}
                {cashbookId && cashbookName && (
                  <Chip
                    icon={<AccountBalance sx={{ fontSize: 16 }} />}
                    label={cashbookName}
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.25),
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'white' },
                      borderRadius: 1.5,
                    }}
                  />
                )}
              </Box>
            )}

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" sx={{ ml: 1 }}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            {loading ? (
              <CircularProgress size={32} color="inherit" />
            ) : (
              <Tooltip title="Account menu">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ 
                    ml: 1,
                    '&:hover': { 
                      backgroundColor: alpha('#fff', 0.15),
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                    border: `2px solid ${alpha('#fff', 0.2)}`,
                  }}
                >
                  <Badge 
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: alpha('#fff', 0.2),
                        fontWeight: 'bold',
                      }}
                      src={getFullImageUrl(userProfile?.profile_image)}
                      alt={getUserDisplayName()}
                    >
                      {getUserInitial()}
                    </Avatar>
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* User Menu Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 8,
                sx: { 
                  minWidth: 280,
                  mt: 1.5,
                  borderRadius: 2,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.15))',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 12,
                    height: 12,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* User Info Section */}
              <MenuItem onClick={handleProfile} sx={{ py: 2 }}>
                <ListItemIcon>
                  <Avatar 
                    sx={{ width: 48, height: 48, fontWeight: 'bold' }}
                    src={getFullImageUrl(userProfile?.profile_image)}
                  >
                    {getUserInitial()}
                  </Avatar>
                </ListItemIcon>
                <Box sx={{ ml: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getUserDisplayName()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userProfile?.email || 'No email'}
                  </Typography>
                  {userProfile?.role && (
                    <Chip 
                      label={userProfile.role} 
                      size="small" 
                      color="primary" 
                      sx={{ mt: 0.5, fontWeight: 600 }}
                    />
                  )}
                </Box>
              </MenuItem>

              <Divider />

              {/* Menu Options */}
              <MenuItem onClick={handleProfile} sx={{ borderRadius: 1, mx: 1, my: 0.5 }}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText>My Profile</ListItemText>
              </MenuItem>

              <MenuItem onClick={handleSettings} sx={{ borderRadius: 1, mx: 1, my: 0.5 }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>

              <Divider />

              <MenuItem 
                onClick={handleLogout} 
                sx={{ 
                  borderRadius: 1, 
                  mx: 1, 
                  my: 0.5,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  }
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Store color="primary" />
            <Typography variant="h6" fontWeight="bold">
              FinanceHub
            </Typography>
          </Box>
          <IconButton onClick={handleMobileDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <Divider />

        {/* User Info in Drawer */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar 
              sx={{ width: 48, height: 48, fontWeight: 'bold' }}
              src={getFullImageUrl(userProfile?.profile_image)}
            >
              {getUserInitial()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {getUserDisplayName()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.email}
              </Typography>
            </Box>
          </Box>

          {/* Context Chips in Drawer */}
          {(storeId || cashbookId) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {storeId && storeName !== 'FinanceHub' && (
                <Chip
                  icon={<Store sx={{ fontSize: 16 }} />}
                  label={storeName}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {cashbookId && cashbookName && (
                <Chip
                  icon={<AccountBalance sx={{ fontSize: 16 }} />}
                  label={cashbookName}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
          )}
        </Box>

        <Divider />

        {/* Navigation in Drawer */}
        <List sx={{ px: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActiveRoute(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                }}
              >
                <ListItemIconBase sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIconBase>
                <ListItemTextBase primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Drawer Footer Actions */}
        <List sx={{ px: 1, mt: 'auto' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleSettings}>
              <ListItemIconBase sx={{ minWidth: 40 }}>
                <Settings />
              </ListItemIconBase>
              <ListItemTextBase primary="Settings" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIconBase sx={{ minWidth: 40 }}>
                <Logout color="error" />
              </ListItemIconBase>
              <ListItemTextBase primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;