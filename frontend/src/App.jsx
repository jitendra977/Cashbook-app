// src/App.jsx
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { StoreProvider } from './context/StoreContext';
import { TransactionsProvider } from './context/TransactionsContext'; // Fixed import name

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider>
        <TransactionsProvider> {/* Fixed component name */}
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </TransactionsProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;