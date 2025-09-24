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

- **Prefect UI**: http://localhost:4200 (workflow monitoring)
- **PgAdmin**: http://localhost:5050 (database management)
- **PostgreSQL**: localhost:5432 (direct access)

## 🏗️ Architecture

### Tech Stack

- **Backend**: Python 3.12, Prefect 2.x (workflow orchestration)
- **Database**: PostgreSQL 17 with two databases:
  - `raw_db`: Raw RSS articles
  - `filtered_db`: AI-processed articles (future)
- **Containerization**: Docker Compose with 4 services
- **Libraries**: feedparser, psycopg2-binary, python-dotenv, prefect==2.20.18

### Services Overview

| Service      | Image               | Purpose                   | Ports |
| ------------ | ------------------- | ------------------------- | ----- |
| **app**      | Custom Python       | News collection workflows | -     |
| **postgres** | postgres:17         | Database storage          | 5432  |
| **prefect**  | prefecthq/prefect:2 | Workflow orchestration    | 4200  |
| **pgadmin**  | dpage/pgadmin4      | Database GUI              | 5050  |

### Data Flow

```
RSS Feeds → Prefect Tasks → PostgreSQL (raw_db)
                                      ↓
                         AI Processing (future)
                                      ↓
                         Website/API (future)
```

## 📁 Project Structure

```
news-ai/
├── docker/                 # 🐳 Docker configuration
│   ├── Dockerfile.app     # Python app container
│   ├── startup.sh         # Auto-startup script
│   ├── init-schema.sql    # Database schema
│   └── init-multiple-databases.sh # Database setup
├── app_flows/             # 🚀 Prefect workflows (core)
│   ├── flows/            # Workflow orchestration
│   │   └── news_collection_flow.py
│   ├── tasks/            # Reusable tasks
│   │   ├── rss_tasks.py      # RSS processing
│   │   └── database_tasks.py # Database storage
│   └── __main__.py       # Module entry point
├── docker-compose.yml    # 🐳 Multi-service setup
├── requirements.txt      # 📦 Python dependencies
├── run_news_collection.py # 🎯 Direct runner
└── .env.example         # 🔐 Environment template
```

## 🔧 Current Functionality (Step 1/3)

### ✅ News Collection Pipeline

- **RSS Feed Processing**: Automatically fetch articles from NYT, BBC, etc.
- **Deduplication**: Fingerprint-based duplicate detection (SHA256 hashes)
- **Database Storage**: PostgreSQL with optimized indexes
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

## 🚀 Manual Operations

### Run News Collection

```bash
# Via package entry point (recommended)
python -m app_flows

# Via Docker
docker compose exec app python -m app_flows
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

## 🔮 Future Pipeline (Step 2 & 3)

### 🔄 AI Processing (filtered_db)

- **Language Detection**: Automatically detect language
- **Translation**: AI-powered translation to Dutch
- **Summarization**: Automatic summaries
- **Sentiment Analysis**: Emotional analysis
- **Categorization**: Topic classification

### 🌐 Publishing

- **Website Integration**: Direct publishing to CMS
- **API Endpoints**: REST API for external systems
- **Email Notifications**: Automated newsletters
- **Social Media**: Auto-posting to platforms

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_MULTIPLE_DATABASES=raw_db,filtered_db

# Prefect
PREFECT_API_URL=http://prefect:4200/api

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
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
2. Test with: `python run_news_collection.py`
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

This project is part of the Trends in AI course at AP University College Antwerp.

---

**Status**: ⚡ **Step 1 Complete** - News Collection Pipeline operational
**Next**: 🔄 **Step 2** - AI Processing integration
**Future**: 🌐 **Step 3** - Publishing & Distribution
