# admin_filters.py
from django.contrib import admin

class VerificationStatusFilter(admin.SimpleListFilter):
    title = 'verification status'
    parameter_name = 'verification_status'
    
    def lookups(self, request, model_admin):
        return (
            ('verified', 'Verified'),
            ('unverified', 'Unverified'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'verified':
            return queryset.filter(is_verified=True)
        if self.value() == 'unverified':
            return queryset.filter(is_verified=False)
        return queryset

class RecentLoginFilter(admin.SimpleListFilter):
    title = 'recent activity'
    parameter_name = 'recent_activity'
    
    def lookups(self, request, model_admin):
        return (
            ('active', 'Active (last 7 days)'),
            ('inactive', 'Inactive (30+ days)'),
        )
    
    def queryset(self, request, queryset):
        from django.utils import timezone
        from datetime import timedelta
        
        if self.value() == 'active':
            return queryset.filter(last_login__gte=timezone.now() - timedelta(days=7))
        if self.value() == 'inactive':
            return queryset.filter(last_login__lte=timezone.now() - timedelta(days=30))
        return queryset