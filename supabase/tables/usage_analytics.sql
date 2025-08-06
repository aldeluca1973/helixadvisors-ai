CREATE TABLE usage_analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type VARCHAR(50) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);