# News AI Pipeline - Complete Implementation

This directory contains the complete Prefect-based News AI pipeline that collects English news articles from RSS feeds and processes them with AI summarization using OpenRouter.

## Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 2. Start services
docker compose up --build -d

# 3. Run the complete pipeline
docker compose exec app python -m app_flows

# 4. Check results in filtered_db
docker compose exec postgres psql -U postgres -d filtered_db -c "SELECT title_translated, content_summary FROM filtered_articles LIMIT 5;"
```

## Current Status

✅ **Fully Operational Features:**

- RSS feed collection from NYT World and BBC World
- Article deduplication using SHA256 fingerprints
- AI summarization using OpenRouter Dolphin Mistral model
- English-only processing (no translations)
- Complete database pipeline (raw_db → filtered_db)
- Docker containerization with PostgreSQL and Prefect
- Comprehensive logging and error handling

📊 **Current Statistics:**

- 148 raw articles collected
- 14 articles processed with AI summaries
- Using Dolphin Mistral 24B model for high-quality summarization

## Architecture Overview

```
app_flows/
├── tasks/                 # Reusable Prefect tasks
│   ├── rss_tasks.py      # RSS feed processing tasks
│   ├── database_tasks.py # Database operations tasks (raw_db)
│   ├── llm_tasks.py      # AI/LLM processing tasks (OpenRouter)
│   └── filtered_db_tasks.py # Filtered database operations (filtered_db)
├── flows/                 # Prefect flows
│   ├── news_collection_flow.py # News collection from RSS feeds
│   ├── ai_processing_flow.py   # AI summarization & translation
│   └── complete_news_pipeline_flow.py # Complete pipeline
└── README.md             # This file
```

## Tasks

### RSS Tasks (`tasks/rss_tasks.py`)

- `fetch_rss_feed_task()`: Fetches and parses articles from RSS feeds with retry logic

### Database Tasks (`tasks/database_tasks.py`)

- `save_articles_to_database_task()`: Saves raw articles to PostgreSQL with deduplication

### AI Tasks (`tasks/llm_tasks.py`)

- `summarize_article_task()`: Summarizes articles in English using OpenRouter AI models
- `keep_original_title_task()`: Keeps original English titles (no translation needed)

### Filtered DB Tasks (`tasks/filtered_db_tasks.py`)

- `save_filtered_article_task()`: Saves AI-processed articles to filtered_db
- `get_unprocessed_articles_task()`: Gets articles that haven't been processed yet

## Flows

### News Collection Flow (`flows/news_collection_flow.py`)

Collects news articles from RSS feeds:

1. **Parallel RSS Fetching**: Fetches from multiple RSS feeds simultaneously
2. **Database Storage**: Saves new articles with automatic deduplication
3. **Error Handling**: Built-in retries and logging

### AI Processing Flow (`flows/ai_processing_flow.py`)

Processes raw English articles with AI:

1. **Article Retrieval**: Gets unprocessed articles from raw_db
2. **AI Summarization**: Generates English summaries using OpenRouter
3. **Title Preservation**: Keeps original English titles
4. **Result Storage**: Saves processed results to filtered_db

### Complete Pipeline Flow (`flows/complete_news_pipeline_flow.py`)

Orchestrates the full English news AI pipeline:

1. **News Collection**: Collects fresh English articles
2. **AI Processing**: Processes articles with English AI summarization
3. **End-to-End**: Single command for complete pipeline

## Setup

### Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and configure:
# - OPENROUTER_API_KEY: Your OpenRouter API key
# - OPENROUTER_MODEL: Choose your AI model (already set to Dolphin Mistral)
#
# Other settings are pre-configured for Docker
```

### AI Models

The pipeline uses OpenRouter for AI processing. Currently configured with:

- `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` (currently used)

Other available free models:

- `meta-llama/llama-3.2-3b-instruct:free`
- `microsoft/wizardlm-2-8x22b:free`

Premium models (paid):

- `anthropic/claude-3-haiku:beta`
- `google/gemini-flash-1.5`

## Usage

### Local Development

```bash
# Run complete pipeline (collect + AI process)
python -m app_flows

# Run only news collection
python -m app_flows.flows.news_collection_flow

# Run only AI processing
python -m app_flows.flows.ai_processing_flow
```

### Docker (Production)

```bash
# Start all services
docker compose up --build -d

# View Prefect UI
open http://localhost:4200

# Check logs
docker compose logs app
```

### Database Schema

The pipeline uses two PostgreSQL databases:

- **`raw_db.raw_articles`**: Raw news articles collected from RSS feeds

  - `id`: Primary key
  - `fingerprint`: SHA256 hash for deduplication
  - `source_url`: Original article URL
  - `title`: Article title
  - `body_html`: Full article content
  - `published_at`: Publication timestamp

- **`filtered_db.filtered_articles`**: AI-processed articles with summaries
  - `id`: Primary key
  - `raw_article_id`: Reference to raw article
  - `title_translated`: Original English title (no translation)
  - `content_summary`: AI-generated English summary
  - `ai_model_used`: Which AI model processed the article
  - `processing_status`: Status of processing

### Adding New RSS Feeds

Edit `flows/news_collection_flow.py`:

```python
RSS_FEEDS = [
    {"url": "https://example.com/rss", "name": "Example News"},
    # Add more feeds...
]
```

## Monitoring

- **Prefect UI**: View flow runs, task states, and logs at http://localhost:4200
- **Logs**: All tasks include structured logging
- **Retries**: Automatic retry on failures with exponential backoff

## Future Extensions

- **Sentiment Analysis**: Add sentiment scoring to English articles
- **Category Classification**: Auto-categorize articles by topic
- **Publishing Flow**: Push processed English content to websites
- **Scheduling**: Run flows on cron schedules
- **Alerting**: Email notifications on failures
- **Multi-source Support**: Add more English news sources
