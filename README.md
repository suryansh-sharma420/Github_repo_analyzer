# GitHub Repository Analyzer

A web tool to analyze any public GitHub repository. Displays metadata, contributor stats, and commit activity. Caches results in SQLite to avoid redundant GitHub API calls.

## Tech Stack

- **Backend**: FastAPI + Python 3.11 + SQLite
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Infrastructure**: Docker Compose + nginx

## Running the Project

1. Clone the repo
2. Copy `.env.example` to `.env` and add your GitHub token
3. Run: `docker-compose up --build`
4. Open http://localhost:3000

## Getting a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Select scopes: `public_repo` (for public repositories)
4. Copy the token and add it to your `.env` file as `GITHUB_TOKEN=your_token_here`

## Features

- **Repository Analysis**: Fetch and display metadata, contributors, and commit activity
- **Caching**: SQLite cache with configurable TTL (default 1 hour)
- **History**: View previously analyzed repositories
- **Error Handling**: Graceful handling of 404, rate limits (429), and timeouts
- **Loading States**: Animated skeleton loaders during data fetch
- **Contributor Filtering**: Real-time search and Top 10/All toggle

## API Endpoints

- `POST /analyze` - Analyze a GitHub repository
- `GET /repo/{owner}/{repo}` - Fetch repository from cache
- `GET /history` - Get all cached repositories
- `GET /health` - Health check
