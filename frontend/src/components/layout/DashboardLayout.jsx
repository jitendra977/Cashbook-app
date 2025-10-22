import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import {
  Box,
  Container,
  Fab,
  Zoom,
  Breadcrumbs,
  Link,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Collapse,
  Alert,
  alpha,
  useTheme,
  useMediaQuery,
  Slide,
} from '@mui/material';
import {
  KeyboardArrowUp,
  Brightness4,
  Brightness7,
  Fullscreen,
  FullscreenExit,
  NavigateNext,
  Close,
  Home,
} from '@mui/icons-material';

export const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [mainContentRef, setMainContentRef] = useState(null);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef) {
        setShowScrollTop(mainContentRef.scrollTop > 300);
      }
    };

    if (mainContentRef) {
      mainContentRef.addEventListener('scroll', handleScroll);
      return () => mainContentRef.removeEventListener('scroll', handleScroll);
    }
  }, [mainContentRef]);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        label: path.charAt(0).toUpperCase() + path.slice(1),
        path: currentPath,
      });
    });
    
    return breadcrumbs;
  };

  const handleScrollTop = () => {
    if (mainContentRef) {
      mainContentRef.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Implement your theme toggle logic here
    console.log('Theme toggled:', !isDarkMode);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: isDarkMode ? '#0a0e27' : '#f5f7fa',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Navbar */}
        <Navbar />

        {/* Alert Banner */}
        <Slide direction="down" in={showAlert} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'relative', zIndex: 10 }}>
            <Alert
              severity="info"
              icon={false}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowAlert(false)}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              }
              sx={{
                borderRadius: 0,
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                🎉 Welcome back! You have 3 new notifications and 2 pending tasks.
              </Typography>
            </Alert>
          </Box>
        </Slide>

        {/* Breadcrumbs & Actions Bar */}
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 2,
            borderRadius: 0,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: alpha(theme.palette.text.primary, 0.4),
              },
            }}
          >
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={crumb.path}
                underline="hover"
                color={index === breadcrumbs.length - 1 ? 'primary' : 'inherit'}
                href={crumb.path}
                onClick={(e) => {
                  e.preventDefault();
                  // Handle navigation if needed
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: 14,
                  fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {index === 0 && <Home sx={{ fontSize: 16 }} />}
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Toggle Theme" arrow>
              <IconButton
                size="small"
                onClick={toggleTheme}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} arrow>
              <IconButton
                size="small"
                onClick={toggleFullscreen}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Main Content with Advanced Styling */}
        <Box
          ref={setMainContentRef}
          component="main"
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            bgcolor: isDarkMode ? '#0a0e27' : '#f5f7fa',
            backgroundImage: isDarkMode
              ? 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.03), transparent 50%), radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.05), transparent 50%)'
              : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05), transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03), transparent 50%)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: '10px',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.5),
              },
            },
          }}
        >
          {/* Content Container */}
          <Container
            maxWidth="xl"
            sx={{
              py: 4,
              px: { xs: 2, sm: 3, md: 4 },
              minHeight: '100%',
            }}
          >
            {/* Animated Content Wrapper */}
            <Box
              sx={{
                animation: 'fadeInUp 0.5s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {children}
            </Box>
          </Container>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              right: 0,
              width: '400px',
              height: '400px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </Box>

        {/* Floating Action Buttons */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 1000,
          }}
        >
          {/* Scroll to Top */}
          <Zoom in={showScrollTop}>
            <Fab
              size="medium"
              color="primary"
              onClick={handleScrollTop}
              sx={{
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.6)',
                },
                transition: 'all 0.3s',
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Zoom>
        </Box>

        {/* Loading Overlay (Optional) */}
        {/* You can add a loading overlay here if needed */}
      </Box>
    </Box>
  );
};