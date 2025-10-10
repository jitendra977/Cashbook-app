// src/pages/About.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  Divider,
  alpha,
  useTheme,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccountBalanceWallet,
  Security,
  Speed,
  Group,
  TrendingUp,
  MobileFriendly,
  Cloud,
  Support,
  CheckCircle,
  GitHub,
  Language,
  Email,
  Business,
  People,
  Rocket,
  Star,
  WorkspacePremium,
  AutoGraph,
  LockPerson,
  Update,
  SupportAgent
} from '@mui/icons-material';

const About = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <AccountBalanceWallet />,
      title: 'Smart Expense Tracking',
      description: 'Automatically categorize and track your expenses with intelligent algorithms.',
      color: 'primary'
    },
    {
      icon: <Security />,
      title: 'Bank-Level Security',
      description: 'Your financial data is encrypted and protected with enterprise-grade security.',
      color: 'success'
    },
    {
      icon: <Speed />,
      title: 'Lightning Fast',
      description: 'Quick transactions entry and instant search across your financial history.',
      color: 'warning'
    },
    {
      icon: <TrendingUp />,
      title: 'Advanced Analytics',
      description: 'Beautiful charts and insights to understand your spending patterns.',
      color: 'info'
    },
    {
      icon: <MobileFriendly />,
      title: 'Cross-Platform',
      description: 'Access your cashbook anywhere, anytime on all your devices.',
      color: 'secondary'
    },
    {
      icon: <Cloud />,
      title: 'Cloud Sync',
      description: 'Automatic backup and sync across all your connected devices.',
      color: 'primary'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users', icon: <People /> },
    { number: '2M+', label: 'Transactions', icon: <AccountBalanceWallet /> },
    { number: '15+', label: 'Countries', icon: <Language /> },
    { number: '99.9%', label: 'Uptime', icon: <Cloud /> }
  ];

  const appInfo = {
    version: '2.4.1',
    releaseDate: 'December 2024',
    developer: 'Cashbook Team',
    website: 'https://cashbook.app',
    support: 'support@cashbook.app'
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          About Cashbook
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Your intelligent financial companion for tracking expenses, managing budgets, and achieving financial goals.
        </Typography>
      </Box>

      {/* App Info Card */}
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Cashbook Financial Manager
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              A comprehensive financial management application designed to help individuals and small 
              businesses track expenses, manage budgets, and gain insights into their financial health.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Update color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Version" 
                      secondary={appInfo.version}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Developer" 
                      secondary={appInfo.developer}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Language color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Website" 
                      secondary={
                        <Button 
                          size="small" 
                          href={appInfo.website} 
                          target="_blank"
                          sx={{ p: 0, minWidth: 'auto' }}
                        >
                          Visit Site
                        </Button>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SupportAgent color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Support" 
                      secondary={
                        <Button 
                          size="small" 
                          href={`mailto:${appInfo.support}`}
                          sx={{ p: 0, minWidth: 'auto' }}
                        >
                          Email Us
                        </Button>
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <AccountBalanceWallet sx={{ fontSize: 60 }} />
              </Avatar>
              <Chip 
                label={`Version ${appInfo.version}`} 
                color="primary" 
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Released {appInfo.releaseDate}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Card 
              elevation={0}
              sx={{
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {React.cloneElement(stat.icon, { 
                    sx: { fontSize: 30, color: 'primary.main' } 
                  })}
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="h6" color="text.primary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom color="primary.main" sx={{ mb: 2 }}>
          Why Choose Cashbook?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Powerful features designed to make financial management simple and effective
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={feature.title}>
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette[feature.color].main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    {React.cloneElement(feature.icon, { 
                      sx: { fontSize: 40, color: `${feature.color}.main` } 
                    })}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Mission & Values */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              background: alpha(theme.palette.primary.main, 0.02),
              height: '100%'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Our Mission
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              To democratize financial management by providing powerful, accessible tools that help 
              everyone achieve financial clarity and control.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We believe that understanding your finances should be simple, secure, and available 
              to everyone, regardless of their financial knowledge or background.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              background: alpha(theme.palette.success.main, 0.02),
              height: '100%'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom color="success.main">
              Our Values
            </Typography>
            <List>
              {[
                'Transparency in everything we do',
                'Security as our top priority',
                'Simplicity in design and function',
                'Accessibility for all users',
                'Continuous improvement and innovation'
              ].map((value, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={value} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* CTA Section */}
      <Paper 
        elevation={0}
        sx={{
          p: 6,
          borderRadius: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white'
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ready to Take Control of Your Finances?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Join thousands of users who have transformed their financial management with Cashbook
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<Rocket />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.9)
              }
            }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<GitHub />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.1)
              }
            }}
          >
            View Source
          </Button>
        </Stack>
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Cashbook
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Making financial management simple, secure, and accessible for everyone.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<Email />} color="inherit" href={`mailto:${appInfo.support}`}>
                Contact
              </Button>
              <Button startIcon={<Business />} color="inherit" href={appInfo.website} target="_blank">
                Website
              </Button>
              <Button startIcon={<GitHub />} color="inherit" href="https://github.com/cashbook" target="_blank">
                GitHub
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" textAlign="right">
              © 2024 Cashbook. All rights reserved.<br />
              Built with ❤️ for the global community.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default About;