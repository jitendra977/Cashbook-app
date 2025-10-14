// src/pages/Stores/StoreListPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField, Alert,
  CircularProgress, Grid, Snackbar, Fab, alpha, useTheme,
  FormControl, InputLabel, Select, MenuItem, Avatar,
  IconButton, Tooltip, TablePagination
} from '@mui/material';
import {
  Add, Search, Download, Refresh, Store as StoreIcon
} from '@mui/icons-material';
import { useStore } from '../../context/StoreContext';
import StoreCard from '../../components/store/StoreCard';
import StoreForm from '../../components/store/StoreForm';

const StoreListPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    stores,
    loading,
    error,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
    clearError,
  } = useStore();

  // State
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Enhanced stores with favorites
  const enhancedStores = useMemo(() =>
    stores.map(store => ({
      ...store,
      isFavorite: store.isFavorite ?? false
    })),
    [stores]
  );

  // Filtered and sorted stores
  const filteredStores = useMemo(() => {
    let filtered = enhancedStores.filter(store => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        store.name.toLowerCase().includes(searchLower) ||
        (store.description && store.description.toLowerCase().includes(searchLower)) ||
        (store.address && store.address.toLowerCase().includes(searchLower)) ||
        (store.contact_number && store.contact_number.toLowerCase().includes(searchLower)) ||
        (store.email && store.email.toLowerCase().includes(searchLower)) ||
        (store.website && store.website.toLowerCase().includes(searchLower));

      const matchesStatus =
        filterStatus === 'all' || 
        (filterStatus === 'active' && store.is_active) ||
        (filterStatus === 'inactive' && !store.is_active);

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
        case 'created':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [enhancedStores, searchTerm, filterStatus, sortBy]);

  // Paginated stores
  const paginatedStores = useMemo(() =>
    filteredStores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredStores, page, rowsPerPage]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterStatus, sortBy]);

  // Handlers
  const handleSaveStore = async (formData) => {
    try {
      clearError();

      if (selectedStore) {
        await updateStore(selectedStore.id, formData);
        setSuccess('Store updated successfully!');
      } else {
        await createStore(formData);
        setSuccess('Store created successfully!');
      }
      closeDialog();
    } catch (err) {
      console.error('Error saving store:', err);
    }
  };

  const handleDeleteStore = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        clearError();
        await deleteStore(id);
        setSuccess('Store deleted successfully!');
      } catch (err) {
        console.error('Error deleting store:', err);
      }
    }
  };

  const handleToggleFavorite = (storeId) => {
    // TODO: Implement favorite toggle logic
    console.log('Toggle favorite:', storeId);
  };

  const openEdit = (store) => {
    setSelectedStore(store);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedStore(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStore(null);
  };

  // Calculate stats
  const activeStores = enhancedStores.filter(s => s.is_active).length;
  const favoriteStores = enhancedStores.filter(s => s.isFavorite).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={3}>
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 60,
                  height: 60
                }}
              >
                <StoreIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Store Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Manage your stores and their information
                </Typography>
              </Box>
            </Box>

            {/* Quick Stats */}
            <Box display="flex" gap={4} mt={3} flexWrap="wrap">
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stores.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Stores
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {activeStores}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Stores
                </Typography>
              </Box>
              {favoriteStores > 0 && (
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {favoriteStores}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Favorites
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              size="large"
            >
              Add Store
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Control Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          {/* Search */}
          <TextField
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          {/* Filters */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="date">Last Updated</MenuItem>
                <MenuItem value="created">Date Created</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchStores}
                disabled={loading}
                size="small"
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Success Snackbar */}
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

      {/* Stores Content */}
      {loading && stores.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : filteredStores.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No stores found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first store'}
          </Typography>
          {!searchTerm && filterStatus === 'all' && (
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
              Create Your First Store
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {/* Grid View */}
          <Grid container spacing={3}>
            {paginatedStores.map((store) => (
              <Grid item xs={12} sm={6} lg={4} key={store.id}>
                <StoreCard
                  store={store}
                  onEdit={openEdit}
                  onDelete={handleDeleteStore}
                  onView={(id) => navigate(`/stores/${id}/cashbooks`)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredStores.length > rowsPerPage && (
            <Box display="flex" justifyContent="center" mt={4}>
              <TablePagination
                component="div"
                count={filteredStores.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[9, 18, 36]}
              />
            </Box>
          )}
        </>
      )}

      {/* Store Form Dialog */}
      <StoreForm
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSaveStore}
        store={selectedStore}
        loading={loading}
      />

      {/* Floating Action Button (Mobile) */}
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

export default StoreListPage;