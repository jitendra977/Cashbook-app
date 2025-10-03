import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import SummaryCards from '../../components/transactions/SummaryCards';
import MonthlyChart from '../../components/transactions/MonthlyChart';
import CategoryChart from '../../components/transactions/CategoryChart';
import QuickAction from '../../components/transactions/QuickAction';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/transactions/ErrorMessage';
import '../../components/css/transactions/Dashboard.css';
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
    fetchTransactionTypes,
    fetchTransactionCategories,
    fetchTransactionSummary,
    setError,
  } = useTransactionsContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactionTypes();
    fetchTransactionCategories();
  }, [fetchTransactionTypes, fetchTransactionCategories]);

  useEffect(() => {
    const params = {
      cashbook: cashbookId,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };
    fetchTransactions(params);
    fetchTransactionSummary(params);
  }, [cashbookId, dateRange, fetchTransactions, fetchTransactionSummary]);

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleFilterChange = (filters) => {
    fetchTransactions({ ...filters, cashbook: cashbookId });
  };

  const handleRefresh = () => {
    const params = {
      cashbook: cashbookId,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };
    fetchTransactions(params);
    fetchTransactionSummary(params);
  };

  const handleTransactionClick = (transaction) => {
    navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions/${transaction.id}`);
  };

  if (loading && (!transactions || transactions.length === 0)) {
    return <Loader />;
  }

  return (
    <div className="transactions-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Transactions Dashboard</h1>
          <p>Manage and analyze your financial transactions</p>
        </div>
        <div className="header-right">
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Date Range Selector */}
      <div className="date-range-selector">
        <div className="date-range-group">
          <label>From:</label>
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => handleDateRangeChange({
              ...dateRange,
              start_date: e.target.value
            })}
          />
        </div>
        <div className="date-range-group">
          <label>To:</label>
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => handleDateRangeChange({
              ...dateRange,
              end_date: e.target.value
            })}
          />
        </div>
        <div className="quick-dates">
          <button
            onClick={() => handleDateRangeChange({
              start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0]
            })}
          >
            7 Days
          </button>
          <button
            onClick={() => handleDateRangeChange({
              start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0]
            })}
          >
            30 Days
          </button>
          <button
            onClick={() => {
              const startOfMonth = new Date();
              startOfMonth.setDate(1);
              handleDateRangeChange({
                start_date: startOfMonth.toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0]
              });
            }}
          >
            This Month
          </button>
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
          💰 Transactions
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
            <SummaryCards summary={summary} />
            <QuickAction />
            <div className="charts-row">
              <div className="chart-container">
                <MonthlyChart cashbookId={cashbookId} dateRange={dateRange} />
              </div>
              <div className="chart-container">
                <CategoryChart cashbookId={cashbookId} dateRange={dateRange} />
              </div>
            </div>
            <div className="recent-transactions">
              <h3>Recent Transactions</h3>
              <TransactionList
                transactions={Array.isArray(transactions) ? transactions.slice(0, 10) : []}
                showPagination={false}
                onTransactionClick={handleTransactionClick}
              />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <TransactionFilters onFilterChange={handleFilterChange} />
            <TransactionList
              transactions={Array.isArray(transactions) ? transactions : []}
              showPagination={true}
              onTransactionClick={handleTransactionClick}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-grid">
              <div className="analytics-card full-width">
                <MonthlyChart cashbookId={cashbookId} dateRange={dateRange} detailed={true} />
              </div>
              <div className="analytics-card full-width">
                <CategoryChart cashbookId={cashbookId} dateRange={dateRange} detailed={true} />
              </div>
              {/* Add more analytics components here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsDashboard;