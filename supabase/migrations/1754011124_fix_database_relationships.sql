-- Migration: fix_database_relationships
-- Created at: 1754011124

-- Create proper foreign key relationship between idea_analysis and startup_ideas
ALTER TABLE idea_analysis 
ADD CONSTRAINT fk_idea_analysis_startup_ideas 
FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE;

-- Create index for better performance on joins
CREATE INDEX IF NOT EXISTS idx_idea_analysis_idea_id ON idea_analysis(idea_id);

-- Update the Build Together automation Edge Function compatibility view
CREATE OR REPLACE VIEW build_together_ideas_with_analysis AS
SELECT 
    si.*,
    ia.id as analysis_id,
    ia.painpoint_severity_score,
    ia.technical_feasibility_score,
    ia.build_complexity,
    ia.monthly_revenue_potential,
    ia.competition_gap_score,
    ia.saas_viability_score,
    ia.market_analysis_text,
    ia.created_at as analysis_created_at
FROM startup_ideas si
LEFT JOIN idea_analysis ia ON si.id = ia.idea_id
WHERE si.category = 'build_together'
ORDER BY si.overall_score DESC;;