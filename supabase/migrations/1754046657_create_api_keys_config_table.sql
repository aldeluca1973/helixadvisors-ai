-- Migration: create_api_keys_config_table
-- Created at: 1754046657

-- Create API keys configuration table for secure storage
CREATE TABLE IF NOT EXISTS api_keys_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_type TEXT UNIQUE NOT NULL,
    key_value_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_tested TIMESTAMP WITH TIME ZONE,
    test_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for secure access
ALTER TABLE api_keys_config ENABLE ROW LEVEL SECURITY;

-- Policy for service role access only
CREATE POLICY "Service role can manage API keys" 
ON api_keys_config 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);;