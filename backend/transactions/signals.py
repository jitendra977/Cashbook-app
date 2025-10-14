# backend/transactions/signals.py
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.db import transaction as db_transaction
from decimal import Decimal
from .models import Transaction, TransactionType
from store.models import Cashbook


@receiver(post_save, sender=Transaction)
def update_cashbook_balance_on_create_or_update(sender, instance, created, **kwargs):
    """
    Update cashbook balance when a transaction is created or updated.
    Only process completed transactions.
    """
    if instance.status == Transaction.STATUS_COMPLETED:
        # Use atomic transaction to prevent race conditions
        with db_transaction.atomic():
            cashbook = Cashbook.objects.select_for_update().get(id=instance.cashbook.id)
            
            if created:
                # New transaction - simply add/subtract from balance
                _apply_transaction_to_balance(cashbook, instance, is_new=True)
            else:
                # Transaction updated - need to recalculate entire balance
                _recalculate_cashbook_balance(cashbook)
            
            cashbook.save()


@receiver(post_delete, sender=Transaction)
def update_cashbook_balance_on_delete(sender, instance, **kwargs):
    """
    Update cashbook balance when a transaction is deleted.
    Only process if the deleted transaction was completed.
    """
    if instance.status == Transaction.STATUS_COMPLETED:
        with db_transaction.atomic():
            cashbook = Cashbook.objects.select_for_update().get(id=instance.cashbook.id)
            _recalculate_cashbook_balance(cashbook)
            cashbook.save()


@receiver(pre_save, sender=Transaction)
def handle_transaction_status_change(sender, instance, **kwargs):
    """
    Handle status changes (e.g., pending -> completed, completed -> cancelled).
    Store the old status to compare in post_save.
    """
    if instance.pk:
        try:
            old_instance = Transaction.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
            instance._old_amount = old_instance.amount
            instance._old_type = old_instance.type
        except Transaction.DoesNotExist:
            instance._old_status = None


def _apply_transaction_to_balance(cashbook, transaction, is_new=True):
    """
    Apply a single transaction to the cashbook balance.
    
    Args:
        cashbook: Cashbook instance
        transaction: Transaction instance
        is_new: Whether this is a new transaction or reverting an old one
    """
    amount = Decimal(str(transaction.amount))
    
    # Determine if this adds or subtracts from balance
    if transaction.type.nature == TransactionType.INCOME:
        cashbook.current_balance += amount
    elif transaction.type.nature == TransactionType.EXPENSE:
        cashbook.current_balance -= amount
    elif transaction.type.nature == TransactionType.TRANSFER:
        # Handle transfer logic if needed
        # For now, treat as expense (money leaving this cashbook)
        cashbook.current_balance -= amount


def _recalculate_cashbook_balance(cashbook):
    """
    Recalculate the entire cashbook balance from scratch.
    This is more accurate but slower - use when transactions are updated or deleted.
    
    Args:
        cashbook: Cashbook instance
    """
    # Start with initial balance
    balance = cashbook.initial_balance
    
    # Get all completed transactions for this cashbook
    transactions = Transaction.objects.filter(
        cashbook=cashbook,
        status=Transaction.STATUS_COMPLETED
    ).order_by('transaction_date', 'created_at')
    
    # Apply each transaction
    for trans in transactions:
        amount = Decimal(str(trans.amount))
        
        if trans.type.nature == TransactionType.INCOME:
            balance += amount
        elif trans.type.nature == TransactionType.EXPENSE:
            balance -= amount
        elif trans.type.nature == TransactionType.TRANSFER:
            balance -= amount
    
    cashbook.current_balance = balance


# Helper function to manually recalculate all cashbooks (useful for data fixes)
def recalculate_all_cashbook_balances():
    """
    Recalculate balances for all cashbooks.
    Use this as a management command or admin action.
    """
    from store.models import Cashbook
    
    cashbooks = Cashbook.objects.all()
    updated_count = 0
    
    for cashbook in cashbooks:
        with db_transaction.atomic():
            cashbook = Cashbook.objects.select_for_update().get(id=cashbook.id)
            old_balance = cashbook.current_balance
            _recalculate_cashbook_balance(cashbook)
            
            if old_balance != cashbook.current_balance:
                cashbook.save()
                updated_count += 1
                print(f"Updated {cashbook.name}: {old_balance} -> {cashbook.current_balance}")
    
    print(f"Recalculated {updated_count} cashbook balances")
    return updated_count