from rest_framework import serializers
from .models import TransactionType, TransactionCategory, Transaction
from store.models import Cashbook

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = '__all__'

class TransactionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCategory
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    cashbook_name = serializers.CharField(source='cashbook.name', read_only=True)
    store_name = serializers.CharField(source='cashbook.store.name', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'

class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'