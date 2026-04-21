import hashlib
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import PermissionDenied
from analytics.models import AuditLog
from analytics.services.audit import log_audit_event
from core.middleware.traceability import get_current_request_id, get_current_ip

from .constants import ComputeMode, AuthAction
from .types import Operation
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
    Enforces Zero-Trust policy with query fingerprinting and audit escalation.
    """
    context = {"action": action}
    
    # AGGREGATED mode template awareness
    if action == AuthAction.COMPUTE.value:
         context['template_name'] = getattr(operation, 'template_name', 'sum_field') 

    # 1. Bypass logic for high-privilege roles
    if user.is_authenticated and (user == dataset.owner or user.is_staff or getattr(user, 'role', '') == 'ADMIN'):
        return True

    # 2. Access check for discovery-level actions (VIEW, DOWNLOAD, EXPORT)
    if action in [AuthAction.VIEW.value, AuthAction.DOWNLOAD.value, AuthAction.EXPORT.value]:
        if dataset.visibility == 'DISCOVERABLE':
            return True
        from ..models import DatasetAccess
        if DatasetAccess.objects.filter(dataset=dataset, user=user).exists():
            return True
        _log_and_raise_denial(user, dataset, f"{action}_DENIED", operation)

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
    Side-effect helper for audit logging with fingerprinting and escalation.
    """
    # 1. Query Fingerprinting
    fingerprint = "N/A"
    if isinstance(operation, Operation):
        # Fingerprint: hash(user_id + dataset_id + type + field)
        fp_raw = f"{user.id}:{dataset.id}:{operation.type}:{operation.field}"
        fingerprint = hashlib.sha256(fp_raw.encode()).hexdigest()

    # 2. Failure Counting (15-minute sliding window)
    fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)
    
    # General failures for this user/dataset
    window_failures = AuditLog.objects.filter(
        user=user,
        action=AuditLog.Action.ACCESS_DENIED,
        timestamp__gt=fifteen_minutes_ago,
        metadata__dataset_id=dataset.id
    )
    
    total_failures = window_failures.count()
    
    # Specific repeated query failures (Fingerprint matching)
    repeated_failures = window_failures.filter(
        metadata__fingerprint=fingerprint
    ).count() if fingerprint != "N/A" else 0

    # 3. Escalation logic
    severity = AuditLog.Severity.INFO
    if repeated_failures >= 5 or total_failures >= 5:
        severity = AuditLog.Severity.CRITICAL
    elif total_failures >= 3:
        severity = AuditLog.Severity.WARNING

    # 4. Audit Persistence
    op_repr = str(operation) if operation else "None"
    log_audit_event(
        user_id=user.id,
        action=AuditLog.Action.ACCESS_DENIED,
        severity=severity,
        ip_address=get_current_ip(),
        request_id=get_current_request_id(),
        metadata={
            "dataset_id": dataset.id,
            "reason": reason,
            "operation": op_repr,
            "fingerprint": fingerprint,
            "window_denials": total_failures,
            "repeated_attempts": repeated_failures
        }
    )
    
    raise PermissionDenied(f"Access Denied: {reason}")
