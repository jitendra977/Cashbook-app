from django.db import models
from django.core.validators import MinValueValidator
from accounts.models import User
from store.models import Cashbook
import uuid

class TransactionType(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    TRANSFER = 'transfer'
    
    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
        (TRANSFER, 'Transfer'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    nature = models.CharField(max_length=10, choices=TYPE_CHOICES, default=EXPENSE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_nature_display()})"

class TransactionCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]
    
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cashbook = models.ForeignKey(Cashbook, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0.01)])
    type = models.ForeignKey(TransactionType, on_delete=models.PROTECT, related_name="transactions")
    category = models.ForeignKey(TransactionCategory, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    transaction_date = models.DateField()
    value_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_COMPLETED)
    is_recurring = models.BooleanField(default=False)
    recurring_pattern = models.CharField(max_length=50, blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="transactions_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions_updated")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-transaction_date', '-created_at']

    def __str__(self):
        return f"{self.transaction_id} - {self.type.name} - {self.amount}"

# Add the missing CashbookBalance model
class CashbookBalance(models.Model):
    cashbook = models.ForeignKey(Cashbook, on_delete=models.CASCADE, related_name="balances")
    date = models.DateField()
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = models.DecimalField(max_digits=15, decimal_places=2)
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expense = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ['cashbook', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.cashbook.name} - {self.date} - {self.closing_balance}"