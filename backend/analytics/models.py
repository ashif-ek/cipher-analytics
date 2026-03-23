from django.db import models
from django.contrib.auth import get_user_model
from datasets.models import Dataset

User = get_user_model()


class Computation(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Store encrypted or processed results
    result = models.JSONField() 
    
    is_aggregated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Computation for {self.dataset.name} by {self.owner.email}"

    class Meta:
        ordering = ["-created_at"]
