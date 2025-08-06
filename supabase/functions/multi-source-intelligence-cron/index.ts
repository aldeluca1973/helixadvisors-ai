Deno.serve(async (req) => {
    try {
        console.log('Starting multi-source intelligence cron job...');
        
        // Call the main intelligence engine
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }
        
        const response = await fetch(`${supabaseUrl}/functions/v1/multi-source-intelligence-engine`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cron_trigger: true })
        });
        
        const result = await response.json();
        
        console.log('Multi-source intelligence cron completed:', result);
        
        return new Response(JSON.stringify({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Multi-source intelligence cron error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});