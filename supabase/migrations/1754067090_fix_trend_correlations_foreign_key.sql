-- Migration: fix_trend_correlations_foreign_key
-- Created at: 1754067090

-- Add foreign key constraint between startup_ideas and trend_correlations
ALTER TABLE startup_ideas 
ADD CONSTRAINT fk_startup_ideas_correlation_id 
FOREIGN KEY (correlation_id) REFERENCES trend_correlations(id);;