import os
import django
import uuid
import hashlib
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from datasets.models import Dataset
from analytics.models import AuditLog
from datasets.services.authorization import check_dataset_permission
from datasets.services.types import Operation, OperationType
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

def run_tests():
    print("--- Starting Authorization Hardening Verification ---")
    
    # 1. Setup Mock User & Dataset
    owner = User.objects.create(email=f"owner_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()))
    researcher = User.objects.create(email=f"res_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()))
    
    # Dataset with 100 rows
    # - col_high_card: 30 distinct values -> 30 > 100/5 (20) -> [REJECT]
    # - col_text: 10 distinct values, but not numeric -> [REJECT for sum/mean]
    ds = Dataset.objects.create(
        owner=owner, 
        name="Hardened DS", 
        visibility='DISCOVERABLE', 
        compute_mode='AGGREGATED', 
        rows_count=100,
        column_stats_verified=True, # Initially verified
        column_stats={
            "col_high_card": {"distinct_count": 30, "is_numeric": True},
            "col_text": {"distinct_count": 10, "is_numeric": False},
            "col_safe": {"distinct_count": 5, "is_numeric": True}
        }
    )

    # 2. Test: Ingestion Verification Guard
    ds_unverified = Dataset.objects.create(
        owner=owner, 
        name="Unverified DS", 
        compute_mode='AGGREGATED',
        column_stats_verified=False
    )
    op_generic = Operation(type=OperationType.AGGREGATE, field="col_safe")
    op_generic.template_name = "average_value"
    try:
        check_dataset_permission(researcher, ds_unverified, 'COMPUTE', op_generic)
        assert False
    except PermissionDenied as e:
        assert "metadata not verified" in str(e)
        print("[PASS] Unverified metadata rejected.")

    # 3. Test: Field Validation (Unknown Field)
    op_unknown = Operation(type=OperationType.AGGREGATE, field="ghost_field")
    op_unknown.template_name = "average_value"
    try:
        check_dataset_permission(researcher, ds, 'COMPUTE', op_unknown)
        assert False
    except PermissionDenied as e:
        print("[PASS] Unknown field rejected.")

    # 4. Test: Field Validation (Type Mismatch)
    op_text_sum = Operation(type=OperationType.AGGREGATE, field="col_text")
    op_text_sum.template_name = "sum_field"
    try:
        check_dataset_permission(researcher, ds, 'COMPUTE', op_text_sum)
        assert False
    except PermissionDenied as e:
        assert "must be numeric" in str(e)
        print("[PASS] Non-numeric field for Sum/Mean rejected.")

    # 5. Test: High-Cardinality Rejection
    op_cardinality = Operation(type=OperationType.AGGREGATE, field="col_high_card")
    op_cardinality.template_name = "average_value"
    try:
        check_dataset_permission(researcher, ds, 'COMPUTE', op_cardinality)
        assert False
    except PermissionDenied as e:
        assert "High-cardinality field" in str(e)
        print("[PASS] High-cardinality field rejected.")

    # 6. Test: Query Fingerprinting & Escalation (Repeated Attempts)
    print("Simulating 5 repeated attempts for the same fingerprint...")
    for i in range(5):
        try:
            check_dataset_permission(researcher, ds, 'COMPUTE', op_cardinality)
        except PermissionDenied:
            pass
            
    # Check the last audit log entry
    last_log = AuditLog.objects.filter(user=researcher).order_by('-timestamp').first()
    print(f"Last log severity: {last_log.get_severity_display()}, Repeats: {last_log.metadata.get('repeated_attempts')}")
    assert last_log.severity == AuditLog.Severity.CRITICAL
    print("[PASS] Fingerprint-based escalation to CRITICAL successful.")

    print("--- All Hardening Tests Passed ---")

if __name__ == "__main__":
    run_tests()
