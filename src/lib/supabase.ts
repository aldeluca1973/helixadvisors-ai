import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { config } from '@/config'

export const supabase = createClient<Database>(config.supabaseUrl, config.supabaseAnonKey)

// Helper functions for API calls
export const api = {
  // Get daily report
  async getDailyReport(date?: string) {
    const reportDate = date || new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', reportDate)
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  // Get startup ideas with pagination
  async getStartupIdeas(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select('*')
      .eq('status', 'analyzed')
      .order('overall_score', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get idea details with analysis
  async getIdeaDetails(ideaId: string) {
    const [ideaResponse, analysisResponse, competitorsResponse] = await Promise.all([
      supabase.from('startup_ideas').select('*').eq('id', ideaId).maybeSingle(),
      supabase.from('idea_analysis').select('*').eq('idea_id', ideaId).maybeSingle(),
      supabase.from('competitors').select('*').eq('idea_id', ideaId)
    ])

    if (ideaResponse.error) throw ideaResponse.error
    if (analysisResponse.error) throw analysisResponse.error
    if (competitorsResponse.error) throw competitorsResponse.error

    return {
      idea: ideaResponse.data,
      analysis: analysisResponse.data,
      competitors: competitorsResponse.data
    }
  },

  // Get historical trends
  async getHistoricalTrends(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('historical_trends')
      .select('*')
      .gte('trend_date', startDate.toISOString().split('T')[0])
      .order('trend_date', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get scoring weights
  async getScoringWeights() {
    const { data, error } = await supabase
      .from('scoring_weights')
      .select('*')
      .eq('is_active', true)
      .order('weight_name')
    
    if (error) throw error
    return data
  },

  // Update scoring weights
  async updateScoringWeight(weightName: string, newValue: number) {
    const { error } = await supabase
      .from('scoring_weights')
      .update({ 
        weight_value: newValue,
        updated_at: new Date().toISOString()
      })
      .eq('weight_name', weightName)
    
    if (error) throw error
  },

  // Get notifications
  async getNotifications(limit = 20) {
    const { data, error } = await supabase
      .from('system_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Trigger manual data collection
  async triggerDataCollection() {
    const { data, error } = await supabase.functions.invoke('data-collection-engine', {
      body: { manual_trigger: true }
    })
    
    if (error) throw error
    return data
  },

  // Generate manual report
  async generateReport() {
    const { data, error } = await supabase.functions.invoke('daily-report-generator', {
      body: { manual_trigger: true }
    })
    
    if (error) throw error
    return data
  },

  // Trigger multi-source intelligence engine
  async triggerMultiSourceIntelligence() {
    const { data, error } = await supabase.functions.invoke('multi-source-intelligence-engine', {
      body: { manual_trigger: true }
    })
    
    if (error) throw error
    return data
  },

  // Get enhanced startup ideas with intelligence scores
  async getEnhancedStartupIdeas(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select('*')
      .not('quality_score', 'is', null)
      .order('quality_score', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get cross-validation dashboard data
  async getCrossValidationData() {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select(`
        id,
        title,
        cross_validation_score,
        data_source_count,
        quality_score,
        sentiment_score
      `)
      .not('cross_validation_score', 'is', null)
      .gte('cross_validation_score', 0.1)
      .order('cross_validation_score', { ascending: false })
      .limit(20)
    
    if (error) throw error
    return data
  },

  // Get sentiment analysis trends
  async getSentimentTrends(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('sentiment_analysis_results')
      .select(`
        created_at,
        sentiment_score,
        frustration_intensity,
        urgency_score
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get Google Trends data
  async getGoogleTrendsData(limit = 20) {
    const { data, error } = await supabase
      .from('google_trends_data')
      .select('*')
      .order('momentum_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get GitHub issues analysis
  async getGitHubIssuesData(limit = 30) {
    const { data, error } = await supabase
      .from('github_issues_data')
      .select('*')
      .eq('is_feature_request', true)
      .order('reactions_count', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get professional trends with filtering
  async getProfessionalTrends(filters: any) {
    let query = supabase
      .from('startup_ideas')
      .select(`
        *,
        trend_correlations:correlation_id(
          trend_topic,
          correlation_score,
          velocity_score,
          platforms
        )
      `)
      .order('overall_relevance_score', { ascending: false })
    
    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      let startDate: Date
      
      switch (filters.dateRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
      
      query = query.gte('created_at', startDate.toISOString())
    }
    
    // Apply relevance filter - show all data including null scores
    if (filters.relevanceMin > 0) {
      query = query.or(`overall_relevance_score.gte.${filters.relevanceMin},overall_relevance_score.is.null`)
    }
    
    const { data, error } = await query.limit(200)
    
    if (error) throw error
    return data
  },

  // Get trend correlations
  async getTrendCorrelations(limit = 20) {
    const { data, error } = await supabase
      .from('trend_correlations')
      .select('*')
      .eq('cross_platform_validated', true)
      .order('correlation_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get X (Twitter) trends
  async getTwitterTrends(limit = 50) {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select('*')
      .in('source_platform', ['twitter', 'x'])
      .order('professional_relevance_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get cross-platform intelligence
  async getCrossPlatformIntelligence() {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select(`
        *,
        trend_correlations:correlation_id!inner(
          trend_topic,
          correlation_score,
          platforms,
          mention_volume
        )
      `)
      .eq('cross_platform_validated', true)
      .order('business_confidence_score', { ascending: false })
      .limit(50)
    
    if (error) throw error
    return data
  },

  // Get professional market intelligence summary
  async getMarketIntelligenceSummary() {
    const [trendsData, correlationsData, velocityData] = await Promise.all([
      this.getProfessionalTrends({ dateRange: '7d', relevanceMin: 0.6 }),
      this.getTrendCorrelations(10),
      supabase
        .from('trend_correlations')
        .select('*')
        .order('velocity_score', { ascending: false })
        .limit(10)
    ])
    
    return {
      trends: trendsData,
      correlations: correlationsData,
      highVelocityTrends: velocityData.data
    }
  },

  // Save professional trend bookmark
  async saveTrendBookmark(trendId: string, notes?: string) {
    const { data, error } = await supabase
      .from('trend_bookmarks')
      .insert({
        startup_idea_id: trendId,
        notes: notes || '',
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
    return data
  },

  // Get professional trend bookmarks
  async getTrendBookmarks() {
    const { data, error } = await supabase
      .from('trend_bookmarks')
      .select(`
        *,
        startup_ideas(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}