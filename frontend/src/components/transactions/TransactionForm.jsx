import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Grid, MenuItem,
  FormControl, InputLabel, Select, FormControlLabel, Checkbox,
  InputAdornment, Stack, Alert, CircularProgress, Chip, alpha, useTheme,
} from '@mui/material';
import {
  Save, Cancel, RestartAlt, AttachMoney, CalendarToday,
  Description, Receipt, Repeat, CheckCircle, Pending, Block,
  TrendingUp, TrendingDown,
} from '@mui/icons-material';
import { useTransactionsContext } from '../../context/TransactionsContext';

const TransactionForm = ({ transactionId, onSuccess, onCancel }) => {
  const { storeId, cashbookId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const {
    transactionTypes, transactionCategories, loading, error,
    fetchTransactionTypes, fetchTransactionCategories, fetchTransaction,
    createTransaction, updateTransaction, setError,
  } = useTransactionsContext();

  const initialFormState = {
    type: '', category: '', amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    value_date: new Date().toISOString().split('T')[0],
    description: '', reference_number: '', status: 'completed',
    is_recurring: false, recurring_pattern: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const isEditMode = !!transactionId;

  useEffect(() => {
    fetchTransactionTypes();
    fetchTransactionCategories();
  }, []);

  useEffect(() => {
    if (transactionId) {
      fetchTransaction(transactionId).then(tx => {
        if (tx) {
          const data = {
            type: tx.type?.id?.toString() || '',
            category: tx.category?.id?.toString() || '',
            amount: tx.amount || '',
            transaction_date: tx.transaction_date || initialFormState.transaction_date,
            value_date: tx.value_date || tx.transaction_date || initialFormState.value_date,
            description: tx.description || '',
            reference_number: tx.reference_number || '',
            status: tx.status || 'completed',
            is_recurring: tx.is_recurring || false,
            recurring_pattern: tx.recurring_pattern || '',
          };
          setFormData(data);
          setOriginalData(data);
        }
      }).catch(() => setError('Failed to load transaction'));
    } else {
      setOriginalData(initialFormState);
    }
  }, [transactionId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.type) errors.type = 'Transaction type is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount is required';
    if (!formData.transaction_date) errors.transaction_date = 'Transaction date is required';
    if (formData.value_date && formData.value_date < formData.transaction_date) {
      errors.value_date = 'Value date cannot be before transaction date';
    }
    if (formData.is_recurring && !formData.recurring_pattern) {
      errors.recurring_pattern = 'Recurring pattern is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    try {
      const data = {
        cashbook: parseInt(cashbookId),
        type: parseInt(formData.type),
        amount: formData.amount.toString(),
        transaction_date: formData.transaction_date,
        value_date: formData.value_date || formData.transaction_date,
        status: formData.status,
        is_recurring: formData.is_recurring,
        recurring_pattern: formData.recurring_pattern || '',
        category: formData.category ? parseInt(formData.category) : 0,
        description: formData.description || '',
        reference_number: formData.reference_number || '',
        tags: {}
      };

      const result = isEditMode 
        ? await updateTransaction(transactionId, data)
        : await createTransaction(data);

      setShowSuccess(true);
      
      if (isEditMode) {
        setOriginalData(formData);
      } else {
        setFormData(initialFormState);
        setOriginalData(initialFormState);
      }

      setTimeout(() => {
        onSuccess ? onSuccess(result) : navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`);
      }, 1500);

    } catch (err) {
      const backendErrors = err.response?.data || {};
      const fieldErrors = {};
      
      Object.entries(backendErrors).forEach(([key, val]) => {
        fieldErrors[key] = Array.isArray(val) ? val.join(', ') : val;
      });

      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
        setError('Please correct the validation errors');
      } else {
        setError(backendErrors.detail || err.message || 'Failed to save transaction');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(isEditMode && originalData ? originalData : initialFormState);
    setFormErrors({});
    setError(null);
    setShowSuccess(false);
  };

  const hasChanges = () => !originalData || !isEditMode || JSON.stringify(formData) !== JSON.stringify(originalData);

  const currentType = transactionTypes.find(t => t.id === parseInt(formData.type));
  const isIncome = currentType?.nature === 'income';
  const isExpense = currentType?.nature === 'expense';

  const statusConfig = {
    completed: { color: 'success', icon: <CheckCircle />, label: 'Completed' },
    pending: { color: 'warning', icon: <Pending />, label: 'Pending' },
    cancelled: { color: 'error', icon: <Block />, label: 'Cancelled' }
  };

  if (loading && isEditMode && !formData.amount) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">Loading transaction...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 1 }}>
      {/* Header with Gradient */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
            }}
          >
            <Receipt sx={{ fontSize: 32 }} />
          </Box>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
              {isEditMode ? 'Edit Transaction' : 'New Transaction'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEditMode ? 'Update transaction details' : 'Create new transaction record'}
            </Typography>
          </Box>
          {isEditMode && (
            <Stack direction="row" spacing={1}>
              <Chip
                label="Edit Mode"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              />
              {hasChanges() && (
                <Chip
                  label="Unsaved"
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.warning.main,
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Alerts */}
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} icon={<CheckCircle />}>
          Transaction {isEditMode ? 'updated' : 'created'} successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Enhanced Form */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.08)}`,
          }
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Type & Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={Boolean(formErrors.type)}>
                <InputLabel required>Transaction Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Transaction Type"
                  disabled={isSubmitting}
                >
                  <MenuItem value=""><em>Select type</em></MenuItem>
                  {transactionTypes.map(type => (
                    <MenuItem key={type.id} value={type.id.toString()}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {type.nature === 'income' ? (
                          <TrendingUp sx={{ color: 'success.main', fontSize: 18 }} />
                        ) : (
                          <TrendingDown sx={{ color: 'error.main', fontSize: 18 }} />
                        )}
                        <span>{type.name}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.type && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.type}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  disabled={isSubmitting}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {transactionCategories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id.toString()}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Amount & Status */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                required
                type="number"
                name="amount"
                label="Amount"
                value={formData.amount}
                onChange={handleChange}
                inputProps={{ step: '0.01', min: '0.01' }}
                error={Boolean(formErrors.amount)}
                helperText={formErrors.amount}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isIncome 
                      ? alpha(theme.palette.success.main, 0.08)
                      : isExpense
                      ? alpha(theme.palette.error.main, 0.08)
                      : 'transparent',
                    transition: 'all 0.3s ease',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullSize="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  disabled={isSubmitting}
                >
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ color: `${cfg.color}.main`, display: 'flex' }}>{cfg.icon}</Box>
                        <span>{cfg.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Dates */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                required
                type="date"
                name="transaction_date"
                label="Transaction Date"
                value={formData.transaction_date}
                onChange={handleChange}
                error={Boolean(formErrors.transaction_date)}
                helperText={formErrors.transaction_date}
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CalendarToday color="primary" fontSize="small" /></InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                name="value_date"
                label="Value Date"
                value={formData.value_date}
                onChange={handleChange}
                error={Boolean(formErrors.value_date)}
                helperText={formErrors.value_date}
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CalendarToday color="primary" fontSize="small" /></InputAdornment>,
                }}
              />
            </Grid>

            {/* Reference */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                name="reference_number"
                label="Reference Number"
                value={formData.reference_number}
                onChange={handleChange}
                placeholder="Optional"
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Receipt color="primary" fontSize="small" /></InputAdornment>,
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add notes..."
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <Description color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Recurring */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `2px dashed ${formData.is_recurring ? theme.palette.primary.main : alpha(theme.palette.divider, 0.3)}`,
                  backgroundColor: formData.is_recurring ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  }
                  label={<Typography variant="body2" fontWeight="600">Recurring Transaction</Typography>}
                />
                {formData.is_recurring && (
                  <TextField
                    fullWidth
                    size="small"
                    name="recurring_pattern"
                    label="Pattern"
                    value={formData.recurring_pattern}
                    onChange={handleChange}
                    placeholder="e.g., monthly, weekly"
                    error={Boolean(formErrors.recurring_pattern)}
                    helperText={formErrors.recurring_pattern}
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Actions */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Cancel />}
              onClick={onCancel || (() => navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`))}
              disabled={isSubmitting}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={handleReset}
              disabled={isSubmitting || (isEditMode && !hasChanges())}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {isEditMode ? 'Revert' : 'Reset'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save />}
              disabled={isSubmitting || (isEditMode && !hasChanges())}
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 700,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                }
              }}
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionForm;