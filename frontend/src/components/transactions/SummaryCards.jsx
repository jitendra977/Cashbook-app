import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';

const SummaryCards = ({ summary }) => {
  if (!summary) {
    return null;
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={4}>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Transactions
          </Typography>
          <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
            {summary.total_transactions ?? 0}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Income
          </Typography>
          <Typography variant="h5" color="success.main" sx={{ mt: 1 }}>
            ${typeof summary.total_income === 'number' ? summary.total_income.toFixed(2) : '0.00'}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Expense
          </Typography>
          <Typography variant="h5" color="error.main" sx={{ mt: 1 }}>
            ${typeof summary.total_expense === 'number' ? summary.total_expense.toFixed(2) : '0.00'}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SummaryCards;
