-- Migration: add_build_together_features
-- Created at: 1754010502

-- Add new columns to ideas table for Build Together features
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'traditional_startup';
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS painpoint_description TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS delivery_timeline_weeks INTEGER DEFAULT 2;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS monetization_model TEXT DEFAULT 'SaaS Subscription';
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS technical_stack_required TEXT DEFAULT 'React, Node.js, PostgreSQL';
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS is_new_entry BOOLEAN DEFAULT false;

-- Add new columns to analysis table for Build Together metrics
ALTER TABLE public.analysis ADD COLUMN IF NOT EXISTS painpoint_severity_score INTEGER;
ALTER TABLE public.analysis ADD COLUMN IF NOT EXISTS technical_feasibility INTEGER;
ALTER TABLE public.analysis ADD COLUMN IF NOT EXISTS build_complexity TEXT;
ALTER TABLE public.analysis ADD COLUMN IF NOT EXISTS revenue_potential_monthly TEXT;
ALTER TABLE public.analysis ADD COLUMN IF NOT EXISTS competition_gap_score INTEGER;
ALTER TABLE public.analysis ADD COLUMN IF NOT EXISTS saas_viability_score INTEGER;
ALTER TABLE public.analysis ADD COLUMN IF NOT EXISTS detailed_explanation TEXT;

-- Create index for better performance on category queries
CREATE INDEX IF NOT EXISTS idx_ideas_category ON public.ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_is_new_entry ON public.ideas(is_new_entry);

-- Update daily_reports table to support build_together reports
ALTER TABLE public.daily_reports ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'traditional';

-- Create a view for Build Together opportunities
CREATE OR REPLACE VIEW build_together_opportunities AS
SELECT 
    i.*,
    a.painpoint_severity_score,
    a.technical_feasibility,
    a.build_complexity,
    a.revenue_potential_monthly,
    a.competition_gap_score,
    a.saas_viability_score,
    a.overall_score,
    a.detailed_explanation
FROM ideas i
LEFT JOIN analysis a ON i.analysis_id = a.id
WHERE i.category = 'build_together'
ORDER BY a.overall_score DESC NULLS LAST;;