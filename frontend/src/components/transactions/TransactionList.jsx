import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, TextField, IconButton, Tooltip, Chip
} from '@mui/material';
import { Visibility, Edit, Delete, Search } from '@mui/icons-material';

const columns = [
  { id: 'transaction_date', label: 'Date' },
  { id: 'type_name', label: 'Type' },
  { id: 'category_name', label: 'Category' },
  { id: 'amount', label: 'Amount', align: 'right' },
  { id: 'status', label: 'Status' },
  { id: 'description', label: 'Description' },
  { id: 'actions', label: 'Actions', align: 'center' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'failed': return 'error';
    default: return 'default';
  }
};

const TransactionList = ({
  transactions = [],
  showPagination = false,
  onTransactionClick,
  page = 1,
  rowsPerPage = 10,
  onPageChange,
  onEdit,
  onDelete
}) => {
  const [orderBy, setOrderBy] = useState('transaction_date');
  const [order, setOrder] = useState('desc');
  const [search, setSearch] = useState('');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let txs = Array.isArray(transactions) ? transactions : [];
    if (search) {
      txs = txs.filter(tx =>
        (tx.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (tx.category_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (tx.type_name || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    txs = txs.slice().sort((a, b) => {
      const aValue = a[orderBy] ?? '';
      const bValue = b[orderBy] ?? '';
      if (order === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
    return txs;
  }, [transactions, orderBy, order, search]);

  const paginatedTransactions = showPagination
    ? filteredTransactions.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : filteredTransactions;

  const handleSort = (columnId) => {
    if (orderBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(columnId);
      setOrder('asc');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <TextField
          size="small"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 220 }}
        />
        <Typography variant="body2" color="text.secondary">
          {filteredTransactions.length} transaction(s) found
        </Typography>
      </Box>
      {filteredTransactions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No transactions found.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell key={col.id} align={col.align || 'left'}>
                    {col.id !== 'actions' ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map(tx => (
                <TableRow
                  key={tx.id}
                  hover
                  sx={{ cursor: onTransactionClick ? 'pointer' : 'default' }}
                  onClick={() => onTransactionClick && onTransactionClick(tx)}
                >
                  <TableCell>{tx.transaction_date || tx.date}</TableCell>
                  <TableCell>{tx.type_name || tx.type}</TableCell>
                  <TableCell>{tx.category_name || tx.category}</TableCell>
                  <TableCell align="right">${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={tx.status || 'N/A'}
                      color={getStatusColor(tx.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton size="small" onClick={e => { e.stopPropagation(); onTransactionClick && onTransactionClick(tx); }}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onEdit && (
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(tx); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(tx); }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {showPagination && transactions.length > rowsPerPage && (
        <Box display="flex" justifyContent="center" py={2}>
          <Pagination
            count={Math.ceil(transactions.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => onPageChange && onPageChange(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.array,
  showPagination: PropTypes.bool,
  onTransactionClick: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TransactionList;
