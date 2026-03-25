from django.contrib.auth.signals import user_logged_in, user_login_failed, user_logged_out
from django.dispatch import receiver
from analytics.models import AuditLog
from analytics.services.audit import log_audit_event
from core.middleware.traceability import get_current_request_id
from core.utils.network import get_client_ip

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    ip = get_client_ip(request) if request else None
    req_id = get_current_request_id()
    log_audit_event(
        user_id=user.id,
        action=AuditLog.Action.LOGIN_SUCCESS,
        severity=AuditLog.Severity.INFO,
        ip_address=ip,
        request_id=req_id,
        metadata={"agent": request.META.get("HTTP_USER_AGENT", "")}
    )
    
    from analytics.tasks import detect_abnormal_login_patterns_async
    detect_abnormal_login_patterns_async.delay(user.id)

@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    ip = get_client_ip(request) if request else None
    req_id = get_current_request_id()
    
    # We do not log the password from credentials!
    safe_creds = {k: v for k, v in credentials.items() if k != 'password'}
    
    log_audit_event(
        user_id=None, # user might not exist
        action=AuditLog.Action.LOGIN_FAILED,
        severity=AuditLog.Severity.CRITICAL, # Crítical to log failed attempts synchronously
        ip_address=ip,
        request_id=req_id,
        metadata={"credentials_attempted": safe_creds, "agent": request.META.get("HTTP_USER_AGENT", "")}
    )

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    ip = get_client_ip(request) if request else None
    req_id = get_current_request_id()
    log_audit_event(
        user_id=user.id if user else None,
        action=AuditLog.Action.LOGOUT,
        severity=AuditLog.Severity.INFO,
        ip_address=ip,
        request_id=req_id
    )
