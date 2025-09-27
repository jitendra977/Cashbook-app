import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const linkStyle = ({ isActive }) => ({
    display: 'block',
    padding: '12px 16px',
    textDecoration: 'none',
    color: isActive ? '#ffffff' : '#555555',
    background: isActive 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'transparent',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.3s ease-in-out',
    boxShadow: isActive ? '0 4px 8px rgba(102, 126, 234, 0.3)' : 'none',
    borderLeft: isActive ? '4px solid rgba(255,255,255,0.8)' : '4px solid transparent'
  });

  const hoverStyle = {
    transform: 'translateX(4px)',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea'
  };

  return (
    <aside style={{
      width: '240px',
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '24px',
      height: '100vh',
      boxSizing: 'border-box',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      borderRight: '1px solid #dee2e6'
    }}>
      <div style={{
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #dee2e6'
      }}>
        <h3 style={{
          margin: 0,
          color: '#343a40',
          fontSize: '20px',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          Navigation
        </h3>
      </div>

      <nav>
        <NavLink 
          to="/" 
          style={linkStyle}
          onMouseEnter={(e) => {
            if (!e.target.classList.contains('active')) {
              Object.assign(e.target.style, hoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.classList.contains('active')) {
              e.target.style.transform = 'translateX(0px)';
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#555555';
            }
          }}
        >
          🏠 Dashboard
        </NavLink>

        <NavLink 
          to="/about" 
          style={linkStyle}
          onMouseEnter={(e) => {
            if (!e.target.classList.contains('active')) {
              Object.assign(e.target.style, hoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.classList.contains('active')) {
              e.target.style.transform = 'translateX(0px)';
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#555555';
            }
          }}
        >
          ℹ️ About
        </NavLink>

        <NavLink 
          to="/contact" 
          style={linkStyle}
          onMouseEnter={(e) => {
            if (!e.target.classList.contains('active')) {
              Object.assign(e.target.style, hoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.classList.contains('active')) {
              e.target.style.transform = 'translateX(0px)';
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#555555';
            }
          }}
        >
          📧 Contact
        </NavLink>

        <div style={{
          height: '1px',
          background: '#dee2e6',
          margin: '16px 0'
        }}></div>

        <button 
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 16px',
            textDecoration: 'none',
            color: '#dc3545',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            marginBottom: '8px',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease-in-out',
            cursor: 'pointer',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(4px)';
            e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            e.target.style.color = '#dc3545';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(0px)';
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#dc3545';
          }}
          onClick={() => {
            // Add logout functionality here
            console.log('Logout clicked');
            // Example: logout(); navigate('/login');
          }}
        >
          🚪 Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;