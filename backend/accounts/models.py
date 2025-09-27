from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

def user_profile_image_path(instance, filename):
    return f'profile_images/user_{instance.id}/{filename}'

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to=user_profile_image_path, blank=True, null=True)

    # Override default reverse relations to avoid clash
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',   # <--- change here
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',  # <--- change here
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)