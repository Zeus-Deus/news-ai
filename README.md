# News AI - Automated News Collection & Processing Pipeline

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prefect](https://img.shields.io/badge/Prefect-024DFD?style=for-the-badge&logo=dataflow&logoColor=white)](https://prefect.io)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://python.org)

A modular AI-powered news collection platform that automatically fetches news articles from RSS feeds, stores them in PostgreSQL, and is ready for AI processing (translation, summarization, sentiment analysis).

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- 4GB RAM available
- `.env` file (see `.env.example`)

### Installation & Run

```bash
# Clone repository
git clone <repository-url>
cd news-ai

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Start all services
docker compose up --build -d

# Check logs
docker compose logs -f app
```

### Access Points

- **News API**: http://localhost:8000 (REST API for articles)
- **Prefect UI**: http://localhost:4200 (workflow monitoring)
- **PgAdmin**: http://localhost:5050 (database management)
- **PostgreSQL**: localhost:5432 (direct access)

## 🏗️ Architecture

### Tech Stack

- **Backend**: Python 3.12, Prefect 2.x (workflow orchestration), FastAPI (REST API)
- **Database**: PostgreSQL 17 with two databases:
  - `raw_db`: Raw RSS articles
  - `filtered_db`: AI-processed articles with summaries
- **Containerization**: Docker Compose with 5 services
- **Libraries**: feedparser, trafilatura, psycopg2-binary, python-dotenv, prefect==2.20.18, fastapi, uvicorn

### Services Overview

| Service      | Image               | Purpose                   | Ports |
| ------------ | ------------------- | ------------------------- | ----- |
| **api**      | Custom Python       | REST API for articles     | 8000  |
| **app**      | Custom Python       | News collection workflows | -     |
| **postgres** | postgres:17         | Database storage          | 5432  |
| **prefect**  | prefecthq/prefect:2 | Workflow orchestration    | 4200  |
| **pgadmin**  | dpage/pgadmin4      | Database GUI              | 5050  |

### Data Flow

```
RSS Feeds → Prefect Tasks → PostgreSQL (raw_db)
                                     ↓
                         AI Processing (OpenRouter)
                                     ↓
                         PostgreSQL (filtered_db)
                                     ↓
                         REST API (FastAPI)
```

## 📁 Project Structure

```
news-ai/
├── api/                   # 🌐 REST API
│   └── main.py           # FastAPI application
├── docker/                # 🐳 Docker configuration
│   ├── Dockerfile.app    # Python app container
│   ├── startup.sh        # Auto-startup script
│   ├── init-schema.sql   # Database schema
│   └── init-multiple-databases.sh # Database setup
├── app_flows/            # 🚀 Prefect workflows (core)
│   ├── flows/           # Workflow orchestration
│   │   ├── news_collection_flow.py
│   │   ├── ai_processing_flow.py
│   │   └── complete_news_pipeline_flow.py
│   ├── tasks/           # Reusable tasks
│   │   ├── rss_tasks.py      # RSS processing
│   │   ├── llm_tasks.py      # AI/LLM processing
│   │   ├── database_tasks.py # Database storage
│   │   └── filtered_db_tasks.py # Filtered DB operations
│   └── __main__.py      # Module entry point
├── docker-compose.yml   # 🐳 Multi-service setup
├── requirements.txt     # 📦 Python dependencies
└── .env.example        # 🔐 Environment template
```

## 🔧 Current Functionality (Step 2/3)

### ✅ Complete News AI Pipeline

- **RSS Feed Processing**: Automatically fetch articles from NYT, BBC, etc.
- **Full-Text Extraction**: Attempt full article extraction using trafilatura
- **Deduplication**: Fingerprint-based duplicate detection (SHA256 hashes)
- **AI Summarization**: English summaries using OpenRouter Dolphin Mistral model
- **Database Storage**: PostgreSQL with optimized indexes (raw_db + filtered_db)
- **REST API**: FastAPI endpoints for article access
- **Error Handling**: Retry logic, connection timeouts
- **Monitoring**: Prefect UI for real-time tracking

### Database Schema (raw_db)

```sql
-- Raw articles table
CREATE TABLE raw_articles (
    id SERIAL PRIMARY KEY,
    fingerprint VARCHAR(64) UNIQUE,  -- Duplicate detection
    source_url TEXT,
    title TEXT,
    body_html TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_fingerprint ON raw_articles(fingerprint);
CREATE INDEX idx_published_at ON raw_articles(published_at DESC);
```

### Database Schema (filtered_db)

```sql
-- AI-processed articles table
CREATE TABLE filtered_articles (
    id SERIAL PRIMARY KEY,
    raw_article_id INTEGER REFERENCES raw_articles(id),
    title_translated TEXT,  -- Original English title (no translation)
    content_summary TEXT,   -- AI-generated English summary
    content_translated TEXT, -- Reserved for future translations
    sentiment_score FLOAT,   -- Reserved for future sentiment analysis
    categories TEXT[],       -- Reserved for future categorization
    ai_model_used TEXT,      -- AI model that processed this article
    processing_status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_raw_article_id ON filtered_articles(raw_article_id);
CREATE INDEX idx_processed_at ON filtered_articles(processed_at DESC);
```

## 🚀 Manual Operations

### Run Complete Pipeline

```bash
# Via package entry point (recommended)
python -m app_flows

# Via Docker
docker compose exec app python -m app_flows

# Check processed articles count
docker compose exec postgres psql -U postgres -d filtered_db -c "SELECT COUNT(*) FROM filtered_articles;"
```

### Run Individual Flows

```bash
# News collection only
python -m app_flows.flows.news_collection_flow

# AI processing only (requires articles in raw_db)
python -m app_flows.flows.ai_processing_flow
```

### Database Operations

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d raw_db

# Check article count
docker compose exec postgres psql -U postgres -d raw_db -c "SELECT COUNT(*) FROM raw_articles;"

# View recent articles
docker compose exec postgres psql -U postgres -d raw_db -c "SELECT title, published_at FROM raw_articles ORDER BY created_at DESC LIMIT 5;"
```

### API Operations

```bash
# Health check
curl http://localhost:8000/health

# List articles (paginated)
curl "http://localhost:8000/articles?limit=10&offset=0"

# Get specific article
curl http://localhost:8000/articles/1
```

### Container Management

```bash
# View logs
docker compose logs -f app

# Restart services
docker compose restart

# Stop all (data remains)
docker compose down

# Stop all + remove data
docker compose down -v
```

## 🔮 Future Pipeline (Step 3/3)

### ✅ AI Processing (filtered_db) - **COMPLETE**

- **AI Summarization**: ✅ English summaries using OpenRouter Dolphin Mistral
- **Language Detection**: Reserved for future multilingual support
- **Translation**: Reserved for future translation features
- **Sentiment Analysis**: Reserved for future emotional analysis
- **Categorization**: Reserved for future topic classification

### 🌐 Publishing

- **REST API**: ✅ FastAPI endpoints for article access
- **Website Integration**: Ready for frontend development
- **Email Notifications**: Reserved for future newsletter features
- **Social Media**: Reserved for future auto-posting features

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_MULTIPLE_DATABASES=raw_db,filtered_db
POSTGRES_DEFAULT_USER_PASSWORD=your_default_password

# Prefect
PREFECT_API_URL=http://prefect:4200/api

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin

# OpenRouter AI (for AI summarization)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=cognitivecomputations/dolphin-mistral-24b-venice-edition:free
```

### API Documentation

The News AI API provides RESTful endpoints to access processed articles:

#### Endpoints

- `GET /health` - Health check endpoint

  - Returns: `{"status": "ok"}`

- `GET /articles` - List processed articles with pagination

  - Query Parameters:
    - `limit` (optional): Number of articles to return (1-100, default: 20)
    - `offset` (optional): Number of articles to skip (default: 0)
  - Returns: Array of article objects

- `GET /articles/{id}` - Get specific article by ID
  - Path Parameters:
    - `id`: Article ID (integer)
  - Returns: Single article object or 404 if not found

#### Article Object Structure

```json
{
  "id": 1,
  "raw_article_id": 123,
  "title": "Article Title",
  "summary": "AI-generated summary in English...",
  "processed_at": "2025-01-01T12:00:00Z",
  "ai_model_used": "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "source_url": "https://example.com/article",
  "published_at": "2025-01-01T10:00:00Z"
}
```

### RSS Feed Configuration

Edit `app_flows/flows/news_collection_flow.py`:

```python
RSS_FEEDS = [
    {"url": "https://example.com/rss", "name": "Source Name"},
    # Add more feeds...
]
```

## 🛠️ Development

### Adding New RSS Feeds

1. Add feed to `RSS_FEEDS` list in `news_collection_flow.py`
2. Test with: `python -m app_flows`
3. Monitor in Prefect UI

### Adding New Tasks

1. Create new task in `app_flows/tasks/`
2. Import in flow file
3. Add to flow orchestration

### Database Schema Changes

1. Update `docker/init-schema.sql`
2. Rebuild containers: `docker compose up --build`

## 📊 Monitoring & Debugging

### Prefect UI (http://localhost:4200)

- **Flow Runs**: Geschiedenis van alle executions
- **Task States**: Gedetailleerde status per stap
- **Logs**: Real-time logging en error messages
- **Retry Logic**: Automatische herhalingen bij failures

### Database Monitoring

- **PgAdmin**: Visual database browser
- **Query Logs**: Controleer data integriteit
- **Performance**: Monitor query execution times

### Health Checks

```bash
# Check all services
docker compose ps

# Check specific logs
docker compose logs prefect
docker compose logs postgres
```

## 🔍 Troubleshooting

### Common Issues

**"ImportError: cannot import name 'flow' from 'prefect'"**

- Oorzaak: lokale map `prefect/` overschaduwt de Prefect library
- Oplossing: hernoem lokale map naar `app_flows/` (of iets anders) en gebruik relatieve imports binnen dat pakket

**"pg_isready: command not found"**

- PostgreSQL client tools not available in container
- Startup script now uses Python health checks

**Database connection fails**

- Check `.env` variables
- Verify PostgreSQL container is running: `docker compose ps`

**No articles collected**

- Check RSS feed URLs are still active
- Verify internet connectivity in container
- Check Prefect logs for specific errors

### Data Persistence

- **Volumes**: `postgres_data` and `prefect-data` persist
- **Backup**: Use `docker volume` commands for backup
- **Reset**: `docker compose down -v` for complete reset

## 🤝 Contributing

### Development Workflow

1. **Local Development**: Use Docker Compose
2. **Code Changes**: Update in `app_flows/` folder
3. **Testing**: Run `python -m app_flows`
4. **Monitoring**: Check Prefect UI for results
5. **Database**: Test schema changes via PgAdmin

### Code Standards

- **Prefect First**: New workflows via Prefect (not standalone)
- **Modular Tasks**: Reusable components
- **Error Handling**: Proper exception handling and logging
- **Documentation**: Docstrings for all functions

## 📄 License

Licensed under the MIT License. See the LICENSE file for details.

### Contributors

- Zeus-Deus
- Yassir679

**Status**: ✅ **Step 2 Complete** - AI Processing Pipeline operational
**Next**: 🌐 **Step 3** - Frontend Development (ready for web/app integration)
**Future**: 📊 **Advanced Features** - Sentiment analysis, categorization, multi-language support
