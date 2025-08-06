-- Migration: enhance_system_for_twitter_and_correlation
-- Created at: 1754049606

-- Add X (Twitter) data collection table
CREATE TABLE IF NOT EXISTS twitter_trends_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id TEXT,
    tweet_text TEXT NOT NULL,
    tweet_url TEXT,
    author_username TEXT,
    author_followers_count INTEGER,
    retweet_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    quote_count INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    hashtags JSONB,
    mentions JSONB,
    tweet_created_at TIMESTAMP WITH TIME ZONE,
    trend_category TEXT,
    painpoint_extracted TEXT,
    relevance_score DECIMAL(5,2) DEFAULT 0,
    is_original_tweet BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create correlation matrix table for cross-platform trend tracking
CREATE TABLE IF NOT EXISTS trend_correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trend_topic TEXT NOT NULL,
    platforms TEXT[] NOT NULL, -- ['twitter', 'hacker_news', 'github', 'google_trends']
    correlation_score DECIMAL(5,2) DEFAULT 0,
    mention_volume INTEGER DEFAULT 0,
    velocity_score DECIMAL(5,2) DEFAULT 0, -- How fast it's trending
    peak_timestamp TIMESTAMP WITH TIME ZONE,
    source_ids JSONB, -- Store IDs from different platforms
    keywords JSONB,
    ai_summary TEXT,
    market_opportunity_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced relevance scoring table for intelligent filtering
CREATE TABLE IF NOT EXISTS relevance_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_idea_id UUID,
    platform_source TEXT NOT NULL,
    engagement_metrics JSONB,
    content_quality_score DECIMAL(5,2) DEFAULT 0,
    author_credibility_score DECIMAL(5,2) DEFAULT 0,
    viral_potential_score DECIMAL(5,2) DEFAULT 0,
    business_viability_score DECIMAL(5,2) DEFAULT 0,
    technical_feasibility_score DECIMAL(5,2) DEFAULT 0,
    market_timing_score DECIMAL(5,2) DEFAULT 0,
    overall_relevance_score DECIMAL(5,2) DEFAULT 0,
    confidence_interval DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time trend tracking for velocity detection
CREATE TABLE IF NOT EXISTS trend_velocity_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trend_topic TEXT NOT NULL,
    platform TEXT NOT NULL,
    mention_count INTEGER DEFAULT 0,
    time_window TIMESTAMP WITH TIME ZONE NOT NULL,
    velocity_coefficient DECIMAL(8,4) DEFAULT 0,
    acceleration DECIMAL(8,4) DEFAULT 0,
    momentum_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced startup_ideas with professional-grade fields
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS correlation_id UUID;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS velocity_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS viral_indicators JSONB;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS market_timing_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS professional_grade_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS last_velocity_update TIMESTAMP WITH TIME ZONE;

-- Professional filtering indices for high-volume queries
CREATE INDEX IF NOT EXISTS idx_startup_ideas_professional_score ON startup_ideas(professional_grade_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_velocity ON startup_ideas(velocity_score DESC, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_correlation ON startup_ideas(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trend_correlations_score ON trend_correlations(correlation_score DESC, velocity_score DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_trends_engagement ON twitter_trends_data(engagement_score DESC, tweet_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_relevance_scores_overall ON relevance_scores(overall_relevance_score DESC, created_at DESC);

-- Update data_sources with X (Twitter) configuration
INSERT INTO data_sources (source_name, source_type, source_url, api_endpoint, requires_api_key, priority_level, configuration) VALUES
('X (Twitter) Trends', 'twitter_trends', 'https://twitter.com', 'https://serpapi.com/search', true, 1, '{"type": "twitter_search", "result_type": "recent", "lang": "en"}'),
('X (Twitter) Search', 'twitter_search', 'https://twitter.com', 'https://serpapi.com/search', true, 1, '{"type": "twitter_search", "result_type": "mixed", "lang": "en"}')
ON CONFLICT (source_name) DO UPDATE SET 
    source_type = EXCLUDED.source_type,
    api_endpoint = EXCLUDED.api_endpoint,
    requires_api_key = EXCLUDED.requires_api_key,
    priority_level = EXCLUDED.priority_level,
    configuration = EXCLUDED.configuration;;