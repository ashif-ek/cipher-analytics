from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    # Override username to allow spaces and common chars
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[\w.@+\- ]+$",
                message="Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters and spaces.",
            ),
        ],
        error_messages={
            "unique": "A user with that username already exists.",
        },
    )
    email = models.EmailField(unique=True)
    profile_picture = models.FileField(
        upload_to="profile_pics/", null=True, blank=True
    )
    class Role(models.TextChoices):
        DATA_OWNER = "DATA_OWNER", "Data Owner"
        RESEARCHER = "RESEARCHER", "Researcher"
        ADMIN = "ADMIN", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.DATA_OWNER,
    )
    is_blocked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    class Meta:
        ordering = ["-created_at"]
