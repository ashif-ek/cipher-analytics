from django.contrib import admin
from .models import Dataset

@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "status", "visibility", "access_policy", "rows_count", "columns_count", "created_at"]
    list_filter = ["status", "visibility", "access_policy", "created_at"]
    search_fields = ["name", "owner__email", "owner__username"]
    readonly_fields = ["created_at"]
