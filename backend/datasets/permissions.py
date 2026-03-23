from rest_framework import permissions

class IsDataOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DATA_OWNER'

class IsResearcher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'RESEARCHER'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_staff or request.user.role == 'ADMIN':
            return True
        # Check if the object has an 'owner' attribute
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        # Check if the object has a 'user' attribute (fallback for old models)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False

class CanAccessDataset(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
            
        # Admin has full access
        if user.is_staff or user.role == 'ADMIN':
            return True
            
        # Data Owner can access their own datasets
        if user.role == 'DATA_OWNER':
            return obj.owner == user
            
        # Researcher can only access shared datasets
        if user.role == 'RESEARCHER':
            return obj.is_shared_for_research
            
        return False

class CanAccessComputation(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
            
        # Admin has full access
        if user.is_staff or user.role == 'ADMIN':
            return True
            
        # Data Owner can access their own computations
        if user.role == 'DATA_OWNER':
            return obj.owner == user
            
        # Researcher can ONLY access aggregated results
        if user.role == 'RESEARCHER':
            return obj.is_aggregated
            
        return False
