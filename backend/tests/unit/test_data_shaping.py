import pytest
from utils import shape_metadata, shape_contributors, shape_commit_activity


def test_shape_metadata_complete():
    """Test shaping complete metadata response."""
    raw_metadata = {
        "name": "react",
        "description": "A JavaScript library for building user interfaces",
        "language": "JavaScript",
        "stargazers_count": 200000,
        "forks_count": 40000,
        "open_issues_count": 1000,
        "created_at": "2013-05-24T16:15:00Z",
        "pushed_at": "2024-01-15T10:30:00Z",
        "topics": ["javascript", "library", "ui"],
        "homepage": "https://react.dev",
        "license": {"name": "MIT"}
    }
    
    shaped = shape_metadata(raw_metadata)
    
    assert shaped["name"] == "react"
    assert shaped["description"] == "A JavaScript library for building user interfaces"
    assert shaped["language"] == "JavaScript"
    assert shaped["stars"] == 200000
    assert shaped["forks"] == 40000
    assert shaped["open_issues"] == 1000
    assert shaped["created_at"] == "2013-05-24T16:15:00Z"
    assert shaped["last_push"] == "2024-01-15T10:30:00Z"
    assert shaped["topics"] == ["javascript", "library", "ui"]
    assert shaped["homepage"] == "https://react.dev"
    assert shaped["license"] == "MIT"


def test_shape_metadata_missing_topics():
    """Test shaping metadata with missing topics defaults to empty list."""
    raw_metadata = {
        "name": "test",
        "stargazers_count": 100,
        "forks_count": 50,
        "open_issues_count": 10
    }
    
    shaped = shape_metadata(raw_metadata)
    assert shaped["topics"] == []


def test_shape_metadata_no_license():
    """Test shaping metadata with no license returns None."""
    raw_metadata = {
        "name": "test",
        "stargazers_count": 100,
        "forks_count": 50,
        "open_issues_count": 10
    }
    
    shaped = shape_metadata(raw_metadata)
    assert shaped["license"] is None


def test_shape_metadata_null_license():
    """Test shaping metadata with null license returns None."""
    raw_metadata = {
        "name": "test",
        "stargazers_count": 100,
        "forks_count": 50,
        "open_issues_count": 10,
        "license": None
    }
    
    shaped = shape_metadata(raw_metadata)
    assert shaped["license"] is None


def test_shape_contributors_complete():
    """Test shaping complete contributors list."""
    raw_contributors = [
        {
            "login": "user1",
            "avatar_url": "https://github.com/user1.png",
            "html_url": "https://github.com/user1",
            "contributions": 100
        },
        {
            "login": "user2",
            "avatar_url": "https://github.com/user2.png",
            "html_url": "https://github.com/user2",
            "contributions": 50
        }
    ]
    
    shaped = shape_contributors(raw_contributors)
    
    assert len(shaped) == 2
    assert shaped[0]["username"] == "user1"
    assert shaped[0]["avatar"] == "https://github.com/user1.png"
    assert shaped[0]["profile_url"] == "https://github.com/user1"
    assert shaped[0]["contributions"] == 100
    assert shaped[1]["username"] == "user2"
    assert shaped[1]["contributions"] == 50


def test_shape_contributors_empty():
    """Test shaping empty contributors list."""
    shaped = shape_contributors([])
    assert shaped == []


def test_shape_commit_activity_full():
    """Test shaping and slicing commit activity to last 12 weeks."""
    # Create 52 weeks of activity
    activity = [{"total": i, "week": i} for i in range(52)]
    
    shaped = shape_commit_activity(activity)
    
    assert len(shaped) == 12
    assert shaped[0]["total"] == 40  # First of last 12 weeks
    assert shaped[-1]["total"] == 51  # Last week


def test_shape_commit_activity_custom_weeks():
    """Test shaping with custom weeks parameter."""
    activity = [{"total": i, "week": i} for i in range(52)]
    
    shaped = shape_commit_activity(activity, weeks=5)
    
    assert len(shaped) == 5
    assert shaped[-1]["total"] == 51


def test_shape_commit_activity_empty():
    """Test shaping empty activity list."""
    shaped = shape_commit_activity([])
    assert shaped == []


def test_shape_commit_activity_none():
    """Test shaping None activity list."""
    shaped = shape_commit_activity(None)
    assert shaped == []


def test_shape_commit_activity_less_than_requested():
    """Test shaping when activity has fewer weeks than requested."""
    activity = [{"total": i, "week": i} for i in range(5)]
    
    shaped = shape_commit_activity(activity, weeks=12)
    
    assert len(shaped) == 5
