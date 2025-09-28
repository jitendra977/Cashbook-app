import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, redirect } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StoreList from '../../pages/store/StoreList';
import {
  Box,
  Drawer,
  Typography,
  Divider,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Chip,
  Badge,
  Fade,
  Zoom,
  Skeleton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Business as BusinessIcon,
  VerifiedUser as VerifiedUserIcon,
  Circle as CircleIcon,
  AccountBalance as Cashbook,
  Api as ApiIcon,
  Store as StoreIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;

const Sidebar = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [userDisplayData, setUserDisplayData] = useState({
    username: '',
    email: '',
    profile_image: '',
    is_staff: false,
    is_superuser: false,
    is_verified: false
  });

  // Update user display data when user changes
  useEffect(() => {
    if (user) {
      setUserDisplayData({
        username: user.username || 'User',
        email: user.email || 'user@example.com',
        profile_image: user.profile_image || '',
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false,
        is_verified: user.is_verified || false
      });
    } else {
      // Try to get from localStorage as fallback
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserDisplayData({
            username: parsedUser.username || 'User',
            email: parsedUser.email || 'user@example.com',
            profile_image: parsedUser.profile_image || '',
            is_staff: parsedUser.is_staff || false,
            is_superuser: parsedUser.is_superuser || false,
            is_verified: parsedUser.is_verified || false
          });
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      color: '#667eea',
      requiresAdmin: false
    },
    {
      text: 'Cashbook',
      icon: <StoreIcon />,
      path: '/stores',
      color: '#23ab55ff',
      requiresAdmin: false
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      color: '#28a745',
      requiresAdmin: true
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      color: '#fd7e14',
      requiresAdmin: false
    },
    {
      text: 'Projects',
      icon: <BusinessIcon />,
      path: '/projects',
      color: '#6f42c1',
      requiresAdmin: false
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      color: '#6c757d',
      requiresAdmin: false
    },
    {
      text: 'About',
      icon: <InfoIcon />,
      path: '/about',
      color: '#17a2b8',
      requiresAdmin: false
    },
    {
      text: 'API DOC',
      icon: <ApiIcon />,  // Fixed icon reference
      external: "http://127.0.0.1:8000/swagger/",  // Use 'external' instead of 'redirect'
      color: '#ff6b35',
      requiresAdmin: false
    }
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiresAdmin) {
      // Check both user object and userDisplayData
      const isAdmin = userDisplayData.is_superuser || userDisplayData.is_staff ||
        userDisplayData.username === 'admin';
      return isAdmin;
    }
    return true;
  });

  const isActive = (path) => location.pathname === path;

  // Show loading skeleton while auth is loading
  if (loading) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={60} />
          <Skeleton variant="circular" width={40} height={40} sx={{ mt: 2 }} />
          <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
          <Skeleton variant="text" width="80%" />
        </Box>
      </Drawer>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.1),
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.05),
          zIndex: 0
        }}
      />

      {/* Enhanced Header */}
      <Box sx={{ p: 2, position: 'relative', zIndex: 1 }}>
        {/* Header with Logo and Toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            position: 'relative'
          }}
        >
          {/* Logo Section */}
          <Fade in={!collapsed} timeout={300}>
            <Box
              sx={{
                display: collapsed ? 'none' : 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              {/* Logo Icon with Animation */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  animation: 'logoFloat 3s ease-in-out infinite',
                  '@keyframes logoFloat': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-2px) rotate(1deg)' }
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  💼
                </Typography>
              </Box>

              {/* Brand Text */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    fontSize: '18px',
                    lineHeight: 1.2,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  CashBook
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha('#ffffff', 0.8),
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                >
                  Manager
                </Typography>
              </Box>
            </Box>
          </Fade>

          {/* Toggle Button */}
          <Tooltip
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            placement="bottom"
            arrow
          >
            <IconButton
              onClick={toggleCollapsed}
              sx={{
                color: 'white',
                bgcolor: alpha('#ffffff', 0.15),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#ffffff', 0.2)}`,
                width: 44,
                height: 44,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.25),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }
              }}
            >
              <Box
                sx={{
                  transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
              </Box>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Enhanced User Profile Card */}
        <Paper
          elevation={0}
          sx={{
            p: collapsed ? 1.5 : 2.5,
            bgcolor: alpha('#ffffff', 0.12),
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: `1px solid ${alpha('#ffffff', 0.2)}`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: alpha('#ffffff', 0.18),
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 2,
              justifyContent: collapsed ? 'center' : 'flex-start'
            }}
          >
            {/* Enhanced Avatar with Status */}
            <Box sx={{ position: 'relative' }}>
              <Zoom in timeout={400}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: collapsed ? 12 : 14,
                        height: collapsed ? 12 : 14,
                        borderRadius: '50%',
                        bgcolor: '#4ade80',
                        border: '2px solid white',
                        animation: 'pulse 2s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' }
                        }
                      }}
                    />
                  }
                >
                  <Avatar
                    src={userDisplayData.profile_image || ''}
                    sx={{
                      bgcolor: userDisplayData.profile_image ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      width: collapsed ? 40 : 50,
                      height: collapsed ? 40 : 50,
                      fontSize: collapsed ? '16px' : '20px',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                      border: '3px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)'
                      }
                    }}
                  >
                    {!userDisplayData.profile_image && (userDisplayData.username?.[0]?.toUpperCase() || 'U')}
                  </Avatar>
                </Badge>
              </Zoom>
            </Box>

            {/* User Info - Only shown when not collapsed */}
            {!collapsed && (
              <Fade in={!collapsed} timeout={500}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {/* Username with Verification Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      {userDisplayData.username}
                    </Typography>
                    {userDisplayData.is_verified && (
                      <Tooltip title="Verified User" arrow>
                        <VerifiedUserIcon
                          sx={{
                            fontSize: '16px',
                            color: '#60a5fa',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {/* Email */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha('#ffffff', 0.85),
                      fontSize: '12px',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 400,
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#60a5fa'
                      },
                      transition: 'color 0.2s ease'
                    }}
                    onClick={() => window.open(`mailto:${userDisplayData.email}`)}
                  >
                    {userDisplayData.email}
                  </Typography>

                  {/* Role and Status Chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={userDisplayData.is_staff || userDisplayData.is_superuser ? 'Admin' : 'User'}
                      size="small"
                      icon={
                        (userDisplayData.is_staff || userDisplayData.is_superuser) ? (
                          <VerifiedUserIcon sx={{ fontSize: '12px !important' }} />
                        ) : (
                          <CircleIcon sx={{ fontSize: '8px !important' }} />
                        )
                      }
                      sx={{
                        height: '20px',
                        fontSize: '10px',
                        fontWeight: 600,
                        bgcolor: (userDisplayData.is_staff || userDisplayData.is_superuser)
                          ? 'rgba(34, 197, 94, 0.9)'
                          : 'rgba(156, 163, 175, 0.9)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiChip-label': { px: 1 },
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />

                    <Chip
                      label="Online"
                      size="small"
                      sx={{
                        height: '20px',
                        fontSize: '10px',
                        fontWeight: 600,
                        bgcolor: 'rgba(34, 197, 94, 0.9)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ bgcolor: alpha('#ffffff', 0.2), mx: 2 }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, position: 'relative', zIndex: 1, mt: 1 }}>
        <List sx={{ px: 2 }}>
          {filteredMenuItems.map((item) => (
            <Tooltip
              key={item.path || item.external}
              title={collapsed ? item.text : ''}
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={() => {
                  if (item.external) {
                    // Open external URL in new tab
                    window.open(item.external, '_blank', 'noopener,noreferrer');
                  } else {
                    // Internal navigation
                    navigate(item.path);
                  }
                }}
                component="a"
                href={item.redirect || undefined}
                target={item.redirect ? "_blank" : undefined}
                rel={item.redirect ? "noopener noreferrer" : undefined}
                {...(!item.redirect && { component: NavLink, to: item.path })}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 48,
                  px: collapsed ? 1 : 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  bgcolor: isActive(item.path)
                    ? alpha('#ffffff', 0.15)
                    : 'transparent',
                  border: isActive(item.path)
                    ? `1px solid ${alpha('#ffffff', 0.3)}`
                    : '1px solid transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.1),
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root': {
                      color: '#fff'
                    }
                  },
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '3px',
                    bgcolor: isActive(item.path) ? '#fff' : 'transparent',
                    borderRadius: '0 2px 2px 0'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 'auto' : 40,
                    color: isActive(item.path) ? '#fff' : alpha('#ffffff', 0.8),
                    mr: collapsed ? 0 : 1,
                    '& svg': { fontSize: '20px' }
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: isActive(item.path) ? '#fff' : alpha('#ffffff', 0.9),
                        fontSize: '14px',
                        fontWeight: isActive(item.path) ? 600 : 500,
                        letterSpacing: '0.5px'
                      }
                    }}
                  />
                )}
                {!collapsed && isActive(item.path) && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#fff',
                      boxShadow: '0 0 8px rgba(255,255,255,0.6)'
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ position: 'relative', zIndex: 1, p: 2 }}>
        <Divider sx={{ bgcolor: alpha('#ffffff', 0.2), mb: 2 }} />

        {/* Notifications */}
        <Tooltip title={collapsed ? 'Notifications' : ''} placement="right">
          <IconButton
            sx={{
              color: alpha('#ffffff', 0.8),
              bgcolor: alpha('#ffffff', 0.1),
              mb: 1,
              width: collapsed ? '40px' : '100%',
              height: '40px',
              borderRadius: collapsed ? '50%' : 2,
              '&:hover': {
                bgcolor: alpha('#ffffff', 0.2),
                color: '#fff'
              }
            }}
          >
            <NotificationsIcon sx={{ fontSize: '18px' }} />
            {!collapsed && (
              <Typography
                variant="body2"
                sx={{ ml: 1, fontSize: '13px', fontWeight: 500 }}
              >
                Notifications
              </Typography>
            )}
          </IconButton>
        </Tooltip>

        {/* Logout Button */}
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <Button
            fullWidth={!collapsed}
            onClick={handleLogout}
            startIcon={collapsed ? null : <LogoutIcon />}
            sx={{
              bgcolor: alpha('#dc3545', 0.9),
              color: '#fff',
              py: collapsed ? 1 : 1.2,
              px: collapsed ? 1 : 2,
              minWidth: collapsed ? '40px' : 'auto',
              borderRadius: collapsed ? '50%' : 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
              '&:hover': {
                bgcolor: '#c82333',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(220, 53, 69, 0.4)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {collapsed ? <LogoutIcon sx={{ fontSize: '18px' }} /> : 'Logout'}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflow: 'hidden'
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;