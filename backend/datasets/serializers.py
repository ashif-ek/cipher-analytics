from rest_framework import serializers
from .models import Dataset


class DatasetUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            "id", "name", "original_file", "status", "rows", 
            "columns", "created_at", "encrypted_file", 
            "is_shared_for_research", "access_level"
        ]
        read_only_fields = ["id", "status", "rows", "columns", "created_at", "encrypted_file"]