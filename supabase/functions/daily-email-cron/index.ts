Deno.serve(async (req) => {
    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Missing environment variables');
        }

        console.log('Daily email cron job triggered at:', new Date().toISOString());

        // Trigger the daily email reports function
        const reportResponse = await fetch(`${supabaseUrl}/functions/v1/daily-email-reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cron_trigger: true })
        });

        if (reportResponse.ok) {
            const result = await reportResponse.json();
            console.log('Daily email reports sent successfully:', result);
            
            return new Response(JSON.stringify({
                success: true,
                message: 'Daily email reports triggered successfully',
                timestamp: new Date().toISOString(),
                data: result
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            const errorText = await reportResponse.text();
            console.error('Failed to send daily email reports:', errorText);
            throw new Error(`Email reports failed: ${errorText}`);
        }

    } catch (error) {
        console.error('Daily email cron error:', error);
        
        return new Response(JSON.stringify({
            error: {
                message: error.message,
                timestamp: new Date().toISOString()
            }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});