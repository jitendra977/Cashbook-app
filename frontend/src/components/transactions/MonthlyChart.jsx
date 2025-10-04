import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
// import your chart library if needed, e.g. recharts, chart.js

const MonthlyChart = ({ cashbookId, dateRange, data, detailed }) => {
  // If you have chart data, render it here
  // Example: <LineChart data={data} ... />

  return (
    <Paper elevation={2} sx={{ p: 3, minHeight: 220, textAlign: 'center' }}>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Monthly Transactions Chart
      </Typography>
      <Box sx={{ mt: 2 }}>
        {Array.isArray(data) && data.length > 0 ? (
          // Replace with your chart component
          <Typography variant="body2" color="text.secondary">
            {/* Chart would be rendered here */}
            Chart data loaded for cashbook {cashbookId}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {detailed
              ? 'Detailed monthly chart for cashbook ' + cashbookId
              : 'Summary monthly chart for cashbook ' + cashbookId}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {dateRange?.start_date} - {dateRange?.end_date}
        </Typography>
        <Box sx={{ mt: 2, height: 120, background: '#f5f5f5', borderRadius: 2 }}>
          {/* Chart placeholder */}
        </Box>
      </Box>
    </Paper>
  );
};

export default MonthlyChart;
