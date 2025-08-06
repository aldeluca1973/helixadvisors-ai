-- Migration: add_build_together_support
-- Created at: 1754010104

-- Add new fields to support Build Together functionality
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'traditional_startup';
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS delivery_timeline_weeks INTEGER;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS painpoint_description TEXT;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS monetization_model TEXT;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS technical_stack_required JSONB;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS is_new_entry BOOLEAN DEFAULT FALSE;
ALTER TABLE startup_ideas ADD COLUMN IF NOT EXISTS new_entry_timestamp TIMESTAMP WITH TIME ZONE;

-- Add new fields to idea_analysis for Build Together metrics
ALTER TABLE idea_analysis ADD COLUMN IF NOT EXISTS painpoint_severity_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE idea_analysis ADD COLUMN IF NOT EXISTS technical_feasibility_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE idea_analysis ADD COLUMN IF NOT EXISTS build_complexity TEXT;
ALTER TABLE idea_analysis ADD COLUMN IF NOT EXISTS saas_viability_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE idea_analysis ADD COLUMN IF NOT EXISTS competition_gap_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE idea_analysis ADD COLUMN IF NOT EXISTS monthly_revenue_potential INTEGER;

-- Create index for faster Build Together queries
CREATE INDEX IF NOT EXISTS idx_startup_ideas_category ON startup_ideas(category);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_new_entry ON startup_ideas(is_new_entry, new_entry_timestamp);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_build_together ON startup_ideas(category, overall_score) WHERE category = 'build_together';;