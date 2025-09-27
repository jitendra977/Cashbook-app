import React from 'react';
import { Box, Container, Paper } from '@mui/material';

const AuthLayout = ({ children }) => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          {children}
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthLayout;