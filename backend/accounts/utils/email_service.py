# accounts/utils/email_service.py
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class EmailTemplates:
    @staticmethod
    def get_verification_email_template(username, verification_url):
        # Your beautiful HTML email template here
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .button {{ background: #007bff; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <h2>Verify Your Email</h2>
            <p>Hello {username},</p>
            <p>Click the button below to verify your email address:</p>
            <a href="{verification_url}" class="button">Verify Email</a>
            <p>Or copy this link: {verification_url}</p>
        </body>
        </html>
        """

class AdvancedEmailService:
    @staticmethod
    def send_verification_email(user, verification_url):
        """Send beautiful verification email"""
        try:
            subject = "Verify Your Email Address"
            
            html_content = EmailTemplates.get_verification_email_template(
                username=user.username,
                verification_url=verification_url
            )
            
            text_content = f"""
            Hello {user.username},
            
            Please verify your email address by clicking the link below:
            {verification_url}
            
            If you didn't create this account, please ignore this email.
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            
            email.attach_alternative(html_content, "text/html")
            result = email.send()
            
            logger.info(f"Verification email sent to {user.email}")
            return result > 0
            
        except Exception as e:
            logger.error(f"Failed to send verification email: {str(e)}")
            return False