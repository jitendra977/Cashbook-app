// src/components/dashboard/TransactionSummary.jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const TransactionSummary = ({ income, expense, net }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Cash Flow Summary</Typography>
        <Box display="flex" justifyContent="space-between">
          <Typography>Income</Typography>
          <Typography color="success.main">+${income}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography>Expenses</Typography>
          <Typography color="error.main">-${expense}</Typography>
        </Box>
        <Box display="flex" justifyContent="between" sx={{ borderTop: 1, pt: 1 }}>
          <Typography fontWeight="bold">Net</Typography>
          <Typography fontWeight="bold" color={net >= 0 ? 'success.main' : 'error.main'}>
            ${net}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

