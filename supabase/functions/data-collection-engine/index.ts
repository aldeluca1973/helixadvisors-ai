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
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting data collection process...');
        const results = { collected: 0, processed: 0, errors: [] };

        // Get active data sources
        const sourcesResponse = await fetch(`${supabaseUrl}/rest/v1/data_sources?is_enabled=eq.true`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!sourcesResponse.ok) {
            throw new Error('Failed to fetch data sources');
        }

        const dataSources = await sourcesResponse.json();
        console.log(`Found ${dataSources.length} active data sources`);

        // Collect from each source
        for (const source of dataSources) {
            try {
                console.log(`Collecting from ${source.source_name}...`);
                const ideas = await collectFromSource(source);
                
                for (const idea of ideas) {
                    // Check for duplicates
                    const existingResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?title=eq.${encodeURIComponent(idea.title)}`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });
                    
                    const existing = await existingResponse.json();
                    if (existing && existing.length === 0) {
                        // Insert new idea
                        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                title: idea.title,
                                description: idea.description,
                                source_url: idea.source_url,
                                source_platform: source.source_name,
                                category: idea.category || 'uncategorized',
                                status: 'pending'
                            })
                        });

                        if (insertResponse.ok) {
                            results.collected++;
                        }
                    }
                }

                // Update last sync time
                await fetch(`${supabaseUrl}/rest/v1/data_sources?id=eq.${source.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        last_sync: new Date().toISOString()
                    })
                });

            } catch (error) {
                console.error(`Error collecting from ${source.source_name}:`, error.message);
                results.errors.push(`${source.source_name}: ${error.message}`);
            }
        }

        return new Response(JSON.stringify({ 
            data: results,
            message: `Collection complete: ${results.collected} new ideas collected`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Data collection error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'DATA_COLLECTION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to collect ideas from different sources
async function collectFromSource(source) {
    const ideas = [];
    const config = source.configuration || {};

    try {
        if (source.source_name === 'Product Hunt') {
            // Simulate Product Hunt data collection
            const productHuntIdeas = [
                {
                    title: 'AI-Powered Code Review Assistant',
                    description: 'An intelligent code review tool that uses machine learning to identify bugs, security vulnerabilities, and optimization opportunities in real-time.',
                    source_url: 'https://www.producthunt.com/posts/ai-code-review',
                    category: 'Developer Tools'
                },
                {
                    title: 'Sustainable Fashion Marketplace',
                    description: 'A platform connecting eco-conscious consumers with sustainable fashion brands, featuring carbon footprint tracking and ethical sourcing verification.',
                    source_url: 'https://www.producthunt.com/posts/eco-fashion-marketplace',
                    category: 'E-commerce'
                }
            ];
            ideas.push(...productHuntIdeas);
        }

        if (source.source_name === 'TechCrunch') {
            // Simulate TechCrunch startup news extraction
            const techCrunchIdeas = [
                {
                    title: 'Quantum Computing Cloud Platform',
                    description: 'A cloud-based quantum computing platform that makes quantum algorithms accessible to developers without requiring specialized hardware.',
                    source_url: 'https://techcrunch.com/quantum-cloud-platform',
                    category: 'Cloud Computing'
                },
                {
                    title: 'Mental Health AI Companion',
                    description: 'An AI-powered mental health companion that provides personalized therapy sessions and mood tracking with professional therapist oversight.',
                    source_url: 'https://techcrunch.com/mental-health-ai',
                    category: 'Healthcare'
                }
            ];
            ideas.push(...techCrunchIdeas);
        }

        if (source.source_name === 'Reddit Startups') {
            // Simulate Reddit startup idea extraction
            const redditIdeas = [
                {
                    title: 'Remote Work Productivity Suite',
                    description: 'A comprehensive productivity platform designed specifically for remote teams, featuring time tracking, collaboration tools, and virtual office spaces.',
                    source_url: 'https://reddit.com/r/startups/remote-productivity',
                    category: 'Productivity'
                },
                {
                    title: 'Blockchain Supply Chain Tracker',
                    description: 'A blockchain-based system for tracking products through the entire supply chain, ensuring transparency and authenticity for consumers.',
                    source_url: 'https://reddit.com/r/startups/blockchain-supply',
                    category: 'Blockchain'
                }
            ];
            ideas.push(...redditIdeas);
        }

        if (source.source_name === 'AngelList') {
            // Simulate AngelList startup discovery
            const angelListIdeas = [
                {
                    title: 'EdTech VR Learning Platform',
                    description: 'A virtual reality platform for immersive educational experiences, allowing students to explore historical events, scientific phenomena, and complex concepts in 3D.',
                    source_url: 'https://angel.co/edtech-vr-platform',
                    category: 'Education'
                },
                {
                    title: 'Sustainable Energy Marketplace',
                    description: 'A peer-to-peer marketplace for renewable energy trading, allowing solar panel owners to sell excess energy directly to neighbors.',
                    source_url: 'https://angel.co/energy-marketplace',
                    category: 'Energy'
                }
            ];
            ideas.push(...angelListIdeas);
        }

        if (source.source_name === 'VentureBeat') {
            // Simulate VentureBeat technology trend extraction
            const ventureBeatIdeas = [
                {
                    title: 'Autonomous Drone Delivery Network',
                    description: 'A network of autonomous drones for last-mile delivery in urban areas, featuring AI-powered route optimization and weather adaptation.',
                    source_url: 'https://venturebeat.com/drone-delivery-network',
                    category: 'Logistics'
                },
                {
                    title: 'Voice-Activated Smart Home Ecosystem',
                    description: 'An integrated smart home platform that uses advanced natural language processing to control all home devices through conversational interfaces.',
                    source_url: 'https://venturebeat.com/smart-home-voice',
                    category: 'IoT'
                }
            ];
            ideas.push(...ventureBeatIdeas);
        }

    } catch (error) {
        console.error(`Error collecting from ${source.source_name}:`, error.message);
    }

    return ideas;
}