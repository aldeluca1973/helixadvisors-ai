import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface DailyPainpoint {
  title: string;
  description: string;
  source: string;
  url: string;
  painpoint_severity: number;
  urgency_indicators: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serperApiKey = Deno.env.get('SERPER_API_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    console.log('Starting daily painpoint discovery...');

    // Focus on fresh, urgent painpoints for Build Together opportunities
    const dailyQueries = [
      // Recent Reddit posts with urgency
      'site:reddit.com/r/entrepreneur "urgent need" OR "desperately need" OR "ASAP" "app" OR "tool" OR "solution"',
      'site:reddit.com/r/SideProject "quick build" OR "simple app" OR "weekend project" "need"',
      'site:reddit.com/r/startups "immediate pain" OR "daily frustration" OR "killing productivity"',
      
      // Indie Hackers fresh opportunities
      'site:indiehackers.com "would pay for" OR "market opportunity" OR "unmet need" after:2025-07-25',
      'site:indiehackers.com "build together" OR "co-founder" OR "technical partner" "idea"',
      
      // Recent developer frustrations
      'site:twitter.com "why doesn\'t exist" OR "someone build this" OR "take my money" tool app',
      'site:stackoverflow.com "no solution" OR "manual workaround" OR "time wasting" after:2025-07-25',
      
      // GitHub feature requests
      'site:github.com "feature request" OR "enhancement needed" OR "would love" after:2025-07-25'
    ];

    const todaysPainpoints: DailyPainpoint[] = [];
    
    for (const query of dailyQueries) {
      try {
        console.log(`Daily search: ${query}`);
        
        const searchResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            num: 15,
            tbs: 'qdr:d' // Last 24 hours
          }),
        });

        if (!searchResponse.ok) {
          console.error(`Daily search failed: ${query}`);
          continue;
        }

        const searchData = await searchResponse.json();
        
        if (searchData.organic) {
          for (const result of searchData.organic) {
            const content = `${result.title} ${result.snippet || ''}`;
            const urgencyScore = calculateUrgencyScore(content);
            const urgencyIndicators = extractUrgencyIndicators(content);
            
            if (urgencyScore > 60 && urgencyIndicators.length > 0) {
              // Check if this URL already exists to avoid duplicates
              const { data: existing } = await supabase
                .from('ideas')
                .select('id')
                .eq('url', result.link)
                .single();
              
              if (!existing) {
                todaysPainpoints.push({
                  title: result.title,
                  description: result.snippet || '',
                  source: extractSource(result.link),
                  url: result.link,
                  painpoint_severity: urgencyScore,
                  urgency_indicators: urgencyIndicators
                });
              }
            }
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.error(`Error in daily search "${query}":`, error);
        continue;
      }
    }

    console.log(`Found ${todaysPainpoints.length} new daily painpoints`);

    // Store new painpoints with NEW flag
    let newEntriesCount = 0;
    for (const painpoint of todaysPainpoints) {
      try {
        const { error } = await supabase
          .from('ideas')
          .insert({
            title: painpoint.title,
            description: painpoint.description,
            source: painpoint.source,
            url: painpoint.url,
            date_discovered: new Date().toISOString(),
            category: 'build_together',
            painpoint_description: painpoint.description,
            delivery_timeline_weeks: estimateQuickBuildTime(painpoint.description),
            monetization_model: suggestMonetizationModel(painpoint.description),
            technical_stack_required: suggestTechStack(painpoint.description),
            is_new_entry: true // Mark as NEW for UI badges
          });

        if (!error) {
          newEntriesCount++;
        } else {
          console.error('Error storing daily painpoint:', error);
        }
      } catch (error) {
        console.error('Error inserting daily painpoint:', error);
      }
    }

    // Remove NEW flag from entries older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    await supabase
      .from('ideas')
      .update({ is_new_entry: false })
      .eq('category', 'build_together')
      .lt('date_discovered', sevenDaysAgo.toISOString());

    console.log(`Stored ${newEntriesCount} new daily painpoints`);

    return new Response(JSON.stringify({
      success: true,
      message: `Daily painpoint discovery completed. Found ${newEntriesCount} new opportunities.`,
      data: {
        new_painpoints: newEntriesCount,
        total_processed: todaysPainpoints.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Daily discovery error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'DAILY_DISCOVERY_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateUrgencyScore(content: string): number {
  const lowerContent = content.toLowerCase();
  let score = 0;
  
  // High urgency indicators
  const highUrgencyTerms = [
    'urgent', 'asap', 'immediately', 'desperately', 'critical',
    'daily pain', 'killing productivity', 'losing money', 'major blocker'
  ];
  
  // Medium urgency indicators
  const mediumUrgencyTerms = [
    'frustrating', 'annoying', 'time consuming', 'inefficient',
    'manual process', 'repetitive task', 'would save time'
  ];
  
  // Business impact indicators
  const businessImpactTerms = [
    'would pay', 'willing to pay', 'subscription', 'saas',
    'business need', 'enterprise', 'team tool'
  ];
  
  // Count occurrences
  for (const term of highUrgencyTerms) {
    if (lowerContent.includes(term)) score += 30;
  }
  
  for (const term of mediumUrgencyTerms) {
    if (lowerContent.includes(term)) score += 20;
  }
  
  for (const term of businessImpactTerms) {
    if (lowerContent.includes(term)) score += 25;
  }
  
  return Math.min(score, 100);
}

function extractUrgencyIndicators(content: string): string[] {
  const indicators = [];
  const lowerContent = content.toLowerCase();
  
  const urgencyPatterns = [
    'urgent need', 'desperately need', 'asap', 'immediately',
    'daily pain', 'major frustration', 'killing productivity',
    'would pay for', 'willing to subscribe', 'business critical',
    'manual workaround', 'time wasting', 'repetitive task'
  ];
  
  for (const pattern of urgencyPatterns) {
    if (lowerContent.includes(pattern)) {
      indicators.push(pattern);
    }
  }
  
  return indicators;
}

function extractSource(url: string): string {
  if (url.includes('reddit.com')) return 'Reddit';
  if (url.includes('indiehackers.com')) return 'Indie Hackers';
  if (url.includes('github.com')) return 'GitHub';
  if (url.includes('stackoverflow.com')) return 'Stack Overflow';
  if (url.includes('twitter.com')) return 'Twitter';
  return 'Web';
}

function estimateQuickBuildTime(description: string): number {
  const lowerDesc = description.toLowerCase();
  
  // Quick build indicators (Build Together focus)
  if (lowerDesc.includes('simple') || lowerDesc.includes('basic') || lowerDesc.includes('quick')) {
    return 1; // 1 week
  }
  if (lowerDesc.includes('dashboard') || lowerDesc.includes('admin') || lowerDesc.includes('complex')) {
    return 4; // 4 weeks (max for Build Together)
  }
  if (lowerDesc.includes('integration') || lowerDesc.includes('api')) {
    return 3; // 3 weeks
  }
  
  return 2; // Default 2 weeks
}

function suggestMonetizationModel(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('team') || lowerDesc.includes('business') || lowerDesc.includes('enterprise')) {
    return 'Team SaaS ($29-99/month)';
  }
  if (lowerDesc.includes('personal') || lowerDesc.includes('individual') || lowerDesc.includes('solo')) {
    return 'Personal SaaS ($9-29/month)';
  }
  if (lowerDesc.includes('usage') || lowerDesc.includes('api') || lowerDesc.includes('requests')) {
    return 'Usage-based ($0.01-1/request)';
  }
  
  return 'Freemium SaaS ($0-49/month)';
}

function suggestTechStack(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('mobile') || lowerDesc.includes('ios') || lowerDesc.includes('android')) {
    return 'React Native, Supabase';
  }
  if (lowerDesc.includes('real-time') || lowerDesc.includes('live') || lowerDesc.includes('chat')) {
    return 'React, WebSockets, Supabase';
  }
  if (lowerDesc.includes('ai') || lowerDesc.includes('ml') || lowerDesc.includes('automation')) {
    return 'React, OpenAI API, Supabase';
  }
  
  return 'React, Tailwind, Supabase'; // Default quick stack
}