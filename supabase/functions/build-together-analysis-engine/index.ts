import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface BuildTogetherAnalysis {
  painpoint_severity_score: number;
  technical_feasibility: number;
  build_complexity: 'Simple' | 'Medium' | 'Complex';
  revenue_potential_monthly: string;
  competition_gap_score: number;
  saas_viability_score: number;
  overall_score: number;
  explanation: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    console.log('Starting Build Together analysis...');

    // Get unanalyzed Build Together ideas
    const { data: ideas, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('category', 'build_together')
      .is('analysis_id', null)
      .limit(20);

    if (fetchError) {
      throw new Error(`Failed to fetch ideas: ${fetchError.message}`);
    }

    if (!ideas || ideas.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No new Build Together ideas to analyze',
        analyzed_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Analyzing ${ideas.length} Build Together ideas...`);

    let analyzedCount = 0;

    for (const idea of ideas) {
      try {
        console.log(`Analyzing: ${idea.title}`);

        // Prepare analysis prompt for Build Together criteria
        const analysisPrompt = `
Analyze this painpoint for a "Build Together" opportunity (apps under $20K to build):

Title: ${idea.title}
Description: ${idea.painpoint_description || idea.description}
Source: ${idea.source}
Delivery Timeline: ${idea.delivery_timeline_weeks} weeks
Tech Stack: ${idea.technical_stack_required}

Provide analysis scores (1-100) and detailed explanations:

1. PAINPOINT SEVERITY SCORE (1-100): How many people have this problem and how painful is it?
2. TECHNICAL FEASIBILITY (1-100): Can this be built with standard web technologies in the given timeline?
3. BUILD COMPLEXITY: Simple/Medium/Complex (based on development difficulty)
4. REVENUE POTENTIAL: Estimate monthly SaaS revenue potential ($100-$10K/month range)
5. COMPETITION GAP SCORE (1-100): How underserved is this market?
6. SAAS VIABILITY SCORE (1-100): How well does this convert to recurring revenue?

Format your response as JSON:
{
  "painpoint_severity_score": number,
  "technical_feasibility": number,
  "build_complexity": "Simple|Medium|Complex",
  "revenue_potential_monthly": "$X-Y/month",
  "competition_gap_score": number,
  "saas_viability_score": number,
  "overall_score": number,
  "explanation": "Detailed explanation covering why this painpoint is significant, technical implementation approach, monetization strategy, market size, competitive advantages, and risk factors."
}

The overall_score should be a weighted average: (painpoint_severity * 0.25) + (technical_feasibility * 0.20) + (competition_gap * 0.20) + (saas_viability * 0.20) + (complexity_bonus * 0.15)
where complexity_bonus = 100 for Simple, 70 for Medium, 40 for Complex
`;

        // Call OpenAI for analysis
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are an expert startup advisor specializing in quick-build SaaS opportunities for solo developers and small teams. Focus on realistic, buildable solutions that can generate recurring revenue.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          }),
        });

        if (!openaiResponse.ok) {
          console.error(`OpenAI API error for idea ${idea.id}:`, await openaiResponse.text());
          continue;
        }

        const openaiData = await openaiResponse.json();
        const analysisContent = openaiData.choices[0]?.message?.content;

        if (!analysisContent) {
          console.error(`No analysis content for idea ${idea.id}`);
          continue;
        }

        // Parse JSON from OpenAI response
        let analysis: BuildTogetherAnalysis;
        try {
          // Extract JSON from the response
          const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in analysis response');
          }
        } catch (parseError) {
          console.error(`Failed to parse analysis for idea ${idea.id}:`, parseError);
          // Create fallback analysis
          analysis = createFallbackAnalysis(idea);
        }

        // Store analysis in database
        const { data: analysisRecord, error: analysisError } = await supabase
          .from('analysis')
          .insert({
            idea_id: idea.id,
            painpoint_severity_score: analysis.painpoint_severity_score,
            technical_feasibility: analysis.technical_feasibility,
            build_complexity: analysis.build_complexity,
            revenue_potential_monthly: analysis.revenue_potential_monthly,
            competition_gap_score: analysis.competition_gap_score,
            saas_viability_score: analysis.saas_viability_score,
            overall_score: analysis.overall_score,
            detailed_explanation: analysis.explanation,
            analysis_date: new Date().toISOString()
          })
          .select()
          .single();

        if (analysisError) {
          console.error(`Failed to store analysis for idea ${idea.id}:`, analysisError);
          continue;
        }

        // Update idea with analysis_id
        await supabase
          .from('ideas')
          .update({ analysis_id: analysisRecord.id })
          .eq('id', idea.id);

        analyzedCount++;
        console.log(`Successfully analyzed idea ${idea.id}`);

        // Rate limiting for OpenAI
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error analyzing idea ${idea.id}:`, error);
        continue;
      }
    }

    console.log(`Completed Build Together analysis. Analyzed ${analyzedCount} ideas.`);

    return new Response(JSON.stringify({
      success: true,
      message: `Build Together analysis completed. Analyzed ${analyzedCount} of ${ideas.length} ideas.`,
      data: {
        total_ideas: ideas.length,
        analyzed_count: analyzedCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Build Together analysis error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'BUILD_TOGETHER_ANALYSIS_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function createFallbackAnalysis(idea: any): BuildTogetherAnalysis {
  // Create basic analysis based on available data
  const baseScore = 60;
  const complexityScore = idea.delivery_timeline_weeks <= 2 ? 'Simple' : 
                         idea.delivery_timeline_weeks <= 3 ? 'Medium' : 'Complex';
  
  const complexityBonus = complexityScore === 'Simple' ? 100 : 
                         complexityScore === 'Medium' ? 70 : 40;
  
  const overallScore = Math.round(
    (baseScore * 0.25) + // painpoint_severity
    (baseScore * 0.20) + // technical_feasibility
    (baseScore * 0.20) + // competition_gap
    (baseScore * 0.20) + // saas_viability
    (complexityBonus * 0.15) // complexity_bonus
  );
  
  return {
    painpoint_severity_score: baseScore,
    technical_feasibility: baseScore,
    build_complexity: complexityScore,
    revenue_potential_monthly: '$500-2000/month',
    competition_gap_score: baseScore,
    saas_viability_score: baseScore,
    overall_score: overallScore,
    explanation: `This painpoint from ${idea.source} represents a potential Build Together opportunity. Further analysis needed to determine market viability and technical implementation details.`
  };
}