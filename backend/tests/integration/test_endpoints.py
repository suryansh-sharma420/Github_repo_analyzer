import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app
import os


@pytest.fixture
def mock_github_metadata():
    """Mock GitHub metadata response."""
    return {
        "name": "test-repo",
        "description": "A test repository",
        "language": "Python",
        "stargazers_count": 100,
        "forks_count": 50,
        "open_issues_count": 10,
        "created_at": "2023-01-01T00:00:00Z",
        "pushed_at": "2024-01-01T00:00:00Z",
        "topics": ["python", "test"],
        "homepage": "https://example.com",
        "license": {"name": "MIT"}
    }


@pytest.fixture
def mock_github_contributors():
    """Mock GitHub contributors response."""
    return [
        {
            "login": "user1",
            "avatar_url": "https://github.com/user1.png",
            "html_url": "https://github.com/user1",
            "contributions": 50
        },
        {
            "login": "user2",
            "avatar_url": "https://github.com/user2.png",
            "html_url": "https://github.com/user2",
            "contributions": 25
        }
    ]


@pytest.fixture
def mock_github_activity():
    """Mock GitHub commit activity response."""
    return [{"total": i, "week": i} for i in range(52)]


def test_health_endpoint(client):
    """Test GET /health returns 200 with status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_bad_url(client):
    """Test POST /analyze with bad URL returns 400."""
    response = client.post("/analyze", json={"url": "not-a-url"})
    assert response.status_code == 400
    assert "Invalid GitHub URL format" in response.json()["detail"]


@patch('main.fetch_github_data', new_callable=AsyncMock)
def test_analyze_valid_url(mock_fetch, client, mock_github_metadata, mock_github_contributors, mock_github_activity):
    """Test POST /analyze with valid URL and mocked GitHub calls returns 200."""
    mock_fetch.return_value = {
        "metadata": mock_github_metadata,
        "contributors": mock_github_contributors,
        "commit_activity": mock_github_activity[-12:]
    }
    
    response = client.post("/analyze", json={"url": "https://github.com/test/repo"})
    assert response.status_code == 200
    assert "data" in response.json()
    assert response.json()["source"] == "api"


@patch('main.fetch_github_data', new_callable=AsyncMock)
def test_analyze_cache_hit(mock_fetch, client, mock_github_metadata, mock_github_contributors, mock_github_activity):
    """Test POST /analyze called twice with same URL hits cache on second call."""
    mock_fetch.return_value = {
        "metadata": mock_github_metadata,
        "contributors": mock_github_contributors,
        "commit_activity": mock_github_activity[-12:]
    }
    
    # First call - should hit API
    response1 = client.post("/analyze", json={"url": "https://github.com/test/repo"})
    assert response1.status_code == 200
    assert response1.json()["source"] == "api"
    
    # Second call - should hit cache
    response2 = client.post("/analyze", json={"url": "https://github.com/test/repo"})
    assert response2.status_code == 200
    assert response2.json()["source"] == "cache"
    
    # fetch_github_data should only be called once
    assert mock_fetch.call_count == 1


@patch('main.fetch_github_data', new_callable=AsyncMock)
def test_history_after_analyze(mock_fetch, client, mock_github_metadata, mock_github_contributors, mock_github_activity):
    """Test GET /history after one analyze returns list with one item."""
    mock_fetch.return_value = {
        "metadata": mock_github_metadata,
        "contributors": mock_github_contributors,
        "commit_activity": mock_github_activity[-12:]
    }
    
    # Analyze a repo
    client.post("/analyze", json={"url": "https://github.com/test/repo"})
    
    # Get history
    response = client.get("/history")
    assert response.status_code == 200
    history = response.json()["history"]
    assert len(history) == 1
    assert history[0]["repo_url"] == "https://github.com/test/repo"


@patch('main.fetch_github_data', new_callable=AsyncMock)
def test_get_repo_after_analyze(mock_fetch, client, mock_github_metadata, mock_github_contributors, mock_github_activity):
    """Test GET /repo/facebook/react after analyze returns 200 with data."""
    mock_fetch.return_value = {
        "metadata": mock_github_metadata,
        "contributors": mock_github_contributors,
        "commit_activity": mock_github_activity[-12:]
    }
    
    # Analyze a repo
    client.post("/analyze", json={"url": "https://github.com/facebook/react"})
    
    # Get repo by owner/repo
    response = client.get("/repo/facebook/react")
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    assert data["metadata"]["name"] == "test-repo"


def test_get_repo_not_found(client):
    """Test GET /repo/nobody/fakerepo999 returns 404."""
    response = client.get("/repo/nobody/fakerepo999")
    assert response.status_code == 404
    assert "not found in cache" in response.json()["detail"]


@patch('main.fetch_github_data', new_callable=AsyncMock)
def test_analyze_github_404(mock_fetch, client):
    """Test POST /analyze where GitHub returns 404 returns 404."""
    from fastapi import HTTPException
    mock_fetch.side_effect = HTTPException(status_code=404, detail="Repository not found")
    
    response = client.post("/analyze", json={"url": "https://github.com/nobody/fake"})
    assert response.status_code == 404
    assert "Repository not found" in response.json()["detail"]


@patch('main.fetch_github_data', new_callable=AsyncMock)
def test_analyze_github_403_rate_limit(mock_fetch, client):
    """Test POST /analyze where GitHub returns 403 with rate limit headers returns 429."""
    from fastapi import HTTPException
    mock_fetch.side_effect = HTTPException(status_code=429, detail="Rate limit exceeded. Resets at 2024-01-02 00:00:00")
    
    response = client.post("/analyze", json={"url": "https://github.com/test/repo"})
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["detail"]
