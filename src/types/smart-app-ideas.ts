// Smart App Ideas specific types
export interface SmartAppIdea {
  id: string;
  title: string;
  description: string;
  painpoint_description?: string;
  source: string;
  url: string;
  date_discovered: string;
  category: 'smart_app_ideas';
  delivery_timeline_weeks: number;
  monetization_model: string;
  technical_stack_required: string;
  is_new_entry: boolean;
  overall_score: number;
  analysis?: SmartAppIdeaAnalysis;
}

export interface SmartAppIdeaAnalysis {
  id: string;
  painpoint_severity_score: number;
  technical_feasibility: number;
  build_complexity: 'Simple' | 'Medium' | 'Complex';
  revenue_potential_monthly: string;
  competition_gap_score: number;
  saas_viability_score: number;
  overall_score: number;
  detailed_explanation: string;
  analysis_date: string;
}

export interface SmartAppIdeaReport {
  report_date: string;
  report_type: 'smart_app_ideas';
  total_ideas: number;
  new_ideas: number;
  top_score: number;
  data: {
    report_type: string;
    generated_date: string;
    total_opportunities: number;
    new_opportunities_this_week: number;
    top_opportunities: SmartAppIdea[];
    summary: {
      avg_delivery_time: number;
      most_common_tech_stack: string;
      highest_revenue_potential: string;
      easiest_builds: number;
    };
  };
}

export interface SmartAppIdeaStats {
  total_opportunities: number;
  new_this_week: number;
  avg_delivery_time: number;
  simple_builds: number;
  medium_builds: number;
  complex_builds: number;
  avg_revenue_potential: number;
  top_painpoint_sources: { source: string; count: number }[];
}