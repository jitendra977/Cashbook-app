from django.contrib import admin
from .models import TransactionType, TransactionCategory, Transaction


# -----------------------------
# TransactionType Admin
# -----------------------------
@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)
    ordering = ('name',)


# -----------------------------
# TransactionCategory Admin
# -----------------------------
@admin.register(TransactionCategory)
class TransactionCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)
    ordering = ('name',)


# -----------------------------
# Transaction Admin
# -----------------------------
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'cashbook',
        'amount',
        'type',
        'category',
        'transaction_date',
        'created_by',
        'updated_by',
        'created_at',
        'updated_at',
    )
    list_filter = ('type', 'category', 'cashbook', 'transaction_date')
    search_fields = ('description', 'cashbook__name', 'created_by__username')
    ordering = ('-transaction_date',)

    # Optional: make it readonly for audit fields
    readonly_fields = ('created_at', 'updated_at')