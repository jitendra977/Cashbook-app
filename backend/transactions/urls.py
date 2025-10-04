from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransactionTypeViewSet,
    TransactionCategoryViewSet,
    TransactionViewSet,
    CashbookBalanceViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'types', TransactionTypeViewSet, basename='transaction-type')
router.register(r'categories', TransactionCategoryViewSet, basename='transaction-category')
router.register(r'', TransactionViewSet, basename='transaction')
router.register(r'balances', CashbookBalanceViewSet, basename='cashbook-balance')

app_name = 'transactions'

urlpatterns = [
    path('', include(router.urls)),
]