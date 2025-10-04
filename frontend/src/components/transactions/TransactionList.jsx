import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, TextField, IconButton, Tooltip, Chip, Menu, MenuItem, Button,
  Pagination, Select, FormControl, InputLabel, InputAdornment, Stack, Card,
  CardContent, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, TablePagination, Collapse, Alert, CircularProgress, Badge, Avatar
} from '@mui/material';
import {
  Visibility, Edit, Delete, Search, FilterList, MoreVert, FileDownload,
  TrendingUp, TrendingDown, CalendarToday, Category, AttachMoney,
  Refresh, KeyboardArrowDown, KeyboardArrowUp, CheckCircle, Cancel,
  Pending, Info, Store, AccountBalance
} from '@mui/icons-material';

const columns = [
  { id: 'select', label: '', sortable: false, width: 50 },
  { id: 'transaction_date', label: 'Date', sortable: true, width: 120 },
  { id: 'type_name', label: 'Type', sortable: true, width: 100 },
  { id: 'category_name', label: 'Category', sortable: true, width: 120 },
  { id: 'amount', label: 'Amount', align: 'right', sortable: true, width: 120 },
  { id: 'status', label: 'Status', sortable: true, width: 100 },
  { id: 'description', label: 'Description', sortable: false, width: 200 },
  { id: 'reference_number', label: 'Reference', sortable: true, width: 120 },
  { id: 'created_by_username', label: 'Created By', sortable: true, width: 120 },
  { id: 'actions', label: 'Actions', align: 'center', sortable: false, width: 120 }
];

const getStatusConfig = (status) => {
  const configs = {
    completed: { color: 'success', icon: <CheckCircle />, label: 'Completed' },
    pending: { color: 'warning', icon: <Pending />, label: 'Pending' },
    cancelled: { color: 'default', icon: <Cancel />, label: 'Cancelled' },
    failed: { color: 'error', icon: <Cancel />, label: 'Failed' },
    draft: { color: 'info', icon: <Info />, label: 'Draft' }
  };
  return configs[status] || { color: 'info', icon: <Info />, label: status || 'Unknown' };
};

const TransactionList = ({
  transactions = [],
  loading = false,
  error = null,
  showPagination = true,
  showSummary = true,
  showFilters = true,
  showBulkActions = true,
  showExpandableRows = true,
  onTransactionClick,
  onEdit,
  onDelete,
  onBulkDelete,
  onRefresh,
  onExport,
  enableSelection = true,
  dense = false,
  customColumns = null,
  storeId = null,
  cashbookId = null,
  currentStoreName = '',
  currentCashbookName = ''
}) => {
  // State management
  const [orderBy, setOrderBy] = useState('transaction_date');
  const [order, setOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', data: null });

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  const displayColumns = customColumns || columns;

  // Process transactions data to ensure consistent field names
  const processedTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    
    return transactions.map(tx => {
      // Normalize field names to handle different API response formats
      return {
        id: tx.id,
        // Amount handling
        amount: tx.amount || tx.amount_value || 0,
        // Date handling
        transaction_date: tx.transaction_date || tx.date || tx.created_at,
        value_date: tx.value_date || tx.transaction_date,
        // Type handling
        type_name: tx.type_name || tx.transaction_type?.name || tx.type?.name || 'Unknown',
        type: tx.type || tx.transaction_type,
        // Category handling
        category_name: tx.category_name || tx.category?.name || 'Uncategorized',
        category: tx.category,
        // Status handling
        status: tx.status || 'completed',
        // Description and reference
        description: tx.description || tx.notes || '',
        reference_number: tx.reference_number || tx.ref_number || tx.id.toString(),
        // User info
        created_by_username: tx.created_by_username || tx.created_by_username?.username || 'System',
        created_by: tx.created_by,
        updated_by_username: tx.updated_by_username || tx.updated_by_username?.username,
        updated_by: tx.updated_by,
        // Store and cashbook info
        store: tx.store || tx.cashbook?.store || tx.store_id,
        store_name: tx.store_name || tx.cashbook?.store?.name,
        cashbook: tx.cashbook || tx.cashbook_id,
        cashbook_name: tx.cashbook_name || tx.cashbook?.name,
        // Additional fields
        is_recurring: tx.is_recurring || false,
        recurring_pattern: tx.recurring_pattern,
        tags: tx.tags || [],
        created_at: tx.created_at,
        updated_at: tx.updated_at,
        // Keep original data for reference
        ...tx
      };
    });
  }, [transactions]);

  // REMOVED: Client-side store/cashbook filtering since API already returns filtered data

  // Calculate summary statistics
  const summary = useMemo(() => {
    const txs = processedTransactions;
    const total = txs.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    const completed = txs.filter(tx => tx.status === 'completed').length;
    const pending = txs.filter(tx => tx.status === 'pending').length;
    const cancelled = txs.filter(tx => tx.status === 'cancelled').length;
    const avgAmount = txs.length > 0 ? total / txs.length : 0;

    // Calculate income vs expense - IMPROVED LOGIC
    const income = txs
      .filter(tx => {
        const typeName = (tx.type_name || '').toLowerCase();
        const nature = tx.type?.nature || '';
        return typeName.includes('income') || nature === 'income' || tx.amount > 0;
      })
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    
    const expense = txs
      .filter(tx => {
        const typeName = (tx.type_name || '').toLowerCase();
        const nature = tx.type?.nature || '';
        return typeName.includes('expense') || nature === 'expense' || tx.amount < 0;
      })
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0);

    return { 
      total: Math.abs(total),
      count: txs.length, 
      completed, 
      pending, 
      cancelled, 
      avgAmount,
      income,
      expense,
      net: income - expense
    };
  }, [processedTransactions]);

  // Get unique filter options from transactions
  const filterOptions = useMemo(() => {
    const txs = processedTransactions;
    return {
      types: [...new Set(txs.map(t => t.type_name).filter(Boolean))].sort(),
      categories: [...new Set(txs.map(t => t.category_name).filter(Boolean))].sort(),
      statuses: [...new Set(txs.map(t => t.status).filter(Boolean))].sort()
    };
  }, [processedTransactions]);

  // Client-side filtering and sorting ONLY (no store/cashbook filtering)
  const filteredTransactions = useMemo(() => {
    let txs = processedTransactions;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      txs = txs.filter(tx =>
        (tx.description || '').toLowerCase().includes(searchLower) ||
        (tx.category_name || '').toLowerCase().includes(searchLower) ||
        (tx.type_name || '').toLowerCase().includes(searchLower) ||
        (tx.reference_number || '').toLowerCase().includes(searchLower) ||
        (tx.created_by_username || '').toLowerCase().includes(searchLower) ||
        (tx.amount?.toString() || '').includes(searchLower)
      );
    }

    // Advanced filters
    if (filters.type) txs = txs.filter(tx => tx.type_name === filters.type);
    if (filters.category) txs = txs.filter(tx => tx.category_name === filters.category);
    if (filters.status) txs = txs.filter(tx => tx.status === filters.status);
    if (filters.dateFrom) txs = txs.filter(tx => tx.transaction_date >= filters.dateFrom);
    if (filters.dateTo) txs = txs.filter(tx => tx.transaction_date <= filters.dateTo);
    if (filters.amountMin) txs = txs.filter(tx => parseFloat(tx.amount) >= parseFloat(filters.amountMin));
    if (filters.amountMax) txs = txs.filter(tx => parseFloat(tx.amount) <= parseFloat(filters.amountMax));

    // Sort
    txs = txs.slice().sort((a, b) => {
      let aValue = a[orderBy] ?? '';
      let bValue = b[orderBy] ?? '';

      // Handle numeric sorting for amount
      if (orderBy === 'amount') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle date sorting
      if (orderBy === 'transaction_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (order === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return txs;
  }, [processedTransactions, orderBy, order, search, filters]);

  const paginatedTransactions = showPagination
    ? filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredTransactions;

  // Event handlers
  const handleSort = useCallback((columnId) => {
    if (orderBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(columnId);
      setOrder('asc');
    }
  }, [orderBy, order]);

  const handleSelectAll = useCallback((event) => {
    if (event.target.checked) {
      setSelected(paginatedTransactions.map(tx => tx.id));
    } else {
      setSelected([]);
    }
  }, [paginatedTransactions]);

  const handleSelectOne = useCallback((id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      type: '', category: '', status: '', dateFrom: '', dateTo: '',
      amountMin: '', amountMax: ''
    });
    setSearch('');
    setPage(0);
  }, []);

  const toggleRowExpansion = useCallback((id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleDelete = useCallback((transaction) => {
    setConfirmDialog({ open: true, type: 'delete', data: transaction });
  }, []);

  const handleBulkDelete = useCallback(() => {
    setConfirmDialog({ open: true, type: 'bulkDelete', data: selected });
  }, [selected]);

  const confirmAction = useCallback(() => {
    const { type, data } = confirmDialog;
    if (type === 'delete' && onDelete) {
      onDelete(data);
    } else if (type === 'bulkDelete' && onBulkDelete) {
      onBulkDelete(data);
      setSelected([]);
    }
    setConfirmDialog({ open: false, type: '', data: null });
  }, [confirmDialog, onDelete, onBulkDelete]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== '') || search !== '';
  }, [filters, search]);

  const isSelected = (id) => selected.includes(id);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Context header
  const ContextHeader = () => (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        {currentStoreName && (
          <Chip 
            icon={<Store />} 
            label={`Store: ${currentStoreName}`} 
            color="primary" 
            variant="outlined"
          />
        )}
        {currentCashbookName && (
          <Chip 
            icon={<AccountBalance />} 
            label={`Cashbook: ${currentCashbookName}`} 
            color="secondary" 
            variant="outlined"
          />
        )}
        <Typography variant="body2" color="text.secondary">
          Showing {filteredTransactions.length} transactions
          {storeId && ` for Store #${storeId}`}
          {cashbookId && `, Cashbook #${cashbookId}`}
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <Box>
      {/* Context Header */}
      {(storeId || cashbookId) && <ContextHeader />}

      {/* Summary Cards */}
      {showSummary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
                    <Typography variant="h5">{summary.count}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <AttachMoney />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h5">${summary.total.toFixed(2)}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <TrendingUp />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Net Balance</Typography>
                    <Typography 
                      variant="h5" 
                      color={summary.net >= 0 ? 'success.main' : 'error.main'}
                    >
                      ${summary.net.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Income: ${summary.income.toFixed(2)} | Expense: ${summary.expense.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: summary.net >= 0 ? 'success.main' : 'error.main' }}>
                    {summary.net >= 0 ? <TrendingUp /> : <TrendingDown />}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`✓ ${summary.completed}`} size="small" color="success" />
                    <Chip label={`⏱ ${summary.pending}`} size="small" color="warning" />
                    <Chip label={`✗ ${summary.cancelled}`} size="small" color="default" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
            />
            
            {showFilters && (
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                endIcon={hasActiveFilters && <Badge color="primary" variant="dot" />}
              >
                Filters
              </Button>
            )}

            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}

            {onExport && (
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => onExport(filteredTransactions)}
                disabled={filteredTransactions.length === 0}
              >
                Export ({filteredTransactions.length})
              </Button>
            )}
          </Stack>

          {/* Bulk Actions */}
          {showBulkActions && selected.length > 0 && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="primary">
                {selected.length} selected
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
              <Button size="small" onClick={() => setSelected([])}>
                Clear Selection
              </Button>
            </Stack>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    onDelete={() => handleFilterChange(key, '')}
                  />
                )
              )}
              {search && (
                <Chip
                  label={`search: ${search}`}
                  size="small"
                  onDelete={() => setSearch('')}
                />
              )}
              <Button size="small" onClick={handleClearFilters}>
                Clear All
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{ sx: { width: 300, p: 2 } }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2">Filter Transactions</Typography>
          <Divider />
          
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.types.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.statuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="Date From"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            size="small"
            type="date"
            label="Date To"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              type="number"
              label="Min Amount"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Max Amount"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e.target.value)}
            />
          </Stack>

          <Button variant="outlined" fullWidth onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Stack>
      </Menu>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      ) : processedTransactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No transactions found
            {(storeId || cashbookId) && ' for current selection'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasActiveFilters 
              ? 'Try adjusting your filters' 
              : (storeId || cashbookId) 
                ? 'No transactions found for the selected store/cashbook' 
                : 'Get started by creating your first transaction'
            }
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  {displayColumns.map(col => (
                    <TableCell key={col.id} align={col.align || 'left'} width={col.width}>
                      {col.id === 'select' && enableSelection ? (
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < paginatedTransactions.length}
                          checked={paginatedTransactions.length > 0 && selected.length === paginatedTransactions.length}
                          onChange={handleSelectAll}
                        />
                      ) : col.sortable !== false && col.id !== 'actions' ? (
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
                {paginatedTransactions.map(tx => {
                  const isItemSelected = isSelected(tx.id);
                  const isExpanded = expandedRows.has(tx.id);
                  const statusConfig = getStatusConfig(tx.status);

                  return (
                    <React.Fragment key={tx.id}>
                      <TableRow
                        hover
                        selected={isItemSelected}
                        sx={{ cursor: onTransactionClick ? 'pointer' : 'default' }}
                      >
                        {enableSelection && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={() => handleSelectOne(tx.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                        )}
                        <TableCell onClick={() => onTransactionClick?.(tx)}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {showExpandableRows && (
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); toggleRowExpansion(tx.id); }}
                              >
                                {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                              </IconButton>
                            )}
                            <Typography variant="body2">
                              {formatDate(tx.transaction_date)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell onClick={() => onTransactionClick?.(tx)}>
                          <Chip 
                            label={tx.type_name} 
                            size="small" 
                            variant="outlined" 
                            color={
                              (tx.type_name?.toLowerCase().includes('income') || tx.type?.nature === 'income') 
                                ? 'success' 
                                : (tx.type_name?.toLowerCase().includes('expense') || tx.type?.nature === 'expense')
                                ? 'error'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell onClick={() => onTransactionClick?.(tx)}>
                          {tx.category_name || '-'}
                        </TableCell>
                        <TableCell align="right" onClick={() => onTransactionClick?.(tx)}>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={
                              (tx.type_name?.toLowerCase().includes('income') || tx.type?.nature === 'income') 
                                ? 'success.main' 
                                : (tx.type_name?.toLowerCase().includes('expense') || tx.type?.nature === 'expense')
                                ? 'error.main'
                                : 'text.primary'
                            }
                          >
                            ${parseFloat(tx.amount || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={() => onTransactionClick?.(tx)}>
                          <Chip
                            icon={React.cloneElement(statusConfig.icon, { fontSize: 'small' })}
                            label={statusConfig.label}
                            color={statusConfig.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell onClick={() => onTransactionClick?.(tx)}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {tx.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={() => onTransactionClick?.(tx)}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {tx.reference_number || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={() => onTransactionClick?.(tx)}>
                          {tx.created_by_username}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onTransactionClick?.(tx); }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {onEdit && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onDelete && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(tx); }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Row Details */}
                      {showExpandableRows && (
                        <TableRow>
                          <TableCell colSpan={displayColumns.length} sx={{ py: 0, borderBottom: isExpanded ? 1 : 0 }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>Transaction Details</Typography>
                                    <Stack spacing={1}>
                                      <Typography variant="body2"><strong>ID:</strong> {tx.id}</Typography>
                                      <Typography variant="body2"><strong>Transaction ID:</strong> {tx.transaction_id || 'N/A'}</Typography>
                                      <Typography variant="body2"><strong>Store:</strong> {tx.store_name || 'N/A'}</Typography>
                                      <Typography variant="body2"><strong>Cashbook:</strong> {tx.cashbook_name || 'N/A'}</Typography>
                                      <Typography variant="body2"><strong>Created:</strong> {formatDate(tx.created_at)}</Typography>
                                      <Typography variant="body2"><strong>Updated:</strong> {tx.updated_at ? formatDate(tx.updated_at) : 'N/A'}</Typography>
                                    </Stack>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>Additional Info</Typography>
                                    <Stack spacing={1}>
                                      <Typography variant="body2"><strong>Value Date:</strong> {formatDate(tx.value_date)}</Typography>
                                      <Typography variant="body2"><strong>Recurring:</strong> {tx.is_recurring ? 'Yes' : 'No'}</Typography>
                                      <Typography variant="body2"><strong>Updated By:</strong> {tx.updated_by_username || 'N/A'}</Typography>
                                      <Typography variant="body2"><strong>Full Description:</strong></Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {tx.description || 'No description provided'}
                                      </Typography>
                                    </Stack>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {showPagination && (
            <TablePagination
              component="div"
              count={filteredTransactions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', data: null })}
      >
        <DialogTitle>
          {confirmDialog.type === 'delete' ? 'Confirm Delete' : 'Confirm Bulk Delete'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'delete'
              ? 'Are you sure you want to delete this transaction? This action cannot be undone.'
              : `Are you sure you want to delete ${selected.length} transactions? This action cannot be undone.`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', data: null })}>
            Cancel
          </Button>
          <Button onClick={confirmAction} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  showPagination: PropTypes.bool,
  showSummary: PropTypes.bool,
  showFilters: PropTypes.bool,
  showBulkActions: PropTypes.bool,
  showExpandableRows: PropTypes.bool,
  onTransactionClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onBulkDelete: PropTypes.func,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  enableSelection: PropTypes.bool,
  dense: PropTypes.bool,
  customColumns: PropTypes.array,
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cashbookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentStoreName: PropTypes.string,
  currentCashbookName: PropTypes.string,
};

export default TransactionList;