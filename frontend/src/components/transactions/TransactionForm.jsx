// src/components/transactions/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactionsContext } from '../../context/TransactionsContext';
import Loader from '../common/Loader';
import ErrorMessage from './ErrorMessage';
import './TransactionForm.css';

const TransactionForm = ({ transactionId, onSuccess, onCancel }) => {
    const { storeId, cashbookId } = useParams();
    const navigate = useNavigate();
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
        cashbook: cashbookId || '',
        type: '',
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        value_date: new Date().toISOString().split('T')[0],
        description: '',
        reference_number: '',
        status: 'completed',
        is_recurring: false,
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

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
                    console.log('Loaded transaction:', transaction); // Debug log
                    setFormData({
                        cashbook: transaction.cashbook || cashbookId,
                        type: transaction.type?.id || transaction.type || '',
                        category: transaction.category?.id || transaction.category || '',
                        amount: transaction.amount || '',
                        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
                        value_date: transaction.value_date || transaction.transaction_date || new Date().toISOString().split('T')[0],
                        description: transaction.description || '',
                        reference_number: transaction.reference_number || '',
                        status: transaction.status || 'completed',
                        is_recurring: transaction.is_recurring || false,
                    });
                } catch (err) {
                    console.error('Failed to load transaction:', err);
                    setError('Failed to load transaction details');
                }
            }
        };
        loadTransaction();
    }, [transactionId, fetchTransaction, cashbookId, setError]);

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

        if (!formData.cashbook) {
            errors.cashbook = 'Cashbook is required';
        }
        if (!formData.type) {
            errors.type = 'Transaction type is required';
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            errors.amount = 'Amount must be greater than 0';
        }
        if (!formData.transaction_date) {
            errors.transaction_date = 'Transaction date is required';
        }
        if (formData.value_date && formData.value_date < formData.transaction_date) {
            errors.value_date = 'Value date cannot be before transaction date';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Prepare data for API - amount as string
            const submissionData = {
                cashbook: parseInt(formData.cashbook),
                type: parseInt(formData.type),
                category: formData.category ? parseInt(formData.category) : null,
                amount: formData.amount, // Keep as string for decimal format
                transaction_date: formData.transaction_date,
                value_date: formData.value_date || null, // Use null instead of transaction_date
                description: formData.description || null, // Use null instead of empty string
                reference_number: formData.reference_number || null, // Use null instead of empty string
                status: formData.status,
                is_recurring: formData.is_recurring,
                recurring_pattern: null, // Always null unless you add this field to form
                tags: [] // Default empty array
            };

            console.log('Submitting transaction data:', submissionData);

            let result;
            if (isEditMode && transactionId) {
                result = await updateTransaction(transactionId, submissionData);
            } else {
                result = await createTransaction(submissionData);
            }

            console.log('Transaction saved successfully:', result);

            // Success callback
            if (onSuccess) {
                onSuccess(result);
            } else {
                navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`);
            }
        } catch (err) {
            console.error('Failed to save transaction:', err);
            console.error('Error response:', err.response?.data);

            if (err.response?.data) {
                const backendErrors = err.response.data;
                const fieldErrors = {};

                Object.keys(backendErrors).forEach(key => {
                    if (key in formData) {
                        fieldErrors[key] = Array.isArray(backendErrors[key])
                            ? backendErrors[key].join(', ')
                            : backendErrors[key];
                    }
                });

                if (Object.keys(fieldErrors).length > 0) {
                    setFormErrors(fieldErrors);
                } else {
                    setError(backendErrors.detail || 'Failed to save transaction');
                }
            } else {
                setError(err.details || 'Failed to save transaction');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate(`/stores/${storeId}/cashbooks/${cashbookId}/transactions`);
        }
    };

    // Handle reset
    const handleReset = () => {
        setFormData({
            cashbook: cashbookId || '',
            type: '',
            category: '',
            amount: '',
            transaction_date: new Date().toISOString().split('T')[0],
            value_date: new Date().toISOString().split('T')[0],
            description: '',
            reference_number: '',
            status: 'completed',
            is_recurring: false,
        });
        setFormErrors({});
        setError(null);
    };

    // Safe array checks
    const transactionTypeOptions = Array.isArray(transactionTypes) ? transactionTypes : [];
    const transactionCategoryOptions = Array.isArray(transactionCategories) ? transactionCategories : [];

    if (loading && isEditMode && !formData.amount) {
        return <Loader />;
    }

    return (
        <div className="transaction-form-container">
            <div className="form-header">
                <h2>{isEditMode ? 'Edit Transaction' : 'New Transaction'}</h2>
                <p className="form-subtitle">
                    {isEditMode
                        ? 'Update the transaction details below'
                        : 'Fill in the transaction details below'}
                </p>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

            <form onSubmit={handleSubmit} className="transaction-form">
                {/* Transaction Type */}
                <div className="form-group">
                    <label htmlFor="type" className="form-label required">
                        Transaction Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={`form-control ${formErrors.type ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                    >
                        <option value="">Select a type</option>
                        {transactionTypeOptions.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name} {type.nature ? `(${type.nature})` : ''}
                            </option>
                        ))}
                    </select>
                    {formErrors.type && <div className="error-text">{formErrors.type}</div>}
                </div>

                {/* Transaction Category */}
                <div className="form-group">
                    <label htmlFor="category" className="form-label">
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`form-control ${formErrors.category ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                    >
                        <option value="">Select a category (optional)</option>
                        {transactionCategoryOptions.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {formErrors.category && <div className="error-text">{formErrors.category}</div>}
                </div>

                {/* Amount */}
                <div className="form-group">
                    <label htmlFor="amount" className="form-label required">
                        Amount
                    </label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className={`form-control ${formErrors.amount ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                    />
                    {formErrors.amount && <div className="error-text">{formErrors.amount}</div>}
                </div>

                {/* Transaction Date */}
                <div className="form-group">
                    <label htmlFor="transaction_date" className="form-label required">
                        Transaction Date
                    </label>
                    <input
                        type="date"
                        id="transaction_date"
                        name="transaction_date"
                        value={formData.transaction_date}
                        onChange={handleChange}
                        className={`form-control ${formErrors.transaction_date ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                    />
                    {formErrors.transaction_date && (
                        <div className="error-text">{formErrors.transaction_date}</div>
                    )}
                </div>

                {/* Value Date */}
                <div className="form-group">
                    <label htmlFor="value_date" className="form-label">
                        Value Date
                    </label>
                    <input
                        type="date"
                        id="value_date"
                        name="value_date"
                        value={formData.value_date}
                        onChange={handleChange}
                        className={`form-control ${formErrors.value_date ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                    />
                    {formErrors.value_date && (
                        <div className="error-text">{formErrors.value_date}</div>
                    )}
                </div>

                {/* Reference Number */}
                <div className="form-group">
                    <label htmlFor="reference_number" className="form-label">
                        Reference Number
                    </label>
                    <input
                        type="text"
                        id="reference_number"
                        name="reference_number"
                        value={formData.reference_number}
                        onChange={handleChange}
                        placeholder="Optional reference number"
                        className="form-control"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="description" className="form-label">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Add any additional notes or details about this transaction..."
                        className="form-control"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Status */}
                <div className="form-group">
                    <label htmlFor="status" className="form-label">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-control"
                        disabled={isSubmitting}
                    >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Recurring Transaction */}
                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="is_recurring"
                            checked={formData.is_recurring}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        <span className="checkbox-text">This is a recurring transaction</span>
                    </label>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="btn btn-outline"
                        disabled={isSubmitting}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || loading}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            isEditMode ? 'Update Transaction' : 'Create Transaction'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;