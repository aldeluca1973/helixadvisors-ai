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
        
        if (!supabaseUrl) {
            throw new Error('Supabase URL not configured');
        }

        console.log('Starting daily automation workflow...');
        const results = {
            data_collection: null,
            analysis: null,
            report_generation: null,
            errors: []
        };

        // Step 1: Data Collection
        try {
            console.log('Step 1: Running data collection...');
            const collectionResponse = await fetch(`${supabaseUrl}/functions/v1/data-collection-engine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trigger: 'daily_automation' })
            });
            
            if (collectionResponse.ok) {
                results.data_collection = await collectionResponse.json();
                console.log('Data collection completed:', results.data_collection);
            } else {
                throw new Error(`Data collection failed: ${collectionResponse.status}`);
            }
        } catch (error) {
            console.error('Data collection error:', error.message);
            results.errors.push(`Data Collection: ${error.message}`);
        }

        // Step 2: Analysis Engine
        try {
            console.log('Step 2: Running analysis engine...');
            const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/idea-analysis-engine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trigger: 'daily_automation' })
            });
            
            if (analysisResponse.ok) {
                results.analysis = await analysisResponse.json();
                console.log('Analysis completed:', results.analysis);
            } else {
                throw new Error(`Analysis failed: ${analysisResponse.status}`);
            }
        } catch (error) {
            console.error('Analysis error:', error.message);
            results.errors.push(`Analysis: ${error.message}`);
        }

        // Step 3: Report Generation
        try {
            console.log('Step 3: Generating daily report...');
            const reportResponse = await fetch(`${supabaseUrl}/functions/v1/daily-report-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trigger: 'daily_automation' })
            });
            
            if (reportResponse.ok) {
                results.report_generation = await reportResponse.json();
                console.log('Report generation completed:', results.report_generation);
            } else {
                throw new Error(`Report generation failed: ${reportResponse.status}`);
            }
        } catch (error) {
            console.error('Report generation error:', error.message);
            results.errors.push(`Report Generation: ${error.message}`);
        }

        // Log workflow completion
        const successCount = [results.data_collection, results.analysis, results.report_generation]
            .filter(r => r !== null).length;
        
        console.log(`Daily workflow completed: ${successCount}/3 steps successful`);

        return new Response(JSON.stringify({
            data: {
                workflow_status: successCount === 3 ? 'success' : 'partial_success',
                steps_completed: successCount,
                total_steps: 3,
                results: results
            },
            message: `Daily automation workflow completed with ${successCount}/3 steps successful`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Daily workflow error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'WORKFLOW_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});