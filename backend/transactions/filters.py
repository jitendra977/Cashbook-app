import django_filters
from django.db.models import Q
from .models import Transaction, TransactionType, TransactionCategory


class TransactionFilter(django_filters.FilterSet):
    """
    Advanced filter for transactions with multiple options
    """
    # Date range filters
    start_date = django_filters.DateFilter(field_name='transaction_date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='transaction_date', lookup_expr='lte')
    
    # Amount range filters
    min_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    
    # Store and cashbook filters
    store = django_filters.NumberFilter(field_name='cashbook__store_id')
    cashbook = django_filters.NumberFilter(field_name='cashbook_id')
    
    # Type filters
    type = django_filters.ModelChoiceFilter(queryset=TransactionType.objects.all())
    type_nature = django_filters.ChoiceFilter(
        field_name='type__nature',
        choices=TransactionType.TYPE_CHOICES
    )
    
    # Category filter
    category = django_filters.ModelChoiceFilter(
        queryset=TransactionCategory.objects.all(),
        null_label='No Category'
    )
    
    # Status filter
    status = django_filters.ChoiceFilter(choices=Transaction.STATUS_CHOICES)
    
    # Boolean filters
    is_recurring = django_filters.BooleanFilter()
    has_reference = django_filters.BooleanFilter(method='filter_has_reference')
    has_category = django_filters.BooleanFilter(method='filter_has_category')
    
    # Text search across multiple fields
    search = django_filters.CharFilter(method='filter_search')
    
    # Date filters
    year = django_filters.NumberFilter(field_name='transaction_date__year')
    month = django_filters.NumberFilter(field_name='transaction_date__month')
    
    # Created by filter
    created_by = django_filters.NumberFilter(field_name='created_by_id')
    
    class Meta:
        model = Transaction
        fields = [
            'cashbook', 'type', 'category', 'status',
            'transaction_date', 'is_recurring'
        ]
    
    def filter_has_reference(self, queryset, name, value):
        """Filter transactions that have or don't have a reference number"""
        if value:
            return queryset.exclude(Q(reference_number__isnull=True) | Q(reference_number=''))
        return queryset.filter(Q(reference_number__isnull=True) | Q(reference_number=''))
    
    def filter_has_category(self, queryset, name, value):
        """Filter transactions that have or don't have a category"""
        if value:
            return queryset.exclude(category__isnull=True)
        return queryset.filter(category__isnull=True)
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields"""
        return queryset.filter(
            Q(description__icontains=value) |
            Q(reference_number__icontains=value) |
            Q(cashbook__name__icontains=value) |
            Q(type__name__icontains=value) |
            Q(category__name__icontains=value)
        )


class TransactionTypeFilter(django_filters.FilterSet):
    """Filter for transaction types"""
    name = django_filters.CharFilter(lookup_expr='icontains')
    nature = django_filters.ChoiceFilter(choices=TransactionType.TYPE_CHOICES)
    is_active = django_filters.BooleanFilter()
    
    class Meta:
        model = TransactionType
        fields = ['name', 'nature', 'is_active']


class TransactionCategoryFilter(django_filters.FilterSet):
    """Filter for transaction categories"""
    name = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    
    class Meta:
        model = TransactionCategory
        fields = ['name', 'is_active']