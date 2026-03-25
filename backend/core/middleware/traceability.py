import uuid
import threading

# Thread-local storage for request_id to access it anywhere without passing context
_local = threading.local()

def get_current_request_id():
    return getattr(_local, 'request_id', None)

def get_current_ip():
    return getattr(_local, 'ip_address', None)

class TraceabilityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from core.utils.network import get_client_ip
        request_id = str(uuid.uuid4())
        request.request_id = request_id
        
        _local.request_id = request_id
        _local.ip_address = get_client_ip(request)
        
        response = self.get_response(request)
        
        # Inject back into response headers for client tracking
        response['X-Request-Id'] = request_id
        
        # Cleanup
        _local.request_id = None
        _local.ip_address = None
        
        return response
