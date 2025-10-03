import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
from accounts.models import User
from store.models import Store, Cashbook
from transactions.models import TransactionType, TransactionCategory, Transaction, CashbookBalance

User = get_user_model()

class Command(BaseCommand):
    help = 'Create 50 sample transactions with related data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing transaction data before creating samples',
        )

    def handle(self, *args, **options):
        self.stdout.write('Starting to create sample transactions...')
        
        with transaction.atomic():
            if options['clear']:
                self.clear_existing_data()

            self.create_transaction_types()
            self.create_transaction_categories()
            self.create_sample_transactions()

    def clear_existing_data(self):
        """Clear existing transaction data"""
        self.stdout.write('Clearing existing transaction data...')
        Transaction.objects.all().delete()
        CashbookBalance.objects.all().delete()
        # Note: Not deleting types and categories as they might be referenced elsewhere
        self.stdout.write(
            self.style.SUCCESS('Successfully cleared existing transactions and balances')
        )

    def create_transaction_types(self):
        """Create transaction types if they don't exist"""
        transaction_types = [
            # Income types
            {'name': 'Cash Sale', 'nature': TransactionType.INCOME},
            {'name': 'Credit Card Sale', 'nature': TransactionType.INCOME},
            {'name': 'Bank Transfer Income', 'nature': TransactionType.INCOME},
            {'name': 'Online Payment', 'nature': TransactionType.INCOME},
            {'name': 'Investment Return', 'nature': TransactionType.INCOME},
            
            # Expense types
            {'name': 'Supplier Payment', 'nature': TransactionType.EXPENSE},
            {'name': 'Salary Payment', 'nature': TransactionType.EXPENSE},
            {'name': 'Rent Expense', 'nature': TransactionType.EXPENSE},
            {'name': 'Utility Bill', 'nature': TransactionType.EXPENSE},
            {'name': 'Office Supplies', 'nature': TransactionType.EXPENSE},
            {'name': 'Marketing Expense', 'nature': TransactionType.EXPENSE},
            
            # Transfer types
            {'name': 'Bank Transfer', 'nature': TransactionType.TRANSFER},
            {'name': 'Cash Transfer', 'nature': TransactionType.TRANSFER},
        ]

        created_count = 0
        for type_data in transaction_types:
            obj, created = TransactionType.objects.get_or_create(
                name=type_data['name'],
                defaults={'nature': type_data['nature']}
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} transaction types')
        )

    def create_transaction_categories(self):
        """Create transaction categories if they don't exist"""
        categories = [
            'Sales Revenue',
            'Service Income',
            'Investment Income',
            'Other Income',
            'Cost of Goods Sold',
            'Employee Expenses',
            'Office Expenses',
            'Marketing & Advertising',
            'Utilities',
            'Rent & Lease',
            'Other Expenses'
        ]

        created_count = 0
        for category_name in categories:
            obj, created = TransactionCategory.objects.get_or_create(name=category_name)
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} transaction categories')
        )

    def create_sample_transactions(self):
        """Create 50 sample transactions"""
        # Get or create admin user
        try:
            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                admin_user = User.objects.first()
            if not admin_user:
                # Create a default user if none exists
                admin_user = User.objects.create_user(
                    username='admin',
                    email='admin@example.com',
                    password='admin123',
                    is_staff=True
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error getting user: {e}')
            )
            return

        # Get or create store and cashbook
        store, store_created = Store.objects.get_or_create(
            name="Main Store",
            defaults={
                'address': '123 Main Street, City, State',
                'contact_number': '+1234567890',
                'is_active': True
            }
        )

        cashbook, cashbook_created = Cashbook.objects.get_or_create(
            name="Main Cashbook",
            store=store,
            defaults={
                'description': 'Primary cashbook for main store operations',
                'initial_balance': 10000.00,
                'current_balance': 10000.00,
                'is_active': True
            }
        )

        # Get transaction types and categories
        income_types = TransactionType.objects.filter(nature=TransactionType.INCOME)
        expense_types = TransactionType.objects.filter(nature=TransactionType.EXPENSE)
        transfer_types = TransactionType.objects.filter(nature=TransactionType.TRANSFER)
        categories = TransactionCategory.objects.all()

        if not income_types.exists() or not expense_types.exists():
            self.stdout.write(
                self.style.ERROR('Transaction types not found. Please run migrations first.')
            )
            return

        # Create transactions
        transactions_to_create = []
        
        # Income transactions (20 records)
        income_descriptions = [
            "Daily sales revenue", "Online store payment", "Customer payment received",
            "Wholesale order payment", "Service fee collection", "Monthly subscription",
            "Project milestone payment", "Consulting services", "Retail product sales",
            "Bulk order payment", "Recurring payment", "Advance payment",
            "Commission income", "Royalty payment", "Interest income",
            "Dividend received", "Grant funding", "Sponsorship",
            "Membership fees", "Late payment collection"
        ]

        for i in range(20):
            transaction_date = timezone.now().date() - timedelta(days=random.randint(0, 90))
            amount = round(random.uniform(100.00, 5000.00), 2)
            
            transactions_to_create.append(Transaction(
                cashbook=cashbook,
                amount=amount,
                type=random.choice(income_types),
                category=random.choice(categories.filter(name__icontains='income') or categories),
                description=income_descriptions[i],
                transaction_date=transaction_date,
                reference_number=f'INV-{1000 + i}',
                status=Transaction.STATUS_COMPLETED,
                created_by=admin_user,
            ))

        # Expense transactions (25 records)
        expense_descriptions = [
            "Supplier payment", "Monthly staff salaries", "Office rent payment",
            "Electricity bill", "Internet service fee", "Water bill payment",
            "Office supplies", "Marketing campaign", "Digital advertising",
            "Employee travel", "Vehicle maintenance", "Software subscription",
            "Professional services", "Insurance premium", "Tax payment",
            "Bank charges", "Equipment purchase", "Training course",
            "Team building", "Client entertainment", "Printing services",
            "Cleaning services", "Security services", "Legal fees",
            "Accounting services"
        ]

        for i in range(25):
            transaction_date = timezone.now().date() - timedelta(days=random.randint(0, 90))
            amount = round(random.uniform(50.00, 2000.00), 2)
            
            transactions_to_create.append(Transaction(
                cashbook=cashbook,
                amount=amount,
                type=random.choice(expense_types),
                category=random.choice(categories.exclude(name__icontains='income') or categories),
                description=expense_descriptions[i],
                transaction_date=transaction_date,
                reference_number=f'EXP-{2000 + i}',
                status=Transaction.STATUS_COMPLETED,
                created_by=admin_user,
            ))

        # Transfer transactions (5 records)
        transfer_descriptions = [
            "Transfer to savings account", "Inter-branch fund transfer",
            "Cash deposit to bank", "Fund allocation to project",
            "Reserve fund transfer"
        ]

        for i in range(5):
            transaction_date = timezone.now().date() - timedelta(days=random.randint(0, 90))
            amount = round(random.uniform(500.00, 3000.00), 2)
            
            transactions_to_create.append(Transaction(
                cashbook=cashbook,
                amount=amount,
                type=random.choice(transfer_types),
                category=random.choice(categories),
                description=transfer_descriptions[i],
                transaction_date=transaction_date,
                reference_number=f'TRF-{3000 + i}',
                status=Transaction.STATUS_COMPLETED,
                created_by=admin_user,
            ))

        # Bulk create all transactions
        Transaction.objects.bulk_create(transactions_to_create)
        
        # Update cashbook balance and create balance records
        self.update_cashbook_data(cashbook)

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(transactions_to_create)} sample transactions')
        )

    def update_cashbook_data(self, cashbook):
        """Update cashbook balance and create balance records"""
        try:
            transactions = Transaction.objects.filter(cashbook=cashbook)
            
            # Calculate totals
            total_income = transactions.filter(
                type__nature=TransactionType.INCOME,
                status=Transaction.STATUS_COMPLETED
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            total_expense = transactions.filter(
                type__nature=TransactionType.EXPENSE,
                status=Transaction.STATUS_COMPLETED
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Update cashbook current balance
            new_balance = cashbook.initial_balance + total_income - total_expense
            cashbook.current_balance = new_balance
            cashbook.save()

            # Create sample balance records for the last 30 days
            for i in range(30):
                date = timezone.now().date() - timedelta(days=i)
                CashbookBalance.objects.get_or_create(
                    cashbook=cashbook,
                    date=date,
                    defaults={
                        'opening_balance': new_balance - i * 100,
                        'closing_balance': new_balance - (i * 100) + random.uniform(-500, 500),
                        'total_income': total_income / 30,
                        'total_expense': total_expense / 30,
                    }
                )

            self.stdout.write(
                self.style.SUCCESS(f'Updated cashbook balance: ${cashbook.current_balance:,.2f}')
            )
            self.stdout.write(
                self.style.SUCCESS('Created 30 days of balance records')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating cashbook data: {e}')
            )