from rest_framework import permissions
from django.utils import timezone
from .models import DatasetAccessGrant

class IsResearcher(permissions.BasePermission):
    """
    Allows access only to users with the RESEARCHER role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "RESEARCHER")


class HasActiveDatasetGrant(permissions.BasePermission):
    """
    Checks if the researcher has an active grant for the specific dataset.
    Expects dataset UUID in the URL kwargs as 'pk' or 'dataset_id'.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        dataset_id = view.kwargs.get('dataset_id') or view.kwargs.get('pk')
        if not dataset_id:
            return False

        # Check if an active grant exists
        has_grant = DatasetAccessGrant.objects.filter(
            researcher=request.user,
            dataset_id=dataset_id,
            is_active=True,
            expires_at__gt=timezone.now()
        ).exists()

        return has_grant
