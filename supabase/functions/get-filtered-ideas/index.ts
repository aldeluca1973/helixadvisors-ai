// Get Startup Ideas with Hidden Ideas Filter
Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials');
        }

        // Get user ID from JWT token if available (for filtering hidden ideas)
        let userId = null;
        const authHeader = req.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': supabaseKey
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                }
            } catch (err) {
                // Continue without user ID if token is invalid
                console.log('Invalid or expired token, showing all ideas');
            }
        }

        // Fetch all startup ideas
        const ideasResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?select=*&order=created_at.desc`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        if (!ideasResponse.ok) {
            throw new Error(`Failed to fetch startup ideas: ${ideasResponse.statusText}`);
        }

        let allIdeas = await ideasResponse.json();

        // If user is authenticated, filter out their hidden ideas
        if (userId) {
            const hiddenIdeasResponse = await fetch(`${supabaseUrl}/rest/v1/hidden_ideas?user_id=eq.${userId}&select=idea_id`, {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                }
            });

            if (hiddenIdeasResponse.ok) {
                const hiddenIdeas = await hiddenIdeasResponse.json();
                const hiddenIdeaIds = new Set(hiddenIdeas.map((item: any) => item.idea_id));
                
                // Filter out hidden ideas
                allIdeas = allIdeas.filter((idea: any) => !hiddenIdeaIds.has(idea.id));
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: allIdeas,
            count: allIdeas.length,
            filtered: !!userId
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Filtered ideas fetch error:', error);
        
        const errorResponse = {
            error: {
                code: 'FILTERED_IDEAS_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});