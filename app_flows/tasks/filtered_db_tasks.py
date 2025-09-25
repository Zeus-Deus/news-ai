"""
Database operations tasks for filtered_db (AI-processed articles).
"""
import os
from typing import Optional, List

import psycopg2
from prefect import task, get_run_logger


def get_filtered_db_connection():
    """Create connection to filtered_db database"""
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            database="filtered_db",
            user="filtered_db",  # Use the filtered_db user created by init script
            password=os.getenv("POSTGRES_DEFAULT_USER_PASSWORD")
        )
        return conn
    except Exception as e:
        print(f"❌ Filtered DB connection error: {e}")
        return None


def mark_raw_article_processed(raw_article_id: int) -> None:
    """Update raw_articles to mark a row as processed."""
    conn = None
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            database="raw_db",
            user="raw_db",
            password=os.getenv("POSTGRES_DEFAULT_USER_PASSWORD"),
        )
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE raw_articles SET processed_at = NOW(), updated_at = NOW() WHERE id = %s",
                (raw_article_id,),
            )
        conn.commit()
    finally:
        if conn:
            conn.close()


@task(retries=2, retry_delay_seconds=5)
def save_filtered_article_task(
    raw_article_id: int,
    content_summary: Optional[str] = None,
    title_translated: Optional[str] = None,
    content_translated: Optional[str] = None,
    image_url: Optional[str] = None,
    sentiment_score: Optional[float] = None,
    categories: Optional[List[str]] = None,
    ai_model_used: Optional[str] = None
) -> int:
    """
    Save processed article data to filtered_db.

    Args:
        raw_article_id: ID from raw_articles table
        content_summary: AI-generated summary
        title_translated: AI-translated title
        content_translated: AI-translated full content
        image_url: Article image/thumbnail URL
        sentiment_score: Sentiment analysis score (-1 to 1)
        categories: Article categories/tags
        ai_model_used: Which AI model was used

    Returns:
        ID of the newly created filtered article record
    """
    logger = get_run_logger()

    conn = get_filtered_db_connection()
    if not conn:
        raise Exception("Failed to connect to filtered_db")

    try:
        with conn.cursor() as cursor:
            # Insert the filtered article
            cursor.execute("""
                INSERT INTO filtered_articles (
                    raw_article_id,
                    title_translated,
                    content_summary,
                    content_translated,
                    image_url,
                    sentiment_score,
                    categories,
                    ai_model_used,
                    processing_status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'completed')
                RETURNING id
            """, (
                raw_article_id,
                title_translated,
                content_summary,
                content_translated,
                image_url,
                sentiment_score,
                categories,  # PostgreSQL array type
                ai_model_used
            ))

            filtered_id = cursor.fetchone()[0]

        conn.commit()
        mark_raw_article_processed(raw_article_id)
        logger.info(f"Successfully saved filtered article id={filtered_id} for raw_article_id={raw_article_id}")
        return filtered_id

    except Exception as e:
        logger.error(f"Database save error for raw_article_id {raw_article_id}: {e}")
        conn.rollback()
        raise

    finally:
        conn.close()


@task(retries=1)
def get_unprocessed_articles_task(limit: int = 50) -> List[tuple]:
    """
    Get articles from raw_db that haven't been processed yet.

    Args:
        limit: Maximum number of articles to return

    Returns:
        List of tuples (raw_article_id, title, body_html)
    """
    logger = get_run_logger()

    # Connect to raw_db to get unprocessed articles
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            database="raw_db",
            user="raw_db",  # Use the raw_db user
            password=os.getenv("POSTGRES_DEFAULT_USER_PASSWORD")
        )
    except Exception as e:
        logger.error(f"Failed to connect to raw_db: {e}")
        return []

    try:
        with conn.cursor() as cursor:
            # For simplicity, get recent articles (last 24 hours) that might not be processed yet
            # This is a simpler approach than cross-database queries
            cursor.execute("""
                SELECT ra.id, ra.title, ra.body_html
                FROM raw_articles ra
                WHERE ra.processed_at IS NULL
                ORDER BY ra.created_at ASC
                LIMIT %s
            """, (limit,))

            articles = cursor.fetchall()

        logger.info(f"Found {len(articles)} unprocessed articles")
        return articles

    except Exception as e:
        logger.error(f"Error fetching unprocessed articles: {e}")
        return []

    finally:
        conn.close()
