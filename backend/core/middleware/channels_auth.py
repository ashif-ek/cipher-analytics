from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
import urllib.parse

@database_sync_to_async
def get_user_from_token(token_key):
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import AnonymousUser
    User = get_user_model()
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"WebSocket Auth Error: {e}")
        return AnonymousUser()

class JwtAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser
        query_string = scope.get("query_string", b"").decode()
        query_params = urllib.parse.parse_qs(query_string)
        token = query_params.get("token")

        if token:
            scope["user"] = await get_user_from_token(token[0])
        else:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
