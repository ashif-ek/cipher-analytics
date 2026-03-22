from django.core.mail import send_mail
from django.conf import settings


def send_otp_email(email, otp_code):
    """
    Sends a 6-digit OTP code to the provided email address.
    """
    subject = "Your Cipher Analytics Verification Code"
    message = f"Welcome to Cipher Analytics.\n\nYour verification code is: {otp_code}\n\nThis code will expire in 5 minutes."
    from_email = settings.EMAIL_HOST_USER
    
    send_mail(
        subject,
        message,
        from_email,
        [email],
        fail_silently=False,
    )
