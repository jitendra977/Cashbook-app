# serializers.py
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model (read operations)."""
    
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'address','first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'date_joined',
            'phone_number', 'profile_image', 'groups', 'user_permissions',
            'is_verified', 'created_at', 'updated_at' ,'last_login','verification_token'
        ]
        read_only_fields = [
            'id', 'is_staff', 'is_superuser', 'date_joined',
            'groups', 'user_permissions', 'is_verified', 'last_login', 'created_at', 'updated_at', 'verification_token',
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'address', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'profile_image'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True}
        }

    def validate(self, attrs):
        """Validate registration data."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match"
            })
        
        if User.objects.filter(email=attrs.get('email')).exists():
            raise serializers.ValidationError({
                "email": "A user with this email already exists."
            })
            
        return attrs
    
    def create(self, validated_data):
        """Create and return a new user instance."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Send verification email after user creation
        user.send_verification_email()
        return user


# Email verification serializer
class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.UUIDField()

    def validate_token(self, value):
        try:
            user = User.objects.get(verification_token=value)
            if user.is_verified:
                raise serializers.ValidationError("Email is already verified")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired verification token")


class UpdateUserSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile (including optional password change)."""
    
    password = serializers.CharField(
        write_only=True, 
        required=False,
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=False,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'address', 'first_name', 'last_name',
            'phone_number', 'profile_image', 'password', 'password_confirm'
        ]

    def validate(self, attrs):
        """Validate update data including optional password change."""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({
                    "password": "Passwords do not match"
                })
        
        return attrs

    def update(self, instance, validated_data):
        """Update user instance."""
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change functionality."""
    
    old_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True, 
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, data):
        """Validate password change data."""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")
        return data

    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Enhanced JWT token serializer supporting email/username login.
    """
    
    
    def validate(self, attrs):
        """Authenticate user via username or email."""
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        # Try username authentication first
        user = authenticate(
            request=self.context.get("request"),
            username=username_or_email,
            password=password
        )

        # Fallback to email authentication
        if not user:
            try:
                user_by_email = User.objects.get(email=username_or_email)
                user = authenticate(
                    request=self.context.get("request"),
                    username=user_by_email.username,
                    password=password
                )
            except User.DoesNotExist:
                user = None

        if not user:
            raise serializers.ValidationError({
                "detail": "Invalid credentials provided"
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "Account is disabled"
            })

        # # Check if email is verified (optional - you can make this required)
        # if not user.is_verified:
        #     raise serializers.ValidationError({
        #         "detail": "Please verify your email address before logging in"
        #     })

        # Update the custom last_login field
        user.last_login = timezone.now()
        user.save(update_fields=['last_login', 'updated_at'])
        
        # Generate tokens
        refresh = self.get_token(user)
        
        user_data = UserSerializer(user).data
        
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user_data,
        }