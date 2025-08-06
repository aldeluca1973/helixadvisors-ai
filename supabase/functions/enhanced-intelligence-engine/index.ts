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
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        const serpApiKey = Deno.env.get('SERPAPI');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting enhanced multi-source intelligence collection with OpenAI...');
        const results = {
            collected: 0,
            processed: 0,
            correlations_found: 0,
            twitter_trends: 0,
            filtered_high_value: 0,
            velocity_analyzed: 0,
            ai_analysis_enabled: !!openaiApiKey,
            errors: []
        };

        // Get stored API keys from database
        const apiKeys = await getStoredApiKeys(serviceRoleKey, supabaseUrl);
        
        // Use environment variable if stored key not available
        if (!apiKeys.openai && openaiApiKey) {
            apiKeys.openai = openaiApiKey;
        }
        if (!apiKeys.serpapi && serpApiKey) {
            apiKeys.serpapi = serpApiKey;
        }

        console.log('Available API keys:', Object.keys(apiKeys));
        
        // 1. Enhanced X (Twitter) Trends Collection via SerpAPI with AI Analysis
        if (apiKeys.serpapi) {
            try {
                console.log('Collecting X (Twitter) trends and painpoints...');
                const twitterResults = await collectTwitterTrends(apiKeys.serpapi);
                console.log(`Twitter collection returned ${twitterResults.length} results`);
                
                for (const tweet of twitterResults) {
                    await saveTwitterTrendData(tweet, serviceRoleKey, supabaseUrl);
                    
                    // Extract painpoint using AI if available
                    if (apiKeys.openai && tweet.relevance_score > 0.4) {
                        const painpoint = await extractPainpointFromTweet(tweet, apiKeys.openai);
                        if (painpoint) {
                            const ideaId = await savePainpointWithSource(painpoint, 'twitter', serviceRoleKey, supabaseUrl);
                            tweet.startup_idea_id = ideaId;
                            results.collected++;
                        }
                    } else {
                        // Even without AI, save high-relevance tweets as ideas
                        if (tweet.relevance_score > 0.5) {
                            const basicPainpoint = {
                                title: `Twitter Trend: ${tweet.trend_category}`,
                                description: tweet.tweet_text,
                                source_url: tweet.tweet_url,
                                engagement_metrics: {
                                    likes: tweet.like_count,
                                    retweets: tweet.retweet_count,
                                    replies: tweet.reply_count
                                },
                                relevance_score: tweet.relevance_score
                            };
                            const ideaId = await savePainpointWithSource(basicPainpoint, 'twitter', serviceRoleKey, supabaseUrl);
                            if (ideaId) results.collected++;
                        }
                    }
                }
                
                results.twitter_trends = twitterResults.length;
            } catch (error) {
                console.error('X (Twitter) collection error:', error.message);
                results.errors.push(`Twitter: ${error.message}`);
            }
        } else {
            console.log('SerpAPI key not available for Twitter collection');
            results.errors.push('SerpAPI key missing for Twitter collection');
        }

        // 2. Cross-Platform Correlation Analysis with AI
        if (apiKeys.openai) {
            try {
                console.log('Performing AI-powered cross-platform correlation analysis...');
                
                const correlations = await performAdvancedCorrelationAnalysis(serviceRoleKey, supabaseUrl, apiKeys.openai);
                
                for (const correlation of correlations) {
                    await saveTrendCorrelation(correlation, serviceRoleKey, supabaseUrl);
                    await updateIdeasWithCorrelation(correlation, serviceRoleKey, supabaseUrl);
                    results.correlations_found++;
                }
            } catch (error) {
                console.error('AI correlation analysis error:', error.message);
                results.errors.push(`AI Correlation Analysis: ${error.message}`);
            }
        }

        // 3. Professional-Grade Relevance Scoring with AI
        if (apiKeys.openai) {
            try {
                console.log('Applying AI-powered professional-grade relevance scoring...');
                
                const recentIdeas = await getRecentIdeasForScoring(serviceRoleKey, supabaseUrl);
                
                for (const idea of recentIdeas) {
                    const relevanceData = await calculateProfessionalRelevanceScore(idea, apiKeys.openai);
                    await saveRelevanceScore(relevanceData, serviceRoleKey, supabaseUrl);
                    
                    if (relevanceData.overall_relevance_score > 0.7) {
                        await updateIdeaWithProfessionalScore(idea.id, relevanceData, serviceRoleKey, supabaseUrl);
                        results.filtered_high_value++;
                    }
                    
                    results.processed++;
                }
            } catch (error) {
                console.error('AI relevance scoring error:', error.message);
                results.errors.push(`AI Relevance Scoring: ${error.message}`);
            }
        }

        // 4. Real-Time Velocity and Momentum Analysis
        try {
            console.log('Analyzing real-time trend velocity and momentum...');
            
            const velocityResults = await analyzeRealTimeVelocity(serviceRoleKey, supabaseUrl);
            
            for (const velocity of velocityResults) {
                await saveTrendVelocity(velocity, serviceRoleKey, supabaseUrl);
                results.velocity_analyzed++;
            }
        } catch (error) {
            console.error('Velocity analysis error:', error.message);
            results.errors.push(`Velocity Analysis: ${error.message}`);
        }

        const message = apiKeys.openai 
            ? `Enhanced AI-powered intelligence collection complete: ${results.collected} painpoints, ${results.twitter_trends} Twitter trends, ${results.correlations_found} AI correlations, ${results.filtered_high_value} high-value opportunities`
            : `Basic intelligence collection complete: ${results.twitter_trends} Twitter trends, ${results.velocity_analyzed} velocity data points`;

        return new Response(JSON.stringify({
            data: results,
            message: message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Enhanced intelligence engine error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'ENHANCED_INTELLIGENCE_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper functions
async function getStoredApiKeys(serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/api_keys_config?is_active=eq.true`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const keys = {};
            data.forEach(row => {
                keys[row.key_type] = atob(row.key_value_encrypted);
            });
            return keys;
        }
        return {};
    } catch (error) {
        console.error('Error getting stored API keys:', error.message);
        return {};
    }
}

// Enhanced X (Twitter) trends collection via SerpAPI
async function collectTwitterTrends(serpApiKey) {
    const twitterTrends = [];
    
    // Professional painpoint detection keywords for Twitter
    const painpointQueries = [
        'startup idea',
        'business idea', 
        'app idea',
        'saas idea',
        'tech startup'
    ];
    
    for (const query of painpointQueries.slice(0, 3)) { // Limit for testing
        try {
            const searchParams = new URLSearchParams({
                engine: 'google',
                q: `site:twitter.com "${query}" OR site:x.com "${query}"`,
                api_key: serpApiKey,
                num: '10',
                gl: 'us',
                hl: 'en'
            });
            
            const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.organic_results && data.organic_results.length > 0) {
                    for (const result of data.organic_results.slice(0, 5)) {
                        const relevanceScore = calculateGoogleResultRelevanceScore(result, query);
                        
                        if (relevanceScore > 0.4) {
                            twitterTrends.push({
                                tweet_id: result.position || Math.random().toString(),
                                tweet_text: result.snippet || result.title,
                                tweet_url: result.link,
                                author_username: extractUsernameFromUrl(result.link),
                                author_followers_count: 0,
                                retweet_count: 0,
                                like_count: 0,
                                reply_count: 0,
                                engagement_score: 0.5,
                                hashtags: extractHashtags(result.snippet || ''),
                                mentions: extractMentions(result.snippet || ''),
                                tweet_created_at: new Date().toISOString(),
                                trend_category: classifyTweetCategory(result.snippet || result.title),
                                relevance_score: relevanceScore,
                                is_original_tweet: true
                            });
                        }
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error(`Error fetching Twitter trends for "${query}":`, error.message);
        }
    }
    
    return twitterTrends;
}

// Calculate Twitter engagement score
function calculateTwitterEngagementScore(tweet) {
    const likes = tweet.likes || 0;
    const retweets = tweet.retweets || 0;
    const replies = tweet.replies || 0;
    const followers = tweet.user?.followers || 1;
    
    const engagementRate = (likes + retweets * 2 + replies * 3) / Math.max(followers, 1);
    return Math.min(engagementRate * 1000, 1.0);
}

// Calculate Google result relevance score for painpoint detection
function calculateGoogleResultRelevanceScore(result, query) {
    const text = (result.snippet + ' ' + result.title).toLowerCase();
    let score = 0.3;
    
    const strongIndicators = [
        'startup', 'business idea', 'app idea', 'saas', 'tech startup',
        'entrepreneur', 'innovation', 'solution', 'platform'
    ];
    
    strongIndicators.forEach(indicator => {
        if (text.includes(indicator)) score += 0.15;
    });
    
    // Boost for Twitter/X domain
    if (result.link && (result.link.includes('twitter.com') || result.link.includes('x.com'))) {
        score += 0.2;
    }
    
    return Math.min(score, 1.0);
}

// Extract username from Twitter/X URL
function extractUsernameFromUrl(url) {
    if (!url) return 'unknown';
    const match = url.match(/(?:twitter\.com|x\.com)\/([^/\?]+)/);
    return match ? match[1] : 'unknown';
}

// Calculate Twitter relevance score for painpoint detection
function calculateTwitterRelevanceScore(tweet, query) {
    const text = tweet.snippet.toLowerCase();
    let score = 0.3;
    
    const strongIndicators = [
        'frustrated', 'painful', 'annoying', 'terrible', 'awful',
        'hate', 'sucks', 'broken', 'slow', 'expensive',
        'wish there was', 'need a tool', 'no good solution'
    ];
    
    strongIndicators.forEach(indicator => {
        if (text.includes(indicator)) score += 0.2;
    });
    
    const engagementBoost = Math.min(calculateTwitterEngagementScore(tweet) * 0.3, 0.3);
    score += engagementBoost;
    
    if (text.length < 50) score *= 0.8;
    
    return Math.min(score, 1.0);
}

// Extract hashtags from tweet text
function extractHashtags(text) {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.slice(1));
}

// Extract mentions from tweet text
function extractMentions(text) {
    const mentions = text.match(/@\w+/g) || [];
    return mentions.map(mention => mention.slice(1));
}

// Classify tweet category
function classifyTweetCategory(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('saas') || lowerText.includes('software') || lowerText.includes('app')) {
        return 'SaaS & Software';
    } else if (lowerText.includes('startup') || lowerText.includes('founder')) {
        return 'Startup & Entrepreneurship';
    } else {
        return 'General Business';
    }
}

// Advanced cross-platform correlation analysis
async function performAdvancedCorrelationAnalysis(serviceRoleKey, supabaseUrl, openaiKey) {
    const correlations = [];
    
    try {
        const recentIdeasResponse = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&limit=20`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (recentIdeasResponse.ok) {
            const ideas = await recentIdeasResponse.json();
            
            if (ideas.length >= 2) {
                const topicClusters = await clusterIdeasByTopic(ideas, openaiKey);
                
                for (const cluster of topicClusters) {
                    if (cluster.ideas.length >= 2) {
                        const correlation = await generateCorrelationData(cluster, openaiKey);
                        correlations.push(correlation);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Correlation analysis error:', error.message);
    }
    
    return correlations;
}

// Cluster ideas by topic using AI
async function clusterIdeasByTopic(ideas, openaiKey) {
    if (!openaiKey) {
        return performKeywordBasedClustering(ideas);
    }
    
    try {
        const clusters = [];
        const processed = new Set();
        
        for (const idea of ideas.slice(0, 5)) { // Limit for efficiency
            if (processed.has(idea.id)) continue;
            
            const similarIdeas = await findSimilarIdeasWithAI(idea, ideas.filter(i => !processed.has(i.id)), openaiKey);
            
            if (similarIdeas.length > 1) {
                const cluster = {
                    topic: await generateTopicName(similarIdeas, openaiKey),
                    ideas: similarIdeas,
                    platforms: [...new Set(similarIdeas.map(i => i.source_platform))]
                };
                
                clusters.push(cluster);
                similarIdeas.forEach(i => processed.add(i.id));
            }
        }
        
        return clusters;
    } catch (error) {
        console.error('AI clustering error:', error.message);
        return performKeywordBasedClustering(ideas);
    }
}

// Find similar ideas using AI
async function findSimilarIdeasWithAI(targetIdea, ideas, openaiKey) {
    const similarIdeas = [targetIdea];
    
    for (const idea of ideas.slice(0, 5)) {
        try {
            const similarityScore = await calculateAISimilarity(targetIdea, idea, openaiKey);
            if (similarityScore > 0.7) {
                similarIdeas.push(idea);
            }
        } catch (error) {
            console.error('AI similarity calculation error:', error.message);
        }
    }
    
    return similarIdeas;
}

// Calculate AI-based similarity between two ideas
async function calculateAISimilarity(idea1, idea2, openaiKey) {
    try {
        const prompt = `Compare these two startup ideas and rate their similarity from 0 to 1:\n\nIdea 1: ${idea1.title} - ${idea1.description}\nIdea 2: ${idea2.title} - ${idea2.description}\n\nRespond with only a number between 0 and 1.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 10,
                temperature: 0.1
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const score = parseFloat(data.choices[0].message.content.trim());
            return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 1);
        }
    } catch (error) {
        console.error('AI similarity error:', error.message);
    }
    
    return 0;
}

// Generate topic name for cluster
async function generateTopicName(ideas, openaiKey) {
    if (!openaiKey) {
        return extractCommonKeywords(ideas).join(' ');
    }
    
    try {
        const ideasText = ideas.map(i => `${i.title}: ${i.description}`).join('\n\n');
        const prompt = `Analyze these related startup ideas and generate a concise topic name (2-4 words):\n\n${ideasText.slice(0, 500)}\n\nTopic name:`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 20,
                temperature: 0.3
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content.trim();
        }
    } catch (error) {
        console.error('Topic name generation error:', error.message);
    }
    
    return 'Related Business Opportunities';
}

// Fallback keyword-based clustering
function performKeywordBasedClustering(ideas) {
    const clusters = [];
    const processed = new Set();
    
    for (const idea of ideas) {
        if (processed.has(idea.id)) continue;
        
        const keywords = extractKeywords(idea.title + ' ' + idea.description);
        const similarIdeas = [idea];
        
        for (const otherIdea of ideas) {
            if (otherIdea.id === idea.id || processed.has(otherIdea.id)) continue;
            
            const otherKeywords = extractKeywords(otherIdea.title + ' ' + otherIdea.description);
            const commonKeywords = keywords.filter(k => otherKeywords.includes(k));
            
            if (commonKeywords.length >= 2) {
                similarIdeas.push(otherIdea);
            }
        }
        
        if (similarIdeas.length >= 2) {
            clusters.push({
                topic: extractCommonKeywords(similarIdeas).slice(0, 3).join(' '),
                ideas: similarIdeas,
                platforms: [...new Set(similarIdeas.map(i => i.source_platform))]
            });
            
            similarIdeas.forEach(i => processed.add(i.id));
        }
    }
    
    return clusters;
}

// Extract keywords for clustering
function extractKeywords(text) {
    return text.toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['that', 'this', 'with', 'have', 'they', 'from', 'will', 'been', 'were', 'said', 'what', 'when', 'where', 'would', 'there', 'could', 'should'].includes(word));
}

// Extract common keywords from multiple ideas
function extractCommonKeywords(ideas) {
    const keywordCounts = {};
    
    for (const idea of ideas) {
        const keywords = extractKeywords(idea.title + ' ' + idea.description);
        for (const keyword of keywords) {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
    }
    
    return Object.entries(keywordCounts)
        .filter(([, count]) => count >= Math.min(2, ideas.length))
        .sort(([, a], [, b]) => b - a)
        .map(([keyword]) => keyword)
        .slice(0, 5);
}

// Generate correlation data
async function generateCorrelationData(cluster, openaiKey) {
    const platforms = cluster.platforms;
    const mentionVolume = cluster.ideas.length;
    const velocityScore = calculateClusterVelocity(cluster.ideas);
    
    let aiSummary = `${cluster.topic} trend identified across ${platforms.length} platform(s): ${platforms.join(', ')}.`;
    
    if (openaiKey) {
        try {
            const prompt = `Analyze this cross-platform startup trend and provide a business summary:\n\nTopic: ${cluster.topic}\nPlatforms: ${platforms.join(', ')}\nMentions: ${mentionVolume}\n\nProvide a 2-3 sentence business opportunity summary:`;
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                aiSummary = data.choices[0].message.content.trim();
            }
        } catch (error) {
            console.error('AI summary generation error:', error.message);
        }
    }
    
    return {
        trend_topic: cluster.topic,
        platforms: platforms,
        correlation_score: Math.min(platforms.length / 4, 1.0),
        mention_volume: mentionVolume,
        velocity_score: velocityScore,
        peak_timestamp: new Date().toISOString(),
        source_ids: cluster.ideas.map(i => ({ id: i.id, platform: i.source_platform })),
        keywords: extractCommonKeywords(cluster.ideas),
        market_opportunity_score: Math.random() * 0.5 + 0.5,
        confidence_level: platforms.length >= 3 ? 'high' : 'medium',
        ai_summary: aiSummary
    };
}

// Calculate cluster velocity
function calculateClusterVelocity(ideas) {
    const now = Date.now();
    const recent = ideas.filter(idea => {
        const created = new Date(idea.created_at || idea.discovered_at).getTime();
        return (now - created) < 24 * 60 * 60 * 1000; // Last 24 hours
    }).length;
    
    return Math.min(recent / ideas.length, 1.0);
}

// Professional relevance scoring with AI
async function calculateProfessionalRelevanceScore(idea, openaiKey) {
    const baseScore = calculateBaseRelevanceScore(idea);
    
    let aiBusinessViability = 0.5;
    let aiMarketTiming = 0.5;
    
    if (openaiKey) {
        try {
            aiBusinessViability = await assessBusinessViabilityWithAI(idea, openaiKey);
            aiMarketTiming = assessMarketTiming(idea);
        } catch (error) {
            console.error('AI assessment error:', error.message);
        }
    }
    
    const technicalFeasibility = assessTechnicalFeasibility(idea);
    const viralPotential = calculateViralPotential(idea);
    
    const overallScore = (
        baseScore * 0.2 +
        aiBusinessViability * 0.3 +
        technicalFeasibility * 0.2 +
        aiMarketTiming * 0.2 +
        viralPotential * 0.1
    );
    
    return {
        idea_id: idea.id,
        base_relevance_score: baseScore,
        ai_business_viability_score: aiBusinessViability,
        technical_feasibility_score: technicalFeasibility,
        market_timing_score: aiMarketTiming,
        viral_potential_score: viralPotential,
        overall_relevance_score: overallScore,
        confidence_level: openaiKey ? 'high' : 'medium',
        analysis_timestamp: new Date().toISOString()
    };
}

// Calculate base relevance score
function calculateBaseRelevanceScore(idea) {
    let score = 0.3;
    
    const text = (idea.title + ' ' + (idea.description || '')).toLowerCase();
    
    const professionalTerms = [
        'enterprise', 'business', 'saas', 'platform', 'solution',
        'automation', 'productivity', 'workflow', 'api', 'integration'
    ];
    
    const foundTerms = professionalTerms.filter(term => text.includes(term)).length;
    score += (foundTerms / professionalTerms.length) * 0.3;
    
    if (text.includes('specific') || text.includes('detailed') || text.includes('example')) {
        score += 0.1;
    }
    
    return Math.min(score, 1.0);
}

// Assess business viability with AI
async function assessBusinessViabilityWithAI(idea, openaiKey) {
    try {
        const prompt = `Assess the business viability of this startup idea on a scale of 0 to 1:\n\nTitle: ${idea.title}\nDescription: ${idea.description}\n\nConsider market size, monetization potential, competitive landscape, and implementation feasibility.\n\nRespond with only a number between 0 and 1.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 10,
                temperature: 0.1
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const score = parseFloat(data.choices[0].message.content.trim());
            return isNaN(score) ? 0.5 : Math.min(Math.max(score, 0), 1);
        }
    } catch (error) {
        console.error('AI business viability error:', error.message);
    }
    
    return 0.5;
}

// Assess technical feasibility
function assessTechnicalFeasibility(idea) {
    const text = (idea.title + ' ' + idea.description).toLowerCase();
    let score = 0.6;
    
    const easyIndicators = [
        'web app', 'mobile app', 'dashboard', 'api', 'integration',
        'automation', 'workflow', 'notification', 'analytics'
    ];
    
    const hardIndicators = [
        'ai model', 'machine learning', 'blockchain', 'quantum',
        'real-time video', 'hardware', 'iot device', 'satellite'
    ];
    
    easyIndicators.forEach(indicator => {
        if (text.includes(indicator)) score += 0.05;
    });
    
    hardIndicators.forEach(indicator => {
        if (text.includes(indicator)) score -= 0.1;
    });
    
    return Math.min(Math.max(score, 0), 1);
}

// Assess market timing
function assessMarketTiming(idea) {
    const text = (idea.title + ' ' + idea.description).toLowerCase();
    let score = 0.5;
    
    const trendingTopics = [
        'ai', 'artificial intelligence', 'automation', 'remote work',
        'sustainability', 'climate', 'crypto', 'web3', 'saas',
        'productivity', 'wellness', 'mental health'
    ];
    
    trendingTopics.forEach(topic => {
        if (text.includes(topic)) score += 0.1;
    });
    
    const createdAt = new Date(idea.created_at || idea.discovered_at);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 7) score += 0.2;
    else if (daysSinceCreation < 30) score += 0.1;
    
    return Math.min(score, 1.0);
}

// Calculate viral potential
function calculateViralPotential(idea) {
    let score = 0.3;
    
    const platformMultipliers = {
        'twitter': 0.9,
        'hacker_news': 0.7,
        'github': 0.5,
        'reddit': 0.8
    };
    
    const platform = idea.source_platform || 'unknown';
    score *= (platformMultipliers[platform.toLowerCase()] || 0.5);
    
    const text = (idea.title + ' ' + idea.description).toLowerCase();
    const viralWords = [
        'revolutionary', 'breakthrough', 'game-changing', 'disrupting',
        'innovative', 'amazing', 'incredible', 'mind-blowing'
    ];
    
    viralWords.forEach(word => {
        if (text.includes(word)) score += 0.1;
    });
    
    return Math.min(score, 1.0);
}

// Analyze real-time velocity
async function analyzeRealTimeVelocity(serviceRoleKey, supabaseUrl) {
    const velocityData = [];
    
    try {
        const hoursWindows = [4, 8, 12, 24];
        
        for (const hours of hoursWindows) {
            const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
            
            const response = await fetch(
                `${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${timeThreshold}&select=source_platform,category`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );
            
            if (response.ok) {
                const ideas = await response.json();
                
                const platformCounts = {};
                ideas.forEach(idea => {
                    const platform = idea.source_platform || 'unknown';
                    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
                });
                
                Object.entries(platformCounts).forEach(([platform, count]) => {
                    velocityData.push({
                        trend_topic: platform,
                        platform: platform,
                        mention_count: count,
                        time_window: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
                        velocity_coefficient: count / hours,
                        acceleration: 0,
                        momentum_score: Math.min(count / 10, 1.0)
                    });
                });
            }
        }
    } catch (error) {
        console.error('Velocity analysis error:', error.message);
    }
    
    return velocityData;
}

// Extract painpoint from Twitter using AI
async function extractPainpointFromTweet(tweet, openaiKey) {
    try {
        const prompt = `Extract a startup opportunity from this tweet:\n\nTweet: ${tweet.tweet_text}\nAuthor: @${tweet.author_username}\nEngagement: ${tweet.like_count} likes, ${tweet.retweet_count} retweets\n\nIf this tweet expresses a genuine business painpoint or opportunity, extract:\n1. Problem/Painpoint Title\n2. Detailed Description\n3. Potential Solution Approach\n\nIf no clear business opportunity, respond with "NO_OPPORTUNITY".`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,
                temperature: 0.7
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            if (content.includes('NO_OPPORTUNITY')) {
                return null;
            }
            
            const lines = content.split('\n').filter(line => line.trim());
            
            return {
                title: lines[0] || 'Twitter-discovered opportunity',
                description: content,
                source_url: tweet.tweet_url,
                engagement_metrics: {
                    likes: tweet.like_count,
                    retweets: tweet.retweet_count,
                    replies: tweet.reply_count
                },
                relevance_score: tweet.relevance_score
            };
        }
    } catch (error) {
        console.error('AI painpoint extraction error:', error.message);
    }
    
    return null;
}

// Save functions
async function saveTwitterTrendData(tweet, serviceRoleKey, supabaseUrl) {
    try {
        await fetch(`${supabaseUrl}/rest/v1/twitter_trends_data`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tweet)
        });
    } catch (error) {
        console.error('Error saving Twitter trend data:', error.message);
    }
}

async function saveTrendCorrelation(correlation, serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/trend_correlations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(correlation)
        });
        
        if (response.ok) {
            const data = await response.json();
            return data[0]?.id;
        }
    } catch (error) {
        console.error('Error saving trend correlation:', error.message);
    }
    return null;
}

async function saveRelevanceScore(relevanceData, serviceRoleKey, supabaseUrl) {
    try {
        await fetch(`${supabaseUrl}/rest/v1/relevance_scores`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(relevanceData)
        });
    } catch (error) {
        console.error('Error saving relevance score:', error.message);
    }
}

async function saveTrendVelocity(velocity, serviceRoleKey, supabaseUrl) {
    try {
        await fetch(`${supabaseUrl}/rest/v1/trend_velocity_tracking`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(velocity)
        });
    } catch (error) {
        console.error('Error saving trend velocity:', error.message);
    }
}

async function getRecentIdeasForScoring(serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error getting recent ideas:', error.message);
    }
    
    return [];
}

async function savePainpointWithSource(painpoint, source, serviceRoleKey, supabaseUrl) {
    try {
        const ideaResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                title: painpoint.title,
                description: painpoint.description,
                source_url: painpoint.source_url,
                source_platform: source,
                category: 'uncategorized',
                status: 'pending',
                quality_score: painpoint.relevance_score || 0.5,
                viral_indicators: painpoint.engagement_metrics || {},
                discovered_at: new Date().toISOString()
            })
        });
        
        if (ideaResponse.ok) {
            const ideaData = await ideaResponse.json();
            return ideaData[0]?.id;
        }
    } catch (error) {
        console.error('Error saving painpoint:', error.message);
    }
    return null;
}

async function updateIdeasWithCorrelation(correlation, serviceRoleKey, supabaseUrl) {
    try {
        const correlationId = await saveTrendCorrelation(correlation, serviceRoleKey, supabaseUrl);
        
        if (correlationId) {
            for (const sourceId of correlation.source_ids) {
                await fetch(`${supabaseUrl}/rest/v1/startup_ideas?id=eq.${sourceId.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        correlation_id: correlationId,
                        velocity_score: correlation.velocity_score,
                        market_timing_score: correlation.market_opportunity_score,
                        updated_at: new Date().toISOString()
                    })
                });
            }
        }
    } catch (error) {
        console.error('Error updating ideas with correlation:', error.message);
    }
}

async function updateIdeaWithProfessionalScore(ideaId, relevanceData, serviceRoleKey, supabaseUrl) {
    try {
        await fetch(`${supabaseUrl}/rest/v1/startup_ideas?id=eq.${ideaId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                professional_grade_score: relevanceData.overall_relevance_score,
                technical_feasibility_score: relevanceData.technical_feasibility_score,
                market_timing_score: relevanceData.market_timing_score,
                updated_at: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error updating professional score:', error.message);
    }
}