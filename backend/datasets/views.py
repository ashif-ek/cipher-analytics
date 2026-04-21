from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.http import FileResponse

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
            queryset = Dataset.objects.all()
        elif user.role == "DATA_OWNER":
            queryset = Dataset.objects.filter(owner=user)
        elif user.role == "RESEARCHER":
            queryset = Dataset.objects.filter(
                Q(visibility="DISCOVERABLE") |
                Q(datasetaccess__user=user)
            ).distinct()
        else:
            return Dataset.objects.none()
            
        # Optional Query Parameters
        q = self.request.query_params.get('q', '').strip()
        status_filter = self.request.query_params.get('status', 'ALL')
        visibility_filter = self.request.query_params.get('visibility', 'ALL')
        
        if q:
            # Check if q is a numeric ID
            if q.isdigit():
                queryset = queryset.filter(Q(name__icontains=q) | Q(id=int(q)))
            else:
                queryset = queryset.filter(name__icontains=q)
                
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
            
        if visibility_filter and visibility_filter != 'ALL':
            queryset = queryset.filter(visibility=visibility_filter)
            
        sort_field = self.request.query_params.get('sort_field', 'created_at')
        sort_dir = self.request.query_params.get('sort_dir', 'desc')
        
        # Guard against invalid sort fields
        valid_sort_fields = ['name', 'status', 'visibility', 'created_at']
        if sort_field not in valid_sort_fields:
            sort_field = 'created_at'
            
        if sort_dir == 'desc':
            sort_field = f"-{sort_field}"
            
        return queryset.order_by(sort_field)

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
        
        # Save the dataset with the current user as owner
        dataset = serializer.save(owner=self.request.user)
        
        # Trigger celery ingestion task
        from .tasks import process_and_encrypt_dataset_task
        process_and_encrypt_dataset_task.delay(dataset.id)
        
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

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        dataset = self.get_object()
        file_field = dataset.ciphertext_path or dataset.original_file
        
        if not file_field:
             return Response({"detail": "No payload available to download."}, status=status.HTTP_404_NOT_FOUND)
             
        try:
            file_path = file_field.path
            response = FileResponse(open(file_path, 'rb'), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{dataset.name}.enc"'
        except Exception as e:
            return Response({"detail": f"File access error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Log download
        from core.middleware.traceability import get_current_request_id, get_current_ip
        from analytics.services.audit import log_audit_event
        from analytics.models import AuditLog
        
        log_audit_event(
            user_id=request.user.id,
            action=AuditLog.Action.DATASET_DOWNLOAD,
            severity=AuditLog.Severity.INFO,
            ip_address=get_current_ip(),
            request_id=get_current_request_id(),
            metadata={"dataset_id": dataset.id, "type": "encrypted_download"}
        )
        
        return response

    @action(detail=True, methods=['get'])
    def export_metadata(self, request, pk=None):
        import json
        from django.http import HttpResponse
        
        dataset = self.get_object()
        metadata = {
            "id": dataset.id,
            "name": dataset.name,
            "status": dataset.status,
            "visibility": dataset.visibility,
            "access_policy": dataset.access_policy,
            "rows_count": dataset.rows_count,
            "columns_count": dataset.columns_count,
            "column_stats": dataset.column_stats,
            "created_at": dataset.created_at.isoformat() if dataset.created_at else None,
            "last_operation": dataset.last_operation,
            "last_result": dataset.last_result
        }
        
        response = HttpResponse(json.dumps(metadata, indent=2), content_type="application/json")
        response['Content-Disposition'] = f'attachment; filename="{dataset.name}_metadata.json"'
        return response

    @action(detail=True, methods=['post'])
    def compute(self, request, pk=None):
        dataset = self.get_object()
        if dataset.status != "READY":
            return Response({"detail": "Dataset is not ready for computation."}, status=status.HTTP_400_BAD_REQUEST)
        
        operation = request.data.get("operation", "sum")
        if operation not in ["sum", "mean", "variance", "std_deviation", "correlation", "anomaly_detection"]:
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