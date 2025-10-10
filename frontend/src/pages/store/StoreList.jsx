import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField,
  Alert, CircularProgress, Card, CardContent, Grid,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Tooltip, Fab, alpha, useTheme,
  Menu, MenuItem, FormControl, InputLabel, Select,
  Avatar, CardActions, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Checkbox
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Store,
  Search, MoreVert, Star, StarBorder,
  Email, Phone, Public, Share, Download,
  Archive, Refresh, QrCode2, LocationOn
} from '@mui/icons-material';
import { useStore } from '../../context/StoreContext';

// Enhanced Store Card Component
const StoreCard = ({ store, onEdit, onDelete, onView, onToggleFavorite }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Card
      onClick={() => onView(store.id)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
          borderColor: alpha(theme.palette.primary.main, 0.4)
        }
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" gap={2} flex={1} minWidth={0}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 50, height: 50 }}>
              <Store sx={{ fontSize: 28 }} />
            </Avatar>
            <Box minWidth={0} flex={1}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.name}
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                <Chip label={`ID: ${store.id}`} size="small" variant="outlined" />
                <Chip
                  label={`OWNER: ${store.store_owner ? `${store.store_owner.first_name} ${store.store_owner.last_name}` : 'N/A'}`}
                  size="small"
                  variant="outlined"
                />
                <Chip label={`CASHBOOKS: ${store.cashbook_count || 0}`} size="small" color="primary" />
              </Box>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(store.id); }}
              sx={{
                bgcolor: store.isFavorite ? alpha(theme.palette.warning.main, 0.15) : 'transparent',
                '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.25) }
              }}
            >
              {store.isFavorite ? <Star sx={{ color: theme.palette.warning.main }} /> : <StarBorder />}
            </IconButton>

            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* DESCRIPTION */}
        {store.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {store.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* CONTACT INFO */}
        <Box display="flex" flexDirection="column" gap={1}>
          {store.address && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {store.address}
              </Typography>
            </Box>
          )}
          {store.phone && (
            <Box display="flex" alignItems="center" gap={1}>
              <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">{store.phone}</Typography>
            </Box>
          )}
          {store.email && (
            <Box display="flex" alignItems="center" gap={1}>
              <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">{store.email}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* STATUS & UPDATED */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            label={store.status || 'Active'}
            size="small"
            color={store.status === 'Active' ? 'success' : store.status === 'Inactive' ? 'default' : 'warning'}
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            Created: {store.updated_at ? new Date(store.created_at).toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Updated: {store.updated_at ? new Date(store.updated_at).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>
      </CardContent>

      {/* CARD ACTIONS */}
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button size="small" variant="outlined" startIcon={<Visibility />} fullWidth onClick={(e) => { e.stopPropagation(); onView(store.id); }}>View</Button>
        <Button size="small" variant="outlined" startIcon={<Edit />} fullWidth onClick={(e) => { e.stopPropagation(); onEdit(store); }}>Edit</Button>
      </CardActions>

      {/* CONTEXT MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { onEdit(store); handleMenuClose(); }}><Edit sx={{ mr: 1 }} /> Edit Store</MenuItem>
        <MenuItem onClick={() => { onView(store.id); handleMenuClose(); }}><Visibility sx={{ mr: 1 }} /> View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}><Share sx={{ mr: 1 }} /> Share Store</MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(store.id, store.name); handleMenuClose(); }} sx={{ color: 'error.main' }}><Delete sx={{ mr: 1 }} /> Delete Store</MenuItem>
      </Menu>
    </Card>
  );
};

const StoreList = () => {
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

  // State Management
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedStores, setSelectedStores] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    status: 'Active'
  });

  // Enhanced store data with favorites
  const enhancedStores = useMemo(() =>
    stores.map(store => ({
      ...store,
      isFavorite: store.isFavorite ?? false
    })), [stores]
  );

  // Filtered and Sorted Stores
  const filteredStores = useMemo(() => {
    let filtered = enhancedStores.filter(store => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = store.name.toLowerCase().includes(searchLower) ||
        (store.description && store.description.toLowerCase().includes(searchLower)) ||
        (store.address && store.address.toLowerCase().includes(searchLower)) ||
        (store.email && store.email.toLowerCase().includes(searchLower));

      return matchesSearch;
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(store => (store.status || 'Active') === filterStatus);
    }

    // Sorting
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

  // Paginated Stores
  const paginatedStores = useMemo(() =>
    filteredStores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredStores, page, rowsPerPage]
  );

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterStatus, sortBy]);

  const handleSaveStore = async () => {
    try {
      clearError();

      // Validate required fields
      if (!formData.name.trim()) {
        return;
      }

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
    // Implement favorite toggle logic
    console.log('Toggle favorite:', storeId);
  };

  const openEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name || '',
      description: store.description || '',
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      website: store.website || '',
      status: store.status || 'Active'
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedStore(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      status: 'Active'
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStore(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      status: 'Active'
    });
  };

  // Calculate stats
  const activeStores = enhancedStores.filter(s => (s.status || 'Active') === 'Active').length;
  const favoriteStores = enhancedStores.filter(s => s.isFavorite).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* ENHANCED HEADER */}
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
                <Store sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
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
            <Button
              variant="outlined"
              startIcon={<Download />}
            >
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

      {/* CONTROL BAR */}
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

          {/* Filters and Controls */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
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

            <Box display="flex" gap={1}>
              <Tooltip title="Grid View">
                <IconButton
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <Box component="span" fontSize="18px">⏹️</Box>
                </IconButton>
              </Tooltip>
              <Tooltip title="List View">
                <IconButton
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                >
                  <Box component="span" fontSize="18px">📋</Box>
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              startIcon={<Refresh />}
              onClick={fetchStores}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* BULK ACTIONS */}
      {selectedStores.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>
              {selectedStores.length} store(s) selected
            </Typography>
            <Box display="flex" gap={1}>
              <Button size="small" startIcon={<Archive />}>
                Archive
              </Button>
              <Button size="small" startIcon={<Delete />} color="error">
                Delete
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

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

      {/* STORES CONTENT */}
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
          <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No stores found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating your first store'}
          </Typography>
          {!searchTerm && filterStatus === 'all' && (
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
              Create Your First Store
            </Button>
          )}
        </Paper>
      ) : viewMode === 'grid' ? (
        <>
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

          {/* PAGINATION */}
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
      ) : (
        /* LIST VIEW */
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>Store Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStores.map((store) => (
                  <TableRow key={store.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <Store />
                        </Avatar>
                        <Box>
                          <Typography fontWeight="600">{store.name}</Typography>
                          {store.description && (
                            <Typography variant="caption" color="text.secondary">
                              {store.description.length > 50
                                ? `${store.description.substring(0, 50)}...`
                                : store.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={store.status || 'Active'}
                        color={(store.status || 'Active') === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {store.address || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {store.phone && (
                          <Typography variant="body2" noWrap>
                            <Phone sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {store.phone}
                          </Typography>
                        )}
                        {store.email && (
                          <Typography variant="body2" noWrap>
                            <Email sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {store.email}
                          </Typography>
                        )}
                        {!store.phone && !store.email && '-'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {store.updated_at ? new Date(store.updated_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(store)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => navigate(`/stores/${store.id}/cashbooks`)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteStore(store.id, store.name)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[9, 18, 36]}
            component="div"
            count={filteredStores.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {/* ENHANCED CREATE/EDIT DIALOG */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
          <Typography variant="h5" fontWeight="600">
            {selectedStore ? 'Edit Store' : 'Create New Store'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedStore ? 'Update store information' : 'Add a new store to your portfolio'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Store Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                error={!formData.name.trim() && dialogOpen}
                helperText={!formData.name.trim() && dialogOpen ? 'Store name is required' : ''}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />

              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
              />

              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                type="email"
                InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
              />

              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                margin="normal"
                InputProps={{ startAdornment: <Public sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={closeDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveStore}
            variant="contained"
            disabled={!formData.name.trim() || loading}
            size="large"
          >
            {selectedStore ? 'Update Store' : 'Create Store'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FLOATING ACTION BUTTON */}
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