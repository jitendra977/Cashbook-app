import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { transactionsAPI } from '../../api/transactions';

const TransactionFilters = ({ onFilter, cashbookId }) => {
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    start_date: null,
    end_date: null,
  });
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  const fetchFiltersData = async () => {
    try {
      const [typesData, categoriesData] = await Promise.all([
        transactionsAPI.getTransactionTypes(),
        transactionsAPI.getTransactionCategories(),
      ]);
      setTypes(typesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter({ ...newFilters, cashbook: cashbookId });
  };

  const handleClear = () => {
    const clearedFilters = {
      type: '',
      category: '',
      start_date: null,
      end_date: null,
    };
    setFilters(clearedFilters);
    onFilter({ ...clearedFilters, cashbook: cashbookId });
  };

  return (
    <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {types.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <DatePicker
            label="Start Date"
            value={filters.start_date}
            onChange={(date) => handleFilterChange('start_date', date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <DatePicker
            label="End Date"
            value={filters.end_date}
            onChange={(date) => handleFilterChange('end_date', date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Button variant="outlined" onClick={handleClear} fullWidth>
            Clear
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionFilters;