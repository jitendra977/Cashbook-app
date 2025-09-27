import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Store as StoreIcon, People as PeopleIcon } from '@mui/icons-material';

const StoreCard = ({ store, onEdit, onDelete, onSelect }) => {
  return (
    <Card sx={{ maxWidth: 345, m: 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <StoreIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {store.name}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {store.store_users_count || 0} users
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Chip label="Active" size="small" color="success" variant="outlined" />
          <Chip label={`${store.cashbooks_count || 0} cashbooks`} size="small" variant="outlined" />
        </Box>
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={() => onSelect(store)}>
          View Details
        </Button>
        <Button size="small" onClick={() => onEdit(store)}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={() => onDelete(store)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default StoreCard;