// Comprehensive Hidden Ideas Management API
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

        // Get user ID from JWT token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Missing or invalid authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': supabaseKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid authentication token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        const requestData = await req.json();
        const { action, idea_id, status, notes, progress_percentage, priority, estimated_budget, target_launch_date, tags, private_notes } = requestData;

        let response;

        switch (action) {
            case 'hide': {
                // Hide/bookmark an idea
                if (!idea_id) {
                    throw new Error('idea_id is required for hide action');
                }

                const hideData = {
                    user_id: userId,
                    idea_id: idea_id,
                    status: status || 'hidden',
                    notes: notes || '',
                    progress_percentage: progress_percentage || 0,
                    priority: priority || 'medium',
                    estimated_budget: estimated_budget || null,
                    target_launch_date: target_launch_date || null,
                    tags: tags || [],
                    private_notes: private_notes || ''
                };

                response = await fetch(`${supabaseUrl}/rest/v1/hidden_ideas`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(hideData)
                });
                break;
            }

            case 'list': {
                // Get all hidden ideas for user
                const statusFilter = requestData.status_filter ? `&status=eq.${requestData.status_filter}` : '';
                response = await fetch(`${supabaseUrl}/rest/v1/hidden_ideas?user_id=eq.${userId}${statusFilter}&select=*,startup_ideas(*)&order=created_at.desc`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    }
                });
                break;
            }

            case 'update': {
                // Update hidden idea details
                if (!idea_id) {
                    throw new Error('idea_id is required for update action');
                }

                const updateData: any = { updated_at: new Date().toISOString() };
                if (status !== undefined) updateData.status = status;
                if (notes !== undefined) updateData.notes = notes;
                if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage;
                if (priority !== undefined) updateData.priority = priority;
                if (estimated_budget !== undefined) updateData.estimated_budget = estimated_budget;
                if (target_launch_date !== undefined) updateData.target_launch_date = target_launch_date;
                if (tags !== undefined) updateData.tags = tags;
                if (private_notes !== undefined) updateData.private_notes = private_notes;

                response = await fetch(`${supabaseUrl}/rest/v1/hidden_ideas?user_id=eq.${userId}&idea_id=eq.${idea_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(updateData)
                });
                break;
            }

            case 'unhide': {
                // Remove from hidden ideas (unhide)
                if (!idea_id) {
                    throw new Error('idea_id is required for unhide action');
                }

                response = await fetch(`${supabaseUrl}/rest/v1/hidden_ideas?user_id=eq.${userId}&idea_id=eq.${idea_id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    }
                });
                break;
            }

            case 'export': {
                // Export hidden ideas for the user
                const exportResponse = await fetch(`${supabaseUrl}/rest/v1/hidden_ideas?user_id=eq.${userId}&select=*,startup_ideas(*)&order=created_at.desc`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (!exportResponse.ok) {
                    throw new Error('Failed to fetch hidden ideas for export');
                }

                const hiddenIdeas = await exportResponse.json();
                
                // Format data for export
                const exportData = {
                    export_date: new Date().toISOString(),
                    user_id: userId,
                    total_ideas: hiddenIdeas.length,
                    ideas: hiddenIdeas.map((item: any) => ({
                        title: item.startup_ideas?.title || 'Unknown Title',
                        description: item.startup_ideas?.description || '',
                        status: item.status,
                        progress_percentage: item.progress_percentage,
                        priority: item.priority,
                        estimated_budget: item.estimated_budget,
                        target_launch_date: item.target_launch_date,
                        tags: item.tags,
                        notes: item.notes,
                        hidden_date: item.created_at,
                        last_updated: item.updated_at
                    }))
                };

                return new Response(JSON.stringify({ 
                    success: true, 
                    data: exportData 
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Database operation failed: ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        
        return new Response(JSON.stringify({ 
            success: true, 
            data: data,
            action: action
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Hidden ideas management error:', error);
        
        const errorResponse = {
            error: {
                code: 'HIDDEN_IDEAS_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});