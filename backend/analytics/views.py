from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Computation, AuditLog
from .serializers import ComputationSerializer, AggregatedAnalyticsSerializer, AuditLogSerializer
from datasets.permissions import IsResearcher, IsAdmin, CanAccessComputation
from .services import aggregation
from .services.audit import log_audit_event
from core.middleware.traceability import get_current_request_id, get_current_ip


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for audit logs.
    Admins see everything. Data Owners see their own activities.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == "ADMIN":
            return AuditLog.objects.all().order_by("-timestamp")
        
        # Data owners can only see logs where they are the subject
        if user.role == "DATA_OWNER":
            return AuditLog.objects.filter(user=user).order_by("-timestamp")
            
        return AuditLog.objects.none()


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
            
        log_audit_event(
            user_id=request.user.id,
            action=AuditLog.Action.DATASET_PROCESS, # Using PROCESS for summary access
            severity=AuditLog.Severity.INFO,
            ip_address=get_current_ip(),
            request_id=get_current_request_id(),
            metadata={"dataset_id": dataset_id, "type": "summary_access"}
        )
            
        serializer = AggregatedAnalyticsSerializer(summary_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
