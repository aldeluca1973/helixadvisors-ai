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
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            console.error('Missing environment variables:', { serviceRoleKey: !!serviceRoleKey, supabaseUrl: !!supabaseUrl });
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            console.error('No authorization header provided');
            throw new Error('Authorization header required');
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Attempting to validate user token...');
        
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            console.error('User validation failed:', userResponse.status, userResponse.statusText);
            const errorText = await userResponse.text();
            console.error('User validation error response:', errorText);
            throw new Error('Invalid authentication token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        console.log('User validated:', userId);

        if (req.method === 'GET' || req.method === 'POST') {
            console.log('Getting user profile for:', userId);
            
            // Get basic user profile
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
                console.log('Profile found:', !!userProfile);
            } else {
                console.error('Profile fetch failed:', profileResponse.status);
            }

            // Try to get subscription info with simplified query
            let subscription = null;
            let plan = null;
            
            try {
                const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/saas_subscriptions?user_id=eq.${userId}&status=eq.active&select=*`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (subscriptionResponse.ok) {
                    const subscriptions = await subscriptionResponse.json();
                    subscription = subscriptions[0];
                    console.log('Subscription found:', !!subscription);
                    
                    if (subscription) {
                        // Get plan details separately
                        const planResponse = await fetch(`${supabaseUrl}/rest/v1/saas_plans?price_id=eq.${subscription.price_id}&select=*`, {
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey
                            }
                        });
                        
                        if (planResponse.ok) {
                            const plans = await planResponse.json();
                            plan = plans[0];
                            console.log('Plan found:', !!plan);
                        }
                    }
                } else {
                    console.error('Subscription fetch failed:', subscriptionResponse.status);
                }
            } catch (subError) {
                console.error('Error fetching subscription:', subError.message);
            }

            // Create profile if it doesn't exist
            if (!userProfile) {
                console.log('Creating new user profile...');
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
                        current_tier: plan ? plan.plan_type : 'free',
                        daily_usage_count: 0
                    })
                });

                if (createProfileResponse.ok) {
                    const newProfiles = await createProfileResponse.json();
                    userProfile = newProfiles[0];
                    console.log('Profile created successfully');
                } else {
                    const createError = await createProfileResponse.text();
                    console.error('Failed to create profile:', createError);
                    throw new Error('Failed to create user profile');
                }
            }

            // Check if gift tier is still active
            const now = new Date().toISOString();
            const giftTierActive = userProfile.gift_tier_expiry && userProfile.gift_tier_expiry > now;
            
            const result = {
                data: {
                    profile: userProfile,
                    subscription: subscription,
                    plan: plan,
                    usage_analytics: [],
                    // Priority: 1. Admin status  2. Active gift tier  3. Subscription  4. Default free
                    current_tier: userProfile.is_admin ? 'professional' : 
                                 (giftTierActive ? userProfile.current_tier : 
                                 (plan ? plan.plan_type : 'free')),
                    monthly_limit: plan ? plan.monthly_limit : 0,
                    is_enterprise: plan && plan.plan_type === 'enterprise'
                }
            };

            console.log('Returning user profile data');
            return new Response(JSON.stringify(result), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Method not allowed');

    } catch (error) {
        console.error('User profile manager error:', error);

        const errorResponse = {
            error: {
                code: 'USER_PROFILE_ERROR',
                message: error.message,
                details: error.stack
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});