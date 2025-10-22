import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, Button, Stack, IconButton,
  Drawer, useTheme, useMediaQuery, Divider, Badge, SpeedDial,
  SpeedDialAction, SpeedDialIcon, Alert, Snackbar, CircularProgress,
  TextField, Menu, MenuItem, ListItemIcon, ListItemText, Chip
} from '@mui/material';
import {
  Receipt, Add, Refresh, FilterList, CalendarToday, ArrowBack,
  FileDownload, Download, Upload, PictureAsPdf, QrCode2, MoreVert
} from '@mui/icons-material';
import ExportDialog from '../../components/transactions/ExportDilog';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import TransactionForm from '../../components/transactions/TransactionForm';
import { useTransactionsContext } from '../../context/TransactionsContext';

// Quick Actions Menu
const QuickActionsMenu = ({ anchorEl, open, onClose, onAction }) => {
  const actions = [
    { icon: <Download />, label: 'Import Transactions', value: 'import' },
    { icon: <Upload />, label: 'Export as CSV', value: 'export-csv' },
    { icon: <PictureAsPdf />, label: 'Export as PDF', value: 'export-pdf' },
    { icon: <QrCode2 />, label: 'Scan Receipt', value: 'scan-receipt' },
  ];

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {actions.map((action) => (
        <MenuItem key={action.value} onClick={() => { onAction(action.value); onClose(); }}>
          <ListItemIcon>{action.icon}</ListItemIcon>
          <ListItemText>{action.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

// Quick Date Selector
const QuickDateSelector = ({ dateRange, onChange }) => {
  const today = new Date();
  const ranges = [
    {
      label: 'Today',
      start: today.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    },
    {
      label: '7 Days',
      start: new Date(today.getTime() - 6 * 86400000).toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    },
    {
      label: '30 Days',
      start: new Date(today.getTime() - 29 * 86400000).toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    },
    {
      label: 'This Month',
      start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    },
  ];

  const isActive = (range) => 
    dateRange.start_date === range.start && dateRange.end_date === range.end;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {ranges.map((range) => (
        <Chip
          key={range.label}
          label={range.label}
          onClick={() => onChange({ start_date: range.start, end_date: range.end })}
          color={isActive(range) ? 'primary' : 'default'}
          variant={isActive(range) ? 'filled' : 'outlined'}
          size="small"
        />
      ))}
    </Stack>
  );
};

const TransactionsDashboard = () => {
  const { storeId, cashbookId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchTransactionsByStore,
    fetchTransactionsByCashbook,
    fetchTransactionSummary,
    setError,
  } = useTransactionsContext();

  // Initialize date range to last 30 days
  const getInitialDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 86400000);
    return {
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0]
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange);
  const [showFilters, setShowFilters] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [filters, setFilters] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [quickActionsAnchor, setQuickActionsAnchor] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Fetch transactions - FIXED: Added proper dependencies and debugging
  useEffect(() => {
    const fetchData = async () => {
      const params = { 
        start_date: dateRange.start_date, 
        end_date: dateRange.end_date,
        ...filters
      };
      
      console.log('Fetching transactions with params:', params);
      console.log('Date range:', { from: dateRange.start_date, to: dateRange.end_date });
      
      try {
        if (cashbookId) {
          await fetchTransactionsByCashbook(cashbookId, params);
        } else if (storeId) {
          await fetchTransactionsByStore(storeId, params);
        } else {
          await fetchTransactions(params);
        }
        await fetchTransactionSummary(params);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        showSnackbar('Failed to load transactions', 'error');
      }
    };
    fetchData();
  }, [dateRange.start_date, dateRange.end_date, filters, cashbookId, storeId, fetchTransactions, fetchTransactionsByStore, fetchTransactionsByCashbook, fetchTransactionSummary]);

  // Handlers
  const handleRefresh = async () => {
    const params = { 
      ...filters, 
      start_date: dateRange.start_date, 
      end_date: dateRange.end_date 
    };
    
    try {
      if (cashbookId) {
        await fetchTransactionsByCashbook(cashbookId, params);
      } else if (storeId) {
        await fetchTransactionsByStore(storeId, params);
      } else {
        await fetchTransactions(params);
      }
      await fetchTransactionSummary(params);
      showSnackbar('Refreshed successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to refresh', 'error');
    }
  };

  const handleTransactionClick = (tx) => {
    if (storeId && cashbookId) {
      navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions/${tx.id}`);
    } else if (cashbookId) {
      navigate(`/cashbooks/${cashbookId}/transactions/${tx.id}`);
    } else {
      navigate(`/transactions/${tx.id}`);
    }
  };

  const handleNewTransaction = () => {
    setEditingTransactionId(null);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransactionId(tx.id);
    setShowTransactionForm(true);
  };

  const handleFormSuccess = () => {
    setShowTransactionForm(false);
    setEditingTransactionId(null);
    handleRefresh();
    showSnackbar('Transaction saved successfully', 'success');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleQuickAction = (action) => {
    if (action === 'export-csv' || action === 'export-pdf') {
      setExportDialogOpen(true);
    } else {
      showSnackbar(`${action} coming soon`, 'info');
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const speedDialActions = [
    { icon: <Add />, name: 'New Transaction', action: handleNewTransaction },
    { icon: <FileDownload />, name: 'Export', action: () => setExportDialogOpen(true) },
    { icon: <Refresh />, name: 'Refresh', action: handleRefresh },
    { icon: <FilterList />, name: 'Filters', action: () => setShowFilters(true) },
  ];

  const transactionList = Array.isArray(transactions) ? transactions : [];

  if (loading && transactionList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">Loading transactions...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Transactions
        </Typography>
        {!isMobile && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'inherit'}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              endIcon={<MoreVert />}
              onClick={(e) => setQuickActionsAnchor(e.currentTarget)}
            >
              More
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewTransaction}
              size="large"
            >
              New Transaction
            </Button>
          </Stack>
        )}
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Date Range Selector */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <CalendarToday color="primary" />
          <QuickDateSelector dateRange={dateRange} onChange={handleDateRangeChange} />
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              type="date"
              size="small"
              label="From"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Typography>to</Typography>
            <TextField
              type="date"
              size="small"
              label="To"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Transactions List */}
      <Paper elevation={2}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              All Transactions
            </Typography>
            <Badge badgeContent={transactionList.length} color="primary" max={9999}>
              <Receipt color="action" />
            </Badge>
          </Stack>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <TransactionList
            transactions={transactionList}
            showPagination={true}
            showSummary={true}
            showFilters={false}
            showBulkActions={true}
            showExpandableRows={true}
            onTransactionClick={handleTransactionClick}
            onEdit={handleEditTransaction}
            onRefresh={handleRefresh}
            onExport={() => setExportDialogOpen(true)}
            loading={loading}
            error={error}
            enableSelection={true}
          />
        </Box>
      </Paper>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 3 } }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Advanced Filters</Typography>
            <IconButton onClick={() => setShowFilters(false)}>
              <ArrowBack />
            </IconButton>
          </Stack>
          <Divider />
          <TransactionFilters
            onFilterChange={(f) => {
              setFilters(f);
              setShowFilters(false);
            }}
            showAdvanced={true}
            autoApply={false}
          />
        </Stack>
      </Drawer>

      {/* Transaction Form Drawer */}
      <Drawer
        anchor="right"
        open={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingTransactionId ? 'Edit Transaction' : 'New Transaction'}
            </Typography>
            <IconButton onClick={() => setShowTransactionForm(false)}>
              <ArrowBack />
            </IconButton>
          </Stack>
          <Divider />
          <TransactionForm
            transactionId={editingTransactionId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowTransactionForm(false)}
          />
        </Stack>
      </Drawer>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        filters={filters}
        dateRange={dateRange}
        storeId={storeId}
        cashbookId={cashbookId}
      />

      {/* Quick Actions Menu */}
      <QuickActionsMenu
        anchorEl={quickActionsAnchor}
        open={Boolean(quickActionsAnchor)}
        onClose={() => setQuickActionsAnchor(null)}
        onAction={handleQuickAction}
      />

      {/* Mobile Speed Dial */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Quick actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TransactionsDashboard;