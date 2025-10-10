from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Store, StoreUser

@receiver(post_save, sender=Store)
def create_store_user(sender, instance, created, **kwargs):
    if created and instance.store_owner:
        # Prevent duplicate owners
        StoreUser.objects.get_or_create(
            store=instance,
            user=instance.store_owner,
            defaults={'role': 'owner'}
        )