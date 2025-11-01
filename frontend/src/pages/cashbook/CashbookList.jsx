// src/pages/cashbook/CashbookList.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import SummaryCards from '../../components/transactions/SummaryCards';
import MonthlyChart from '../../components/transactions/MonthlyChart';
import CategoryChart from '../../components/transactions/CategoryChart';
import QuickAction from '../../components/transactions/QuickAction';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/transactions/ErrorMessage';
import '../../components/css/transactions/Dashboard.css';
import {
  Box, Paper, Typography, Button, TextField,
  Alert, CircularProgress, Card, CardContent, Grid,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Tooltip, Fab, alpha, useTheme,
  Breadcrumbs, Link, Divider
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, ReceiptLong,
  Search, CalendarToday, AccountBalance, Store,
  NavigateNext
} from '@mui/icons-material';
import { useStore } from '../../context/StoreContext';

const CashbookList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { storeId } = useParams();

  // ✅ Using context methods
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
    storeUsers,
    deleteCashbook,
    clearError
  } = useStore();

  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCashbook, setSelectedCashbook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: ''
  });

  // ✅ Fetch store and cashbooks on component mount
  useEffect(() => {
    if (storeId) {
      fetchStore(storeId);
      fetchStoreCashbooks(storeId);
    }
  }, [storeId, fetchStore, fetchStoreCashbooks]);

  // ✅ Get current store details, fallback to "Unknown Store" if not found
  const currentStoreData = currentStore || stores.find(store => store.id === parseInt(storeId)) || { name: "Unknown Store" };

  // ✅ Filter cashbooks based on search term
  const filteredCashbooks = cashbooks.filter(cashbook =>
    cashbook.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals for filtered cashbooks
  const totalTransactions = filteredCashbooks.reduce(
    (sum, cb) => sum + (cb.transaction_count ?? 0), 0
  );
  const totalBalance = filteredCashbooks.reduce(
    (sum, cb) => sum + (typeof cb.balance === "number" ? cb.balance : 0), 0
  );

  const handleSaveCashbook = async () => {
    try {
      clearError();
      if (selectedCashbook) {
        await updateCashbook(selectedCashbook.id, formData);
        setSuccess('Cashbook updated successfully!');
      } else {
        await createCashbook({
          ...formData,
          store: parseInt(storeId)
        });
        setSuccess('Cashbook created successfully!');
      }
      closeDialog();
      fetchStoreCashbooks(storeId); // Refresh the list
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
        fetchStoreCashbooks(storeId); // Refresh the list
      } catch (err) {
        console.error('Error deleting cashbook:', err);
      }
    }
  };

  const openEdit = (cashbook) => {
    setSelectedCashbook(cashbook);
    setFormData({
      name: cashbook.name || ''
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedCashbook(null);
    setFormData({ name: '' });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedCashbook(null);
    setFormData({ name: '' });
  };

  const handleViewTransactions = (cashbookId) => {
    navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !currentStoreData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading cashbooks...
        </Typography>
      </Box>
    );
  }

  if (!currentStoreData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Store not found or you don't have access to this store.
        </Alert>
        <Button 
          sx={{ mt: 2 }} 
          onClick={() => navigate('/stores')}
          startIcon={<Store />}
        >
          Back to Stores
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* BREADCRUMB NAVIGATION */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          color="inherit"
          onClick={() => navigate('/stores')}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          Stores
        </Link>
        <Link
          color="inherit"
          onClick={() => navigate(`/stores/${storeId}`)}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {currentStoreData.name}
        </Link>
        <Typography color="text.primary">Cashbooks</Typography>
      </Breadcrumbs>

      {/* HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <Store sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" gutterBottom>
                  {currentStoreData.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage cashbooks and track financial transactions
                </Typography>
              </Box>
            </Box>
            <Chip 
              icon={<AccountBalance />} 
              label="Cashbooks Management" 
              variant="outlined" 
              sx={{ mt: 1 }}
            />
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={openCreate}
            size="large"
          >
            New Cashbook
          </Button>
        </Box>
      </Paper>

      {/* TOTALS SUMMARY */}
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.07)} 0%, ${alpha(theme.palette.secondary.main, 0.07)} 100%)`
        }}
      >
        <Typography variant="h6">
          Total Transactions: <strong>{totalTransactions}</strong>
        </Typography>
        <Typography variant="h6">
          Total Balance: <strong style={{ color: totalBalance >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
            ${totalBalance.toFixed(2)}
          </strong>
        </Typography>
      </Paper>

      {/* SEARCH BAR */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          placeholder="Search cashbooks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {filteredCashbooks.length} cashbook(s) found
        </Typography>
      </Box>

      {/* ERROR ALERT */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* CASHBOOKS GRID */}
      {filteredCashbooks.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <ReceiptLong sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No cashbooks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first cashbook'}
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
              Create Your First Cashbook
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCashbooks.map((cashbook) => (
            <Grid item xs={12} sm={6} lg={4} key={cashbook.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* CASHBOOK HEADER */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {cashbook.name}
                    </Typography>
                    <Chip
                      label={cashbook.is_active ? "Active" : "Inactive"}
                      color={cashbook.is_active ? "success" : "default"}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* CASHBOOK METADATA */}
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <Store sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Store: {cashbook.store_name || currentStoreData.name}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(cashbook.created_at)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <AccountBalance sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Balance: {typeof cashbook.balance === "number" ? `$${cashbook.balance.toFixed(2)}` : "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Updated: {formatDate(cashbook.updated_at)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* STATISTICS */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 3,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      borderColor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary">
                          Transactions
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {cashbook.transaction_count ?? 0}
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary">
                          Balance
                        </Typography>
                        <Typography variant="h6" color={cashbook.balance >= 0 ? "success.main" : "error.main"}>
                          ${typeof cashbook.balance === "number" ? cashbook.balance.toFixed(2) : "0.00"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* ACTION BUTTONS */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      size="small"
                      startIcon={<ReceiptLong />}
                      onClick={() => handleViewTransactions(cashbook.id)}
                      variant="contained"
                    >
                      View Transactions
                    </Button>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit Cashbook">
                        <IconButton
                          onClick={() => openEdit(cashbook)}
                          size="small"
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Cashbook">
                        <IconButton
                          onClick={() => handleDeleteCashbook(cashbook.id, cashbook.name)}
                          size="small"
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedCashbook ? 'Edit Cashbook' : 'Create New Cashbook'}
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
            helperText="Cashbook name must be unique within this store"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCashbook} 
            variant="contained"
            disabled={!formData.name.trim() || loading}
          >
            {selectedCashbook ? 'Update Cashbook' : 'Create Cashbook'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FLOATING ACTION BUTTON FOR MOBILE */}
      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          display: { xs: 'flex', md: 'none' } 
        }}
        onClick={openCreate}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default CashbookList;