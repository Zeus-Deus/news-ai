#!/usr/bin/env python3
"""
Main entry point for Prefect workflows.
"""

from .flows.complete_news_pipeline_flow import complete_news_pipeline_flow


def main():
    """Run the complete news AI pipeline"""
    print("🚀 Starting Complete News AI Pipeline...")

    try:
        collected, processed = complete_news_pipeline_flow()
        print(f"✅ Pipeline completed! {collected} articles collected, {processed} processed with AI.")
        return collected
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        return 1


if __name__ == "__main__":
    main()
