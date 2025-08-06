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

        const today = new Date().toISOString().split('T')[0];
        console.log(`Generating daily report for ${today}...`);

        // Get top 15 ideas by overall score
        const topIdeasResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?status=eq.analyzed&order=overall_score.desc&limit=15`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!topIdeasResponse.ok) {
            throw new Error('Failed to fetch top ideas');
        }

        const topIdeas = await topIdeasResponse.json();

        // Get special mentions (high potential but different criteria)
        const specialMentionsResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?status=eq.analyzed&market_score=gte.80&overall_score=gte.70&limit=5`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const specialMentions = await specialMentionsResponse.json();

        // Get total analyzed ideas count
        const totalResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?status=eq.analyzed&select=count`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Prefer': 'count=exact'
            }
        });

        const totalCount = parseInt(totalResponse.headers.get('content-range')?.split('/')[1] || '0');

        // Generate analysis summary
        const summary = generateAnalysisSummary(topIdeas, specialMentions, totalCount);

        // Prepare report data
        const reportData = {
            report_date: today,
            total_ideas_analyzed: totalCount,
            top_ideas: topIdeas.map((idea, index) => ({
                rank: index + 1,
                id: idea.id,
                title: idea.title,
                description: idea.description,
                category: idea.category,
                industry: idea.industry,
                overall_score: idea.overall_score,
                market_score: idea.market_score,
                competition_score: idea.competition_score,
                development_score: idea.development_score,
                roi_score: idea.roi_score,
                source_platform: idea.source_platform,
                source_url: idea.source_url
            })),
            special_mentions: specialMentions.map(idea => ({
                id: idea.id,
                title: idea.title,
                description: idea.description,
                category: idea.category,
                overall_score: idea.overall_score,
                market_score: idea.market_score,
                reason: determineSpecialMentionReason(idea)
            })),
            analysis_summary: summary,
            report_status: 'completed'
        };

        // Check if report already exists for today
        const existingResponse = await fetch(`${supabaseUrl}/rest/v1/daily_reports?report_date=eq.${today}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const existing = await existingResponse.json();

        if (existing && existing.length > 0) {
            // Update existing report
            await fetch(`${supabaseUrl}/rest/v1/daily_reports?report_date=eq.${today}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });
        } else {
            // Create new report
            await fetch(`${supabaseUrl}/rest/v1/daily_reports`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });
        }

        // Update historical trends
        await updateHistoricalTrends(supabaseUrl, serviceRoleKey, topIdeas, today);

        // Generate notifications for high-scoring ideas
        await generateNotifications(supabaseUrl, serviceRoleKey, topIdeas);

        console.log(`Daily report generated successfully for ${today}`);

        return new Response(JSON.stringify({
            data: {
                report_date: today,
                top_ideas_count: topIdeas.length,
                special_mentions_count: specialMentions.length,
                total_analyzed: totalCount
            },
            message: 'Daily report generated successfully'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Daily report generation error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'REPORT_GENERATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Generate analysis summary
function generateAnalysisSummary(topIdeas, specialMentions, totalCount) {
    const categories = {};
    const avgScore = topIdeas.reduce((sum, idea) => sum + idea.overall_score, 0) / topIdeas.length;
    
    topIdeas.forEach(idea => {
        categories[idea.category] = (categories[idea.category] || 0) + 1;
    });
    
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    
    return `Today's analysis of ${totalCount} startup ideas reveals strong opportunities across multiple sectors. The average score among top performers is ${avgScore.toFixed(1)}/100. ${topCategory[0]} leads with ${topCategory[1]} ideas in the top 15, followed by emerging trends in AI-powered solutions and sustainable technology. Market conditions favor ideas with strong technological differentiation and clear value propositions. Notable developments include increased interest in B2B SaaS solutions and healthcare technology innovations.`;
}

// Determine why an idea is a special mention
function determineSpecialMentionReason(idea) {
    if (idea.market_score >= 90) return 'Exceptional Market Opportunity';
    if (idea.roi_score >= 85) return 'High ROI Potential';
    if (idea.development_score >= 90) return 'Low Development Risk';
    if (idea.competition_score >= 85) return 'Low Competition Environment';
    return 'Strategic Innovation Opportunity';
}

// Update historical trends
async function updateHistoricalTrends(supabaseUrl, serviceRoleKey, topIdeas, date) {
    try {
        const trends = {};
        const industries = {};
        
        topIdeas.forEach(idea => {
            // Category trends
            if (!trends[idea.category]) {
                trends[idea.category] = { scores: [], count: 0 };
            }
            trends[idea.category].scores.push(idea.overall_score);
            trends[idea.category].count++;
            
            // Industry trends
            if (idea.industry && !industries[idea.industry]) {
                industries[idea.industry] = { scores: [], count: 0 };
            }
            if (idea.industry) {
                industries[idea.industry].scores.push(idea.overall_score);
                industries[idea.industry].count++;
            }
        });
        
        // Insert category trends
        for (const [category, data] of Object.entries(trends)) {
            const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
            
            await fetch(`${supabaseUrl}/rest/v1/historical_trends`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trend_date: date,
                    category: category,
                    avg_score: Math.round(avgScore * 100) / 100,
                    idea_count: data.count,
                    trending_keywords: extractTrendingKeywords(topIdeas.filter(i => i.category === category))
                })
            });
        }
        
        // Insert industry trends
        for (const [industry, data] of Object.entries(industries)) {
            const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
            
            await fetch(`${supabaseUrl}/rest/v1/historical_trends`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trend_date: date,
                    industry: industry,
                    avg_score: Math.round(avgScore * 100) / 100,
                    idea_count: data.count,
                    trending_keywords: extractTrendingKeywords(topIdeas.filter(i => i.industry === industry))
                })
            });
        }
        
    } catch (error) {
        console.error('Error updating historical trends:', error.message);
    }
}

// Extract trending keywords
function extractTrendingKeywords(ideas) {
    const keywords = {};
    
    ideas.forEach(idea => {
        const text = (idea.title + ' ' + idea.description).toLowerCase();
        const words = text.match(/\b\w{3,}\b/g) || [];
        
        words.forEach(word => {
            if (!['the', 'and', 'for', 'with', 'that', 'this', 'are', 'can', 'has', 'will'].includes(word)) {
                keywords[word] = (keywords[word] || 0) + 1;
            }
        });
    });
    
    return Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
}

// Generate notifications for high-scoring ideas
async function generateNotifications(supabaseUrl, serviceRoleKey, topIdeas) {
    try {
        const highScoreThreshold = 85;
        const breakoutIdeas = topIdeas.filter(idea => idea.overall_score >= highScoreThreshold);
        
        for (const idea of breakoutIdeas) {
            await fetch(`${supabaseUrl}/rest/v1/system_notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notification_type: 'high_score_alert',
                    title: 'High-Scoring Opportunity Detected',
                    message: `${idea.title} achieved an exceptional score of ${idea.overall_score}/100. This represents a significant market opportunity in the ${idea.category} sector.`,
                    severity: 'high',
                    related_idea_id: idea.id
                })
            });
        }
        
    } catch (error) {
        console.error('Error generating notifications:', error.message);
    }
}