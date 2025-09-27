// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { Card, CardContent, Button, Grid, Box } from '@mui/material';
import { Add, Receipt, Store, Analytics } from '@mui/icons-material';

const QuickActions = () => {
  const actions = [
    { icon: <Add />, label: 'New Transaction', path: '/transactions/new' },
    { icon: <Store />, label: 'Add Store', path: '/stores/new' },
    { icon: <Analytics />, label: 'Reports', path: '/reports' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Grid container spacing={1}>
          {actions.map((action, index) => (
            <Grid item xs={4} key={index}>
              <Button fullWidth variant="outlined" startIcon={action.icon}>
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

