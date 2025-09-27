import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Floating animation trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  };

  const backgroundElements = {
    circle1: {
      position: 'absolute',
      top: '10%',
      left: '10%',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      animation: 'float 6s ease-in-out infinite'
    },
    circle2: {
      position: 'absolute',
      bottom: '15%',
      right: '15%',
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.05)',
      animation: 'float 4s ease-in-out infinite reverse'
    },
    circle3: {
      position: 'absolute',
      top: '60%',
      left: '5%',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.08)',
      animation: 'float 5s ease-in-out infinite'
    }
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '48px 40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    position: 'relative',
    zIndex: 10,
    transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 0.3s ease'
  };

  const numberStyle = {
    fontSize: '120px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1',
    marginBottom: '16px',
    textShadow: '0 4px 8px rgba(102, 126, 234, 0.3)',
    animation: 'pulse 2s ease-in-out infinite alternate'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '16px',
    letterSpacing: '-0.5px'
  };

  const descriptionStyle = {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '32px',
    maxWidth: '400px',
    margin: '0 auto 32px auto'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '24px'
  };

  const primaryButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  const secondaryButtonStyle = {
    background: 'transparent',
    color: '#667eea',
    padding: '14px 28px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #667eea',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  const countdownStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginTop: '16px'
  };

  const iconStyle = {
    fontSize: '48px',
    marginBottom: '16px',
    animation: 'bounce 2s ease-in-out infinite'
  };

  // Add keyframe animations via a style tag
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.05); }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .slide-in {
        animation: slideIn 0.6s ease-out;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div style={containerStyle}>
      {/* Background decorative elements */}
      <div style={backgroundElements.circle1}></div>
      <div style={backgroundElements.circle2}></div>
      <div style={backgroundElements.circle3}></div>

      {/* Main content card */}
      <div style={cardStyle} className="slide-in">
        {/* Animated icon */}
        <div style={iconStyle}>🚀</div>
        
        {/* 404 Number */}
        <div style={numberStyle}>404</div>
        
        {/* Title */}
        <h1 style={titleStyle}>Oops! Page Not Found</h1>
        
        {/* Description */}
        <p style={descriptionStyle}>
          The page you're looking for seems to have wandered off into the digital void. 
          Don't worry though, let's get you back on track!
        </p>
        
        {/* Action buttons */}
        <div style={buttonContainerStyle}>
          <Link 
            to="/" 
            style={primaryButtonStyle}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            🏠 Back to Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            style={secondaryButtonStyle}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            ⬅️ Go Back
          </button>
        </div>
        
        {/* Auto-redirect countdown */}
        <div style={countdownStyle}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>⏰</span>
            Auto-redirecting to home in{' '}
            <span style={{ 
              fontWeight: '700', 
              color: '#667eea',
              fontSize: '16px'
            }}>
              {countdown}
            </span>{' '}
            seconds
          </p>
        </div>

        {/* Fun facts or tips */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
          borderRadius: '12px',
          border: '1px solid #c7d2fe'
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#3730a3',
            fontStyle: 'italic'
          }}>
            💡 <strong>Did you know?</strong> The first 404 error was discovered at CERN in 1992. 
            You're now part of internet history!
          </p>
        </div>

        {/* Popular links */}
        <div style={{ marginTop: '24px' }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            Quick Navigation:
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {[
              { label: 'Dashboard', path: '/dashboard', icon: '📊' },
              { label: 'Users', path: '/users', icon: '👥' },
              { label: 'Settings', path: '/settings', icon: '⚙️' }
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e0e7ff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;