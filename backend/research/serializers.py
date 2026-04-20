from rest_framework import serializers
from .models import DatasetAccessRequest, DatasetAccessGrant, ResearchQueryLog, ExportLog
from datasets.models import Dataset
from django.contrib.auth import get_user_model

User = get_user_model()

class DatasetBasicSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    
    class Meta:
        model = Dataset
        fields = ['id', 'name', 'rows_count', 'columns_count', 'owner_email', 'status', 'visibility', 'compute_mode', 'created_at']

class DatasetAccessRequestSerializer(serializers.ModelSerializer):
    dataset_details = DatasetBasicSerializer(source='dataset', read_only=True)
    researcher_email = serializers.EmailField(source='researcher.email', read_only=True)
    
    class Meta:
        model = DatasetAccessRequest
        fields = ['id', 'dataset', 'dataset_details', 'researcher_email', 'status', 'reason', 'created_at']
        read_only_fields = ['status', 'created_at', 'researcher_email']

class DatasetAccessGrantSerializer(serializers.ModelSerializer):
    dataset_details = DatasetBasicSerializer(source='dataset', read_only=True)
    
    class Meta:
        model = DatasetAccessGrant
        fields = ['id', 'dataset', 'dataset_details', 'expires_at', 'permissions', 'is_active', 'created_at']

class ResearchQueryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchQueryLog
        fields = ['id', 'dataset', 'query_type', 'parameters', 'execution_time_ms', 'created_at']

class ExportLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportLog
        fields = ['id', 'dataset', 'format', 'file_url', 'created_at']
