from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import sqlite3
import json
import os
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any
from utils import parse_github_url, is_cache_valid, shape_metadata, shape_contributors, shape_commit_activity

# Load environment variables
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
CACHE_TTL_HOURS = int(os.getenv("CACHE_TTL_HOURS", "1"))

app = FastAPI(title="GitHub Repo Analyzer")

# CORS middleware allowing localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "db", "repo_cache.db"))

def init_db():
    """Create db directory and SQLite table if they don't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
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

def get_db_connection():
    """Get a database connection."""
    return sqlite3.connect(DB_PATH)

# Pydantic models
class AnalyzeRequest(BaseModel):
    url: str

async def fetch_github_data(owner: str, repo: str) -> Dict[str, Any]:
    """Fetch data from GitHub API with error handling."""
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Fetch metadata
            metadata_response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers=headers
            )
            
            if metadata_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Repository not found")
            elif metadata_response.status_code == 403:
                reset_time = metadata_response.headers.get("X-RateLimit-Reset")
                if reset_time:
                    reset_datetime = datetime.fromtimestamp(int(reset_time))
                    raise HTTPException(
                        status_code=429,
                        detail=f"Rate limit exceeded. Resets at {reset_datetime}"
                    )
                else:
                    raise HTTPException(status_code=429, detail="Rate limit exceeded")
            
            metadata_response.raise_for_status()
            metadata = metadata_response.json()
            
            # Fetch contributors
            contributors_response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/contributors?per_page=100",
                headers=headers
            )
            contributors_response.raise_for_status()
            contributors = contributors_response.json()
            
            # Fetch commit activity with retry mechanism
            activity_response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/stats/commit_activity",
                headers=headers
            )
            
            # If status is 202 or response is empty list, retry once after 3 seconds
            if activity_response.status_code == 202 or activity_response.json() == []:
                await asyncio.sleep(3)
                activity_response = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/stats/commit_activity",
                    headers=headers
                )
            
            # Only raise for status if not 202 (202 is accepted, meaning GitHub is computing stats)
            if activity_response.status_code != 202:
                activity_response.raise_for_status()
            
            activity = activity_response.json()
            
            # If still empty or 202 after retry, set activity to empty list (valid data)
            if activity == [] or activity_response.status_code == 202:
                activity = []
            
            # Get last 12 weeks of activity
            recent_activity = shape_commit_activity(activity)
            
            return {
                "metadata": shape_metadata(metadata),
                "contributors": shape_contributors(contributors),
                "commit_activity": recent_activity
            }
            
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="GitHub API timed out")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e))

@app.post("/analyze")
async def analyze_repo(request: AnalyzeRequest):
    """Analyze a GitHub repository with caching."""
    try:
        owner, repo = parse_github_url(request.url)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
    
    repo_url = request.url
    
    # Check cache
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json, fetched_at FROM repo_cache WHERE repo_url = ?", (repo_url,))
    cached = cursor.fetchone()
    
    if cached:
        data_json, fetched_at = cached
        if is_cache_valid(fetched_at, CACHE_TTL_HOURS):
            conn.close()
            return {"source": "cache", "data": json.loads(data_json)}
    
    # Fetch from GitHub API
    data = await fetch_github_data(owner, repo)
    
    # Store in cache
    cursor.execute(
        "INSERT OR REPLACE INTO repo_cache (repo_url, data_json, fetched_at) VALUES (?, ?, ?)",
        (repo_url, json.dumps(data), datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    return {"source": "api", "data": data}

@app.get("/repo/{owner}/{repo}")
async def get_repo(owner: str, repo: str):
    """Fetch a repository from cache by owner and repo name."""
    repo_url = f"https://github.com/{owner}/{repo}"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM repo_cache WHERE repo_url = ?", (repo_url,))
    cached = cursor.fetchone()
    conn.close()
    
    if not cached:
        raise HTTPException(status_code=404, detail="Repository not found in cache")
    
    data_json = cached[0]
    return json.loads(data_json)

@app.get("/history")
async def get_history():
    """Return all cached repositories ordered by fetched_at DESC, filtering out test/empty repos."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT repo_url, data_json, fetched_at FROM repo_cache ORDER BY fetched_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        data = json.loads(row[1])
        # Filter out repos where metadata name is null/None OR where contributors is empty AND commit_activity is empty
        if not data.get("metadata") or not data["metadata"].get("name"):
            continue
        if (not data.get("contributors") or len(data.get("contributors", [])) == 0) and \
           (not data.get("commit_activity") or len(data.get("commit_activity", [])) == 0):
            continue
        history.append({
            "repo_url": row[0],
            "data": data,
            "fetched_at": row[2]
        })
    
    return {"history": history}

@app.delete("/repo/{owner}/{repo}")
async def delete_repo(owner: str, repo: str):
    """Delete a cached repository by owner and repo name."""
    repo_url = f"https://github.com/{owner}/{repo}"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM repo_cache WHERE repo_url = ?", (repo_url,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()

    if not deleted:
        raise HTTPException(status_code=404, detail="Repository not found in cache")

    return {"deleted": True}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
