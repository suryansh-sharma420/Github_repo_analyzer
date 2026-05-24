# GitHub Repo Analyzer — Planning Document

## What It Does
A web tool that accepts any public GitHub repository URL and displays:
- Repository metadata (name, language, stars, forks, issues, topics)
- Top contributors with activity visualization
- Weekly commit activity for the last 12 weeks
- Commit metrics: total, weekly average, peak week

Previously analyzed repos are cached in SQLite so repeat lookups
don't burn GitHub API quota.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | FastAPI (Python) | Async, auto-generates docs at /docs, clean endpoint syntax |
| HTTP client | httpx | Async-native, better than requests for FastAPI |
| Database | SQLite | Zero setup, single file, perfect for a cache layer |
| Frontend | React + Vite | Component-based, fast dev server |
| Styling | Tailwind CSS | Utility-first, no separate CSS files |
| Charts | Recharts | React-native, simple bar chart API |
| Icons | lucide-react | Clean, consistent icon set |
| Containerization | Docker Compose | Single command to run both services |

---

## Project Structure

```
github-analyzer/
  backend/
    main.py              # FastAPI app — all endpoints and logic
    requirements.txt     # fastapi, uvicorn, httpx, python-dotenv
    db/                  # SQLite database lives here (volume-mounted in Docker)
      .gitkeep
    .env.example         # GITHUB_TOKEN=, CACHE_TTL_HOURS=1
    Dockerfile
    test_main.py         # Minimal TDD tests (5 tests, no real API calls)
  frontend/
    src/
      components/
        Sidebar.jsx          # Search input + history list
        MetadataCard.jsx     # Repo name, stats, topics
        ContributorsTable.jsx # Filterable table + activity bars
        CommitChart.jsx      # Recharts bar chart
        MetricCards.jsx      # Total / avg / peak cards
      App.jsx            # Layout + state management
    nginx.conf           # Serves React, proxies /api to backend
    Dockerfile
  docker-compose.yml
  .gitignore
  BUILD_LOG.md
  README.md
```

---

## Endpoints

| Method | Path | What it does |
|--------|------|--------------|
| POST | /analyze | Parse URL, check cache, fetch GitHub, store, return data |
| GET | /repo/{owner}/{repo} | Return cached result for a specific repo |
| GET | /history | List all analyzed repos ordered by most recent |
| GET | /health | Returns `{"status": "ok"}` — used by Docker healthcheck |

### POST /analyze — request/response shape

Request:
```json
{ "url": "https://github.com/facebook/react" }
```

Response:
```json
{
  "source": "cache | api",
  "data": {
    "metadata": {
      "name": "react",
      "description": "...",
      "language": "TypeScript",
      "stars": 212000,
      "forks": 44500,
      "open_issues": 1200,
      "created_at": "2013-05-24T16:15:54Z",
      "last_push": "2024-01-15T10:00:00Z",
      "topics": ["frontend", "javascript", "library", "react", "ui"],
      "homepage": "https://react.dev",
      "license": "MIT License"
    },
    "contributors": [
      {
        "username": "gaearon",
        "avatar": "https://avatars.githubusercontent.com/...",
        "profile_url": "https://github.com/gaearon",
        "contributions": 14203
      }
    ],
    "commit_activity": [
      { "week": 1706054400, "total": 23, "days": [...] }
    ]
  }
}
```

---

## GitHub API Calls (inside POST /analyze)

```
GET https://api.github.com/repos/{owner}/{repo}
GET https://api.github.com/repos/{owner}/{repo}/contributors?per_page=100
GET https://api.github.com/repos/{owner}/{repo}/stats/commit_activity
```

All authenticated with `Authorization: Bearer {GITHUB_TOKEN}`.
Unauthenticated limit: 60 req/hr. Authenticated: 5000 req/hr.

### Error handling matrix

| GitHub response | Our response | UI shows |
|----------------|-------------|---------|
| 404 | HTTPException 404 | "Repository not found" |
| 403 | HTTPException 429 + reset time | "Rate limit exceeded. Resets at {time}" (orange banner) |
| Timeout (>10s) | HTTPException 504 | "GitHub API timed out" (red banner) |
| Bad URL format | HTTPException 400 | "Invalid GitHub URL format" (red banner) |
| Other error | HTTPException 502 | "GitHub API error: {detail}" (red banner) |

---

## SQLite Cache Logic

Table: `repo_cache`
```sql
CREATE TABLE IF NOT EXISTS repo_cache (
    repo_url    TEXT PRIMARY KEY,  -- "facebook/react"
    data_json   TEXT,              -- full JSON blob
    fetched_at  TIMESTAMP          -- UTC datetime string
);
```

Cache flow on POST /analyze:
1. Check if `repo_url` exists in DB
2. If yes AND `fetched_at` is within `CACHE_TTL_HOURS` → return DB data, skip GitHub
3. If no OR expired → call GitHub API → `INSERT OR REPLACE` into DB → return fresh data

TTL is configurable via `.env` (`CACHE_TTL_HOURS=1`).
This means re-fetches happen at most once per TTL window per repo.

---

## Frontend UI Layout

Reference design: Design 3 (sidebar layout) from Stitch.

```
┌─────────────────┬──────────────────────────────────────────────┐
│ SIDEBAR (280px) │ MAIN PANEL                                    │
│                 │                                               │
│ GitAnalyze      │ [Error banner — only when error]             │
│ Repo Analyzer   │                                               │
│                 │ ┌─────────────────────────────────────────┐  │
│ [Search input]  │ │ repo name    LANGUAGE   ⭐ forks issues  │  │
│ [Analyze btn]   │ │ description                             │  │
│                 │ │ topic pills                             │  │
│ HISTORY         │ └─────────────────────────────────────────┘  │
│ facebook/react  │                                               │
│ vercel/next.js  │ ┌──────────────────┐ ┌───────────────────┐  │
│ tailwind/css    │ │ [filter input]   │ │ Weekly Commits    │  │
│ microsoft/vscode│ │ [Top 10] [All]   │ │ LAST 12 WEEKS     │  │
│ electron/electron│ │                  │ │                   │  │
│                 │ │ avatar username  │ │   [bar chart]     │  │
│                 │ │ commits activity │ │                   │  │
│                 │ └──────────────────┘ └───────────────────┘  │
│                 │                                               │
│                 │ ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│                 │ │TOTAL       │ │WEEKLY AVG  │ │PEAK WEEK │  │
│                 │ │158,402     │ │412         │ │1,822     │  │
│                 │ └────────────┘ └────────────┘ └──────────┘  │
└─────────────────┴──────────────────────────────────────────────┘
```

### Component responsibilities

**Sidebar.jsx**
- Search input + Analyze button
- On submit: calls POST /analyze, passes result up to App.jsx
- Fetches GET /history on mount, renders clickable history list
- Active repo highlighted in list

**MetadataCard.jsx**
- Receives `metadata` object as prop
- Language badge: colored background based on language name
- Stats row: lucide-react icons (Star, GitFork, CircleDot)
- Topics: map over array, render pill tags

**ContributorsTable.jsx**
- Receives full `contributors` array as prop
- Local state: `search` string, `showAll` boolean
- Filtering: `contributors.filter(c => c.username.includes(search))`
- Slicing: `.slice(0, showAll ? undefined : 10)`
- Activity bar: `width = (contributions / max) * 100%`, green fill

**CommitChart.jsx**
- Receives `commit_activity` array (12 items) as prop
- Labels: W1 through W12
- Uses Recharts `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`

**MetricCards.jsx**
- Receives `commit_activity` array as prop
- Computes: total (sum), average (total/12 rounded), peak (max + week label)
- Three cards with icons from lucide-react

**App.jsx**
- Holds: `repoData`, `loading`, `error` state
- Passes fetch handler down to Sidebar
- Renders loading skeletons when `loading === true`
- Renders error banner when `error !== null`
- Renders all section components when `repoData !== null`

---

## Loading Skeletons

When `loading === true`, render grey animated placeholder blocks:
- Metadata card area: tall grey rectangle
- Contributors + chart row: two grey rectangles side by side  
- Metric cards: three grey squares

CSS: `@keyframes pulse { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }`
No external library needed.

---

## Docker Setup

**backend/Dockerfile**
```
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN mkdir -p db
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile** (multi-stage)
```
Stage 1 — build:
  FROM node:18-alpine
  build React app → /app/dist

Stage 2 — serve:
  FROM nginx:alpine
  copy dist to /usr/share/nginx/html
  copy nginx.conf
  EXPOSE 80
```

**nginx.conf** — two jobs:
1. Proxy `/api/` requests → `http://backend:8000/`
2. Serve React app for everything else (`try_files $uri /index.html`)

Note: frontend axios calls use `/api/analyze` not `http://localhost:8000/analyze`
so nginx can proxy them correctly inside Docker.

**docker-compose.yml**
```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    volumes: ["./backend/db:/app/db"]  # SQLite persists across restarts

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]
```

Single launch command: `docker-compose up --build`

---

## TDD — Test Plan

File: `backend/test_main.py`
Run with: `pytest test_main.py`
Real GitHub API calls: **zero**

| # | Test | What it checks |
|---|------|---------------|
| 1 | GET /health | Returns 200 + `{"status":"ok"}` |
| 2 | POST /analyze bad URL | Returns 400 |
| 3 | GET /history | Returns 200 + `{"history": [...]}` |
| 4 | GET /repo/nobody/fakerepo | Returns 404 |
| 5 | POST /analyze mocked | All 3 GitHub calls mocked, returns 200 or graceful error, never 500 |

---

## Build Phases

| Phase | What gets built | Cascade session |
|-------|----------------|----------------|
| 0 | BUILD_LOG.md template | First message ever |
| 0.5 (optional) | test_main.py (TDD) | Before any implementation |
| 1 | Project scaffold, empty endpoints | Session 1 |
| 2 | GitHub API layer + SQLite cache | Session 2 |
| 3 | React frontend — layout + components | Session 3 |
| 4 | Error states + loading skeletons + contributor filter | Session 4 |
| 5 | Dockerfiles + docker-compose + nginx.conf | Session 5 |

---

## Environment Variables

```
GITHUB_TOKEN=ghp_your_token_here
CACHE_TTL_HOURS=1
```

Never commit `.env`. Always commit `.env.example`.

---

## What Gets Cut From the Stitch Design

Removed (no functionality behind them):
- Top navigation tabs (Dashboard, Insights, Security)
- Top-right Analyze button (search is in sidebar)
- Bell / notification icon
- Profile / user icon  
- Settings page link in sidebar
- Support link in sidebar

Kept and implemented:
- Everything else in the Stitch output
