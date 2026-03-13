from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Dataset(models.Model):

    STATUS_CHOICES = [
        ("uploaded", "Uploaded"),
        ("processing", "Processing"),
        ("encrypted", "Encrypted"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=255)

    original_file = models.FileField(upload_to="datasets/raw/")

    encrypted_file = models.FileField(
        upload_to="datasets/encrypted/",
        null=True,
        blank=True
    )

    rows = models.IntegerField(default=0)
    columns = models.IntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="uploaded"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name