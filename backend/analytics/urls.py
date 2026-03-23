from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComputationViewSet

router = DefaultRouter()
router.register(r'computations', ComputationViewSet, basename='computation')

urlpatterns = [
    path('', include(router.urls)),
]
