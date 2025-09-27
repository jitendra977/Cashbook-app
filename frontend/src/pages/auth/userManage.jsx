import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../api/users';
import UserTable from '../../components/tables/UserTable';
import UserForm from '../../components/forms/UserForm';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAllUsers();
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await usersAPI.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedUser) {
        await usersAPI.updateUser(selectedUser.id, formData);
      } else {
        await usersAPI.createUser(formData);
      }
      fetchUsers();
      handleFormClose();
    } catch (err) {
      if (err.response?.data) setFormErrors(err.response.data);
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <button 
        className="px-3 py-1 bg-blue-500 text-white rounded mb-4"
        onClick={handleAdd}
      >
        ➕ Add User
      </button>

      <UserTable
        users={users}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <UserForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        loading={formLoading}
        errors={formErrors}
      />
    </div>
  );
};

export default UserManage;