from django.conf import settings

def get_client_ip(request):
    """
    Securely extract the client IP address considering proxy configurations.
    Enforces trust boundaries so X-Forwarded-For cannot be spoofed by direct clients.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    remote_addr = request.META.get('REMOTE_ADDR', '')

    if x_forwarded_for:
        ips = [ip.strip() for ip in x_forwarded_for.split(',')]
        trusted_proxies = getattr(settings, 'TRUSTED_PROXIES', ['127.0.0.1'])
        
        # If the direct connection is from a trusted proxy, we accept X-Forwarded-For
        if remote_addr in trusted_proxies:
            return ips[0]
        else:
            # Direct connection is trying to spoof IP; ignore X-Forwarded-For
            return remote_addr
            
    return remote_addr
