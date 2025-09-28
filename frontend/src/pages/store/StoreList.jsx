import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField,
  Alert, CircularProgress, Card, CardContent, Grid,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Tooltip, Fab, alpha, useTheme
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Store,
  People, ReceiptLong, CalendarToday, Search
} from '@mui/icons-material';
import { useStore } from '../../context/StoreContext'

const StoreList = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // ✅ Using context methods - corrected to match context
  const {
    stores,
    loading,
    error,
    fetchStores, // Use fetchStores instead of refreshStores
    createStore,
    updateStore,
    deleteStore,
    clearError
  } = useStore();

  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: ''
  });

  // ✅ Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ✅ Filter stores based on search term
  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveStore = async () => {
    try {
      clearError(); // Clear any previous errors
      if (selectedStore) {
        await updateStore(selectedStore.id, formData);
        setSuccess('Store updated successfully!');
      } else {
        await createStore(formData);
        setSuccess('Store created successfully!');
      }
      closeDialog();
      // No need to call fetchStores again as context handles state updates
    } catch (err) {
      console.error('Error saving store:', err);
      // Error is handled by context
    }
  };

  const handleDeleteStore = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        clearError(); // Clear any previous errors
        await deleteStore(id);
        setSuccess('Store deleted successfully!');
        // No need to call fetchStores again as context handles state updates
      } catch (err) {
        console.error('Error deleting store:', err);
        // Error is handled by context
      }
    }
  };

  const openEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name || ''
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedStore(null);
    setFormData({ name: '' });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStore(null);
    setFormData({ name: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && stores.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" gutterBottom>
              📊 Stores
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your stores and their details
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={openCreate}
            size="large"
          >
            Add New Store
          </Button>
        </Box>
      </Paper>

      {/* SEARCH BAR */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          placeholder="Search stores by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{ 
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> 
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {filteredStores.length} store(s) found
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

      {/* STORES GRID */}
      {filteredStores.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No stores found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first store'}
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
              Create Your First Store
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredStores.map((store) => (
            <Grid item xs={12} sm={6} lg={4} key={store.id}>
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
                  {/* STORE HEADER */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {store.name}
                    </Typography>
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>

                  {/* STORE METADATA */}
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(store.created_at)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Updated: {formatDate(store.updated_at)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ACTION BUTTONS */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/stores/${store.id}`)}
                      variant="outlined"
                    >
                      View Details
                    </Button>

                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit Store">
                        <IconButton 
                          onClick={() => openEdit(store)} 
                          size="small"
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Store">
                        <IconButton 
                          onClick={() => handleDeleteStore(store.id, store.name)} 
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
          {selectedStore ? 'Edit Store' : 'Create New Store'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Store Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            placeholder="Enter store name..."
            helperText="Store name must be unique"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveStore} 
            variant="contained"
            disabled={!formData.name.trim() || loading}
          >
            {selectedStore ? 'Update Store' : 'Create Store'}
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

export default StoreList;