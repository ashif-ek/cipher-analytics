from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Dataset(models.Model):

    STATUS_CHOICES = [
        ("UPLOADING", "Uploading"),
        ("PROCESSING", "Processing"),
        ("READY", "Ready"),
        ("FAILED", "Failed"),
    ]

    class Visibility(models.TextChoices):
        PRIVATE = "PRIVATE", "Private"
        DISCOVERABLE = "DISCOVERABLE", "Discoverable"

    class ComputeMode(models.TextChoices):
        STRICT = "STRICT", "Strict"
        WHITELIST = "WHITELIST", "Whitelist"
        AGGREGATED = "AGGREGATED", "Aggregated"

    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=255)

    # Zero-Trust Storage
    original_file = models.FileField(upload_to="datasets/raw/", null=True, blank=True)
    ciphertext_path = models.FileField(upload_to="datasets/ciphertexts/", null=True, blank=True)
    public_key = models.BinaryField(null=True, blank=True) # B64 Encoded SEAL context
    eval_keys = models.BinaryField(null=True, blank=True)  # Relin/Galois keys required for backend arithmetic
    schema_hash = models.CharField(max_length=256, null=True, blank=True) # Pre-hashed column metadata

    # Storage Integrity Validation
    content_hash = models.CharField(max_length=256, null=True, blank=True)
    file_size_bytes = models.BigIntegerField(default=0)
    upload_completed = models.BooleanField(default=False)


    rows_count = models.IntegerField(default=0)
    columns_count = models.IntegerField(default=0)

    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE
    )

    compute_mode = models.CharField(
        max_length=20,
        choices=ComputeMode.choices,
        default=ComputeMode.STRICT
    )

    column_stats = models.JSONField(default=dict, blank=True)
    column_stats_verified = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="UPLOADING"
    )

    embedding_status = models.CharField(
        max_length=20,
        default="NOT_STARTED", # NOT_STARTED, PENDING, RUNNING, COMPLETED, FAILED
    )

    task_id = models.CharField(max_length=255, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    ingestion_report = models.JSONField(default=dict, blank=True)

    # Persistence of Latest Insight
    last_result = models.FloatField(null=True, blank=True)
    last_operation = models.CharField(max_length=50, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class DatasetAccess(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission = models.CharField(max_length=50) # 'VIEW', 'ANALYZE'

    class Meta:
        unique_together = ('dataset', 'user')

    def __str__(self):
        return f"{self.user} -> {self.dataset} ({self.permission})"

class ComputationJob(models.Model):
    STATE_CHOICES = [
        ("PENDING", "Pending"),
        ("QUEUED", "Queued"),
        ("RUNNING", "Running"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
        ("RETRYING", "Retrying"),
        ("CANCELLED", "Cancelled"),
    ]

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    operation = models.CharField(max_length=50) # 'MEAN', 'SUM', 'VARIANCE'
    status = models.CharField(max_length=50, choices=STATE_CHOICES, default="PENDING")
    
    # Strict Idempotency Hash: SHA256(dataset_hash + operation + params)
    task_hash = models.CharField(max_length=256, unique=True, null=True, blank=True)
    
    result_path = models.FileField(upload_to="computations/results/", null=True, blank=True)
    result_value = models.FloatField(null=True, blank=True) # Summary result for quick display
    result_json = models.JSONField(null=True, blank=True) # Structured JSON result for ML insights
    diagnostics = models.JSONField(default=dict, blank=True) # Stage-level tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.id} ({self.operation}) - {self.status}"