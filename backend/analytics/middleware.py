from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class SessionMonitoringMiddleware:
    """
    Middleware to update the user's last_activity timestamp.
    This enables tracking 'Active Time' and 'Live Sessions'.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Update last_activity. 
            # Note: In a high-traffic app, you might want to throttle this update 
            # (e.g. only once every 1-5 minutes) to avoid heavy DB writes.
            # For this MVP, we update on every request for precision.
            User.objects.filter(pk=request.user.pk).update(last_activity=timezone.now())
            
        response = self.get_response(request)
        return response
