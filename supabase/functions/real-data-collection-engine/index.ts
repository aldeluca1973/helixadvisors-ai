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

        console.log('Starting real data collection process...');
        const results = { collected: 0, processed: 0, errors: [] };

        // Collect from Hacker News (free API)
        try {
            console.log('Collecting from Hacker News...');
            const hackerNewsIdeas = await collectFromHackerNews();
            
            for (const idea of hackerNewsIdeas) {
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
                            source_platform: 'Hacker News',
                            category: 'uncategorized',
                            status: 'pending'
                        })
                    });

                    if (insertResponse.ok) {
                        results.collected++;
                    }
                }
            }
        } catch (error) {
            console.error('Error collecting from Hacker News:', error.message);
            results.errors.push(`Hacker News: ${error.message}`);
        }

        // Collect from Reddit (public API)
        try {
            console.log('Collecting from Reddit...');
            const redditIdeas = await collectFromReddit();
            
            for (const idea of redditIdeas) {
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
                            source_platform: 'Reddit',
                            category: 'uncategorized',
                            status: 'pending'
                        })
                    });

                    if (insertResponse.ok) {
                        results.collected++;
                    }
                }
            }
        } catch (error) {
            console.error('Error collecting from Reddit:', error.message);
            results.errors.push(`Reddit: ${error.message}`);
        }

        // Collect from GitHub trending (public API)
        try {
            console.log('Collecting from GitHub trending...');
            const githubIdeas = await collectFromGitHub();
            
            for (const idea of githubIdeas) {
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
                            source_platform: 'GitHub',
                            category: 'uncategorized',
                            status: 'pending'
                        })
                    });

                    if (insertResponse.ok) {
                        results.collected++;
                    }
                }
            }
        } catch (error) {
            console.error('Error collecting from GitHub:', error.message);
            results.errors.push(`GitHub: ${error.message}`);
        }

        return new Response(JSON.stringify({ 
            data: results,
            message: `Real data collection complete: ${results.collected} new ideas collected`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Real data collection error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'REAL_DATA_COLLECTION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Collect from Hacker News API
async function collectFromHackerNews() {
    const ideas = [];
    
    try {
        // Get top stories
        const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topStories = await topStoriesResponse.json();
        
        // Get first 20 stories
        const storyIds = topStories.slice(0, 20);
        
        for (const storyId of storyIds) {
            try {
                const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
                const story = await storyResponse.json();
                
                // Filter for startup-related stories
                if (story && story.title && story.url && 
                    (story.title.toLowerCase().includes('startup') ||
                     story.title.toLowerCase().includes('launch') ||
                     story.title.toLowerCase().includes('build') ||
                     story.title.toLowerCase().includes('founder') ||
                     story.title.toLowerCase().includes('business') ||
                     story.title.toLowerCase().includes('app') ||
                     story.title.toLowerCase().includes('saas') ||
                     story.title.toLowerCase().includes('product'))) {
                    
                    ideas.push({
                        title: story.title,
                        description: story.text || `Startup idea from Hacker News: ${story.title}`,
                        source_url: story.url || `https://news.ycombinator.com/item?id=${storyId}`
                    });
                }
            } catch (error) {
                console.error(`Error fetching story ${storyId}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error fetching Hacker News data:', error.message);
    }
    
    return ideas;
}

// Collect from Reddit API
async function collectFromReddit() {
    const ideas = [];
    
    try {
        // Get posts from startup-related subreddits
        const subreddits = ['startups', 'Entrepreneur', 'SideProject', 'Business_Ideas'];
        
        for (const subreddit of subreddits) {
            try {
                const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`, {
                    headers: {
                        'User-Agent': 'StartupDiscoveryBot/1.0'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    for (const post of data.data.children) {
                        const postData = post.data;
                        
                        // Filter for relevant posts
                        if (postData.title && postData.selftext && 
                            (postData.title.toLowerCase().includes('idea') ||
                             postData.title.toLowerCase().includes('startup') ||
                             postData.title.toLowerCase().includes('business') ||
                             postData.title.toLowerCase().includes('launch') ||
                             postData.title.toLowerCase().includes('app') ||
                             postData.title.toLowerCase().includes('product'))) {
                            
                            ideas.push({
                                title: postData.title,
                                description: postData.selftext.substring(0, 500),
                                source_url: `https://reddit.com${postData.permalink}`
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching ${subreddit}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error fetching Reddit data:', error.message);
    }
    
    return ideas;
}

// Collect from GitHub trending repositories
async function collectFromGitHub() {
    const ideas = [];
    
    try {
        // Search for trending startup-related repositories
        const query = 'startup OR saas OR business OR app created:>2024-01-01';
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`, {
            headers: {
                'User-Agent': 'StartupDiscoveryBot/1.0',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            for (const repo of data.items) {
                // Filter for startup-related repositories
                if (repo.description && 
                    (repo.description.toLowerCase().includes('startup') ||
                     repo.description.toLowerCase().includes('business') ||
                     repo.description.toLowerCase().includes('saas') ||
                     repo.description.toLowerCase().includes('app') ||
                     repo.description.toLowerCase().includes('product') ||
                     repo.description.toLowerCase().includes('platform'))) {
                    
                    ideas.push({
                        title: repo.name,
                        description: repo.description || `GitHub project: ${repo.name}`,
                        source_url: repo.html_url
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error fetching GitHub data:', error.message);
    }
    
    return ideas;
}