"""
AI/LLM processing tasks for Prefect workflows using OpenRouter.
"""
import os
from typing import Optional

from openai import OpenAI
from prefect import task, get_run_logger


# Initialize OpenRouter client (OpenAI-compatible)
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
)


@task(retries=3, retry_delay_seconds=10)
def summarize_article_task(body_html: str, target_lang: str = "en") -> Optional[str]:
    """
    Summarize an article using OpenRouter AI models.

    Args:
        body_html: The raw HTML content of the article
        target_lang: Target language for summary ('en' for English)

    Returns:
        Summarized text in English, or None if summarization fails
    """
    logger = get_run_logger()

    if not body_html or not body_html.strip():
        logger.warning("Empty article content provided")
        return None

    # Clean up HTML by removing tags (basic cleanup)
    import re
    clean_text = re.sub(r'<[^>]+>', '', body_html).strip()

    if len(clean_text) < 100:
        logger.warning("Article content too short for meaningful summarization")
        return None

    model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free")

    prompt = f"""Summarize the following news article in English in 3-5 sentences.
Be factual, neutral and comprehensive. Avoid opinions or extra context.

Article content:
{clean_text[:4000]}  # Limit to avoid token limits

Summary:"""

    try:
        logger.info(f"Summarizing article with {model}")

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional news editor. Always provide summaries in English."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Low temperature for consistent, factual summaries
            max_tokens=500,
            timeout=30
        )

        summary = response.choices[0].message.content.strip()

        if summary and len(summary) > 20:  # Basic validation
            logger.info("Successfully generated summary")
            return summary
        else:
            logger.warning("Generated summary too short or empty")
            return None

    except Exception as e:
        logger.error(f"Failed to summarize article: {e}")
        raise


@task(retries=1)
def keep_original_title_task(title: str) -> Optional[str]:
    """
    Keep the original article title (no translation needed for English articles).

    Args:
        title: Original article title

    Returns:
        Original title, or None if empty
    """
    logger = get_run_logger()

    if not title or not title.strip():
        logger.warning("Empty title provided")
        return None

    logger.info("Keeping original English title")
    return title
