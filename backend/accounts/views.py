from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.db import transaction

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User
from .services.otp import generate_otp, validate_otp
from .services.email import send_otp_email
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)

from analytics.models import AuditLog
from analytics.services.audit import log_audit_event
from core.middleware.traceability import get_current_request_id, get_current_ip


class LoginAPIView(TokenObtainPairView):
    """
    User / Admin login.
    Uses SimpleJWT with custom claims (is_staff, etc).
    """

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(email=request.data.get('email'))
            log_audit_event(
                user_id=user.id,
                action=AuditLog.Action.LOGIN_SUCCESS,
                severity=AuditLog.Severity.INFO,
                ip_address=get_current_ip(),
                request_id=get_current_request_id(),
                metadata={"user_agent": request.META.get('HTTP_USER_AGENT', 'unknown')}
            )
        return response


class RefreshAPIView(TokenRefreshView):
    permission_classes = [AllowAny]


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Client should delete tokens.
        Backend stays stateless (JWT best practice).
        """
        log_audit_event(
            user_id=request.user.id,
            action=AuditLog.Action.LOGOUT,
            severity=AuditLog.Severity.INFO,
            ip_address=get_current_ip(),
            request_id=get_current_request_id()
        )
        return Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK,
        )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)




class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        
        # Log Registration
        log_audit_event(
            user_id=user.id,
            action=AuditLog.Action.REGISTER,
            severity=AuditLog.Severity.INFO,
            ip_address=get_current_ip(),
            request_id=get_current_request_id(),
            metadata={"role": user.role}
        )
        
        # Generate OTP
        otp_code = generate_otp(user)
        
        # Send OTP Email
        send_otp_email(user.email, otp_code)

        user_serializer = UserSerializer(user, context={"request": request})

        return Response(
            {
                "message": "User registered successfully. Please verify your email.",
                "user": user_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")

        if not email or not otp_code:
            return Response({"detail": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified:
            return Response({"detail": "User is already verified."}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, error_msg = validate_otp(user, otp_code)

        if not is_valid:
            return Response({"detail": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.save()

        return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)


class ResendOTPAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified:
            return Response({"detail": "User is already verified."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate new OTP
        otp_code = generate_otp(user)
        
        # Send OTP Email
        send_otp_email(user.email, otp_code)

        return Response({"message": "A new OTP has been sent to your email."}, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def _is_authorized(request, user_id):
        return request.user.id == user_id or request.user.is_staff

    @staticmethod
    def _get_user(pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        """
        Users can view themselves.
        Admins can view anyone.
        """
        if not self._is_authorized(request, pk):
            return Response(
                {"detail": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = self._get_user(pk)
        if not user:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        if not self._is_authorized(request, pk):
            return Response(
                {"detail": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN,
            )
        user = self._get_user(pk)
        if not user:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
