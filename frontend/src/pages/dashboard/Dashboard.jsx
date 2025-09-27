import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    color: 'white'
  };

  const statsCardStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  };

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Welcome Card */}
        <div style={cardStyle}>
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
                fontSize: '28px',
                fontWeight: '700'
              }}>
                Welcome Back! 👋
              </h1>
              <p style={{
                margin: 0,
                fontSize: '18px',
                opacity: 0.9
              }}>
                Hello, {user?.username || 'User'}
              </p>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={statsCardStyle}>
            <div style={{
              fontSize: '48px',
              marginBottom: '12px'
            }}>📊</div>
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#343a40',
              fontSize: '20px'
            }}>Total Projects</h3>
            <p style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: '#667eea'
            }}>12</p>
          </div>

          <div style={statsCardStyle}>
            <div style={{
              fontSize: '48px',
              marginBottom: '12px'
            }}>✅</div>
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#343a40',
              fontSize: '20px'
            }}>Completed</h3>
            <p style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: '#28a745'
            }}>8</p>
          </div>

          <div style={statsCardStyle}>
            <div style={{
              fontSize: '48px',
              marginBottom: '12px'
            }}>⏳</div>
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#343a40',
              fontSize: '20px'
            }}>In Progress</h3>
            <p style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffc107'
            }}>4</p>
          </div>

          <div style={statsCardStyle}>
            <div style={{
              fontSize: '48px',
              marginBottom: '12px'
            }}>👥</div>
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#343a40',
              fontSize: '20px'
            }}>Team Members</h3>
            <p style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: '#6f42c1'
            }}>6</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: '#343a40',
            fontSize: '24px',
            fontWeight: '700'
          }}>Recent Activity</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '📝', text: 'Updated project documentation', time: '2 hours ago', color: '#17a2b8' },
              { icon: '✨', text: 'Completed user authentication module', time: '5 hours ago', color: '#28a745' },
              { icon: '🔧', text: 'Fixed navigation component bug', time: '1 day ago', color: '#fd7e14' },
              { icon: '👥', text: 'Added new team member', time: '2 days ago', color: '#6f42c1' }
            ].map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: `4px solid ${activity.color}`
              }}>
                <span style={{ fontSize: '24px', marginRight: '16px' }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '500', color: '#343a40' }}>{activity.text}</p>
                  <small style={{ color: '#6c757d' }}>{activity.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: '➕', text: 'New Project', color: '#28a745' },
            { icon: '📊', text: 'View Reports', color: '#17a2b8' },
            { icon: '⚙️', text: 'Settings', color: '#6c757d' },
            { icon: '💬', text: 'Messages', color: '#fd7e14' }
          ].map((action, index) => (
            <button key={index} style={{
              background: 'white',
              border: `2px solid ${action.color}`,
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.background = action.color;
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = 'inherit';
              e.target.style.transform = 'translateY(0px)';
            }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{action.icon}</div>
              <div style={{ fontWeight: '600', color: action.color }}>{action.text}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;