from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Store, StoreUser, Cashbook

User = get_user_model()

class StoreSerializer(serializers.ModelSerializer):
    # Add user-specific fields
    user_role = serializers.SerializerMethodField()
    cashbook_count = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    
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
    
    class Meta:
        model = Cashbook
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_transaction_count(self, obj):
        """Get the number of transactions in this cashbook"""
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

# Simplified serializer for my_stores endpoint
class MyStoreSerializer(serializers.ModelSerializer):
    """Serializer specifically for the my_stores endpoint"""
    store = StoreSerializer(read_only=True)
    
    class Meta:
        model = StoreUser
        fields = ['id', 'store', 'role', 'created_at']

# Alternative approach: Store serializer with minimal user info
class StoreListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for store lists"""
    user_role = serializers.SerializerMethodField()
    cashbook_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Store
        fields = ['id', 'name', 'created_at', 'updated_at', 'user_role', 'cashbook_count']
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            store_user = StoreUser.objects.filter(
                user=request.user, 
                store=obj
            ).first()
            return store_user.role if store_user else None
        return None
    
    def get_cashbook_count(self, obj):
        return obj.cashbooks.count()

# User search serializer for adding users to stores
class UserSearchSerializer(serializers.ModelSerializer):
    """Serializer for searching users to add to stores"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username