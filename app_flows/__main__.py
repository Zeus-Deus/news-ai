#!/usr/bin/env python3
"""
Main entry point for Prefect workflows.
"""

from .flows.news_collection_flow import news_collection_flow


def main():
    """Run the default news collection flow"""
    print("🚀 Starting Prefect News Collection Flow...")

    try:
        result = news_collection_flow()
        print(f"✅ Flow completed! Saved {result} new articles.")
        return result
    except Exception as e:
        print(f"❌ Flow failed: {e}")
        return 1


if __name__ == "__main__":
    main()
