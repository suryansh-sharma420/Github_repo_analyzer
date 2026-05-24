import pytest
import sqlite3
import os
import tempfile
from pathlib import Path


@pytest.fixture(scope="function")
def test_db():
    """Create a temporary SQLite database for testing."""
    # Create a temporary database file
    fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    # Initialize the database schema
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS repo_cache (
            repo_url TEXT PRIMARY KEY,
            data_json TEXT,
            fetched_at TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    
    yield db_path
    
    # Cleanup: delete the temporary database
    try:
        import gc
        gc.collect()  # force Python to release any lingering file handles
        os.unlink(db_path)
    except FileNotFoundError:
        pass


@pytest.fixture(scope="function", autouse=True)
def mock_env_vars(monkeypatch):
    """Set fake environment variables for testing."""
    monkeypatch.setenv("GITHUB_TOKEN", "fake_test_token")
    monkeypatch.setenv("CACHE_TTL_HOURS", "1")


@pytest.fixture(scope="function", autouse=True)
def mock_db_connection(monkeypatch, test_db):
    """Monkeypatch get_db_connection to return connection to test database."""
    import main
    
    def mock_get_db_connection():
        """Return connection to test database."""
        return sqlite3.connect(test_db)
    
    original_get_db_connection = main.get_db_connection
    monkeypatch.setattr(main, "get_db_connection", mock_get_db_connection)
    
    # Initialize the test database schema
    conn = sqlite3.connect(test_db)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS repo_cache (
            repo_url TEXT PRIMARY KEY,
            data_json TEXT,
            fetched_at TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    
    yield test_db
    
    # Clean up: delete all data from the test database
    conn = sqlite3.connect(test_db)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM repo_cache")
    conn.commit()
    conn.close()
    
    # Restore original function
    monkeypatch.setattr(main, "get_db_connection", original_get_db_connection)


@pytest.fixture(scope="function")
def client(mock_db_connection):
    """Create a fresh TestClient for each test with isolated database."""
    from main import app
    from fastapi.testclient import TestClient
    return TestClient(app)
