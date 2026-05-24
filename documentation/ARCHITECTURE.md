# Architecture

## High-Level Flow

```
┌─────────────────┐
│   Browser       │
│  (React App)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  nginx (Port 80) │
│  - /api/* → backend:8000
│  - /* → React SPA
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI Backend │
│  (Port 8000)     │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌──────────────┐  ┌──────────────┐
│  GitHub API  │  │   SQLite     │
│  (httpx)     │  │   Cache      │
└──────────────┘  └──────────────┘
```

## Components

**Frontend (React + Vite)**
- Two-panel layout: Sidebar (history) + Main Panel (repo data)
- Components: MetadataCard, ContributorsTable, CommitChart, MetricCards
- State: Loading, error, repo data
- API calls via fetch to /api endpoints

**Backend (FastAPI)**
- `POST /analyze` - Parse URL, check cache, fetch from GitHub, shape data, store in cache
- `GET /repo/{owner}/{repo}` - Fetch from SQLite cache
- `GET /history` - Return all cached repos (DESC by fetched_at)
- `GET /health` - Health check
- Error handling: 404, 429 (rate limit), 502/504 (timeout/other)

**Data Flow**
1. User enters GitHub URL in frontend
2. Frontend POST /analyze to backend
3. Backend checks SQLite cache (by repo_url)
4. If cache hit: return cached data
5. If cache miss: fetch from GitHub API (metadata, contributors, commit activity)
6. Shape data (rename fields, slice to 12 weeks)
7. Store in SQLite with timestamp
8. Return data to frontend
9. Frontend renders components with data

**Cache Strategy**
- SQLite database with repo_cache table
- TTL: 1 hour (configurable via CACHE_TTL_HOURS)
- Key: repo_url
- Fields: repo_url, metadata (JSON), contributors (JSON), commit_activity (JSON), fetched_at (timestamp)
