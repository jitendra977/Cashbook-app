# serializers/settings_serializers.py
from rest_framework import serializers
from .models import UserSettings, ApplicationSettings, UserPreference

class UserSettingsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = UserSettings
        fields = [
            'id', 'user', 
            # General
            'language', 'currency', 'date_format', 'time_format',
            # Notifications
            'email_notifications', 'push_notifications', 'low_balance_alert',
            'monthly_reports', 'transaction_alerts', 'budget_alerts',
            'low_balance_threshold', 'large_transaction_threshold',
            # Security
            'two_factor_auth', 'auto_logout', 'login_alerts', 'session_timeout',
            # Appearance
            'theme_mode', 'color_scheme', 'compact_view', 'show_charts', 'dashboard_layout',
            # Data Management
            'auto_backup', 'backup_frequency', 'export_format',
            # Financial
            'financial_year_start', 'tax_percentage',
            # Privacy
            'data_sharing_consent', 'analytics_tracking', 'marketing_emails',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate_low_balance_threshold(self, value):
        if value < 0:
            raise serializers.ValidationError("Low balance threshold cannot be negative")
        return value
    
    def validate_large_transaction_threshold(self, value):
        if value < 0:
            raise serializers.ValidationError("Large transaction threshold cannot be negative")
        return value
    
    def validate_session_timeout(self, value):
        if value < 5 or value > 480:
            raise serializers.ValidationError("Session timeout must be between 5 and 480 minutes")
        return value
    
    def validate_tax_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Tax percentage must be between 0 and 100")
        return value


class ApplicationSettingsSerializer(serializers.ModelSerializer):
    typed_value = serializers.SerializerMethodField()
    
    class Meta:
        model = ApplicationSettings
        fields = ['id', 'name', 'value', 'typed_value', 'setting_type', 'description', 'data_type', 'is_active']
        read_only_fields = ['id']
    
    def get_typed_value(self, obj):
        return obj.get_value()


class UserPreferenceSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    typed_value = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPreference
        fields = ['id', 'user', 'key', 'value', 'typed_value', 'data_type', 'is_active']
        read_only_fields = ['id', 'user']
    
    def get_typed_value(self, obj):
        return obj.get_value()
    
    def validate_key(self, value):
        """Ensure key follows naming conventions"""
        if not value.replace('_', '').isalnum():
            raise serializers.ValidationError("Key can only contain alphanumeric characters and underscores")
        return value.lower()