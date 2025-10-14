# backend/store/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Store, StoreUser, Cashbook

User = get_user_model()


class StoreOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email']


class StoreSerializer(serializers.ModelSerializer):
    # Add user-specific fields
    user_role = serializers.SerializerMethodField()
    cashbook_count = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    store_owner = StoreOwnerSerializer(read_only=True)
    
    class Meta:
        model = Store
        fields = '__all__'
    
    def get_user_role(self, obj):
        """Get the current user's role in this store"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            store_user = StoreUser.objects.filter(
                user=request.user, 
                store=obj
            ).first()
            return store_user.role if store_user else None
        return None
    
    def get_cashbook_count(self, obj):
        """Get the number of cashbooks in this store"""
        return obj.cashbooks.count()
    
    def get_user_count(self, obj):
        """Get the number of users assigned to this store"""
        return obj.store_users.count()


class StoreUserSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    # For creating store users by email instead of user ID
    user_email = serializers.EmailField(write_only=True, required=False)
    
    class Meta:
        model = StoreUser
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def validate(self, attrs):
        """Custom validation to handle user creation by email"""
        user_email = attrs.pop('user_email', None)
        
        # If user_email is provided, try to find or suggest the user
        if user_email and not attrs.get('user'):
            try:
                user = User.objects.get(email=user_email)
                attrs['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'user_email': f'No user found with email: {user_email}'
                })
        
        # Validate that user is not already assigned to this store
        if attrs.get('user') and attrs.get('store'):
            existing = StoreUser.objects.filter(
                user=attrs['user'],
                store=attrs['store']
            ).exclude(pk=self.instance.pk if self.instance else None)
            
            if existing.exists():
                raise serializers.ValidationError({
                    'user': 'This user is already assigned to this store.'
                })
        
        return attrs


class CashbookSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    transaction_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    # ✅ NEW: Balance-related fields
    balance_summary = serializers.SerializerMethodField(read_only=True)
    balance_is_accurate = serializers.BooleanField(read_only=True)
    calculated_balance = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Cashbook
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'current_balance')
    
    def get_transaction_count(self, obj):
        """Get the number of completed transactions in this cashbook"""
        # ✅ UPDATED: Only count completed transactions
        try:
            from transactions.models import Transaction
            return obj.transactions.filter(
                status=Transaction.STATUS_COMPLETED
            ).count()
        except:
            # Fallback if transactions app not available
            return obj.transactions.count()
    
    def get_user_role(self, obj):
        """Get the current user's role in the parent store"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            store_user = StoreUser.objects.filter(
                user=request.user, 
                store=obj.store
            ).first()
            return store_user.role if store_user else None
        return None
    
    def get_calculated_balance(self, obj):
        """
        Get the calculated balance (what the balance should be).
        Useful for detecting inconsistencies.
        """
        try:
            return str(obj.calculate_balance())
        except:
            return None
    
    def get_balance_summary(self, obj):
        """
        Get detailed balance information.
        Only include in detail views or when explicitly requested to avoid performance issues.
        """
        request = self.context.get('request')
        view = self.context.get('view')
        
        # Include summary if:
        # 1. Explicitly requested via query parameter (?summary=true)
        # 2. Detail view (retrieve action)
        # 3. Viewing specific cashbook
        include_summary = False
        
        if request:
            # Check query parameter
            if request.query_params.get('summary') == 'true':
                include_summary = True
        
        # Check if this is a detail view (retrieve single object)
        if view and hasattr(view, 'action') and view.action == 'retrieve':
            include_summary = True
        
        if include_summary:
            try:
                return obj.get_balance_summary()
            except Exception as e:
                # Return basic info if full summary fails
                return {
                    'error': str(e),
                    'initial_balance': str(obj.initial_balance),
                    'current_balance': str(obj.current_balance)
                }
        
        return None
    
    def validate_initial_balance(self, value):
        """Validate that initial balance is not negative."""
        if value < 0:
            raise serializers.ValidationError(
                "Initial balance cannot be negative."
            )
        return value
    
    def validate_current_balance(self, value):
        """
        Prevent manual updates to current_balance.
        This field should only be updated automatically via signals.
        """
        if self.instance and self.instance.current_balance != value:
            raise serializers.ValidationError(
                "Current balance is read-only and updated automatically based on transactions."
            )
        return value
    
    def create(self, validated_data):
        """
        Override create to handle initial balance setup.
        The model's save method will set current_balance = initial_balance.
        """
        # Remove current_balance if provided (should be calculated)
        validated_data.pop('current_balance', None)
        
        cashbook = Cashbook.objects.create(**validated_data)
        return cashbook
    
    def update(self, instance, validated_data):
        """
        Override update to prevent manual current_balance changes.
        """
        # Remove current_balance from validated_data if present
        validated_data.pop('current_balance', None)
        
        return super().update(instance, validated_data)


# User search serializer for adding users to stores
class UserSearchSerializer(serializers.ModelSerializer):
    """Serializer for searching users to add to stores"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


# ✅ NEW: Lightweight serializer for list views (better performance)
class CashbookListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing cashbooks.
    Excludes expensive balance_summary to improve performance.
    """
    store_name = serializers.CharField(source='store.name', read_only=True)
    transaction_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cashbook
        fields = [
            'id', 'store', 'store_name', 'name', 'description',
            'initial_balance', 'current_balance', 'is_active',
            'transaction_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'current_balance')
    
    def get_transaction_count(self, obj):
        """Get count of completed transactions using property"""
        return obj.transaction_count