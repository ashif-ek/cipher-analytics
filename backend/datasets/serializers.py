from rest_framework import serializers
from .models import Dataset, ComputationJob
class DatasetUploadSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    
    class Meta:
        model = Dataset
        fields = [
            "id", "name", "original_file", "ciphertext_path", "public_key", "eval_keys", "schema_hash", 
            "status", "rows_count", "columns_count", "created_at", "updated_at", 
            "visibility", "compute_mode", "task_id", "error_message",
            "owner_id"
        ]
        read_only_fields = [
            "id", "status", "created_at", "updated_at", "task_id", "error_message", "owner_id"
        ]

    def validate_ciphertext_path(self, value):
        if not value:
            return value

        # 1. Size Validation (15MB)
        limit = 15 * 1024 * 1024
        if value.size > limit:
            raise serializers.ValidationError("File size exceeds 15MB limit.")
        
        # 2. Extension Validation
        import os
        valid_extensions = ['.csv', '.enc', '.shb']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"Unsupported file extension: {ext}. Only .csv, .enc, or .shb are allowed."
            )
        
        return value

class ComputationJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComputationJob
        fields = ['id', 'dataset', 'requested_by', 'operation', 'status', 'result_value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'requested_by', 'status', 'result_value', 'created_at', 'updated_at']