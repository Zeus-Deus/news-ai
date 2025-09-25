# News AI

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prefect](https://img.shields.io/badge/Prefect-024DFD?style=for-the-badge&logo=dataflow&logoColor=white)](https://prefect.io)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://python.org)

An AI-powered platform that automatically collects news articles from RSS feeds, processes them with AI summarization, and provides a REST API for access.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- 4GB RAM available
- `.env` file (see `.env.example`)

### Installation

```bash
git clone <repository-url>
cd news-ai
cp .env.example .env
# Edit .env with your credentials

docker compose up --build -d
```

### Access Points

- **API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Prefect UI**: http://localhost:4200
- **PgAdmin**: http://localhost:5050

## Architecture

### Tech Stack

- **Backend**: Python 3.12, FastAPI, Prefect 2.x
- **Frontend**: React, TypeScript, TailwindCSS
- **Database**: PostgreSQL 17 (raw_db + filtered_db)
- **AI**: OpenRouter API for summarization
- **Containerization**: Docker Compose

### Services

- **API**: REST API for articles (port 8000)
- **Frontend**: React web interface (port 3000)
- **Prefect**: Workflow orchestration (port 4200)
- **PostgreSQL**: Database storage (port 5432)
- **PgAdmin**: Database management (port 5050)

### Data Flow

RSS Feeds (NYT, BBC, TechCrunch, The Verge) → Raw Storage → AI Processing → Filtered Storage → API → Frontend

## Features

- **Automated Collection**: RSS feed processing with deduplication (incl. TechCrunch `https://techcrunch.com/feed/` and The Verge `https://www.theverge.com/rss/index.xml`)
- **AI Summarization**: English article summaries using LLM
- **REST API**: FastAPI endpoints for article access
- **Web Interface**: React frontend for browsing articles
- **Workflow Monitoring**: Prefect UI for pipeline tracking
- **Database Management**: PgAdmin for data administration

## API

### Endpoints

- `GET /health` - Health check
- `GET /articles` - List articles (pagination: `?limit=20&offset=0`)
- `GET /articles/{id}` - Get specific article

### Article Response

```json
{
  "id": 1,
  "title": "Article Title",
  "summary": "AI-generated summary...",
  "source_url": "https://example.com",
  "published_at": "2025-01-01T10:00:00Z",
  "processed_at": "2025-01-01T12:00:00Z",
  "ai_model_used": "dolphin-mistral-24b"
}
```

## Configuration

### Environment Variables (.env)

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_MULTIPLE_DATABASES=raw_db,filtered_db

# AI Processing
OPENROUTER_API_KEY=your_api_key
OPENROUTER_MODEL=cognitivecomputations/dolphin-mistral-24b-venice-edition:free

# Prefect
PREFECT_API_URL=http://prefect:4200/api
```

## Usage

### Run Pipeline

```bash
# Start all services
docker compose up -d

# Run news collection and AI processing
docker compose exec app python -m app_flows
```

### Check Results

```bash
# View articles via API
curl http://localhost:8000/articles

# Monitor workflows
open http://localhost:4200

# Database management
open http://localhost:5050
```

## License

MIT License - see LICENSE file for details.
