from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from functools import wraps
from rest_framework.response import Response
from rest_framework import status


from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UpdateUserSerializer,
    CustomTokenObtainPairSerializer
)

def user_permission_required(action_type=None):
    """
    Custom decorator for user permissions:
    - superuser: full access
    - staff & active: add/update/list only
    - normal active user: only access own profile
    """

    def decorator(func):
        @wraps(func)
        def wrapper(viewset, request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

            # Superuser: full access
            if user.is_superuser:
                return func(viewset, request, *args, **kwargs)

            # Staff: cannot delete
            if user.is_staff and user.is_active:
                if action_type == 'delete':
                    return Response({"detail": "Staff cannot delete users"}, status=status.HTTP_403_FORBIDDEN)
                return func(viewset, request, *args, **kwargs)

            # Normal user: can only access own profile
            if user.is_active:
                if action_type in ['profile', 'update_self']:
                    return func(viewset, request, *args, **kwargs)
                return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        return wrapper
    return decorator

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework import serializers


from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UpdateUserSerializer,
    CustomTokenObtainPairSerializer
)

# Add this serializer for change password
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

def user_permission_required(action_type=None):
    """
    Custom decorator for user permissions:
    - superuser: full access
    - staff & active: add/update/list only
    - normal active user: only access own profile
    """

    def decorator(func):
        @wraps(func)
        def wrapper(viewset, request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

            # Superuser: full access
            if user.is_superuser:
                return func(viewset, request, *args, **kwargs)

            # Staff: cannot delete
            if user.is_staff and user.is_active:
                if action_type == 'delete':
                    return Response({"detail": "Staff cannot delete users"}, status=status.HTTP_403_FORBIDDEN)
                return func(viewset, request, *args, **kwargs)

            # Normal user: can only access own profile
            if user.is_active:
                if action_type in ['profile', 'update_self', 'change_password']:
                    return func(viewset, request, *args, **kwargs)
                return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        return wrapper
    return decorator

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateUserSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        return UserSerializer

    @user_permission_required(action_type='list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @user_permission_required(action_type='profile')
    @action(detail=False, methods=['get', 'put'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)

        serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    @user_permission_required(action_type='change_password')
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """
        Change user password endpoint.
        Only authenticated users can change their own password.
        """
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Set new password
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password changed successfully',
                'detail': 'Your password has been updated. Please log in again with your new password.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @user_permission_required(action_type='delete')
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

