from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import PermissionDenied
from analytics.models import AuditLog
from analytics.services.audit import log_audit_event
from core.middleware.traceability import get_current_request_id, get_current_ip

from .constants import ComputeMode, AuthAction
from .policy_handlers import handle_strict, handle_whitelist, handle_aggregated

# Registry of handlers for deterministic policy dispatch (OCP Compliance)
POLICY_HANDLERS = {
    ComputeMode.STRICT.value: handle_strict,
    ComputeMode.WHITELIST.value: handle_whitelist,
    ComputeMode.AGGREGATED.value: handle_aggregated,
}

def check_dataset_permission(user, dataset, action: str, operation=None) -> bool:
    """
    Central Authorization Entry Point.
    Deterministic evaluation governed by the dataset's compute_mode.
    """
    context = {"action": action}
    
    # 1. Bypass logic for high-privilege roles
    if user.is_authenticated and (user == dataset.owner or user.is_staff or getattr(user, 'role', '') == 'ADMIN'):
        return True

    # 2. VIEW access check (Discovery Layer)
    if action == AuthAction.VIEW.value:
        if dataset.visibility == 'DISCOVERABLE':
            return True
        # Private requires explicit grant to VIEW metadata
        from ..models import DatasetAccess
        if DatasetAccess.objects.filter(dataset=dataset, user=user).exists():
            return True
        _log_and_raise_denial(user, dataset, "VIEW_DENIED", operation)

    # 3. COMPUTE access check (Governance Layer)
    if action == AuthAction.COMPUTE.value:
        handler = POLICY_HANDLERS.get(dataset.compute_mode)
        
        if not handler:
            _log_and_raise_denial(user, dataset, "INVALID_MODE", operation)
            
        try:
            return handler(user, dataset, operation, context)
        except PermissionDenied as e:
            _log_and_raise_denial(user, dataset, str(e), operation)

    # 4. Fallback: Implicit Deny
    _log_and_raise_denial(user, dataset, "UNKNOWN_ACTION", operation)

def _log_and_raise_denial(user, dataset, reason, operation):
    """
    Side-effect helper for audit logging with severity escalation.
    """
    # Escalation Logic: Count recent failures
    fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)
    failure_count = AuditLog.objects.filter(
        user=user,
        action=AuditLog.Action.ACCESS_DENIED,
        timestamp__gt=fifteen_minutes_ago,
        metadata__dataset_id=dataset.id
    ).count()

    severity = AuditLog.Severity.INFO
    if failure_count >= 5:
        severity = AuditLog.Severity.CRITICAL
    elif failure_count >= 3:
        severity = AuditLog.Severity.WARNING

    log_audit_event(
        user_id=user.id,
        action=AuditLog.Action.ACCESS_DENIED,
        severity=severity,
        ip_address=get_current_ip(),
        request_id=get_current_request_id(),
        metadata={
            "dataset_id": dataset.id,
            "reason": reason,
            "operation": operation,
            "failure_count_bin": failure_count
        }
    )
    
    raise PermissionDenied(f"Access Denied: {reason}")
