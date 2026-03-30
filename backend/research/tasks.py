from celery import shared_task
from .models import ExportLog

@shared_task
def generate_export_task(user_id, dataset_id, export_format):
    # Simulated long-running export process
    import time
    time.sleep(2)
    
    file_url = f"https://s3.amazonaws.com/cipher-analytics/exports/dataset_{dataset_id}_user_{user_id}.{export_format.lower()}"
    
    log = ExportLog.objects.filter(researcher_id=user_id, dataset_id=dataset_id, file_url__isnull=True).order_by('-created_at').first()
    if log:
        log.file_url = file_url
        log.save()
        
    return file_url
