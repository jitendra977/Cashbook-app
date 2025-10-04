from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import TransactionType, TransactionCategory, Transaction, CashbookBalance
from store.models import StoreUser, Cashbook
from .serializers import (
    TransactionTypeSerializer,
    TransactionCategorySerializer,
    TransactionListSerializer,
    TransactionDetailSerializer,
    TransactionCreateUpdateSerializer,
    TransactionBulkCreateSerializer,
    TransactionSummarySerializer,
    CashbookBalanceSerializer
)


class TransactionTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transaction types
    
    list: Get all transaction types
    retrieve: Get a specific transaction type
    create: Create a new transaction type
    update: Update a transaction type
    partial_update: Partially update a transaction type
    destroy: Delete a transaction type
    
    Custom actions:
    - active: Get only active transaction types
    - by_nature: Get transaction types filtered by nature (income/expense/transfer)
    """
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    filterset_fields = ['nature', 'is_active']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active transaction types"""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_nature(self, request):
        """Get transaction types by nature"""
        nature = request.query_params.get('nature')
        if not nature:
            return Response(
                {"error": "Nature parameter is required (income/expense/transfer)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if nature not in ['income', 'expense', 'transfer']:
            return Response(
                {"error": "Invalid nature. Must be income, expense, or transfer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(nature=nature, is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TransactionCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transaction categories
    
    list: Get all transaction categories
    retrieve: Get a specific transaction category
    create: Create a new transaction category
    update: Update a transaction category
    partial_update: Partially update a transaction category
    destroy: Delete a transaction category
    
    Custom actions:
    - active: Get only active categories
    """
    queryset = TransactionCategory.objects.all()
    serializer_class = TransactionCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    filterset_fields = ['is_active']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active categories"""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transactions with comprehensive filtering and reporting
    
    Standard actions:
    - list: Get all transactions (filtered by user's store access)
    - retrieve: Get a specific transaction
    - create: Create a new transaction
    - update: Update a transaction
    - partial_update: Partially update a transaction
    - destroy: Delete a transaction
    
    Custom actions:
    - summary: Get transaction summary statistics
    - by_store: Get transactions for a specific store
    - by_cashbook: Get transactions for a specific cashbook
    - by_date_range: Get transactions within a date range
    - recent: Get recent transactions
    - pending: Get pending transactions
    - bulk_create: Create multiple transactions at once
    - export: Export transactions (returns data ready for CSV/Excel)
    """
    queryset = Transaction.objects.select_related(
        'cashbook', 'cashbook__store', 'type', 'category', 'created_by', 'updated_by'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['cashbook', 'type', 'category', 'transaction_date', 'created_by','status']
    search_fields = ['description', 'reference_number', 'cashbook__name', 'created_by','transaction_id']
    ordering_fields = ['transaction_date', 'amount', 'created_at', 'created_by', 'updated_at']
    ordering = ['-transaction_date', '-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateUpdateSerializer
        elif self.action == 'list':
            return TransactionListSerializer
        elif self.action == 'bulk_create':
            return TransactionBulkCreateSerializer
        return TransactionDetailSerializer

    def get_queryset(self):
        """Filter transactions by user's store access"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Get store IDs that the user has access to
        user_store_ids = StoreUser.objects.filter(user=user).values_list('store_id', flat=True)
        
        # Filter transactions by accessible stores
        return queryset.filter(cashbook__store_id__in=user_store_ids)

    def perform_create(self, serializer):
        """Set created_by when creating transaction"""
        serializer.save()

    def perform_update(self, serializer):
        """Set updated_by when updating transaction"""
        serializer.save()

    def perform_destroy(self, instance):
        """Reverse balance changes before deleting transaction"""
        cashbook = instance.cashbook
        amount = instance.amount
        nature = instance.type.nature
        
        # Reverse the balance effect
        if nature == 'income':
            cashbook.current_balance -= amount
        elif nature == 'expense':
            cashbook.current_balance += amount
        
        cashbook.save(update_fields=['current_balance', 'updated_at'])
        
        # Delete the transaction
        instance.delete()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get transaction summary with totals and statistics
        Query params: store, cashbook, start_date, end_date
        """
        queryset = self._apply_filters(request, self.get_queryset())
        
        # Calculate summary statistics
        summary_data = queryset.aggregate(
            total_transactions=Count('id'),
            total_amount=Sum('amount'),
            total_income=Sum('amount', filter=Q(type__nature='income')),
            total_expense=Sum('amount', filter=Q(type__nature='expense')),
            average_transaction=Avg('amount')
        )
        
        # Handle None values
        for key in ['total_amount', 'total_income', 'total_expense', 'average_transaction']:
            if summary_data[key] is None:
                summary_data[key] = 0
        
        # Calculate net balance
        summary_data['net_balance'] = (summary_data['total_income'] or 0) - (summary_data['total_expense'] or 0)
        
        # Add date range info
        summary_data['period_start'] = request.query_params.get('start_date')
        summary_data['period_end'] = request.query_params.get('end_date')
        
        serializer = TransactionSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_store(self, request):
        """Get transactions for a specific store"""
        store_id = request.query_params.get('store')
        if not store_id:
            return Response(
                {"error": "Store ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify user has access to this store
        if not self._verify_store_access(request.user, store_id):
            return Response(
                {"error": "You don't have access to this store"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset().filter(cashbook__store_id=store_id)
        queryset = self._apply_filters(request, queryset)
        
        return self._paginated_response(queryset)

    @action(detail=False, methods=['get'])
    def by_cashbook(self, request):
        """Get transactions for a specific cashbook"""
        cashbook_id = request.query_params.get('cashbook')
        if not cashbook_id:
            return Response(
                {"error": "Cashbook ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(cashbook_id=cashbook_id)
        
        # Verify access through the queryset (already filtered by user's stores)
        if not queryset.exists():
            try:
                cashbook = Cashbook.objects.get(id=cashbook_id)
                if not self._verify_store_access(request.user, cashbook.store_id):
                    return Response(
                        {"error": "You don't have access to this cashbook"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Cashbook.DoesNotExist:
                return Response(
                    {"error": "Cashbook not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        queryset = self._apply_filters(request, queryset)
        return self._paginated_response(queryset)

    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """Get transactions within a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {"error": "Both start_date and end_date are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            queryset = self.get_queryset().filter(
                transaction_date__gte=start_date,
                transaction_date__lte=end_date
            )
            queryset = self.filter_queryset(queryset)
            return self._paginated_response(queryset)
        except Exception as e:
            return Response(
                {"error": f"Invalid date format: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent transactions (last 7 days by default)"""
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now().date() - timedelta(days=days)
        
        queryset = self.get_queryset().filter(transaction_date__gte=start_date)
        queryset = self._apply_filters(request, queryset)
        
        return self._paginated_response(queryset)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending transactions"""
        queryset = self.get_queryset().filter(status='pending')
        queryset = self._apply_filters(request, queryset)
        
        return self._paginated_response(queryset)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple transactions at once"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            transactions = serializer.save()
            response_serializer = TransactionDetailSerializer(transactions, many=True)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to create transactions: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export transactions data (returns formatted data for CSV/Excel)"""
        queryset = self._apply_filters(request, self.get_queryset())
        
        # Don't paginate for export
        serializer = TransactionDetailSerializer(queryset, many=True)
        
        return Response({
            "count": len(serializer.data),
            "data": serializer.data,
            "exported_at": timezone.now().isoformat()
        })

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get transactions grouped by category with totals"""
        queryset = self._apply_filters(request, self.get_queryset())
        
        category_summary = queryset.values(
            'category__name', 'category__id'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')
        
        return Response(list(category_summary))

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get transactions grouped by type with totals"""
        queryset = self._apply_filters(request, self.get_queryset())
        
        type_summary = queryset.values(
            'type__name', 'type__id', 'type__nature'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')
        
        return Response(list(type_summary))

    # Helper methods
    def _apply_filters(self, request, queryset):
        """Apply common filters from query params"""
        # Store filter
        store_id = request.query_params.get('store')
        if store_id:
            queryset = queryset.filter(cashbook__store_id=store_id)
        
        # Cashbook filter
        cashbook_id = request.query_params.get('cashbook')
        if cashbook_id:
            queryset = queryset.filter(cashbook_id=cashbook_id)
        
        # Date filters
        start_date = request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(transaction_date__gte=start_date)
        
        end_date = request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(transaction_date__lte=end_date)
        
        # Apply standard filters
        queryset = self.filter_queryset(queryset)
        
        return queryset

    def _verify_store_access(self, user, store_id):
        """Verify user has access to a store"""
        return StoreUser.objects.filter(user=user, store_id=store_id).exists()

    def _paginated_response(self, queryset):
        """Return paginated response"""
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CashbookBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing cashbook balances (read-only)
    
    list: Get all cashbook balances
    retrieve: Get a specific cashbook balance
    
    Custom actions:
    - by_cashbook: Get balances for a specific cashbook
    - by_date_range: Get balances within a date range
    - latest: Get the latest balance for each cashbook
    """
    queryset = CashbookBalance.objects.select_related('cashbook', 'cashbook__store').all()
    serializer_class = CashbookBalanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['cashbook', 'date']
    ordering_fields = ['date']
    ordering = ['-date']

    def get_queryset(self):
        """Filter by user's store access"""
        queryset = super().get_queryset()
        user = self.request.user
        
        user_store_ids = StoreUser.objects.filter(user=user).values_list('store_id', flat=True)
        return queryset.filter(cashbook__store_id__in=user_store_ids)

    @action(detail=False, methods=['get'])
    def by_cashbook(self, request):
        """Get balances for a specific cashbook"""
        cashbook_id = request.query_params.get('cashbook')
        if not cashbook_id:
            return Response(
                {"error": "Cashbook ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(cashbook_id=cashbook_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the latest balance for each cashbook"""
        from django.db.models import Max
        
        queryset = self.get_queryset()
        
        # Get latest date for each cashbook
        latest_dates = queryset.values('cashbook').annotate(
            latest_date=Max('date')
        )
        
        # Build Q objects for filtering
        q_objects = Q()
        for item in latest_dates:
            q_objects |= Q(cashbook=item['cashbook'], date=item['latest_date'])
        
        latest_balances = queryset.filter(q_objects)
        serializer = self.get_serializer(latest_balances, many=True)
        return Response(serializer.data)