from functools import wraps
from django.contrib.auth import authenticate
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer
)


class PermissionDeniedException(Exception):
    """Custom exception for permission denied scenarios."""
    pass


def user_permission_required(action_type=None):
    """
    Custom decorator for role-based user permissions.
    
    Permissions hierarchy:
    - Superuser: Full access to all actions
    - Staff: Can list, create, update but cannot delete users
    - Active User: Can only access own profile and change password
    """
    
    def decorator(func):
        @wraps(func)
        def wrapper(viewset, request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return Response(
                    {"detail": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Permission checks
            if user.is_superuser:
                return func(viewset, request, *args, **kwargs)
            
            if user.is_staff and user.is_active:
                if action_type == 'delete':
                    return Response(
                        {"detail": "Staff members cannot delete users"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                return func(viewset, request, *args, **kwargs)
            
            if user.is_active:
                allowed_actions = ['profile', 'update_self', 'change_password']
                if action_type in allowed_actions:
                    return func(viewset, request, *args, **kwargs)
            
            return Response(
                {"detail": "Insufficient permissions"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        return wrapper
    return decorator


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token obtain view with enhanced authentication."""
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    User management viewset with role-based permissions.
    
    Supports:
    - User registration (public)
    - Profile management (authenticated users)
    - Password change (authenticated users)
    - Admin user management (staff/superusers)
    """
    
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        serializer_map = {
            'register': RegisterSerializer,
            'update': UpdateUserSerializer,
            'partial_update': UpdateUserSerializer,
            'change_password': ChangePasswordSerializer,
            'profile': UpdateUserSerializer if self.request.method == 'PUT' else UserSerializer
        }
        return serializer_map.get(self.action, UserSerializer)

    @user_permission_required(action_type='list')
    def list(self, request, *args, **kwargs):
        """List users with permission-based filtering."""
        return super().list(request, *args, **kwargs)

    @user_permission_required(action_type='retrieve')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve user details."""
        return super().retrieve(request, *args, **kwargs)

    @action(
        detail=False, 
        methods=['post'], 
        permission_classes=[permissions.AllowAny]
    )
    def register(self, request):
        """
        Register a new user account.
        
        Required fields: username, email, password, password_confirm
        Optional fields: first_name, last_name, phone_number, profile_image
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        user_data = UserSerializer(user).data
        
        return Response(user_data, status=status.HTTP_201_CREATED)

    @user_permission_required(action_type='profile')
    @action(
        detail=False, 
        methods=['get', 'put'], 
        permission_classes=[permissions.IsAuthenticated]
    )
    def profile(self, request):
        """
        Get or update current user's profile.
        
        GET: Returns current user profile
        PUT: Updates current user profile
        """
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(UserSerializer(request.user).data)

    @user_permission_required(action_type='change_password')
    @action(
        detail=False, 
        methods=['post'], 
        permission_classes=[permissions.IsAuthenticated]
    )
    def change_password(self, request):
        """
        Change authenticated user's password.
        
        Required fields: old_password, new_password, confirm_password
        Validation: 
        - Old password must be correct
        - New passwords must match
        - New password minimum length: 8 characters
        """
        serializer = ChangePasswordSerializer(
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({
            'message': 'Password updated successfully',
            'detail': 'Please log in again with your new password.'
        }, status=status.HTTP_200_OK)

    @user_permission_required(action_type='delete')
    def destroy(self, request, *args, **kwargs):
        """Delete user account (superusers only)."""
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Set password when creating user via admin API."""
        user = serializer.save()
        if 'password' in self.request.data:
            user.set_password(self.request.data['password'])
            user.save()