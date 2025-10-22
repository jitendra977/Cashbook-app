import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api/users';
import {
  Box, Drawer, Typography, Divider, Button, List, ListItemButton,
  ListItemIcon, ListItemText, Avatar, IconButton, Tooltip, useTheme,
  alpha, Paper, Chip, Badge, Fade, Zoom, Collapse, LinearProgress
} from '@mui/material';
import {
  Dashboard, People, Info, Logout, Settings, Analytics,
  Notifications, Menu, ChevronLeft, Business, VerifiedUser,
  AccountBalance, Api, Store, TrendingUp, ExpandLess, ExpandMore,
  FiberManualRecord
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;

const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return setLoading(false);
      try {
        const data = await usersAPI.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Profile fetch failed:', error);
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  const userProfile = profile || user;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
      color: '#667eea',
      badge: null
    },
    {
      text: 'Stores',
      icon: <Store />,
      path: '/stores',
      color: '#23ab55',
      badge: 5,
      subItems: [
        { text: 'All Stores', path: '/stores' },
        { text: 'Add Store', path: '/stores/add' }
      ]
    },
    {
      text: 'Analytics',
      icon: <Analytics />,
      path: '/analytics',
      color: '#fd7e14',
      badge: null,
      subItems: [
        { text: 'Overview', path: '/analytics' },
        { text: 'Reports', path: '/analytics/reports' }
      ]
    },
    {
      text: 'Users',
      icon: <People />,
      path: '/users',
      color: '#28a745',
      requiresAdmin: true
    },
    {
      text: 'Projects',
      icon: <Business />,
      path: '/projects',
      color: '#6f42c1'
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
      color: '#6c757d'
    },
    {
      text: 'API Docs',
      icon: <Api />,
      external: 'http://127.0.0.1:8000/swagger/',
      color: '#ff6b35'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.requiresAdmin || userProfile?.is_staff || userProfile?.is_superuser
  );

  const isActive = (path) => location.pathname === path;

  const toggleSubmenu = (text) => {
    setExpandedMenus(prev => ({ ...prev, [text]: !prev[text] }));
  };

  const handleNavigation = (item) => {
    if (item.external) {
      window.open(item.external, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.path);
      if (collapsed) setCollapsed(false);
    }
  };

  const getUserInitial = () => {
    if (userProfile?.first_name && userProfile?.last_name) 
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`;
    return userProfile?.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (userProfile?.is_superuser) return 'Super Admin';
    if (userProfile?.is_staff) return 'Admin';
    return 'User';
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

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
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        },
      }}
    >
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
        {/* Decorative Background */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 120, height: 120, borderRadius: '50%', background: alpha('#fff', 0.08) }} />
        <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 80, height: 80, borderRadius: '50%', background: alpha('#fff', 0.05) }} />

        {/* Header */}
        <Box sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {!collapsed && (
              <Fade in timeout={300}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Typography sx={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      💼
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>
                      CashBook
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>
                      Manager
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}
            
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'} arrow>
              <IconButton
                onClick={() => setCollapsed(!collapsed)}
                sx={{
                  color: 'white',
                  bgcolor: alpha('#fff', 0.15),
                  width: 40,
                  height: 40,
                  '&:hover': { bgcolor: alpha('#fff', 0.25), transform: 'scale(1.05)' },
                  transition: 'all 0.2s'
                }}
              >
                {collapsed ? <Menu fontSize="small" /> : <ChevronLeft fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* User Profile Card */}
          <Paper
            elevation={0}
            sx={{
              p: collapsed ? 1.5 : 2,
              bgcolor: alpha('#fff', 0.12),
              backdropFilter: 'blur(20px)',
              borderRadius: 2,
              border: `1px solid ${alpha('#fff', 0.2)}`,
              transition: 'all 0.3s',
              '&:hover': { bgcolor: alpha('#fff', 0.18), transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 1.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <Zoom in timeout={400}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4ade80', border: '2px solid white' }} />
                  }
                >
                  <Avatar
                    src={userProfile?.profile_image}
                    sx={{
                      width: collapsed ? 40 : 48,
                      height: collapsed ? 40 : 48,
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {getUserInitial()}
                  </Avatar>
                </Badge>
              </Zoom>

              {!collapsed && (
                <Fade in timeout={500}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, fontSize: 14 }} noWrap>
                        {userProfile?.username || 'User'}
                      </Typography>
                      {userProfile?.is_verified && (
                        <VerifiedUser sx={{ fontSize: 14, color: '#60a5fa' }} />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontSize: 11, display: 'block', mb: 1 }} noWrap>
                      {userProfile?.email}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip
                        label={getUserRole()}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 9,
                          fontWeight: 600,
                          bgcolor: (userProfile?.is_staff || userProfile?.is_superuser) ? 'rgba(34,197,94,0.9)' : 'rgba(156,163,175,0.9)',
                          color: 'white',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                      <Chip
                        label="Online"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 9,
                          fontWeight: 600,
                          bgcolor: 'rgba(34,197,94,0.9)',
                          color: 'white',
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

        <Divider sx={{ bgcolor: alpha('#fff', 0.2), mx: 2 }} />

        {/* Navigation Menu */}
        <Box sx={{ flex: 1, position: 'relative', zIndex: 1, overflowY: 'auto', mt: 1 }}>
          {loading && <LinearProgress sx={{ bgcolor: alpha('#fff', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} />}
          
          <List sx={{ px: 2 }}>
            {filteredMenuItems.map((item) => (
              <Box key={item.text}>
                <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                  <ListItemButton
                    onClick={() => item.subItems && !collapsed ? toggleSubmenu(item.text) : handleNavigation(item)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      minHeight: 44,
                      px: collapsed ? 1 : 2,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      bgcolor: isActive(item.path) ? alpha('#fff', 0.15) : 'transparent',
                      border: isActive(item.path) ? `1px solid ${alpha('#fff', 0.3)}` : '1px solid transparent',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.12),
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 'auto' : 36,
                        color: isActive(item.path) ? '#fff' : alpha('#fff', 0.85),
                        '& svg': { fontSize: 20 }
                      }}
                    >
                      <Badge badgeContent={item.badge} color="error" variant="dot" invisible={!item.badge}>
                        {item.icon}
                      </Badge>
                    </ListItemIcon>

                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: isActive(item.path) ? '#fff' : alpha('#fff', 0.9),
                              fontSize: 13,
                              fontWeight: isActive(item.path) ? 600 : 500
                            }
                          }}
                        />
                        {item.badge && (
                          <Chip label={item.badge} size="small" sx={{ height: 20, fontSize: 10, bgcolor: alpha('#dc3545', 0.9), color: 'white' }} />
                        )}
                        {item.subItems && (expandedMenus[item.text] ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {/* Submenu */}
                {item.subItems && !collapsed && (
                  <Collapse in={expandedMenus[item.text]} timeout="auto">
                    <List sx={{ pl: 2 }}>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.path}
                          onClick={() => navigate(subItem.path)}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            py: 0.75,
                            pl: 3,
                            bgcolor: isActive(subItem.path) ? alpha('#fff', 0.1) : 'transparent',
                            '&:hover': { bgcolor: alpha('#fff', 0.08) }
                          }}
                        >
                          <FiberManualRecord sx={{ fontSize: 8, mr: 1.5, color: alpha('#fff', 0.6) }} />
                          <ListItemText
                            primary={subItem.text}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontSize: 12,
                                color: alpha('#fff', 0.85),
                                fontWeight: isActive(subItem.path) ? 600 : 400
                              }
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>
        </Box>

        {/* Footer */}
        <Box sx={{ position: 'relative', zIndex: 1, p: 2 }}>
          <Divider sx={{ bgcolor: alpha('#fff', 0.2), mb: 2 }} />

          <Tooltip title={collapsed ? 'Notifications' : ''} placement="right">
            <IconButton
              sx={{
                color: alpha('#fff', 0.8),
                bgcolor: alpha('#fff', 0.1),
                mb: 1,
                width: collapsed ? 40 : '100%',
                height: 40,
                borderRadius: collapsed ? '50%' : 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 0 : 2,
                '&:hover': { bgcolor: alpha('#fff', 0.2) }
              }}
            >
              <Badge badgeContent={notifications} color="error">
                <Notifications sx={{ fontSize: 18 }} />
              </Badge>
              {!collapsed && (
                <Typography variant="body2" sx={{ ml: 1.5, fontSize: 13, fontWeight: 500 }}>
                  Notifications
                </Typography>
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
            <Button
              fullWidth={!collapsed}
              onClick={() => { logout(); navigate('/login'); }}
              startIcon={collapsed ? null : <Logout />}
              sx={{
                bgcolor: alpha('#dc3545', 0.9),
                color: '#fff',
                py: 1,
                minWidth: collapsed ? 40 : 'auto',
                borderRadius: collapsed ? '50%' : 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
                '&:hover': { bgcolor: '#c82333', transform: 'translateY(-1px)' },
                transition: 'all 0.2s'
              }}
            >
              {collapsed ? <Logout sx={{ fontSize: 18 }} /> : 'Logout'}
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;