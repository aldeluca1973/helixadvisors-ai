-- Hidden/Bookmarked Ideas Table for Personal Project Management
CREATE TABLE hidden_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES startup_ideas(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'hidden' CHECK (status IN ('hidden', 'building', 'completed', 'paused')),
    notes TEXT,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_budget DECIMAL(12,2),
    target_launch_date DATE,
    tags TEXT[], -- Array of custom tags
    private_notes TEXT, -- Personal notes not visible in exports
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate bookmarks
    UNIQUE(user_id, idea_id)
);

-- Create indexes for performance
CREATE INDEX idx_hidden_ideas_user_id ON hidden_ideas(user_id);
CREATE INDEX idx_hidden_ideas_status ON hidden_ideas(status);
CREATE INDEX idx_hidden_ideas_created_at ON hidden_ideas(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE hidden_ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own hidden ideas
CREATE POLICY "Users can view own hidden ideas" ON hidden_ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hidden ideas" ON hidden_ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hidden ideas" ON hidden_ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hidden ideas" ON hidden_ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hidden_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_hidden_ideas_updated_at_trigger
    BEFORE UPDATE ON hidden_ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_hidden_ideas_updated_at();