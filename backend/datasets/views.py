from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import DatasetUploadSerializer
from .models import Dataset
from .services import process_and_encrypt_dataset


class DatasetUploadView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DatasetUploadSerializer(data=request.data)

        if serializer.is_valid():
            dataset = serializer.save(user=request.user)

            try:
                process_and_encrypt_dataset(dataset)
                return Response({
                    "message": "Dataset uploaded and encrypted",
                    "dataset_id": dataset.id
                    }, status=201)
            except Exception as e:
                dataset.status = "failed"
                dataset.save()
                return Response({
                    "error": f"Encryption failed: {str(e)}"
                }, status=500)

        return Response(serializer.errors, status=400)
       