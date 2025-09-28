# views.py
from functools import wraps
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
import uuid

from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    EmailVerificationSerializer
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
                allowed_actions = ['profile', 'update_self', 'change_password', 'resend_verification']
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

class UserViewSet(viewsets.ModelViewSet):
    """
    User management viewset with role-based permissions.
    
    Supports:
    - User registration (public)
    - Profile management (authenticated users)
    - Password change (authenticated users)
    - Admin user management (staff/superusers)
    - Email verification system
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
            'profile': UpdateUserSerializer if self.request.method == 'PUT' else UserSerializer,
            'verify_email': EmailVerificationSerializer,
            'resend_verification': serializers.Serializer,  # No data needed for resend
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
        
        return Response({
            'user': user_data,
            'message': 'Registration successful! Please check your email to verify your account.',
            'detail': 'Verification email sent successfully.'
        }, status=status.HTTP_201_CREATED)

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
            
    # ======================== Email Verification System ========================
    @action(detail=False, methods=['post', 'get'], permission_classes=[permissions.AllowAny])
    def verify_email(self, request):
        """Verify user's email address using verification token"""
        token = None
        
        print(f"=== EMAIL VERIFICATION DEBUG ===")
        print(f"Request method: {request.method}")
        print(f"Request data: {request.data}")
        print(f"Query params: {request.query_params}")
        
        # Handle GET request (token in URL)
        if request.method == 'GET':
            token = request.query_params.get('token')
            print(f"GET token from query params: {token}")
        
        # Handle POST request (token in body)
        elif request.method == 'POST':
            serializer = EmailVerificationSerializer(data=request.data)
            if serializer.is_valid():
                token = serializer.validated_data['token']
                print(f"POST token from body: {token}")
            else:
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Token to verify: {token}")
        
        if not token:
            return Response({
                'error': 'Verification token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Convert token to UUID if it's a string
            if isinstance(token, str):
                try:
                    token = uuid.UUID(token)
                except ValueError:
                    print(f"Invalid UUID format: {token}")
                    return Response({
                        'error': 'Invalid token format'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"Looking for user with token: {token}")
            
            user = User.objects.get(verification_token=token)
            print(f"User found: {user.username} (ID: {user.id})")
            print(f"User verification status before: {user.is_verified}")
            
            if user.is_verified:
                print("User already verified")
                return Response({
                    'message': 'Email already verified',
                    'detail': 'Your email address was already verified.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark user as verified
            user.is_verified = True
            user.save()
            print(f"User verification status after: {user.is_verified}")
            
            # Send welcome email
            try:
                user.send_welcome_email()
                print("Welcome email sent")
            except Exception as e:
                print(f"Welcome email failed: {e}")
            
            print("=== VERIFICATION SUCCESS ===")
            
            return Response({
                'message': 'Email verified successfully!',
                'detail': 'Your account has been activated. You can now log in.'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            print(f"=== VERIFICATION FAILED ===")
            print(f"No user found with token: {token}")
            
            # Debug: List all users and their tokens
            all_users = User.objects.all()
            print("All users and their tokens:")
            for u in all_users:
                print(f"  {u.username}: {u.verification_token} (verified: {u.is_verified})")
            
            return Response({
                'error': 'Invalid or expired verification token'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def resend_verification(self, request):  # NOTE: underscore, not hyphen
        """Resend verification email to authenticated user"""
        user = request.user
        
        if user.is_verified:
            return Response({
                'message': 'Email already verified',
                'detail': 'Your email address is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate new token and send email
        user.verification_token = uuid.uuid4()
        user.save()
        
        if user.send_verification_email():
            return Response({
                'message': 'Verification email sent',
                'detail': 'Please check your email for the verification link.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send verification email',
                'detail': 'Please try again later or contact support.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def available_actions(self, request):
        """Debug endpoint to see available actions"""
        actions = []
        for method, action_name in [
            ('POST', 'verify_email'),
            ('POST', 'resend_verification'),
            ('POST', 'register'),
            ('GET', 'profile'),
            ('POST', 'change_password'),
        ]:
            try:
                # Test if the action exists
                getattr(self, action_name)
                actions.append(f"{method} /api/users/{action_name}/")
            except AttributeError:
                actions.append(f"❌ {method} /api/users/{action_name}/ (NOT FOUND)")
        
        return Response({
            'available_actions': actions,
            'current_user': str(request.user),
            'user_is_authenticated': request.user.is_authenticated
        })