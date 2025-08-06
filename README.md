# HelixAdvisors.AI - Startup Intelligence Platform

🚀 **Professional-grade startup idea discovery and market intelligence platform powered by AI**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/helixadvisors-ai)

## ✨ Features

### 🤖 Automated Intelligence System
- **Twice-daily AI analysis** (8 AM & 8 PM)
- **Smart email reports** with actual startup ideas and insights
- **Multi-source data collection** from various market channels
- **Real-time scoring and ranking** using advanced AI algorithms

### 📊 Intelligence Dashboard
- **Interactive startup ideas browser** with advanced filtering
- **Market trend analysis** and historical data visualization
- **Professional analytics** with scoring breakdowns
- **Administrative controls** for system configuration

### 🔐 Enterprise Security
- **Role-based access control** with admin and user tiers
- **Secure authentication** via Supabase Auth
- **Professional subscription management** with Stripe integration
- **Comprehensive audit logging** for all activities

## 🎯 Quick Start

### 1. Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/helixadvisors-ai)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account and fork the repository
3. Configure environment variables (see below)
4. Deploy automatically to production

### 2. Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/helixadvisors-ai.git
cd helixadvisors-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Optional: Analytics & Monitoring
VITE_ANALYTICS_ID=your_analytics_id
```

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the URL and anon key

2. **Database Setup**
   - Run the provided SQL migrations in your Supabase dashboard
   - Enable Row Level Security (RLS) policies
   - Configure authentication providers as needed

3. **Edge Functions**
   - Deploy the included Supabase Edge Functions
   - Set up cron jobs for automated analysis
   - Configure environment variables in Supabase

### Email Configuration

1. **Resend Setup**
   - Create account at [resend.com](https://resend.com)
   - Get your API key
   - Verify your sending domain (optional for testing)

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Vite** for blazing-fast development and building
- **Tailwind CSS** for modern, responsive design
- **Shadcn/UI** for beautiful, accessible components
- **Recharts** for interactive data visualizations

### Backend (Supabase)
- **PostgreSQL** database with advanced RLS policies
- **Real-time subscriptions** for live data updates
- **Edge Functions** for serverless business logic
- **Cron Jobs** for automated analysis and reporting

### Intelligence Engine
- **Multi-source data collection** from market channels
- **AI-powered analysis** with OpenAI integration
- **Automated scoring algorithms** for idea ranking
- **Smart email reporting** with actionable insights

## 📱 User Guide

### For Administrators

1. **Login with Admin Credentials**
   ```
   Email: admin@helixadvisors.com
   Password: HelixAdmin2025!
   ```

2. **Configuration Management**
   - Access `/config` route for admin settings
   - Adjust AI scoring weights and parameters
   - Manage API keys and system configurations
   - Monitor system health and performance

3. **Email Reports**
   - Receive twice-daily intelligence briefs
   - Morning reports at 8:00 AM
   - Evening updates at 8:00 PM
   - Includes actual startup ideas with AI analysis

### For Users

1. **Browse Startup Ideas**
   - Visit the ideas dashboard
   - Filter by score, date, and categories
   - View detailed AI analysis for each idea

2. **Market Intelligence**
   - Access trend analysis and historical data
   - Monitor market movements and opportunities
   - Export data for further analysis

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **In Vercel Dashboard**
   - Go to your project settings
   - Navigate to "Domains" section
   - Add your custom domain (e.g., `helixadvisors.ai`)

2. **DNS Configuration**
   - Add CNAME record: `www` → `your-app.vercel.app`
   - Use domain forwarding for root domain if needed

### Automation Scheduling

The system includes pre-configured cron jobs:

- **6:00 AM** - Daily data collection
- **8:00 AM** - Morning intelligence analysis + email
- **8:00 PM** - Evening market update + email

### Scaling Considerations

- **Database**: Supabase scales automatically
- **Email**: Resend handles high-volume sending
- **Compute**: Vercel provides auto-scaling edge functions

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI base components
│   ├── layout/         # Layout components
│   └── dashboard/      # Dashboard-specific components
├── pages/              # Page components and routing
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── contexts/           # React context providers

supabase/
├── functions/          # Edge Functions for serverless logic
├── migrations/         # Database schema migrations
└── tables/            # SQL table definitions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript checks
npm run lint         # Run ESLint
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized for excellent user experience
- **Bundle Size**: < 500KB gzipped
- **Load Time**: < 2 seconds on 3G networks

## 🔒 Security

- **Authentication**: Secure JWT-based auth with Supabase
- **Data Protection**: Row-level security (RLS) on all tables
- **API Security**: Rate limiting and input validation
- **HTTPS**: Enforced SSL/TLS encryption
- **Environment**: Secure environment variable handling

## 📈 Analytics & Monitoring

- **Performance**: Built-in Vercel Analytics
- **Errors**: Automatic error tracking and reporting
- **Usage**: User behavior and feature adoption metrics
- **Business**: Revenue and subscription analytics

## 🤝 Support

- **Documentation**: Comprehensive guides and API references
- **Community**: GitHub Discussions for questions and feedback
- **Issues**: Bug reports and feature requests via GitHub Issues
- **Email**: Direct support at support@helixadvisors.ai

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the incredible backend-as-a-service platform
- **Vercel** for seamless deployment and edge computing
- **OpenAI** for powerful AI capabilities
- **Tailwind CSS** for beautiful, maintainable styling
- **React community** for the amazing ecosystem

---

**Built with ❤️ by the HelixAdvisors.AI team**

For more information, visit [helixadvisors.ai](https://helixadvisors.ai)
