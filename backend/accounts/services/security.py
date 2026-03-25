from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
import logging

logger = logging.getLogger(__name__)

MAX_FAILED_ATTEMPTS = 5
LOCK_DURATION_MINUTES = 15

def record_failed_login(user_id):
    """
    Thread-safe function to record a failed login attempt.
    Locks the user row until the transaction completes.
    """
    with transaction.atomic():
        try:
            # We must use select_for_update to prevent race conditions during high concurrency
            user = User.objects.select_for_update().get(id=user_id)
            
            user.failed_login_attempts += 1
            
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS and not user.is_locked:
                user.is_locked = True
                user.locked_until = timezone.now() + timedelta(minutes=LOCK_DURATION_MINUTES)
                logger.warning("Account locked due to consecutive failed attempts.", extra={'user_id': user_id, 'action': 'ACCOUNT_LOCKED'})
                
                # Invalidate all existing sessions securely
                from .sessions import invalidate_all_user_sessions
                invalidate_all_user_sessions(user)
                
            user.save(update_fields=['failed_login_attempts', 'is_locked', 'locked_until'])
            return user
        except User.DoesNotExist:
            return None

def reset_failed_login(user_id):
    """
    Thread-safe reset of login attempts upon successful login.
    """
    with transaction.atomic():
        try:
            user = User.objects.select_for_update().get(id=user_id)
            if user.failed_login_attempts > 0 or user.is_locked:
                user.failed_login_attempts = 0
                user.is_locked = False
                user.locked_until = None
                user.save(update_fields=['failed_login_attempts', 'is_locked', 'locked_until'])
            return user
        except User.DoesNotExist:
            return None

def check_and_unlock_user(user):
    """
    Checks if a user is currently locked. Auto-unlocks if duration expires.
    """
    if not user.is_locked:
        return False
        
    if user.locked_until and user.locked_until <= timezone.now():
        # Lock expired, reset safely
        return not (reset_failed_login(user.id) is not None)
        
    return True
