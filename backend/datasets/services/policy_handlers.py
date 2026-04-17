from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from ..models import DatasetAccess
from .constants import OperationType

def handle_strict(user, dataset, operation, context=None):
    """
    STRICT mode: Requires an explicit, approved, and active Research Grant.
    """
    from research.models import DatasetAccessGrant
    
    # Check for active research grant
    has_active_grant = DatasetAccessGrant.objects.filter(
        researcher=user,
        dataset=dataset,
        is_active=True,
        expires_at__gt=timezone.now()
    ).exists()
    
    if not has_active_grant:
        raise PermissionDenied("Active Research Grant required for STRICT policy data.")
    
    return True

def handle_whitelist(user, dataset, operation, context=None):
    """
    WHITELIST mode: Requires the user to be in the dataset's explicit access list.
    """
    has_grant = DatasetAccess.objects.filter(
        dataset=dataset, 
        user=user, 
        permission__in=['COMPUTE', 'ANALYZE', 'FULL']
    ).exists()
    
    if not has_grant:
        raise PermissionDenied("User not on WHITELIST for this dataset.")
        
    return True

def handle_aggregated(user, dataset, operation, context=None):
    """
    AGGREGATED mode: No explicit approval required, but restricted to safe operations 
    and k-anonymity (n >= 5) constraints.
    """
    # 1. Check Operation Safety
    safe_ops = [op.value for op in OperationType]
    if not operation or operation.upper() not in safe_ops:
        raise PermissionDenied(f"Operation '{operation}' is not permitted in Aggregated mode.")
    
    # 2. Check k-Anonymity (Privacy Threshold)
    # n=5 is the mandatory minimum row count to prevent re-identification
    if dataset.rows_count < 5:
        raise PermissionDenied("Privacy Violation: Dataset size (n < 5) insufficient for aggregated analysis.")
        
    return True
