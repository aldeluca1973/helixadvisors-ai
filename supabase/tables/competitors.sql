CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL,
    competitor_name TEXT NOT NULL,
    competitor_url TEXT,
    market_share DECIMAL(5,2),
    funding_amount DECIMAL(15,2),
    founded_year INTEGER,
    employee_count INTEGER,
    strengths JSONB,
    weaknesses JSONB,
    website_traffic BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);