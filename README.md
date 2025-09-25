# News AI

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prefect](https://img.shields.io/badge/Prefect-024DFD?style=for-the-badge&logo=dataflow&logoColor=white)](https://prefect.io)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://python.org)

An AI-powered platform that automatically collects news articles from multiple RSS feeds (NYT, BBC, TechCrunch, The Verge), processes them with AI summarization and categorization, and provides a modern web interface with filtering capabilities.

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

- **Automated Collection**: RSS feed processing with deduplication from multiple sources (NYT, BBC, TechCrunch, The Verge)
- **AI Summarization**: English article summaries using Google Gemma 3 12B via OpenRouter
- **Duplicate Prevention**: Smart fingerprinting prevents reprocessing of already summarized articles
- **Category Classification**: AI-powered article categorization (Technology, Business, Politics, etc.)
- **Pagination**: Infinite scroll with "Load More" functionality in the web interface
- **Category Filtering**: Filter articles by category (Technology, Business, Politics, World, Science, Health, Sports, Entertainment)
- **Search Functionality**: Full-text search across article titles and summaries
- **REST API**: FastAPI endpoints for article access with pagination support
- **Web Interface**: Modern React frontend with dark mode and responsive design
- **Workflow Monitoring**: Prefect UI for pipeline tracking and debugging
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
  "categories": ["Technology", "Business"],
  "source_url": "https://example.com",
  "published_at": "2025-01-01T10:00:00Z",
  "processed_at": "2025-01-01T12:00:00Z",
  "ai_model_used": "google/gemma-3-12b-it"
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
OPENROUTER_MODEL=google/gemma-3-12b-it

# Prefect
PREFECT_API_URL=http://prefect:4200/api
```

## Usage

### Run Pipeline

```bash
# Start all services
docker compose up -d

# Option 1: Run complete pipeline (collection + AI processing)
docker compose exec app python -m app_flows.flows.complete_news_pipeline_flow

# Option 2: Run only news collection
docker compose exec app python -m app_flows.flows.news_collection_flow

# Option 3: Run only AI processing on existing articles
docker compose exec app python -m app_flows.flows.ai_processing_flow
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
