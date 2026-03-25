from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .serializers import DatasetUploadSerializer
from .models import Dataset
from .permissions import IsDataOwner, CanAccessDataset


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
        # Save the dataset with the current user as owner and status PROCESSING
        dataset = serializer.save(owner=self.request.user, status="PROCESSING")
        
        # Trigger encryption process asynchronously
        from .tasks import process_and_encrypt_dataset_task
        process_and_encrypt_dataset_task.delay(dataset.id)
    @action(detail=True, methods=['post'])
    def compute(self, request, pk=None):
        dataset = self.get_object()
        if dataset.status != "READY":
            return Response({"detail": "Dataset is not ready for computation."}, status=status.HTTP_400_BAD_REQUEST)
        
        operation = request.data.get("operation", "sum")
        if operation not in ["sum", "mean"]:
            return Response({"detail": "Invalid operation."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from .services.dataset_processing import compute_encrypted_aggregation
            result = compute_encrypted_aggregation(dataset, operation=operation)
            return Response(result)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
       