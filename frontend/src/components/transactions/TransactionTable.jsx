import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const TransactionTable = ({ transactions, onEdit, onDelete, onView }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAmountColor = (type) => {
    return type.toLowerCase().includes('income') ? 'success' : 'error';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
              <TableCell>
                <Chip 
                  label={transaction.type_name} 
                  size="small" 
                  color={getAmountColor(transaction.type_name)}
                />
              </TableCell>
              <TableCell>{transaction.category_name || '-'}</TableCell>
              <TableCell>{transaction.description || '-'}</TableCell>
              <TableCell align="right" sx={{ 
                color: getAmountColor(transaction.type_name) === 'success' ? 'success.main' : 'error.main',
                fontWeight: 'bold'
              }}>
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={1} justifyContent="center">
                  <IconButton size="small" onClick={() => onView(transaction)}>
                    <Visibility />
                  </IconButton>
                  <IconButton size="small" onClick={() => onEdit(transaction)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(transaction)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionTable;