// src/pages/cashbook/CashbookList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField,
  Alert, CircularProgress, Card, CardContent, Grid,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Tooltip, Fab, alpha, useTheme,
  Breadcrumbs, Link, Divider, Menu, MenuItem,
  FormControlLabel, Switch, Zoom, Fade
} from '@mui/material';
import {
  Add, Edit, Delete, ReceiptLong,
  Search, CalendarToday, AccountBalance, Store,
  NavigateNext, MoreVert, Sort,
  Download, Refresh,
  TrendingUp, TrendingDown, AttachMoney,
  People, Analytics, Speed
} from '@mui/icons-material';
import { useStore } from '../../context/StoreContext';

// Enhanced Cashbook Card Component
const CashbookCard = ({ 
  cashbook, 
  storeName, 
  onEdit, 
  onDelete, 
  onViewTransactions,
  onShare,
  onExport 
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [hovered, setHovered] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Calculate balance safely
  const balance = cashbook.current_balance !== undefined && cashbook.current_balance !== null
    ? parseFloat(cashbook.current_balance)
    : cashbook.initial_balance !== undefined && cashbook.initial_balance !== null
    ? parseFloat(cashbook.initial_balance)
    : 0;

  const transactionCount = cashbook.transaction_count || 0;

  const getPerformanceColor = (bal) => {
    if (bal > 1000) return theme.palette.success.main;
    if (bal > 0) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPerformanceIcon = (bal) => {
    if (bal > 1000) return <TrendingUp sx={{ fontSize: 16 }} />;
    if (bal > 0) return <TrendingUp sx={{ fontSize: 16, color: theme.palette.warning.main }} />;
    return <TrendingDown sx={{ fontSize: 16 }} />;
  };

  return (
    <Zoom in={true} style={{ transitionDelay: cashbook.id % 3 * 100 + 'ms' }}>
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: theme.shadows[16],
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
          '&::before': hovered ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '4px 4px 0 0'
          } : {}
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2
          }}
        >
          <Chip
            icon={getPerformanceIcon(balance)}
            label={cashbook.is_active ? "Active" : "Inactive"}
            color={cashbook.is_active ? "success" : "default"}
            size="small"
            variant="filled"
            sx={{
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              backgroundColor: cashbook.is_active 
                ? alpha(theme.palette.success.main, 0.15)
                : alpha(theme.palette.grey[500], 0.15)
            }}
          />
        </Box>

        <CardContent sx={{ p: 3, pb: 2 }}>
          {/* Header with Menu */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box sx={{ maxWidth: '70%' }}>
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.2
                }}
              >
                {cashbook.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {storeName}
              </Typography>
            </Box>
            
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: alpha(theme.palette.background.default, 0.6),
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>

          {/* Description */}
          {cashbook.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 2, fontStyle: 'italic' }}
            >
              {cashbook.description}
            </Typography>
          )}

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  Transactions
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  {transactionCount}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: alpha(getPerformanceColor(balance), 0.02),
                  borderColor: alpha(getPerformanceColor(balance), 0.1)
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  Balance
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: getPerformanceColor(balance)
                  }}
                >
                  ${balance.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Initial Balance Info */}
          {cashbook.initial_balance !== undefined && cashbook.initial_balance !== null && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Initial Balance: ${parseFloat(cashbook.initial_balance).toFixed(2)}
              </Typography>
            </Box>
          )}

          {/* Metadata */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <CalendarToday sx={{ fontSize: 14, mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(cashbook.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Speed sx={{ fontSize: 14, mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Updated: {new Date(cashbook.updated_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar for Usage */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Storage Usage
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.min((transactionCount / 1000) * 100, 100).toFixed(1)}%
              </Typography>
            </Box>
            <Box
              sx={{
                height: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.min((transactionCount / 1000) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: 2,
                  transition: 'width 0.5s ease-in-out'
                }}
              />
            </Box>
          </Box>
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ReceiptLong />}
            onClick={() => onViewTransactions(cashbook.id)}
            sx={{
              borderRadius: 2,
              py: 1,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[8]
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Manage Transactions
          </Button>
        </Box>

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
        >
          <MenuItem onClick={() => { onEdit(cashbook); handleMenuClose(); }}>
            <Edit sx={{ mr: 1, fontSize: 20 }} /> Edit Cashbook
          </MenuItem>
          <MenuItem onClick={() => { onShare(cashbook); handleMenuClose(); }}>
            <AttachMoney sx={{ mr: 1, fontSize: 20 }} /> Share Access
          </MenuItem>
          <MenuItem onClick={() => { onExport(cashbook); handleMenuClose(); }}>
            <Download sx={{ mr: 1, fontSize: 20 }} /> Export Data
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => { onDelete(cashbook.id, cashbook.name); handleMenuClose(); }}
            sx={{ color: theme.palette.error.main }}
          >
            <Delete sx={{ mr: 1, fontSize: 20 }} /> Delete Cashbook
          </MenuItem>
        </Menu>
      </Card>
    </Zoom>
  );
};

const CashbookList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { storeId } = useParams();

  const {
    stores,
    cashbooks,
    currentStore,
    loading,
    error,
    fetchStore,
    fetchStoreCashbooks,
    createCashbook,
    updateCashbook,
    fetchStoreUsers,
    deleteCashbook,
    clearError
  } = useStore();

  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCashbook, setSelectedCashbook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterActive, setFilterActive] = useState(true);
  const [storeUserCount, setStoreUserCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initial_balance: '0.00'
  });

  // Fetch store users count
  useEffect(() => {
    if (storeId) {
      fetchStore(storeId);
      fetchStoreCashbooks(storeId);
      
      // Fetch store users if function exists
      if (fetchStoreUsers) {
        fetchStoreUsers(storeId).then(users => {
          if (users && users.length !== undefined) {
            setStoreUserCount(users.length);
          }
        }).catch(err => {
          console.error('Error fetching store users:', err);
        });
      }
    }
  }, [storeId, fetchStore, fetchStoreCashbooks, fetchStoreUsers]);

  const currentStoreData = currentStore || stores.find(store => store.id === parseInt(storeId)) || { name: "Unknown Store" };

  // Enhanced filtering and sorting with correct balance calculation
  const filteredCashbooks = useMemo(() => {
    let filtered = cashbooks.filter(cashbook => {
      const matchesSearch = cashbook.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cashbook.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActive = filterActive ? cashbook.is_active : true;
      return matchesSearch && matchesActive;
    });

    // Sorting with correct balance handling
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance': {
          const balanceA = a.current_balance !== undefined && a.current_balance !== null
            ? parseFloat(a.current_balance)
            : a.initial_balance !== undefined && a.initial_balance !== null
            ? parseFloat(a.initial_balance)
            : 0;
          const balanceB = b.current_balance !== undefined && b.current_balance !== null
            ? parseFloat(b.current_balance)
            : b.initial_balance !== undefined && b.initial_balance !== null
            ? parseFloat(b.initial_balance)
            : 0;
          return balanceB - balanceA;
        }
        case 'transactions':
          return (b.transaction_count || 0) - (a.transaction_count || 0);
        case 'recent':
          return new Date(b.updated_at) - new Date(a.updated_at);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cashbooks, searchTerm, sortBy, filterActive]);

  // Enhanced statistics with correct calculations
  const statistics = useMemo(() => {
    const totalTransactions = filteredCashbooks.reduce(
      (sum, cb) => sum + (cb.transaction_count || 0), 0
    );
    
    // Calculate total balance correctly
    const totalBalance = filteredCashbooks.reduce((sum, cb) => {
      const balance = cb.current_balance !== undefined && cb.current_balance !== null
        ? parseFloat(cb.current_balance)
        : cb.initial_balance !== undefined && cb.initial_balance !== null
        ? parseFloat(cb.initial_balance)
        : 0;
      return sum + balance;
    }, 0);
    
    const activeCashbooks = filteredCashbooks.filter(cb => cb.is_active).length;
    const averageBalance = filteredCashbooks.length > 0 ? totalBalance / filteredCashbooks.length : 0;

    return {
      totalTransactions,
      totalBalance,
      activeCashbooks,
      averageBalance,
      totalCashbooks: filteredCashbooks.length
    };
  }, [filteredCashbooks]);

  const handleSaveCashbook = async () => {
    try {
      clearError();
      
      const cashbookData = {
        name: formData.name.trim(),
        store: parseInt(storeId),
        is_active: true
      };

      // Add optional fields
      if (formData.description && formData.description.trim()) {
        cashbookData.description = formData.description.trim();
      }
      
      if (formData.initial_balance) {
        cashbookData.initial_balance = parseFloat(formData.initial_balance) || 0;
        cashbookData.current_balance = parseFloat(formData.initial_balance) || 0;
      }

      if (selectedCashbook) {
        await updateCashbook(selectedCashbook.id, cashbookData);
        setSuccess('Cashbook updated successfully!');
      } else {
        await createCashbook(cashbookData);
        setSuccess('Cashbook created successfully!');
      }
      closeDialog();
      fetchStoreCashbooks(storeId);
    } catch (err) {
      console.error('Error saving cashbook:', err);
    }
  };

  const handleDeleteCashbook = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete all transactions in this cashbook.`)) {
      try {
        clearError();
        await deleteCashbook(id);
        setSuccess('Cashbook deleted successfully!');
        fetchStoreCashbooks(storeId);
      } catch (err) {
        console.error('Error deleting cashbook:', err);
      }
    }
  };

  const handleShareCashbook = (cashbook) => {
    console.log('Sharing cashbook:', cashbook);
    setSuccess(`Share options for "${cashbook.name}"`);
  };

  const handleExportCashbook = (cashbook) => {
    console.log('Exporting cashbook:', cashbook);
    setSuccess(`Exporting data for "${cashbook.name}"`);
  };

  const openEdit = (cashbook) => {
    setSelectedCashbook(cashbook);
    setFormData({
      name: cashbook.name || '',
      description: cashbook.description || '',
      initial_balance: cashbook.initial_balance !== undefined && cashbook.initial_balance !== null
        ? parseFloat(cashbook.initial_balance).toFixed(2)
        : '0.00'
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedCashbook(null);
    setFormData({ name: '', description: '', initial_balance: '0.00' });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedCashbook(null);
    setFormData({ name: '', description: '', initial_balance: '0.00' });
  };

  const handleViewTransactions = (cashbookId) => {
    navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`);
  };

  const handleRefresh = () => {
    fetchStoreCashbooks(storeId);
    if (fetchStoreUsers) {
      fetchStoreUsers(storeId).then(users => {
        if (users && users.length !== undefined) {
          setStoreUserCount(users.length);
        }
      });
    }
    setSuccess('Cashbooks refreshed successfully!');
  };

  if (loading && !currentStoreData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading cashbooks...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Enhanced Breadcrumb */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          color="inherit"
          onClick={() => navigate('/stores')}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          <Store sx={{ mr: 0.5, fontSize: 18 }} />
          Stores
        </Link>
        <Link
          color="inherit"
          onClick={() => navigate(`/stores/${storeId}`)}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {currentStoreData.name}
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          <ReceiptLong sx={{ mr: 0.5, fontSize: 18 }} />
          Cashbooks
        </Typography>
      </Breadcrumbs>

      {/* Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
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
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <AccountBalance sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
                  {currentStoreData.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Cashbook Management Dashboard
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                icon={<Analytics />} 
                label={`${statistics.totalCashbooks} Cashbooks`} 
                variant="filled"
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
              />
              <Chip 
                icon={<AttachMoney />} 
                label={`Total: $${statistics.totalBalance.toFixed(2)}`} 
                variant="filled"
                sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1) }}
              />
              <Chip 
                icon={<People />} 
                label={`${storeUserCount} Team Members`} 
                variant="filled"
                sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1) }}
              />
            </Box>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} size="large">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={openCreate}
              size="large"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8]
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              New Cashbook
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              textAlign: 'center'
            }}
          >
            <ReceiptLong sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {statistics.totalCashbooks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Cashbooks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              textAlign: 'center'
            }}
          >
            <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="success.main">
              ${statistics.totalBalance.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Balance
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              textAlign: 'center'
            }}
          >
            <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="info.main">
              {statistics.activeCashbooks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Cashbooks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
              textAlign: 'center'
            }}
          >
            <Analytics sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {statistics.totalTransactions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Transactions
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Controls Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Search cashbooks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          
          <Tooltip title="Sort By">
            <Button
              startIcon={<Sort />}
              onClick={() => {
                const sortOptions = ['name', 'balance', 'transactions', 'recent'];
                const currentIndex = sortOptions.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortBy(sortOptions[nextIndex]);
              }}
              variant="outlined"
              size="small"
            >
              Sort: {sortBy === 'name' ? 'Name' : sortBy === 'balance' ? 'Balance' : sortBy === 'transactions' ? 'Transactions' : 'Recent'}
            </Button>
          </Tooltip>

          <FormControlLabel
            control={
              <Switch
                checked={filterActive}
                onChange={(e) => setFilterActive(e.target.checked)}
                color="primary"
              />
            }
            label="Active Only"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            {filteredCashbooks.length} cashbook(s)
          </Typography>
          <Button
            startIcon={<Download />}
            variant="outlined"
            size="small"
          >
            Export All
          </Button>
        </Box>
      </Paper>

      {/* Error and Success Messages */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* Enhanced Cashbooks Grid */}
      {filteredCashbooks.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <ReceiptLong sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No cashbooks found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first cashbook'}
          </Typography>
          {!searchTerm && (
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={openCreate}
              size="large"
            >
              Create Your First Cashbook
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCashbooks.map((cashbook) => (
            <Grid item xs={12} sm={6} lg={4} key={cashbook.id}>
              <CashbookCard
                cashbook={cashbook}
                storeName={currentStoreData.name}
                onEdit={openEdit}
                onDelete={handleDeleteCashbook}
                onViewTransactions={handleViewTransactions}
                onShare={handleShareCashbook}
                onExport={handleExportCashbook}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Enhanced Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={closeDialog} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            {selectedCashbook ? 'Edit Cashbook' : 'Create New Cashbook'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCashbook ? 'Update your cashbook details' : 'Add a new cashbook to manage transactions'}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Store: <strong>{currentStoreData.name}</strong>
          </Typography>
          
          <TextField
            autoFocus
            fullWidth
            label="Cashbook Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            placeholder="Enter cashbook name..."
            helperText="Required: Give your cashbook a descriptive name"
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            placeholder="Describe the purpose of this cashbook..."
            multiline
            rows={3}
            helperText="Optional: Add a description for better organization"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Initial Balance"
            value={formData.initial_balance}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only numbers and decimal point
              if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setFormData({ ...formData, initial_balance: value });
              }
            }}
            margin="normal"
            placeholder="0.00"
            helperText="Optional: Starting balance for this cashbook"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={closeDialog} color="inherit" size="large">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCashbook} 
            variant="contained"
            disabled={!formData.name.trim() || loading}
            size="large"
            sx={{
              borderRadius: 2,
              px: 3
            }}
          >
            {loading ? 'Saving...' : selectedCashbook ? 'Update Cashbook' : 'Create Cashbook'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Floating Action Button */}
      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: theme.shadows[12]
          },
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={openCreate}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default CashbookList;