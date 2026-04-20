import datetime
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Profile
from .services.security import check_and_unlock_user, record_failed_login, reset_failed_login
from rest_framework.exceptions import AuthenticationFailed


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["bio", "organization", "job_title", "location", "phone_number", "website", "specialization", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile_picture", "is_staff", "role", "profile"]
        read_only_fields = ["id", "is_staff"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        
        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        if profile_data:
            profile, created = Profile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "role"]

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            role=validated_data.get("role", User.Role.DATA_OWNER),
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    remember_me = serializers.BooleanField(required=False, default=False)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["user_id"] = user.id
        token["username"] = user.username
        token["email"] = user.email
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser
        token["role"] = user.role

        return token

    def validate(self, attrs):
        email = attrs.get(self.username_field)
        remember_me = attrs.get('remember_me', False)
        
        # Pre-authenticate Lock Check
        if email:
            try:
                user_check = User.objects.get(email=email)
                if check_and_unlock_user(user_check):
                    raise AuthenticationFailed("Account is temporarily locked due to multiple failed login attempts.")
            except User.DoesNotExist:
                pass
                
        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            # Post-authenticate Failure Recording
            if email:
                try:
                    user_failed = User.objects.get(email=email)
                    record_failed_login(user_failed.id)
                except User.DoesNotExist:
                    pass
            raise

        # Login Succeeded
        reset_failed_login(self.user.id)
        
        if not self.user.is_verified:
            raise serializers.ValidationError({"detail": "Verify your email first"})
        
        # Dynamic Token Lifetime for "Remember Me"
        if remember_me:
            data['refresh'].set_exp(lifetime=datetime.timedelta(days=30))
            data['access'].set_exp(lifetime=datetime.timedelta(days=1))  # Keep access token at 1 day
            
        data["user"] = UserSerializer(
            self.user,
            context={"request": self.context.get("request")},
        ).data

        return data
