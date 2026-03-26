from rest_framework import serializers
from .models import Computation, AuditLog

class ComputationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Computation
        fields = ["id", "dataset", "owner", "result", "is_aggregated", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            "id", "user", "user_email", "action", "severity", 
            "ip_address", "request_id", "metadata", "timestamp"
        ]

class AggregatedAnalyticsSerializer(serializers.Serializer):
    # This serializer is for the safe, anonymized summaries
    dataset_name = serializers.CharField()
    average = serializers.FloatField(required=False)
    distribution = serializers.DictField(required=False)
    total_samples = serializers.IntegerField()
    timestamp = serializers.DateTimeField()
