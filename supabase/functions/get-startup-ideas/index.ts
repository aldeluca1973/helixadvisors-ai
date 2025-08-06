Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Parse query parameters for pagination and filtering
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const category = url.searchParams.get('category');
        
        // Build query with filters
        let query = `${supabaseUrl}/rest/v1/startup_ideas?select=id,title,description,category,overall_score,market_score,competition_score,development_score,quality_score,professional_grade_score,implementation_complexity,market_size_estimate,monetization_potential,viral_indicators,source_platform,created_at&order=quality_score.desc,created_at.desc&limit=${limit}&offset=${offset}`;
        
        if (category && category !== 'all') {
            query += `&category=eq.${encodeURIComponent(category)}`;
        }

        // Fetch startup ideas from database
        const response = await fetch(query, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Database query failed: ${response.status}`);
        }

        const ideas = await response.json();
        
        // Transform data for frontend consumption
        const transformedIdeas = ideas.map(idea => ({
            id: idea.id,
            title: idea.title,
            description: idea.description?.substring(0, 500) + (idea.description?.length > 500 ? '...' : ''),
            category: idea.category || 'Technology',
            trending_score: Math.round(parseFloat(idea.quality_score || 0) * 100),
            market_size: idea.market_size_estimate || 'Medium',
            overall_score: parseFloat(idea.overall_score || 0),
            market_score: parseFloat(idea.market_score || 0),
            competition_score: parseFloat(idea.competition_score || 0),
            development_score: parseFloat(idea.development_score || 0),
            implementation_complexity: idea.implementation_complexity || 3,
            monetization_potential: idea.monetization_potential || 'medium',
            source_platform: idea.source_platform,
            engagement_metrics: idea.viral_indicators || {},
            created_at: idea.created_at
        }));

        // Get total count for pagination
        const countResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?select=count`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Prefer': 'count=exact'
            }
        });

        const totalCount = countResponse.headers.get('content-range')?.split('/')[1] || ideas.length;

        const result = {
            data: {
                ideas: transformedIdeas,
                pagination: {
                    total: parseInt(totalCount),
                    limit,
                    offset,
                    hasMore: (offset + limit) < parseInt(totalCount)
                }
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get startup ideas error:', error);

        const errorResponse = {
            error: {
                code: 'GET_IDEAS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});