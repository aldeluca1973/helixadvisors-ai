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
        const { item_type, item_id, content, title } = await req.json();

        if (!item_type || !item_id || !content) {
            throw new Error('item_type, item_id, and content are required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

        if (!serviceRoleKey || !supabaseUrl || !openaiApiKey || !anthropicApiKey) {
            throw new Error('Missing required environment variables');
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

        // Get user profile and subscription info
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let userProfile = null;
        if (profileResponse.ok) {
            const profiles = await profileResponse.json();
            userProfile = profiles[0];
        }

        // If no profile exists, create one
        if (!userProfile) {
            const createProfileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    id: userId,
                    email: userData.email,
                    current_tier: 'free',
                    daily_usage_count: 0
                })
            });

            if (createProfileResponse.ok) {
                const newProfiles = await createProfileResponse.json();
                userProfile = newProfiles[0];
            } else {
                throw new Error('Failed to create user profile');
            }
        }

        // Check subscription status
        const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/saas_subscriptions?user_id=eq.${userId}&status=eq.active&select=*,saas_plans!price_id(*)`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let currentTier = 'free';
        let monthlyLimit = 0;
        
        if (subscriptionResponse.ok) {
            const subscriptions = await subscriptionResponse.json();
            if (subscriptions.length > 0) {
                const subscription = subscriptions[0];
                const plan = subscription.saas_plans;
                if (plan) {
                    currentTier = plan.plan_type;
                    monthlyLimit = plan.monthly_limit;
                }
            }
        }

        // Check daily usage limits
        const today = new Date().toISOString().split('T')[0];
        if (userProfile.last_usage_reset !== today) {
            // Reset daily usage count
            await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    daily_usage_count: 0,
                    last_usage_reset: today,
                    current_tier: currentTier
                })
            });
            userProfile.daily_usage_count = 0;
        }

        // Check usage limits
        if (monthlyLimit > 0 && userProfile.daily_usage_count >= monthlyLimit) {
            throw new Error(`Daily limit of ${monthlyLimit} analyses reached. Upgrade your plan for more access.`);
        }

        // Perform AI analysis based on tier
        let gpt4Analysis = null;
        let claudeAnalysis = null;
        let combinedAnalysis = null;

        // GPT-4 Analysis (all tiers get this)
        const gpt4Prompt = `Analyze this ${item_type} and provide detailed technical analysis:\n\nTitle: ${title || 'N/A'}\nContent: ${content}\n\nProvide analysis in JSON format with fields: technical_feasibility, market_relevance, innovation_score, implementation_complexity, scalability_potential`;
        
        const gpt4Response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'user',
                    content: gpt4Prompt
                }],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (gpt4Response.ok) {
            const gpt4Result = await gpt4Response.json();
            try {
                gpt4Analysis = JSON.parse(gpt4Result.choices[0].message.content);
            } catch {
                gpt4Analysis = { raw_response: gpt4Result.choices[0].message.content };
            }
        }

        // Claude Analysis (Investor and Enterprise tiers)
        if (currentTier === 'investor' || currentTier === 'enterprise') {
            const claudePrompt = `Provide strategic business analysis for this ${item_type}:\n\nTitle: ${title || 'N/A'}\nContent: ${content}\n\nAnalyze from investment and business strategy perspective. Return JSON with: market_opportunity, competitive_landscape, business_model_viability, go_to_market_strategy, investment_potential`;
            
            const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${anthropicApiKey}`,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: claudePrompt
                    }]
                })
            });

            if (claudeResponse.ok) {
                const claudeResult = await claudeResponse.json();
                try {
                    claudeAnalysis = JSON.parse(claudeResult.content[0].text);
                } catch {
                    claudeAnalysis = { raw_response: claudeResult.content[0].text };
                }
            }
        }

        // Combined Analysis (Enterprise tier only)
        if (currentTier === 'enterprise' && gpt4Analysis && claudeAnalysis) {
            const combinedPrompt = `Create a comprehensive investment-grade report combining these analyses:\n\nGPT-4 Technical Analysis: ${JSON.stringify(gpt4Analysis)}\n\nClaude Strategic Analysis: ${JSON.stringify(claudeAnalysis)}\n\nProvide a synthesized investment thesis in JSON format with: executive_summary, investment_recommendation, risk_assessment, growth_projections, strategic_initiatives`;
            
            const combinedResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'user',
                        content: combinedPrompt
                    }],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (combinedResponse.ok) {
                const combinedResult = await combinedResponse.json();
                try {
                    combinedAnalysis = JSON.parse(combinedResult.choices[0].message.content);
                } catch {
                    combinedAnalysis = { raw_response: combinedResult.choices[0].message.content };
                }
            }
        }

        // Store analysis results
        const storeResponse = await fetch(`${supabaseUrl}/rest/v1/ai_analysis_results`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id: userId,
                item_type,
                item_id,
                gpt4_analysis: gpt4Analysis,
                claude_analysis: claudeAnalysis,
                combined_analysis: combinedAnalysis,
                tier_used: currentTier
            })
        });

        // Update usage count
        await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                daily_usage_count: userProfile.daily_usage_count + 1
            })
        });

        // Log usage analytics
        await fetch(`${supabaseUrl}/rest/v1/usage_analytics`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                action_type: 'ai_analysis',
                tier: currentTier,
                metadata: { item_type, item_id }
            })
        });

        const result = {
            data: {
                gpt4_analysis: gpt4Analysis,
                claude_analysis: claudeAnalysis,
                combined_analysis: combinedAnalysis,
                tier_used: currentTier,
                usage_count: userProfile.daily_usage_count + 1,
                daily_limit: monthlyLimit
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Dual-AI analysis error:', error);

        const errorResponse = {
            error: {
                code: 'DUAL_AI_ANALYSIS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});