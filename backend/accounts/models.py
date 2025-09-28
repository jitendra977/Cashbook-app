from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
import uuid

def user_profile_image_path(instance, filename):
    return f'profile_images/user_{instance.id}/{filename}'

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to=user_profile_image_path, blank=True, null=True)
    
    # ================================== email verification system ==================================
    is_verified = models.BooleanField(default=False)
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def send_verification_email(self):  
        """Send email verification link to user"""
        if not self.email:
            return False
            
        subject = 'Please verify your email address'
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{self.verification_token}/"
        
        # Using HTML email for better formatting
        message = f"""
        Hi {self.username},
        
        Please click the link below to verify your email address:
        {verification_url}
        
        If you didn't create this account, please ignore this email.
        
        Thanks,
        Your App Team
        """
        
        html_message = f"""
        <html>
            <body>
                <p>Hi {self.username},</p>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="{verification_url}">Verify Email Address</a></p>
                <p>If you didn't create this account, please ignore this email.</p>
                <br>
                <p>Thanks,<br>Your App Team</p>
            </body>
        </html>
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            # Log the error in production
            print(f"Failed to send verification email: {e}")
            return False
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