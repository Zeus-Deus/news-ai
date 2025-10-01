# News AI

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prefect](https://img.shields.io/badge/Prefect-024DFD?style=for-the-badge&logo=dataflow&logoColor=white)](https://prefect.io)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://python.org)
[![Traefik](https://img.shields.io/badge/Traefik-24A1C1?style=for-the-badge&logo=traefikproxy&logoColor=white)](https://traefik.io)

An AI-powered platform that automatically collects news articles from multiple RSS feeds (NYT, BBC, TechCrunch, The Verge), processes them with AI summarization and categorization, and provides a modern web interface with filtering capabilities.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Traefik reverse proxy (external)
- 4GB RAM available
- Domain name configured (or modify domains in `docker-compose.yml`)
- `.env` file (see `.env.example`)

### Installation

```bash
git clone <repository-url>
cd news-ai
cp .env.example .env
# Edit .env with your credentials

# Create external Traefik network
docker network create traefik

# Start services
docker compose up --build -d
```

### Access Points

> **Security**: All services are secured with Traefik reverse proxy and SSL certificates. No direct port access.

- **Frontend**: https://maltem.site
- **Prefect UI**: https://prefect.maltem.site
- **PgAdmin**: https://pgadmin.maltem.site
- **API**: Internal only (accessible via frontend proxy)

## Architecture

### Tech Stack

- **Backend**: Python 3.12, FastAPI, Prefect 2.x
- **Frontend**: React, TypeScript, TailwindCSS
- **Database**: PostgreSQL 17 (raw_db + filtered_db)
- **AI**: OpenRouter API for summarization
- **Reverse Proxy**: Traefik with Let's Encrypt SSL
- **Containerization**: Docker Compose

### Services

- **Frontend**: React web interface (public via Traefik)
- **API**: REST API for articles (internal only)
- **Prefect**: Workflow orchestration (public via Traefik)
- **PostgreSQL**: Database storage (internal only)
- **PgAdmin**: Database management (public via Traefik)

### Network Architecture

```
Internet
    ↓
Traefik (SSL/TLS)
    ↓
┌─────────────────────────────────────┐
│ Proxy Network (traefik)             │
│  - Frontend (React)                 │
│  - PgAdmin (admin)                  │
│  - Prefect UI (admin)               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Frontend Network                    │
│  - API (internal only)              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Backend Network (isolated)          │
│  - PostgreSQL                       │
│  - Worker processes                 │
└─────────────────────────────────────┘
```

**Security Features**:
- No exposed ports (bypass prevention)
- API not publicly accessible
- Database fully isolated in internal network
- All public traffic via SSL (Let's Encrypt)

### Data Flow

RSS Feeds (NYT, BBC, TechCrunch, The Verge) → Raw Storage → AI Processing → Filtered Storage → API (internal) → Frontend → User

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

> **Note**: The API is internal only and not directly accessible from the internet. Frontend uses React proxy to communicate with the API securely.

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

### Internal Access (for development/debugging)

```bash
# From within Docker network
docker compose exec frontend curl http://api:8000/articles

# Or exec into any container
docker compose exec api curl http://localhost:8000/articles
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
# View articles via web interface
open https://maltem.site

# View articles via internal API (from within Docker network)
docker compose exec frontend curl http://api:8000/articles

# Monitor workflows
open https://prefect.maltem.site

# Database management
open https://pgadmin.maltem.site
```

### Domain Configuration

Update your DNS records to point to your server:

```
maltem.site           A    YOUR_SERVER_IP
prefect.maltem.site   A    YOUR_SERVER_IP
pgadmin.maltem.site   A    YOUR_SERVER_IP
```

Or modify domains in `docker-compose.yml` labels:

```yaml
- "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
```

## License

MIT License - see LICENSE file for details.
