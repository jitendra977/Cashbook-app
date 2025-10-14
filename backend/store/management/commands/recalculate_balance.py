# backend/store/management/commands/recalculate_balances.py
from django.core.management.base import BaseCommand
from django.db import transaction
from store.models import Cashbook
from decimal import Decimal


class Command(BaseCommand):
    help = 'Recalculate current_balance for all cashbooks based on transactions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--cashbook-id',
            type=int,
            help='Recalculate balance for a specific cashbook ID',
        )
        parser.add_argument(
            '--store-id',
            type=int,
            help='Recalculate balances for all cashbooks in a specific store',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without actually updating',
        )
        parser.add_argument(
            '--check-only',
            action='store_true',
            help='Only check for inconsistencies without updating',
        )

    def handle(self, *args, **options):
        cashbook_id = options.get('cashbook_id')
        store_id = options.get('store_id')
        dry_run = options.get('dry_run')
        check_only = options.get('check_only')

        # Get cashbooks to process
        if cashbook_id:
            cashbooks = Cashbook.objects.filter(id=cashbook_id)
            if not cashbooks.exists():
                self.stdout.write(self.style.ERROR(f'Cashbook with ID {cashbook_id} not found'))
                return
        elif store_id:
            cashbooks = Cashbook.objects.filter(store_id=store_id)
            if not cashbooks.exists():
                self.stdout.write(self.style.ERROR(f'No cashbooks found for store ID {store_id}'))
                return
        else:
            cashbooks = Cashbook.objects.all()

        total_count = cashbooks.count()
        updated_count = 0
        inconsistent_count = 0
        errors = []

        self.stdout.write(f'Processing {total_count} cashbook(s)...\n')

        for cashbook in cashbooks:
            try:
                with transaction.atomic():
                    old_balance = cashbook.current_balance
                    calculated_balance = cashbook.calculate_balance()
                    difference = abs(old_balance - calculated_balance)

                    # Check if there's a significant difference (more than 1 cent)
                    if difference >= Decimal('0.01'):
                        inconsistent_count += 1
                        
                        self.stdout.write(
                            self.style.WARNING(
                                f'\n[{cashbook.id}] {cashbook.name} ({cashbook.store.name})'
                            )
                        )
                        self.stdout.write(f'  Current Balance: ${old_balance}')
                        self.stdout.write(f'  Calculated Balance: ${calculated_balance}')
                        self.stdout.write(
                            self.style.ERROR(f'  Difference: ${difference}')
                        )

                        # Show transaction summary
                        summary = cashbook.get_balance_summary()
                        self.stdout.write(f'  Initial Balance: ${summary["initial_balance"]}')
                        self.stdout.write(f'  Total Income: ${summary["total_income"]}')
                        self.stdout.write(f'  Total Expense: ${summary["total_expense"]}')
                        self.stdout.write(f'  Total Transfer: ${summary["total_transfer"]}')
                        self.stdout.write(f'  Transaction Count: {summary["transaction_count"]}')

                        if not check_only and not dry_run:
                            cashbook.current_balance = calculated_balance
                            cashbook.save()
                            updated_count += 1
                            self.stdout.write(
                                self.style.SUCCESS('  ✓ Updated')
                            )
                        elif dry_run:
                            self.stdout.write('  → Would update (dry-run mode)')
                        elif check_only:
                            self.stdout.write('  → Inconsistency detected (check-only mode)')
                    else:
                        # Balance is accurate
                        if options.get('verbosity', 1) >= 2:
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'[{cashbook.id}] {cashbook.name} - Balance OK (${old_balance})'
                                )
                            )

            except Exception as e:
                errors.append((cashbook.id, cashbook.name, str(e)))
                self.stdout.write(
                    self.style.ERROR(
                        f'\n[{cashbook.id}] {cashbook.name} - ERROR: {str(e)}'
                    )
                )

        # Summary
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Total Cashbooks Processed: {total_count}')
        self.stdout.write(f'  Inconsistencies Found: {inconsistent_count}')
        
        if not check_only and not dry_run:
            self.stdout.write(self.style.SUCCESS(f'  Balances Updated: {updated_count}'))
        elif dry_run:
            self.stdout.write(self.style.WARNING(f'  Would Update: {inconsistent_count} (dry-run mode)'))
        elif check_only:
            self.stdout.write(self.style.WARNING(f'  Need Update: {inconsistent_count} (check-only mode)'))

        if errors:
            self.stdout.write(self.style.ERROR(f'\n  Errors: {len(errors)}'))
            for cashbook_id, name, error in errors:
                self.stdout.write(f'    - [{cashbook_id}] {name}: {error}')

        self.stdout.write('=' * 60 + '\n')

        if check_only and inconsistent_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    '\nTo fix these inconsistencies, run without --check-only flag'
                )
            )