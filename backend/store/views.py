from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Store, StoreUser, Cashbook
from .serializers import StoreSerializer, StoreUserSerializer, CashbookSerializer

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

    @action(detail=True, methods=['get'])
    def cashbooks(self, request, pk=None):
        store = self.get_object()
        cashbooks = store.cashbooks.all()
        serializer = CashbookSerializer(cashbooks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        store = self.get_object()
        store_users = store.store_users.all()
        serializer = StoreUserSerializer(store_users, many=True)
        return Response(serializer.data)

class StoreUserViewSet(viewsets.ModelViewSet):
    queryset = StoreUser.objects.all()
    serializer_class = StoreUserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['store', 'user', 'role']
    search_fields = ['user__username', 'user__email', 'store__name']
    ordering_fields = ['role', 'created_at']

    @action(detail=False, methods=['get'])
    def my_stores(self, request):
        store_users = StoreUser.objects.filter(user=request.user)
        serializer = self.get_serializer(store_users, many=True)
        return Response(serializer.data)

class CashbookViewSet(viewsets.ModelViewSet):
    queryset = Cashbook.objects.all()
    serializer_class = CashbookSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['store']
    search_fields = ['name', 'store__name']
    ordering_fields = ['name', 'created_at']

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        from transactions.serializers import TransactionSerializer
        cashbook = self.get_object()
        transactions = cashbook.transactions.all()
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)