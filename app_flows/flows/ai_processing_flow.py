"""
AI processing flow that summarizes English news articles using OpenRouter.
"""
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="/usr/src/app/.env")

from prefect import flow, get_run_logger
import os

# Import tasks
from ..tasks.llm_tasks import summarize_article_task, keep_original_title_task
from ..tasks.filtered_db_tasks import get_unprocessed_articles_task, save_filtered_article_task


@flow(name="ai-processing-flow", retries=1)
def ai_processing_flow(limit: int = 20):
    """
    Main flow for processing raw English news articles with AI.

    This flow:
    1. Fetches unprocessed articles from raw_db
    2. Summarizes articles in English using OpenRouter AI
    3. Keeps original English titles
    4. Saves processed results to filtered_db

    Args:
        limit: Maximum number of articles to process in this run

    Returns:
        Number of articles successfully processed
    """
    logger = get_run_logger()
    logger.info("Starting AI processing flow")

    # Get unprocessed articles
    unprocessed_articles = get_unprocessed_articles_task(limit=limit)

    if not unprocessed_articles:
        logger.info("No unprocessed articles found")
        return 0

    processed_count = 0

    # Process each article
    for raw_id, title, body_html in unprocessed_articles:
        try:
            logger.info(f"Processing article {raw_id}: {title[:50]}...")

            # Submit AI tasks in parallel for better performance
            summary_task = summarize_article_task.submit(body_html, target_lang="en")
            title_task = keep_original_title_task.submit(title)

            # Wait for results
            summary = summary_task.result()
            original_title = title_task.result()

            # Save to filtered database
            if summary:  # Only save if we have a summary
                save_filtered_article_task.submit(
                    raw_article_id=raw_id,
                    content_summary=summary,
                    title_translated=original_title,
                    ai_model_used=os.getenv("OPENROUTER_MODEL")
                )
                processed_count += 1
                logger.info(f"Successfully processed article {raw_id}")
            else:
                logger.warning(f"Skipping article {raw_id} - no summary generated")

        except Exception as e:
            logger.error(f"Failed to process article {raw_id}: {e}")
            continue

    logger.info(f"AI processing flow completed: {processed_count} articles processed")
    return processed_count


if __name__ == "__main__":
    # For local testing
    result = ai_processing_flow()
    print(f"AI processing flow completed with result: {result}")
