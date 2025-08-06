CREATE TABLE historical_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trend_date DATE NOT NULL,
    category TEXT,
    industry TEXT,
    avg_score DECIMAL(5,2),
    idea_count INTEGER,
    trending_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);