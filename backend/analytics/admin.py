from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    # Optimize layout and loading
    list_display = ('action', 'user', 'ip_address', 'severity', 'timestamp')
    list_filter = ('action', 'severity', 'timestamp')
    search_fields = ('user__email', 'ip_address', 'request_id')
    
    date_hierarchy = 'timestamp'
    
    # SCALABILITY OPTIMIZATIONS
    show_full_result_count = False
    list_per_page = 50
    
    # Immutability in UI
    def has_add_permission(self, request):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False
        
    def has_delete_permission(self, request, obj=None):
        return False
