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
        console.log('Enhanced daily email reports function triggered');

        // Get environment variables
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing required environment variables');
        }

        // Get current date and time info
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const currentTime = now.getHours();
        const timeOfDay = currentTime < 12 ? 'Morning' : 'Evening';
        const reportType = currentTime < 12 ? 'Morning Intelligence Brief' : 'Evening Market Update';

        // Fetch latest startup ideas from the last 24 hours
        const since24HoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        
        const ideasResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${since24HoursAgo}&order=total_score.desc&limit=10`, {
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
            }
        });

        let newIdeas = [];
        if (ideasResponse.ok) {
            newIdeas = await ideasResponse.json();
        }

        // Fetch trending ideas (top scored in last 48 hours)
        const since48HoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
        const trendingResponse = await fetch(`${supabaseUrl}/rest/v1/startup_ideas?created_at=gte.${since48HoursAgo}&order=total_score.desc&limit=5`, {
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
            }
        });

        let trendingIdeas = [];
        if (trendingResponse.ok) {
            trendingIdeas = await trendingResponse.json();
        }

        // Generate insights
        const totalNewIdeas = newIdeas.length;
        const avgScore = newIdeas.length > 0 ? (newIdeas.reduce((sum, idea) => sum + (idea.total_score || 0), 0) / newIdeas.length).toFixed(1) : 0;
        const topScore = newIdeas.length > 0 ? Math.max(...newIdeas.map(idea => idea.total_score || 0)).toFixed(1) : 0;

        // Create email content with actual data
        const newIdeasHtml = newIdeas.slice(0, 5).map(idea => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 8px;">
                    <strong style="color: #2563eb;">${idea.idea_name || 'Untitled Idea'}</strong>
                    <br>
                    <small style="color: #666;">${(idea.description || '').substring(0, 120)}${(idea.description || '').length > 120 ? '...' : ''}</small>
                </td>
                <td style="padding: 12px 8px; text-align: center;">
                    <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                        ${(idea.total_score || 0).toFixed(1)}
                    </span>
                </td>
            </tr>
        `).join('');

        const trendingIdeasHtml = trendingIdeas.slice(0, 3).map(idea => `
            <li style="margin-bottom: 8px;">
                <strong>${idea.idea_name || 'Untitled'}</strong> 
                <span style="color: #10b981; font-weight: bold;">(${(idea.total_score || 0).toFixed(1)})</span>
                <br>
                <small style="color: #666;">${(idea.description || '').substring(0, 80)}${(idea.description || '').length > 80 ? '...' : ''}</small>
            </li>
        `).join('');

        const emailContent = {
            from: 'HelixAdvisors.AI Intelligence <onboarding@resend.dev>',
            to: ['alessandro@carism.it'],
            subject: `🚀 ${timeOfDay} ${reportType} - ${currentDate}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">HelixAdvisors.AI</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">${reportType}</p>
                        <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 14px;">${currentDate}</p>
                    </div>

                    <!-- Key Insights -->
                    <div style="padding: 25px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px;">📊 Key Insights</h2>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 120px; text-align: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${totalNewIdeas}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">New Ideas (24h)</div>
                            </div>
                            <div style="flex: 1; min-width: 120px; text-align: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${avgScore}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">Avg Score</div>
                            </div>
                            <div style="flex: 1; min-width: 120px; text-align: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${topScore}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">Top Score</div>
                            </div>
                        </div>
                    </div>

                    <!-- New Ideas -->
                    <div style="padding: 25px 20px;">
                        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px;">🆕 Latest Startup Ideas</h2>
                        ${newIdeas.length > 0 ? `
                            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <thead>
                                    <tr style="background: #f1f5f9;">
                                        <th style="padding: 12px 8px; text-align: left; font-size: 14px; color: #475569;">Idea</th>
                                        <th style="padding: 12px 8px; text-align: center; font-size: 14px; color: #475569;">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${newIdeasHtml}
                                </tbody>
                            </table>
                        ` : `
                            <div style="text-align: center; padding: 30px; background: #f8fafc; border-radius: 8px; color: #64748b;">
                                <p style="margin: 0; font-size: 16px;">No new ideas in the last 24 hours.</p>
                                <p style="margin: 8px 0 0 0; font-size: 14px;">The system continues monitoring for emerging opportunities.</p>
                            </div>
                        `}
                    </div>

                    <!-- Trending Ideas -->
                    ${trendingIdeas.length > 0 ? `
                        <div style="padding: 0 20px 25px 20px;">
                            <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px;">🔥 Trending Ideas</h2>
                            <ul style="background: white; padding: 20px; margin: 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                ${trendingIdeasHtml}
                            </ul>
                        </div>
                    ` : ''}

                    <!-- Quick Actions -->
                    <div style="padding: 0 20px 25px 20px;">
                        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px;">⚡ Quick Actions</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <p style="margin: 0 0 15px 0; color: #475569;">Explore more insights and analyze trends:</p>
                            <a href="https://helixadvisors.ai/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">View Dashboard</a>
                            <a href="https://helixadvisors.ai/ideas" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Browse Ideas</a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 20px; background: #f1f5f9; text-align: center; color: #64748b; font-size: 12px;">
                        <p style="margin: 0 0 8px 0;">🤖 This intelligent report was generated automatically by HelixAdvisors.AI</p>
                        <p style="margin: 0;">Generated on ${now.toLocaleString()} | Next report: ${currentTime < 12 ? '8:00 PM' : '8:00 AM tomorrow'}</p>
                    </div>
                </div>
            `
        };

        // Send email using Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailContent),
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.text();
            console.error('Resend API error:', errorData);
            throw new Error(`Resend API error: ${emailResponse.status} - ${errorData}`);
        }

        const result = await emailResponse.json();
        console.log('Enhanced email sent successfully:', result);

        // Log the email send
        await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient_email: 'alessandro@carism.it',
                email_type: reportType,
                ideas_count: totalNewIdeas,
                avg_score: parseFloat(avgScore),
                sent_at: now.toISOString(),
                email_id: result.id
            })
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Enhanced daily email report sent successfully',
                report_type: reportType,
                ideas_included: totalNewIdeas,
                avg_score: avgScore,
                emailId: result.id,
                sentTo: 'alessandro@carism.it',
                sentAt: now.toISOString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );

    } catch (error) {
        console.error('Error in enhanced daily email reports function:', error);
        
        return new Response(
            JSON.stringify({
                error: {
                    code: 'EMAIL_SEND_ERROR',
                    message: error.message
                }
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});