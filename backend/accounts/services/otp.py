from datetime import timedelta
from django.utils.crypto import get_random_string
from django.utils import timezone
from ..models import OTP


def generate_otp(user):
    """
    Invalidates any existing unused OTPs for the user,
    generates a new 6-digit OTP, saves it, and returns the code string.
    """
    # Invalidate old OTPs
    OTP.objects.filter(user=user, is_used=False).update(is_used=True)
    
    # Generate new OTP
    otp_code = get_random_string(length=6, allowed_chars='0123456789')
    
    # Save new OTP
    OTP.objects.create(user=user, otp=otp_code)
    
    return otp_code


def validate_otp(user, otp_code):
    """
    Validates a given OTP for a user.
    Checks if it matches, is unused, and is within the 5 minute expiry window.
    Returns (is_valid: bool, error_message: str|None).
    """
    try:
        otp_record = OTP.objects.get(user=user, otp=otp_code, is_used=False)
    except OTP.DoesNotExist:
        return False, "Invalid or expired OTP."
        
    expiry_time = otp_record.created_at + timedelta(minutes=5)
    
    if timezone.now() > expiry_time:
        otp_record.is_used = True
        otp_record.save()
        return False, "OTP has expired."
        
    return True, None
