import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Paper, Tabs, Tab, Typography, Button, Stack,
  Chip, IconButton, Drawer, useTheme, useMediaQuery, Card, CardContent,
  Divider, Tooltip, Badge, SpeedDial, SpeedDialAction, SpeedDialIcon,
  Breadcrumbs, Link, Alert, Snackbar, Fade, Slide, Avatar, CircularProgress
} from '@mui/material';
import {
  Dashboard, Receipt, Analytics, Add, Refresh, FilterList,
  TrendingUp, TrendingDown, AttachMoney, CalendarToday, Store,
  AccountBalance, ArrowBack, Settings, FileDownload, Share,
  Visibility, Edit, DateRange, Category
} from '@mui/icons-material';

import TransactionList from '../../components/transactions/TransactionList';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import MonthlyChart from '../../components/transactions/MonthlyChart';
import CategoryChart from '../../components/transactions/CategoryChart';
import TransactionForm from '../../components/transactions/TransactionForm';
import { useTransactionsContext } from '../../context/TransactionsContext';

// Enhanced Summary Card Component
const SummaryCard = ({ title, value, subtitle, icon: Icon, color, trend, loading }) => {
  const theme = useTheme();
  
  return (
    <Card elevation={2} sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4" fontWeight="bold" color={color}>
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
                height: 56
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

// Quick Date Range Selector
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

  // Fetch data
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

        // Extract store and cashbook info from first transaction
        if (transactions && transactions.length > 0) {
          const firstTx = transactions[0];
          if (firstTx.store_name) {
            setStoreInfo({ id: storeId, name: firstTx.store_name });
          }
          if (firstTx.cashbook_name) {
            setCashbookInfo({ id: cashbookId, name: firstTx.cashbook_name });
          }
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        showSnackbar('Failed to load transactions', 'error');
      }
    };

    fetchData();
  }, [storeId, cashbookId, dateRange, filters]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

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

  const handleExport = () => {
    showSnackbar('Export functionality coming soon', 'info');
  };

  // Context info for breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = [
      { label: 'Dashboard', path: '/', icon: <Dashboard fontSize="small" /> }
    ];
    
    if (storeInfo) {
      crumbs.push({ 
        label: storeInfo.name, 
        path: `/stores/${storeId}`, 
        icon: <Store fontSize="small" /> 
      });
    } else if (storeId) {
      crumbs.push({ 
        label: `Store ${storeId}`, 
        path: `/stores/${storeId}`, 
        icon: <Store fontSize="small" /> 
      });
    }
    
    if (cashbookInfo) {
      crumbs.push({ 
        label: cashbookInfo.name, 
        path: cashbookId, 
        icon: <AccountBalance fontSize="small" /> 
      });
    } else if (cashbookId) {
      crumbs.push({ 
        label: `Cashbook ${cashbookId}`, 
        path: cashbookId, 
        icon: <AccountBalance fontSize="small" /> 
      });
    }
    
    crumbs.push({ label: 'Transactions', path: null, icon: <Receipt fontSize="small" /> });
    
    return crumbs;
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const txArray = Array.isArray(transactions) ? transactions : [];
    const total = txArray.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const income = txArray.filter(tx => tx.type_name === 'Income').reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const expense = txArray.filter(tx => tx.type_name === 'Expense').reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const completed = txArray.filter(tx => tx.status === 'completed').length;
    
    return {
      total,
      income,
      expense,
      balance: income - expense,
      count: txArray.length,
      completed
    };
  }, [transactions]);

  // Speed dial actions
  const speedDialActions = [
    { icon: <Add />, name: 'New Transaction', action: handleNewTransaction },
    { icon: <FileDownload />, name: 'Export', action: handleExport },
    { icon: <Refresh />, name: 'Refresh', action: handleRefresh },
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
      <Breadcrumbs sx={{ mb: 2 }}>
        {getBreadcrumbs().map((crumb, index) => (
          crumb.path ? (
            <Link
              key={index}
              underline="hover"
              color="inherit"
              href={crumb.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(crumb.path);
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {crumb.icon}
              {crumb.label}
            </Link>
          ) : (
            <Typography key={index} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {crumb.icon}
              {crumb.label}
            </Typography>
          )
        ))}
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <Typography variant="h3" fontWeight="bold">
              Transactions Dashboard
            </Typography>
            
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

      {/* Context Information Card */}
      {(storeInfo || cashbookInfo) && (
        <Paper elevation={2} sx={{ p: 2.5, mb: 3, bgcolor: 'primary.lighter' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" spacing={2} flexGrow={1} flexWrap="wrap">
              {storeInfo && (
                <Card sx={{ minWidth: 200 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <Store />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Store
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {storeInfo.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}
              
              {cashbookInfo && (
                <Card sx={{ minWidth: 200 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                        <AccountBalance />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Cashbook
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {cashbookInfo.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Card sx={{ minWidth: 200 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                      <CalendarToday />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Period
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {new Date(dateRange.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(dateRange.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Date Range Selector */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <DateRange color="primary" />
          <QuickDateSelector dateRange={dateRange} onChange={handleDateRangeChange} />
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} flexGrow={1}>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateRangeChange({ ...dateRange, start_date: e.target.value })}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${theme.palette.divider}`,
                fontSize: '14px'
              }}
            />
            <Typography alignSelf="center">to</Typography>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => handleDateRangeChange({ ...dateRange, end_date: e.target.value })}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${theme.palette.divider}`,
                fontSize: '14px'
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Balance"
            value={`$${summaryStats.balance.toFixed(2)}`}
            subtitle={`${summaryStats.count} transactions`}
            icon={AttachMoney}
            color="primary"
            trend={{ value: 12.5, period: 'last month' }}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Income"
            value={`$${summaryStats.income.toFixed(2)}`}
            subtitle="This period"
            icon={TrendingUp}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Expenses"
            value={`$${summaryStats.expense.toFixed(2)}`}
            subtitle="This period"
            icon={TrendingDown}
            color="error"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Completed"
            value={summaryStats.completed}
            subtitle={`of ${summaryStats.count} total`}
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
              <Badge badgeContent={summaryStats.count} color="primary" max={999}>
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
                    transactions={Array.isArray(transactions) ? transactions.slice(0, 5) : []}
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
                  transactions={Array.isArray(transactions) ? transactions : []}
                  showPagination={true}
                  showSummary={true}
                  showFilters={true}
                  showBulkActions={true}
                  showExpandableRows={true}
                  onTransactionClick={handleTransactionClick}
                  onEdit={handleEditTransaction}
                  onRefresh={handleRefresh}
                  onExport={handleExport}
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
            onFilterChange={(filters) => {
              handleFilterChange(filters);
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