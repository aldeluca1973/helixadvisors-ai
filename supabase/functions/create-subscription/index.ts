
        const planConfigs = {
  "founder": {
    "amount": 2900,
    "name": "Founder Tier",
    "currency": "usd", 
    "interval": "month",
    "monthlyLimit": 10
  },
  "investor": {
    "amount": 7900,
    "name": "Investor Tier", 
    "currency": "usd",
    "interval": "month", 
    "monthlyLimit": 50
  },
  "enterprise": {
    "amount": 19900,
    "name": "Enterprise Tier",
    "currency": "usd",
    "interval": "month",
    "monthlyLimit": -1
  }
}
        const tableName = "saas_plans"

async function createDynamicPrice(planType: string, stripeSecretKey: string) {
  const config = planConfigs[planType];
  if (!config) throw new Error(`Unsupported plan type: ${planType}`);

  const priceParams = new URLSearchParams({
    currency: config.currency,
    unit_amount: config.amount.toString(),
    'recurring[interval]': config.interval,
    'product_data[name]': config.name,
    'metadata[plan_type]': planType
  });

  const response = await fetch('https://api.stripe.com/v1/prices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: priceParams.toString()
  });

  if (!response.ok) throw new Error(`Failed to create price: ${await response.text()}`);
  
  const priceData = await response.json();
  const priceId = priceData.id;

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  
  if (serviceRoleKey && supabaseUrl) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          price_id: priceId,
          plan_type: planType,
          price: config.amount,
          monthly_limit: config.monthlyLimit,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      
      console.log(`Plan synced to database: ${planType} -> ${priceId} (table: ${tableName})`);
    } catch (syncError) {
      console.error('Failed to sync plan to database:', syncError);
      throw new Error(`Failed to sync plan to database`)
    }
  }

  return priceId;
}


async function getOrCreatePrice(planType: string, stripeSecretKey: string) {
  const config = planConfigs[planType];
  if (!config) throw new Error(`Unsupported plan type: ${planType}`);

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');

  if (serviceRoleKey && supabaseUrl) {
    try {
      const localResponse = await fetch(
        `${supabaseUrl}/rest/v1/${tableName}?plan_type=eq.${planType}&select=price_id`,
        { 
          headers: { 
            'Authorization': `Bearer ${serviceRoleKey}`, 
            'apikey': serviceRoleKey 
          } 
        }
      );
      
      if (localResponse.ok) {
        const localData = await localResponse.json();
        if (localData?.length > 0) {
          console.log(`Found existing plan in local database: ${planType} -> ${localData[0].price_id}`);
          return localData[0].price_id;
        }
      }
    } catch (error) {
      console.error('Local database query failed:', error);
    }
  }
  console.log(`Plan not found locally, creating new price for: ${planType}`);
  return await createDynamicPrice(planType, stripeSecretKey);
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://ba6lcda5u9e2.space.minimax.io'
      
    const { planType, customerEmail } = await req.json();
    if (!planType || !customerEmail) throw new Error('Missing required params');

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) throw new Error('Missing env config');

    // Get or create dynamic price based on planType
    const priceId = await getOrCreatePrice(planType, stripeSecretKey);

    // Get userId
    let userId = null;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': serviceRoleKey }
      });
      if (userRes.ok) userId = (await userRes.json()).id;
    }

    // Find or create Stripe customer
    let customerId = null;
    const customerRes = await fetch(`https://api.stripe.com/v1/customers/search?query=metadata['user_id']:'${userId}'&limit=1`, {
    headers: { 'Authorization': `Bearer ${stripeSecretKey}` }
    });
    const customerData = await customerRes.json();
    if (customerData.data?.length) {
        customerId = customerData.data[0].id;
        console.log(`Found customer by user_id: ${userId} -> ${customerId}`);
    } else {
      const params = new URLSearchParams({ email: customerEmail, 'metadata[user_id]': userId || '', 'metadata[plan_type]': planType });
      const createRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      customerId = (await createRes.json()).id;
    }

    const checkoutParams = new URLSearchParams({
      customer: customerId, mode: 'subscription',
      'line_items[0][price]': priceId, 'line_items[0][quantity]': '1',
      success_url: `https://ba6lcda5u9e2.space.minimax.io/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://ba6lcda5u9e2.space.minimax.io/pricing?subscription=cancelled`,
      'metadata[user_id]': userId || '', 'metadata[plan_type]': planType,
      // Enable automatic tax calculation and invoice emails
      'automatic_tax[enabled]': 'false',
      'invoice_creation[enabled]': 'true',
      'invoice_creation[invoice_data][description]': `HelixAdvisors.AI ${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`,
      'invoice_creation[invoice_data][footer]': '2025 HelixAdvisors.AI - Powered by Carism USA - All Rights Reserved'
    });
    const checkoutRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: checkoutParams.toString()
    });
    const checkoutSession = await checkoutRes.json();

    // Return checkout url
    return new Response(JSON.stringify({
      data: {
        checkoutSessionId: checkoutSession.id,
        checkoutUrl: checkoutSession.url,
        customerId,
        planType,
        priceId // Return dynamic price ID
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
        