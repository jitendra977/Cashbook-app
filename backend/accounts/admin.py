from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.contrib import messages
from .models import User

class CustomUserAdmin(UserAdmin):
    # Display fields in list view
    list_display = ('profile_image_display', 'username', 'email', 'phone_number', 'is_verified', 'is_active', 'last_login', 'created_at')
    list_display_links = ('profile_image_display', 'username', 'email')
    list_filter = ('is_verified', 'is_active', 'is_staff', 'created_at', 'last_login')
    search_fields = ('username', 'email', 'phone_number', 'address')
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'verification_token', 'profile_image_preview')
    ordering = ('-created_at',)
    
    # Fieldsets for detail view
    fieldsets = (
        ('Profile Information', {
            'fields': (
                'profile_image_preview',
                'profile_image',
                'username', 
                'email', 
                'first_name', 
                'last_name'
            )
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'address')
        }),
        ('Verification Status', {
            'fields': ('is_verified', 'verification_token', 'last_login')
        }),
        ('Permissions', {
            'fields': (
                'is_active', 
                'is_staff', 
                'is_superuser',
                'groups', 
                'user_permissions'
            )
        }),
        ('Important Dates', {
            'fields': ('created_at', 'updated_at', 'date_joined')
        }),
    )
    
    # Add user fields
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'profile_image'),
        }),
    )
    
    # Custom methods for display
    def profile_image_display(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" />',
                obj.profile_image.url
            )
        return format_html(
            '<div style="width: 50px; height: 50px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; font-weight: bold; font-size: 18px;">{}</div>',
            obj.username[0].upper() if obj.username else '?'
        )
    profile_image_display.short_description = 'Profile Photo'
    
    def profile_image_preview(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #ddd;" />',
                obj.profile_image.url
            )
        return format_html(
            '<div style="width: 150px; height: 150px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; font-weight: bold; font-size: 48px; border: 3px solid #ddd;">{}</div>',
            obj.username[0].upper() if obj.username else '?'
        )
    profile_image_preview.short_description = 'Profile Image Preview'
    
    # Custom actions
    actions = ['verify_users', 'resend_verification_email']
    
    def verify_users(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'Successfully verified {updated} users.')
    verify_users.short_description = "Mark selected users as verified"
    
    def resend_verification_email(self, request, queryset):
        success_count = 0
        for user in queryset:
            if user.send_verification_email():
                success_count += 1
        self.message_user(request, f'Verification emails sent to {success_count} users.')
    resend_verification_email.short_description = "Resend verification email to selected users"

# Register the custom admin
admin.site.register(User, CustomUserAdmin)