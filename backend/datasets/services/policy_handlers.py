from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from ..models import DatasetAccess
from .types import Operation, OperationType, ALLOWED_QUERIES

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
    AGGREGATED mode: Hardened metadata-driven validation to prevent inference attacks.
    Enforces k-anonymity, high-cardinality traps, and ingestion verification.
    """
    # 1. Metadata Verification Guard
    if not getattr(dataset, 'column_stats_verified', False):
        raise PermissionDenied("Dataset metadata not verified. Refusing computation for security.")

    # 2. Type/Structural Validation
    if not isinstance(operation, Operation):
        raise PermissionDenied("Invalid computation structure. Operation model required.")

    if operation.type != OperationType.AGGREGATE:
        raise PermissionDenied("AGGREGATED mode only permits AGGREGATE type operations.")

    # 3. Template Whitelisting
    template_name = context.get('template_name') if context else None
    if template_name not in ALLOWED_QUERIES:
        raise PermissionDenied(f"Query template '{template_name}' is not in the approved whitelist.")

    # 4. Field Validation
    field_name = operation.field
    stats = dataset.column_stats.get(field_name)
    
    if not stats:
        raise PermissionDenied(f"Invalid Field: Field '{field_name}' does not exist in dataset schema.")

    # Type Validation for specific templates
    if template_name in ['average_value', 'sum_field']:
        if not stats.get('is_numeric', False):
            raise PermissionDenied(f"Type Mismatch: Field '{field_name}' must be numeric for {template_name}.")

    # 5. Metadata-Driven Safety Check
    distinct_count = stats.get("distinct_count", 0)
    
    # 5a. High-Cardinality Rejection (Inference Risk)
    # Reject if distinct values > 20% of total rows
    if distinct_count > dataset.rows_count / 5:
        raise PermissionDenied("High-cardinality field: inference risk too high for aggregated mode.")

    if distinct_count == 0:
        raise PermissionDenied(f"Invalid Metadata: Distinct count for '{field_name}' is zero.")

    # 5b. k-Anonymity Guard (Estimated n >= 5)
    estimated_size = dataset.rows_count / distinct_count
    if estimated_size < 5:
        raise PermissionDenied(
            f"Inference Attack Risk: Estimated result set size ({estimated_size:.2f}) "
            "falls below the k-anonymity threshold (n < 5)."
        )

    # 6. Filter Restriction
    if operation.filters and len(operation.filters) > 0:
        raise PermissionDenied("Arbitrary filters are rejected in AGGREGATED mode to prevent subset probing.")
        
    return True
