import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../api/users';
import UserTable from '../../components/tables/UserTable';
import UserForm from '../../components/forms/UserForm';
import { useAuth } from '../../context/AuthContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Fab
} from '@mui/material';
import { Add } from '@mui/icons-material';

const UserManage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [paginatedUsers, setPaginatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAllUsers();
      const userList = Array.isArray(data) ? data : data.results || [];
      setUsers(userList);
      
      // Calculate paginated users
      const startIndex = (currentPage - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      setPaginatedUsers(userList.slice(startIndex, endIndex));
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update paginated users when page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    setPaginatedUsers(users.slice(startIndex, endIndex));
  }, [users, currentPage, usersPerPage]);

  // ✅ DELETE - Updated to work with dialog
  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await usersAPI.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  // ✅ EDIT
  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormErrors({});
    setFormOpen(true);
  };

  // ✅ ADD
  const handleAdd = () => {
    setSelectedUser(null);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // ✅ SUBMIT
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedUser) {
        await usersAPI.updateUser(selectedUser.id, formData);
      } else {
        await usersAPI.createUser(formData);
      }
      await fetchUsers();
      handleFormClose();
    } catch (err) {
      if (err.response?.data) setFormErrors(err.response.data);
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 'bold' }}>
        User Management
      </Typography>

      {/* ✅ LOADING & ERROR HANDLING */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <UserTable
            users={users}
            paginatedUsers={paginatedUsers}
            setSelectedUser={setSelectedUser}
            setDeleteDialogOpen={setDeleteDialogOpen}
            onEdit={handleEdit}
            onDelete={(user) => {
              setSelectedUser(user);
              setDeleteDialogOpen(true);
            }}
          />
          
          {/* Pagination could be added here if needed */}
        </>
      )}

      {/* ✅ ADD USER FAB - Only show for staff/superuser */}
      {(currentUser?.is_staff || currentUser?.is_superuser) && (
        <Fab
          color="primary"
          aria-label="add user"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAdd}
        >
          <Add />
        </Fab>
      )}

      {/* ✅ USER FORM DIALOG */}
      <UserForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        loading={formLoading}
        errors={formErrors}
      />

      {/* ✅ DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete user "{selectedUser?.username}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManage;