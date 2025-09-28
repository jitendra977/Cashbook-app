from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Store, StoreUser, Cashbook
from .serializers import (
    StoreSerializer, 
    StoreUserSerializer, 
    CashbookSerializer, 
    UserSearchSerializer
)

class StoreViewSet(viewsets.ModelViewSet):
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        """
        Return stores based on user permissions:
        - Superusers see all stores
        - Regular users see only stores where they have StoreUser access
        """
        user = self.request.user
        
        if user.is_superuser:
            return Store.objects.all()
        
        # Get stores where user is assigned through StoreUser
        user_store_ids = StoreUser.objects.filter(user=user).values_list('store_id', flat=True)
        return Store.objects.filter(id__in=user_store_ids)

    def perform_create(self, serializer):
        """
        Override create to automatically assign the creator as store owner
        Superusers can create without automatic StoreUser assignment
        """
        store = serializer.save()
        
        # Only create StoreUser for regular users, not superusers
        if not self.request.user.is_superuser:
            StoreUser.objects.create(
                store=store,
                user=self.request.user,
                role='owner'
            )

    def perform_destroy(self, instance):
        """
        Only allow deletion if user is owner of the store
        """
        user = self.request.user
        if not user.is_superuser:
            store_user = StoreUser.objects.filter(
                user=user, 
                store=instance, 
                role='owner'
            ).first()
            
            if not store_user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only store owners can delete stores.")
        
        super().perform_destroy(instance)

    def perform_update(self, serializer):
        """
        Only allow updates if user is owner or manager of the store
        """
        user = self.request.user
        if not user.is_superuser:
            store_user = StoreUser.objects.filter(
                user=user, 
                store=serializer.instance, 
                role__in=['owner', 'manager']
            ).first()
            
            if not store_user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only store owners and managers can update stores.")
        
        super().perform_destroy(instance)

    @action(detail=True, methods=['get'])
    def cashbooks(self, request, pk=None):
        """Get cashbooks for a specific store (only if user has access)"""
        store = self.get_object()  # This already applies the user filter
        cashbooks = store.cashbooks.all()
        serializer = CashbookSerializer(cashbooks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get users for a specific store (only if user has access)"""
        store = self.get_object()  # This already applies the user filter
        store_users = store.store_users.all()
        serializer = StoreUserSerializer(store_users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search_users(self, request):
        """Search users to add to stores"""
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )[:10]
        
        serializer = UserSearchSerializer(users, many=True)
        return Response(serializer.data)

class StoreUserViewSet(viewsets.ModelViewSet):
    serializer_class = StoreUserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['store', 'user', 'role']
    search_fields = ['user__username', 'user__email', 'store__name']
    ordering_fields = ['role', 'created_at']

    def get_queryset(self):
        """
        Return StoreUser records based on user permissions:
        - Superusers see all StoreUser records
        - Regular users see only StoreUser records for stores they have access to
        """
        user = self.request.user
        
        if user.is_superuser:
            return StoreUser.objects.all()
        
        # Get stores where user is assigned
        user_store_ids = StoreUser.objects.filter(user=user).values_list('store_id', flat=True)
        # Return StoreUser records for those stores
        return StoreUser.objects.filter(store_id__in=user_store_ids)

    @action(detail=False, methods=['get'])
    def my_stores(self, request):
        """Get stores where the current user is assigned"""
        store_users = StoreUser.objects.filter(user=request.user).select_related('store', 'user')
        serializer = self.get_serializer(store_users, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """
        Override create to ensure users can only add users to stores they have appropriate permissions for
        Superusers bypass all permission checks
        """
        if self.request.user.is_superuser:
            serializer.save()
            return
        
        store = serializer.validated_data['store']
        user = self.request.user
        
        # Check if the current user has owner or manager role in this store
        store_user = StoreUser.objects.filter(
            user=user, 
            store=store,
            role__in=['owner', 'manager']
        ).first()
        
        if not store_user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You need owner or manager role to add users to this store.")
        
        # Owners can assign any role, managers can only assign staff role
        new_user_role = serializer.validated_data.get('role')
        if store_user.role == 'manager' and new_user_role in ['owner', 'manager']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Managers can only assign staff role.")
        
        serializer.save()

    def perform_update(self, serializer):
        """
        Override update to ensure appropriate permissions for role changes
        Superusers bypass all permission checks
        """
        if self.request.user.is_superuser:
            serializer.save()
            return
            
        store_user_instance = serializer.instance
        current_user = self.request.user
        
        # Check if the current user has appropriate permissions
        user_permissions = StoreUser.objects.filter(
            user=current_user,
            store=store_user_instance.store,
            role__in=['owner', 'manager']
        ).first()
        
        if not user_permissions:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You need owner or manager role to modify user roles.")
        
        # Additional role-based restrictions
        new_role = serializer.validated_data.get('role', store_user_instance.role)
        if user_permissions.role == 'manager' and new_role in ['owner', 'manager']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Managers can only assign staff role.")
        
        serializer.save()

    def perform_destroy(self, instance):
        """
        Override destroy to ensure appropriate permissions
        Superusers bypass all permission checks
        """
        current_user = self.request.user
        
        # Superusers can delete any StoreUser record
        if current_user.is_superuser:
            super().perform_destroy(instance)
            return
        
        # Users can remove themselves from any store
        if instance.user == current_user:
            super().perform_destroy(instance)
            return
        
        # Check if current user has owner or manager role in this store
        user_permissions = StoreUser.objects.filter(
            user=current_user,
            store=instance.store,
            role__in=['owner', 'manager']
        ).first()
        
        if not user_permissions:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You need owner or manager role to remove users from this store.")
        
        # Managers cannot remove owners or other managers
        if user_permissions.role == 'manager' and instance.role in ['owner', 'manager']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Managers cannot remove owners or other managers.")
        
        super().perform_destroy(instance)

class CashbookViewSet(viewsets.ModelViewSet):
    serializer_class = CashbookSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['store']
    search_fields = ['name', 'store__name']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        """
        Return cashbooks based on user permissions:
        - Superusers see all cashbooks
        - Regular users see only cashbooks for stores they have access to
        """
        user = self.request.user
        
        if user.is_superuser:
            return Cashbook.objects.all().select_related('store')
        
        # Get stores where user is assigned
        user_store_ids = StoreUser.objects.filter(user=user).values_list('store_id', flat=True)
        # Return cashbooks for those stores
        return Cashbook.objects.filter(store_id__in=user_store_ids).select_related('store')

    def perform_create(self, serializer):
        """
        Override create to ensure users can only create cashbooks for stores they have access to
        Superusers bypass all permission checks
        """
        if self.request.user.is_superuser:
            serializer.save()
            return
            
        store = serializer.validated_data['store']
        user = self.request.user
        
        # Check if the current user has access to this store
        store_user = StoreUser.objects.filter(user=user, store=store).first()
        if not store_user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to create cashbooks for this store.")
        
        serializer.save()

    def perform_update(self, serializer):
        """
        Override update to ensure appropriate permissions
        Superusers bypass all permission checks
        """
        if self.request.user.is_superuser:
            serializer.save()
            return
            
        cashbook = serializer.instance
        user = self.request.user
        
        # Check if user has owner or manager role in the store
        store_user = StoreUser.objects.filter(
            user=user,
            store=cashbook.store,
            role__in=['owner', 'manager']
        ).first()
        
        if not store_user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You need owner or manager role to update cashbooks.")
        
        serializer.save()

    def perform_destroy(self, instance):
        """
        Override destroy to ensure only owners can delete cashbooks
        """
        user = self.request.user
        
        if not user.is_superuser:
            store_user = StoreUser.objects.filter(
                user=user,
                store=instance.store,
                role='owner'
            ).first()
            
            if not store_user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only store owners can delete cashbooks.")
        
        super().perform_destroy(instance)

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get transactions for a cashbook (only if user has access to the store)"""
        # Import here to avoid circular imports
        try:
            from transactions.serializers import TransactionSerializer
            cashbook = self.get_object()  # This already applies the user filter
            transactions = cashbook.transactions.all()
            serializer = TransactionSerializer(transactions, many=True)
            return Response(serializer.data)
        except ImportError:
            return Response({"error": "Transaction serializer not found"}, status=400)