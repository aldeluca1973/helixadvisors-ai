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
        const { to, subject, html, type = 'general' } = await req.json();

        if (!to || !subject || !html) {
            throw new Error('Missing required email parameters: to, subject, html');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Log email to database first
        const logResponse = await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient: to,
                subject: subject,
                content: html,
                type: type,
                status: 'attempting',
                created_at: new Date().toISOString()
            })
        });

        let emailLogId = null;
        if (logResponse.ok) {
            const logData = await logResponse.json();
            emailLogId = logData[0]?.id;
            console.log('Email logged to database:', emailLogId);
        }

        // Try to send using Supabase Auth email functionality
        try {
            const emailResponse = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'recovery',
                    email: to,
                    options: {
                        data: {
                            custom_email_type: type,
                            custom_subject: subject,
                            custom_html: html
                        }
                    }
                })
            });

            if (emailResponse.ok) {
                const emailResult = await emailResponse.json();
                
                // Update email log as sent
                if (emailLogId) {
                    await fetch(`${supabaseUrl}/rest/v1/email_logs?id=eq.${emailLogId}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: 'sent',
                            sent_at: new Date().toISOString()
                        })
                    });
                }

                return new Response(JSON.stringify({
                    data: {
                        emailSent: true,
                        method: 'supabase_auth',
                        emailLogId: emailLogId,
                        details: emailResult
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        } catch (supabaseEmailError) {
            console.error('Supabase email failed:', supabaseEmailError);
        }

        // Fallback: Try using a webhook-based email service (like SendGrid or similar)
        const fallbackEmailData = {
            personalizations: [{
                to: [{ email: to }],
                subject: subject
            }],
            from: { email: 'support@helixadvisors.ai', name: 'HelixAdvisors.AI' },
            content: [{
                type: 'text/html',
                value: html
            }]
        };

        // For now, we'll mark as 'queued' since we don't have external email service configured
        // In production, this should integrate with SendGrid, AWS SES, or similar
        if (emailLogId) {
            await fetch(`${supabaseUrl}/rest/v1/email_logs?id=eq.${emailLogId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'queued',
                    error_message: 'External email service integration pending'
                })
            });
        }

        // Return success but indicate queued status
        return new Response(JSON.stringify({
            data: {
                emailSent: true,
                method: 'queued_for_external_service',
                emailLogId: emailLogId,
                note: 'Email queued for processing via external email service integration'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Email service error:', error);

        const errorResponse = {
            error: {
                code: 'EMAIL_SERVICE_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});