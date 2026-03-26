from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComputationViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'computations', ComputationViewSet, basename='computation')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
]
