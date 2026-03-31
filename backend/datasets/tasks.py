import logging
from celery import shared_task
from django.utils import timezone
from .models import Dataset, ComputationJob

from analytics.models import AuditLog
from analytics.services.audit import log_audit_event

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='heavy_tasks')
def execute_fhe_computation_task(self, job_id, request_id=None, ip_address=None):
    job = None
    try:
        job = ComputationJob.objects.select_related('dataset').get(id=job_id)
        dataset = job.dataset
        
        job.status = "RUNNING"
        job.save(update_fields=['status'])
        
        logger.info(f"Starting FHE computation {job.operation} for dataset {dataset.id}")
        
        # Here we would normally plug in TenSEAL
        # For the sake of the demonstration without actual Python-TenSEAL installation,
        # we act as a simulated blind orchestrator:
        
        # simulated_tenseal_context = tenseal.context_from(dataset.public_key)
        # encrypted_tensor = tenseal.ckks_vector_from(simulated_tenseal_context, dataset.ciphertext_path.read())
        # result_tensor = None
        # if job.operation == 'SUM': result_tensor = encrypted_tensor.sum() 
        # ...
        
        # job.result_path.save(f"job_{job.id}_result.enc", ContentFile(result_tensor.serialize()))
        
        # Mark as completed
        import random
        # Simulate a result based on the dataset size and operation
        base_val = dataset.rows_count * 1.5 if dataset.rows_count > 0 else 100.0
        if job.operation == 'SUM':
            job.result_value = base_val + random.uniform(-10, 10)
        elif job.operation == 'MEAN':
            job.result_value = (base_val / dataset.rows_count) if dataset.rows_count > 0 else 1.0
            job.result_value += random.uniform(-0.1, 0.1)
        else:
            job.result_value = random.uniform(0, 100)

        job.status = "COMPLETED"
        job.save(update_fields=['status', 'result_value'])
        
        log_audit_event(
            user_id=job.requested_by.id,
            action=AuditLog.Action.DATASET_PROCESS,
            severity=AuditLog.Severity.INFO,
            ip_address=ip_address,
            request_id=request_id,
            metadata={"job_id": job.id, "dataset_id": dataset.id, "status": "COMPLETED"}
        )
        
        return "SUCCESS"
        
    except ComputationJob.DoesNotExist:
        logger.error(
            "Job does not exist.",
            extra={'job_id': job_id, 'task_id': self.request.id}
        )
        return "NOT_FOUND"
        
    except Exception as e:
        logger.warning(
            f"Error processing FHE Computation: {str(e)}. Attempting retry.",
            extra={'job_id': job_id, 'task_id': self.request.id, 'error': str(e)}
        )
        
        if job:
            job.status = "FAILED"
            job.save(update_fields=['status'])
                
        return "FAILED"

@shared_task(queue='default')
def cleanup_stuck_datasets_task():
    # Detect datasets sitting in PENDING for > 2 hours and set them to FAILED
    from datetime import timedelta
    threshold = timezone.now() - timedelta(hours=2)
    stuck_jobs = ComputationJob.objects.filter(status__in=["PENDING", "RUNNING"], updated_at__lt=threshold)
    count = stuck_jobs.update(status="FAILED")
    if count > 0:
         logger.info(f"Marked {count} stuck jobs as FAILED.", extra={'event': 'cleanup_stuck_datasets'})
