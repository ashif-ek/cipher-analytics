from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .serializers import DatasetUploadSerializer
from .models import Dataset
from .permissions import IsDataOwner, CanAccessDataset


class DatasetViewSet(viewsets.ModelViewSet):
    serializer_class = DatasetUploadSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsDataOwner()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsDataOwner()]
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), CanAccessDataset()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff or user.role == "ADMIN":
            return Dataset.objects.all().order_by("-created_at")
            
        if user.role == "DATA_OWNER":
            return Dataset.objects.filter(owner=user).order_by("-created_at")
            
        if user.role == "RESEARCHER":
            return Dataset.objects.filter(is_shared_for_research=True).order_by("-created_at")
            
        return Dataset.objects.none()

    def perform_create(self, serializer):
        from core.middleware.traceability import get_current_request_id, get_current_ip
        from analytics.services.audit import log_audit_event
        from analytics.models import AuditLog
        
        req_id = get_current_request_id()
        ip = get_current_ip()
        
        # Save the dataset with the current user as owner and status PROCESSING
        dataset = serializer.save(owner=self.request.user, status="PROCESSING")
        
        log_audit_event(
            user_id=self.request.user.id,
            action=AuditLog.Action.DATASET_UPLOAD,
            severity=AuditLog.Severity.INFO,
            ip_address=ip,
            request_id=req_id,
            metadata={"dataset_id": dataset.id, "name": dataset.name}
        )
        
        # Trigger encryption process asynchronously
        from .tasks import process_and_encrypt_dataset_task
        task = process_and_encrypt_dataset_task.delay(dataset.id, request_id=req_id, ip_address=ip)
        dataset.task_id = task.id
        dataset.save(update_fields=['task_id'])

    def perform_destroy(self, instance):
        from core.middleware.traceability import get_current_request_id, get_current_ip
        from analytics.services.audit import log_audit_event
        from analytics.models import AuditLog
        
        req_id = get_current_request_id()
        ip = get_current_ip()
        
        log_audit_event(
            user_id=self.request.user.id,
            action=AuditLog.Action.DATASET_DELETE,
            severity=AuditLog.Severity.WARNING,
            ip_address=ip,
            request_id=req_id,
            metadata={"dataset_id": instance.id, "name": instance.name}
        )
        instance.delete()

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        dataset = self.get_object()
        return Response({
            "id": dataset.id,
            "status": dataset.status,
            "task_id": dataset.task_id,
            "error_message": dataset.error_message,
            "updated_at": dataset.updated_at
        })
    @action(detail=True, methods=['post'])
    def compute(self, request, pk=None):
        dataset = self.get_object()
        if dataset.status != "READY":
            return Response({"detail": "Dataset is not ready for computation."}, status=status.HTTP_400_BAD_REQUEST)
        
        operation = request.data.get("operation", "sum")
        if operation not in ["sum", "mean"]:
            return Response({"detail": "Invalid operation."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from .services.dataset_processing import compute_encrypted_aggregation
            result = compute_encrypted_aggregation(dataset, operation=operation)
            return Response(result)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)