import logging
from django.core.cache import cache
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class RedisLock:
    """
    Simple Redis-based distributed lock using Django's cache framework.
    """
    
    def __init__(self, lock_name, timeout=600):
        self.lock_name = f"lock:{lock_name}"
        self.timeout = timeout

    @contextmanager
    def acquire(self):
        # set with 'nx' (only if not exists)
        # In Django cache (Redis backend), .add() is equivalent to SET NX
        acquired = cache.add(self.lock_name, "LOCKED", self.timeout)
        
        if acquired:
            logger.info(f"Lock acquired: {self.lock_name}")
            try:
                yield True
            finally:
                cache.delete(self.lock_name)
                logger.info(f"Lock released: {self.lock_name}")
        else:
            logger.warning(f"Failed to acquire lock: {self.lock_name}")
            yield False
