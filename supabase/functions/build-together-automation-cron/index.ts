import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    console.log('Starting Build Together automation workflow...');

    const results = {
      daily_discovery: null,
      analysis: null,
      report_generation: null
    };

    // Step 1: Daily Painpoint Discovery
    try {
      console.log('Step 1: Running daily painpoint discovery...');
      
      const discoveryResponse = await supabase.functions.invoke('daily-painpoint-discovery', {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      });

      if (discoveryResponse.error) {
        throw new Error(`Discovery failed: ${discoveryResponse.error.message}`);
      }

      results.daily_discovery = discoveryResponse.data;
      console.log('Daily discovery completed:', results.daily_discovery);
      
    } catch (error) {
      console.error('Daily discovery error:', error);
      results.daily_discovery = { error: error.message };
    }

    // Step 2: Analyze new Build Together ideas
    try {
      console.log('Step 2: Running Build Together analysis...');
      
      const analysisResponse = await supabase.functions.invoke('build-together-analysis-engine', {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      });

      if (analysisResponse.error) {
        throw new Error(`Analysis failed: ${analysisResponse.error.message}`);
      }

      results.analysis = analysisResponse.data;
      console.log('Analysis completed:', results.analysis);
      
    } catch (error) {
      console.error('Analysis error:', error);
      results.analysis = { error: error.message };
    }

    // Step 3: Generate Build Together daily report
    try {
      console.log('Step 3: Generating Build Together report...');
      
      // Get top Build Together opportunities
      const { data: topOpportunities, error: fetchError } = await supabase
        .from('startup_ideas')
        .select(`
          *,
          idea_analysis (
            painpoint_severity_score,
            technical_feasibility_score,
            build_complexity,
            monthly_revenue_potential,
            competition_gap_score,
            saas_viability_score,
            market_analysis_text
          )
        `)
        .eq('category', 'build_together')
        .not('idea_analysis', 'is', null)
        .order('overall_score', { ascending: false })
        .limit(15);

      if (fetchError) {
        throw new Error(`Failed to fetch top opportunities: ${fetchError.message}`);
      }

      // Count new entries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: newEntriesCount } = await supabase
        .from('startup_ideas')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'build_together')
        .eq('is_new_entry', true)
        .gte('discovered_at', sevenDaysAgo.toISOString());

      // Generate daily report summary
      const reportData = {
        report_type: 'build_together_daily',
        generated_date: new Date().toISOString(),
        total_opportunities: topOpportunities?.length || 0,
        new_opportunities_this_week: newEntriesCount || 0,
        top_opportunities: topOpportunities || [],
        summary: {
          avg_delivery_time: calculateAverageDeliveryTime(topOpportunities || []),
          most_common_tech_stack: findMostCommonTechStack(topOpportunities || []),
          highest_revenue_potential: findHighestRevenuePotential(topOpportunities || []),
          easiest_builds: (topOpportunities || []).filter(op => 
            op.idea_analysis?.build_complexity === 'Simple'
          ).length
        }
      };

      // Store the daily report
      const { error: reportError } = await supabase
        .from('daily_reports')
        .insert({
          report_date: new Date().toISOString().split('T')[0],
          report_type: 'build_together',
          total_ideas: reportData.total_opportunities,
          new_ideas: reportData.new_opportunities_this_week,
          top_score: topOpportunities?.[0]?.overall_score || 0,
          data: reportData
        });

      if (reportError) {
        console.error('Failed to store report:', reportError);
      }

      results.report_generation = {
        success: true,
        total_opportunities: reportData.total_opportunities,
        new_this_week: reportData.new_opportunities_this_week
      };
      
      console.log('Report generation completed:', results.report_generation);
      
    } catch (error) {
      console.error('Report generation error:', error);
      results.report_generation = { error: error.message };
    }

    console.log('Build Together automation workflow completed');

    return new Response(JSON.stringify({
      success: true,
      message: 'Build Together automation workflow completed successfully',
      data: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Build Together automation error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'BUILD_TOGETHER_AUTOMATION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateAverageDeliveryTime(opportunities: any[]): number {
  if (opportunities.length === 0) return 0;
  
  const total = opportunities.reduce((sum, op) => sum + (op.delivery_timeline_weeks || 2), 0);
  return Math.round(total / opportunities.length * 10) / 10;
}

function findMostCommonTechStack(opportunities: any[]): string {
  const stackCounts: { [key: string]: number } = {};
  
  opportunities.forEach(op => {
    const stack = op.technical_stack_required || 'React, Supabase';
    stackCounts[stack] = (stackCounts[stack] || 0) + 1;
  });
  
  let mostCommon = 'React, Supabase';
  let maxCount = 0;
  
  for (const [stack, count] of Object.entries(stackCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = stack;
    }
  }
  
  return mostCommon;
}

function findHighestRevenuePotential(opportunities: any[]): string {
  let highest = '$0-100/month';
  let maxValue = 0;
  
  opportunities.forEach(op => {
    const revenue = op.idea_analysis?.monthly_revenue_potential || 500;
    
    if (revenue > maxValue) {
      maxValue = revenue;
      highest = `$${revenue}/month`;
    }
  });
  
  return highest;
}