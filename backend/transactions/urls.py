from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'types', views.TransactionTypeViewSet)
router.register(r'categories', views.TransactionCategoryViewSet)
router.register(r'', views.TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]