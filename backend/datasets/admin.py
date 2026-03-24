from django.contrib import admin
from .models import Dataset

@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "status", "access_level", "is_shared_for_research", "rows_count", "columns_count", "created_at"]
    list_filter = ["status", "access_level", "is_shared_for_research", "created_at"]
    search_fields = ["name", "owner__email", "owner__username"]
    readonly_fields = ["created_at"]
