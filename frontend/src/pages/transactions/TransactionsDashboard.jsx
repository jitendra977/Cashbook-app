// src/components/transactions/TransactionsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import SummaryCards from '../../components/transactions/SummaryCards';
import MonthlyChart from '../../components/transactions/MonthlyChart';
import CategoryChart from '../../components/transactions/CategoryChart';
import QuickAction from '../../components/transactions/QuickAction';
import TransactionForm from '../../components/transactions/TransactionForm';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/transactions/ErrorMessage';


import { useTransactionsContext } from '../../context/TransactionsContext';

const TransactionsDashboard = () => {
  const { storeId, cashbookId } = useParams();
  const navigate = useNavigate();
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

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [filters, setFilters] = useState({});

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const params = {
        ...filters,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      };
      
      try {
        if (storeId && cashbookId) {
          // If both store and cashbook are specified
          await fetchTransactionsByCashbook(cashbookId, params);
        } else if (storeId) {
          // If only store is specified
          await fetchTransactionsByStore(storeId, params);
        } else if (cashbookId) {
          // If only cashbook is specified
          await fetchTransactionsByCashbook(cashbookId, params);
        } else {
          // Fetch all transactions
          await fetchTransactions(params);
        }
        
        await fetchTransactionSummary(params);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      }
    };

    fetchData();
  }, [
    storeId, 
    cashbookId, 
    dateRange, 
    filters,
    fetchTransactions, 
    fetchTransactionsByStore,
    fetchTransactionsByCashbook,
    fetchTransactionSummary
  ]);

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    const params = {
      ...filters,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };
    
    if (cashbookId) params.cashbook = cashbookId;
    
    if (storeId && cashbookId) {
      fetchTransactionsByCashbook(cashbookId, params);
    } else if (storeId) {
      fetchTransactionsByStore(storeId, params);
    } else {
      fetchTransactions(params);
    }
    
    fetchTransactionSummary(params);
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

  const handleEditTransaction = (transactionId) => {
    setEditingTransactionId(transactionId);
    setShowTransactionForm(true);
  };

  const handleFormSuccess = () => {
    setShowTransactionForm(false);
    setEditingTransactionId(null);
    handleRefresh();
  };

  const handleFormCancel = () => {
    setShowTransactionForm(false);
    setEditingTransactionId(null);
  };

  const getContextInfo = () => {
    if (storeId && cashbookId) {
      return `Store ID: ${storeId} | Cashbook ID: ${cashbookId}`;
    } else if (storeId) {
      return `Store ID: ${storeId}`;
    } else if (cashbookId) {
      return `Cashbook ID: ${cashbookId}`;
    }
    return 'All Transactions';
  };

  const getQuickDateRanges = () => [
    {
      label: '7 Days',
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    },
    {
      label: '30 Days',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    },
    {
      label: 'This Month',
      start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    },
    {
      label: 'Last Month',
      start_date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      end_date: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
    }
  ];

  if (loading && (!transactions || transactions.length === 0)) {
    return (
      <div className="transactions-dashboard">
        <div className="dashboard-loading">
          <Loader />
          <p>Loading transactions data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Transactions Dashboard</h1>
          <p>Manage and analyze your financial transactions</p>
          <div className="current-context">
            <small>{getContextInfo()}</small>
          </div>
        </div>
        <div className="header-right">
          <button
            className="btn btn-success"
            onClick={handleNewTransaction}
            disabled={loading}
          >
            + Add Transaction
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Date Range Selector */}
      <div className="date-range-selector">
        <div className="date-range-inputs">
          <div className="date-range-group">
            <label htmlFor="start-date">From:</label>
            <input
              id="start-date"
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateRangeChange({
                ...dateRange,
                start_date: e.target.value
              })}
            />
          </div>
          <div className="date-range-group">
            <label htmlFor="end-date">To:</label>
            <input
              id="end-date"
              type="date"
              value={dateRange.end_date}
              onChange={(e) => handleDateRangeChange({
                ...dateRange,
                end_date: e.target.value
              })}
            />
          </div>
        </div>
        <div className="quick-dates">
          {getQuickDateRanges().map((range, index) => (
            <button
              key={index}
              className="btn btn-outline"
              onClick={() => handleDateRangeChange({
                start_date: range.start_date,
                end_date: range.end_date
              })}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          💰 Transactions ({Array.isArray(transactions) ? transactions.length : 0})
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <SummaryCards 
              summary={summary} 
              loading={loading}
            />
            
            <QuickAction 
              onNewTransaction={handleNewTransaction}
              onRefresh={handleRefresh}
              loading={loading}
            />
            
            <div className="charts-row">
              <div className="chart-container">
                <MonthlyChart 
                  storeId={storeId} 
                  cashbookId={cashbookId} 
                  dateRange={dateRange} 
                  loading={loading}
                />
              </div>
              <div className="chart-container">
                <CategoryChart 
                  storeId={storeId} 
                  cashbookId={cashbookId} 
                  dateRange={dateRange} 
                  loading={loading}
                />
              </div>
            </div>
            
            <div className="recent-transactions">
              <div className="section-header">
                <h3>Recent Transactions</h3>
                <button 
                  className="btn btn-link"
                  onClick={() => setActiveTab('transactions')}
                >
                  View All
                </button>
              </div>
              <TransactionList
                transactions={Array.isArray(transactions) ? transactions.slice(0, 10) : []}
                showPagination={false}
                onTransactionClick={handleTransactionClick}
                onEdit={handleEditTransaction}
                onRefresh={handleRefresh}
                storeId={storeId}
                cashbookId={cashbookId}
                loading={loading}
                error={error}
                showSummary={false}
                showFilters={false}
                showBulkActions={false}
                compact={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <TransactionFilters 
              onFilterChange={handleFilterChange}
              storeId={storeId}
              cashbookId={cashbookId}
              loading={loading}
            />
            <TransactionList
              transactions={Array.isArray(transactions) ? transactions : []}
              showPagination={true}
              onTransactionClick={handleTransactionClick}
              onEdit={handleEditTransaction}
              onRefresh={handleRefresh}
              storeId={storeId}
              cashbookId={cashbookId}
              loading={loading}
              error={error}
              showSummary={true}
              showFilters={false} // Already shown above
              showBulkActions={true}
              showExpandableRows={true}
              enableSelection={true}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-grid">
              <div className="analytics-card full-width">
                <MonthlyChart 
                  storeId={storeId} 
                  cashbookId={cashbookId} 
                  dateRange={dateRange} 
                  detailed={true} 
                  loading={loading}
                />
              </div>
              <div className="analytics-card full-width">
                <CategoryChart 
                  storeId={storeId} 
                  cashbookId={cashbookId} 
                  dateRange={dateRange} 
                  detailed={true} 
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal-overlay" onClick={handleFormCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingTransactionId ? 'Edit Transaction' : 'Create New Transaction'}
              </h2>
              <button 
                className="modal-close" 
                onClick={handleFormCancel}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <TransactionForm
              transactionId={editingTransactionId}
              cashbookId={cashbookId}
              storeId={storeId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsDashboard;