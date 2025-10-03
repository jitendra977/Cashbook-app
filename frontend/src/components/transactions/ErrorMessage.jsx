import React from 'react';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ErrorMessage = ({ 
  message, 
  type = 'error',
  title,
  onRetry,
  onClose,
  showIcon = true,
  dismissible = false,
  fullWidth = false,
  className = '',
  style = {}
}) => {
  // Handle different types of error inputs
  const getErrorMessage = () => {
    if (typeof message === 'string') return message;
    if (message?.message) return message.message;
    if (message?.detail) return message.detail;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'object') return JSON.stringify(message);
    return 'An unexpected error occurred';
  };

  const getErrorTitle = () => {
    if (title) return title;
    
    const errorMap = {
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      success: 'Success'
    };
    
    return errorMap[type] || 'Error';
  };

  const getIcon = () => {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || icons.error;
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Alert
      severity={type}
      sx={{ mb: 2 }}
      action={
        dismissible && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )
      }
      className={`
        error-message 
        error-message--${type}
        ${dismissible ? 'error-message--dismissible' : ''}
        ${fullWidth ? 'error-message--full-width' : ''}
        ${className}
      `}
      style={style}
      role="alert"
      aria-live="polite"
    >
      <div className="error-message__content">
        {showIcon && (
          <div className="error-message__icon">
            {getIcon()}
          </div>
        )}
        
        <div className="error-message__text">
          <div className="error-message__title">
            {getErrorTitle()}
          </div>
          <div className="error-message__description">
            {getErrorMessage()}
          </div>
        </div>

        <div className="error-message__actions">
          {onRetry && (
            <button
              className="error-message__retry-btn"
              onClick={handleRetry}
              type="button"
            >
              Retry
            </button>
          )}
          
          {dismissible && (
            <button
              className="error-message__close-btn"
              onClick={handleClose}
              type="button"
              aria-label="Dismiss error message"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </Alert>
  );
};

// Specific error component variants
export const NetworkError = ({ message, onRetry, ...props }) => (
  <ErrorMessage
    type="error"
    title="Network Error"
    message={message || "Unable to connect to the server. Please check your internet connection."}
    onRetry={onRetry}
    showIcon={true}
    {...props}
  />
);

export const ValidationError = ({ message, errors, ...props }) => (
  <ErrorMessage
    type="warning"
    title="Validation Error"
    message={errors || message}
    showIcon={true}
    {...props}
  />
);

export const AuthError = ({ message, onRetry, ...props }) => (
  <ErrorMessage
    type="warning"
    title="Authentication Required"
    message={message || "Please log in to continue."}
    onRetry={onRetry}
    showIcon={true}
    {...props}
  />
);

export const SuccessMessage = ({ message, title = "Success", ...props }) => (
  <ErrorMessage
    type="success"
    title={title}
    message={message}
    showIcon={true}
    {...props}
  />
);

export const InfoMessage = ({ message, title = "Information", ...props }) => (
  <ErrorMessage
    type="info"
    title={title}
    message={message}
    showIcon={true}
    {...props}
  />
);

export default ErrorMessage;