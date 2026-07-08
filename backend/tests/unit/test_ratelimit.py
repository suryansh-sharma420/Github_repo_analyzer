import pytest
from fastapi import HTTPException

from ratelimit import SlidingWindowRateLimiter


def test_allows_up_to_limit():
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
    for _ in range(3):
        limiter.check("client-a")  # should not raise


def test_blocks_over_limit():
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
    for _ in range(3):
        limiter.check("client-a")
    with pytest.raises(HTTPException) as exc:
        limiter.check("client-a")
    assert exc.value.status_code == 429
    assert "Retry-After" in exc.value.headers


def test_limits_are_per_client():
    limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=60)
    limiter.check("client-a")
    limiter.check("client-b")  # different key, still allowed
    with pytest.raises(HTTPException):
        limiter.check("client-a")


def test_zero_disables_limiting():
    limiter = SlidingWindowRateLimiter(max_requests=0)
    for _ in range(100):
        limiter.check("client-a")  # never raises when disabled
