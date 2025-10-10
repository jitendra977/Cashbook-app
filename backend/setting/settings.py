
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()

class BaseSettings(models.Model):
    """Base abstract model for all settings"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True


class UserSettings(BaseSettings):
    """User-specific settings model"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='settings'
    )
    
    # General Settings
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('zh', 'Chinese'),
        ('ja', 'Japanese'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar ($)'),
        ('EUR', 'Euro (€)'),
        ('GBP', 'British Pound (£)'),
        ('JPY', 'Japanese Yen (¥)'),
        ('INR', 'Indian Rupee (₹)'),
        ('CAD', 'Canadian Dollar (C$)'),
        ('AUD', 'Australian Dollar (A$)'),
    ]
    
    DATE_FORMAT_CHOICES = [
        ('MM/DD/YYYY', 'MM/DD/YYYY'),
        ('DD/MM/YYYY', 'DD/MM/YYYY'),
        ('YYYY-MM-DD', 'YYYY-MM-DD'),
        ('DD-MM-YYYY', 'DD-MM-YYYY'),
    ]
    
    TIME_FORMAT_CHOICES = [
        ('12h', '12-hour clock'),
        ('24h', '24-hour clock'),
    ]
    
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto'),
    ]
    
    COLOR_SCHEME_CHOICES = [
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('purple', 'Purple'),
        ('orange', 'Orange'),
        ('red', 'Red'),
        ('indigo', 'Indigo'),
    ]
    
    # General Preferences
    language = models.CharField(
        max_length=10, 
        choices=LANGUAGE_CHOICES, 
        default='en'
    )
    currency = models.CharField(
        max_length=5, 
        choices=CURRENCY_CHOICES, 
        default='USD'
    )
    date_format = models.CharField(
        max_length=10, 
        choices=DATE_FORMAT_CHOICES, 
        default='MM/DD/YYYY'
    )
    time_format = models.CharField(
        max_length=3, 
        choices=TIME_FORMAT_CHOICES, 
        default='12h'
    )
    
    # Notification Settings
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=False)
    low_balance_alert = models.BooleanField(default=True)
    monthly_reports = models.BooleanField(default=True)
    transaction_alerts = models.BooleanField(default=True)
    budget_alerts = models.BooleanField(default=True)
    
    # Alert Thresholds
    low_balance_threshold = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=100.00
    )
    large_transaction_threshold = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=1000.00
    )
    
    # Security Settings
    two_factor_auth = models.BooleanField(default=False)
    auto_logout = models.BooleanField(default=True)
    login_alerts = models.BooleanField(default=True)
    session_timeout = models.IntegerField(
        default=30,
        validators=[MinValueValidator(5), MaxValueValidator(480)],
        help_text="Session timeout in minutes"
    )
    
    # Appearance Settings
    theme_mode = models.CharField(
        max_length=10, 
        choices=THEME_CHOICES, 
        default='light'
    )
    color_scheme = models.CharField(
        max_length=10, 
        choices=COLOR_SCHEME_CHOICES, 
        default='blue'
    )
    compact_view = models.BooleanField(default=False)
    show_charts = models.BooleanField(default=True)
    dashboard_layout = models.JSONField(
        default=dict,
        help_text="Custom dashboard layout configuration"
    )
    
    # Data Management
    auto_backup = models.BooleanField(default=True)
    
    BACKUP_FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    backup_frequency = models.CharField(
        max_length=10, 
        choices=BACKUP_FREQUENCY_CHOICES, 
        default='weekly'
    )
    
    EXPORT_FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
    ]
    
    export_format = models.CharField(
        max_length=10, 
        choices=EXPORT_FORMAT_CHOICES, 
        default='csv'
    )
    
    # Financial Settings
    financial_year_start = models.DateField(default=timezone.now)
    tax_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Privacy Settings
    data_sharing_consent = models.BooleanField(default=False)
    analytics_tracking = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "User Settings"
        verbose_name_plural = "User Settings"
        db_table = 'user_settings'
    
    def __str__(self):
        return f"Settings for {self.user.username}"
    
    def get_default_categories(self):
        """Get default categories based on user preferences"""
        return {
            'income': ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
            'expense': ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Education', 'Other']
        }
    
    @property
    def is_complete(self):
        """Check if user has completed basic setup"""
        return all([
            self.currency,
            self.date_format,
            self.low_balance_threshold is not None
        ])


class ApplicationSettings(BaseSettings):
    """Global application settings"""
    SETTING_TYPES = [
        ('general', 'General'),
        ('security', 'Security'),
        ('notification', 'Notification'),
        ('financial', 'Financial'),
        ('integration', 'Integration'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='general')
    description = models.TextField(blank=True)
    data_type = models.CharField(
        max_length=20,
        choices=[
            ('string', 'String'),
            ('integer', 'Integer'),
            ('boolean', 'Boolean'),
            ('float', 'Float'),
            ('json', 'JSON'),
        ],
        default='string'
    )
    
    class Meta:
        verbose_name = "Application Setting"
        verbose_name_plural = "Application Settings"
        db_table = 'application_settings'
        ordering = ['setting_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.setting_type})"
    
    def get_value(self):
        """Get the properly typed value"""
        if self.data_type == 'integer':
            return int(self.value)
        elif self.data_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes')
        elif self.data_type == 'float':
            return float(self.value)
        elif self.data_type == 'json':
            import json
            return json.loads(self.value)
        else:
            return self.value
    
    @classmethod
    def get_setting(cls, name, default=None):
        try:
            setting = cls.objects.get(name=name, is_active=True)
            return setting.get_value()
        except cls.DoesNotExist:
            return default


class UserPreference(BaseSettings):
    """Additional user preferences that can be extended"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='preferences'
    )
    key = models.CharField(max_length=100)
    value = models.TextField()
    data_type = models.CharField(
        max_length=20,
        choices=[
            ('string', 'String'),
            ('integer', 'Integer'),
            ('boolean', 'Boolean'),
            ('float', 'Float'),
            ('json', 'JSON'),
        ],
        default='string'
    )
    
    class Meta:
        verbose_name = "User Preference"
        verbose_name_plural = "User Preferences"
        db_table = 'user_preferences'
        unique_together = ['user', 'key']
        ordering = ['key']
    
    def __str__(self):
        return f"{self.user.username} - {self.key}"
    
    def get_value(self):
        """Get the properly typed value"""
        if self.data_type == 'integer':
            return int(self.value)
        elif self.data_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes')
        elif self.data_type == 'float':
            return float(self.value)
        elif self.data_type == 'json':
            import json
            return json.loads(self.value)
        else:
            return self.value
    
    @classmethod
    def get_user_preference(cls, user, key, default=None):
        try:
            preference = cls.objects.get(user=user, key=key, is_active=True)
            return preference.get_value()
        except cls.DoesNotExist:
            return default


# Signals to create default settings for new users
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    """Create default settings when a new user is created"""
    if created:
        UserSettings.objects.create(user=instance)


# Default application settings
DEFAULT_APP_SETTINGS = [
    {
        'name': 'APP_NAME',
        'value': 'Cashbook',
        'setting_type': 'general',
        'description': 'Application name',
        'data_type': 'string'
    },
    {
        'name': 'SUPPORT_EMAIL',
        'value': 'support@cashbook.app',
        'setting_type': 'general',
        'description': 'Support email address',
        'data_type': 'string'
    },
    {
        'name': 'MAX_FILE_UPLOAD_SIZE',
        'value': '10485760',
        'setting_type': 'general',
        'description': 'Maximum file upload size in bytes',
        'data_type': 'integer'
    },
    {
        'name': 'SESSION_TIMEOUT_DEFAULT',
        'value': '30',
        'setting_type': 'security',
        'description': 'Default session timeout in minutes',
        'data_type': 'integer'
    },
    {
        'name': 'PASSWORD_MIN_LENGTH',
        'value': '8',
        'setting_type': 'security',
        'description': 'Minimum password length',
        'data_type': 'integer'
    },
    {
        'name': 'ENABLE_REGISTRATION',
        'value': 'true',
        'setting_type': 'general',
        'description': 'Enable user registration',
        'data_type': 'boolean'
    },
    {
        'name': 'DEFAULT_CURRENCY',
        'value': 'USD',
        'setting_type': 'financial',
        'description': 'Default currency for new users',
        'data_type': 'string'
    },
    {
        'name': 'TAX_ENABLED',
        'value': 'false',
        'setting_type': 'financial',
        'description': 'Enable tax calculations',
        'data_type': 'boolean'
    },
    {
        'name': 'BACKUP_ENABLED',
        'value': 'true',
        'setting_type': 'general',
        'description': 'Enable automatic backups',
        'data_type': 'boolean'
    },
]