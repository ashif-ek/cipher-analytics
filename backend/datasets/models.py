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

    class AccessLevel(models.TextChoices):
        PRIVATE = "PRIVATE", "Private"
        SHARED = "SHARED", "Shared"
        COLLABORATIVE = "COLLABORATIVE", "Collaborative"
        AGGREGATED = "AGGREGATED", "Aggregated"
        PUBLIC = "PUBLIC", "Public"

    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=255)

    # Zero-Trust Storage
    ciphertext_path = models.FileField(upload_to="datasets/ciphertexts/", null=True, blank=True)
    public_key = models.BinaryField(null=True, blank=True) # B64 Encoded SEAL context
    eval_keys = models.BinaryField(null=True, blank=True)  # Relin/Galois keys required for backend arithmetic
    schema_hash = models.CharField(max_length=256, null=True, blank=True) # Pre-hashed column metadata


    rows_count = models.IntegerField(default=0)
    columns_count = models.IntegerField(default=0)

    is_shared_for_research = models.BooleanField(default=False)
    access_level = models.CharField(
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.PRIVATE
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="UPLOADING"
    )

    task_id = models.CharField(max_length=255, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

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
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    operation = models.CharField(max_length=50) # 'MEAN', 'SUM', 'VARIANCE'
    status = models.CharField(max_length=50, choices=[("PENDING", "Pending"), ("RUNNING", "Running"), ("COMPLETED", "Completed")], default="PENDING")
    result_path = models.FileField(upload_to="computations/results/", null=True, blank=True)
    result_value = models.FloatField(null=True, blank=True) # Summary result for quick display
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.id} ({self.operation}) - {self.status}"