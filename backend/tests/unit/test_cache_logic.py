import pytest
from datetime import datetime, timedelta
from utils import is_cache_valid


def test_cache_valid_recent():
    """Test cache is valid for recent data (30 minutes ago)."""
    fetched_at = (datetime.now() - timedelta(minutes=30)).isoformat()
    assert is_cache_valid(fetched_at, ttl_hours=1) is True


def test_cache_valid_expired():
    """Test cache is invalid for old data (90 minutes ago with TTL=1hr)."""
    fetched_at = (datetime.now() - timedelta(minutes=90)).isoformat()
    assert is_cache_valid(fetched_at, ttl_hours=1) is False


def test_cache_valid_invalid_format():
    """Test cache is invalid for malformed timestamp."""
    assert is_cache_valid("not-a-valid-timestamp", ttl_hours=1) is False


def test_cache_valid_empty_string():
    """Test cache is invalid for empty string."""
    assert is_cache_valid("", ttl_hours=1) is False


def test_cache_valid_none():
    """Test cache is invalid for None."""
    assert is_cache_valid(None, ttl_hours=1) is False


def test_cache_valid_exactly_ttl():
    """Test cache is invalid when exactly at TTL boundary."""
    fetched_at = (datetime.now() - timedelta(hours=1)).isoformat()
    assert is_cache_valid(fetched_at, ttl_hours=1) is False
