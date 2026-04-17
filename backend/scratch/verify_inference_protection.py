import os
import django
import uuid
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from datasets.models import Dataset
from datasets.services.authorization import check_dataset_permission
from datasets.services.types import Operation, OperationType, Filter, FilterOperator, ALLOWED_QUERIES
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

def run_tests():
    print("--- Starting Inference Protection Verification ---")
    
    # 1. Setup Mock User & Dataset with Column Stats
    owner = User.objects.create(email=f"owner_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()))
    researcher = User.objects.create(email=f"res_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()))
    
    # Dataset with 100 rows
    # - col_low: 10 distinct values -> estimated_size = 100/10 = 10 (SAFE)
    # - col_high: 50 distinct values -> estimated_size = 100/50 = 2 (UNSAFE)
    ds = Dataset.objects.create(
        owner=owner, 
        name="Stats DS", 
        visibility='DISCOVERABLE', 
        compute_mode='AGGREGATED', 
        rows_count=100,
        column_stats={
            "col_low": {"distinct_count": 10},
            "col_high": {"distinct_count": 50}
        }
    )
    
    # 2. Test Success Case (Safe Aggregation)
    op_safe = Operation(type=OperationType.AGGREGATE, field="col_low")
    # Simulate template being passed in context (as per check_dataset_permission refactor)
    op_safe.template_name = "average_value" 
    
    assert check_dataset_permission(researcher, ds, 'COMPUTE', op_safe) is True
    print("[PASS] Safe Aggregation (estimated_size=10 >= 5) allowed.")

    # 3. Test Rejection: Inference Risk (k-anonymity violation)
    op_unsafe = Operation(type=OperationType.AGGREGATE, field="col_high")
    op_unsafe.template_name = "average_value"
    
    try:
        check_dataset_permission(researcher, ds, 'COMPUTE', op_unsafe)
        assert False
    except PermissionDenied as e:
        assert "Inference Attack Risk" in str(e)
        print("[PASS] Unsafe Aggregation (estimated_size=2 < 5) rejected.")

    # 4. Test Rejection: Custom Operation Type
    op_custom = Operation(type=OperationType.CUSTOM, field="col_low")
    try:
        check_dataset_permission(researcher, ds, 'COMPUTE', op_custom)
        assert False
    except PermissionDenied as e:
        print("[PASS] CUSTOM type rejected in AGGREGATED mode.")

    # 5. Test Rejection: Invalid Template
    op_bad_template = Operation(type=OperationType.AGGREGATE, field="col_low")
    op_bad_template.template_name = "delete_all_records"
    try:
        check_dataset_permission(researcher, ds, 'COMPUTE', op_bad_template)
        assert False
    except PermissionDenied as e:
        print("[PASS] Non-whitelisted template rejected.")

    # 6. Test Rejection: Arbitrary Filters
    op_filtered = Operation(
        type=OperationType.AGGREGATE, 
        field="col_low", 
        filters=[Filter(field="age", operator=FilterOperator.GT, value=25)]
    )
    op_filtered.template_name = "average_value"
    try:
        check_dataset_permission(researcher, ds, 'COMPUTE', op_filtered)
        assert False
    except PermissionDenied as e:
        assert "Arbitrary filters are rejected" in str(e)
        print("[PASS] Arbitrary filters rejected in AGGREGATED mode.")

    print("--- All Inference Protection Tests Passed ---")

if __name__ == "__main__":
    run_tests()
