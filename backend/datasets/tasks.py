import logging
from celery import shared_task
from django.utils import timezone
from .models import Dataset
from .services.dataset_processing import process_and_encrypt_dataset

from analytics.models import AuditLog
from analytics.services.audit import log_audit_event

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='heavy_tasks')
def process_and_encrypt_dataset_task(self, dataset_id, request_id=None, ip_address=None):
    dataset_obj = None
    try:
        dataset_obj = Dataset.objects.get(id=dataset_id)
        
        # Idempotency check:
        # Do not block if PROCESSING (allow safe reprocessing if a worker died/restarted).
        if dataset_obj.status == "READY":
            logger.info(
                "Dataset already processed, skipping execution.",
                extra={'dataset_id': dataset_id, 'task_id': self.request.id}
            )
            return "ALREADY_READY"
            
        logger.info(
            "Starting dataset encryption task.",
            extra={'dataset_id': dataset_id, 'task_id': self.request.id, 'request_id': request_id}
        )
        
        # Record execution state
        dataset_obj.status = "PROCESSING"
        dataset_obj.task_id = self.request.id
        dataset_obj.error_message = None
        dataset_obj.save(update_fields=['status', 'task_id', 'error_message'])
        
        # Process and encrypt
        process_and_encrypt_dataset(dataset_obj)
        
        # Terminal state Success
        dataset_obj.status = "READY"
        dataset_obj.save(update_fields=['status'])
        
        logger.info(
            "Successfully processed and encrypted dataset.",
            extra={'dataset_id': dataset_id, 'task_id': self.request.id}
        )
        
        log_audit_event(
            user_id=dataset_obj.owner.id,
            action=AuditLog.Action.DATASET_PROCESS,
            severity=AuditLog.Severity.INFO,
            ip_address=ip_address,
            request_id=request_id,
            metadata={"dataset_id": dataset_obj.id, "status": "SUCCESS"}
        )
        
        return "SUCCESS"
        
    except Dataset.DoesNotExist:
        logger.error(
            "Dataset does not exist.",
            extra={'dataset_id': dataset_id, 'task_id': self.request.id}
        )
        return "NOT_FOUND"
        
    except Exception as e:
        logger.warning(
            f"Error processing dataset: {str(e)}. Attempting retry.",
            extra={'dataset_id': dataset_id, 'task_id': self.request.id, 'error': str(e)}
        )
        
        # Retry logic
        try:
            self.retry(exc=e)
        except self.MaxRetriesExceededError:
            if dataset_obj:
                dataset_obj.status = "FAILED"
                dataset_obj.error_message = f"Max retries exceeded. Last error: {str(e)}"
                dataset_obj.save(update_fields=['status', 'error_message'])
                
            logger.error(
                "Max retries exceeded. Task permanently failed.",
                extra={'dataset_id': dataset_id, 'task_id': self.request.id, 'error': str(e)}
            )
            
            if dataset_obj:
                log_audit_event(
                    user_id=dataset_obj.owner.id,
                    action=AuditLog.Action.DATASET_PROCESS,
                    severity=AuditLog.Severity.WARNING,
                    ip_address=ip_address,
                    request_id=request_id,
                    metadata={"dataset_id": dataset_obj.id, "status": "FAILED", "error": str(e)}
                )
                
            return "FAILED"

@shared_task(queue='default')
def cleanup_stuck_datasets_task():
    # Detect datasets sitting in PROCESSING for > 2 hours and set them to FAILED
    from datetime import timedelta
    threshold = timezone.now() - timedelta(hours=2)
    stuck_datasets = Dataset.objects.filter(status="PROCESSING", updated_at__lt=threshold)
    count = stuck_datasets.update(status="FAILED", error_message="Task timed out or worker crashed indefinitely.")
    if count > 0:
         logger.info(f"Marked {count} stuck datasets as FAILED.", extra={'event': 'cleanup_stuck_datasets'})
