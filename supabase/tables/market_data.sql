CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL,
    data_type TEXT NOT NULL,
    metric_name TEXT,
    metric_value TEXT,
    data_source TEXT,
    confidence_score DECIMAL(3,2),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);