from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ResearchDatasetViewSet,
    DatasetAccessRequestViewSet,
    ResearcherAnalyticsViewSet,
    ExportViewSet
)

router = DefaultRouter()
router.register(r'datasets', ResearchDatasetViewSet, basename='research-dataset')
router.register(r'requests', DatasetAccessRequestViewSet, basename='research-request')
router.register(r'analytics', ResearcherAnalyticsViewSet, basename='research-analytics')
router.register(r'exports', ExportViewSet, basename='research-export')

urlpatterns = [
    path('', include(router.urls)),
]
