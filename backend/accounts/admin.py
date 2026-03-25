from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import User, OTP
from .services.security import reset_failed_login


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ["email", "username", "role", "is_verified", "is_staff", "is_active", "is_blocked", "is_locked"]
    list_filter = ["role", "is_verified", "is_staff", "is_active", "is_blocked", "is_locked"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("username", "role", "is_verified", "is_blocked", "profile_picture")}),
        ("Security State", {"fields": ("is_locked", "failed_login_attempts", "locked_until", "last_activity")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_staff",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )
    search_fields = ["email", "username"]
    ordering = ["email"]
    actions = ["unlock_users"]

    @admin.action(description="Unlock selected users")
    def unlock_users(self, request, queryset):
        count = 0
        for user in queryset:
            if user.is_locked or user.failed_login_attempts > 0:
                reset_failed_login(user.id)
                count += 1
        self.message_user(request, f"Successfully unlocked {count} users.")


admin.site.register(User, CustomUserAdmin)

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ["user", "otp", "is_used", "created_at"]
    list_filter = ["is_used", "created_at"]
    search_fields = ["user__email"]
