from rest_framework import serializers
from .models import Computation

class ComputationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Computation
        fields = ["id", "dataset", "owner", "result", "is_aggregated", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]

class AggregatedAnalyticsSerializer(serializers.Serializer):
    # This serializer is for the safe, anonymized summaries
    dataset_name = serializers.CharField()
    average = serializers.FloatField(required=False)
    distribution = serializers.DictField(required=False)
    total_samples = serializers.IntegerField()
    timestamp = serializers.DateTimeField()
