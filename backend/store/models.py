from django.db import models
from accounts.models import User

class Store(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)  # ✅ Added
    contact_number = models.CharField(max_length=20, blank=True, null=True)  # ✅ Added
    is_active = models.BooleanField(default=True)  # ✅ Added
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


class Cashbook(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="cashbooks")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # ✅ Added
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # ✅ Added
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # ✅ Added
    is_active = models.BooleanField(default=True)  # ✅ Added
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('store', 'name')

    def __str__(self):
        return f"{self.name} ({self.store.name})"