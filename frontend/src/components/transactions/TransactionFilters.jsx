import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button } from '@mui/material';

const TransactionFilters = ({
  onFilterChange,
  types = [],
  categories = [],
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    ...initialFilters
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilterChange && onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({
      type: '',
      category: '',
      minAmount: '',
      maxAmount: ''
    });
    onFilterChange && onFilterChange({});
  };

  return (
    <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
      <TextField
        select
        label="Type"
        name="type"
        value={filters.type}
        onChange={handleChange}
        size="small"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">All</MenuItem>
        {types.map(type => (
          <MenuItem key={type.id || type} value={type.id || type}>
            {type.name || type}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Category"
        name="category"
        value={filters.category}
        onChange={handleChange}
        size="small"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">All</MenuItem>
        {categories.map(cat => (
          <MenuItem key={cat.id || cat} value={cat.id || cat}>
            {cat.name || cat}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Min Amount"
        name="minAmount"
        type="number"
        value={filters.minAmount}
        onChange={handleChange}
        size="small"
        sx={{ minWidth: 100 }}
      />
      <TextField
        label="Max Amount"
        name="maxAmount"
        type="number"
        value={filters.maxAmount}
        onChange={handleChange}
        size="small"
        sx={{ minWidth: 100 }}
      />
      <Button variant="contained" color="primary" onClick={handleApply}>
        Apply
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleReset}>
        Reset
      </Button>
    </Box>
  );
};

export default TransactionFilters;
