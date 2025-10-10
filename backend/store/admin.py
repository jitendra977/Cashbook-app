from django.contrib import admin
from .models import Store, StoreUser, Cashbook


# -----------------------------
# Store Admin
# -----------------------------
@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'address',
        'contact_number',
        'store_owner', 
        'created_at',
        'updated_at'
    )
    search_fields = ('name', 'store_owner__username')  # ✅ Optional search update
    ordering = ('id',)


# -----------------------------
# StoreUser Admin
# -----------------------------
@admin.register(StoreUser)
class StoreUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'store', 'role', 'created_at', 'updated_at')
    list_filter = ('role', 'store')
    search_fields = ('user__username', 'store__name')
    ordering = ('store', 'role')


# -----------------------------
# Cashbook Admin
# -----------------------------
@admin.register(Cashbook)
class CashbookAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'store', 'created_at', 'updated_at')
    list_filter = ('store',)
    search_fields = ('name', 'store__name')
    ordering = ('store', 'name')