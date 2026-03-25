from rest_framework.throttling import SimpleRateThrottle
from core.utils.network import get_client_ip

class SecureIPRateThrottle(SimpleRateThrottle):
    """
    A secure rate throttle that uses hardened IP resolution logic, 
    preventing IP spoofing bypasses for rate limits.
    """
    scope = 'login_ip'

    def get_cache_key(self, request, view):
        ident = get_client_ip(request)
        if not ident:
            ident = 'none'
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
