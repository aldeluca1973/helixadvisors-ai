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
        const serpApiKey = Deno.env.get('SERPAPI');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting professional-grade multi-source intelligence collection...');
        const results = {
            collected: 0,
            processed: 0,
            correlations_found: 0,
            twitter_trends: 0,
            filtered_high_value: 0,
            velocity_analyzed: 0,
            professional_score_updated: 0,
            cross_platform_validated: 0,
            errors: []
        };

        // Get stored API keys
        const apiKeys = await getStoredApiKeys(serviceRoleKey, supabaseUrl);
        
        // 1. Enhanced X (Twitter) Intelligence Collection
        if (serpApiKey || apiKeys.serpapi) {
            try {
                console.log('Collecting professional X (Twitter) intelligence...');
                const twitterResults = await collectProfessionalTwitterIntelligence(serpApiKey || apiKeys.serpapi);
                
                for (const tweet of twitterResults) {
                    await saveTwitterTrendData(tweet, serviceRoleKey, supabaseUrl);
                    
                    // Professional AI analysis for high-value tweets
                    if (apiKeys.openai && tweet.professional_relevance_score > 0.7) {
                        const analysis = await performProfessionalTweetAnalysis(tweet, apiKeys.openai);
                        if (analysis) {
                            const ideaId = await saveProfessionalPainpointWithMetrics(analysis, 'twitter', serviceRoleKey, supabaseUrl);
                            tweet.startup_idea_id = ideaId;
                            results.collected++;
                        }
                    }
                }
                
                results.twitter_trends = twitterResults.length;
            } catch (error) {
                console.error('Professional X intelligence collection error:', error.message);
                results.errors.push(`X Intelligence: ${error.message}`);
            }
        }

        // 2. Cross-Platform Data Correlation and Validation
        try {
            console.log('Performing professional cross-platform correlation...');
            
            const correlations = await performProfessionalCorrelationAnalysis(serviceRoleKey, supabaseUrl, apiKeys.openai);
            
            for (const correlation of correlations) {
                await saveProfessionalTrendCorrelation(correlation, serviceRoleKey, supabaseUrl);
                
                // Update related startup ideas with professional correlation data
                await updateIdeasWithProfessionalCorrelation(correlation, serviceRoleKey, supabaseUrl);
                results.correlations_found++;
                results.cross_platform_validated += correlation.validated_count || 0;
            }
        } catch (error) {
            console.error('Professional correlation analysis error:', error.message);
            results.errors.push(`Professional Correlation: ${error.message}`);
        }

        // 3. Intelligent Filtering and Relevance Scoring
        try {
            console.log('Applying professional-grade intelligent filtering...');
            
            const recentIdeas = await getRecentIdeasForProfessionalScoring(serviceRoleKey, supabaseUrl);
            
            for (const idea of recentIdeas) {
                const professionalRelevance = await calculateProfessionalRelevanceScore(idea, apiKeys.openai);
                await saveProfessionalRelevanceScore(professionalRelevance, serviceRoleKey, supabaseUrl);
                
                // Update idea with professional metrics
                if (professionalRelevance.overall_relevance_score > 0.75) {
                    await updateIdeaWithProfessionalMetrics(idea.id, professionalRelevance, serviceRoleKey, supabaseUrl);
                    results.filtered_high_value++;
                }
                
                results.professional_score_updated++;
            }
        } catch (error) {
            console.error('Professional intelligent filtering error:', error.message);
            results.errors.push(`Professional Filtering: ${error.message}`);
        }

        // 4. Real-Time Trend Detection and Velocity Analysis
        try {
            console.log('Analyzing professional real-time trend velocity...');
            
            const velocityResults = await analyzeProfessionalTrendVelocity(serviceRoleKey, supabaseUrl, apiKeys.openai);
            
            for (const velocity of velocityResults) {
                await saveProfessionalTrendVelocity(velocity, serviceRoleKey, supabaseUrl);
                results.velocity_analyzed++;
            }
        } catch (error) {
            console.error('Professional velocity analysis error:', error.message);
            results.errors.push(`Professional Velocity: ${error.message}`);
        }

        // 5. Multi-Source Data Integration and Enhancement
        try {
            console.log('Enhancing existing sources with professional analysis...');
            
            const enhancedSources = await collectProfessionalEnhancedSources(apiKeys);
            
            for (const source of enhancedSources) {
                for (const painpoint of source.painpoints) {
                    if (painpoint.professional_relevance_score > 0.6) {
                        const ideaId = await saveProfessionalPainpointWithMetrics(painpoint, source.platform, serviceRoleKey, supabaseUrl);
                        painpoint.startup_idea_id = ideaId;
                        results.collected++;
                    }
                }
            }
        } catch (error) {
            console.error('Professional enhanced sources collection error:', error.message);
            results.errors.push(`Professional Enhanced Sources: ${error.message}`);
        }

        return new Response(JSON.stringify({
            data: results,
            message: `Professional intelligence collection complete: ${results.collected} painpoints, ${results.twitter_trends} X trends, ${results.correlations_found} correlations, ${results.filtered_high_value} high-value opportunities, ${results.cross_platform_validated} cross-platform validated`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Professional multi-source intelligence engine error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'PROFESSIONAL_INTELLIGENCE_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Professional X (Twitter) Intelligence Collection
async function collectProfessionalTwitterIntelligence(serpApiKey) {
    const twitterIntelligence = [];
    
    // Professional-grade painpoint detection keywords
    const professionalQueries = [
        // SaaS and B2B focused
        'B2B SaaS painpoint',
        'enterprise software problem',
        'business automation need',
        'workflow inefficiency',
        
        // Startup and entrepreneurship
        'startup idea validation',
        'entrepreneur problem statement',
        'business opportunity gap',
        'market need validation',
        
        // Technical and developer focused
        'developer tool missing',
        'API integration pain',
        'technical debt solution',
        'automation opportunity',
        
        // Professional productivity
        'productivity software gap',
        'manual process automation',
        'business process optimization',
        'professional tool missing',
        
        // Market and customer insights
        'customer feedback pain',
        'user experience problem',
        'product market fit issue',
        'customer acquisition challenge'
    ];
    
    for (const query of professionalQueries) {
        try {
            const searchParams = new URLSearchParams({
                engine: 'twitter',
                q: `"${query}" OR ${query.replace(/\s+/g, ' OR ')}`,
                api_key: serpApiKey,
                result_type: 'mixed', // Include both recent and popular
                count: '30',
                lang: 'en',
                tweet_mode: 'extended'
            });
            
            const response = await fetch(`https://serpapi.com/search?${searchParams.toString()}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.tweets && data.tweets.length > 0) {
                    for (const tweet of data.tweets) {
                        // Professional relevance scoring
                        const professionalScore = calculateProfessionalTwitterRelevance(tweet, query);
                        
                        if (professionalScore.overall_score > 0.5) {
                            twitterIntelligence.push({
                                tweet_id: tweet.tweet_id,
                                tweet_text: tweet.snippet,
                                tweet_url: tweet.link,
                                author_username: extractTwitterUsername(tweet.displayed_link),
                                author_followers_count: tweet.user?.followers || 0,
                                retweet_count: tweet.retweets || 0,
                                like_count: tweet.likes || 0,
                                reply_count: tweet.replies || 0,
                                professional_engagement_score: calculateProfessionalEngagement(tweet),
                                hashtags: extractHashtags(tweet.snippet),
                                mentions: extractMentions(tweet.snippet),
                                tweet_created_at: tweet.date || new Date().toISOString(),
                                trend_category: classifyProfessionalCategory(tweet.snippet),
                                professional_relevance_score: professionalScore.overall_score,
                                business_viability_score: professionalScore.business_viability,
                                market_timing_score: professionalScore.market_timing,
                                technical_feasibility_score: professionalScore.technical_feasibility,
                                audience_quality_score: professionalScore.audience_quality,
                                is_original_tweet: !tweet.snippet.startsWith('RT @'),
                                professional_keywords: extractProfessionalKeywords(tweet.snippet),
                                search_query: query
                            });
                        }
                    }
                }
            }
            
            // Professional rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`Error fetching professional Twitter intelligence for "${query}":`, error.message);
        }
    }
    
    // Deduplicate and sort by professional relevance
    const uniqueTweets = twitterIntelligence.filter((tweet, index, self) => 
        index === self.findIndex(t => t.tweet_id === tweet.tweet_id)
    );
    
    return uniqueTweets.sort((a, b) => b.professional_relevance_score - a.professional_relevance_score);
}

// Calculate professional Twitter relevance
function calculateProfessionalTwitterRelevance(tweet, query) {
    const text = tweet.snippet.toLowerCase();
    const scores = {
        business_viability: 0.3,
        market_timing: 0.3,
        technical_feasibility: 0.3,
        audience_quality: 0.3
    };
    
    // Business viability indicators
    const businessIndicators = [
        'revenue', 'profit', 'business model', 'monetization',
        'customer acquisition', 'market size', 'scalable',
        'enterprise', 'b2b', 'saas', 'subscription'
    ];
    
    // Market timing indicators
    const timingIndicators = [
        'trending', 'growing demand', 'market opportunity',
        'emerging need', 'rising interest', 'popular',
        'increasing', 'boom', 'surge', 'adoption'
    ];
    
    // Technical feasibility indicators
    const techIndicators = [
        'api', 'integration', 'automation', 'ai',
        'machine learning', 'cloud', 'platform',
        'framework', 'tool', 'solution', 'system'
    ];
    
    // Professional audience indicators
    const audienceIndicators = [
        'founder', 'ceo', 'entrepreneur', 'startup',
        'vc', 'investor', 'business owner', 'consultant',
        'director', 'manager', 'professional', 'expert'
    ];
    
    // Calculate scores
    businessIndicators.forEach(indicator => {
        if (text.includes(indicator)) scores.business_viability += 0.1;
    });
    
    timingIndicators.forEach(indicator => {
        if (text.includes(indicator)) scores.market_timing += 0.1;
    });
    
    techIndicators.forEach(indicator => {
        if (text.includes(indicator)) scores.technical_feasibility += 0.1;
    });
    
    audienceIndicators.forEach(indicator => {
        if (text.includes(indicator)) scores.audience_quality += 0.1;
    });
    
    // Engagement quality boost
    const engagementScore = calculateProfessionalEngagement(tweet);
    Object.keys(scores).forEach(key => {
        scores[key] += engagementScore * 0.2;
    });
    
    // Calculate overall score
    scores.overall_score = (
        scores.business_viability * 0.3 +
        scores.market_timing * 0.25 +
        scores.technical_feasibility * 0.25 +
        scores.audience_quality * 0.2
    );
    
    // Normalize scores
    Object.keys(scores).forEach(key => {
        scores[key] = Math.min(scores[key], 1.0);
    });
    
    return scores;
}

// Calculate professional engagement score
function calculateProfessionalEngagement(tweet) {
    const likes = tweet.likes || 0;
    const retweets = tweet.retweets || 0;
    const replies = tweet.replies || 0;
    const followers = tweet.user?.followers || 1;
    
    // Weight replies higher as they indicate deeper engagement
    const weightedEngagement = likes + (retweets * 3) + (replies * 5);
    const engagementRate = weightedEngagement / Math.max(followers, 1);
    
    // Professional engagement threshold (higher quality discussions)
    const qualityMultiplier = (replies > 0) ? 1.5 : 1.0;
    
    return Math.min(engagementRate * 100 * qualityMultiplier, 1.0);
}

// Extract Twitter username from displayed link
function extractTwitterUsername(displayedLink) {
    if (!displayedLink) return 'unknown';
    const match = displayedLink.match(/twitter\.com\/([^/]+)/);
    return match ? match[1] : 'unknown';
}

// Classify professional category
function classifyProfessionalCategory(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('b2b') || lowerText.includes('enterprise') || lowerText.includes('business')) {
        return 'B2B & Enterprise';
    } else if (lowerText.includes('saas') || lowerText.includes('software') || lowerText.includes('platform')) {
        return 'SaaS & Software';
    } else if (lowerText.includes('ai') || lowerText.includes('machine learning') || lowerText.includes('automation')) {
        return 'AI & Automation';
    } else if (lowerText.includes('api') || lowerText.includes('developer') || lowerText.includes('technical')) {
        return 'Developer Tools & API';
    } else if (lowerText.includes('productivity') || lowerText.includes('workflow') || lowerText.includes('process')) {
        return 'Productivity & Workflow';
    } else if (lowerText.includes('startup') || lowerText.includes('entrepreneur') || lowerText.includes('founder')) {
        return 'Startup & Entrepreneurship';
    } else {
        return 'Professional Services';
    }
}

// Extract professional keywords
function extractProfessionalKeywords(text) {
    const professionalTerms = [
        'automation', 'integration', 'api', 'saas', 'b2b', 'enterprise',
        'workflow', 'productivity', 'efficiency', 'scalable', 'platform',
        'solution', 'system', 'tool', 'business', 'professional',
        'startup', 'entrepreneur', 'founder', 'revenue', 'monetization'
    ];
    
    const lowerText = text.toLowerCase();
    return professionalTerms.filter(term => lowerText.includes(term));
}

// Extract hashtags from text
function extractHashtags(text) {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.slice(1));
}

// Extract mentions from text
function extractMentions(text) {
    const mentions = text.match(/@\w+/g) || [];
    return mentions.map(mention => mention.slice(1));
}

// Professional tweet analysis using AI
async function performProfessionalTweetAnalysis(tweet, openaiKey) {
    try {
        const prompt = `Analyze this professional tweet for startup opportunity potential:

Tweet: ${tweet.tweet_text}
Author: @${tweet.author_username}
Engagement: ${tweet.like_count} likes, ${tweet.retweet_count} retweets, ${tweet.reply_count} replies

Provide a JSON analysis with:
1. painpoint_summary (2-3 sentences)
2. market_opportunity (1-2 sentences)
3. target_audience (1 sentence)
4. technical_requirements (1-2 sentences)
5. business_model_potential (1-2 sentences)
6. competitive_landscape (1-2 sentences)
7. implementation_complexity (scale 1-5)
8. market_size_estimate (small/medium/large)
9. monetization_potential (low/medium/high)
10. professional_confidence_score (0-1)

Format as valid JSON:`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 800,
                temperature: 0.3
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const analysisText = data.choices[0].message.content.trim();
            
            try {
                const analysis = JSON.parse(analysisText);
                return {
                    title: `Professional Twitter Opportunity: ${analysis.painpoint_summary?.split('.')[0]}`,
                    description: analysis.painpoint_summary,
                    market_opportunity: analysis.market_opportunity,
                    target_audience: analysis.target_audience,
                    technical_requirements: analysis.technical_requirements,
                    business_model_potential: analysis.business_model_potential,
                    competitive_landscape: analysis.competitive_landscape,
                    implementation_complexity: analysis.implementation_complexity || 3,
                    market_size_estimate: analysis.market_size_estimate || 'medium',
                    monetization_potential: analysis.monetization_potential || 'medium',
                    professional_confidence_score: analysis.professional_confidence_score || 0.7,
                    source_tweet: tweet,
                    professional_analysis: true
                };
            } catch (parseError) {
                console.error('Error parsing AI analysis JSON:', parseError.message);
                return null;
            }
        }
    } catch (error) {
        console.error('Professional tweet analysis error:', error.message);
    }
    
    return null;
}

// Get stored API keys
async function getStoredApiKeys(serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/api_keys?select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (response.ok) {
            const keys = await response.json();
            const keyMap = {};
            keys.forEach(key => {
                if (key.is_active && key.api_key_value) {
                    keyMap[key.service_name.toLowerCase()] = key.api_key_value;
                }
            });
            return keyMap;
        }
    } catch (error) {
        console.error('Error fetching stored API keys:', error.message);
    }
    
    return {};
}

// Save Twitter trend data
async function saveTwitterTrendData(tweet, serviceRoleKey, supabaseUrl) {
    try {
        const trendData = {
            trend_id: `twitter_${tweet.tweet_id}`,
            platform: 'twitter',
            trend_title: tweet.tweet_text.slice(0, 100),
            trend_description: tweet.tweet_text,
            trend_url: tweet.tweet_url,
            mention_volume: 1,
            engagement_score: tweet.professional_engagement_score,
            hashtags: tweet.hashtags,
            keywords: tweet.professional_keywords,
            trend_created_at: tweet.tweet_created_at,
            relevance_score: tweet.professional_relevance_score,
            business_viability_score: tweet.business_viability_score,
            market_timing_score: tweet.market_timing_score,
            technical_feasibility_score: tweet.technical_feasibility_score,
            audience_quality_score: tweet.audience_quality_score,
            raw_data: JSON.stringify(tweet)
        };
        
        const response = await fetch(
            `${supabaseUrl}/rest/v1/trend_correlations`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(trendData)
            }
        );
        
        if (!response.ok) {
            console.error('Error saving Twitter trend data:', await response.text());
        }
    } catch (error) {
        console.error('Save Twitter trend data error:', error.message);
    }
}

// Save professional painpoint with metrics
async function saveProfessionalPainpointWithMetrics(painpoint, platform, serviceRoleKey, supabaseUrl) {
    try {
        const ideaData = {
            title: painpoint.title,
            description: painpoint.description,
            source_platform: platform,
            source_url: painpoint.source_tweet?.tweet_url || '',
            raw_data: JSON.stringify(painpoint),
            quality_score: painpoint.professional_confidence_score || 0.7,
            business_viability_score: painpoint.source_tweet?.business_viability_score || 0.6,
            market_timing_score: painpoint.source_tweet?.market_timing_score || 0.6,
            technical_feasibility_score: painpoint.source_tweet?.technical_feasibility_score || 0.6,
            market_opportunity: painpoint.market_opportunity,
            target_audience: painpoint.target_audience,
            technical_requirements: painpoint.technical_requirements,
            business_model_potential: painpoint.business_model_potential,
            competitive_landscape: painpoint.competitive_landscape,
            implementation_complexity: painpoint.implementation_complexity,
            market_size_estimate: painpoint.market_size_estimate,
            monetization_potential: painpoint.monetization_potential,
            professional_analysis: true
        };
        
        const response = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(ideaData)
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data[0]?.id;
        } else {
            console.error('Error saving professional painpoint:', await response.text());
        }
    } catch (error) {
        console.error('Save professional painpoint error:', error.message);
    }
    
    return null;
}

// Professional correlation analysis
async function performProfessionalCorrelationAnalysis(serviceRoleKey, supabaseUrl, openaiKey) {
    const correlations = [];
    
    try {
        // Get recent high-quality ideas from all platforms
        const recentIdeasResponse = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&quality_score=gte.0.6&limit=200`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (recentIdeasResponse.ok) {
            const ideas = await recentIdeasResponse.json();
            
            // Professional topic clustering with AI enhancement
            const professionalClusters = await performProfessionalTopicClustering(ideas, openaiKey);
            
            for (const cluster of professionalClusters) {
                if (cluster.ideas.length >= 2 && cluster.platforms.length >= 2) {
                    const correlation = await generateProfessionalCorrelationData(cluster, openaiKey);
                    correlations.push(correlation);
                }
            }
        }
    } catch (error) {
        console.error('Professional correlation analysis error:', error.message);
    }
    
    return correlations;
}

// Professional topic clustering
async function performProfessionalTopicClustering(ideas, openaiKey) {
    const clusters = [];
    const processed = new Set();
    
    for (const idea of ideas) {
        if (processed.has(idea.id)) continue;
        
        const similarIdeas = openaiKey 
            ? await findSimilarIdeasWithProfessionalAI(idea, ideas.filter(i => !processed.has(i.id)), openaiKey)
            : findSimilarIdeasWithProfessionalKeywords(idea, ideas.filter(i => !processed.has(i.id)));
        
        if (similarIdeas.length >= 2) {
            const topicName = openaiKey 
                ? await generateProfessionalTopicName(similarIdeas, openaiKey)
                : extractProfessionalTopicFromKeywords(similarIdeas);
            
            const cluster = {
                topic: topicName,
                ideas: similarIdeas,
                platforms: [...new Set(similarIdeas.map(i => i.source_platform))],
                average_quality: similarIdeas.reduce((sum, i) => sum + (i.quality_score || 0.5), 0) / similarIdeas.length,
                validated_count: similarIdeas.length
            };
            
            clusters.push(cluster);
            similarIdeas.forEach(i => processed.add(i.id));
        }
    }
    
    return clusters.sort((a, b) => b.average_quality - a.average_quality);
}

// Find similar ideas with professional AI
async function findSimilarIdeasWithProfessionalAI(targetIdea, ideas, openaiKey) {
    const similarIdeas = [targetIdea];
    
    // Process in batches for efficiency
    const batchSize = 10;
    for (let i = 0; i < Math.min(ideas.length, 50); i += batchSize) {
        const batch = ideas.slice(i, i + batchSize);
        
        try {
            const batchSimilarities = await calculateBatchProfessionalSimilarity(targetIdea, batch, openaiKey);
            
            batch.forEach((idea, index) => {
                if (batchSimilarities[index] > 0.75) {
                    similarIdeas.push(idea);
                }
            });
        } catch (error) {
            console.error('Professional AI batch similarity error:', error.message);
        }
    }
    
    return similarIdeas;
}

// Calculate batch professional similarity
async function calculateBatchProfessionalSimilarity(targetIdea, batch, openaiKey) {
    try {
        const prompt = `Compare this target startup idea with the following batch of ideas. Rate each similarity from 0 to 1 based on:
- Core business problem
- Target market segment
- Technical solution approach
- Revenue model potential

Target: ${targetIdea.title} - ${targetIdea.description}

Batch:
${batch.map((idea, i) => `${i}: ${idea.title} - ${idea.description}`).join('\n')}

Respond with only comma-separated similarity scores (0-1) for each batch item:`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.1
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const scores = data.choices[0].message.content.trim().split(',').map(s => {
                const score = parseFloat(s.trim());
                return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 1);
            });
            
            return scores.length === batch.length ? scores : batch.map(() => 0);
        }
    } catch (error) {
        console.error('Batch professional similarity calculation error:', error.message);
    }
    
    return batch.map(() => 0);
}

// Find similar ideas with professional keywords
function findSimilarIdeasWithProfessionalKeywords(targetIdea, ideas) {
    const targetKeywords = extractProfessionalBusinessKeywords(targetIdea.title + ' ' + targetIdea.description);
    const similarIdeas = [targetIdea];
    
    for (const idea of ideas) {
        const ideaKeywords = extractProfessionalBusinessKeywords(idea.title + ' ' + idea.description);
        const commonKeywords = targetKeywords.filter(k => ideaKeywords.includes(k));
        
        // Require at least 30% keyword overlap for professional clustering
        const overlapRatio = commonKeywords.length / Math.max(targetKeywords.length, ideaKeywords.length);
        
        if (overlapRatio >= 0.3 && commonKeywords.length >= 2) {
            similarIdeas.push(idea);
        }
    }
    
    return similarIdeas;
}

// Extract professional business keywords
function extractProfessionalBusinessKeywords(text) {
    const businessKeywords = [
        'automation', 'integration', 'api', 'saas', 'b2b', 'enterprise',
        'workflow', 'productivity', 'efficiency', 'platform', 'solution',
        'analytics', 'dashboard', 'reporting', 'management', 'optimization',
        'compliance', 'security', 'scalability', 'infrastructure',
        'customer', 'user', 'business', 'professional', 'commercial'
    ];
    
    const lowerText = text.toLowerCase();
    return businessKeywords.filter(keyword => lowerText.includes(keyword));
}

// Generate professional topic name
async function generateProfessionalTopicName(ideas, openaiKey) {
    try {
        const ideasText = ideas.map(i => `${i.title}: ${i.description}`).join('\n\n');
        const prompt = `Analyze these related professional startup ideas and generate a concise business topic name (2-4 words):\n\n${ideasText.slice(0, 2000)}\n\nFocus on the core business problem or solution category. Topic name:`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 30,
                temperature: 0.3
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content.trim();
        }
    } catch (error) {
        console.error('Professional topic name generation error:', error.message);
    }
    
    return 'Professional Business Opportunity';
}

// Extract professional topic from keywords
function extractProfessionalTopicFromKeywords(ideas) {
    const keywordCounts = {};
    
    for (const idea of ideas) {
        const keywords = extractProfessionalBusinessKeywords(idea.title + ' ' + idea.description);
        for (const keyword of keywords) {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
    }
    
    const topKeywords = Object.entries(keywordCounts)
        .filter(([, count]) => count >= Math.min(2, ideas.length))
        .sort(([, a], [, b]) => b - a)
        .map(([keyword]) => keyword)
        .slice(0, 3);
    
    return topKeywords.length > 0 ? topKeywords.join(' ') : 'Business Opportunity';
}

// Generate professional correlation data
async function generateProfessionalCorrelationData(cluster, openaiKey) {
    const platforms = cluster.platforms;
    const mentionVolume = cluster.ideas.length;
    const velocityScore = calculateProfessionalClusterVelocity(cluster.ideas);
    const marketOpportunityScore = calculateProfessionalMarketOpportunity(cluster);
    
    let professionalSummary = `${cluster.topic} identified across ${platforms.length} platform(s) with ${mentionVolume} high-quality mentions.`;
    
    if (openaiKey) {
        try {
            const prompt = `Analyze this cross-platform professional startup trend and provide a business intelligence summary:\n\nTopic: ${cluster.topic}\nPlatforms: ${platforms.join(', ')}\nQuality Ideas: ${mentionVolume}\nAverage Quality Score: ${cluster.average_quality.toFixed(2)}\n\nIdeas:\n${cluster.ideas.map(i => `- ${i.title} (${i.source_platform})`).join('\n')}\n\nProvide a 3-4 sentence professional market intelligence summary focusing on business opportunity, market validation, and implementation recommendations:`;
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 200,
                    temperature: 0.5
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                professionalSummary = data.choices[0].message.content.trim();
            }
        } catch (error) {
            console.error('Professional AI summary generation error:', error.message);
        }
    }
    
    return {
        trend_topic: cluster.topic,
        platforms: platforms,
        correlation_score: Math.min(platforms.length / 3, 1.0), // Max score for 3+ platforms
        mention_volume: mentionVolume,
        velocity_score: velocityScore,
        market_opportunity_score: marketOpportunityScore,
        average_quality_score: cluster.average_quality,
        peak_timestamp: new Date().toISOString(),
        source_ids: cluster.ideas.map(i => ({ id: i.id, platform: i.source_platform, quality: i.quality_score })),
        professional_keywords: extractProfessionalBusinessKeywords(cluster.ideas.map(i => i.title + ' ' + i.description).join(' ')),
        professional_ai_summary: professionalSummary,
        cross_platform_validation: true,
        validated_count: cluster.validated_count,
        business_confidence_score: Math.min((cluster.average_quality + marketOpportunityScore) / 2, 1.0)
    };
}

// Calculate professional cluster velocity
function calculateProfessionalClusterVelocity(ideas) {
    const now = new Date();
    const last24h = ideas.filter(i => new Date(i.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)).length;
    const last7d = ideas.filter(i => new Date(i.created_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
    
    // Professional velocity considers quality-weighted mentions
    const qualityWeight = ideas.reduce((sum, idea) => sum + (idea.quality_score || 0.5), 0) / ideas.length;
    const baseVelocity = Math.min((last24h * 7 + last7d) / 15, 1.0);
    
    return Math.min(baseVelocity * qualityWeight, 1.0);
}

// Calculate professional market opportunity
function calculateProfessionalMarketOpportunity(cluster) {
    const platformDiversity = Math.min(cluster.platforms.length / 4, 1.0); // Max at 4 platforms
    const volumeScore = Math.min(cluster.ideas.length / 8, 1.0); // Max at 8 quality mentions
    const qualityScore = cluster.average_quality;
    const businessFocusScore = calculateBusinessFocusScore(cluster.ideas);
    
    return (platformDiversity * 0.25 + volumeScore * 0.25 + qualityScore * 0.3 + businessFocusScore * 0.2);
}

// Calculate business focus score
function calculateBusinessFocusScore(ideas) {
    const businessTermCount = ideas.reduce((count, idea) => {
        const text = (idea.title + ' ' + idea.description).toLowerCase();
        const businessTerms = ['revenue', 'business', 'professional', 'enterprise', 'commercial', 'monetization', 'market'];
        return count + businessTerms.filter(term => text.includes(term)).length;
    }, 0);
    
    return Math.min(businessTermCount / (ideas.length * 3), 1.0);
}

// Save professional trend correlation
async function saveProfessionalTrendCorrelation(correlation, serviceRoleKey, supabaseUrl) {
    try {
        const correlationData = {
            trend_id: `professional_${Date.now()}`,
            trend_topic: correlation.trend_topic,
            platforms: correlation.platforms,
            correlation_score: correlation.correlation_score,
            mention_volume: correlation.mention_volume,
            velocity_score: correlation.velocity_score,
            market_opportunity_score: correlation.market_opportunity_score,
            peak_timestamp: correlation.peak_timestamp,
            keywords: correlation.professional_keywords,
            ai_summary: correlation.professional_ai_summary,
            source_ids: JSON.stringify(correlation.source_ids),
            cross_platform_validated: correlation.cross_platform_validation,
            business_confidence_score: correlation.business_confidence_score,
            professional_analysis: true,
            raw_data: JSON.stringify(correlation)
        };
        
        const response = await fetch(
            `${supabaseUrl}/rest/v1/trend_correlations`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(correlationData)
            }
        );
        
        if (!response.ok) {
            console.error('Error saving professional trend correlation:', await response.text());
        }
    } catch (error) {
        console.error('Save professional trend correlation error:', error.message);
    }
}

// Update ideas with professional correlation
async function updateIdeasWithProfessionalCorrelation(correlation, serviceRoleKey, supabaseUrl) {
    try {
        for (const sourceInfo of correlation.source_ids) {
            const updateData = {
                cross_validation_score: correlation.correlation_score,
                trend_momentum: correlation.velocity_score,
                business_confidence_score: correlation.business_confidence_score,
                professional_validation: true,
                cross_platform_mentions: correlation.mention_volume,
                market_opportunity_score: correlation.market_opportunity_score
            };
            
            const response = await fetch(
                `${supabaseUrl}/rest/v1/startup_ideas?id=eq.${sourceInfo.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                }
            );
            
            if (!response.ok) {
                console.error(`Error updating idea ${sourceInfo.id} with professional correlation:`, await response.text());
            }
        }
    } catch (error) {
        console.error('Update ideas with professional correlation error:', error.message);
    }
}

// Get recent ideas for professional scoring
async function getRecentIdeasForProfessionalScoring(serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()}&limit=100`,
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
        console.error('Error fetching recent ideas for professional scoring:', error.message);
    }
    
    return [];
}

// Calculate professional relevance score
async function calculateProfessionalRelevanceScore(idea, openaiKey) {
    const baseScore = {
        startup_idea_id: idea.id,
        platform_source: idea.source_platform,
        content_quality_score: 0.5,
        business_viability_score: 0.5,
        market_timing_score: 0.5,
        technical_feasibility_score: 0.5,
        competitive_advantage_score: 0.5,
        professional_confidence_score: 0.5,
        overall_relevance_score: 0.5
    };
    
    // Professional content quality scoring
    baseScore.content_quality_score = calculateProfessionalContentQuality(idea);
    
    // Professional business viability scoring
    if (openaiKey) {
        try {
            const professionalViability = await assessProfessionalBusinessViability(idea, openaiKey);
            baseScore.business_viability_score = professionalViability.business_viability;
            baseScore.market_timing_score = professionalViability.market_timing;
            baseScore.technical_feasibility_score = professionalViability.technical_feasibility;
            baseScore.competitive_advantage_score = professionalViability.competitive_advantage;
            baseScore.professional_confidence_score = 0.9;
        } catch (error) {
            console.error('Professional AI viability assessment error:', error.message);
        }
    } else {
        // Fallback professional scoring
        baseScore.technical_feasibility_score = assessProfessionalTechnicalFeasibility(idea);
        baseScore.market_timing_score = assessProfessionalMarketTiming(idea);
    }
    
    // Calculate professional overall relevance score
    baseScore.overall_relevance_score = (
        baseScore.content_quality_score * 0.15 +
        baseScore.business_viability_score * 0.3 +
        baseScore.market_timing_score * 0.2 +
        baseScore.technical_feasibility_score * 0.2 +
        baseScore.competitive_advantage_score * 0.15
    );
    
    return baseScore;
}

// Calculate professional content quality
function calculateProfessionalContentQuality(idea) {
    const title = idea.title || '';
    const description = idea.description || '';
    const combinedText = title + ' ' + description;
    
    let score = 0.2;
    
    // Professional length and detail assessment
    if (combinedText.length > 150) score += 0.2;
    if (combinedText.length > 400) score += 0.1;
    
    // Professional business terminology
    const professionalTerms = [
        'business model', 'revenue stream', 'market validation', 'customer acquisition',
        'scalability', 'competitive advantage', 'value proposition', 'target market',
        'monetization', 'enterprise', 'b2b', 'saas', 'automation', 'efficiency'
    ];
    
    const foundTerms = professionalTerms.filter(term => 
        combinedText.toLowerCase().includes(term)
    ).length;
    
    score += (foundTerms / professionalTerms.length) * 0.4;
    
    // Specific professional problem description
    const specificityIndicators = [
        'specific', 'detailed', 'example', 'case study', 'data',
        'metrics', 'roi', 'cost savings', 'time savings', 'efficiency gain'
    ];
    
    const specificityScore = specificityIndicators.filter(indicator => 
        combinedText.toLowerCase().includes(indicator)
    ).length;
    
    score += Math.min(specificityScore / 5, 0.2);
    
    // Professional tone and structure
    if (combinedText.includes('would') || combinedText.includes('could') || combinedText.includes('should')) {
        score += 0.05;
    }
    
    return Math.min(score, 1.0);
}

// Assess professional business viability with AI
async function assessProfessionalBusinessViability(idea, openaiKey) {
    try {
        const prompt = `Assess this professional startup idea across multiple dimensions. Provide scores from 0 to 1 for each:

Title: ${idea.title}
Description: ${idea.description}
Platform: ${idea.source_platform}

Analyze and score (0-1):
1. Business Viability: Market size, revenue potential, sustainable business model
2. Market Timing: Current market readiness, trend alignment, competitive landscape
3. Technical Feasibility: Implementation complexity, technical risks, resource requirements
4. Competitive Advantage: Differentiation potential, barriers to entry, unique value

Respond with only 4 comma-separated scores (0-1):`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50,
                temperature: 0.1
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const scores = data.choices[0].message.content.trim().split(',').map(s => {
                const score = parseFloat(s.trim());
                return isNaN(score) ? 0.5 : Math.min(Math.max(score, 0), 1);
            });
            
            if (scores.length >= 4) {
                return {
                    business_viability: scores[0],
                    market_timing: scores[1],
                    technical_feasibility: scores[2],
                    competitive_advantage: scores[3]
                };
            }
        }
    } catch (error) {
        console.error('Professional AI business viability error:', error.message);
    }
    
    return {
        business_viability: 0.5,
        market_timing: 0.5,
        technical_feasibility: 0.5,
        competitive_advantage: 0.5
    };
}

// Assess professional technical feasibility
function assessProfessionalTechnicalFeasibility(idea) {
    const text = (idea.title + ' ' + idea.description).toLowerCase();
    let score = 0.6;
    
    // Professional implementation indicators
    const easyImplementationTerms = [
        'web application', 'mobile app', 'dashboard', 'api integration',
        'automation script', 'workflow tool', 'data visualization',
        'reporting system', 'management platform', 'tracking system'
    ];
    
    const complexImplementationTerms = [
        'machine learning', 'artificial intelligence', 'blockchain',
        'advanced analytics', 'real-time processing', 'high-scale infrastructure',
        'complex algorithms', 'distributed systems', 'enterprise integration'
    ];
    
    // Boost for easier implementations
    easyImplementationTerms.forEach(term => {
        if (text.includes(term)) score += 0.1;
    });
    
    // Penalty for complex implementations
    complexImplementationTerms.forEach(term => {
        if (text.includes(term)) score -= 0.1;
    });
    
    // Professional technology stack considerations
    const modernTechTerms = [
        'cloud', 'saas', 'api', 'integration', 'automation',
        'responsive', 'scalable', 'secure', 'reliable'
    ];
    
    const techScore = modernTechTerms.filter(term => text.includes(term)).length;
    score += Math.min(techScore / 10, 0.2);
    
    return Math.min(Math.max(score, 0.1), 1.0);
}

// Assess professional market timing
function assessProfessionalMarketTiming(idea) {
    const text = (idea.title + ' ' + idea.description).toLowerCase();
    let score = 0.5;
    
    // Professional timing indicators
    const timingIndicators = [
        'remote work', 'digital transformation', 'automation', 'ai integration',
        'cloud migration', 'data privacy', 'cybersecurity', 'sustainability',
        'efficiency', 'cost reduction', 'productivity', 'scalability'
    ];
    
    // Current professional trends
    const currentTrends = [
        'artificial intelligence', 'machine learning', 'automation',
        'remote work', 'hybrid work', 'digital transformation',
        'cloud computing', 'data analytics', 'cybersecurity',
        'sustainability', 'esg', 'carbon footprint'
    ];
    
    timingIndicators.forEach(indicator => {
        if (text.includes(indicator)) score += 0.05;
    });
    
    currentTrends.forEach(trend => {
        if (text.includes(trend)) score += 0.1;
    });
    
    // Professional market readiness indicators
    const readinessIndicators = [
        'proven market', 'existing demand', 'validated need',
        'growing market', 'emerging opportunity', 'market gap'
    ];
    
    readinessIndicators.forEach(indicator => {
        if (text.includes(indicator)) score += 0.05;
    });
    
    return Math.min(score, 1.0);
}

// Save professional relevance score
async function saveProfessionalRelevanceScore(relevanceData, serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas?id=eq.${relevanceData.startup_idea_id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content_quality_score: relevanceData.content_quality_score,
                    business_viability_score: relevanceData.business_viability_score,
                    market_timing_score: relevanceData.market_timing_score,
                    technical_feasibility_score: relevanceData.technical_feasibility_score,
                    competitive_advantage_score: relevanceData.competitive_advantage_score,
                    professional_confidence_score: relevanceData.professional_confidence_score,
                    overall_relevance_score: relevanceData.overall_relevance_score,
                    professional_scoring: true
                })
            }
        );
        
        if (!response.ok) {
            console.error('Error saving professional relevance score:', await response.text());
        }
    } catch (error) {
        console.error('Save professional relevance score error:', error.message);
    }
}

// Update idea with professional metrics
async function updateIdeaWithProfessionalMetrics(ideaId, relevanceData, serviceRoleKey, supabaseUrl) {
    try {
        const updateData = {
            quality_score: relevanceData.overall_relevance_score,
            professional_grade: true,
            high_value_opportunity: true,
            professional_analysis_complete: true,
            last_professional_update: new Date().toISOString()
        };
        
        const response = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas?id=eq.${ideaId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            }
        );
        
        if (!response.ok) {
            console.error('Error updating idea with professional metrics:', await response.text());
        }
    } catch (error) {
        console.error('Update idea with professional metrics error:', error.message);
    }
}

// Analyze professional trend velocity
async function analyzeProfessionalTrendVelocity(serviceRoleKey, supabaseUrl, openaiKey) {
    const velocityResults = [];
    
    try {
        // Get trend correlations from the last 24 hours
        const trendsResponse = await fetch(
            `${supabaseUrl}/rest/v1/trend_correlations?created_at=gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}&professional_analysis=eq.true`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (trendsResponse.ok) {
            const trends = await trendsResponse.json();
            
            for (const trend of trends) {
                const velocityData = await calculateProfessionalTrendVelocityData(trend, serviceRoleKey, supabaseUrl, openaiKey);
                velocityResults.push(velocityData);
            }
        }
    } catch (error) {
        console.error('Professional trend velocity analysis error:', error.message);
    }
    
    return velocityResults;
}

// Calculate professional trend velocity data
async function calculateProfessionalTrendVelocityData(trend, serviceRoleKey, supabaseUrl, openaiKey) {
    const velocityData = {
        trend_id: trend.trend_id,
        trend_topic: trend.trend_topic,
        current_velocity: trend.velocity_score || 0.5,
        acceleration_rate: 0,
        momentum_score: 0,
        professional_velocity_score: 0,
        velocity_confidence: 0.5
    };
    
    try {
        // Calculate velocity based on recent mentions
        const recentMentionsResponse = await fetch(
            `${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&limit=200`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (recentMentionsResponse.ok) {
            const recentIdeas = await recentMentionsResponse.json();
            
            // Filter ideas related to this trend topic
            const relatedIdeas = recentIdeas.filter(idea => {
                const ideaText = (idea.title + ' ' + idea.description).toLowerCase();
                const trendKeywords = trend.keywords || [];
                return trendKeywords.some(keyword => ideaText.includes(keyword.toLowerCase()));
            });
            
            // Calculate time-based velocity
            const now = new Date();
            const last24h = relatedIdeas.filter(i => new Date(i.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)).length;
            const last48h = relatedIdeas.filter(i => new Date(i.created_at) > new Date(now.getTime() - 48 * 60 * 60 * 1000)).length;
            const last7d = relatedIdeas.filter(i => new Date(i.created_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
            
            // Professional velocity calculations
            velocityData.acceleration_rate = last24h > 0 ? (last24h / Math.max(last48h - last24h, 1)) : 0;
            velocityData.momentum_score = Math.min((last24h * 7 + last7d) / 20, 1.0);
            
            // Quality-weighted velocity
            const qualityWeight = relatedIdeas.reduce((sum, idea) => sum + (idea.quality_score || 0.5), 0) / Math.max(relatedIdeas.length, 1);
            velocityData.professional_velocity_score = velocityData.momentum_score * qualityWeight;
            velocityData.velocity_confidence = Math.min(relatedIdeas.length / 5, 1.0);
        }
    } catch (error) {
        console.error('Professional velocity data calculation error:', error.message);
    }
    
    return velocityData;
}

// Save professional trend velocity
async function saveProfessionalTrendVelocity(velocity, serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/trend_correlations?trend_id=eq.${velocity.trend_id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    velocity_score: velocity.professional_velocity_score,
                    acceleration_rate: velocity.acceleration_rate,
                    momentum_score: velocity.momentum_score,
                    velocity_confidence: velocity.velocity_confidence,
                    last_velocity_update: new Date().toISOString()
                })
            }
        );
        
        if (!response.ok) {
            console.error('Error saving professional trend velocity:', await response.text());
        }
    } catch (error) {
        console.error('Save professional trend velocity error:', error.message);
    }
}

// Collect professional enhanced sources
async function collectProfessionalEnhancedSources(apiKeys) {
    const sources = [];
    
    // Professional Hacker News collection
    try {
        const hnPainpoints = await collectProfessionalHackerNews();
        sources.push({
            platform: 'hacker_news_professional',
            painpoints: hnPainpoints.filter(p => p.professional_relevance_score > 0.6)
        });
    } catch (error) {
        console.error('Professional HN collection error:', error.message);
    }
    
    // Professional GitHub issues
    if (apiKeys.github) {
        try {
            const githubPainpoints = await collectProfessionalGitHubIssues(apiKeys.github);
            sources.push({
                platform: 'github_professional',
                painpoints: githubPainpoints.filter(p => p.professional_relevance_score > 0.7)
            });
        } catch (error) {
            console.error('Professional GitHub collection error:', error.message);
        }
    }
    
    return sources;
}

// Professional Hacker News collection
async function collectProfessionalHackerNews() {
    const painpoints = [];
    
    try {
        // Focus on professional and business-oriented posts
        const algoliaResponse = await fetch('https://hn.algolia.com/api/v1/search?tags=(ask_hn,show_hn)&query=(business OR enterprise OR startup OR professional OR b2b OR saas)&hitsPerPage=50&numericFilters=created_at_i>1704067200');
        const algoliaData = await algoliaResponse.json();
        
        for (const hit of algoliaData.hits) {
            const relevanceScore = calculateProfessionalHNRelevanceScore(hit);
            
            if (relevanceScore > 0.5) {
                painpoints.push({
                    title: `Professional HN Opportunity: ${hit.title}`,
                    description: hit.story_text || hit.title,
                    source_url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
                    raw_data: JSON.stringify(hit),
                    professional_relevance_score: relevanceScore,
                    engagement_metrics: {
                        points: hit.points || 0,
                        num_comments: hit.num_comments || 0,
                        created_at: hit.created_at
                    },
                    business_indicators: extractBusinessIndicators(hit.title + ' ' + (hit.story_text || '')),
                    professional_keywords: extractProfessionalBusinessKeywords(hit.title + ' ' + (hit.story_text || ''))
                });
            }
        }
    } catch (error) {
        console.error('Professional HN collection error:', error.message);
    }
    
    return painpoints;
}

// Calculate professional HN relevance score
function calculateProfessionalHNRelevanceScore(hit) {
    const title = hit.title.toLowerCase();
    const text = (hit.story_text || '').toLowerCase();
    const combinedText = `${title} ${text}`;
    
    let score = 0.3;
    
    // Professional business indicators
    const professionalIndicators = [
        'enterprise software', 'b2b saas', 'business intelligence',
        'professional services', 'business automation', 'workflow optimization',
        'revenue optimization', 'cost reduction', 'operational efficiency',
        'business process', 'professional tool', 'enterprise solution'
    ];
    
    // Market opportunity indicators
    const opportunityIndicators = [
        'market gap', 'business opportunity', 'unmet need',
        'professional pain', 'enterprise challenge', 'business problem',
        'industry solution', 'commercial application', 'business value'
    ];
    
    // Technical business indicators
    const techBusinessIndicators = [
        'api business', 'platform monetization', 'technical solution',
        'integration challenge', 'automation opportunity', 'system optimization',
        'technical debt', 'scalability issue', 'performance optimization'
    ];
    
    professionalIndicators.forEach(indicator => {
        if (combinedText.includes(indicator)) score += 0.2;
    });
    
    opportunityIndicators.forEach(indicator => {
        if (combinedText.includes(indicator)) score += 0.15;
    });
    
    techBusinessIndicators.forEach(indicator => {
        if (combinedText.includes(indicator)) score += 0.1;
    });
    
    // Professional engagement boost
    const points = hit.points || 0;
    const comments = hit.num_comments || 0;
    const professionalEngagementBoost = Math.min((points + comments * 3) / 150, 0.3);
    score += professionalEngagementBoost;
    
    // Quality content boost
    if (combinedText.length > 200) score += 0.1;
    if (combinedText.length > 500) score += 0.1;
    
    return Math.min(score, 1.0);
}

// Extract business indicators
function extractBusinessIndicators(text) {
    const businessTerms = [
        'revenue', 'profit', 'business model', 'monetization', 'enterprise',
        'commercial', 'professional', 'b2b', 'saas', 'platform',
        'subscription', 'customer acquisition', 'market size', 'scalability'
    ];
    
    const lowerText = text.toLowerCase();
    return businessTerms.filter(term => lowerText.includes(term));
}

// Professional GitHub issues collection
async function collectProfessionalGitHubIssues(githubToken) {
    const painpoints = [];
    
    // Focus on enterprise and business-oriented repositories
    const professionalQueries = [
        'label:"enterprise" label:"feature request" sort:reactions-desc',
        'label:"business" label:enhancement sort:updated-desc',
        '"enterprise feature" sort:reactions-desc',
        '"business requirement" sort:comments-desc',
        '"professional use case" sort:reactions-desc',
        '"commercial application" sort:updated-desc'
    ];
    
    for (const query of professionalQueries) {
        try {
            const response = await fetch(
                `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=15`,
                {
                    headers: {
                        'Authorization': `Bearer ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                
                for (const issue of data.items) {
                    const relevanceScore = calculateProfessionalGitHubRelevanceScore(issue);
                    
                    if (relevanceScore > 0.6) {
                        painpoints.push({
                            title: `Professional GitHub Opportunity: ${issue.title}`,
                            description: issue.body || issue.title,
                            source_url: issue.html_url,
                            raw_data: JSON.stringify(issue),
                            professional_relevance_score: relevanceScore,
                            engagement_metrics: {
                                reactions: issue.reactions?.total_count || 0,
                                comments: issue.comments || 0,
                                repository_name: issue.repository_url?.split('/').pop() || 'unknown'
                            },
                            business_indicators: extractBusinessIndicators(issue.title + ' ' + (issue.body || '')),
                            professional_keywords: extractProfessionalBusinessKeywords(issue.title + ' ' + (issue.body || ''))
                        });
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1200));
        } catch (error) {
            console.error(`Professional GitHub query "${query}" error:`, error.message);
        }
    }
    
    return painpoints;
}

// Calculate professional GitHub relevance score
function calculateProfessionalGitHubRelevanceScore(issue) {
    let score = 0.4;
    
    const title = issue.title.toLowerCase();
    const body = (issue.body || '').toLowerCase();
    const combinedText = `${title} ${body}`;
    
    // Professional feature request indicators
    const professionalFeatureIndicators = [
        'enterprise feature', 'business requirement', 'professional use case',
        'commercial application', 'business integration', 'enterprise support',
        'professional workflow', 'business process', 'commercial deployment'
    ];
    
    // Business value indicators
    const businessValueIndicators = [
        'roi', 'cost savings', 'efficiency gain', 'revenue impact',
        'business value', 'competitive advantage', 'market differentiation',
        'customer request', 'client requirement', 'professional need'
    ];
    
    // Technical business indicators
    const techBusinessIndicators = [
        'enterprise integration', 'business api', 'commercial license',
        'professional deployment', 'business scalability', 'enterprise security',
        'commercial support', 'business metrics', 'professional analytics'
    ];
    
    professionalFeatureIndicators.forEach(indicator => {
        if (combinedText.includes(indicator)) score += 0.2;
    });
    
    businessValueIndicators.forEach(indicator => {
        if (combinedText.includes(indicator)) score += 0.15;
    });
    
    techBusinessIndicators.forEach(indicator => {
        if (combinedText.includes(indicator)) score += 0.1;
    });
    
    // Professional engagement boost
    const reactions = issue.reactions?.total_count || 0;
    const comments = issue.comments || 0;
    const professionalEngagementBoost = Math.min((reactions * 8 + comments * 2) / 100, 0.3);
    score += professionalEngagementBoost;
    
    // Repository quality indicators
    const repoName = issue.repository_url?.split('/').pop() || '';
    if (repoName.includes('enterprise') || repoName.includes('business') || repoName.includes('professional')) {
        score += 0.1;
    }
    
    return Math.min(score, 1.0);
}