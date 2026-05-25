# GitHub Repo Analyzer — Build Log

## (Shows the steps taken while building on windsurf)

### Pre windsurf steps
- Gemini web chat: prompt creation and concept understanding
- Github token creation and saving in .env
- Google stitch to verify UI components 

---

## Project Overview
**What it does:** A web tool to analyze any public GitHub repository.
Displays metadata, contributor stats, and commit activity. Caches
results in SQLite to avoid redundant GitHub API calls.

**Stack:** FastAPI + React + SQLite + Docker Compose

**Why each choice:**
- FastAPI: async Python, clean endpoint syntax, auto-generates /docs
- httpx: async HTTP client, pairs naturally with FastAPI
- SQLite: zero-config cache layer, single file, no separate DB server
- React + Vite: component-based UI, fast dev server
- Tailwind: utility-first styling, no separate CSS files
- Recharts: React-native charting, simple bar chart API
- Docker Compose: single command to run both services

---

## Phase 0: BUILD_LOG Setup
**Date:** May 23, 2026
### Cascade Prompt Used
> Before we begin building, create a file called BUILD_LOG.md in the project root using the template I will paste below. Do not modify the content, just create the file exactly as given.
### Files Created
- documentation/BUILD_LOG.md
### Notes
- Created BUILD_LOG.md with pre-windsurf steps section added at the top
- File initially created in project root, then moved to documentation/ folder

---

## Phase 0.5 (Optional): TDD
**Date:** May 23, 2026
### Cascade Prompt Used
> (Skipped - tests created after implementation)
### Files Created
- backend/tests/__init__.py
- backend/tests/conftest.py
- backend/tests/unit/__init__.py
- backend/tests/unit/test_url_parser.py
- backend/tests/unit/test_cache_logic.py
- backend/tests/unit/test_data_shaping.py
- backend/tests/integration/__init__.py
- backend/tests/integration/test_endpoints.py
- backend/pytest.ini
- backend/utils.py (extracted helper functions from main.py for testability)
### Tests Written
**Unit Tests:**
1. test_parse_github_url_valid - parses valid GitHub URLs
2. test_parse_github_url_trailing_slash - handles trailing slash
3. test_parse_github_url_no_https - raises ValueError for missing https
4. test_parse_github_url_invalid - raises ValueError for invalid URLs
5. test_parse_github_url_missing_repo - raises ValueError for missing repo
6. test_cache_valid_recent - cache valid for recent data (30 min ago)
7. test_cache_valid_expired - cache invalid for old data (90 min ago)
8. test_cache_valid_invalid_format - cache invalid for malformed timestamp
9. test_cache_valid_empty_string - cache invalid for empty string
10. test_cache_valid_none - cache invalid for None
11. test_cache_valid_exactly_ttl - cache invalid at TTL boundary
12. test_shape_metadata_complete - shapes complete metadata response
13. test_shape_metadata_missing_topics - defaults to empty list
14. test_shape_metadata_no_license - returns None
15. test_shape_metadata_null_license - returns None
16. test_shape_contributors_complete - shapes contributors list
17. test_shape_contributors_empty - handles empty list
18. test_shape_commit_activity_full - slices to last 12 weeks
19. test_shape_commit_activity_custom_weeks - custom weeks parameter
20. test_shape_commit_activity_empty - handles empty list
21. test_shape_commit_activity_none - handles None
22. test_shape_commit_activity_less_than_requested - handles fewer weeks

**Integration Tests:**
1. test_health_endpoint - GET /health returns 200
2. test_analyze_bad_url - POST /analyze with bad URL returns 400
3. test_analyze_valid_url - POST /analyze with mocked GitHub calls returns 200
4. test_analyze_cache_hit - second call hits cache
5. test_history_after_analyze - GET /history returns analyzed repo
6. test_get_repo_after_analyze - GET /repo/{owner}/{repo} returns data
7. test_get_repo_not_found - GET /repo/nobody/fake returns 404
8. test_analyze_github_404 - GitHub 404 returns 404
9. test_analyze_github_403_rate_limit - GitHub 403 returns 429

### Test Run Result
```
success (with conftest.py fixes for database isolation)
```
### Notes
- Tests created after implementation (not true TDD)
- Extracted helper functions to utils.py for testability
- conftest.py provides temporary SQLite database with proper isolation
- Integration tests use mocked GitHub API calls with AsyncMock
- Fixed database isolation issues in conftest.py (monkeypatch get_db_connection, autouse fixtures)

---

## Phase 1: Scaffold
**Date:** May 23, 2026
### Cascade Prompt Used
> Create a GitHub Repository Analyzer project with this structure: github-analyzer/backend/ (main.py, requirements.txt, db/, .env.example), frontend/ (vite react setup), docker-compose.yml, .gitignore, BUILD_LOG.md. For main.py, define four endpoints with placeholder responses only.
### Files Generated
- backend/main.py (placeholder endpoints with CORS)
- backend/requirements.txt (fastapi, uvicorn, httpx, python-dotenv)
- backend/.env.example (GITHUB_TOKEN, CACHE_TTL_HOURS)
- backend/db/.gitkeep
- frontend/package.json (React + Vite)
- frontend/vite.config.js
- frontend/index.html
- frontend/src/main.jsx
- frontend/src/App.jsx (placeholder)
- frontend/src/index.css
- docker-compose.yml (backend port 8000, frontend port 3000)
- .gitignore (updated with node_modules, .env, __pycache__, *.db)
### Manual Changes Made
- None
### Decisions
- Used Vite instead of create-react-app for faster dev server
- Placed BUILD_LOG.md in documentation/ folder for organization
### Notes
- Scaffold completed successfully with placeholder backend endpoints

---

## Phase 2: GitHub API Layer + SQLite Cache
**Date:** May 23, 2026
### Cascade Prompt Used
> Implement the backend logic for the GitHub Repository Analyzer FastAPI app at backend/main.py. Load GITHUB_TOKEN and CACHE_TTL_HOURS from .env, use httpx.AsyncClient for all GitHub API calls with 10 second timeout, use Authorization: Bearer header. POST /analyze should parse URL, check SQLite cache, make 3 GitHub API calls (metadata, contributors, commit activity), shape data, handle errors (404, 403 with rate limit reset, timeout, other), store in cache. GET /repo/{owner}/{repo} fetch from SQLite, 404 if missing. GET /history return all rows ordered by fetched_at DESC. GET /health return {"status": "ok"}. Create db directory and SQLite table automatically on startup.
### Files Modified
- backend/main.py
### Endpoints Implemented
- [x] POST /analyze (with cache check, GitHub API calls, data shaping, error handling)
- [x] GET /repo/{owner}/{repo} (fetch from SQLite)
- [x] GET /history (return all rows ordered DESC)
- [x] GET /health (return status ok)
### Manual Changes Made
- None
### Tested With
- [ ] curl / Postman
- [ ] FastAPI /docs
### Notes
- Implemented full backend logic with SQLite caching
- Error handling for 404, 403 (rate limit with reset time), 504 (timeout), 502 (other errors)
- Data shaping for metadata, contributors, and commit activity
- Auto-creates db directory and repo_cache table on startup

---

## Phase 3: Frontend
**Date:** May 23, 2026
### Cascade Prompt Used
> Build the React frontend for a GitHub Repository Analyzer matching this exact layout: Two-panel layout with LEFT SIDEBAR (dark background, ~280px wide, fixed height full screen) and RIGHT MAIN PANEL (white background). When repo is loaded, show: 1. METADATA CARD (repo name, language badge, description, stats row, topic pills), 2. MIDDLE ROW (Contributors section with filter and Top 10/All toggle, Weekly Commits bar chart), 3. METRIC CARDS ROW (Total Commits, Weekly Average, Peak Week). Use Tailwind CSS, lucide-react for icons, recharts for bar chart. Create separate component files: Sidebar.jsx, MetadataCard.jsx, ContributorsTable.jsx, CommitChart.jsx, MetricCards.jsx.
### Components Created
- [x] Sidebar.jsx (dark sidebar with search, analyze button, history list)
- [x] MetadataCard.jsx (repo metadata with stats and topics)
- [x] ContributorsTable.jsx (filterable table with activity bars)
- [x] CommitChart.jsx (Recharts bar chart for weekly commits)
- [x] MetricCards.jsx (three metric cards for commit stats)
- [x] App.jsx (integration with two-panel layout and API calls)
### Manual Changes Made
- Added lucide-react, recharts, axios, tailwindcss to package.json
- Created tailwind.config.js and postcss.config.js
- Updated index.css with Tailwind directives
### Notes
- Implemented complete two-panel layout matching specifications
- All components use Tailwind CSS for styling
- API integration with backend endpoints (POST /analyze, GET /repo, GET /history)

---

## Phase 4: Polish
**Date:** May 23, 2026
### Cascade Prompt Used
> Phase 4: Error states + loading skeletons. Add polish to the React frontend: 1. LOADING SKELETON: When a repo is being fetched (loading state = true), show grey animated placeholder blocks in place of: The metadata card (a tall grey rectangle), The contributors table rows (4 grey lines), The commit chart (grey rectangle), The metric cards (3 grey squares). Use a simple CSS animation: @keyframes pulse with opacity 0.4 to 1. Do not use any external skeleton library. 2. ERROR BANNER: When the API returns an error, show a banner at the top of the main panel with: Red background for 404 and 502/504 errors, Orange background for 429 (rate limit) errors, The error message from the API response detail field, For 429 errors, also show "Rate limit resets at {time}" if available, An X button to dismiss the banner. 3. EMPTY HISTORY: If history is empty, show "No repositories analyzed yet" in place of the history list in the sidebar. 4. CONTRIBUTOR FILTER: The search input above the contributors table should filter the displayed rows in real time by username (case insensitive). The Top 10 / All toggle should apply after filtering. Also make sure the page doesnt extend infinitely while showing all contributors - let it be a scrollable element inside the table.
### Files Created
- frontend/src/components/Skeleton.jsx (MetadataSkeleton, ContributorsSkeleton, ChartSkeleton, MetricSkeleton)
- frontend/src/components/ErrorBanner.jsx
### Files Modified
- frontend/src/App.jsx (integrated skeleton components and error banner)
- frontend/src/components/ContributorsTable.jsx (added max-h-[400px] and sticky header for scrollable table)
- frontend/src/components/MetadataCard.jsx (added labels below stats with toLocaleString formatting)
- frontend/src/components/Sidebar.jsx (added filter for null metadata.name)
### Features Added
- [x] Loading skeletons with CSS pulse animation (animate-pulse from Tailwind)
- [x] Error banner with red background for 404/502/504 errors
- [x] Error banner with orange background for 429 rate limit errors
- [x] Error banner displays rate limit reset time for 429 errors
- [x] Error banner dismissible with X button
- [x] Empty history state ("No repositories analyzed yet")
- [x] Contributor search filter (case insensitive, real-time)
- [x] Top 10 / All toggle (applies after filtering)
- [x] Scrollable contributors table with sticky header (max-h-[400px])
### Manual Changes Made
- None
### Notes
- Implemented complete loading skeleton system with Tailwind's built-in animate-pulse
- Error banner intelligently detects error type from message and applies appropriate color
- Contributors table now scrolls within a fixed-height container to prevent page extension
- Stats in MetadataCard now show labels (Stars, Forks, Issues) below numbers with comma formatting

---

## Phase 4.5: Backend Fixes
**Date:** May 23, 2026
### Cascade Prompt Used
> Fix these three issues in the GitHub Repo Analyzer: FIX 1: Commit activity retry - In backend/main.py, inside fetch_github_data(), after fetching the commit activity endpoint, add a retry mechanism: If the response status is 202 OR the response JSON is an empty list [], wait 3 seconds (asyncio.sleep(3)) and retry the request once more. If after retry it is still empty or 202, set activity to []. Never raise an error for empty commit activity — it is valid data meaning GitHub hasn't computed stats yet. Make sure activity_response.raise_for_status() is only called when status is not 202. FIX 2: Stars, forks, issues labels - In frontend/src/components/MetadataCard.jsx, the stats row currently shows icon + number only. Add a text label below each number so it reads: ⭐ 192,296 🍴 109,966 ⚠ 1,413 / Stars Forks Issues. Each stat should be a small flex column: icon on top, number in bold, label text in small grey font below. Format large numbers with toLocaleString() so 192296 shows as 192,296. FIX 3: Filter test-repo and empty repos from history - In backend/main.py, in the GET /history endpoint, filter out any cached repos where the metadata name is null/None OR where contributors list is empty AND commit_activity is empty (meaning it was a failed or test fetch). Also in frontend/src/components/Sidebar.jsx, when rendering the history list, skip any item where repo_url contains "test/repo" OR where the repo name derived from the URL contains "test". Actually the cleaner fix: in the Sidebar history list, only show repos where the data has a non-null metadata.name. If metadata.name is null or the data object is malformed, skip that history item silently. Also fix the blank screen when clicking a history item with missing/malformed data: in App.jsx, when loading a repo from history, check that data.metadata exists before setting repoData. If it doesn't exist, set an error state "This repository has incomplete data. Please re-analyze it." instead of setting repoData. FIX 4: Clear error on new successful load - In App.jsx, in the handleAnalyze function (or wherever setRepoData is called after a successful fetch), make sure setError(null) is called both at the START of a new fetch (before the await) and on SUCCESS. Currently a previous error banner persists even after a new repo loads successfully.
### Files Modified
- backend/main.py (added asyncio import, commit activity retry logic, history endpoint filtering)
- frontend/src/App.jsx (added setError(null) on success, metadata existence check in handleLoadHistory)
- frontend/src/components/Sidebar.jsx (added filter for null metadata.name)
### Fixes Implemented
- [x] Commit activity retry mechanism (3 second delay, retry on 202 or empty list, never raise error for empty activity)
- [x] Stats labels in MetadataCard (Stars, Forks, Issues below numbers with toLocaleString formatting)
- [x] Backend history endpoint filters out repos with null metadata name or empty contributors AND empty commit_activity
- [x] Sidebar filters history items with null metadata.name
- [x] App.jsx handleLoadHistory checks for data.metadata existence, throws error if missing
- [x] App.jsx handleAnalyze and handleLoadHistory call setError(null) on success
- [x] DELETE /repo/{owner}/{repo} backend endpoint to remove cached repos from SQLite
- [x] Trash icon button on each history item in Sidebar (calls DELETE, removes from UI immediately)
- [x] Scrollable sidebar history list with overflow-hidden on sidebar and overflow-y-auto on history section
### Manual Changes Made
- None
### Notes
- Commit activity retry handles GitHub's async stat computation gracefully
- History filtering prevents test repos and failed fetches from appearing in UI
- Error state properly cleared on successful loads to prevent stale error banners

---

## Phase 5: Docker
**Date:** May 23, 2026
### Cascade Prompt Used
> Phase 5: Docker. Dockerize the GitHub Repository Analyzer project. Create backend/Dockerfile: - FROM python:3.11-slim - WORKDIR /app - Copy requirements.txt, run pip install - Copy all backend files - Create db directory - CMD: uvicorn main:app --host 0.0.0.0 --port 8000. Create frontend/Dockerfile: - Stage 1: FROM node:18-alpine, build the React app with npm run build - Stage 2: FROM nginx:alpine, copy build output to nginx html directory - Copy a custom nginx.conf that proxies /api requests to backend:8000 and serves the React app for all other routes - EXPOSE 80. Create frontend/nginx.conf: - serve static files from /usr/share/nginx/html - proxy_pass http://backend:8000 for location /api/ - try_files $uri $uri/ /index.html for React routing. Update docker-compose.yml: - backend service: build ./backend, port 8000:8000, env_file .env, volume ./backend/db:/app/db (so SQLite persists across restarts) - frontend service: build ./frontend, port 3000:80, depends_on backend. Add a README.md with exactly these steps to run the project: 1. Clone the repo 2. Copy .env.example to .env and add your GitHub token 3. Run: docker-compose up --build 4. Open http://localhost:3000.
### Files Created
- [x] backend/Dockerfile
- [x] frontend/Dockerfile
- [x] frontend/nginx.conf
- [x] README.md
### Files Modified
- [x] docker-compose.yml
### docker-compose up --build result
```
success
```
### Manual Changes Made
-
### Notes
-

---

## Phase 6: Documentation
**Date:** May 24, 2026
### Cascade Prompt Used
> Create an architecture.md file in documentation - to explain at a high level how the codebase flows - like in an ascii diagram format. also update build logs to include this creation - dont make it too long
### Files Created
- documentation/ARCHITECTURE.md
### Notes
- Created ASCII diagram showing flow from Browser → nginx → FastAPI → GitHub API / SQLite
- Documented components: Frontend (React), Backend (FastAPI), Cache (SQLite)
- Documented data flow: URL → cache check → GitHub fetch → shape → store → return
- Documented cache strategy: TTL 1 hour, key by repo_url

---

## Blockers & Fixes

| Phase | Blocker | Root Cause | How Fixed | Windsurf helped? |
|-------|---------|-----------|-----------|-----------------|
| | | | | |

---

## Cascade Usage Log

| Phase | Prompts Used | Approximate actions |
|-------|-------------|-------------------|
| 0 | 1 | ~5 |
| 0.5 | 0 | 0 (skipped) |
| 1 | 1 | ~20 |
| 2 | 1 | ~30 |
| 3 | 1 | ~40 |
| 4 | 1 | ~15 |
| 4.5 | 1 | ~10 |
| 5 | 1 | ~10 |

---



---

## Demo Script Notes

[Key points to hit in the 7-minute video]

1. Show Stitch design → explain UI decisions
2. Show PLANNING.md → explain thinking before coding
3. Show Phase 2 Cascade generation → explain what it built
4. Walk through main.py → explain endpoint logic + error handling
5. Show frontend components → explain data flow
6. Run docker-compose up → show it works end to end
7. Analyze a real repo live → show all features