from rest_framework import serializers
from .models import Dataset, ComputationJob
class DatasetUploadSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    computations = serializers.SerializerMethodField()
    has_access = serializers.SerializerMethodField()
    pending_request = serializers.SerializerMethodField()
    
    class Meta:
        model = Dataset
        fields = [
            "id", "name", "original_file", "ciphertext_path", "public_key", "eval_keys", "schema_hash", 
            "status", "rows_count", "columns_count", "created_at", "updated_at", 
            "visibility", "compute_mode", "task_id", "error_message",
            "owner_id", "last_result", "last_operation", "computations",
            "has_access", "pending_request"
        ]
        read_only_fields = [
            "id", "status", "created_at", "updated_at", "task_id", "error_message", 
            "owner_id", "last_result", "last_operation", "computations",
            "has_access", "pending_request"
        ]

    def get_has_access(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        # Data owners and Admins always have full access
        if obj.owner_id == user.id or user.role == 'ADMIN' or user.is_staff:
            return True
        
        # 1. Check Whitelist (Internal DatasetAccess)
        from .models import DatasetAccess
        if DatasetAccess.objects.filter(
            dataset=obj, 
            user=user, 
            permission__in=['COMPUTE', 'ANALYZE', 'FULL']
        ).exists():
            return True

        # 2. Check Research Grants (External research.DatasetAccessGrant)
        from research.models import DatasetAccessGrant
        from django.utils import timezone
        if DatasetAccessGrant.objects.filter(
            researcher=user,
            dataset=obj,
            is_active=True,
            expires_at__gt=timezone.now()
        ).exists():
            return True
        
        # 3. Aggregated mode always allows limited compute by default
        if obj.compute_mode == 'AGGREGATED':
            return True
            
        return False

    def get_pending_request(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated or user.role != 'RESEARCHER':
            return False
        
        from research.models import DatasetAccessRequest
        return DatasetAccessRequest.objects.filter(
            researcher=user,
            dataset=obj,
            status='PENDING'
        ).exists()

    def get_computations(self, obj):
        # Return the last 10 completed jobs for this dataset
        jobs = obj.computationjob_set.filter(status="COMPLETED").order_by("-created_at")[:10]
        return ComputationJobSerializer(jobs, many=True).data

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
        fields = ['id', 'dataset', 'requested_by', 'operation', 'status', 'result_value', 'result_json', 'created_at', 'updated_at']
        read_only_fields = ['id', 'requested_by', 'status', 'result_value', 'result_json', 'created_at', 'updated_at']