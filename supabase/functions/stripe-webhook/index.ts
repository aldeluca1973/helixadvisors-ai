Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    if (req.method === 'OPTIONS') { 
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Missing environment variables');
        }

        const event = await req.json();
        console.log('Webhook event:', JSON.stringify(event));
        
        // Handle essential event types including subscription confirmations
        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object, supabaseUrl, serviceRoleKey);
                break;
            
            case 'customer.subscription.updated':
                await handleSubscription(event.data.object, supabaseUrl, serviceRoleKey);
                break;
            
            case 'invoice.payment_succeeded':
                await handlePayment(event.data.object, supabaseUrl, serviceRoleKey);
                break;
            
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object, supabaseUrl, serviceRoleKey);
                break;
                
            default:
                console.log('Event ignored:', event.type);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function getSubscriptionId(invoice: any): string | undefined {
    return invoice?.subscription;
}

function getPriceId(invoice: any): string | undefined {
    return invoice?.lines?.data?.[0]?.price?.id;
}

// Handle cancel subscription changes
async function handleSubscription(invoice: any, supabaseUrl: string, serviceRoleKey: string) {
    const isCanceling = invoice.cancel_at_period_end === true || invoice.status === 'canceled';
    const subscriptions_table = 'saas_subscriptions'
    
    const subscriptionId = getSubscriptionId(invoice);

    if (!isCanceling) {
        console.log(`Subscription ${invoice.id} is not canceling, skipping.`);
        return;
    }
    
    await fetch(`${supabaseUrl}/rest/v1/${subscriptions_table}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            stripe_subscription_id: subscriptionId,
            status: "canceled",
            updated_at: new Date().toISOString()
        })
    });

    console.log(`Subscription cancellation processed: ${invoice.id}, status: ${invoice.status}`);
}

// Handle successful payments - upsert subscription with plan info
async function handlePayment(invoice: any, supabaseUrl: string, serviceRoleKey: string) {
    if (!['subscription_cycle', 'subscription_create'].includes(invoice.billing_reason)) return;

    const customerId = invoice.customer;
    const subscriptions_table = 'saas_subscriptions'
    
    const subscriptionId = getSubscriptionId(invoice);
    const priceId = getPriceId(invoice);
    
    if (!priceId) {
        console.log('No price_id found in subscription');
        return;
    }

    // Query plans table to get plan_type by price_id
    const planResponse = await fetch(`${supabaseUrl}/rest/v1/saas_plans?price_id=eq.${priceId}&select=plan_type,monthly_limit`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    let planType = 'free';
    let monthlyLimit = 3;
    
    if (planResponse.ok) {
        const planData = await planResponse.json();
        if (planData?.length > 0) {
            planType = planData[0].plan_type;
            monthlyLimit = planData[0].monthly_limit;
        }
    }

    // Get user_id from Stripe customer
    let userId = null;
    try {
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (stripeSecretKey) {
            const customerResponse = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${stripeSecretKey}`
                }
            });
            
            if (customerResponse.ok) {
                const customerData = await customerResponse.json();
                userId = customerData.metadata?.user_id || null;
                console.log(`Retrieved user_id: ${userId} for customer: ${customerId}`);
            }
        }
    } catch (error) {
        console.error('Failed to retrieve user_id from Stripe customer:', error);
    }

    // Upsert subscription record
    const response = await fetch(`${supabaseUrl}/rest/v1/${subscriptions_table}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            price_id: priceId,
            status: 'active',
            updated_at: new Date().toISOString()
        })
    });
    
    const rawText = await response.text();
    console.log("upsert data resp:", JSON.stringify(rawText));
    console.log(`Payment processed - stripe_subscription_id: ${subscriptionId} Customer: ${customerId}, Plan: ${planType}, Usage reset`);
}

// Handle new subscription creation - send real welcome email
async function handleSubscriptionCreated(subscription: any, supabaseUrl: string, serviceRoleKey: string) {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    
    try {
        // Get customer email from Stripe
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (stripeSecretKey) {
            const customerResponse = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
                headers: { 'Authorization': `Bearer ${stripeSecretKey}` }
            });
            
            if (customerResponse.ok) {
                const customerData = await customerResponse.json();
                const customerEmail = customerData.email;
                
                // Send real welcome email via email service
                await sendSubscriptionConfirmationEmail(customerEmail, subscription, supabaseUrl, serviceRoleKey);
                
                console.log(`Subscription created and welcome email sent to: ${customerEmail}`);
            }
        }
    } catch (error) {
        console.error('Failed to send subscription confirmation email:', error);
    }
}

// Handle checkout completion - additional confirmation
async function handleCheckoutCompleted(session: any, supabaseUrl: string, serviceRoleKey: string) {
    try {
        const customerEmail = session.customer_details?.email;
        if (customerEmail) {
            console.log(`Checkout completed for: ${customerEmail}`);
            
            // Send checkout completion email
            const emailContent = {
                to: customerEmail,
                subject: 'HelixAdvisors.AI - Payment Successful',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1a365d;">Payment Successful!</h2>
                        <p>Thank you for your payment to HelixAdvisors.AI.</p>
                        <p>Your payment has been processed successfully. You will receive a separate email with your subscription details shortly.</p>
                        <p>If you have any questions, please contact our support team.</p>
                        <p style="margin-top: 30px;">Best regards,<br>The HelixAdvisors.AI Team</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 12px; color: #666; text-align: center;">2025 HelixAdvisors.AI - Powered by Carism USA - All Rights Reserved</p>
                    </div>
                `,
                type: 'payment_confirmation'
            };
            
            // Send via email service
            await fetch(`${supabaseUrl}/functions/v1/email-service`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailContent)
            });
        }
    } catch (error) {
        console.error('Failed to handle checkout completion:', error);
    }
}

// Send subscription confirmation email via real email service
async function sendSubscriptionConfirmationEmail(email: string, subscription: any, supabaseUrl: string, serviceRoleKey: string) {
    // Get plan details
    const planName = subscription.items?.data?.[0]?.price?.nickname || 'Subscription';
    const planAmount = subscription.items?.data?.[0]?.price?.unit_amount;
    const formattedAmount = planAmount ? `$${(planAmount / 100).toFixed(2)}` : 'N/A';
    
    const emailContent = {
        to: email,
        subject: `Welcome to HelixAdvisors.AI - ${planName} Subscription Confirmed`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1a365d; margin: 0;">HelixAdvisors.AI</h1>
                    <p style="color: #4a5568; margin: 5px 0 0 0;">AI-Powered Investment Intelligence</p>
                </div>
                
                <h2 style="color: #2d3748;">Welcome to HelixAdvisors.AI!</h2>
                <p style="color: #4a5568; line-height: 1.6;">Thank you for subscribing to our ${planName} plan. Your subscription is now active and you have access to our advanced AI-powered investment intelligence tools.</p>
                
                <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2d3748; margin-top: 0;">Subscription Details:</h3>
                    <ul style="color: #4a5568; line-height: 1.8;">
                        <li><strong>Plan:</strong> ${planName}</li>
                        <li><strong>Amount:</strong> ${formattedAmount}/month</li>
                        <li><strong>Status:</strong> Active</li>
                        <li><strong>Billing Cycle:</strong> Monthly</li>
                    </ul>
                </div>
                
                <p style="color: #4a5568; line-height: 1.6;">You can now access your dashboard to start analyzing startup opportunities and investment intelligence:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://ba6lcda5u9e2.space.minimax.io/dashboard" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Your Dashboard</a>
                </div>
                
                <p style="color: #4a5568; line-height: 1.6;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p style="color: #4a5568; margin-top: 30px;">Best regards,<br>The HelixAdvisors.AI Team</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #666; text-align: center;">2025 HelixAdvisors.AI - Powered by Carism USA - All Rights Reserved</p>
                <p style="font-size: 12px; color: #666; text-align: center;">This email was sent regarding your subscription. Please keep this email for your records.</p>
            </div>
        `,
        type: 'subscription_confirmation'
    };
    
    // Send via email service
    try {
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/email-service`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailContent)
        });
        
        if (emailResponse.ok) {
            console.log('Subscription confirmation email sent successfully');
        } else {
            const errorText = await emailResponse.text();
            console.error('Failed to send subscription confirmation email:', errorText);
        }
    } catch (error) {
        console.error('Error sending subscription confirmation email:', error);
    }
}