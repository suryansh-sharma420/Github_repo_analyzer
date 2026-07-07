import pytest
from utils import parse_github_url, build_repo_url


def test_parse_github_url_valid():
    """Test parsing valid GitHub URLs."""
    owner, repo = parse_github_url("https://github.com/facebook/react")
    assert owner == "facebook"
    assert repo == "react"


def test_parse_github_url_strips_git_suffix():
    """A trailing .git (clone URL form) is stripped from the repo name."""
    owner, repo = parse_github_url("https://github.com/facebook/react.git")
    assert owner == "facebook"
    assert repo == "react"


@pytest.mark.parametrize(
    "url",
    [
        "https://github.com/torvalds/linux?per_page=99999",  # query injection
        "https://github.com/torvalds/linux#frag",  # fragment injection
        "https://github.com/torvalds/linux/../../etc",  # path traversal
        "https://github.com/torvalds/linux/pulls",  # extra path segment
        "https://github.com/../secrets",  # traversal in owner
        "https://github.com/owner/..",  # dot-dot repo
        "https://evil.com/facebook/react",  # wrong host
        "https://github.com.evil.com/a/b",  # host suffix trick
        "https://github.com/owner/repo with space",
    ],
)
def test_parse_github_url_rejects_malicious(url):
    """Under-constrained input that used to slip through must be rejected."""
    with pytest.raises(ValueError):
        parse_github_url(url)


def test_build_repo_url_is_canonical():
    """The cache key is derived from validated owner/repo, not the raw input."""
    owner, repo = parse_github_url("https://github.com/facebook/react/")
    assert build_repo_url(owner, repo) == "https://github.com/facebook/react"


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
