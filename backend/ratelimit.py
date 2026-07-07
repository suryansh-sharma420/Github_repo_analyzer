"""Lightweight in-process rate limiting.

The backend is directly exposed on :8000 (not only behind the nginx proxy), so
rate limiting is enforced in the application itself rather than relying solely
on the edge. A simple thread-safe sliding-window counter keyed by client IP is
enough to blunt request-amplification / token-quota-exhaustion abuse against the
expensive `/analyze` fan-out.
"""

import threading
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request


class SlidingWindowRateLimiter:
    """Fixed-capacity sliding-window limiter, keyed by an arbitrary string."""

    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> None:
        """Record a hit for ``key``; raise HTTP 429 if the window is full."""
        if self.max_requests <= 0:
            return

        now = time.monotonic()
        cutoff = now - self.window_seconds
        with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= cutoff:
                hits.popleft()

            if len(hits) >= self.max_requests:
                retry_after = max(int(hits[0] + self.window_seconds - now) + 1, 1)
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please slow down and try again shortly.",
                    headers={"Retry-After": str(retry_after)},
                )

            hits.append(now)


def client_key(request: Request) -> str:
    """Best-effort client identity for rate limiting.

    Honors the first hop in ``X-Forwarded-For`` (set by the nginx proxy) and
    falls back to the direct peer address.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"
