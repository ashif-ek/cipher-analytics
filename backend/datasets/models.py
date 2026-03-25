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
        AGGREGATED = "AGGREGATED", "Aggregated"

    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=255)

    original_file = models.FileField(upload_to="datasets/raw/")

    encrypted_file = models.FileField(
        upload_to="datasets/encrypted/",
        null=True,
        blank=True
    )

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