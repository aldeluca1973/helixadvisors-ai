-- Migration: add_missing_professional_columns
-- Created at: 1754050932

-- Add missing professional columns to startup_ideas table
ALTER TABLE startup_ideas 
ADD COLUMN IF NOT EXISTS overall_relevance_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS business_viability_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_relevance_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cross_platform_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_confidence_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_analysis BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cross_platform_mentions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_keywords JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS trend_category TEXT,
ADD COLUMN IF NOT EXISTS market_opportunity TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS technical_requirements TEXT,
ADD COLUMN IF NOT EXISTS business_model_potential TEXT,
ADD COLUMN IF NOT EXISTS competitive_landscape TEXT,
ADD COLUMN IF NOT EXISTS implementation_complexity INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS market_size_estimate TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS monetization_potential TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS professional_confidence_score NUMERIC DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS content_quality_score NUMERIC DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS competitive_advantage_score NUMERIC DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS professional_scoring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS high_value_opportunity BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS professional_grade BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS professional_analysis_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_professional_update TIMESTAMP WITH TIME ZONE;

-- Add missing columns to trend_correlations table
ALTER TABLE trend_correlations 
ADD COLUMN IF NOT EXISTS cross_platform_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_confidence_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_analysis BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validated_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS acceleration_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS momentum_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_velocity_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS velocity_confidence NUMERIC DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS last_velocity_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trend_id TEXT,
ADD COLUMN IF NOT EXISTS professional_keywords JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS professional_ai_summary TEXT,
ADD COLUMN IF NOT EXISTS average_quality_score NUMERIC DEFAULT 0.5;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_startup_ideas_overall_relevance ON startup_ideas(overall_relevance_score);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_cross_platform ON startup_ideas(cross_platform_validated);
CREATE INDEX IF NOT EXISTS idx_trend_correlations_cross_platform ON trend_correlations(cross_platform_validated);

-- Update overall_relevance_score to match existing overall_score for backwards compatibility
UPDATE startup_ideas SET overall_relevance_score = COALESCE(overall_score, quality_score, 0.5) WHERE overall_relevance_score = 0;;