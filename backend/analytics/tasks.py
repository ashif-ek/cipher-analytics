import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from analytics.models import AuditLog

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=10, queue='default')
def persist_audit_log_async(self, **log_data):
    try:
        AuditLog.objects.create(**log_data)
    except Exception as e:
        logger.error(f"Failed to persist async audit log: {e}")
        self.retry(exc=e)

@shared_task(queue='default')
def detect_abnormal_login_patterns_async(user_id):
    """
    Scans recent AuditLogs for a given user. If >3 IPs appear within 5 minutes, 
    flags an anomaly.
    """
    if not user_id:
        return
        
    five_mins_ago = timezone.now() - timedelta(minutes=5)
    recent_logins = AuditLog.objects.filter(
        user_id=user_id,
        action=AuditLog.Action.LOGIN_SUCCESS,
        timestamp__gte=five_mins_ago
    ).values('ip_address').distinct()
    
    if recent_logins.count() >= 3:
        logger.warning(f"Abnormal login velocity detected for user {user_id}", extra={'user_id': user_id})
        
        AuditLog.objects.create(
            user_id=user_id,
            action=AuditLog.Action.LOGIN_SUCCESS,
            severity=AuditLog.Severity.WARNING,
            metadata={"alert": "Abnormal IP velocity detected", "distinct_ips_count": recent_logins.count()}
        )
