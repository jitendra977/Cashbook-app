# backend/transactions/admin.py
from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.utils.html import format_html
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.urls import path
from django.http import JsonResponse
from datetime import datetime, timedelta
from .models import TransactionType, TransactionCategory, Transaction, CashbookBalance


class StoreFilter(SimpleListFilter):
    """Filter transactions by store"""
    title = 'Store'
    parameter_name = 'store'

    def lookups(self, request, model_admin):
        """Return stores that have transactions"""
        from store.models import Store
        stores = Store.objects.filter(
            cashbooks__transactions__isnull=False
        ).distinct().order_by('name')
        return [(store.id, store.name) for store in stores]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(cashbook__store_id=self.value())
        return queryset


class CashbookFilter(SimpleListFilter):
    """Filter transactions by cashbook"""
    title = 'Cashbook'
    parameter_name = 'cashbook'

    def lookups(self, request, model_admin):
        """Return cashbooks that have transactions"""
        from store.models import Cashbook
        cashbooks = Cashbook.objects.filter(
            transactions__isnull=False
        ).distinct().order_by('name')
        return [(cb.id, f"{cb.name} ({cb.store.name})") for cb in cashbooks]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(cashbook_id=self.value())
        return queryset


@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'nature_badge', 
        'is_active', 
        'transaction_count', 
        'total_amount',
        'created_at'
    ]
    list_filter = ['nature', 'is_active', 'created_at']
    search_fields = ['name']
    ordering = ['nature', 'name']
    readonly_fields = ['created_at', 'updated_at', 'transaction_stats']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'nature', 'is_active')
        }),
        ('Statistics', {
            'fields': ('transaction_stats',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def nature_badge(self, obj):
        colors = {
            'income': 'green',
            'expense': 'red', 
            'transfer': 'orange'
        }
        color = colors.get(obj.nature, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_nature_display().upper()
        )
    nature_badge.short_description = 'Nature'
    
    def transaction_count(self, obj):
        count = obj.transactions.count()
        return format_html('<strong>{}</strong>', count)
    transaction_count.short_description = 'Transactions'
    transaction_count.admin_order_field = 'transactions_count'
    
    def total_amount(self, obj):
        """Total amount for all transactions of this type"""
        total = obj.transactions.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        color = 'green' if obj.nature == 'income' else 'red'
        return format_html(
            '<span style="color: {};">${}</span>',
            color,
            '{:,.2f}'.format(total)
        )
    total_amount.short_description = 'Total Amount'
    
    def transaction_stats(self, obj):
        """Display detailed transaction statistics"""
        from django.db.models import Avg
        
        stats = obj.transactions.aggregate(
            total_count=Count('id'),
            total_amount=Sum('amount'),
            avg_amount=Avg('amount'),
            completed_count=Count('id', filter=Q(status='completed')),
            pending_count=Count('id', filter=Q(status='pending'))
        )
        
        total_amount = stats['total_amount'] or 0
        avg_amount = stats['avg_amount'] or 0
        color = 'green' if obj.nature == 'income' else 'red'
        
        html = """
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
            <h4 style="margin-top: 0;">Transaction Statistics</h4>
            <table style="width: 100%;">
                <tr>
                    <td><strong>Total Transactions:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Completed:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Pending:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Total Amount:</strong></td>
                    <td style="color: {};">${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Average Amount:</strong></td>
                    <td>${:,.2f}</td>
                </tr>
            </table>
        </div>
        """.format(
            stats['total_count'],
            stats['completed_count'],
            stats['pending_count'],
            color,
            total_amount,
            avg_amount
        )
        return format_html(html)
    transaction_stats.short_description = 'Statistics'

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            transactions_count=Count('transactions')
        )


@admin.register(TransactionCategory)
class TransactionCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'is_active', 
        'transaction_count', 
        'total_amount',
        'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at', 'category_stats']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Statistics', {
            'fields': ('category_stats',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def transaction_count(self, obj):
        count = obj.transaction_set.count()
        return format_html('<strong>{}</strong>', count)
    transaction_count.short_description = 'Transactions'
    transaction_count.admin_order_field = 'transactions_count'
    
    def total_amount(self, obj):
        """Total amount for all transactions in this category"""
        total = obj.transaction_set.aggregate(
            total=Sum('amount')
        )['total'] or 0
        return format_html('${}', '{:,.2f}'.format(total))
    total_amount.short_description = 'Total Amount'
    
    def category_stats(self, obj):
        """Display detailed category statistics"""
        from django.db.models import Avg
        
        stats = obj.transaction_set.aggregate(
            total_count=Count('id'),
            total_amount=Sum('amount'),
            avg_amount=Avg('amount'),
            income_count=Count('id', filter=Q(type__nature='income')),
            expense_count=Count('id', filter=Q(type__nature='expense'))
        )
        
        total_amount = stats['total_amount'] or 0
        avg_amount = stats['avg_amount'] or 0
        
        html = """
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
            <h4 style="margin-top: 0;">Category Statistics</h4>
            <table style="width: 100%;">
                <tr>
                    <td><strong>Total Transactions:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Income Transactions:</strong></td>
                    <td style="color: green;">{}</td>
                </tr>
                <tr>
                    <td><strong>Expense Transactions:</strong></td>
                    <td style="color: red;">{}</td>
                </tr>
                <tr>
                    <td><strong>Total Amount:</strong></td>
                    <td>${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Average Amount:</strong></td>
                    <td>${:,.2f}</td>
                </tr>
            </table>
        </div>
        """.format(
            stats['total_count'],
            stats['income_count'],
            stats['expense_count'],
            total_amount,
            avg_amount
        )
        return format_html(html)
    category_stats.short_description = 'Statistics'

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            transactions_count=Count('transaction')
        )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    change_list_template = 'admin/transactions/transaction/change_list.html'
    change_form_template = 'admin/transactions/transaction/change_form.html'
    
    list_display = [
        'transaction_id_short', 
        'cashbook_with_store',
        'amount_display',
        'type_with_nature', 
        'category',
        'transaction_date',
        'status_badge', 
        'created_by_short',
        'balance_impact'
    ]
    
    # CORRECTED: Added the custom filters here
    list_filter = [
        StoreFilter,           # Add Store filter
        CashbookFilter,        # Add Cashbook filter
        'status', 
        'type', 
        'category', 
        'transaction_date',
        'is_recurring', 
        'created_at', 
        'cashbook__store',
        'type__nature'
    ]
    
    search_fields = [
        'transaction_id', 
        'description', 
        'reference_number',
        'cashbook__name', 
        'cashbook__store__name',
        'created_by__username',
        'created_by__email'
    ]
    date_hierarchy = 'transaction_date'
    ordering = ['-transaction_date', '-created_at']
    readonly_fields = [
        'transaction_id', 
        'created_by', 
        'created_at',
        'updated_by', 
        'updated_at',
        'balance_impact_display',
        'transaction_details'
    ]
    
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'transaction_id', 
                'cashbook', 
                'amount', 
                'type', 
                'category'
            )
        }),
        ('Details', {
            'fields': (
                'description', 
                'reference_number', 
                'transaction_date',
                'value_date', 
                'status'
            )
        }),
        ('Balance Impact', {
            'fields': ('balance_impact_display',),
            'classes': ('collapse',)
        }),
        ('Recurring Information', {
            'fields': ('is_recurring', 'recurring_pattern'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('tags', 'transaction_details'),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': (
                'created_by', 
                'created_at', 
                'updated_by', 
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        # Get stores and cashbooks for the quick filters
        from store.models import Store, Cashbook
        
        stores = Store.objects.filter(
            cashbooks__transactions__isnull=False
        ).distinct().order_by('name')[:10]  # Limit to 10 stores
        
        cashbooks = Cashbook.objects.filter(
            transactions__isnull=False
        ).select_related('store').distinct().order_by('name')[:10]  # Limit to 10 cashbooks
        
        extra_context.update({
            'stores': stores,
            'cashbooks': cashbooks,
        })
        
        # Add summary statistics
        queryset = self.get_queryset(request)
        
        summary = queryset.aggregate(
            total_income=Sum('amount', filter=Q(type__nature='income', status='completed')),
            total_expense=Sum('amount', filter=Q(type__nature='expense', status='completed')),
            pending_count=Count('id', filter=Q(status='pending'))
        )
        
        total_income = summary['total_income'] or 0
        total_expense = summary['total_expense'] or 0
        net_balance = total_income - total_expense
        
        extra_context.update({
            'total_income': total_income,
            'total_expense': total_expense,
            'net_balance': net_balance,
            'pending_count': summary['pending_count']
        })
        
        return super().changelist_view(request, extra_context=extra_context)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('stats/', self.admin_site.admin_view(self.transaction_stats_view), name='transaction_stats'),
        ]
        return custom_urls + urls
    
    def transaction_stats_view(self, request):
        """API endpoint for transaction statistics"""
        # Get the base queryset with current filters applied
        queryset = self.get_queryset(request)
        
        # Apply the same filters from the request
        store_filter = request.GET.get('store')
        cashbook_filter = request.GET.get('cashbook')
        status_filter = request.GET.get('status')
        type_nature_filter = request.GET.get('type__nature')
        
        if store_filter:
            queryset = queryset.filter(cashbook__store_id=store_filter)
        if cashbook_filter:
            queryset = queryset.filter(cashbook_id=cashbook_filter)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if type_nature_filter:
            queryset = queryset.filter(type__nature=type_nature_filter)
        
        stats = queryset.aggregate(
            total_income=Sum('amount', filter=Q(type__nature='income', status='completed')),
            total_expense=Sum('amount', filter=Q(type__nature='expense', status='completed')),
            pending_count=Count('id', filter=Q(status='pending'))
        )
        
        total_income = stats['total_income'] or 0
        total_expense = stats['total_expense'] or 0
        net_balance = total_income - total_expense
        
        return JsonResponse({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'net_balance': float(net_balance),
            'pending_count': stats['pending_count']
        })
    
    def transaction_id_short(self, obj):
        return str(obj.transaction_id)[:8] + '...'
    transaction_id_short.short_description = 'Transaction ID'
    transaction_id_short.admin_order_field = 'transaction_id'
    
    def cashbook_with_store(self, obj):
        return format_html(
            '{}<br><small style="color: #666;">{}</small>',
            obj.cashbook.name,
            obj.cashbook.store.name
        )
    cashbook_with_store.short_description = 'Cashbook / Store'
    cashbook_with_store.admin_order_field = 'cashbook__name'
    
    def amount_display(self, obj):
        color = 'green' if obj.type.nature == 'income' else 'red'
        icon = '↑' if obj.type.nature == 'income' else '↓'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} ${}</span>',
            color,
            icon,
            '{:,.2f}'.format(obj.amount)
        )
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def type_with_nature(self, obj):
        color = 'green' if obj.type.nature == 'income' else 'red'
        return format_html(
            '{}<br><small style="color: {};">{}</small>',
            obj.type.name,
            color,
            obj.type.get_nature_display()
        )
    type_with_nature.short_description = 'Type / Nature'
    type_with_nature.admin_order_field = 'type__name'
    
    def status_badge(self, obj):
        colors = {
            'completed': 'green',
            'pending': 'orange',
            'cancelled': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def created_by_short(self, obj):
        return obj.created_by.username
    created_by_short.short_description = 'Created By'
    created_by_short.admin_order_field = 'created_by__username'
    
    def balance_impact(self, obj):
        """Show the impact this transaction had on cashbook balance"""
        if obj.status != 'completed':
            return format_html('<span style="color: #666;">N/A</span>')
        
        impact = obj.amount if obj.type.nature == 'income' else -obj.amount
        color = 'green' if impact > 0 else 'red'
        sign = '+' if impact > 0 else ''
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}{}</span>',
            color,
            sign,
            '{:,.2f}'.format(abs(impact))
        )
    balance_impact.short_description = 'Balance Impact'
    
    def balance_impact_display(self, obj):
        """Detailed balance impact in change form"""
        if obj.status != 'completed':
            return format_html(
                '<div style="color: #666; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">'
                'No balance impact (transaction not completed)'
                '</div>'
            )
        
        impact = obj.amount if obj.type.nature == 'income' else -obj.amount
        color = 'green' if impact > 0 else 'red'
        sign = '+' if impact > 0 else ''
        direction = "Increased" if impact > 0 else "Decreased"
        
        html = """
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
            <h4 style="margin-top: 0;">Balance Impact</h4>
            <table style="width: 100%;">
                <tr>
                    <td><strong>Transaction Type:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Amount:</strong></td>
                    <td>${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Impact:</strong></td>
                    <td style="color: {}; font-weight: bold;">{}{:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Effect:</strong></td>
                    <td>{}</td>
                </tr>
            </table>
        </div>
        """.format(
            obj.type.get_nature_display(),
            obj.amount,
            color,
            sign,
            abs(impact),
            direction + ' cashbook balance'
        )
        return format_html(html)
    balance_impact_display.short_description = 'Balance Impact Details'
    
    def transaction_details(self, obj):
        """Display additional transaction details"""
        tags_display = ', '.join(obj.tags) if obj.tags else 'None'
        recurring = 'Yes' if obj.is_recurring else 'No'
        pattern = obj.recurring_pattern or 'N/A'
        value_date = str(obj.value_date) if obj.value_date else 'Same as transaction date'
        
        html = """
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
            <h4 style="margin-top: 0;">Transaction Details</h4>
            <table style="width: 100%;">
                <tr>
                    <td><strong>Recurring:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Pattern:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Value Date:</strong></td>
                    <td>{}</td>
                </tr>
                <tr>
                    <td><strong>Tags:</strong></td>
                    <td>{}</td>
                </tr>
            </table>
        </div>
        """.format(recurring, pattern, value_date, tags_display)
        return format_html(html)
    transaction_details.short_description = 'Additional Details'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        else:
            obj.updated_by = request.user
        
        # If value_date is not set, default to transaction_date
        if not obj.value_date:
            obj.value_date = obj.transaction_date
            
        super().save_model(request, obj, form, change)
    
    actions = [
        'mark_as_completed', 
        'mark_as_cancelled',
        'mark_as_pending',
        'update_to_today',
        'recalculate_cashbook_balances'
    ]
    
    def mark_as_completed(self, request, queryset):
        """Mark selected transactions as completed"""
        for transaction in queryset:
            if transaction.status != 'completed':
                transaction.status = 'completed'
                transaction.save()
        
        self.message_user(request, f'{queryset.count()} transactions marked as completed.')
    mark_as_completed.short_description = 'Mark selected as completed'
    
    def mark_as_cancelled(self, request, queryset):
        """Mark selected transactions as cancelled"""
        for transaction in queryset:
            if transaction.status != 'cancelled':
                transaction.status = 'cancelled'
                transaction.save()
        
        self.message_user(request, f'{queryset.count()} transactions marked as cancelled.')
    mark_as_cancelled.short_description = 'Mark selected as cancelled'
    
    def mark_as_pending(self, request, queryset):
        """Mark selected transactions as pending"""
        for transaction in queryset:
            if transaction.status != 'pending':
                transaction.status = 'pending'
                transaction.save()
        
        self.message_user(request, f'{queryset.count()} transactions marked as pending.')
    mark_as_pending.short_description = 'Mark selected as pending'
    
    def update_to_today(self, request, queryset):
        """Update transaction dates to today"""
        today = timezone.now().date()
        updated = queryset.update(transaction_date=today)
        self.message_user(request, f'{updated} transactions updated to today.')
    update_to_today.short_description = 'Update transaction date to today'
    
    def recalculate_cashbook_balances(self, request, queryset):
        """Recalculate balances for affected cashbooks"""
        cashbooks = set(transaction.cashbook for transaction in queryset)
        updated_count = 0
        
        for cashbook in cashbooks:
            try:
                old_balance = cashbook.current_balance
                cashbook.recalculate_and_save_balance()
                new_balance = cashbook.current_balance
                
                if old_balance != new_balance:
                    updated_count += 1
                    
            except Exception as e:
                self.message_user(
                    request, 
                    f"Error recalculating balance for {cashbook.name}: {str(e)}", 
                    level='ERROR'
                )
        
        self.message_user(
            request, 
            f'Recalculated balances for {updated_count} cashbook(s) affected by selected transactions.'
        )
    recalculate_cashbook_balances.short_description = 'Recalculate affected cashbook balances'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'cashbook',
            'cashbook__store', 
            'type',
            'category',
            'created_by',
            'updated_by'
        )


@admin.register(CashbookBalance)
class CashbookBalanceAdmin(admin.ModelAdmin):
    list_display = [
        'cashbook_with_store',
        'date', 
        'opening_balance_display',
        'closing_balance_display', 
        'total_income_display',
        'total_expense_display', 
        'net_change_display',
        'transaction_count'
    ]
    list_filter = [
        'cashbook', 
        'date', 
        'cashbook__store'
    ]
    search_fields = [
        'cashbook__name', 
        'cashbook__store__name'
    ]
    date_hierarchy = 'date'
    ordering = ['-date', 'cashbook']
    
    readonly_fields = [
        'opening_balance', 
        'closing_balance',
        'total_income', 
        'total_expense',
        'balance_summary'
    ]
    
    fieldsets = (
        ('Balance Information', {
            'fields': (
                'cashbook', 
                'date', 
                'opening_balance',
                'closing_balance', 
                'total_income', 
                'total_expense'
            )
        }),
        ('Summary', {
            'fields': ('balance_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def cashbook_with_store(self, obj):
        return format_html(
            '{}<br><small style="color: #666;">{}</small>',
            obj.cashbook.name,
            obj.cashbook.store.name
        )
    cashbook_with_store.short_description = 'Cashbook / Store'
    cashbook_with_store.admin_order_field = 'cashbook__name'
    
    def opening_balance_display(self, obj):
        return format_html(
            '<span style="font-weight: bold;">${}</span>',
            '{:,.2f}'.format(obj.opening_balance)
        )
    opening_balance_display.short_description = 'Opening'
    opening_balance_display.admin_order_field = 'opening_balance'
    
    def closing_balance_display(self, obj):
        return format_html(
            '<span style="font-weight: bold;">${}</span>',
            '{:,.2f}'.format(obj.closing_balance)
        )
    closing_balance_display.short_description = 'Closing'
    closing_balance_display.admin_order_field = 'closing_balance'
    
    def total_income_display(self, obj):
        return format_html(
            '<span style="color: green;">+${}</span>',
            '{:,.2f}'.format(obj.total_income)
        )
    total_income_display.short_description = 'Income'
    total_income_display.admin_order_field = 'total_income'
    
    def total_expense_display(self, obj):
        return format_html(
            '<span style="color: red;">-${}</span>',
            '{:,.2f}'.format(obj.total_expense)
        )
    total_expense_display.short_description = 'Expense'
    total_expense_display.admin_order_field = 'total_expense'
    
    def net_change_display(self, obj):
        net = obj.closing_balance - obj.opening_balance
        color = 'green' if net >= 0 else 'red'
        sign = '+' if net >= 0 else ''
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}{}</span>',
            color,
            sign,
            '{:,.2f}'.format(abs(net))
        )
    net_change_display.short_description = 'Net Change'
    
    def transaction_count(self, obj):
        """Count transactions for this cashbook on this date"""
        count = obj.cashbook.transactions.filter(
            transaction_date=obj.date,
            status='completed'
        ).count()
        return format_html('<strong>{}</strong>', count)
    transaction_count.short_description = 'Transactions'
    
    def balance_summary(self, obj):
        """Display detailed balance summary"""
        net_income = obj.total_income - obj.total_expense
        actual_net = obj.closing_balance - obj.opening_balance
        variance = actual_net - net_income
        net_color = 'green' if net_income >= 0 else 'red'
        variance_color = 'green' if actual_net >= net_income else 'red'
        
        html = """
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
            <h4 style="margin-top: 0;">Daily Balance Summary</h4>
            <table style="width: 100%;">
                <tr>
                    <td><strong>Opening Balance:</strong></td>
                    <td>${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Total Income:</strong></td>
                    <td style="color: green;">+${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Total Expense:</strong></td>
                    <td style="color: red;">-${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Net Income/Expense:</strong></td>
                    <td style="color: {};">${:,.2f}</td>
                </tr>
                <tr style="border-top: 1px solid #dee2e6;">
                    <td><strong>Expected Closing:</strong></td>
                    <td>${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Actual Closing:</strong></td>
                    <td>${:,.2f}</td>
                </tr>
                <tr>
                    <td><strong>Variance:</strong></td>
                    <td style="color: {};">${:,.2f}</td>
                </tr>
            </table>
        </div>
        """.format(
            obj.opening_balance,
            obj.total_income,
            obj.total_expense,
            net_color,
            net_income,
            obj.opening_balance + net_income,
            obj.closing_balance,
            variance_color,
            variance
        )
        return format_html(html)
    balance_summary.short_description = 'Daily Summary'
    
    def has_add_permission(self, request):
        # Balances should be auto-generated, not manually added
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Prevent manual deletion of balances
        return False
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'cashbook',
            'cashbook__store'
        )