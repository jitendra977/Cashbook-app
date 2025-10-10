// src/components/settings/SettingsPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  alpha,
  useTheme,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Backup as BackupIcon,
  Delete as DeleteIcon,
  AccountCircle as AccountIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  CurrencyExchange as CurrencyIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const SettingsPage = () => {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    lowBalanceAlert: true,
    monthlyReports: true,
    transactionAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    autoLogout: true,
    loginAlerts: true,
    sessionTimeout: 30,
    
    // Appearance Settings
    themeMode: 'light',
    compactView: false,
    showCharts: true,
    colorScheme: 'primary',
    
    // Data Management
    autoBackup: true,
    backupFrequency: 'weekly',
    exportFormat: 'csv'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveSettings = () => {
    // Simulate API call to save settings
    setTimeout(() => {
      showSnackbar('Settings saved successfully!');
    }, 500);
  };

  const handleExportData = () => {
    // Simulate export functionality
    showSnackbar('Data exported successfully!', 'info');
    setExportDialog(false);
  };

  const handleImportData = () => {
    // Simulate import functionality
    showSnackbar('Data imported successfully!', 'info');
    setImportDialog(false);
  };

  const handleDeleteData = () => {
    // Simulate data deletion
    showSnackbar('All data has been deleted permanently', 'warning');
    setDeleteDialog(false);
  };

  const SettingSection = ({ title, icon, children }) => (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}
        >
          {React.cloneElement(icon, { 
            sx: { color: 'primary.main', fontSize: 24 } 
          })}
        </Box>
        <Typography variant="h5" fontWeight="bold" color="primary.main">
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  const SettingItem = ({ label, description, action, divider = true }) => (
    <>
      <ListItem sx={{ px: 0 }}>
        <ListItemText
          primary={label}
          secondary={description}
          primaryTypographyProps={{ fontWeight: 600 }}
          secondaryTypographyProps={{ variant: 'body2' }}
        />
        <ListItemSecondaryAction>
          {action}
        </ListItemSecondaryAction>
      </ListItem>
      {divider && <Divider />}
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 32 }} />
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your Cashbook application preferences and account settings
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
            onClick={() => setExportDialog(true)}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <DownloadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Export Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download your transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
            onClick={() => setImportDialog(true)}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <UploadIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Import Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload transaction files
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
            onClick={handleSaveSettings}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <BackupIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Backup Now
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create manual backup
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: alpha(theme.palette.error.main, 0.05),
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
                backgroundColor: alpha(theme.palette.error.main, 0.1)
              }
            }}
            onClick={() => setDeleteDialog(true)}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <DeleteIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Clear Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delete all transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* General Settings */}
      <SettingSection title="General Settings" icon={<SettingsIcon />}>
        <List>
          <SettingItem
            label="Language"
            description="Select your preferred language"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                </Select>
              </FormControl>
            }
          />
          
          <SettingItem
            label="Currency"
            description="Default currency for transactions"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="JPY">JPY (¥)</MenuItem>
                  <MenuItem value="INR">INR (₹)</MenuItem>
                </Select>
              </FormControl>
            }
          />
          
          <SettingItem
            label="Date Format"
            description="How dates are displayed"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            }
          />
          
          <SettingItem
            label="Time Format"
            description="12-hour or 24-hour clock"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.timeFormat}
                  onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                >
                  <MenuItem value="12h">12-hour</MenuItem>
                  <MenuItem value="24h">24-hour</MenuItem>
                </Select>
              </FormControl>
            }
          />
        </List>
      </SettingSection>

      {/* Notification Settings */}
      <SettingSection title="Notifications" icon={<NotificationsIcon />}>
        <List>
          <SettingItem
            label="Email Notifications"
            description="Receive updates via email"
            action={
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Push Notifications"
            description="Get real-time alerts"
            action={
              <Switch
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Low Balance Alerts"
            description="Get notified when balance is low"
            action={
              <Switch
                checked={settings.lowBalanceAlert}
                onChange={(e) => handleSettingChange('lowBalanceAlert', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Monthly Reports"
            description="Receive monthly summary reports"
            action={
              <Switch
                checked={settings.monthlyReports}
                onChange={(e) => handleSettingChange('monthlyReports', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Transaction Alerts"
            description="Get notified for large transactions"
            action={
              <Switch
                checked={settings.transactionAlerts}
                onChange={(e) => handleSettingChange('transactionAlerts', e.target.checked)}
                color="primary"
              />
            }
          />
        </List>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection title="Security" icon={<SecurityIcon />}>
        <List>
          <SettingItem
            label="Two-Factor Authentication"
            description="Add an extra layer of security"
            action={
              <Switch
                checked={settings.twoFactorAuth}
                onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Auto Logout"
            description="Automatically log out after inactivity"
            action={
              <Switch
                checked={settings.autoLogout}
                onChange={(e) => handleSettingChange('autoLogout', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Login Alerts"
            description="Get notified of new sign-ins"
            action={
              <Switch
                checked={settings.loginAlerts}
                onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Session Timeout"
            description="Minutes before automatic logout"
            action={
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                >
                  <MenuItem value={15}>15 min</MenuItem>
                  <MenuItem value={30}>30 min</MenuItem>
                  <MenuItem value={60}>60 min</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            }
          />
        </List>
      </SettingSection>

      {/* Appearance Settings */}
      <SettingSection title="Appearance" icon={<PaletteIcon />}>
        <List>
          <SettingItem
            label="Theme"
            description="Choose light or dark mode"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.themeMode}
                  onChange={(e) => handleSettingChange('themeMode', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
            }
          />
          
          <SettingItem
            label="Compact View"
            description="Show more content in less space"
            action={
              <Switch
                checked={settings.compactView}
                onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Show Charts"
            description="Display visual charts and graphs"
            action={
              <Switch
                checked={settings.showCharts}
                onChange={(e) => handleSettingChange('showCharts', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Color Scheme"
            description="Choose your preferred color theme"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.colorScheme}
                  onChange={(e) => handleSettingChange('colorScheme', e.target.value)}
                >
                  <MenuItem value="primary">Blue</MenuItem>
                  <MenuItem value="secondary">Purple</MenuItem>
                  <MenuItem value="success">Green</MenuItem>
                  <MenuItem value="warning">Orange</MenuItem>
                </Select>
              </FormControl>
            }
          />
        </List>
      </SettingSection>

      {/* Data Management */}
      <SettingSection title="Data Management" icon={<BackupIcon />}>
        <List>
          <SettingItem
            label="Auto Backup"
            description="Automatically backup your data"
            action={
              <Switch
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                color="primary"
              />
            }
          />
          
          <SettingItem
            label="Backup Frequency"
            description="How often to create backups"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            }
          />
          
          <SettingItem
            label="Export Format"
            description="Preferred format for data export"
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.exportFormat}
                  onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
            }
          />
        </List>
      </SettingSection>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
          }}
        >
          Save All Changes
        </Button>
      </Box>

      {/* Dialogs */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Delete All Data
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action will permanently delete all your transactions, categories, and financial data. 
            This cannot be undone. Are you sure you want to proceed?
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Make sure you have exported your data before proceeding!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteData} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete All Data
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose the format and date range for your data export.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select value={settings.exportFormat}>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="pdf">PDF Report</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select defaultValue="all">
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleExportData} 
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Export Data
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Upload your transaction data file. Supported formats: CSV, JSON.
          </DialogContentText>
          <Box sx={{ mt: 2, p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Drag and drop your file here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or
            </Typography>
            <Button variant="outlined" component="label">
              Choose File
              <input type="file" hidden accept=".csv,.json" />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleImportData} 
            variant="contained"
            startIcon={<UploadIcon />}
          >
            Import Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;