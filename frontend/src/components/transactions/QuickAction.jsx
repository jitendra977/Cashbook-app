import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { Add, FileDownload } from '@mui/icons-material';

const QuickAction = ({
  onAdd,
  onExport,
  addLabel = "Add Transaction",
  exportLabel = "Export CSV"
}) => {
  return (
    <Box display="flex" gap={2} mb={3}>
      <Tooltip title={addLabel}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={onAdd}
        >
          {addLabel}
        </Button>
      </Tooltip>
      <Tooltip title={exportLabel}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FileDownload />}
          onClick={onExport}
        >
          {exportLabel}
        </Button>
      </Tooltip>
    </Box>
  );
};

export default QuickAction;
