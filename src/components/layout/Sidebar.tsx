import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  BarChart3,
  Brain,
  Settings,
  TrendingUp,
  Sparkles,
  Activity,
  Search,
  Bookmark,
  Lightbulb,
  LogOut,
  User,
  Zap
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview and key insights'
  },
  {
    name: 'Trends Feed',
    href: '/trends-feed',
    icon: Activity,
    description: 'Live cross-platform intelligence',
    isProfessional: true
  },
  {
    name: 'Search',
    href: '/search',
    icon: Search,
    description: 'Deep search with filters'
  },
  {
    name: 'Smart App Ideas',
    href: '/smart-app-ideas',
    icon: Lightbulb,
    description: 'AI-powered SaaS opportunities',
    isProfessional: true
  },
  {
    name: 'Startup Ideas',
    href: '/ideas',
    icon: TrendingUp,
    description: 'Dual-AI analyzed opportunities'
  },
  {
    name: 'Collections',
    href: '/collections',
    icon: Bookmark,
    description: 'Saved opportunities'
  },
  {
    name: 'Historical Trends',
    href: '/historical-trends',
    icon: TrendingUp,
    description: 'Trend analysis and insights'
  },
  {
    name: 'Configuration',
    href: '/config',
    icon: Settings,
    description: 'API keys and settings'
  }
]

export function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { profileData } = useUserProfile()
  
  const currentTier = (profileData as any)?.current_tier || 'free'
  const isEnterprise = (profileData as any)?.is_enterprise

  return (
    <div className="w-60 bg-surface border-r border-stroke flex flex-col">
      {/* Professional Logo and Brand */}
      <div className="p-6 border-b border-stroke">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-interactive rounded-lg shadow-professional">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-heading-3 text-text-primary font-semibold">
              HelixAdvisors.AI
            </h1>
            <p className="text-caption text-text-secondary">
              Smart App Ideas & Market Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Professional Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 group relative',
                isActive
                  ? 'bg-interactive text-white shadow-professional'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-body-secondary font-medium flex items-center gap-2">
                  <span className="truncate">{item.name}</span>
                  {item.isProfessional && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-success to-interactive text-white text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  )}
                </div>
                <div className="text-caption text-text-secondary group-hover:text-text-secondary/80 truncate">
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Enterprise API Access */}
      {isEnterprise && (
        <nav className="px-4 pb-2">
          <Link
            to="/api"
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 group relative',
              location.pathname === '/api'
                ? 'bg-interactive text-white shadow-professional'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
            )}
          >
            <Zap className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-body-secondary font-medium flex items-center gap-2">
                <span className="truncate">API Access</span>
                <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                  ENTERPRISE
                </span>
              </div>
              <div className="text-caption text-text-secondary group-hover:text-text-secondary/80 truncate">
                Full API access and integration
              </div>
            </div>
          </Link>
        </nav>
      )}

      {/* Subscription Status */}
      <div className="px-4 py-4 border-t border-stroke">
        <div className="bg-background rounded-lg p-4 border border-stroke">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-secondary font-medium text-text-primary">Current Plan</span>
            <span className={cn(
              'px-2 py-1 text-xs font-bold rounded-full',
              currentTier === 'enterprise' ? 'bg-yellow-500 text-gray-900' :
              currentTier === 'investor' ? 'bg-yellow-500/20 text-yellow-500' :
              currentTier === 'founder' ? 'bg-blue-500/20 text-blue-500' :
              'bg-gray-600 text-gray-300'
            )}>
              {currentTier.toUpperCase()}
            </span>
          </div>
          
          {profileData && (
            <div className="text-caption text-text-secondary mb-3">
              {(profileData as any).monthly_limit === -1 ? (
                'Unlimited usage'
              ) : (
                `${(profileData as any).profile?.daily_usage_count || 0}/${(profileData as any).monthly_limit} daily limit`
              )}
            </div>
          )}
          
          {currentTier === 'free' && (
            <Link
              to="/pricing"
              className="block w-full mt-2 px-3 py-2 text-xs text-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Professional System Status */}
      <div className="px-4 pb-2">
        <div className="bg-background rounded-lg p-3 border border-stroke">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption font-medium text-text-primary">Intelligence Engine</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs text-success font-medium">ACTIVE</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Multi-Source Collection</span>
              <span className="text-xs text-success font-medium">Live</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Dual-AI Analysis</span>
              <span className="text-xs text-success font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-4">
        <button
          onClick={signOut}
          className="flex items-center w-full px-4 py-3 text-body-secondary font-medium text-text-secondary hover:text-text-primary hover:bg-background rounded-md transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}