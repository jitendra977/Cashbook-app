import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Save,
  Cancel,
  RestartAlt,
  AttachMoney,
  CalendarToday,
  Description,
  Category,
  Receipt,
  Repeat,
  Info,
  CheckCircle,
  Pending,
  Block,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useTransactionsContext } from '../../context/TransactionsContext';

const TransactionForm = ({ transactionId, onSuccess, onCancel }) => {
  const { storeId, cashbookId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const {
    transactionTypes,
    transactionCategories,
    loading,
    error,
    fetchTransactionTypes,
    fetchTransactionCategories,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    setError,
  } = useTransactionsContext();

  const [formData, setFormData] = useState({
    type: '',
    category: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    value_date: new Date().toISOString().split('T')[0],
    description: '',
    reference_number: '',
    status: 'completed',
    is_recurring: false,
    recurring_pattern: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Fetch transaction types and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchTransactionTypes();
        await fetchTransactionCategories();
      } catch (err) {
        console.error('Failed to fetch form data:', err);
      }
    };
    fetchData();
  }, [fetchTransactionTypes, fetchTransactionCategories]);

  // Fetch existing transaction if editing
  useEffect(() => {
    const loadTransaction = async () => {
      if (transactionId) {
        setIsEditMode(true);
        try {
          const transaction = await fetchTransaction(transactionId);
          if (transaction) {
            console.log('Loaded transaction:', transaction);
            
            const transactionData = {
              type: transaction.type?.id?.toString() || transaction.type?.toString() || '',
              category: transaction.category?.id?.toString() || transaction.category?.toString() || '',
              amount: transaction.amount || '',
              transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
              value_date: transaction.value_date || transaction.transaction_date || new Date().toISOString().split('T')[0],
              description: transaction.description || '',
              reference_number: transaction.reference_number || '',
              status: transaction.status || 'completed',
              is_recurring: transaction.is_recurring || false,
              recurring_pattern: transaction.recurring_pattern || '',
            };
            
            console.log('Formatted transaction data:', transactionData);
            
            setFormData(transactionData);
            setOriginalData(transactionData);
          }
        } catch (err) {
          console.error('Failed to load transaction:', err);
          setError('Failed to load transaction details');
        }
      } else {
        // Initialize new transaction form
        const newFormData = {
          type: '',
          category: '',
          amount: '',
          transaction_date: new Date().toISOString().split('T')[0],
          value_date: new Date().toISOString().split('T')[0],
          description: '',
          reference_number: '',
          status: 'completed',
          is_recurring: false,
          recurring_pattern: '',
        };
        setFormData(newFormData);
        setOriginalData(newFormData);
      }
    };
    loadTransaction();
  }, [transactionId, fetchTransaction, setError]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.type) {
      errors.type = 'Transaction type is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    if (!formData.transaction_date) {
      errors.transaction_date = 'Transaction date is required';
    }
    if (formData.value_date && formData.value_date < formData.transaction_date) {
      errors.value_date = 'Value date cannot be before transaction date';
    }
    if (formData.is_recurring && !formData.recurring_pattern) {
      errors.recurring_pattern = 'Recurring pattern is required for recurring transactions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started', { formData, isEditMode, transactionId });

    if (!validateForm()) {
      console.log('Form validation failed', formErrors);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    try {
      // Prepare submission data according to API format
      const submissionData = {
        cashbook: parseInt(cashbookId), // Include cashbook for both create and update
        type: parseInt(formData.type),
        amount: formData.amount.toString(), // Keep as string as per API
        transaction_date: formData.transaction_date,
        value_date: formData.value_date || formData.transaction_date,
        status: formData.status,
        is_recurring: formData.is_recurring,
        recurring_pattern: formData.recurring_pattern || '',
        tags: {} // Empty object as per API
      };

      // Handle category - only include if provided and valid
      if (formData.category && formData.category !== '') {
        submissionData.category = parseInt(formData.category);
      } else {
        submissionData.category = 0; // Use 0 for no category as per API
      }

      // Handle optional string fields
      submissionData.description = formData.description || '';
      submissionData.reference_number = formData.reference_number || '';

      console.log('Submitting data to API:', JSON.stringify(submissionData, null, 2));
      console.log('Data types:', Object.keys(submissionData).map(key => ({ [key]: typeof submissionData[key] })));

      let result;
      if (isEditMode && transactionId) {
        console.log('Updating transaction with POST:', transactionId);
        // For update, use POST method and include the transaction ID
        result = await updateTransaction(transactionId, submissionData);
        console.log('Update response:', result);
      } else {
        console.log('Creating new transaction');
        result = await createTransaction(submissionData);
        console.log('Create response:', result);
      }

      console.log('Transaction saved successfully:', result);
      
      setShowSuccess(true);
      
      // Update original data for edit mode
      if (isEditMode) {
        setOriginalData(formData);
      } else {
        // Reset form for new transactions
        const resetData = {
          type: '',
          category: '',
          amount: '',
          transaction_date: new Date().toISOString().split('T')[0],
          value_date: new Date().toISOString().split('T')[0],
          description: '',
          reference_number: '',
          status: 'completed',
          is_recurring: false,
          recurring_pattern: '',
        };
        setFormData(resetData);
        setOriginalData(resetData);
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result);
        } else {
          navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`);
        }
      }, 1500);

    } catch (err) {
      console.error('Failed to save transaction:', err);
      console.error('Error details:', err.response?.data);
      
      let errorMessage = 'Failed to save transaction';
      let fieldErrors = {};
      
      if (err.response?.data) {
        const backendErrors = err.response.data;
        console.log('Backend validation errors:', backendErrors);
        
        // Handle different error formats
        if (typeof backendErrors === 'object') {
          Object.keys(backendErrors).forEach(key => {
            if (key in formData) {
              fieldErrors[key] = Array.isArray(backendErrors[key])
                ? backendErrors[key].join(', ')
                : backendErrors[key];
            } else {
              // Handle field-specific errors that might not be in formData
              fieldErrors[key] = Array.isArray(backendErrors[key])
                ? backendErrors[key].join(', ')
                : backendErrors[key];
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setFormErrors(fieldErrors);
            errorMessage = 'Please correct the validation errors above';
          } else if (backendErrors.detail) {
            errorMessage = backendErrors.detail;
          } else if (typeof backendErrors === 'string') {
            errorMessage = backendErrors;
          }
        } else if (typeof backendErrors === 'string') {
          errorMessage = backendErrors;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`);
    }
  };

  const handleReset = () => {
    if (isEditMode && originalData) {
      // Reset to original data in edit mode
      setFormData(originalData);
    } else {
      // Reset to empty form for new transactions
      setFormData({
        type: '',
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        value_date: new Date().toISOString().split('T')[0],
        description: '',
        reference_number: '',
        status: 'completed',
        is_recurring: false,
        recurring_pattern: '',
      });
    }
    setFormErrors({});
    setError(null);
    setShowSuccess(false);
  };

  // Check if form has changes (for edit mode)
  const hasChanges = () => {
    if (!originalData || !isEditMode) return true;
    
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Get transaction type details
  const getTransactionTypeDetails = (typeId) => {
    const type = transactionTypes.find(t => t.id === parseInt(typeId));
    return type || null;
  };

  const currentType = getTransactionTypeDetails(formData.type);
  const isIncome = currentType?.nature === 'income';
  const isExpense = currentType?.nature === 'expense';

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      completed: { color: 'success', icon: <CheckCircle />, label: 'Completed' },
      pending: { color: 'warning', icon: <Pending />, label: 'Pending' },
      cancelled: { color: 'error', icon: <Block />, label: 'Cancelled' }
    };
    return configs[status] || configs.completed;
  };

  const transactionTypeOptions = Array.isArray(transactionTypes) ? transactionTypes : [];
  const transactionCategoryOptions = Array.isArray(transactionCategories) ? transactionCategories : [];

  if (loading && isEditMode && transactionId && !formData.amount) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Loading transaction...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 1 }}>
      {/* Compact Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Receipt sx={{ fontSize: 24 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="h5" fontWeight="700">
            {isEditMode ? 'Edit Transaction' : 'New Transaction'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditMode ? 'Update transaction details' : 'Create new transaction record'}
          </Typography>
        </Box>
        {isEditMode && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="Edit Mode"
              color="primary"
              size="small"
              sx={{ borderRadius: 1 }}
            />
            {hasChanges() && (
              <Chip
                label="Unsaved Changes"
                color="warning"
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
            )}
          </Stack>
        )}
      </Stack>

      {/* Success Alert */}
      {showSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2, 
            borderRadius: 1.5,
            py: 0.5,
          }} 
          icon={<CheckCircle fontSize="small" />}
        >
          Transaction {isEditMode ? 'updated' : 'created'} successfully!
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 1.5,
            py: 0.5,
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Form Errors Display */}
      {Object.keys(formErrors).length > 0 && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 1.5,
            py: 0.5,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {Object.entries(formErrors).map(([field, errorMsg]) => (
              <li key={field}>
                <Typography variant="body2">
                  <strong>{field}:</strong> {errorMsg}
                </Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Compact Form */}
      <Paper 
        elevation={1}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Row 1: Type and Category */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
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
                      <MenuItem value="">
                        <em>Select type</em>
                      </MenuItem>
                      {transactionTypeOptions.map(type => (
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
                    {formErrors.type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {formErrors.type}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" error={Boolean(formErrors.category)}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                      disabled={isSubmitting}
                    >
                      <MenuItem value="">
                        <em>Select category (optional)</em>
                      </MenuItem>
                      {transactionCategoryOptions.map(category => (
                        <MenuItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.category && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {formErrors.category}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Row 2: Amount + Status */}
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
                inputProps={{ 
                  step: '0.01', 
                  min: '0.01',
                  placeholder: '0.00'
                }}
                error={Boolean(formErrors.amount)}
                helperText={formErrors.amount}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isIncome 
                      ? alpha(theme.palette.success.main, 0.05)
                      : isExpense
                      ? alpha(theme.palette.error.main, 0.05)
                      : 'transparent',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={Boolean(formErrors.status)}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  disabled={isSubmitting}
                >
                  {['pending', 'completed', 'cancelled'].map(status => {
                    const config = getStatusConfig(status);
                    return (
                      <MenuItem key={status} value={status}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ color: `${config.color}.main` }}>
                            {config.icon}
                          </Box>
                          <span>{config.label}</span>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
                {formErrors.status && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {formErrors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Row 3: Dates */}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
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
                helperText={formErrors.value_date || 'Optional - defaults to transaction date'}
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Row 4: Reference */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                name="reference_number"
                label="Reference Number"
                value={formData.reference_number}
                onChange={handleChange}
                placeholder="Optional reference number"
                disabled={isSubmitting}
                error={Boolean(formErrors.reference_number)}
                helperText={formErrors.reference_number}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Receipt color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Row 5: Description */}
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
                placeholder="Add transaction notes..."
                disabled={isSubmitting}
                error={Boolean(formErrors.description)}
                helperText={formErrors.description}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <Description color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Row 6: Recurring Section */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 1,
                backgroundColor: formData.is_recurring ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      icon={<Repeat fontSize="small" />}
                      checkedIcon={<Repeat color="primary" fontSize="small" />}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight="500">
                      Recurring Transaction
                    </Typography>
                  }
                />
                
                {formData.is_recurring && (
                  <Box sx={{ mt: 2, ml: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      name="recurring_pattern"
                      label="Recurring Pattern"
                      value={formData.recurring_pattern}
                      onChange={handleChange}
                      placeholder="e.g., monthly, weekly, daily"
                      error={Boolean(formErrors.recurring_pattern)}
                      helperText={formErrors.recurring_pattern || 'Enter the recurrence pattern (monthly, weekly, etc.)'}
                      disabled={isSubmitting}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={isSubmitting}
              size="small"
              sx={{ 
                borderRadius: 1,
                px: 2,
                minWidth: 'auto',
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RestartAlt />}
              onClick={handleReset}
              disabled={isSubmitting || (isEditMode && !hasChanges())}
              size="small"
              sx={{ 
                borderRadius: 1,
                px: 2,
                minWidth: 'auto',
              }}
            >
              {isEditMode ? 'Revert' : 'Reset'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save />}
              disabled={isSubmitting || (isEditMode && !hasChanges())}
              size="small"
              sx={{ 
                borderRadius: 1,
                px: 3,
                fontWeight: 600,
                minWidth: 'auto',
              }}
            >
              {isSubmitting
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update Transaction' : 'Create Transaction')
              }
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionForm;