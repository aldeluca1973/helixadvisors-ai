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
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting production automation workflow with real data collection and AI analysis...');
        const results = {
            data_collection: null,
            ai_analysis: null,
            report_generation: null,
            errors: []
        };

        // Prepare headers for function calls
        const functionHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        };

        // Step 1: Real Data Collection
        try {
            console.log('Step 1: Running real data collection from APIs...');
            const collectionResponse = await fetch(`${supabaseUrl}/functions/v1/real-data-collection-engine`, {
                method: 'POST',
                headers: functionHeaders,
                body: JSON.stringify({ trigger: 'production_automation' })
            });
            
            if (collectionResponse.ok) {
                results.data_collection = await collectionResponse.json();
                console.log('Real data collection completed:', results.data_collection);
            } else {
                const errorText = await collectionResponse.text();
                throw new Error(`Real data collection failed: ${collectionResponse.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Real data collection error:', error.message);
            results.errors.push(`Real Data Collection: ${error.message}`);
        }

        // Step 2: AI Analysis Engine
        try {
            console.log('Step 2: Running AI-powered analysis...');
            const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/ai-analysis-engine`, {
                method: 'POST',
                headers: functionHeaders,
                body: JSON.stringify({ trigger: 'production_automation' })
            });
            
            if (analysisResponse.ok) {
                results.ai_analysis = await analysisResponse.json();
                console.log('AI analysis completed:', results.ai_analysis);
            } else {
                const errorText = await analysisResponse.text();
                throw new Error(`AI analysis failed: ${analysisResponse.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('AI analysis error:', error.message);
            results.errors.push(`AI Analysis: ${error.message}`);
        }

        // Step 3: Report Generation
        try {
            console.log('Step 3: Generating daily report...');
            const reportResponse = await fetch(`${supabaseUrl}/functions/v1/daily-report-generator`, {
                method: 'POST',
                headers: functionHeaders,
                body: JSON.stringify({ trigger: 'production_automation' })
            });
            
            if (reportResponse.ok) {
                results.report_generation = await reportResponse.json();
                console.log('Report generation completed:', results.report_generation);
            } else {
                const errorText = await reportResponse.text();
                throw new Error(`Report generation failed: ${reportResponse.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Report generation error:', error.message);
            results.errors.push(`Report Generation: ${error.message}`);
        }

        // Log workflow completion
        const successCount = [results.data_collection, results.ai_analysis, results.report_generation]
            .filter(r => r !== null).length;
        
        console.log(`Production workflow completed: ${successCount}/3 steps successful`);

        // Create comprehensive summary
        const summary = {
            workflow_status: successCount === 3 ? 'success' : successCount >= 1 ? 'partial_success' : 'failed',
            steps_completed: successCount,
            total_steps: 3,
            real_data_collected: results.data_collection?.data?.collected || 0,
            ai_analysis_completed: results.ai_analysis?.data?.analyzed || 0,
            report_generated: results.report_generation?.data?.top_ideas_count || 0,
            timestamp: new Date().toISOString(),
            results: results
        };

        // Log summary to console
        if (results.data_collection?.data) {
            console.log(`✅ Real data collected: ${results.data_collection.data.collected} new startup ideas from APIs`);
        }
        if (results.ai_analysis?.data) {
            console.log(`🤖 AI analysis completed: ${results.ai_analysis.data.analyzed} ideas analyzed with intelligent scoring`);
        }
        if (results.report_generation?.data) {
            console.log(`📊 Daily report generated: Top ${results.report_generation.data.top_ideas_count} ideas ranked`);
        }

        return new Response(JSON.stringify({
            data: summary,
            message: `Production automation workflow completed with ${successCount}/3 steps successful. ${successCount === 3 ? 'All systems operational with real data and AI analysis.' : 'Partial success - check errors for details.'}`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Production workflow error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'PRODUCTION_WORKFLOW_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});