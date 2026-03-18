from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Computation
from .serializers import ComputationSerializer, AggregatedAnalyticsSerializer
from datasets.permissions import IsResearcher, IsAdmin, CanAccessComputation
from .services import aggregation


class ComputationViewSet(viewsets.ModelViewSet):
    serializer_class = ComputationSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessComputation]

    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff or user.role == "ADMIN":
            return Computation.objects.all().order_by("-created_at")
            
        if user.role == "DATA_OWNER":
            return Computation.objects.filter(owner=user).order_by("-created_at")
            
        if user.role == "RESEARCHER":
            # Researchers only see aggregated results
            return Computation.objects.filter(is_aggregated=True).order_by("-created_at")
            
        return Computation.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsResearcher | IsAdmin])
    def summary(self, request):
        dataset_id = request.query_params.get('dataset_id')
        if not dataset_id:
            return Response({"error": "dataset_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Only researchers and admins can access this
        summary_data = aggregation.compute_average(dataset_id)
        if not summary_data:
            return Response({"error": "Dataset not found or access denied"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = AggregatedAnalyticsSerializer(summary_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
