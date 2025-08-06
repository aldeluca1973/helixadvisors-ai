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
        const envVars = {
            SERPAPI: Deno.env.get('SERPAPI') ? '✅ Available' : '❌ Missing',
            OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY') ? '✅ Available' : '❌ Missing',
            GITHUB_TOKEN: Deno.env.get('GITHUB_TOKEN') ? '✅ Available' : '❌ Missing',
            SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? '✅ Available' : '❌ Missing',
            SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✅ Available' : '❌ Missing'
        };

        return new Response(JSON.stringify({
            success: true,
            environment_variables: envVars,
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});