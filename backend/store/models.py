# backend/store/models.py (updated Cashbook class)
from django.db import models
from django.db.models import Sum, Q
from decimal import Decimal
from accounts.models import User


class Store(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    store_owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_stores"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class StoreUser(models.Model):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
    )
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="store_users")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_stores")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('store', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.role} @ {self.store.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.role == 'owner':
            self.store.store_owner = self.user
            self.store.save()


class Cashbook(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="cashbooks")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('store', 'name')

    def __str__(self):
        return f"{self.name} ({self.store.name})"

    def save(self, *args, **kwargs):
        """
        Override save to set current_balance to initial_balance on creation.
        """
        if not self.pk and self.current_balance == 0:
            self.current_balance = self.initial_balance
        super().save(*args, **kwargs)

    def calculate_balance(self):
        """
        Calculate the current balance based on initial balance and all completed transactions.
        This method doesn't save - it just returns the calculated balance.
        """
        from transactions.models import Transaction, TransactionType
        
        balance = self.initial_balance
        
        # Get all completed transactions
        transactions = self.transactions.filter(
            status=Transaction.STATUS_COMPLETED
        ).select_related('type').order_by('transaction_date', 'created_at')
        
        for trans in transactions:
            amount = Decimal(str(trans.amount))
            
            if trans.type.nature == TransactionType.INCOME:
                balance += amount
            elif trans.type.nature == TransactionType.EXPENSE:
                balance -= amount
            elif trans.type.nature == TransactionType.TRANSFER:
                balance -= amount
        
        return balance

    def recalculate_and_save_balance(self):
        """
        Recalculate balance and save the cashbook.
        Use this method when you want to force a balance update.
        """
        self.current_balance = self.calculate_balance()
        self.save()

    def get_balance_summary(self):
        """
        Get a detailed summary of the cashbook balance including totals.
        Returns a dictionary with balance information.
        """
        from transactions.models import Transaction, TransactionType
        
        completed_transactions = self.transactions.filter(
            status=Transaction.STATUS_COMPLETED
        ).select_related('type')
        
        # Calculate totals by transaction type
        income_total = Decimal('0.00')
        expense_total = Decimal('0.00')
        transfer_total = Decimal('0.00')
        
        for trans in completed_transactions:
            amount = Decimal(str(trans.amount))
            if trans.type.nature == TransactionType.INCOME:
                income_total += amount
            elif trans.type.nature == TransactionType.EXPENSE:
                expense_total += amount
            elif trans.type.nature == TransactionType.TRANSFER:
                transfer_total += amount
        
        return {
            'initial_balance': self.initial_balance,
            'current_balance': self.current_balance,
            'calculated_balance': self.calculate_balance(),
            'total_income': income_total,
            'total_expense': expense_total,
            'total_transfer': transfer_total,
            'net_change': income_total - expense_total - transfer_total,
            'transaction_count': completed_transactions.count(),
            'pending_count': self.transactions.filter(
                status=Transaction.STATUS_PENDING
            ).count()
        }

    @property
    def transaction_count(self):
        """
        Property to get the count of completed transactions.
        """
        from transactions.models import Transaction
        return self.transactions.filter(
            status=Transaction.STATUS_COMPLETED
        ).count()

    @property
    def balance_is_accurate(self):
        """
        Check if the stored current_balance matches the calculated balance.
        Useful for detecting data inconsistencies.
        """
        calculated = self.calculate_balance()
        return abs(self.current_balance - calculated) < Decimal('0.01')  # Allow 1 cent difference for rounding