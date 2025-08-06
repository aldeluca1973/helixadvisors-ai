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
        const { action, keyType, keyValue } = await req.json();
        
        if (!action) {
            throw new Error('Action is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log(`API Keys Manager: ${action} request`);

        if (action === 'test') {
            // Test API key functionality
            const testResult = await testApiKey(keyType, keyValue);
            return new Response(JSON.stringify({ data: testResult }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'save') {
            // Save API key securely
            if (!keyType || !keyValue) {
                throw new Error('Key type and value are required for save operation');
            }

            // Store in a secure configuration table
            const saveResult = await saveApiKey(keyType, keyValue, serviceRoleKey, supabaseUrl);
            return new Response(JSON.stringify({ data: saveResult }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'status') {
            // Get status of all API keys
            const statusResult = await getApiKeysStatus(serviceRoleKey, supabaseUrl);
            return new Response(JSON.stringify({ data: statusResult }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'get') {
            // Get masked API key for display
            const getResult = await getMaskedApiKey(keyType, serviceRoleKey, supabaseUrl);
            return new Response(JSON.stringify({ data: getResult }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Invalid action specified');

    } catch (error) {
        console.error('API Keys Manager error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'API_KEYS_MANAGER_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Test API key functionality
async function testApiKey(keyType, keyValue) {
    try {
        switch (keyType) {
            case 'openai':
                return await testOpenAIKey(keyValue);
            case 'github':
                return await testGitHubKey(keyValue);
            case 'serpapi':
                return await testSerpApiKey(keyValue);
            default:
                throw new Error('Unsupported key type');
        }
    } catch (error) {
        return {
            success: false,
            message: error.message,
            keyType
        };
    }
}

// Test OpenAI API key
async function testOpenAIKey(apiKey) {
    try {
        // Use a simpler endpoint for testing
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'StartupDiscovery/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'OpenAI API key is valid and active',
                keyType: 'openai',
                details: {
                    modelsCount: data.data?.length || 0,
                    hasGPT4: data.data?.some(model => model.id.includes('gpt-4')) || false
                }
            };
        } else {
            const errorData = await response.text();
            console.error('OpenAI API Error:', response.status, errorData);
            throw new Error(`OpenAI API error: ${response.status} - Invalid API key or insufficient permissions`);
        }
    } catch (error) {
        console.error('OpenAI test error:', error);
        throw new Error(`OpenAI test failed: ${error.message}`);
    }
}

// Test GitHub API key
async function testGitHubKey(apiKey) {
    try {
        // GitHub tokens can be classic (ghp_) or fine-grained (github_pat_)
        const authHeader = apiKey.startsWith('github_pat_') 
            ? `Bearer ${apiKey}` 
            : `token ${apiKey}`;
            
        const response = await fetch('https://api.github.com/user', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'User-Agent': 'StartupDiscovery/1.0',
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'GitHub API key is valid and active',
                keyType: 'github',
                details: {
                    username: data.login || 'unknown',
                    scopes: response.headers.get('x-oauth-scopes') || response.headers.get('x-accepted-oauth-scopes') || 'available'
                }
            };
        } else {
            const errorData = await response.text();
            console.error('GitHub API Error:', response.status, errorData);
            throw new Error(`GitHub API error: ${response.status} - Invalid token or insufficient permissions`);
        }
    } catch (error) {
        console.error('GitHub test error:', error);
        throw new Error(`GitHub test failed: ${error.message}`);
    }
}

// Test SerpAPI key
async function testSerpApiKey(apiKey) {
    try {
        // Test with a simple search to verify the API key works
        const testUrl = `https://serpapi.com/search.json?engine=google&q=test&api_key=${apiKey}&num=1`;
        
        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'StartupDiscovery/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Check if we got a valid response (not an error)
            if (data.error) {
                throw new Error(data.error);
            }
            
            return {
                success: true,
                message: 'SerpAPI key is valid and active',
                keyType: 'serpapi',
                details: {
                    searchInfo: data.search_metadata?.status || 'Success',
                    engine: data.search_metadata?.engine || 'google'
                }
            };
        } else {
            const errorData = await response.text();
            console.error('SerpAPI Error:', response.status, errorData);
            
            // Try the account endpoint as fallback
            try {
                const accountResponse = await fetch(`https://serpapi.com/account.json?api_key=${apiKey}`);
                if (accountResponse.ok) {
                    const accountData = await accountResponse.json();
                    return {
                        success: true,
                        message: 'SerpAPI key is valid (verified via account endpoint)',
                        keyType: 'serpapi',
                        details: {
                            totalSearches: accountData.total_searches_used || 0,
                            planType: accountData.plan || 'unknown'
                        }
                    };
                }
            } catch (fallbackError) {
                console.error('SerpAPI fallback error:', fallbackError);
            }
            
            throw new Error(`SerpAPI error: ${response.status} - Invalid API key`);
        }
    } catch (error) {
        console.error('SerpAPI test error:', error);
        throw new Error(`SerpAPI test failed: ${error.message}`);
    }
}

// Save API key securely
async function saveApiKey(keyType, keyValue, serviceRoleKey, supabaseUrl) {
    try {
        // First test the key
        const testResult = await testApiKey(keyType, keyValue);
        if (!testResult.success) {
            throw new Error(`Key validation failed: ${testResult.message}`);
        }

        // Create or update secure configuration
        const configData = {
            key_type: keyType,
            key_value_encrypted: btoa(keyValue), // Simple base64 encoding for demo
            is_active: true,
            last_tested: new Date().toISOString(),
            test_result: JSON.stringify(testResult),
            updated_at: new Date().toISOString()
        };

        // Check if key already exists
        const existingResponse = await fetch(`${supabaseUrl}/rest/v1/api_keys_config?key_type=eq.${keyType}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const existing = await existingResponse.json();
        
        if (existing && existing.length > 0) {
            // Update existing
            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/api_keys_config?key_type=eq.${keyType}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configData)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update API key configuration');
            }
        } else {
            // Create new
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/api_keys_config`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configData)
            });

            if (!insertResponse.ok) {
                throw new Error('Failed to save API key configuration');
            }
        }

        return {
            success: true,
            message: `${keyType.toUpperCase()} API key saved successfully`,
            keyType,
            testResult
        };
    } catch (error) {
        throw new Error(`Save operation failed: ${error.message}`);
    }
}

// Get API keys status
async function getApiKeysStatus(serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/api_keys_config?select=key_type,is_active,last_tested,test_result`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                keys: data.map(key => ({
                    keyType: key.key_type,
                    isActive: key.is_active,
                    lastTested: key.last_tested,
                    testResult: key.test_result ? JSON.parse(key.test_result) : null
                }))
            };
        } else {
            throw new Error('Failed to fetch API keys status');
        }
    } catch (error) {
        return {
            success: false,
            message: error.message,
            keys: []
        };
    }
}

// Get masked API key for display
async function getMaskedApiKey(keyType, serviceRoleKey, supabaseUrl) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/api_keys_config?key_type=eq.${keyType}&select=key_value_encrypted`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const encryptedKey = data[0].key_value_encrypted;
                const decodedKey = atob(encryptedKey);
                const maskedKey = decodedKey.substring(0, 8) + '••••••••' + decodedKey.substring(decodedKey.length - 4);
                
                return {
                    success: true,
                    maskedKey,
                    keyType
                };
            } else {
                return {
                    success: false,
                    message: 'API key not found',
                    keyType
                };
            }
        } else {
            throw new Error('Failed to fetch API key');
        }
    } catch (error) {
        return {
            success: false,
            message: error.message,
            keyType
        };
    }
}