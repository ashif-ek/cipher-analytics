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

    @action(detail=True, methods=['get'], url_path='status')
    def status(self, request, pk=None):
        dataset = self.get_object()
        return Response({
            "id": dataset.id,
            "status": dataset.status,
            "task_id": dataset.task_id,
            "error_message": dataset.error_message,
            "updated_at": dataset.updated_at
        })

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        dataset = self.get_object()
        
        # 1. Zero-Trust Action Check
        from .services.authorization import check_dataset_permission
        from rest_framework.exceptions import PermissionDenied
        try:
             check_dataset_permission(request.user, dataset, 'DOWNLOAD')
        except PermissionDenied as pe:
             return Response({"detail": str(pe)}, status=status.HTTP_403_FORBIDDEN)

        # 2. Hardened Logic: Only allow encrypted artifacts for download
        if not dataset.ciphertext_path:
             return Response({
                 "detail": "Encrypted payload is not yet generated. Please wait for the ingestion pipeline to complete.",
                 "status": dataset.status
             }, status=status.HTTP_404_NOT_FOUND)
             
        try:
            file_path = dataset.ciphertext_path.path
            response = FileResponse(open(file_path, 'rb'), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{dataset.name}.enc"'
        except Exception as e:
            return Response({"detail": f"Secure file access error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 3. Log Secure Download
        from core.middleware.traceability import get_current_request_id, get_current_ip
        from analytics.services.audit import log_audit_event
        from analytics.models import AuditLog
        
        log_audit_event(
            user_id=request.user.id,
            action=AuditLog.Action.DATASET_DOWNLOAD,
            severity=AuditLog.Severity.INFO,
            ip_address=get_current_ip(),
            request_id=get_current_request_id(),
            metadata={"dataset_id": dataset.id, "type": "fhe_ciphertext_download"}
        )
        
        return response

    @action(detail=True, methods=['get'], url_path='export-metadata')
    def export_metadata(self, request, pk=None):
        import json
        from django.http import HttpResponse
        dataset = self.get_object()
        
        # 1. Zero-Trust Access Check
        from .services.authorization import check_dataset_permission
        from rest_framework.exceptions import PermissionDenied
        try:
             check_dataset_permission(request.user, dataset, 'EXPORT')
        except PermissionDenied as pe:
             return Response({"detail": str(pe)}, status=status.HTTP_403_FORBIDDEN)

        metadata = {
            "id": dataset.id,
            "name": dataset.name,
            "status": dataset.status,
            "visibility": dataset.visibility,
            "rows_count": dataset.rows_count,
            "columns_count": dataset.columns_count,
            "column_stats": dataset.column_stats,
            "created_at": dataset.created_at.isoformat() if dataset.created_at else None,
            "last_operation": dataset.last_operation,
            "last_result": dataset.last_result
        }
        
        # 2. Log Secure Metadata Export
        from core.middleware.traceability import get_current_request_id, get_current_ip
        from analytics.services.audit import log_audit_event
        from analytics.models import AuditLog
        
        log_audit_event(
            user_id=request.user.id,
            action=AuditLog.Action.DATASET_PROCESS,
            severity=AuditLog.Severity.INFO,
            ip_address=get_current_ip(),
            request_id=get_current_request_id(),
            metadata={"dataset_id": dataset.id, "type": "metadata_export"}
        )
        
        response = HttpResponse(json.dumps(metadata, indent=2), content_type="application/json")
        response['Content-Disposition'] = f'attachment; filename="{dataset.name}_metadata.json"'
        return response

    @action(detail=True, methods=['post'])
    def explain_anomaly(self, request, pk=None):
        """
        Triggers an asynchronous SHAP explanation for a specific row.
        Includes cache-aside protection and strict permission checks.
        """
        dataset = self.get_object()
        row_id = request.data.get("row_id")
        
        if row_id is None:
            return Response({"detail": "row_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            row_id = int(row_id)
        except ValueError:
            return Response({"detail": "row_id must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Performance: Check global result cache first
        from django.core.cache import cache
        # We find the latest successful anomaly detection job to use in the cache key
        detection_job = ComputationJob.objects.filter(
            dataset=dataset, 
            operation='ANOMALY_DETECTION', 
            status='COMPLETED'
        ).order_by('-created_at').first()
        
        if not detection_job:
             return Response({"detail": "No completed anomaly detection found to explain."}, status=status.HTTP_400_BAD_REQUEST)
             
        cache_key = f"shap_{dataset.id}_{detection_job.id}_{row_id}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response({
                "job_id": None,
                "status": "COMPLETED",
                "result_json": cached_result,
                "cached": True,
                "message": "Loaded from production cache."
            })

        # 2. Authorization (Zero-Trust)
        from .services.authorization import check_dataset_permission
        try:
             check_dataset_permission(request.user, dataset, 'COMPUTE', operation='SHAP_EXPLANATION')
        except Exception as pe:
             return Response({"detail": str(pe)}, status=status.HTTP_403_FORBIDDEN)
             
        # 3. Strict Idempotency Hash
        content_hash = dataset.content_hash or str(dataset.id)
        import hashlib
        task_hash_input = f"{content_hash}_default_SHAP_{row_id}_v1_fhe1"
        task_hash = hashlib.sha256(task_hash_input.encode()).hexdigest()

        existing_job = ComputationJob.objects.filter(
            task_hash=task_hash, 
            status__in=["PENDING", "QUEUED", "RUNNING", "COMPLETED", "RETRYING"]
        ).first()

        if existing_job:
            return Response({
                "job_id": existing_job.id,
                "status": existing_job.status,
                "message": "Found existing identical SHAP explanation job."
            }, status=status.HTTP_200_OK)

        # 4. Backpressure Control
        import redis
        from django.conf import settings
        try:
            r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
            if r.llen("queue_ml") > 50:
                return Response({
                    "detail": "System under heavy load. The queue_ml is currently saturated. Please try again later.",
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        except Exception:
            pass # Fail open

        # 5. Create Async Job
        try:
            job = ComputationJob.objects.create(
                dataset=dataset,
                requested_by=request.user,
                operation="SHAP_EXPLANATION",
                status="PENDING",
                task_hash=task_hash
            )
            
            # Record Audit Trail
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
                metadata={"dataset_id": dataset.id, "operation": "SHAP", "row_id": row_id, "job_id": job.id}
            )
            
            from .tasks import execute_shap_explanation_task
            # Pass original request metadata for downstream tracing
            execute_shap_explanation_task.delay(job.id, row_id)
            
            return Response({
                "job_id": job.id,
                "status": job.status,
                "message": "SHAP explanation job queued."
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            
        # Strict Idempotency Hash
        content_hash = dataset.content_hash or str(dataset.id)
        import hashlib
        task_hash_input = f"{content_hash}_default_{operation.upper()}__v1_fhe1"
        task_hash = hashlib.sha256(task_hash_input.encode()).hexdigest()

        from .models import ComputationJob
        existing_job = ComputationJob.objects.filter(
            task_hash=task_hash, 
            status__in=["PENDING", "QUEUED", "RUNNING", "COMPLETED", "RETRYING"]
        ).first()

        if existing_job:
            return Response({
                "job_id": existing_job.id,
                "status": existing_job.status,
                "operation": existing_job.operation,
                "message": "Found existing identical computation job."
            }, status=status.HTTP_200_OK)

        # Backpressure Control
        import redis
        from django.conf import settings
        try:
            r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
            queue_name = "queue_ml" if operation.upper() in ["CORRELATION", "ANOMALY_DETECTION"] else "queue_fhe"
            if r.llen(queue_name) > 50:
                return Response({
                    "detail": f"System under heavy load. The {queue_name} is currently saturated. Please try again later.",
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        except Exception:
            pass # Fail open

        try:
            job = ComputationJob.objects.create(
                dataset=dataset,
                requested_by=request.user,
                operation=operation.upper(),
                status="PENDING",
                task_hash=task_hash
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

    @action(detail=True, methods=['get'], url_path='embedding')
    def embedding(self, request, pk=None):
        dataset = self.get_object()
        
        # 1. Zero-Trust Action Check
        from .services.authorization import check_dataset_permission
        from rest_framework.exceptions import PermissionDenied
        try:
             check_dataset_permission(request.user, dataset, 'VIEW')
        except PermissionDenied as pe:
             return Response({"detail": str(pe)}, status=status.HTTP_403_FORBIDDEN)
             
        import os
        import json
        from django.conf import settings
        from django.core.cache import cache
        from django.http import HttpResponse
        
        dataset_hash = dataset.content_hash or str(dataset.id)
        cache_key = f"embedding_json_{dataset_hash}"
        
        cached_data = cache.get(cache_key)
        if cached_data:
            return HttpResponse(cached_data, content_type='application/json')
            
        embedding_dir = os.path.join(settings.MEDIA_ROOT, 'embeddings')
        output_path = os.path.join(embedding_dir, f"{dataset_hash}.json")
        
        if not os.path.exists(output_path):
            return Response({"detail": "Embedding not found. Please generate it first.", "status": dataset.embedding_status}, status=status.HTTP_404_NOT_FOUND)
            
        with open(output_path, 'r') as f:
            data = f.read()
            
        cache.set(cache_key, data, timeout=3600*24) # Cache for 24h
        return HttpResponse(data, content_type='application/json')

    @action(detail=True, methods=['post'], url_path='generate-embedding')
    def generate_embedding(self, request, pk=None):
        dataset = self.get_object()
        
        # 1. Zero-Trust Action Check
        from .services.authorization import check_dataset_permission
        from rest_framework.exceptions import PermissionDenied
        try:
             check_dataset_permission(request.user, dataset, 'COMPUTE')
        except PermissionDenied as pe:
             return Response({"detail": str(pe)}, status=status.HTTP_403_FORBIDDEN)
             
        if dataset.embedding_status in ["PENDING", "RUNNING"]:
            return Response({"detail": "Embedding generation is already in progress.", "status": dataset.embedding_status}, status=status.HTTP_400_BAD_REQUEST)
            
        import os
        from django.conf import settings
        dataset_hash = dataset.content_hash or str(dataset.id)
        embedding_dir = os.path.join(settings.MEDIA_ROOT, 'embeddings')
        output_path = os.path.join(embedding_dir, f"{dataset_hash}.json")
        
        if os.path.exists(output_path):
            return Response({"detail": "Embedding already exists.", "status": "COMPLETED"}, status=status.HTTP_200_OK)
            
        # Trigger Celery Task
        from .tasks import generate_embedding_task
        dataset.embedding_status = "PENDING"
        dataset.save(update_fields=['embedding_status'])
        
        generate_embedding_task.delay(dataset.id)
        
        return Response({"detail": "Embedding generation started.", "status": "PENDING"}, status=status.HTTP_202_ACCEPTED)

class ComputationJobViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ComputationJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ComputationJob.objects.filter(requested_by=self.request.user)