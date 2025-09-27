from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'stores', views.StoreViewSet)
router.register(r'store-users', views.StoreUserViewSet)
router.register(r'cashbooks', views.CashbookViewSet)

urlpatterns = [
    path('', include(router.urls)),
]