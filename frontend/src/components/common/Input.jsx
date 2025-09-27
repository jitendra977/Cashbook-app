import React from 'react';
import { TextField, FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme, error }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease-in-out',
    '& fieldset': {
      borderColor: error ? theme.palette.error.main : '#e0e0e0',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: error ? theme.palette.error.dark : theme.palette.primary.main,
      boxShadow: error 
        ? `0 0 0 2px ${theme.palette.error.main}20` 
        : `0 0 0 2px ${theme.palette.primary.main}20`,
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& fieldset': {
        borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
        borderWidth: 2,
        boxShadow: error 
          ? `0 0 0 3px ${theme.palette.error.main}30` 
          : `0 0 0 3px ${theme.palette.primary.main}30`,
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: error ? theme.palette.error.main : '#666',
    '&.Mui-focused': {
      color: error ? theme.palette.error.main : theme.palette.primary.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5, 2),
    fontSize: '1rem',
    '&::placeholder': {
      color: '#999',
      opacity: 1,
    },
  },
}));

const Input = ({ label, error, helperText, ...props }) => {
  return (
    <>
      <StyledTextField
        label={label}
        error={!!error}
        helperText={error || helperText}
        variant="outlined"
        fullWidth
        margin="normal"
        {...props}
        sx={{
          marginBottom: 2,
          '& .MuiFormHelperText-root': {
            marginLeft: 0,
            marginTop: 1,
            fontSize: '0.875rem',
            fontWeight: error ? 500 : 400,
          },
        }}
      />
    </>
  );
};

export default Input;