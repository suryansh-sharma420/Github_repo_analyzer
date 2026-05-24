import pytest
from utils import parse_github_url


def test_parse_github_url_valid():
    """Test parsing valid GitHub URLs."""
    owner, repo = parse_github_url("https://github.com/facebook/react")
    assert owner == "facebook"
    assert repo == "react"


def test_parse_github_url_trailing_slash():
    """Test parsing GitHub URL with trailing slash."""
    owner, repo = parse_github_url("https://github.com/facebook/react/")
    assert owner == "facebook"
    assert repo == "react"


def test_parse_github_url_no_https():
    with pytest.raises(ValueError):
        parse_github_url("github.com/facebook/react")


def test_parse_github_url_invalid():
    """Test parsing invalid URL raises ValueError."""
    with pytest.raises(ValueError, match="Invalid GitHub URL format"):
        parse_github_url("not-a-url")


def test_parse_github_url_missing_repo():
    """Test parsing URL with missing repo raises ValueError."""
    with pytest.raises(ValueError, match="Invalid GitHub URL format"):
        parse_github_url("https://github.com/onlyone")
