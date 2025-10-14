# backend/store/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Store, StoreUser, Cashbook


# -----------------------------
# Store Admin
# -----------------------------
@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'store_owner',
        'cashbook_count',
        'user_count',
        'is_active',
        'created_at'
    )
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'store_owner__username', 'store_owner__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'store_owner', 'is_active')
        }),
        ('Contact Information', {
            'fields': ('address', 'contact_number', 'email', 'website'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('description', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cashbook_count(self, obj):
        return obj.cashbooks.count()
    cashbook_count.short_description = 'Cashbooks'
    
    def user_count(self, obj):
        return obj.store_users.count()
    user_count.short_description = 'Users'


# -----------------------------
# StoreUser Admin
# -----------------------------
@admin.register(StoreUser)
class StoreUserAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'store',
        'role',
        'created_at',
        'updated_at'
    )
    list_filter = ('role', 'store', 'created_at')
    search_fields = (
        'user__username', 
        'user__email', 
        'user__first_name', 
        'user__last_name',
        'store__name'
    )
    ordering = ('store', 'role', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'store')


# -----------------------------
# Cashbook Admin
# -----------------------------
@admin.register(Cashbook)
class CashbookAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'store',
        'initial_balance',
        'current_balance',
        'calculated_balance',
        'balance_status',
        'transaction_count',
        'is_active',
        'created_at'
    )
    list_filter = ('store', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'store__name')
    ordering = ('store', 'name')
    readonly_fields = (
        'current_balance',
        'created_at', 
        'updated_at',
        'calculated_balance_display',
        'balance_summary_display',
        'transaction_count_display'
    )
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('store', 'name', 'description', 'is_active')
        }),
        ('Balance Information', {
            'fields': (
                'initial_balance',
                'current_balance',
                'calculated_balance_display',
                'balance_summary_display'
            )
        }),
        ('Statistics', {
            'fields': ('transaction_count_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        # Optimize queryset to reduce database queries
        return super().get_queryset(request).select_related('store')
    
    def calculated_balance(self, obj):
        """Display calculated balance in list view"""
        try:
            calculated = obj.calculate_balance()
            return f"${calculated:,.2f}"
        except Exception as e:
            return f"Error: {str(e)}"
    calculated_balance.short_description = 'Calculated Balance'
    
    def balance_status(self, obj):
        """Show if stored balance matches calculated balance"""
        try:
            if obj.balance_is_accurate:
                return format_html(
                    '<span style="color: green;">✓ Accurate</span>'
                )
            else:
                return format_html(
                    '<span style="color: red;">✗ Inaccurate</span>'
                )
        except:
            return format_html('<span style="color: orange;">?</span>')
    balance_status.short_description = 'Balance Status'
    
    def transaction_count(self, obj):
        """Display transaction count in list view"""
        return obj.transaction_count
    transaction_count.short_description = 'Transactions'
    
    def calculated_balance_display(self, obj):
        """Display calculated balance in detail view"""
        try:
            calculated = obj.calculate_balance()
            stored = obj.current_balance
            difference = calculated - stored
            
            html = f"""
            <div style="margin-bottom: 10px;">
                <strong>Calculated Balance:</strong> ${calculated:,.2f}<br>
                <strong>Stored Balance:</strong> ${stored:,.2f}<br>
                <strong>Difference:</strong> 
            """
            
            if abs(difference) < 0.01:  # Less than 1 cent difference
                html += f'<span style="color: green;">${difference:,.2f}</span>'
            else:
                html += f'<span style="color: red;">${difference:,.2f}</span>'
            
            html += "</div>"
            
            if abs(difference) >= 0.01:
                html += """
                <div style="background-color: #fff3cd; padding: 10px; border: 1px solid #ffeaa7; border-radius: 4px;">
                    <strong>Warning:</strong> Stored balance doesn't match calculated balance. 
                    Consider recalculating the balance.
                </div>
                """
            
            return format_html(html)
        except Exception as e:
            return format_html(f'<span style="color: red;">Error: {str(e)}</span>')
    calculated_balance_display.short_description = 'Balance Calculation'
    
    def balance_summary_display(self, obj):
        """Display detailed balance summary in detail view"""
        try:
            summary = obj.get_balance_summary()
            
            html = f"""
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
                <h4 style="margin-top: 0;">Balance Summary</h4>
                <table style="width: 100%;">
                    <tr>
                        <td><strong>Initial Balance:</strong></td>
                        <td>${summary['initial_balance']:,.2f}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Income:</strong></td>
                        <td style="color: green;">+${summary['total_income']:,.2f}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Expense:</strong></td>
                        <td style="color: red;">-${summary['total_expense']:,.2f}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Transfer:</strong></td>
                        <td style="color: orange;">-${summary['total_transfer']:,.2f}</td>
                    </tr>
                    <tr style="border-top: 1px solid #dee2e6;">
                        <td><strong>Net Change:</strong></td>
                        <td><strong>${summary['net_change']:,.2f}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Completed Transactions:</strong></td>
                        <td>{summary['transaction_count']}</td>
                    </tr>
                    <tr>
                        <td><strong>Pending Transactions:</strong></td>
                        <td>{summary['pending_count']}</td>
                    </tr>
                </table>
            </div>
            """
            return format_html(html)
        except Exception as e:
            return format_html(f'<span style="color: red;">Error generating summary: {str(e)}</span>')
    balance_summary_display.short_description = 'Balance Summary'
    
    def transaction_count_display(self, obj):
        """Display transaction counts in detail view"""
        try:
            from transactions.models import Transaction
            completed_count = obj.transactions.filter(
                status=Transaction.STATUS_COMPLETED
            ).count()
            pending_count = obj.transactions.filter(
                status=Transaction.STATUS_PENDING
            ).count()
            total_count = obj.transactions.count()
            
            html = f"""
            <div>
                <strong>Total Transactions:</strong> {total_count}<br>
                <strong>Completed:</strong> {completed_count}<br>
                <strong>Pending:</strong> {pending_count}
            </div>
            """
            return format_html(html)
        except Exception as e:
            return format_html(f'<span style="color: red;">Error: {str(e)}</span>')
    transaction_count_display.short_description = 'Transaction Statistics'
    
    actions = ['recalculate_balances', 'deactivate_cashbooks', 'activate_cashbooks']
    
    def recalculate_balances(self, request, queryset):
        """Admin action to recalculate balances for selected cashbooks"""
        updated_count = 0
        errors = []
        
        for cashbook in queryset:
            try:
                old_balance = cashbook.current_balance
                cashbook.recalculate_and_save_balance()
                new_balance = cashbook.current_balance
                
                if old_balance != new_balance:
                    updated_count += 1
                    
            except Exception as e:
                errors.append(f"{cashbook.name}: {str(e)}")
        
        message = f"Recalculated balances for {updated_count} cashbook(s)."
        if errors:
            self.message_user(request, f"{message} Errors: {', '.join(errors)}", level='ERROR')
        else:
            self.message_user(request, message)
    
    recalculate_balances.short_description = "Recalculate balances for selected cashbooks"
    
    def deactivate_cashbooks(self, request, queryset):
        """Admin action to deactivate cashbooks"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Deactivated {updated} cashbook(s).")
    
    deactivate_cashbooks.short_description = "Deactivate selected cashbooks"
    
    def activate_cashbooks(self, request, queryset):
        """Admin action to activate cashbooks"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Activated {updated} cashbook(s).")
    
    activate_cashbooks.short_description = "Activate selected cashbooks"


# Optional: Custom admin site header and title
admin.site.site_header = "Store Management System"
admin.site.site_title = "Store Management"
admin.site.index_title = "Administration"