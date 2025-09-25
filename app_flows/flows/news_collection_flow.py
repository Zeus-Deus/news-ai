"""
News collection flow that orchestrates RSS fetching and database storage.
"""
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="/usr/src/app/.env")

from prefect import flow, get_run_logger

# Use relative imports within the local package to avoid name collisions
from ..tasks.rss_tasks import fetch_rss_feed_task
from ..tasks.database_tasks import save_articles_to_database_task


# Define RSS feeds to monitor
RSS_FEEDS = [
    {
        "url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        "name": "NYT World"
    },
    {
        "url": "https://feeds.bbci.co.uk/news/world/rss.xml",
        "name": "BBC World"
    },
    {
        "url": "https://techcrunch.com/feed/",
        "name": "TechCrunch"
    },
    {
        "url": "https://www.theverge.com/rss/index.xml",
        "name": "The Verge"
    },
    # Add more feeds as needed
]


@flow(name="news-collection-flow", retries=1)
def news_collection_flow():
    """
    Main flow for collecting news articles from RSS feeds.

    This flow:
    1. Fetches articles from multiple RSS feeds in parallel
    2. Saves new articles to the raw_db database (deduplicating by fingerprint)
    3. Logs the results

    Future scheduling: Add schedule parameter for automatic runs:
    @flow(name="news-collection-flow",
          retries=1,
          schedule=IntervalSchedule(interval=timedelta(hours=1)))

    Returns:
        Number of new articles saved
    """
    logger = get_run_logger()
    logger.info("Starting news collection flow")

    # Fetch articles from all RSS feeds in parallel
    rss_tasks = []
    for feed in RSS_FEEDS:
        task = fetch_rss_feed_task(feed["url"], feed["name"])
        rss_tasks.append(task)

    # Wait for all RSS fetching to complete
    logger.info(f"Fetching articles from {len(RSS_FEEDS)} RSS feeds")

    # Save all articles to database (this will deduplicate automatically)
    saved_count = save_articles_to_database_task(rss_tasks)

    logger.info(f"News collection flow completed: {saved_count} new articles saved")
    return saved_count


if __name__ == "__main__":
    # For local testing
    result = news_collection_flow()
    print(f"Flow completed with result: {result}")
