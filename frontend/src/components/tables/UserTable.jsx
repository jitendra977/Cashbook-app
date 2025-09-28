import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Paper,
  Box,
  Chip,
  Typography,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
  Button
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  AdminPanelSettings,
  WorkspacePremium,
  Person,
  Block,
  Search,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';

const UserTable = ({ 
  users = [], 
  paginatedUsers = [], 
  setSelectedUser, 
  setDeleteDialogOpen,
  onEdit,
  onDelete,
  onAddUser 
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Local state for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate paginated users from filtered results
  const localPaginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Use local paginated users if available, otherwise use prop
  const displayUsers = filteredUsers.length > 0 || searchTerm ? localPaginatedUsers : paginatedUsers;

  // Handle edit click
  const handleEditClick = (user) => {
    if (onEdit) {
      onEdit(user);
    } else {
      // Fallback to navigation if no onEdit handler provided
      navigate(`/users/edit/${user.id}`);
    }
  };

  // Handle delete click
  const handleDeleteClick = (user) => {
    if (onDelete) {
      onDelete(user);
    } else {
      // Fallback to direct dialog opening
      setSelectedUser(user);
      setDeleteDialogOpen(true);
    }
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle add user
  const handleAddUser = () => {
    if (onAddUser) {
      onAddUser();
    } else {
      navigate('/user/add');
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3 }}>
      {/* Table Header with Search and Actions */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Users Management
          </Typography>
          <Chip
            label={`${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ flex: 1, minWidth: 300, maxWidth: 400 }}
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
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Box>

        {/* Search Results Summary */}
        {searchTerm && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              {filteredUsers.length === 0 
                ? `No users found matching "${searchTerm}"`
                : `Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} matching "${searchTerm}"`
              }
            </Typography>
          </Box>
        )}
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayUsers.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                >
                  {/* USER INFO */}
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

                  {/* EMAIL */}
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>

                  {/* STATUS */}
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

                  {/* ROLE */}
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
                            ? 'default'
                            : user.is_superuser
                              ? 'error'
                              : user.is_staff
                                ? 'warning'
                                : 'success'
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

                  {/* ACTION BUTTONS */}
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
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={searchTerm ? filteredUsers.length : users.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.875rem',
          }
        }}
        labelRowsPerPage="Users per page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`} users`
        }
      />
    </Paper>
  );
};

export default UserTable;