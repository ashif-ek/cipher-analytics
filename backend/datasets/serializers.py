from rest_framework import serializers
from .models import Dataset
from .services.dataset_processing import validate_csv_file


class DatasetUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            "id", "name", "original_file", "status", "rows_count", 
            "columns_count", "created_at", "updated_at", "encrypted_file", 
            "is_shared_for_research", "access_level", "task_id", "error_message"
        ]
        read_only_fields = [
            "id", "status", "rows_count", "columns_count", 
            "created_at", "updated_at", "encrypted_file", "task_id", "error_message"
        ]

    def validate_original_file(self, value):
        validate_csv_file(value)
        return value