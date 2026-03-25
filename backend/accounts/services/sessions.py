from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
import logging

logger = logging.getLogger(__name__)

def invalidate_all_user_sessions(user):
    """
    Forcibly log out a user entirely by blacklisting all their outstanding JWT refresh tokens.
    This effectively destroys all active sessions cross-device gracefully.
    """
    tokens = OutstandingToken.objects.filter(user=user)
    count = 0
    for token in tokens:
        _, created = BlacklistedToken.objects.get_or_create(token=token)
        if created:
            count += 1
            
    if count > 0:
        logger.warning(
            f"Invalidated {count} active sessions.", 
            extra={'user_id': user.id, 'action': 'SESSIONS_INVALIDATED'}
        )
    return count
