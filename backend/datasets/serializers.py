from rest_framework import serializers
from .models import Dataset, ComputationJob
class DatasetUploadSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    
    class Meta:
        model = Dataset
        fields = [
            "id", "name", "ciphertext_path", "public_key", "eval_keys", "schema_hash", 
            "status", "rows_count", "columns_count", "created_at", "updated_at", 
            "is_shared_for_research", "access_level", "task_id", "error_message",
            "owner_id"
        ]
        read_only_fields = [
            "id", "status", "created_at", "updated_at", "task_id", "error_message", "owner_id"
        ]

class ComputationJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComputationJob
        fields = ['id', 'dataset', 'requested_by', 'operation', 'status', 'result_value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'requested_by', 'status', 'result_value', 'created_at', 'updated_at']