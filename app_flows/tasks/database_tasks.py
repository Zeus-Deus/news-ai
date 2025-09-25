"""
Database operations tasks for Prefect workflows.
"""
import os
from typing import List, Dict, Optional

import psycopg2
from prefect import task, get_run_logger


def get_db_connection():
    """Create connection to raw_db database"""
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            database="raw_db",
            user="raw_db",  # Use the raw_db user created by init script
            password=os.getenv("POSTGRES_DEFAULT_USER_PASSWORD")
        )
        return conn
    except Exception as e:
        print(f"❌ Raw DB connection error: {e}")
        return None


@task(retries=2, retry_delay_seconds=5)
def save_articles_to_database_task(articles_list: List[List[Dict[str, Optional[str]]]]) -> int:
    """
    Prefect task to save articles to the raw_db database.

    Args:
        articles_list: List of article lists from different RSS feeds

    Returns:
        Total number of new articles saved
    """
    logger = get_run_logger()

    # Flatten the list of lists into a single list
    all_articles = []
    for articles in articles_list:
        all_articles.extend(articles)

    if not all_articles:
        logger.info("No articles to save")
        return 0

    logger.info(f"Saving {len(all_articles)} articles to database")

    conn = get_db_connection()
    if not conn:
        raise Exception("Failed to connect to database")

    saved_count = 0

    try:
        with conn.cursor() as cursor:
            for article in all_articles:
                try:
                    # Check if article already exists via fingerprint
                    cursor.execute(
                        "SELECT id FROM raw_articles WHERE fingerprint = %s",
                        (article['fingerprint'],)
                    )

                    if cursor.fetchone() is None:
                        # Article doesn't exist, insert it
                        cursor.execute("""
                            INSERT INTO raw_articles (fingerprint, source_url, title, body_html, image_url, published_at)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            article['fingerprint'],
                            article['source_url'],
                            article['title'],
                            article['body_html'],
                            article['image_url'],
                            article['published_at']
                        ))
                        saved_count += 1
                except Exception as e:
                    logger.warning(f"Error saving article '{article.get('title', 'Unknown')}': {e}")
                    continue

        conn.commit()
        logger.info(f"Successfully saved {saved_count} new articles to database")

    except Exception as e:
        logger.error(f"Database save error: {e}")
        conn.rollback()
        raise

    finally:
        conn.close()

    return saved_count
