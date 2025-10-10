import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Paper, Tabs, Tab, Typography, Button, Stack,
  Chip, IconButton, Drawer, useTheme, useMediaQuery, Card, CardContent,
  Divider, Tooltip, Badge, SpeedDial, SpeedDialAction, SpeedDialIcon,
  Breadcrumbs, Link, Alert, Snackbar, Fade, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Menu, MenuItem, ListItemIcon, ListItemText, Zoom
} from '@mui/material';
import {
  Dashboard, Receipt, Analytics, Add, Refresh, FilterList,
  TrendingUp, TrendingDown, AttachMoney, CalendarToday, Store,
  AccountBalance, ArrowBack, Settings, FileDownload, Share,
  Visibility, Edit, DateRange, Category, MoreVert,
  ImportExport, PictureAsPdf, GridOn, BarChart,
  Download, Upload, QrCode2, Search, Sort
} from '@mui/icons-material';

import TransactionList from '../../components/transactions/TransactionList';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import MonthlyChart from '../../components/transactions/MonthlyChart';
import CategoryChart from '../../components/transactions/CategoryChart';
import TransactionForm from '../../components/transactions/TransactionForm';
import transactionsAPI from '../../api/transactions';
import { useTransactionsContext } from '../../context/TransactionsContext';

// Enhanced Summary Card Component
const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  loading = false,
  onClick
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          border: `1px solid ${theme.palette[color].main}20`
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="h5" fontWeight="bold" color="text.disabled">
                    Loading...
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
                  {value}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: `${color}.lighter`,
                color: `${color}.main`,
                width: 56,
                height: 56,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Icon fontSize="large" />
            </Avatar>
          </Stack>

          {trend && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {trend.value > 0 ? (
                <TrendingUp fontSize="small" color="success" />
              ) : (
                <TrendingDown fontSize="small" color="error" />
              )}
              <Typography
                variant="body2"
                color={trend.value > 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {Math.abs(trend.value)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs {trend.period}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Quick Actions Menu
const QuickActionsMenu = ({ anchorEl, open, onClose, onAction }) => {
  const actions = [
    { icon: <Download />, label: 'Import Transactions', value: 'import' },
    { icon: <Upload />, label: 'Export as CSV', value: 'export-csv' },
    { icon: <PictureAsPdf />, label: 'Export as PDF', value: 'export-pdf' },
    { icon: <QrCode2 />, label: 'Scan Receipt', value: 'scan-receipt' },
    { icon: <BarChart />, label: 'Advanced Analytics', value: 'analytics' },
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {actions.map((action) => (
        <MenuItem
          key={action.value}
          onClick={() => {
            onAction(action.value);
            onClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {action.icon}
          </ListItemIcon>
          <ListItemText primary={action.label} />
        </MenuItem>
      ))}
    </Menu>
  );
};

// Search and Filter Bar
const SearchFilterBar = ({
  onSearch,
  onFilterToggle,
  onSort,
  filtersActive,
  searchQuery,
}) => {
  const [search, setSearch] = useState(searchQuery || '');

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setTimeout(() => onSearch(value), 300);
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search transactions..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          sx={{ maxWidth: 400 }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" flexGrow={1}>
          <Button
            variant={filtersActive ? "contained" : "outlined"}
            startIcon={<FilterList />}
            onClick={onFilterToggle}
            color={filtersActive ? "primary" : "inherit"}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<Sort />}
            onClick={onSort}
          >
            Sort
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

// Quick Date Selector Component
const QuickDateSelector = ({ dateRange, onChange }) => {
  const ranges = useMemo(() => [
    {
      label: 'Today',
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    {
      label: '7 Days',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    {
      label: '30 Days',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    {
      label: 'This Month',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    {
      label: 'Last Month',
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
    }
  ], []);

  const isActive = (range) => {
    return dateRange.start_date === range.start && dateRange.end_date === range.end;
  };

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {ranges.map((range) => (
        <Chip
          key={range.label}
          label={range.label}
          onClick={() => onChange({ start_date: range.start, end_date: range.end })}
          color={isActive(range) ? 'primary' : 'default'}
          variant={isActive(range) ? 'filled' : 'outlined'}
          icon={<CalendarToday />}
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
    summary,
    loading,
    error,
    fetchTransactions,
    fetchTransactionsByStore,
    fetchTransactionsByCashbook,
    fetchTransactionSummary,
    setError,
  } = useTransactionsContext();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [filters, setFilters] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [storeInfo, setStoreInfo] = useState(null);
  const [cashbookInfo, setCashbookInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickActionsAnchor, setQuickActionsAnchor] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Fetch store and cashbook info on mount
  useEffect(() => {
    const fetchContextInfo = async () => {
      try {
        let data;

        if (storeId && cashbookId) {
          data = await transactionsAPI.getTransactionsByCashbook(cashbookId, { page_size: 1 });
        } else if (storeId) {
          data = await transactionsAPI.getTransactionsByStore(storeId, { page_size: 1 });
        } else if (cashbookId) {
          data = await transactionsAPI.getTransactionsByCashbook(cashbookId, { page_size: 1 });
        }

        if (data) {
          const txArray = data?.results || (Array.isArray(data) ? data : []);

          if (txArray.length > 0) {
            const tx = txArray[0];
            if (tx.store_name && storeId) {
              setStoreInfo({ id: storeId, name: tx.store_name });
            }
            if (tx.cashbook_name && cashbookId) {
              setCashbookInfo({ id: cashbookId, name: tx.cashbook_name });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch context info:', err);
      }
    };

    if (storeId || cashbookId) {
      fetchContextInfo();
    }
  }, [storeId, cashbookId]);

  // Memoized data calculations - use summary from API if available
  const summaryStats = useMemo(() => {
    // Prefer API summary data if available
    if (summary && typeof summary === 'object' && Object.keys(summary).length > 0) {
      const apiIncome = parseFloat(summary.total_income || 0);
      const apiExpense = parseFloat(summary.total_expense || 0);

      return {
        total: parseFloat(summary.total_amount || 0),
        income: apiIncome,
        expense: apiExpense,
        balance: apiIncome - apiExpense,
        count: parseInt(summary.total_transactions || 0),
        completed: parseInt(summary.completed_transactions || 0),
        pending: parseInt(summary.pending_transactions || 0)
      };
    }

    // Fallback to calculating from transactions array
    const txArray = Array.isArray(transactions) ? transactions : [];
    const total = txArray.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const income = txArray.filter(tx =>
      tx.type_name?.toLowerCase() === 'income'
    ).reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const expense = txArray.filter(tx =>
      tx.type_name?.toLowerCase() === 'expense'
    ).reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const completed = txArray.filter(tx => tx.status === 'completed').length;
    const pending = txArray.filter(tx => tx.status === 'pending').length;

    return {
      total,
      income,
      expense,
      balance: income - expense,
      count: txArray.length,
      completed,
      pending
    };
  }, [transactions, summary]);

  // Filtered transactions based on search
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions || [];

    const txArray = Array.isArray(transactions) ? transactions : [];
    return txArray.filter(tx =>
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount?.toString().includes(searchQuery)
    );
  }, [transactions, searchQuery]);

  // Fetch transaction data
  useEffect(() => {
    const fetchData = async () => {
      const params = {
        ...filters,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      };

      try {
        if (storeId && cashbookId) {
          await fetchTransactionsByCashbook(cashbookId, params);
        } else if (storeId) {
          await fetchTransactionsByStore(storeId, params);
        } else if (cashbookId) {
          await fetchTransactionsByCashbook(cashbookId, params);
        } else {
          await fetchTransactions(params);
        }

        await fetchTransactionSummary(params);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        showSnackbar('Failed to load transactions', 'error');
      }
    };

    fetchData();
  }, [dateRange, filters]);

  // Update context info from transactions if available
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const firstTx = transactions[0];

      if (storeId && firstTx.store_name && !storeInfo) {
        setStoreInfo({ id: storeId, name: firstTx.store_name });
      }
      if (cashbookId && firstTx.cashbook_name && !cashbookInfo) {
        setCashbookInfo({ id: cashbookId, name: firstTx.cashbook_name });
      }
    }
  }, [transactions, storeId, cashbookId, storeInfo, cashbookInfo]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = async () => {
    const params = {
      ...filters,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };

    try {
      if (storeId && cashbookId) {
        await fetchTransactionsByCashbook(cashbookId, params);
      } else if (storeId) {
        await fetchTransactionsByStore(storeId, params);
      } else {
        await fetchTransactions(params);
      }

      await fetchTransactionSummary(params);
      showSnackbar('Data refreshed successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to refresh data', 'error');
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleTransactionClick = (transaction) => {
    if (storeId && cashbookId) {
      navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions/${transaction.id}`);
    } else if (cashbookId) {
      navigate(`/cashbooks/${cashbookId}/transactions/${transaction.id}`);
    } else {
      navigate(`/transactions/${transaction.id}`);
    }
  };

  const handleNewTransaction = () => {
    setEditingTransactionId(null);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
    setShowTransactionForm(true);
  };

  const handleFormSuccess = () => {
    setShowTransactionForm(false);
    setEditingTransactionId(null);
    handleRefresh();
    showSnackbar('Transaction saved successfully', 'success');
  };

  const handleFormCancel = () => {
    setShowTransactionForm(false);
    setEditingTransactionId(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'export-csv':
        setExportDialogOpen(true);
        break;
      case 'import':
        showSnackbar('Import functionality coming soon', 'info');
        break;
      case 'scan-receipt':
        showSnackbar('Receipt scanning coming soon', 'info');
        break;
      default:
        showSnackbar(`${action} functionality coming soon`, 'info');
    }
  };

  // Context info for breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = [
      { label: 'Home', path: '/', icon: <Dashboard fontSize="small" /> }
    ];

    if (storeId) {
      crumbs.push({
        label: storeInfo?.name || `Store ${storeId}`,
        path: `/stores/${storeId}`,
        icon: <Store fontSize="small" />
      });

      if (cashbookId) {
        crumbs.push({
          label: 'Cashbooks',
          path: `/stores/${storeId}/cashbooks`,
          icon: <AccountBalance fontSize="small" />
        });
      }
    }

    if (cashbookId) {
      crumbs.push({
        label: cashbookInfo?.name || `Cashbook ${cashbookId}`,
        path: storeId
          ? `/stores/${storeId}/cashbooks/${cashbookId}`
          : `/cashbooks/${cashbookId}`,
        icon: <AccountBalance fontSize="small" />
      });
    }

    crumbs.push({
      label: 'Transactions',
      path: null,
      icon: <Receipt fontSize="small" />
    });

    return crumbs;
  };

  // Speed dial actions
  const speedDialActions = [
    { icon: <Add />, name: 'New Transaction', action: handleNewTransaction },
    { icon: <FileDownload />, name: 'Export', action: () => setExportDialogOpen(true) },
    { icon: <Refresh />, name: 'Refresh', action: handleRefresh },
    { icon: <FilterList />, name: 'Filters', action: () => setShowFilters(true) },
  ];

  if (loading && (!transactions || transactions.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading transactions...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator="›"
        sx={{ mb: 2 }}
        aria-label="breadcrumb"
      >
        {getBreadcrumbs().map((crumb, index) => {
          const isLast = index === getBreadcrumbs().length - 1;

          return crumb.path && !isLast ? (
            <Link
              key={index}
              underline="hover"
              color="inherit"
              component="button"
              onClick={() => navigate(crumb.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {crumb.icon}
              {crumb.label}
            </Link>
          ) : (
            <Typography
              key={index}
              color={isLast ? 'text.primary' : 'text.secondary'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: isLast ? 600 : 400
              }}
            >
              {crumb.icon}
              {crumb.label}
            </Typography>
          );
        })}
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <Typography variant="h3" fontWeight="bold">
              Transactions Dashboard
            </Typography>
            {(storeInfo || cashbookInfo) && (
              <Stack direction="row" spacing={1}>
                {storeInfo && (
                  <Chip
                    icon={<Store />}
                    label={storeInfo.name}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {cashbookInfo && (
                  <Chip
                    icon={<AccountBalance />}
                    label={cashbookInfo.name}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Manage and analyze your financial transactions
            {storeInfo && ` for ${storeInfo.name}`}
            {cashbookInfo && ` - ${cashbookInfo.name}`}
          </Typography>
        </Box>

        {!isMobile && (
          <Stack direction="row" spacing={2}>
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
          <DateRange color="primary" />
          <QuickDateSelector dateRange={dateRange} onChange={handleDateRangeChange} />
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} flexGrow={1}>
            <TextField
              type="date"
              size="small"
              value={dateRange.start_date}
              onChange={(e) => handleDateRangeChange({ ...dateRange, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Typography alignSelf="center">to</Typography>
            <TextField
              type="date"
              size="small"
              value={dateRange.end_date}
              onChange={(e) => handleDateRangeChange({ ...dateRange, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Search and Filter Bar */}
      <SearchFilterBar
        onSearch={handleSearch}
        onFilterToggle={() => setShowFilters(!showFilters)}
        onSort={() => showSnackbar('Sort functionality coming soon', 'info')}
        filtersActive={Object.keys(filters).length > 0}
        searchQuery={searchQuery}
      />

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Balance"
            value={`$${(summaryStats.balance || 0).toFixed(2)}`}
            subtitle={`${summaryStats.count || 0} transactions`}
            icon={AttachMoney}
            color="primary"
            trend={summaryStats.balance > 0 ? { value: 12.5, period: 'last month' } : null}
            loading={loading}
            onClick={() => setActiveTab(0)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Income"
            value={`$${(summaryStats.income || 0).toFixed(2)}`}
            subtitle="This period"
            icon={TrendingUp}
            color="success"
            loading={loading}
            onClick={() => setFilters({ type: 'income' })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Expenses"
            value={`$${(summaryStats.expense || 0).toFixed(2)}`}
            subtitle="This period"
            icon={TrendingDown}
            color="error"
            loading={loading}
            onClick={() => setFilters({ type: 'expense' })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Completed"
            value={summaryStats.completed || 0}
            subtitle={`${summaryStats.pending || 0} pending`}
            icon={Receipt}
            color="info"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Dashboard />} label="Overview" iconPosition="start" />
          <Tab
            icon={<Receipt />}
            label={
              <Badge badgeContent={filteredTransactions.length} color="primary" max={999}>
                Transactions
              </Badge>
            }
            iconPosition="start"
          />
          <Tab icon={<Analytics />} label="Analytics" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Fade in={activeTab === 0}>
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <MonthlyChart
                      storeId={storeId}
                      cashbookId={cashbookId}
                      dateRange={dateRange}
                      detailed={true}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <CategoryChart
                      storeId={storeId}
                      cashbookId={cashbookId}
                      dateRange={dateRange}
                      detailed={true}
                      showStats={true}
                    />
                  </Grid>
                </Grid>

                <Paper elevation={1} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Recent Transactions</Typography>
                    <Button
                      size="small"
                      onClick={() => setActiveTab(1)}
                      endIcon={<Visibility />}
                    >
                      View All
                    </Button>
                  </Stack>
                  <TransactionList
                    transactions={filteredTransactions.slice(0, 5)}
                    showPagination={false}
                    showSummary={false}
                    showFilters={false}
                    showBulkActions={false}
                    showExpandableRows={false}
                    onTransactionClick={handleTransactionClick}
                    onEdit={handleEditTransaction}
                    loading={loading}
                    dense={true}
                  />
                </Paper>
              </Stack>
            </Fade>
          )}

          {/* Transactions Tab */}
          {activeTab === 1 && (
            <Fade in={activeTab === 1}>
              <Box>
                <TransactionList
                  transactions={filteredTransactions}
                  showPagination={true}
                  showSummary={true}
                  showFilters={true}
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
            </Fade>
          )}

          {/* Analytics Tab */}
          {activeTab === 2 && (
            <Fade in={activeTab === 2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <MonthlyChart
                    storeId={storeId}
                    cashbookId={cashbookId}
                    dateRange={dateRange}
                    detailed={true}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CategoryChart
                    cashbookId={cashbookId}
                    dateRange={dateRange}
                    data={[]}
                    detailed={true}
                    loading={loading}
                    chartType="pie"
                    showLegend={true}
                    showStats={true}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CategoryChart
                    cashbookId={cashbookId}
                    dateRange={dateRange}
                    data={[]}
                    detailed={true}
                    loading={loading}
                    chartType="bar"
                    showLegend={false}
                    showStats={true}
                  />
                </Grid>
              </Grid>
            </Fade>
          )}
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
            onFilterChange={(newFilters) => {
              handleFilterChange(newFilters);
              setShowFilters(false);
            }}
            showAdvanced={true}
            autoApply={false}
          />
        </Stack>
      </Drawer>

      {/* Transaction Form Dialog */}
      <Drawer
        anchor="right"
        open={showTransactionForm}
        onClose={handleFormCancel}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingTransactionId ? 'Edit Transaction' : 'New Transaction'}
            </Typography>
            <IconButton onClick={handleFormCancel}>
              <ArrowBack />
            </IconButton>
          </Stack>
          <Divider />
          <TransactionForm
            transactionId={editingTransactionId}
            cashbookId={cashbookId}
            storeId={storeId}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Stack>
      </Drawer>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Transactions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose export format and options for your transactions data.
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<GridOn />}
              fullWidth
              onClick={() => {
                showSnackbar('CSV export functionality coming soon', 'info');
                setExportDialogOpen(false);
              }}
            >
              Export as CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              fullWidth
              onClick={() => {
                showSnackbar('PDF export functionality coming soon', 'info');
                setExportDialogOpen(false);
              }}
            >
              Export as PDF Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<BarChart />}
              fullWidth
              onClick={() => {
                showSnackbar('Excel export functionality coming soon', 'info');
                setExportDialogOpen(false);
              }}
            >
              Export for Excel
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

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
          TransitionComponent={Zoom}
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TransactionsDashboard;