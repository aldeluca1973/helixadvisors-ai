Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serpApiKey = Deno.env.get('SERPAPI');
        console.log('SERPAPI availability:', serpApiKey ? 'Available' : 'Missing');
        
        if (!serpApiKey) {
            throw new Error('SERPAPI key not available');
        }

        // Test SerpAPI Twitter search
        const searchQuery = 'startup OR "business idea" OR "pain point" site:twitter.com';
        const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&engine=google&api_key=${serpApiKey}&num=5`;
        
        console.log('Testing SerpAPI call...');
        const response = await fetch(serpUrl);
        const data = await response.json();
        
        console.log('SerpAPI response status:', response.status);
        console.log('SerpAPI response:', JSON.stringify(data).slice(0, 500));
        
        const results = {
            serpapi_available: true,
            serpapi_response_status: response.status,
            results_count: data.organic_results ? data.organic_results.length : 0,
            search_query: searchQuery,
            sample_results: data.organic_results ? data.organic_results.slice(0, 2) : [],
            timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify({
            success: true,
            data: results
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Twitter collection test error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});