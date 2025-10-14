from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
import uuid
import os
from django.core.exceptions import ValidationError

try:
    from .utils.email_service import AdvancedEmailService
except ImportError:
    # Fallback if import fails
    class AdvancedEmailService:
        @staticmethod
        def send_verification_email(user, verification_url):
            # Fallback to basic email
            try:
                subject = 'Verify Your Email Address'
                message = f"""
                Hi {user.username},
                
                Please verify your email address by clicking the link below:
                {verification_url}
                
                Thanks,
                Your App Team
                """
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                return True
            except Exception:
                return False

        @staticmethod
        def send_welcome_email(user):
            try:
                subject = 'Welcome to Our Platform!'
                message = f"""
                Hi {user.username},
                
                Welcome to our platform! Your email has been successfully verified.
                
                Thanks,
                Your App Team
                """
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                return True
            except Exception:
                return False

def user_profile_image_path(instance, filename):
    """Generate path for user profile images"""
    ext = filename.split('.')[-1]
    filename = f'profile_{instance.id}_{uuid.uuid4().hex[:8]}.{ext}'
    return f'users/{instance.id}/profile/{filename}'

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=100, blank=True, null=True)
    profile_image = models.ImageField(
        upload_to=user_profile_image_path, 
        blank=True, 
        null=True,
        help_text="Upload a profile picture (square images work best)"
    )
    
    # ================================== email verification system ==================================
    is_verified = models.BooleanField(default=False)
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True, verbose_name="Last Frontend Login")
    
    def clean(self):
        """Validate the model"""
        super().clean()
        
        # Validate profile image size
        if self.profile_image:
            if self.profile_image.size > 5 * 1024 * 1024:  # 5MB limit
                raise ValidationError({'profile_image': 'Image file too large ( > 5MB )'})
    
    def save(self, *args, **kwargs):
        # Delete old profile image when new one is uploaded
        if self.pk:
            try:
                old_instance = User.objects.get(pk=self.pk)
                if old_instance.profile_image and old_instance.profile_image != self.profile_image:
                    if os.path.isfile(old_instance.profile_image.path):
                        os.remove(old_instance.profile_image.path)
            except User.DoesNotExist:
                pass
        super().save(*args, **kwargs)
    
    def get_profile_image_url(self):
        """Get profile image URL or return default"""
        if self.profile_image and hasattr(self.profile_image, 'url'):
            return self.profile_image.url
        return f"https://ui-avatars.com/api/?name={self.username}&background=random&color=fff&size=150"
        
    def update_last_login(self):
        """Update the custom last_login field for frontend logins"""
        from django.utils import timezone
        self.last_login = timezone.now()
        self.save(update_fields=['last_login', 'updated_at'])
        return self.last_login
        
    def send_verification_email(self):  
        """Send beautiful verification email to user"""
        if not self.email:
            return False
            
        # Generate verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{self.verification_token}/"
        
        # Use advanced email service
        return AdvancedEmailService.send_verification_email(self, verification_url)
    
    def send_welcome_email(self):
        """Send welcome email after verification"""
        return AdvancedEmailService.send_welcome_email(self)
    # =================================================================
    
    # Override default reverse relations to avoid clash
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        return self.email

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'