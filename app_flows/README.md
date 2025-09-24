# News AI Prefect Workflows

This directory contains Prefect workflows for the News AI pipeline.

## Structure

```
app_flows/
├── tasks/                 # Reusable Prefect tasks
│   ├── rss_tasks.py      # RSS feed processing tasks
│   └── database_tasks.py # Database operations tasks
├── flows/                 # Prefect flows
│   └── news_collection_flow.py # Main news collection flow
└── README.md             # This file
```

## Tasks

### RSS Tasks (`tasks/rss_tasks.py`)

- `fetch_rss_feed_task()`: Fetches and parses articles from RSS feeds with retry logic

### Database Tasks (`tasks/database_tasks.py`)

- `save_articles_to_database_task()`: Saves articles to PostgreSQL with deduplication

## Flows

### News Collection Flow (`flows/news_collection_flow.py`)

Orchestrates the complete news collection process:

1. **Parallel RSS Fetching**: Fetches from multiple RSS feeds simultaneously
2. **Database Storage**: Saves new articles with automatic deduplication
3. **Error Handling**: Built-in retries and logging

## Usage

### Local Development

```bash
# Run the flow locally
python -m app_flows
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

- **LLM Processing Flow**: Process articles with AI models
- **Publishing Flow**: Push processed content to websites
- **Scheduling**: Run flows on cron schedules
- **Alerting**: Email notifications on failures
