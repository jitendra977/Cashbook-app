# utils/email_templates.py
import os
from django.conf import settings

class EmailTemplates:
    @staticmethod
    def get_verification_email_template(username, verification_url, support_email=None):
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        /* Reset and base styles */
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }}
        
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }}
        
        .email-header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        
        .logo {{
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            display: inline-block;
        }}
        
        .email-title {{
            font-size: 28px;
            font-weight: 300;
            margin-bottom: 10px;
            opacity: 0.9;
        }}
        
        .email-subtitle {{
            font-size: 16px;
            opacity: 0.8;
            font-weight: 300;
        }}
        
        .email-body {{
            padding: 40px 30px;
        }}
        
        .greeting {{
            font-size: 18px;
            margin-bottom: 25px;
            color: #555;
        }}
        
        .verification-section {{
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #e9ecef;
        }}
        
        .verification-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }}
        
        .verification-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }}
        
        .verification-link {{
            word-break: break-all;
            background: #f1f3f4;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
        }}
        
        .steps {{
            margin: 30px 0;
        }}
        
        .step {{
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }}
        
        .step-number {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }}
        
        .security-note {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }}
        
        .security-icon {{
            font-size: 24px;
            margin-bottom: 10px;
        }}
        
        .email-footer {{
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        
        .social-links {{
            margin: 20px 0;
        }}
        
        .social-link {{
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }}
        
        .support-info {{
            color: #666;
            font-size: 14px;
            margin-top: 20px;
        }}
        
        @media (max-width: 600px) {{
            .email-container {{
                border-radius: 10px;
                margin: 10px;
            }}
            
            .email-header {{
                padding: 30px 20px;
            }}
            
            .email-body {{
                padding: 30px 20px;
            }}
            
            .verification-button {{
                padding: 14px 30px;
                font-size: 14px;
            }}
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">🚀 YourApp</div>
            <h1 class="email-title">Verify Your Email</h1>
            <p class="email-subtitle">One last step to activate your account</p>
        </div>
        
        <!-- Body -->
        <div class="email-body">
            <p class="greeting">Hello <strong>{username}</strong>,</p>
            <p>Thank you for joining YourApp! To complete your registration and unlock all features, please verify your email address.</p>
            
            <div class="verification-section">
                <h3 style="margin-bottom: 20px; color: #333;">Click below to verify your email</h3>
                <a href="{verification_url}" class="verification-button">
                    Verify Email Address
                </a>
                <p style="color: #666; margin: 15px 0; font-size: 14px;">
                    This link will expire in 24 hours for security reasons.
                </p>
            </div>
            
            <div class="security-note">
                <div class="security-icon">🔒</div>
                <p><strong>Security Tip:</strong> Never share this email or verification link with anyone. Our team will never ask for your password.</p>
            </div>
            
            <div class="steps">
                <h4 style="margin-bottom: 20px; color: #333;">What happens next?</h4>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Verify Your Email</strong>
                        <p style="color: #666; margin-top: 5px;">Click the button above to confirm your email address</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Access Your Account</strong>
                        <p style="color: #666; margin-top: 5px;">Login and explore all features immediately</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div>
                        <strong>Get Started</strong>
                        <p style="color: #666; margin-top: 5px;">Begin your journey with our platform</p>
                    </div>
                </div>
            </div>
            
            <p style="color: #666; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <div class="verification-link">
                {verification_url}
            </div>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Twitter</a>
                <a href="#" class="social-link">LinkedIn</a>
                <a href="#" class="social-link">Support</a>
            </div>
            <p style="color: #999; font-size: 12px; margin: 10px 0;">
                This email was sent to you because you registered for a YourApp account.
            </p>
            <div class="support-info">
                Need help? Contact our support team at {support_email or 'support@yourapp.com'}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                © 2024 YourApp. All rights reserved.<br>
                123 App Street, Tech City, TC 12345
            </p>
        </div>
    </div>
</body>
</html>
        """

    @staticmethod
    def get_welcome_email_template(username):
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to YourApp!</title>
    <style>
        /* Include the same CSS as above */
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }}
        .email-container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }}
        .email-header {{ background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 30px; text-align: center; color: white; }}
        /* ... include all other CSS styles ... */
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
            <div class="logo">🎉</div>
            <h1 class="email-title">Welcome to YourApp!</h1>
            <p class="email-subtitle">Your account is now fully activated</p>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello <strong>{username}</strong>,</p>
            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
            
            <div class="verification-section" style="background: #e8f5e8; border-color: #4CAF50;">
                <h3 style="margin-bottom: 20px; color: #2e7d32;">Ready to Get Started?</h3>
                <a href="{settings.FRONTEND_URL}/dashboard" class="verification-button" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
                    Go to Dashboard
                </a>
            </div>
            
            <div class="steps">
                <h4 style="margin-bottom: 20px; color: #333;">Explore These Features</h4>
                
                <div class="step">
                    <div class="step-number" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">1</div>
                    <div>
                        <strong>Complete Your Profile</strong>
                        <p style="color: #666; margin-top: 5px;">Add your information to personalize your experience</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">2</div>
                    <div>
                        <strong>Discover Features</strong>
                        <p style="color: #666; margin-top: 5px;">Explore all the tools we have to offer</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">3</div>
                    <div>
                        <strong>Get Support</strong>
                        <p style="color: #666; margin-top: 5px;">Our team is here to help you succeed</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="email-footer">
            <!-- Same footer as verification email -->
        </div>
    </div>
</body>
</html>
        """