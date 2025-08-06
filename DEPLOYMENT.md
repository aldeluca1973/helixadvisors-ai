# HelixAdvisors.AI Deployment Guide

This guide covers deploying HelixAdvisors.AI to production using Vercel and Supabase.

## 🚀 Quick Deploy (5 minutes)

### 1. One-Click Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/helixadvisors-ai)

1. **Fork this repository** to your GitHub account
2. **Click the "Deploy with Vercel" button** above
3. **Connect your GitHub account** in Vercel
4. **Import the forked repository**
5. **Configure environment variables** (see below)
6. **Deploy** - Vercel will automatically build and deploy

### 2. Set Up Supabase Backend

1. **Create Supabase Project**
   ```
   1. Go to https://supabase.com
   2. Click "New Project"
   3. Choose organization and set project name
   4. Wait for project creation (2-3 minutes)
   5. Copy the project URL and anon key
   ```

2. **Run Database Migrations**
   ```sql
   -- Copy and paste the SQL from /supabase/migrations/ 
   -- Run each migration file in chronological order
   -- Enable Row Level Security (RLS) for all tables
   ```

3. **Deploy Edge Functions**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Deploy all functions
   supabase functions deploy
   ```

4. **Set Up Cron Jobs**
   ```sql
   -- The system will automatically create cron jobs for:
   -- • 8:00 AM daily analysis + email
   -- • 8:00 PM daily analysis + email
   ```

### 3. Configure Environment Variables in Vercel

In your Vercel project dashboard:

1. **Go to Settings → Environment Variables**
2. **Add the following variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Your Supabase anon key |
| `RESEND_API_KEY` | `re_...` | Your Resend API key for emails |
| `VITE_APP_URL` | `https://your-domain.com` | Your production domain |

3. **Redeploy** after adding environment variables

## 🌐 Custom Domain Setup

### Option 1: Using Vercel (Recommended)

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add your domain (e.g., `helixadvisors.ai`)
   - Follow Vercel's DNS configuration instructions

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: www
   Value: your-app.vercel.app
   
   Type: A (or use domain forwarding)
   Name: @
   Value: 76.76.19.61 (Vercel's IP)
   ```

### Option 2: Using Domain Forwarding

1. **In your domain registrar (GoDaddy, etc.):**
   - Set up domain forwarding from root domain to www
   - Configure CNAME for www subdomain

2. **Example for GoDaddy:**
   ```
   1. Go to DNS Management
   2. Add CNAME: www → your-app.vercel.app
   3. Set up Domain Forwarding: @ → https://www.your-domain.com
   ```

## 📧 Email Configuration

### Resend Setup

1. **Create Resend Account**
   ```
   1. Go to https://resend.com
   2. Sign up for a free account
   3. Get your API key from the dashboard
   ```

2. **Verify Domain (Optional)**
   ```
   1. Add your domain in Resend dashboard
   2. Configure DNS records for domain verification
   3. This enables sending from your custom domain
   ```

3. **Test Email Delivery**
   ```bash
   # The system will automatically send test emails
   # Check your email logs in Resend dashboard
   ```

## 🔧 Advanced Configuration

### Supabase Edge Functions Environment Variables

In your Supabase dashboard → Edge Functions → Settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_...` | For sending automated emails |
| `OPENAI_API_KEY` | `sk-...` | For AI analysis (optional) |
| `SUPABASE_URL` | Auto-set | Your project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set | Service role key |

### Cron Job Verification

```sql
-- Check active cron jobs
SELECT * FROM cron.job;

-- Check cron job logs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### Performance Optimization

1. **Enable Vercel Analytics**
   ```
   1. Go to Vercel project → Analytics
   2. Enable Web Analytics
   3. Add VITE_VERCEL_ANALYTICS_ID to environment variables
   ```

2. **Database Optimization**
   ```sql
   -- Ensure proper indexes are created
   CREATE INDEX IF NOT EXISTS idx_startup_ideas_score ON startup_ideas(total_score DESC);
   CREATE INDEX IF NOT EXISTS idx_startup_ideas_created ON startup_ideas(created_at DESC);
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all environment variables are set
   # Verify package.json dependencies
   ```

2. **Database Connection Issues**
   ```bash
   # Verify Supabase URL and keys
   # Check Row Level Security policies
   # Ensure database is properly migrated
   ```

3. **Email Not Sending**
   ```bash
   # Verify Resend API key
   # Check Resend dashboard for errors
   # Ensure Edge Functions are deployed
   ```

4. **Cron Jobs Not Running**
   ```sql
   -- Check if cron extension is enabled
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   
   -- Enable if not installed
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

### Debug Mode

Enable debug logging by adding to environment variables:
```
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## 📊 Monitoring & Maintenance

### Health Checks

1. **Vercel Monitoring**
   - Automatic uptime monitoring
   - Performance analytics
   - Error tracking

2. **Supabase Monitoring**
   - Database performance
   - Edge function logs
   - API usage statistics

3. **Email Delivery**
   - Resend delivery statistics
   - Bounce rate monitoring
   - Automated email logs

### Backup Strategy

1. **Database Backups**
   ```
   Supabase automatically backs up your database
   Access backups in Supabase dashboard → Database → Backups
   ```

2. **Code Backups**
   ```
   Git repository serves as code backup
   Tag releases for easy rollback
   ```

## 🔄 Updates & Maintenance

### Regular Updates

1. **Weekly:**
   - Check system health metrics
   - Review email delivery reports
   - Monitor error logs

2. **Monthly:**
   - Update dependencies
   - Review and optimize database performance
   - Analyze usage patterns

### Security Updates

1. **Environment Variables:**
   - Rotate API keys quarterly
   - Update Supabase service role key if needed

2. **Dependencies:**
   - Keep npm packages updated
   - Monitor security advisories

## 📞 Support

If you encounter issues during deployment:

1. **Check the logs:**
   - Vercel: Function logs in dashboard
   - Supabase: Edge function logs
   - Browser: Developer console

2. **Common solutions:**
   - Redeploy after environment variable changes
   - Clear browser cache for frontend issues
   - Check CORS settings for API issues

3. **Get help:**
   - GitHub Issues for bugs
   - GitHub Discussions for questions
   - Email: support@helixadvisors.ai

---

**Deployment Time:** ~15 minutes for full setup
**Maintenance:** ~30 minutes per month
**Uptime:** 99.9% with Vercel + Supabase
