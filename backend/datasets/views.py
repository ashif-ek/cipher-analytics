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

            process_and_encrypt_dataset(dataset)

            return Response({
                "message": "Dataset uploaded and encrypted",
                "dataset_id": dataset.id
            })

        return Response(serializer.errors)