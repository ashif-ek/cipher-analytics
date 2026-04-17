import os
import django
import uuid

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from datasets.models import Dataset, ComputationJob
from django.contrib.auth import get_user_model
from datasets.tasks import execute_fhe_computation_task

User = get_user_model()

def verify_persistence():
    print("--- Verifying Computation Persistence ---")
    
    # 1. Create Mock User & Dataset
    user = User.objects.create(email=f"tester_{uuid.uuid4()}@test.com", username=str(uuid.uuid4()))
    ds = Dataset.objects.create(owner=user, name="Persistence Test", status="READY", rows_count=100)
    
    # 2. Create Computation Job
    job = ComputationJob.objects.create(
        dataset=ds,
        requested_by=user,
        operation="SUM",
        status="PENDING"
    )
    
    # 3. Execute Task (Simulated)
    print(f"Executing task for job {job.id}...")
    execute_fhe_computation_task(job.id)
    
    # 4. Reload Dataset and Verify
    ds.refresh_from_db()
    print(f"Dataset last_result: {ds.last_result}")
    print(f"Dataset last_operation: {ds.last_operation}")
    
    assert ds.last_result is not None
    assert ds.last_operation == "SUM"
    
    print("--- SUCCESS: Result persisted to Dataset model ---")

if __name__ == "__main__":
    verify_persistence()
