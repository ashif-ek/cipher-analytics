from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from .serializers import DatasetUploadSerializer, ComputationJobSerializer
from .models import Dataset, ComputationJob
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
            return Dataset.objects.filter(
                Q(access_level__in=['PUBLIC', 'SHARED', 'COLLABORATIVE', 'AGGREGATED']) |
                Q(datasetaccess__user=user)
            ).distinct().order_by("-created_at")
            
        return Dataset.objects.none()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Log view
        from core.middleware.traceability import get_current_request_id, get_current_ip
        from analytics.services.audit import log_audit_event
        from analytics.models import AuditLog
        
        log_audit_event(
            user_id=request.user.id,
            action=AuditLog.Action.DATASET_PROCESS, # Closest to VIEW
            severity=AuditLog.Severity.INFO,
            ip_address=get_current_ip(),
            request_id=get_current_request_id(),
            metadata={"dataset_id": instance.id, "type": "view"}
        )
        
        return Response(serializer.data)

    def perform_create(self, serializer):
        from core.middleware.traceability import get_current_request_id, get_current_ip
        from analytics.services.audit import log_audit_event
        from analytics.models import AuditLog
        
        req_id = get_current_request_id()
        ip = get_current_ip()
        
        # Save the dataset with the current user as owner and status READY since ciphertext is pre-encrypted
        dataset = serializer.save(owner=self.request.user, status="READY")
        
        log_audit_event(
            user_id=self.request.user.id,
            action=AuditLog.Action.DATASET_UPLOAD,
            severity=AuditLog.Severity.INFO,
            ip_address=ip,
            request_id=req_id,
            metadata={"dataset_id": dataset.id, "name": dataset.name, "type": "FHE_CIPHERTEXT"}
        )


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
        if operation not in ["sum", "mean", "variance"]:
            return Response({"detail": "Invalid operation."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Extract explicit execution grant boundaries via the zero-trust module.
        from .services.authorization import check_dataset_permission
        from rest_framework.exceptions import PermissionDenied
        try:
             check_dataset_permission(request.user, dataset, 'COMPUTE', operation=operation)
        except PermissionDenied as pe:
             return Response({"detail": str(pe)}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            from .models import ComputationJob
            job = ComputationJob.objects.create(
                dataset=dataset,
                requested_by=request.user,
                operation=operation.upper(),
                status="PENDING"
            )

            from core.middleware.traceability import get_current_request_id, get_current_ip
            from analytics.services.audit import log_audit_event
            from analytics.models import AuditLog
            
            req_id = get_current_request_id()
            log_audit_event(
                user_id=request.user.id,
                action=AuditLog.Action.DATASET_PROCESS,
                severity=AuditLog.Severity.INFO,
                ip_address=get_current_ip(),
                request_id=req_id,
                metadata={"dataset_id": dataset.id, "operation": operation, "job_id": job.id}
            )
            
            # Trigger celery FHE task
            from .tasks import execute_fhe_computation_task
            execute_fhe_computation_task.delay(job.id, request_id=req_id, ip_address=get_current_ip())
            
            return Response({
                "job_id": job.id, 
                "status": job.status,
                "operation": job.operation,
                "message": "FHE Computation job queued successfully."
            }, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ComputationJobViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ComputationJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ComputationJob.objects.filter(requested_by=self.request.user)