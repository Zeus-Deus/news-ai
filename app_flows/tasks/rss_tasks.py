"""
RSS feed processing tasks for Prefect workflows.
"""
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import feedparser
from prefect import task, get_run_logger
import trafilatura


def fingerprint(source_url: str, title: str, summary: str) -> str:
    """Generate unique fingerprint for article deduplication"""
    joined = f"{source_url}\n{title}\n{summary}".encode("utf-8")
    return hashlib.sha256(joined).hexdigest()


def to_iso8601(published_struct: Optional[Any]) -> Optional[str]:
    """Convert feedparser time struct to ISO 8601 string"""
    if not published_struct:
        return None
    try:
        # feedparser uses time.struct_time; convert to UTC ISO 8601
        published_dt = datetime(
            year=published_struct.tm_year,
            month=published_struct.tm_mon,
            day=published_struct.tm_mday,
            hour=published_struct.tm_hour,
            minute=published_struct.tm_min,
            second=published_struct.tm_sec,
            tzinfo=timezone.utc,
        )
        return published_dt.isoformat()
    except Exception:
        return None


def extract_body_html(entry: Any) -> str:
    """Extract article content from RSS entry, preferring full content over summary"""
    content = ""
    if hasattr(entry, "content") and entry.content:
        first = entry.content[0]
        content = getattr(first, "value", "") or first.get("value", "")
    if not content:
        content = getattr(entry, "summary", "") or entry.get("summary", "")
    return content or ""


def extract_full_text_from_url(url: str) -> Optional[str]:
    """Download and extract full article text from a URL using trafilatura.

    Returns plain text if extraction is successful and sufficiently long,
    otherwise returns None so callers can fallback to RSS content/summary.
    """
    try:
        downloaded = trafilatura.fetch_url(url, no_ssl=True)
        if not downloaded:
            return None
        text = trafilatura.extract(
            downloaded,
            include_images=False,
            include_tables=False,
            include_formatting=False,
            favor_recall=True,
        )
        if text:
            cleaned = text.strip()
            if len(cleaned) > 200:
                return cleaned
    except Exception:
        return None
    return None


def parse_rss_feed(feed_url: str) -> List[Dict[str, Optional[str]]]:
    """Parse RSS feed and extract article data"""
    parsed = feedparser.parse(feed_url)
    articles: List[Dict[str, Optional[str]]] = []

    for entry in parsed.entries:
        source_url = getattr(entry, "link", "") or entry.get("link", "") or ""
        title = getattr(entry, "title", "") or entry.get("title", "") or ""
        summary = getattr(entry, "summary", "") or entry.get("summary", "") or ""
        body_html = extract_body_html(entry)

        # Try to replace RSS body with full-text extraction when possible
        if source_url:
            full_text = extract_full_text_from_url(source_url)
            if full_text:
                # Store as body_html even though it's plain text; downstream tasks strip HTML anyway
                body_html = full_text

        # published can be in different fields; prefer published_parsed then updated_parsed
        published_struct = getattr(entry, "published_parsed", None) or entry.get("published_parsed")
        if not published_struct:
            published_struct = getattr(entry, "updated_parsed", None) or entry.get("updated_parsed")
        published_at = to_iso8601(published_struct)

        article_fingerprint = fingerprint(source_url, title, summary)

        articles.append(
            {
                "fingerprint": article_fingerprint,
                "source_url": source_url,
                "title": title,
                "body_html": body_html,
                "published_at": published_at,
            }
        )

    return articles


@task(retries=3, retry_delay_seconds=10)
def fetch_rss_feed_task(feed_url: str, feed_name: str = "Unknown") -> List[Dict[str, Optional[str]]]:
    """
    Prefect task to fetch and parse articles from an RSS feed.

    Args:
        feed_url: URL of the RSS feed to fetch
        feed_name: Human-readable name of the feed for logging

    Returns:
        List of article dictionaries with metadata
    """
    logger = get_run_logger()

    logger.info(f"Fetching RSS feed: {feed_name} ({feed_url})")

    try:
        articles = parse_rss_feed(feed_url)

        if not articles:
            logger.warning(f"No articles found in feed: {feed_name}")
            return []

        logger.info(f"Successfully fetched {len(articles)} articles from {feed_name}")
        return articles

    except Exception as e:
        logger.error(f"Failed to fetch RSS feed {feed_name}: {e}")
        raise
