from django.db import models
from django.conf import settings
from django.core.exceptions import PermissionDenied

class AuditLog(models.Model):
    class Action(models.TextChoices):
        LOGIN_SUCCESS = "LOGIN_SUCCESS", "Login Success"
        LOGIN_FAILED = "LOGIN_FAILED", "Login Failed"
        LOGOUT = "LOGOUT", "Logout"
        ACCOUNT_LOCKED = "ACCOUNT_LOCKED", "Account Locked"
        DATASET_UPLOAD = "DATASET_UPLOAD", "Dataset Uploaded"
        DATASET_PROCESS = "DATASET_PROCESS", "Dataset Processed"
        DATASET_DELETE = "DATASET_DELETE", "Dataset Deleted"

    class Severity(models.TextChoices):
        INFO = "INFO", "Info"
        WARNING = "WARNING", "Warning"
        CRITICAL = "CRITICAL", "Critical"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    action = models.CharField(max_length=50, choices=Action.choices, db_index=True)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.INFO)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    request_id = models.UUIDField(null=True, blank=True, db_index=True)
    metadata = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["user", "action", "timestamp"]),
        ]

    def __str__(self):
        return f"{self.action} at {self.timestamp}"

    def delete(self, *args, **kwargs):
        raise PermissionDenied("Audit logs are immutable and cannot be deleted.")

    def save(self, *args, **kwargs):
        if self.pk is not None:
            raise PermissionDenied("Audit logs are immutable and cannot be updated.")
        super().save(*args, **kwargs)
