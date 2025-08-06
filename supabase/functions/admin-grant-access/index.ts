// File: admin-grant-access/index.ts
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
        // Get service role and URL
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify admin status
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
        const adminId = userData.id;

        // Check if user is admin
        const adminCheckResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${adminId}&is_admin=eq.true&select=id`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const adminCheck = await adminCheckResponse.json();
        if (!adminCheck || adminCheck.length === 0) {
            throw new Error('Admin privileges required');
        }

        // Process the request
        const { email, tierLevel, durationDays = 30 } = await req.json();

        if (!email || !tierLevel) {
            throw new Error('Email and tier level required');
        }

        // Get user by email
        const userLookupResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?email=eq.${encodeURIComponent(email)}&select=id,email`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const users = await userLookupResponse.json();
        if (!users || users.length === 0) {
            throw new Error('User not found');
        }

        const targetUserId = users[0].id;

        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);

        // Update user profile with gift tier
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${targetUserId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                current_tier: tierLevel,
                gift_tier_expiry: expiryDate.toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update user tier');
        }

        // Create gift record
        const giftResponse = await fetch(`${supabaseUrl}/rest/v1/tier_gift_records`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: adminId,
                user_id: targetUserId,
                tier_granted: tierLevel,
                expiry_date: expiryDate.toISOString(),
                created_at: new Date().toISOString()
            })
        });

        if (!giftResponse.ok) {
            console.error('Failed to create gift record, but tier was updated');
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Successfully granted ${tierLevel} access to ${email} for ${durationDays} days`,
            data: {
                user_id: targetUserId,
                tier: tierLevel,
                expiry: expiryDate.toISOString()
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin grant access error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'GRANT_ACCESS_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});