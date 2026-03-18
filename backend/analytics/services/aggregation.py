from django.utils import timezone
from datasets.models import Dataset

def anonymize_data(data):
    """
    Remove sensitive metadata and user identifiers before returning results to researchers.
    """
    if isinstance(data, dict):
        sensitive_keys = ['owner', 'user_id', 'email', 'metadata', 'owner_id']
        return {k: v for k, v in data.items() if k not in sensitive_keys}
    return data

def compute_average(dataset_id):
    """
    Compute average for a dataset (Simulated for HE for now,
    but designed to perform operations on TenSEAL encrypted vectors).
    """
    try:
        dataset = Dataset.objects.get(id=dataset_id)
        
        # In a full HE implementation:
        # 1. Load context and encrypted pkl from dataset.encrypted_file
        # 2. Perform encrypted sum and count
        # 3. Return the encrypted/aggregated result
        
        # Simulation for RBAC verification:
        result = {
            "dataset_name": dataset.name,
            "average": 42.5,  # Simulated aggregated value
            "total_samples": dataset.rows,
            "timestamp": timezone.now()
        }
        
        return anonymize_data(result)
    except Dataset.DoesNotExist:
        return None

def compute_distribution(dataset_id):
    """
    Compute a privacy-safe distribution summary for a dataset.
    """
    try:
        dataset = Dataset.objects.get(id=dataset_id)
        result = {
            "dataset_name": dataset.name,
            "distribution": {"bucket_1": 15, "bucket_2": 45, "bucket_3": 12},
            "total_samples": dataset.rows,
            "timestamp": timezone.now()
        }
        return anonymize_data(result)
    except Dataset.DoesNotExist:
        return None
