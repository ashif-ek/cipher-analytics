from rest_framework import serializers
from .models import Dataset


class DatasetUploadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dataset
        fields = ["id", "name", "original_file", "status", "rows", "columns", "created_at", "encrypted_file"]
        read_only_fields = ["status", "rows", "columns", "created_at", "encrypted_file"]