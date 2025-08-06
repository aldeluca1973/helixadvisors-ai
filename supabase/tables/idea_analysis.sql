CREATE TABLE idea_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL,
    tam_size BIGINT,
    sam_size BIGINT,
    som_size BIGINT,
    growth_projection DECIMAL(5,2),
    market_analysis_text TEXT,
    competitor_count INTEGER,
    market_saturation_level TEXT,
    development_complexity TEXT,
    estimated_cost DECIMAL(12,2),
    time_to_market_months INTEGER,
    revenue_model TEXT,
    roi_calculation TEXT,
    risk_factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);