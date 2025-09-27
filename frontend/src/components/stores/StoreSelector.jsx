import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useStore } from '../../context/StoreContext';

const StoreSelector = ({ stores, label = "Select Store" }) => {
  const { selectedStore, selectStore } = useStore();

  const handleChange = (event) => {
    const storeId = event.target.value;
    const store = stores.find(s => s.id === storeId) || null;
    selectStore(store);
  };

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={selectedStore?.id || ''}
          label={label}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default StoreSelector;