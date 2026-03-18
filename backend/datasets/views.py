from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .serializers import DatasetUploadSerializer
from .models import Dataset
from .services import process_and_encrypt_dataset
from .permissions import IsDataOwner, IsResearcher, IsAdmin, CanAccessDataset


class DatasetViewSet(viewsets.ModelViewSet):
    serializer_class = DatasetUploadSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsDataOwner()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsDataOwner()]
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), CanAccessDataset()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff or user.role == "ADMIN":
            return Dataset.objects.all().order_by("-created_at")
            
        if user.role == "DATA_OWNER":
            return Dataset.objects.filter(owner=user).order_by("-created_at")
            
        if user.role == "RESEARCHER":
            return Dataset.objects.filter(is_shared_for_research=True).order_by("-created_at")
            
        return Dataset.objects.none()

    def perform_create(self, serializer):
        # Save the dataset with the current user as owner
        dataset = serializer.save(owner=self.request.user)
        
        # Trigger encryption process
        try:
            process_and_encrypt_dataset(dataset)
        except Exception as e:
            dataset.status = "failed"
            dataset.save()
            raise e
       