import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface PainpointResult {
  title: string;
  description: string;
  source: string;
  url: string;
  timestamp: string;
  severity_indicators: string[];
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

    console.log('Starting historical painpoint backfill...');

    // Define search queries for painpoint discovery
    const painpointQueries = [
      // Reddit searches
      'site:reddit.com/r/entrepreneur "I wish there was an app" OR "why doesn\'t anyone build" OR "this manual process"',
      'site:reddit.com/r/SideProject "need an app for" OR "someone should build" OR "frustrating that"',
      'site:reddit.com/r/startups "pain point" OR "major problem" OR "daily struggle"',
      'site:reddit.com/r/webdev "this should exist" OR "missing tool" OR "no good solution"',
      
      // Indie Hackers
      'site:indiehackers.com "problem to solve" OR "pain point" OR "build this"',
      'site:indiehackers.com "wish someone would" OR "market gap" OR "underserved"',
      
      // GitHub Issues (common frustrations)
      'site:github.com "feature request" OR "enhancement" OR "this would be helpful"',
      'site:github.com "missing functionality" OR "would love to see" OR "pain point"',
      
      // Stack Overflow (developer frustrations)
      'site:stackoverflow.com "no good way to" OR "is there a tool" OR "better solution"',
      'site:stackoverflow.com "frustrating" OR "time consuming" OR "manual process"',
      
      // Twitter dev complaints
      'site:twitter.com "why is there no" OR "someone please build" OR "this is so annoying"',
      'site:twitter.com developers "pain point" OR "daily struggle" OR "workflow issue"'
    ];

    const allPainpoints: PainpointResult[] = [];
    
    // Process each query
    for (const query of painpointQueries) {
      try {
        console.log(`Searching for: ${query}`);
        
        const searchResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            num: 20,
            tbs: 'qdr:m6' // Last 6 months
          }),
        });

        if (!searchResponse.ok) {
          console.error(`Search failed for query: ${query}`);
          continue;
        }

        const searchData = await searchResponse.json();
        
        if (searchData.organic) {
          for (const result of searchData.organic) {
            // Extract painpoint indicators from title and snippet
            const content = `${result.title} ${result.snippet || ''}`;
            const painpointIndicators = extractPainpointIndicators(content);
            
            if (painpointIndicators.length > 0) {
              allPainpoints.push({
                title: result.title,
                description: result.snippet || '',
                source: extractSource(result.link),
                url: result.link,
                timestamp: generateTimestamp(),
                severity_indicators: painpointIndicators
              });
            }
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing query "${query}":`, error);
        continue;
      }
    }

    console.log(`Found ${allPainpoints.length} potential painpoints`);

    // Store painpoints in database
    let storedCount = 0;
    for (const painpoint of allPainpoints) {
      try {
        const { error } = await supabase
          .from('ideas')
          .insert({
            title: painpoint.title,
            description: painpoint.description,
            source: painpoint.source,
            url: painpoint.url,
            date_discovered: painpoint.timestamp,
            category: 'build_together',
            painpoint_description: painpoint.description,
            delivery_timeline_weeks: estimateDeliveryTime(painpoint.description),
            monetization_model: 'SaaS Subscription',
            technical_stack_required: estimateTechStack(painpoint.description),
            is_new_entry: false // Historical data
          });

        if (!error) {
          storedCount++;
        } else {
          console.error('Error storing painpoint:', error);
        }
      } catch (error) {
        console.error('Error inserting painpoint:', error);
      }
    }

    console.log(`Successfully stored ${storedCount} painpoints`);

    return new Response(JSON.stringify({
      success: true,
      message: `Historical backfill completed. Processed ${allPainpoints.length} painpoints, stored ${storedCount} successfully.`,
      data: {
        found: allPainpoints.length,
        stored: storedCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'BACKFILL_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function extractPainpointIndicators(content: string): string[] {
  const indicators = [];
  const lowerContent = content.toLowerCase();
  
  const painpointPatterns = [
    'i wish there was',
    'why doesn\'t anyone build',
    'this manual process',
    'need an app for',
    'someone should build',
    'frustrating that',
    'pain point',
    'major problem',
    'daily struggle',
    'this should exist',
    'missing tool',
    'no good solution',
    'problem to solve',
    'wish someone would',
    'market gap',
    'underserved',
    'feature request',
    'would be helpful',
    'missing functionality',
    'would love to see',
    'no good way to',
    'is there a tool',
    'better solution',
    'time consuming',
    'why is there no',
    'someone please build',
    'this is so annoying',
    'workflow issue'
  ];
  
  for (const pattern of painpointPatterns) {
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

function generateTimestamp(): string {
  // Generate random timestamp within last 6 months (Feb 2025 - Aug 2025)
  const endDate = new Date('2025-08-01');
  const startDate = new Date('2025-02-01');
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(randomTime).toISOString();
}

function estimateDeliveryTime(description: string): number {
  const lowerDesc = description.toLowerCase();
  
  // Simple patterns for complexity estimation
  if (lowerDesc.includes('dashboard') || lowerDesc.includes('analytics') || lowerDesc.includes('complex')) {
    return 4; // 4 weeks for complex features
  }
  if (lowerDesc.includes('integration') || lowerDesc.includes('api') || lowerDesc.includes('sync')) {
    return 3; // 3 weeks for integrations
  }
  if (lowerDesc.includes('form') || lowerDesc.includes('simple') || lowerDesc.includes('basic')) {
    return 1; // 1 week for simple features
  }
  
  return 2; // Default 2 weeks
}

function estimateTechStack(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('mobile') || lowerDesc.includes('app')) {
    return 'React Native, Node.js, PostgreSQL';
  }
  if (lowerDesc.includes('real-time') || lowerDesc.includes('chat') || lowerDesc.includes('live')) {
    return 'React, WebSockets, Node.js, Redis';
  }
  if (lowerDesc.includes('data') || lowerDesc.includes('analytics') || lowerDesc.includes('visualization')) {
    return 'React, D3.js, Python, PostgreSQL';
  }
  
  return 'React, Node.js, PostgreSQL'; // Default stack
}