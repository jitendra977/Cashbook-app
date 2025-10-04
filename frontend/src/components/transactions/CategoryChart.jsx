import React, { useMemo } from 'react';
import { 
  Box, Paper, Typography, Stack, Chip, Alert, CircularProgress,
  Tooltip, useTheme 
} from '@mui/material';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Category, TrendingUp, TrendingDown } from '@mui/icons-material';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'
];

const CategoryChart = ({ 
  cashbookId, 
  dateRange, 
  data = [], 
  detailed = false,
  loading = false,
  error = null,
  chartType = 'pie', // 'pie' or 'bar'
  showLegend = true,
  showStats = true
}) => {
  const theme = useTheme();

  // Process and format chart data
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Transform data for recharts
    return data.map((item, index) => ({
      name: item.category_name || item.name || `Category ${index + 1}`,
      value: parseFloat(item.total || item.amount || item.value || 0),
      count: item.count || item.transaction_count || 0,
      percentage: item.percentage || 0,
      color: COLORS[index % COLORS.length]
    }));
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const highest = chartData.reduce((max, item) => 
      item.value > max.value ? item : max, chartData[0]
    );
    const lowest = chartData.reduce((min, item) => 
      item.value < min.value ? item : min, chartData[0]
    );

    return {
      total,
      categories: chartData.length,
      highest,
      lowest,
      average: total / chartData.length
    };
  }, [chartData]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2" color="primary">
            Amount: ${data.value.toFixed(2)}
          </Typography>
          {data.count > 0 && (
            <Typography variant="caption" color="text.secondary">
              Transactions: {data.count}
            </Typography>
          )}
          {data.percentage > 0 && (
            <Typography variant="caption" color="text.secondary">
              {data.percentage.toFixed(1)}%
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for small slices
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Render pie chart
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ fontSize: '12px' }}>
                {value} (${entry.payload.value.toFixed(0)})
              </span>
            )}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          style={{ fontSize: '12px' }}
        />
        <YAxis />
        <RechartsTooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        <Bar dataKey="value" fill="#8884d8">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Category color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Category Breakdown
          </Typography>
          {detailed && (
            <Chip label="Detailed" size="small" color="primary" variant="outlined" />
          )}
        </Stack>
        {cashbookId && (
          <Chip 
            label={`Cashbook #${cashbookId}`} 
            size="small" 
            variant="outlined"
          />
        )}
      </Stack>

      {/* Date Range */}
      {dateRange && (dateRange.start_date || dateRange.end_date) && (
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          {dateRange.start_date && `From: ${dateRange.start_date}`}
          {dateRange.start_date && dateRange.end_date && ' - '}
          {dateRange.end_date && `To: ${dateRange.end_date}`}
        </Typography>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && chartData.length === 0 && (
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight={300}
          sx={{ bgcolor: 'background.default', borderRadius: 2 }}
        >
          <Category sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No category data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {detailed 
              ? 'Detailed category breakdown will appear here once transactions are recorded.'
              : 'Start recording transactions to see category distribution.'}
          </Typography>
        </Box>
      )}

      {/* Chart */}
      {!loading && !error && chartData.length > 0 && (
        <Box>
          {chartType === 'pie' ? renderPieChart() : renderBarChart()}

          {/* Statistics */}
          {showStats && stats && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Statistics
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Categories:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {stats.categories}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Amount:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    ${stats.total.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Average per Category:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    ${stats.average.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Highest:
                  </Typography>
                  <Tooltip title={`${stats.highest.name}: $${stats.highest.value.toFixed(2)}`}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendingUp fontSize="small" color="success" />
                      <Typography variant="body2" fontWeight="medium">
                        {stats.highest.name}
                      </Typography>
                    </Stack>
                  </Tooltip>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Lowest:
                  </Typography>
                  <Tooltip title={`${stats.lowest.name}: $${stats.lowest.value.toFixed(2)}`}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendingDown fontSize="small" color="error" />
                      <Typography variant="body2" fontWeight="medium">
                        {stats.lowest.name}
                      </Typography>
                    </Stack>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CategoryChart;