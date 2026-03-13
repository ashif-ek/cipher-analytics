from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Dataset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    original_file = models.FileField(upload_to="datasets/raw/")
    encrypted_file = models.FileField(upload_to="datasets/encrypted/", null=True, blank=True)

    rows = models.IntegerField(default=0)
    columns = models.IntegerField(default=0)

    status = models.CharField(
        max_length=50,
        choices=[
            ("uploaded", "Uploaded"),
            ("processing", "Processing"),
            ("encrypted", "Encrypted"),
        ],
        default="uploaded"
    )

    created_at = models.DateTimeField(auto_now_add=True)