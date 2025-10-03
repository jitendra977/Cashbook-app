import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination } from '@mui/material';

const TransactionList = ({
  transactions = [],
  showPagination = false,
  onTransactionClick,
  page = 1,
  rowsPerPage = 10,
  onPageChange,
}) => {
  const paginatedTransactions = showPagination
    ? transactions.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : transactions;

  return (
    <Box>
      {(!transactions || transactions.length === 0) ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No transactions found.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Description</TableCell>
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
                  <TableCell>{tx.description}</TableCell>
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
};

export default TransactionList;
