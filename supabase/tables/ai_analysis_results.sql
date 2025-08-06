CREATE TABLE ai_analysis_results (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    item_type VARCHAR(50) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    gpt4_analysis JSONB,
    claude_analysis JSONB,
    combined_analysis JSONB,
    tier_used VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);