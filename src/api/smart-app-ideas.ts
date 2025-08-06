import { supabase } from '@/lib/supabase';
import { SmartAppIdea, SmartAppIdeaReport, SmartAppIdeaStats } from '@/types/smart-app-ideas';

// Get top Smart App Ideas opportunities
export async function getSmartAppIdeasOpportunities(limit: number = 15): Promise<SmartAppIdea[]> {
  try {
    const { data, error } = await supabase
      .from('startup_ideas')
      .select(`
        *,
        idea_analysis!inner (
          id,
          painpoint_severity_score,
          technical_feasibility_score,
          build_complexity,
          monthly_revenue_potential,
          competition_gap_score,
          saas_viability_score,
          market_analysis_text,
          created_at
        )
      `)
      .eq('category', 'smart_app_ideas')
      .order('overall_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching Smart App Ideas opportunities:', error);
      return [];
    }

    return (data || []).map(item => {
      const analysis = Array.isArray(item.idea_analysis) ? item.idea_analysis[0] : item.idea_analysis;
      
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        painpoint_description: item.painpoint_description,
        source: item.source_platform || 'Web',
        url: item.source_url,
        date_discovered: item.discovered_at,
        category: 'smart_app_ideas' as const,
        delivery_timeline_weeks: item.delivery_timeline_weeks || 2,
        monetization_model: item.monetization_model || 'SaaS Subscription',
        technical_stack_required: Array.isArray(item.technical_stack_required) 
          ? item.technical_stack_required.join(', ') 
          : item.technical_stack_required || 'React, Supabase',
        is_new_entry: item.is_new_entry || false,
        overall_score: Number(item.overall_score) || 0,
        analysis: analysis ? {
          id: analysis.id,
          painpoint_severity_score: Number(analysis.painpoint_severity_score) || 0,
          technical_feasibility: Number(analysis.technical_feasibility_score) || 0,
          build_complexity: analysis.build_complexity || 'Medium',
          revenue_potential_monthly: `$${analysis.monthly_revenue_potential || 500}/month`,
          competition_gap_score: Number(analysis.competition_gap_score) || 0,
          saas_viability_score: Number(analysis.saas_viability_score) || 0,
          overall_score: Number(item.overall_score) || 0,
          detailed_explanation: analysis.market_analysis_text || '',
          analysis_date: analysis.created_at
        } : undefined
      };
    });

  } catch (error) {
    console.error('Error in getSmartAppIdeasOpportunities:', error);
    return [];
  }
}

// Get Smart App Ideas daily report
export async function getSmartAppIdeasDailyReport(): Promise<SmartAppIdeaReport | null> {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_type', 'smart_app_ideas')
      .order('report_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('Error fetching Smart App Ideas report:', error);
      return null;
    }

    return {
      report_date: data.report_date,
      report_type: data.report_type,
      total_ideas: data.total_ideas,
      new_ideas: data.new_ideas,
      top_score: data.top_score,
      data: data.data
    };

  } catch (error) {
    console.error('Error in getSmartAppIdeasDailyReport:', error);
    return null;
  }
}

// Get Smart App Ideas statistics
export async function getSmartAppIdeasStats(): Promise<SmartAppIdeaStats> {
  try {
    // Get total opportunities
    const { count: totalCount } = await supabase
      .from('startup_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'smart_app_ideas');

    // Get new opportunities this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: newThisWeek } = await supabase
      .from('startup_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'smart_app_ideas')
      .eq('is_new_entry', true)
      .gte('discovered_at', oneWeekAgo.toISOString());

    // Get delivery time and complexity statistics
    const { data: complexityData } = await supabase
      .from('startup_ideas')
      .select(`
        delivery_timeline_weeks,
        idea_analysis(build_complexity),
        source_platform
      `)
      .eq('category', 'smart_app_ideas')
      .not('idea_analysis', 'is', null);

    const avgDeliveryTime = complexityData?.length 
      ? complexityData.reduce((sum, item) => sum + (item.delivery_timeline_weeks || 2), 0) / complexityData.length
      : 2;

    const complexityCounts = {
      simple: 0,
      medium: 0,
      complex: 0
    };

    const sourceCounts: { [key: string]: number } = {};

    complexityData?.forEach(item => {
      const analysis = Array.isArray(item.idea_analysis) ? item.idea_analysis[0] : item.idea_analysis;
      const complexity = analysis?.build_complexity?.toLowerCase() || 'medium';
      if (complexity === 'simple') complexityCounts.simple++;
      else if (complexity === 'complex') complexityCounts.complex++;
      else complexityCounts.medium++;

      const source = item.source_platform || 'Web';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_opportunities: totalCount || 0,
      new_this_week: newThisWeek || 0,
      avg_delivery_time: Math.round(avgDeliveryTime * 10) / 10,
      simple_builds: complexityCounts.simple,
      medium_builds: complexityCounts.medium,
      complex_builds: complexityCounts.complex,
      avg_revenue_potential: 1500, // Estimated average
      top_painpoint_sources: topSources
    };

  } catch (error) {
    console.error('Error in getSmartAppIdeasStats:', error);
    return {
      total_opportunities: 0,
      new_this_week: 0,
      avg_delivery_time: 2,
      simple_builds: 0,
      medium_builds: 0,
      complex_builds: 0,
      avg_revenue_potential: 0,
      top_painpoint_sources: []
    };
  }
}

// Trigger historical backfill
export async function triggerHistoricalBackfill(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('backfill-painpoints-engine');
    
    if (error) {
      throw error;
    }

    return {
      success: true,
      message: data?.message || 'Historical backfill completed successfully'
    };
  } catch (error) {
    console.error('Error triggering backfill:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to trigger backfill'
    };
  }
}