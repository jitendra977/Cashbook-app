import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Tooltip,
  Menu,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  PersonAdd,
  Settings,
  Logout,
  Search,
  Block,
  Edit,
  Delete,
  Visibility,
  Email,
  Phone,
  CheckCircle,
  AdminPanelSettings,
  Person,
  Analytics,
  Notifications,
  Security,
  Add,
  WorkspacePremium,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api/users';
import AddUser from '../../pages/auth/AddUser';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await usersAPI.getAllUsers();
      setUsers(Array.isArray(response) ? response : response.results || []);
    } catch (err) {
      console.error('Error fetching users:', err);

      if (err.response?.status === 403) {
        setError('Access forbidden. You may not have permission to view users.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        setError(`Failed to fetch users: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await usersAPI.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      showSnackbar('User deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      showSnackbar('Failed to delete user', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    staff: users.filter(u => u.is_staff).length,
    verified: users.filter(u => u.is_verified).length
  };

  const StatCard = ({ title, value, icon: Icon, color, gradient }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
          </Box>
          <Icon sx={{ fontSize: 48, opacity: 0.8 }} />
        </Box>
      </CardContent>
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
        }}
      />
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        cursor: 'pointer',
        border: `2px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Icon sx={{ fontSize: 48, color, mb: 2 }} />
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 3
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: alpha('#fff', 0.1),
            }}
          />

          <Box position="relative" zIndex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  <DashboardIcon sx={{ mr: 2, fontSize: 'inherit' }} />
                  Admin Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Welcome back, {user?.first_name || user?.username || 'Admin'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
                  Manage your application users and settings
                </Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchUsers}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.8)',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchUsers}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.total}
              icon={People}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={stats.active}
              icon={CheckCircle}
              gradient="linear-gradient(135deg, #28a745 0%, #20c997 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Staff Members"
              value={stats.staff}
              icon={Security}
              gradient="linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Verified Users"
              value={stats.verified}
              icon={Notifications}
              gradient="linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="Add New User"
                    description="Create a new user account"
                    icon={PersonAdd}
                    color={theme.palette.primary.main}
                    onClick={() => navigate('/user/add')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="User Analytics"
                    description="View user statistics and reports"
                    icon={Analytics}
                    color={theme.palette.info.main}
                    onClick={() => navigate('/analytics')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="System Settings"
                    description="Configure application settings"
                    icon={Settings}
                    color={theme.palette.secondary.main}
                    onClick={() => navigate('/settings')}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Users Table */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ borderRadius: 3 }}>
              {/* Table Header */}
              <Box sx={{ p: 3, pb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Users Management
                  </Typography>
                  <Chip
                    label={`${filteredUsers.length} users`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ flex: 1, maxWidth: 400 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/user/add')}
                  >
                    Add User
                  </Button>
                </Box>
              </Box>

              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell><strong>User</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Address</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={user.profile_image}
                              sx={{ width: 40, height: 40 }}
                            >
                              {user.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="medium">
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.username
                                }
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                @{user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                        </TableCell><TableCell>
                          <Typography variant="body2">
                            {user.address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Chip
                              label={user.is_active ? 'Active' : 'Inactive'}
                              color={user.is_active ? 'success' : 'error'}
                              size="small"
                            />
                            {user.is_verified && (
                              <Chip
                                label="Verified"
                                color="info"
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Tooltip
                            title={
                              !user.is_active
                                ? `Suspended ${user.is_superuser ? 'Administrator' : user.is_staff ? 'Staff' : 'User'} account`
                                : user.is_superuser
                                  ? 'Full system administrator privileges'
                                  : user.is_staff
                                    ? 'Staff member with limited admin access'
                                    : 'Standard user account with basic permissions'
                            }
                            arrow
                          >
                            <Chip
                              icon={
                                !user.is_active
                                  ? <Block fontSize="small" />
                                  : user.is_superuser
                                    ? <AdminPanelSettings fontSize="small" />
                                    : user.is_staff
                                      ? <WorkspacePremium fontSize="small" />
                                      : <Person fontSize="small" />
                              }
                              label={
                                !user.is_active
                                  ? `Suspended ${user.is_superuser ? 'Admin' : user.is_staff ? 'Staff' : 'User'}`
                                  : user.is_superuser
                                    ? 'System Admin'
                                    : user.is_staff
                                      ? 'Staff'
                                      : 'User'
                              }
                              color={
                                !user.is_active
                                  ? 'default'           // Grey for suspended (inactive) users
                                  : user.is_superuser
                                    ? 'error'           // Red for active super admins (highest priority)
                                    : user.is_staff
                                      ? 'warning'       // Orange/amber for active staff
                                      : 'success'       // Green for active regular users
                              }
                              size="small"
                              variant={user.is_active ? 'filled' : 'outlined'}
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: user.is_active ? 100 : 120,
                                cursor: 'pointer',
                                opacity: user.is_active ? 1 : 0.7,
                                '&:hover': {
                                  opacity: 0.9,
                                  transform: 'translateY(-1px)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Profile">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/profile/${user.id}`)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit User">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/users/edit/${user.id}`)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
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

              {/* Pagination */}
              <TablePagination
                component="div"
                count={filteredUsers.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" display="flex" alignItems="center">
            <Delete sx={{ mr: 1, color: 'error.main' }} />
            Delete User
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone
          </Alert>
          <Typography>
            Are you sure you want to delete user <strong>"{selectedUser?.username}"</strong>?
            This will permanently remove all user data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            startIcon={<Delete />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;