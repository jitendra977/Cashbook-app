import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, IconButton,
  Avatar, Menu, MenuItem, Divider, ListItemIcon, ListItemText,
  CircularProgress, Badge, Tooltip, Chip, alpha, useTheme,
  Drawer, List, ListItem, ListItemButton, InputBase, Paper,
  Fade, Collapse, ClickAwayListener,
} from '@mui/material';
import {
  Settings, Logout, Person, Store, AccountBalance, Menu as MenuIcon,
  Dashboard, Receipt, TrendingUp, Notifications, ChevronLeft,
  Search, DarkMode, LightMode, Language, HelpOutline,
  KeyboardArrowDown, Close,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api/users';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('FinanceHub');
  const [cashbookName, setCashbookName] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  
  const { logout, user, isAuthenticated, validateAuth } = useAuth();
  const { storeId, cashbookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const navItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/', badge: null },
    { label: 'Transactions', icon: <Receipt />, path: '/transactions', badge: 12 },
    { label: 'Analytics', icon: <TrendingUp />, path: '/analytics', badge: null },
  ];

  const notifications = [
    { id: 1, title: 'New transaction', message: 'Payment received: $500', time: '5m ago', unread: true },
    { id: 2, title: 'Monthly report', message: 'Your analytics are ready', time: '1h ago', unread: true },
    { id: 3, title: 'System update', message: 'New features available', time: '2h ago', unread: false },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return setLoading(false);
      
      try {
        await validateAuth();
        const profile = await usersAPI.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Profile fetch failed:', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setUserProfile(user);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (storeId || cashbookId) fetchContextNames();
    else { setStoreName('FinanceHub'); setCashbookName(null); }
  }, [storeId, cashbookId]);

  const fetchContextNames = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      if (!token) return;

      let url = cashbookId 
        ? `${baseUrl}/transactions/by-cashbook/?cashbook=${cashbookId}&page_size=1`
        : `${baseUrl}/transactions/by-store/?store=${storeId}&page_size=1`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const tx = (data?.results?.[0] || data?.[0]);
        if (tx?.store_name) setStoreName(tx.store_name);
        if (tx?.cashbook_name) setCashbookName(tx.cashbook_name);
      }
    } catch (error) {
      console.error('Failed to fetch context names:', error);
    }
  };

  const getFullImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${imagePath}`;
  }, []);

  const profile = userProfile || user;
  const getUserInitial = () => {
    if (profile?.first_name && profile?.last_name) 
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    return profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) 
      return `${profile.first_name} ${profile.last_name}`;
    return profile?.username || profile?.email?.split('@')[0] || 'User';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching:', searchQuery);
    setSearchOpen(false);
  };

  const handleThemeToggle = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const markAllAsRead = () => {
    console.log('Mark all notifications as read');
    setNotifAnchor(null);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ gap: { xs: 1, md: 2 }, py: 1, minHeight: { xs: 64, md: 70 } }}>
            {/* Mobile Menu */}
            <IconButton
              color="inherit"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
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
                  background: alpha('#fff', 0.15),
                  display: 'flex',
                  transition: 'all 0.3s',
                  '&:hover': { background: alpha('#fff', 0.25), transform: 'scale(1.05)' }
                }}
              >
                <Store sx={{ fontSize: 28 }} />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {storeName}
                </Typography>
                {cashbookName && (
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                    <AccountBalance sx={{ fontSize: 12 }} />
                    {cashbookName}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1, ml: 4 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    fontWeight: location.pathname === item.path ? 700 : 400,
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    position: 'relative',
                    background: location.pathname === item.path ? alpha('#fff', 0.15) : 'transparent',
                    '&:hover': { background: alpha('#fff', 0.12), transform: 'translateY(-2px)' },
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                  {item.badge && (
                    <Chip 
                      label={item.badge} 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        height: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        background: theme.palette.error.main,
                        color: 'white'
                      }} 
                    />
                  )}
                </Button>
              ))}
            </Box>

            {/* Context Chips */}
            {(storeId || cashbookId) && (
              <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1, mr: 1 }}>
                {cashbookId && cashbookName && (
                  <Chip
                    icon={<AccountBalance sx={{ fontSize: 14 }} />}
                    label={cashbookName}
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.25),
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'white' },
                    }}
                  />
                )}
              </Box>
            )}

            {/* Search */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              {searchOpen ? (
                <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                  <Paper
                    component="form"
                    onSubmit={handleSearch}
                    sx={{
                      p: '2px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 250,
                      background: alpha('#fff', 0.95),
                      borderRadius: 2,
                    }}
                  >
                    <InputBase
                      sx={{ ml: 1, flex: 1, fontSize: 14 }}
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <IconButton size="small" onClick={() => setSearchOpen(false)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Paper>
                </ClickAwayListener>
              ) : (
                <Tooltip title="Search">
                  <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
                    <Search />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Theme Toggle */}
            <Tooltip title="Toggle theme">
              <IconButton color="inherit" onClick={handleThemeToggle} sx={{ display: { xs: 'none', md: 'flex' } }}>
                {themeMode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              PaperProps={{
                sx: { 
                  width: 360, 
                  maxHeight: 400,
                  mt: 1.5,
                  borderRadius: 2,
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                <Button size="small" onClick={markAllAsRead}>Mark all read</Button>
              </Box>
              <Divider />
              {notifications.map((notif) => (
                <MenuItem 
                  key={notif.id} 
                  sx={{ 
                    py: 1.5, 
                    borderLeft: notif.unread ? `3px solid ${theme.palette.primary.main}` : 'none',
                    bgcolor: notif.unread ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                  }}
                >
                  <ListItemText
                    primary={notif.title}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                        <Typography variant="caption" color="text.disabled">{notif.time}</Typography>
                      </>
                    }
                  />
                </MenuItem>
              ))}
            </Menu>

            {/* User Menu */}
            {loading ? (
              <CircularProgress size={32} color="inherit" />
            ) : (
              <Tooltip title="Account">
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ 
                    p: 0.5,
                    border: `2px solid ${alpha('#fff', 0.3)}`,
                    '&:hover': { 
                      border: `2px solid ${alpha('#fff', 0.5)}`,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Avatar 
                    sx={{ width: 36, height: 36, fontWeight: 'bold' }}
                    src={getFullImageUrl(profile?.profile_image)}
                  >
                    {getUserInitial()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}

            {/* User Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: { 
                  minWidth: 240,
                  mt: 1.5,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar src={getFullImageUrl(profile?.profile_image)} sx={{ width: 48, height: 48 }}>
                    {getUserInitial()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{getUserDisplayName()}</Typography>
                    <Typography variant="caption" color="text.secondary">{profile?.email}</Typography>
                  </Box>
                </Box>
                {profile?.role && (
                  <Chip label={profile.role} size="small" color="primary" sx={{ fontWeight: 600 }} />
                )}
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><HelpOutline fontSize="small" /></ListItemIcon>
                <ListItemText>Help & Support</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => { setAnchorEl(null); logout(); navigate('/login'); }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Store color="primary" />
            <Typography variant="h6" fontWeight="bold">FinanceHub</Typography>
          </Box>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <ChevronLeft />
          </IconButton>
        </Box>
        <Divider />
        
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={getFullImageUrl(profile?.profile_image)} sx={{ width: 48, height: 48 }}>
            {getUserInitial()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">{getUserDisplayName()}</Typography>
            <Typography variant="caption" color="text.secondary">{profile?.email}</Typography>
          </Box>
        </Box>
        <Divider />

        <List sx={{ px: 1, py: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileDrawerOpen(false); }}
                selected={location.pathname === item.path}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {item.badge && <Chip label={item.badge} size="small" color="primary" />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        
        <List sx={{ px: 1, mt: 'auto' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { navigate('/settings'); setMobileDrawerOpen(false); }}>
              <ListItemIcon sx={{ minWidth: 40 }}><Settings /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { logout(); navigate('/login'); }} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 40 }}><Logout color="error" /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;