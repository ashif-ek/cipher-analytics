import os
import django
import uuid
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from datasets.models import Dataset, DatasetAccess
from research.models import DatasetAccessRequest, DatasetAccessGrant
from datasets.services.authorization import check_dataset_permission
from datasets.services.constants import ComputeMode, OperationType
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

def run_tests():
    print("--- Starting Zero-Trust AuthZ Verification ---")
    
    # 1. Setup Mock Data
    owner = User.objects.create(email=f"owner_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()))
    researcher = User.objects.create(email=f"res_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()))
    admin = User.objects.create(email=f"admin_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()), role='ADMIN')
    
    # 2. Test Admin Bypass
    ds_private = Dataset.objects.create(owner=owner, name="Private DS", visibility='PRIVATE', compute_mode='STRICT', rows_count=10)
    assert check_dataset_permission(admin, ds_private, 'COMPUTE', 'SUM') is True
    print("[PASS] Admin Bypass")

    # 3. Test STRICT Mode
    # No grant
    try:
        check_dataset_permission(researcher, ds_private, 'COMPUTE', 'SUM')
        assert False, "Should have raised PermissionDenied"
    except PermissionDenied:
        print("[PASS] STRICT Mode (No Grant) -> Denied")
    
    # With grant
    req = DatasetAccessRequest.objects.create(researcher=researcher, dataset=ds_private, status='APPROVED')
    DatasetAccessGrant.objects.create(request=req, dataset=ds_private, researcher=researcher, expires_at=timezone.now() + timedelta(days=1))
    assert check_dataset_permission(researcher, ds_private, 'COMPUTE', 'SUM') is True
    print("[PASS] STRICT Mode (Valid Grant) -> Allowed")

    # 4. Test WHITELIST Mode
    ds_whitelist = Dataset.objects.create(owner=owner, name="Whitelist DS", visibility='DISCOVERABLE', compute_mode='WHITELIST', rows_count=10)
    try:
        check_dataset_permission(researcher, ds_whitelist, 'COMPUTE', 'SUM')
        assert False
    except PermissionDenied:
        print("[PASS] WHITELIST Mode (Not in List) -> Denied")
        
    DatasetAccess.objects.create(dataset=ds_whitelist, user=researcher, permission='COMPUTE')
    assert check_dataset_permission(researcher, ds_whitelist, 'COMPUTE', 'SUM') is True
    print("[PASS] WHITELIST Mode (In List) -> Allowed")

    # 5. Test AGGREGATED Mode
    # Safe Op + High Row Count
    ds_agg = Dataset.objects.create(owner=owner, name="Agg DS", visibility='DISCOVERABLE', compute_mode='AGGREGATED', rows_count=10)
    assert check_dataset_permission(researcher, ds_agg, 'COMPUTE', 'SUM') is True
    print("[PASS] AGGREGATED Mode (Safe Op, n>=5) -> Allowed")
    
    # Unsafe Op
    try:
        check_dataset_permission(researcher, ds_agg, 'COMPUTE', 'RAW_DUMP')
        assert False
    except PermissionDenied:
        print("[PASS] AGGREGATED Mode (Unsafe Op) -> Denied")
        
    # Low Row Count (k-anonymity violation)
    ds_small = Dataset.objects.create(owner=owner, name="Small DS", visibility='DISCOVERABLE', compute_mode='AGGREGATED', rows_count=4)
    try:
        check_dataset_permission(researcher, ds_small, 'COMPUTE', 'SUM')
        assert False
    except PermissionDenied as e:
        assert "Privacy Violation" in str(e)
        print("[PASS] AGGREGATED Mode (n < 5) -> Denied (Privacy Violation)")

    print("--- All Authorization Tests Passed ---")

if __name__ == "__main__":
    run_tests()
