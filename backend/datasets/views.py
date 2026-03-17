from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import DatasetUploadSerializer
from .models import Dataset
from .services import process_and_encrypt_dataset


class DatasetViewSet(viewsets.ModelViewSet):
    serializer_class = DatasetUploadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own datasets
        return Dataset.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        # Save the dataset with the current user
        dataset = serializer.save(user=self.request.user)
        
        # Trigger encryption process
        try:
            process_and_encrypt_dataset(dataset)
        except Exception as e:
            dataset.status = "failed"
            dataset.save()
            # We don't raise the exception here to allow the viewset to return 
            # the created object with the 'failed' status, or we could raise 
            # a ValidationError if we want to block the creation. 
            # Given the existing logic, we'll keep the failure status.
            raise e
       