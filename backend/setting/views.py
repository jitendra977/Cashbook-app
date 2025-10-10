# views/settings_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import UserSettings, ApplicationSettings, UserPreference
from .serializers import UserSettingsSerializer, ApplicationSettingsSerializer, UserPreferenceSerializer

User = get_user_model()

class UserSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        return self.get_queryset().first()
    
    def create(self, request, *args, **kwargs):
        # Users can only have one settings object
        if self.get_queryset().exists():
            return Response(
                {"detail": "User settings already exist. Use update instead."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def reset_to_defaults(self, request):
        """Reset user settings to default values"""
        user_settings = self.get_object()
        if user_settings:
            # Create new settings with defaults
            user_settings.delete()
        
        defaults = UserSettings(user=request.user)
        defaults.save()
        
        serializer = self.get_serializer(defaults)
        return Response(serializer.data)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def get_by_key(self, request):
        """Get preference by key"""
        key = request.query_params.get('key')
        if not key:
            return Response(
                {"detail": "Key parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            preference = self.get_queryset().get(key=key)
            serializer = self.get_serializer(preference)
            return Response(serializer.data)
        except UserPreference.DoesNotExist:
            return Response(
                {"detail": "Preference not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class ApplicationSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ApplicationSettings.objects.filter(is_active=True)
    serializer_class = ApplicationSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get settings by type"""
        setting_type = request.query_params.get('type')
        if setting_type:
            settings = self.get_queryset().filter(setting_type=setting_type)
        else:
            settings = self.get_queryset()
        
        serializer = self.get_serializer(settings, many=True)
        return Response(serializer.data)