from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'stores', views.StoreViewSet, basename='store')
router.register(r'store-users', views.StoreUserViewSet, basename='storeuser')
router.register(r'cashbooks', views.CashbookViewSet, basename='cashbook')

urlpatterns = [
    path('', include(router.urls)),
]