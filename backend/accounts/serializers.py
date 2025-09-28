from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name','is_active', 'is_staff', 'is_superuser',
            'phone_number', 'profile_image', 'groups', 'user_permissions'
        ]
        read_only_fields = ['id', 'groups', 'user_permissions']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'profile_image'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    """
    Allows updating user fields, including password (optional).
    """
    password = serializers.CharField(write_only=True, required=False)
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone_number', 'profile_image', 'password', 'password_confirm'
        ]

    def validate(self, attrs):
        if 'password' in attrs or 'password_confirm' in attrs:
            if attrs.get('password') != attrs.get('password_confirm'):
                raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
# serializer for change password
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords don't match")
        return data
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allows login via email or username + password
    """
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=username_or_email,
            password=password
        )

        # try email
        if not user:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(
                    request=self.context.get("request"),
                    username=user_obj.username,
                    password=password
                )
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError({"detail": "Invalid credentials"})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "User is disabled"})

        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }