import React from 'react';
import { Button as MUIButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MUIButton)(({ theme, variant, buttonvariant }) => ({
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
  ...(buttonvariant === 'primary' && {
    background: 'linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #1976D2 30%, #7B1FA2 90%)',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 8px 3px rgba(33, 150, 243, .4)',
    },
  }),
  ...(buttonvariant === 'secondary' && {
    background: 'linear-gradient(45deg, #757575 30%, #616161 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(117, 117, 117, .3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #616161 30%, #424242 90%)',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 8px 3px rgba(117, 117, 117, .4)',
    },
  }),
  ...(buttonvariant === 'success' && {
    background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #388E3C 30%, #1B5E20 90%)',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 8px 3px rgba(76, 175, 80, .4)',
    },
  }),
  ...(buttonvariant === 'danger' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E91E63 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #D32F2F 30%, #C2185B 90%)',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 8px 3px rgba(244, 67, 54, .4)',
    },
  }),
}));

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, size = 'medium', ...props }) => {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      size={size}
      buttonvariant={variant}
      variant="contained"
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;