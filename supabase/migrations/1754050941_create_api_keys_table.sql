-- Migration: create_api_keys_table
-- Created at: 1754050941

-- Create api_keys table for professional intelligence features
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL UNIQUE,
    api_key_value TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_tested_at TIMESTAMP WITH TIME ZONE,
    test_status TEXT DEFAULT 'pending'
);

-- Insert default API key configurations
INSERT INTO api_keys (service_name, api_key_value, is_active) VALUES
('openai', NULL, false),
('github', NULL, false),
('serpapi', NULL, false)
ON CONFLICT (service_name) DO NOTHING;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE PROCEDURE update_api_keys_updated_at();;