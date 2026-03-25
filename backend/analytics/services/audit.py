import logging
from analytics.models import AuditLog
from analytics.tasks import persist_audit_log_async

logger = logging.getLogger(__name__)

def log_audit_event(user_id, action, severity, ip_address=None, request_id=None, metadata=None):
    """
    Dual-layer Audit Logging Strategy.
    Critical events -> Sync DB write
    Info/Warning events -> Async Celery write + Failover Sync DB write
    """
    if metadata is None:
        metadata = {}

    log_data = {
        'user_id': user_id,
        'action': action,
        'severity': severity,
        'ip_address': ip_address,
        'request_id': request_id,
        'metadata': metadata
    }

    if severity == AuditLog.Severity.CRITICAL:
        try:
            AuditLog.objects.create(**log_data)
        except Exception as e:
            logger.error(f"Failed to synchronously write CRITICAL audit log: {e}", extra=log_data)
    else:
        try:
            # Attempt Async
            persist_audit_log_async.delay(**log_data)
        except Exception as e:
            # Failover to Sync if Redis/Celery is down (OperationalError usually)
            logger.warning(f"Async audit log failed, falling back to synchronous execution: {e}")
            try:
                AuditLog.objects.create(**log_data)
            except Exception as inner_e:
                logger.error(f"Failed synchronous fallback for audit log: {inner_e}", extra=log_data)
