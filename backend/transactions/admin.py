from django.contrib import admin
from django.utils.html import format_html
from .models import TransactionType, TransactionCategory, Transaction, CashbookBalance


@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'nature', 'is_active', 'transaction_count', 'created_at']
    list_filter = ['nature', 'is_active', 'created_at']
    search_fields = ['name']
    ordering = ['name']
    
    def transaction_count(self, obj):
        return obj.transactions.count()
    transaction_count.short_description = 'Transactions'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'nature', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TransactionCategory)
class TransactionCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'transaction_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def transaction_count(self, obj):
        return obj.transaction_set.count()
    transaction_count.short_description = 'Transactions'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'transaction_id_short', 'cashbook', 'amount_display',
        'type', 'category', 'transaction_date', 'status_badge', 'created_by'
    ]
    list_filter = [
        'status', 'type', 'category', 'transaction_date',
        'is_recurring', 'created_at', 'cashbook__store'
    ]
    search_fields = [
        'transaction_id', 'description', 'reference_number',
        'cashbook__name', 'created_by__username'
    ]
    date_hierarchy = 'transaction_date'
    ordering = ['-transaction_date', '-created_at']
    
    readonly_fields = [
        'transaction_id', 'created_by', 'created_at',
        'updated_by', 'updated_at'
    ]
    
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'transaction_id', 'cashbook', 'amount', 'type', 'category'
            )
        }),
        ('Details', {
            'fields': (
                'description', 'reference_number', 'transaction_date',
                'value_date', 'status'
            )
        }),
        ('Recurring Information', {
            'fields': ('is_recurring', 'recurring_pattern'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': (
                'created_by', 'created_at', 'updated_by', 'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def transaction_id_short(self, obj):
        return str(obj.transaction_id)[:8] + '...'
    transaction_id_short.short_description = 'Transaction ID'
    
    def amount_display(self, obj):
        color = 'green' if obj.type.nature == 'income' else 'red'
        return format_html(
            '<span style="color: {};">${}</span>',
            color,
            obj.amount
        )
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def status_badge(self, obj):
        colors = {
            'completed': 'green',
            'pending': 'orange',
            'cancelled': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        else:
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['mark_as_completed', 'mark_as_cancelled']
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} transactions marked as completed.')
    mark_as_completed.short_description = 'Mark selected as completed'
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} transactions marked as cancelled.')
    mark_as_cancelled.short_description = 'Mark selected as cancelled'


@admin.register(CashbookBalance)
class CashbookBalanceAdmin(admin.ModelAdmin):
    list_display = [
        'cashbook', 'date', 'opening_balance_display',
        'closing_balance_display', 'total_income_display',
        'total_expense_display', 'net_change'
    ]
    list_filter = ['cashbook', 'date', 'cashbook__store']
    search_fields = ['cashbook__name', 'cashbook__store__name']
    date_hierarchy = 'date'
    ordering = ['-date', 'cashbook']
    
    readonly_fields = [
        'opening_balance', 'closing_balance',
        'total_income', 'total_expense'
    ]
    
    fieldsets = (
        ('Balance Information', {
            'fields': (
                'cashbook', 'date', 'opening_balance',
                'closing_balance', 'total_income', 'total_expense'
            )
        }),
    )
    
    def opening_balance_display(self, obj):
        return format_html('${:,.2f}', obj.opening_balance)
    opening_balance_display.short_description = 'Opening Balance'
    opening_balance_display.admin_order_field = 'opening_balance'
    
    def closing_balance_display(self, obj):
        return format_html('${:,.2f}', obj.closing_balance)
    closing_balance_display.short_description = 'Closing Balance'
    closing_balance_display.admin_order_field = 'closing_balance'
    
    def total_income_display(self, obj):
        return format_html(
            '<span style="color: green;">${:,.2f}</span>',
            obj.total_income
        )
    total_income_display.short_description = 'Total Income'
    total_income_display.admin_order_field = 'total_income'
    
    def total_expense_display(self, obj):
        return format_html(
            '<span style="color: red;">${:,.2f}</span>',
            obj.total_expense
        )
    total_expense_display.short_description = 'Total Expense'
    total_expense_display.admin_order_field = 'total_expense'
    
    def net_change(self, obj):
        net = obj.closing_balance - obj.opening_balance
        color = 'green' if net >= 0 else 'red'
        return format_html(
            '<span style="color: {};">${:,.2f}</span>',
            color,
            net
        )
    net_change.short_description = 'Net Change'
    
    def has_add_permission(self, request):
        # Balances should be auto-generated, not manually added
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Prevent manual deletion of balances
        return False