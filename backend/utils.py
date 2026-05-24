import re
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from fastapi import HTTPException


def parse_github_url(url: str) -> Tuple[str, str]:
    """Parse owner and repo from GitHub URL.
    
    Args:
        url: GitHub repository URL
        
    Returns:
        Tuple of (owner, repo)
        
    Raises:
        ValueError: If URL format is invalid
    """
    pattern = r"https://github\.com/([^/]+)/([^/]+)"
    match = re.match(pattern, url)
    if not match:
        raise ValueError("Invalid GitHub URL format")
    owner, repo = match.groups()
    return owner, repo


def is_cache_valid(fetched_at_str: str, ttl_hours: int) -> bool:
    """Check if cached data is still valid based on TTL.
    
    Args:
        fetched_at_str: ISO format timestamp string
        ttl_hours: Time-to-live in hours
        
    Returns:
        True if cache is valid, False otherwise
    """
    try:
        fetched_datetime = datetime.fromisoformat(fetched_at_str)
        return datetime.now() - fetched_datetime < timedelta(hours=ttl_hours)
    except (ValueError, TypeError):
        return False


def shape_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Shape repository metadata to required format.
    
    Args:
        metadata: Raw metadata from GitHub API
        
    Returns:
        Shaped metadata dictionary
    """
    return {
        "name": metadata.get("name"),
        "description": metadata.get("description"),
        "language": metadata.get("language"),
        "stars": metadata.get("stargazers_count"),
        "forks": metadata.get("forks_count"),
        "open_issues": metadata.get("open_issues_count"),
        "created_at": metadata.get("created_at"),
        "last_push": metadata.get("pushed_at"),
        "topics": metadata.get("topics", []),
        "homepage": metadata.get("homepage"),
        "license": metadata.get("license", {}).get("name") if metadata.get("license") else None
    }


def shape_contributors(contributors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Shape contributors list to required format.
    
    Args:
        contributors: Raw contributors list from GitHub API
        
    Returns:
        Shaped contributors list
    """
    return [
        {
            "username": c.get("login"),
            "avatar": c.get("avatar_url"),
            "profile_url": c.get("html_url"),
            "contributions": c.get("contributions")
        }
        for c in contributors
    ]


def shape_commit_activity(activity: List[Dict[str, Any]], weeks: int = 12) -> List[Dict[str, Any]]:
    """Shape and slice commit activity to last N weeks.
    
    Args:
        activity: Raw commit activity from GitHub API
        weeks: Number of weeks to include (default 12)
        
    Returns:
        Sliced commit activity list
    """
    if not activity:
        return []
    return activity[-weeks:]
