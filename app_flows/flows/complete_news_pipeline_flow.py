"""
Complete news processing pipeline that collects news and processes with AI.
"""
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="/usr/src/app/.env")

from prefect import flow, get_run_logger

# Import flows (using absolute imports for Prefect deployments)
import sys
import os
sys.path.insert(0, '/usr/src/app')
from app_flows.flows.news_collection_flow import news_collection_flow
from app_flows.flows.ai_processing_flow import ai_processing_flow


@flow(name="complete-news-pipeline", retries=1)
def complete_news_pipeline_flow():
    """
    Complete news processing pipeline that:
    1. Collects fresh English news articles from RSS feeds
    2. Processes them with AI for English summarization
    3. Saves results to filtered database

    This flow orchestrates the entire news AI pipeline.

    Returns:
        Tuple of (articles_collected, articles_processed)
    """
    logger = get_run_logger()
    logger.info("🚀 Starting complete news AI pipeline")

    # Step 1: Collect news articles
    logger.info("📡 Phase 1: Collecting news articles...")
    articles_collected = news_collection_flow()

    if articles_collected == 0:
        logger.info("No new articles collected, skipping AI processing")
        return (0, 0)

    # Step 2: Process with AI
    logger.info("🤖 Phase 2: Processing articles with AI...")
    articles_processed = ai_processing_flow(limit=articles_collected)

    logger.info(f"✅ Pipeline completed: {articles_collected} collected, {articles_processed} processed")
    return (articles_collected, articles_processed)


if __name__ == "__main__":
    # For local testing
    collected, processed = complete_news_pipeline_flow()
    print(f"✅ Complete pipeline finished: {collected} articles collected, {processed} processed with AI")
