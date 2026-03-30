import uuid
from django.db import models
from django.contrib.auth import get_user_model
from datasets.models import Dataset

User = get_user_model()

class DatasetAccessRequest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("REVOKED", "Revoked"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    researcher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="access_requests")
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="access_requests")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    reason = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'researcher']),
        ]

    def __str__(self):
        return f"{self.researcher.email} - {self.dataset.name} - {self.status}"


class DatasetAccessGrant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.OneToOneField(DatasetAccessRequest, on_delete=models.CASCADE, related_name="grant")
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="grants")
    researcher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="granted_datasets")
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="grants_issued")
    expires_at = models.DateTimeField()
    permissions = models.JSONField(default=list)  # e.g., ["read_aggregates", "export"]
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['expires_at', 'is_active']),
        ]

    def __str__(self):
        return f"Grant: {self.researcher.email} -> {self.dataset.name}"


class ResearchQueryLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    researcher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="query_logs")
    dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, related_name="query_logs")
    query_type = models.CharField(max_length=50) # e.g. AGGREGATION, SUMMARY
    parameters = models.JSONField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    execution_time_ms = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        # Handle cases where user was deleted
        researcher_email = self.researcher.email if self.researcher else "Unknown"
        return f"Log: {researcher_email} - {self.query_type}"


class ExportLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    researcher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="export_logs")
    dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, related_name="export_logs")
    format = models.CharField(max_length=10) # CSV, PDF
    file_url = models.URLField(max_length=500, blank=True, null=True)
    watermark_id = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        researcher_email = self.researcher.email if self.researcher else "Unknown"
        return f"Export: {researcher_email} - {self.format}"
