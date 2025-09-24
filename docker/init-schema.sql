-- Database schema initialization for News AI project
-- This script creates the necessary tables for raw and filtered news articles

-- Ensure we are connected to the correct database
\connect raw_db

-- Raw articles table (unprocessed news from RSS feeds)
CREATE TABLE IF NOT EXISTS raw_articles (
    id SERIAL PRIMARY KEY,
    fingerprint VARCHAR(64) UNIQUE NOT NULL,  -- SHA256 hash for duplicate detection
    source_url TEXT NOT NULL,                 -- Original article URL
    title TEXT,                               -- Article title
    body_html TEXT,                           -- Full article content in HTML
    published_at TIMESTAMP WITH TIME ZONE,    -- When article was published
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  -- When we fetched it
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP   -- Last modification
);

-- Filtered articles table (processed by AI/LLM)
-- NOTE: filtered_articles lives in filtered_db. See section below after switching connection.

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_raw_fingerprint ON raw_articles(fingerprint);
CREATE INDEX IF NOT EXISTS idx_raw_published_at ON raw_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_created_at ON raw_articles(created_at DESC);

-- filtered_db indexes are created in the section below after switching connection.

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_raw_articles_updated_at
    BEFORE UPDATE ON raw_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Switch to filtered_db and create filtered tables there
\connect filtered_db

-- Filtered articles table (processed by AI/LLM)
CREATE TABLE IF NOT EXISTS filtered_articles (
    id SERIAL PRIMARY KEY,
    raw_article_id INTEGER,                  -- Link to original raw article (cross-DB; not FK-enforced)
    title_translated TEXT,                   -- AI-translated title
    content_summary TEXT,                    -- AI-generated summary
    content_translated TEXT,                 -- AI-translated full content
    sentiment_score DECIMAL(3,2),            -- Sentiment analysis score (-1 to 1)
    categories TEXT[],                       -- Article categories/tags
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ai_model_used VARCHAR(100),              -- Which AI model processed this
    processing_status VARCHAR(20) DEFAULT 'pending'  -- pending, processing, completed, failed
);

-- Indexes for performance in filtered_db
CREATE INDEX IF NOT EXISTS idx_filtered_raw_id ON filtered_articles(raw_article_id);
CREATE INDEX IF NOT EXISTS idx_filtered_status ON filtered_articles(processing_status);
CREATE INDEX IF NOT EXISTS idx_filtered_processed_at ON filtered_articles(processed_at DESC);
