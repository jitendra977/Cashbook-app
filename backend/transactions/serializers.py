from rest_framework import serializers
from django.db import transaction as db_transaction
from .models import TransactionType, TransactionCategory, Transaction, CashbookBalance
from store.models import Cashbook


class TransactionTypeSerializer(serializers.ModelSerializer):
    """Serializer for transaction types"""
    transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = TransactionType
        fields = ['id', 'name', 'nature', 'is_active', 'transaction_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_transaction_count(self, obj):
        return obj.transactions.count()


class TransactionCategorySerializer(serializers.ModelSerializer):
    """Serializer for transaction categories"""
    transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = TransactionCategory
        fields = ['id', 'name', 'description', 'is_active', 'transaction_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_transaction_count(self, obj):
        return obj.transaction_set.count()


class CashbookBalanceSerializer(serializers.ModelSerializer):
    """Serializer for cashbook balances"""
    cashbook_name = serializers.CharField(source='cashbook.name', read_only=True)

    class Meta:
        model = CashbookBalance
        fields = [
            'id', 'cashbook', 'cashbook_name', 'date',
            'opening_balance', 'closing_balance',
            'total_income', 'total_expense'
        ]
        read_only_fields = ['opening_balance', 'closing_balance', 'total_income', 'total_expense']


class TransactionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing transactions"""
    cashbook_name = serializers.CharField(source='cashbook.name', read_only=True)
    store_name = serializers.CharField(source='cashbook.store.name', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)
    type_nature = serializers.CharField(source='type.nature', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    created_by_id = serializers.IntegerField(source='created_by.id', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'cashbook', 'cashbook_name', 'store_name',
            'amount', 'type', 'type_name', 'type_nature',
            'category', 'category_name', 'description',
            'transaction_date', 'status', 'reference_number',
            'created_by_username', 'created_by_id', 'created_at'
        ]


class TransactionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for transaction retrieval"""
    cashbook_name = serializers.CharField(source='cashbook.name', read_only=True)
    store_name = serializers.CharField(source='cashbook.store.name', read_only=True)
    store_id = serializers.IntegerField(source='cashbook.store.id', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)
    type_nature = serializers.CharField(source='type.nature', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    created_by_id = serializers.IntegerField(source='created_by.id', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    updated_by_id = serializers.IntegerField(source='updated_by.id', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'cashbook', 'cashbook_name', 'store_name', 'store_id',
            'amount', 'type', 'type_name', 'type_nature',
            'category', 'category_name', 'description',
            'reference_number', 'transaction_date', 'value_date',
            'status', 'is_recurring', 'recurring_pattern', 'tags',
            'created_by', 'created_by_username', 'created_by_id',
            'updated_by', 'updated_by_username', 'updated_by_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['transaction_id', 'created_by', 'updated_by', 'created_at', 'updated_at']


class TransactionCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating transactions"""

    class Meta:
        model = Transaction
        fields = [
            'cashbook', 'amount', 'type', 'category',
            'description', 'reference_number',
            'transaction_date', 'value_date',
            'status', 'is_recurring', 'recurring_pattern', 'tags'
        ]

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate(self, data):
        """Cross-field validation"""
        # Validate value_date is not before transaction_date
        if data.get('value_date') and data.get('transaction_date'):
            if data['value_date'] < data['transaction_date']:
                raise serializers.ValidationError({
                    "value_date": "Value date cannot be before transaction date"
                })

        # Validate recurring pattern if is_recurring is True
        if data.get('is_recurring') and not data.get('recurring_pattern'):
            raise serializers.ValidationError({
                "recurring_pattern": "Recurring pattern is required when is_recurring is True"
            })

        # Validate cashbook access for the user
        user = self.context['request'].user
        cashbook = data.get('cashbook')
        if cashbook:
            from store.models import StoreUser
            has_access = StoreUser.objects.filter(
                user=user,
                store=cashbook.store
            ).exists()
            if not has_access:
                raise serializers.ValidationError({
                    "cashbook": "You don't have access to this cashbook's store"
                })

        return data

    def create(self, validated_data):
        """Create transaction and update cashbook balance"""
        user = self.context['request'].user
        
        with db_transaction.atomic():
            # Create the transaction
            transaction = Transaction.objects.create(
                created_by=user,
                **validated_data
            )
            
            # Update cashbook balance
            self._update_cashbook_balance(transaction)
            
        return transaction

    def update(self, instance, validated_data):
        """Update transaction and recalculate cashbook balance"""
        user = self.context['request'].user
        
        with db_transaction.atomic():
            # Store old values for balance adjustment
            old_amount = instance.amount
            old_type_nature = instance.type.nature
            old_cashbook = instance.cashbook
            
            # Update the transaction
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.updated_by = user
            instance.save()
            
            # Reverse old balance effect
            self._reverse_cashbook_balance(old_cashbook, old_amount, old_type_nature)
            
            # Apply new balance effect
            self._update_cashbook_balance(instance)
            
        return instance

    def _update_cashbook_balance(self, transaction):
        """Update cashbook balance based on transaction"""
        cashbook = transaction.cashbook
        amount = transaction.amount
        nature = transaction.type.nature
        
        if nature == 'income':
            cashbook.current_balance += amount
        elif nature == 'expense':
            cashbook.current_balance -= amount
        
        cashbook.save(update_fields=['current_balance', 'updated_at'])

    def _reverse_cashbook_balance(self, cashbook, amount, nature):
        """Reverse the effect of a transaction on cashbook balance"""
        if nature == 'income':
            cashbook.current_balance -= amount
        elif nature == 'expense':
            cashbook.current_balance += amount
        
        cashbook.save(update_fields=['current_balance', 'updated_at'])


class TransactionBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating transactions"""
    transactions = TransactionCreateUpdateSerializer(many=True)

    def create(self, validated_data):
        """Create multiple transactions at once"""
        user = self.context['request'].user
        transactions_data = validated_data['transactions']
        
        with db_transaction.atomic():
            created_transactions = []
            for transaction_data in transactions_data:
                transaction = Transaction.objects.create(
                    created_by=user,
                    **transaction_data
                )
                created_transactions.append(transaction)
                
                # Update cashbook balance
                cashbook = transaction.cashbook
                amount = transaction.amount
                nature = transaction.type.nature
                
                if nature == 'income':
                    cashbook.current_balance += amount
                elif nature == 'expense':
                    cashbook.current_balance -= amount
                
                cashbook.save(update_fields=['current_balance', 'updated_at'])
        
        return created_transactions


class TransactionSummarySerializer(serializers.Serializer):
    """Serializer for transaction summary statistics"""
    total_transactions = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_transaction = serializers.DecimalField(max_digits=15, decimal_places=2)
    period_start = serializers.DateField(allow_null=True)
    period_end = serializers.DateField(allow_null=True)