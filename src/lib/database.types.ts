export interface Database {
  public: {
    Tables: {
      startup_ideas: {
        Row: {
          id: string
          title: string
          description: string | null
          source_url: string | null
          source_platform: string | null
          discovered_at: string
          category: string | null
          industry: string | null
          business_model: string | null
          target_market: string | null
          overall_score: number
          market_score: number
          competition_score: number
          development_score: number
          roi_score: number
          is_special_mention: boolean
          status: string
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          source_url?: string | null
          source_platform?: string | null
          discovered_at?: string
          category?: string | null
          industry?: string | null
          business_model?: string | null
          target_market?: string | null
          overall_score?: number
          market_score?: number
          competition_score?: number
          development_score?: number
          roi_score?: number
          is_special_mention?: boolean
          status?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          source_url?: string | null
          source_platform?: string | null
          discovered_at?: string
          category?: string | null
          industry?: string | null
          business_model?: string | null
          target_market?: string | null
          overall_score?: number
          market_score?: number
          competition_score?: number
          development_score?: number
          roi_score?: number
          is_special_mention?: boolean
          status?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      idea_analysis: {
        Row: {
          id: string
          idea_id: string
          tam_size: number | null
          sam_size: number | null
          som_size: number | null
          growth_projection: number | null
          market_analysis_text: string | null
          competitor_count: number | null
          market_saturation_level: string | null
          development_complexity: string | null
          estimated_cost: number | null
          time_to_market_months: number | null
          revenue_model: string | null
          roi_calculation: string | null
          risk_factors: Record<string, any> | null
          created_at: string
        }
      }
      competitors: {
        Row: {
          id: string
          idea_id: string
          competitor_name: string
          competitor_url: string | null
          market_share: number | null
          funding_amount: number | null
          founded_year: number | null
          employee_count: number | null
          strengths: Record<string, any> | null
          weaknesses: Record<string, any> | null
          website_traffic: number | null
          created_at: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          report_date: string
          total_ideas_analyzed: number | null
          top_ideas: Record<string, any> | null
          special_mentions: Record<string, any> | null
          analysis_summary: string | null
          report_status: string
          generated_at: string
        }
      }
      historical_trends: {
        Row: {
          id: string
          trend_date: string
          category: string | null
          industry: string | null
          avg_score: number | null
          idea_count: number | null
          trending_keywords: Record<string, any> | null
          created_at: string
        }
      }
      scoring_weights: {
        Row: {
          id: string
          weight_name: string
          weight_value: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      system_notifications: {
        Row: {
          id: string
          notification_type: string
          title: string
          message: string | null
          severity: string
          is_read: boolean
          related_idea_id: string | null
          created_at: string
        }
      }
    }
  }
}

// Type helpers
export type StartupIdea = Database['public']['Tables']['startup_ideas']['Row']
export type IdeaAnalysis = Database['public']['Tables']['idea_analysis']['Row']
export type Competitor = Database['public']['Tables']['competitors']['Row']
export type DailyReport = Database['public']['Tables']['daily_reports']['Row']
export type HistoricalTrend = Database['public']['Tables']['historical_trends']['Row']
export type ScoringWeight = Database['public']['Tables']['scoring_weights']['Row']
export type SystemNotification = Database['public']['Tables']['system_notifications']['Row']

export interface TopIdea {
  rank: number
  id: string
  title: string
  description: string
  category: string
  industry: string
  overall_score: number
  market_score: number
  competition_score: number
  development_score: number
  roi_score: number
  source_platform: string
  source_url: string
}

export interface SpecialMention {
  id: string
  title: string
  description: string
  category: string
  overall_score: number
  market_score: number
  reason: string
}

export interface IdeaDetails {
  idea: StartupIdea
  analysis: IdeaAnalysis
  competitors: Competitor[]
}