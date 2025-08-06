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

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization header required');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid authentication token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Check Enterprise subscription
        const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/saas_subscriptions?user_id=eq.${userId}&status=eq.active&select=*,saas_plans!price_id(*)`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let isEnterprise = false;
        if (subscriptionResponse.ok) {
            const subscriptions = await subscriptionResponse.json();
            if (subscriptions.length > 0) {
                const subscription = subscriptions[0];
                const plan = subscription.saas_plans;
                isEnterprise = plan && plan.plan_type === 'enterprise';
            }
        }

        if (!isEnterprise) {
            throw new Error('Enterprise tier required for API access');
        }

        const startTime = Date.now();
        const { endpoint, method = 'GET', body, query_params } = await req.json();

        if (!endpoint) {
            throw new Error('API endpoint is required');
        }

        let result = null;
        let responseStatus = 200;

        // Handle different API endpoints for Enterprise users
        if (endpoint === '/api/startup-ideas') {
            // Fetch startup ideas with full analysis
            const ideasResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?select=*&order=created_at.desc&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            if (ideasResponse.ok) {
                result = await ideasResponse.json();
            } else {
                responseStatus = 500;
                result = { error: 'Failed to fetch startup ideas' };
            }
        } else if (endpoint === '/api/twitter-trends') {
            // Fetch Twitter trends with analysis
            const trendsResponse = await fetch(`${supabaseUrl}/rest/v1/twitter_trends_data?select=*&order=created_at.desc&limit=50`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            if (trendsResponse.ok) {
                result = await trendsResponse.json();
            } else {
                responseStatus = 500;
                result = { error: 'Failed to fetch Twitter trends' };
            }
        } else if (endpoint === '/api/analysis-history') {
            // Fetch user's analysis history
            const historyResponse = await fetch(`${supabaseUrl}/rest/v1/ai_analysis_results?user_id=eq.${userId}&select=*&order=created_at.desc&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            if (historyResponse.ok) {
                result = await historyResponse.json();
            } else {
                responseStatus = 500;
                result = { error: 'Failed to fetch analysis history' };
            }
        } else if (endpoint === '/api/usage-analytics') {
            // Fetch comprehensive usage analytics
            const analyticsResponse = await fetch(`${supabaseUrl}/rest/v1/usage_analytics?user_id=eq.${userId}&select=*&order=created_at.desc&limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            if (analyticsResponse.ok) {
                const analytics = await analyticsResponse.json();
                
                // Process analytics data
                const dailyUsage = {};
                const actionTypes = {};
                
                analytics.forEach(record => {
                    const date = record.created_at.split('T')[0];
                    dailyUsage[date] = (dailyUsage[date] || 0) + 1;
                    actionTypes[record.action_type] = (actionTypes[record.action_type] || 0) + 1;
                });
                
                result = {
                    raw_data: analytics,
                    daily_usage: dailyUsage,
                    action_summary: actionTypes,
                    total_actions: analytics.length
                };
            } else {
                responseStatus = 500;
                result = { error: 'Failed to fetch usage analytics' };
            }
        } else {
            responseStatus = 404;
            result = { error: 'API endpoint not found' };
        }

        const responseTime = Date.now() - startTime;

        // Log API access
        await fetch(`${supabaseUrl}/rest/v1/api_access_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                endpoint,
                method,
                response_status: responseStatus,
                response_time_ms: responseTime,
                tier: 'enterprise'
            })
        });

        return new Response(JSON.stringify({ data: result }), {
            status: responseStatus,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Enterprise API access error:', error);

        const errorResponse = {
            error: {
                code: 'ENTERPRISE_API_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});