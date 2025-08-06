-- Migration: add_missing_foreign_keys
-- Created at: 1754067616

-- Add foreign key constraints for proper joins
ALTER TABLE painpoint_mentions 
ADD CONSTRAINT fk_painpoint_mentions_startup_idea_id 
FOREIGN KEY (startup_idea_id) REFERENCES startup_ideas(id);

ALTER TABLE sentiment_analysis_results 
ADD CONSTRAINT fk_sentiment_analysis_results_startup_idea_id 
FOREIGN KEY (startup_idea_id) REFERENCES startup_ideas(id);;