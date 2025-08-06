-- Migration: enhance_painpoint_discovery_system
-- Created at: 1754045763

-- Enhance startup_ideas table with new intelligence fields
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS cross_validation_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS trend_momentum DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS timing_optimization TEXT;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS technical_feasibility_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS llm_summary TEXT;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS data_source_count INTEGER DEFAULT 1;

-- Create painpoint_mentions table for tracking multi-source mentions
CREATE TABLE IF NOT EXISTS painpoint_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_idea_id UUID,
    data_source TEXT NOT NULL,
    source_url TEXT,
    mention_text TEXT,
    raw_data JSONB,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create google_trends_data table
CREATE TABLE IF NOT EXISTS google_trends_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    region TEXT DEFAULT 'US',
    timeframe TEXT DEFAULT 'today 12-m',
    interest_over_time JSONB,
    related_queries JSONB,
    rising_queries JSONB,
    peak_interest INTEGER DEFAULT 0,
    trend_direction TEXT, -- 'rising', 'falling', 'stable'
    momentum_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_store_reviews table
CREATE TABLE IF NOT EXISTS app_store_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name TEXT NOT NULL,
    app_id TEXT,
    platform TEXT, -- 'ios' or 'android'
    review_text TEXT,
    rating INTEGER,
    review_date TIMESTAMP WITH TIME ZONE,
    sentiment_score DECIMAL(5,2),
    extracted_painpoint TEXT,
    is_feature_request BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create github_issues_data table
CREATE TABLE IF NOT EXISTS github_issues_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_name TEXT NOT NULL,
    issue_number INTEGER,
    issue_title TEXT,
    issue_body TEXT,
    labels JSONB,
    issue_url TEXT,
    created_at_github TIMESTAMP WITH TIME ZONE,
    reactions_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_feature_request BOOLEAN DEFAULT FALSE,
    painpoint_extracted TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cross_validation_results table
CREATE TABLE IF NOT EXISTS cross_validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_idea_id UUID,
    validation_sources TEXT[], -- Array of source names that mention this painpoint
    similarity_scores JSONB, -- Semantic similarity scores between sources
    validation_confidence DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sentiment_analysis_results table
CREATE TABLE IF NOT EXISTS sentiment_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_idea_id UUID,
    source_type TEXT,
    sentiment_score DECIMAL(5,2), -- -1 to 1 scale
    frustration_intensity DECIMAL(5,2), -- 0 to 1 scale
    urgency_score DECIMAL(5,2), -- 0 to 1 scale
    analyzed_text TEXT,
    emotion_breakdown JSONB, -- anger, frustration, hope, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update data_sources table with new fields
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS rate_limit_per_hour INTEGER DEFAULT 100;
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS requires_api_key BOOLEAN DEFAULT FALSE;
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1;
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2) DEFAULT 0;

-- Insert new data sources
INSERT INTO data_sources (source_name, source_type, source_url, api_endpoint, requires_api_key, priority_level, configuration) VALUES
('Google Trends', 'trends', 'https://trends.google.com', 'https://serpapi.com/search', true, 1, '{"type": "google_trends", "geo": "US", "hl": "en"}'),
('App Store Reviews', 'app_reviews', 'https://apps.apple.com', 'https://itunes.apple.com/search', false, 2, '{"type": "app_store", "country": "us", "media": "software"}'),
('Google Play Reviews', 'app_reviews', 'https://play.google.com', 'https://play.google.com/store/apps', false, 2, '{"type": "google_play", "region": "us"}'),
('GitHub Issues Enhanced', 'github_issues', 'https://api.github.com', 'https://api.github.com/search/issues', true, 1, '{"type": "github_issues", "sort": "reactions", "order": "desc"}'),
('Hacker News Enhanced', 'hn_enhanced', 'https://hn.algolia.com', 'https://hn.algolia.com/api/v1/search', false, 1, '{"type": "hn_enhanced", "tags": "ask_hn,show_hn"}')
ON CONFLICT (source_name) DO UPDATE SET 
    source_type = EXCLUDED.source_type,
    api_endpoint = EXCLUDED.api_endpoint,
    requires_api_key = EXCLUDED.requires_api_key,
    priority_level = EXCLUDED.priority_level,
    configuration = EXCLUDED.configuration;;