CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE UNIQUE NOT NULL,
    total_ideas_analyzed INTEGER,
    top_ideas JSONB,
    special_mentions JSONB,
    analysis_summary TEXT,
    report_status TEXT DEFAULT 'generating',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);