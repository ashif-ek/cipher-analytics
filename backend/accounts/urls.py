from django.urls import path
from .views import (
    VerifyOTPAPIView,
    ResendOTPAPIView,
    LoginAPIView,
    RefreshAPIView,
    RegisterAPIView,
    LogoutAPIView,
    MeAPIView,
    UserDetailView,
)

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="login"),
    path("refresh/", RefreshAPIView.as_view(), name="token_refresh"),
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPAPIView.as_view(), name="verify_otp"),
    path("resend-otp/", ResendOTPAPIView.as_view(), name="resend_otp"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("me/", MeAPIView.as_view(), name="me"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
]
