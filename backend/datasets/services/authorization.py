from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from ..models import DatasetAccess

def check_dataset_permission(user, dataset, action: str, operation=None) -> bool:
    """
    Evaluates fine-grained permissions (VIEW, COMPUTE, DECRYPT) 
    disentangling visibility from access levels.
    """
    # Owners hold immutable God-access to their own data
    if user == dataset.owner:
        return True

    # System Administrators inherently pass
    if user.is_staff or user.role == 'ADMIN':
        return True

    # Rule 1: Strict Rejection on Private Collections
    if dataset.visibility == 'PRIVATE' and not DatasetAccess.objects.filter(dataset=dataset, user=user).exists():
        # Even if private, if there's an explicit grant, we allow them to proceed 
        # but otherwise block.
        raise PermissionDenied("You do not have access to this Private Entity.")

    # Rule 2: Validation
    if action == 'VIEW':
        # Granted if discoverable or user holds explicit database rights
        if dataset.visibility == 'DISCOVERABLE':
            return True
        elif DatasetAccess.objects.filter(dataset=dataset, user=user).exists():
            return True
        raise PermissionDenied("VIEW access denied.")

    elif action == 'COMPUTE':
        if dataset.access_policy == 'COLLABORATIVE':
            # Needs explicit COMPUTE grant in DatasetAccess
            has_grant = DatasetAccess.objects.filter(
                dataset=dataset, 
                user=user, 
                permission__in=['COMPUTE', 'ANALYZE', 'FULL']
            ).exists()
            if not has_grant:
                raise PermissionDenied("COMPUTE privilege denied for Collaborative Pool.")
                
        elif dataset.access_policy == 'STRICT':
            # Strict mode: Only those with an ANALYZE or FULL grant (Research Grant) can compute
            if not DatasetAccess.objects.filter(dataset=dataset, user=user, permission__in=['ANALYZE', 'FULL']).exists():
                 # Check for research grant models if linked
                 from research.models import DatasetAccessGrant
                 has_active_grant = DatasetAccessGrant.objects.filter(
                     request__researcher=user,
                     dataset=dataset,
                     is_active=True,
                     expires_at__gt=timezone.now()
                 ).exists()
                 if not has_active_grant:
                     raise PermissionDenied("Active Research Grant required for computation on 'STRICT' policy data.")

        elif dataset.access_policy == 'AGGREGATED':
            # For aggregated policy data, researchers may run simple aggregate mathematics
            allowed_ops = ['SUM', 'MEAN', 'VARIANCE', 'STD_DEVIATION']
            if operation and operation.upper() not in allowed_ops:
                raise PermissionDenied(f"Operation {operation} not permitted. Aggregated policy limits queries to SUM/MEAN/VARIANCE/STD_DEVIATION.")
                
        return True

    elif action == 'DECRYPT':
        # Cryptographic execution boundaries: ONLY the Owner decrypts raw output by default
        raise PermissionDenied("You do not hold the proxy-keys required to DECRYPT this payload.")

    return False
