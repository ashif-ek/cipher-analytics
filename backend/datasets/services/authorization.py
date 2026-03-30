from rest_framework.exceptions import PermissionDenied
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
    if dataset.access_level == 'PRIVATE':
        raise PermissionDenied("You do not have access to this Private Entity.")

    # Rule 2: Validation
    if action == 'VIEW':
        # Granted if global or user holds explicit database rights
        if dataset.access_level in ['PUBLIC', 'SHARED']:
            return True
        elif dataset.access_level == 'COLLABORATIVE':
            if DatasetAccess.objects.filter(dataset=dataset, user=user).exists():
                return True
        raise PermissionDenied("VIEW access denied.")

    elif action == 'COMPUTE':
        if dataset.access_level == 'COLLABORATIVE':
            # Needs explicit COMPUTE grant in DatasetAccess
            has_grant = DatasetAccess.objects.filter(
                dataset=dataset, 
                user=user, 
                permission__in=['COMPUTE', 'ANALYZE', 'FULL']
            ).exists()
            if not has_grant:
                raise PermissionDenied("COMPUTE privilege denied for Collaborative Pool.")
                
        elif dataset.access_level in ['PUBLIC', 'SHARED']:
            # For public/shared data, researchers may only run simple aggregate mathematics
            # Block complex or raw decryption endpoints
            allowed_ops = ['SUM', 'MEAN', 'VARIANCE']
            if operation and operation.upper() not in allowed_ops:
                raise PermissionDenied(f"Operation {operation} not permitted. Aggregated endpoints only.")
                
        return True

    elif action == 'DECRYPT':
        # Cryptographic execution boundaries: ONLY the Owner decrypts raw output by default
        raise PermissionDenied("You do not hold the proxy-keys required to DECRYPT this payload.")

    return False
