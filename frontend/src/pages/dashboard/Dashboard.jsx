import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api/users';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users...');
      console.log('Access token:', localStorage.getItem('access_token'));
      
      const response = await usersAPI.getAllUsers();
      console.log('Users response:', response);
      
      setUsers(Array.isArray(response) ? response : response.results || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response);
      
      // Handle different error types
      if (err.response?.status === 403) {
        setError('Access forbidden. Please check your authentication token.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Optionally redirect to login
        // logout();
        // navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Users endpoint not found. Please check the API URL.');
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

  const handleEditUser = (userData) => {
    console.log('Edit user:', userData);
    // Navigate to edit user page or open modal
    // navigate(`/users/edit/${userData.id}`);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        alert('User deleted successfully');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user');
      }
    }
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.05)'
  };

  const statsCardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  };

  const editButtonStyle = {
    ...buttonStyle,
    background: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #bbdefb'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: '#ffebee',
    color: '#d32f2f',
    border: '1px solid #ffcdd2'
  };

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '32px',
                fontWeight: '700'
              }}>
                Admin Dashboard 🚀
              </h1>
              <p style={{
                margin: 0,
                fontSize: '18px',
                opacity: 0.9
              }}>
                Welcome back, {user?.username || 'Admin'}
              </p>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={statsCardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', opacity: 0.9 }}>Total Users</h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>
              {users.length}
            </p>
          </div>

          <div style={{...statsCardStyle, background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'}}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(40, 167, 69, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(40, 167, 69, 0.3)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', opacity: 0.9 }}>Active Users</h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>
              {users.filter(u => u.is_active).length}
            </p>
          </div>

          <div style={{...statsCardStyle, background: 'linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)'}}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(253, 126, 20, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(253, 126, 20, 0.3)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', opacity: 0.9 }}>Reports</h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>24</p>
          </div>

          <div style={{...statsCardStyle, background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)'}}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(111, 66, 193, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(111, 66, 193, 0.3)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', opacity: 0.9 }}>Activities</h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>156</p>
          </div>
        </div>

        

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '32px'
        }}>
          {[
            { icon: '👤', text: 'Add User', color: '#28a745' },
            { icon: '📊', text: 'User Reports', color: '#17a2b8' },
            { icon: '⚙️', text: 'Settings', color: '#6c757d' },
            { icon: '📧', text: 'Send Email', color: '#fd7e14' }
          ].map((action, index) => (
            <button key={index} style={{
              background: 'white',
              border: `2px solid ${action.color}`,
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = action.color;
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = 'inherit';
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{action.icon}</div>
              <div style={{ fontWeight: '600', color: action.color, fontSize: '16px' }}>{action.text}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;