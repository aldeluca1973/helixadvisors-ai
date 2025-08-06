import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import {
  ExternalLink,
  X,
  Github,
  MessageSquare,
  TrendingUp,
  Activity,
  Clock,
  Zap,
  ArrowUpRight,
  Target,
  BarChart3,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

interface ProfessionalTrendCardProps {
  trend: any
  onClick?: () => void
}

export function ProfessionalTrendCard({ trend, onClick }: ProfessionalTrendCardProps) {
  const relevanceScore = trend.overall_relevance_score || trend.professional_relevance_score || trend.quality_score || 0
  const velocityScore = trend.velocity_score || 0
  const businessScore = trend.business_viability_score || 0
  const crossPlatformValidated = trend.cross_platform_validated || false
  
  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-success'
    if (score >= 0.6) return 'text-warning'
    return 'text-danger'
  }
  
  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'twitter':
      case 'x':
        return <X className="w-4 h-4" />
      case 'github':
        return <Github className="w-4 h-4" />
      case 'hacker_news':
      case 'hacker_news_professional':
        return <MessageSquare className="w-4 h-4" />
      case 'google_trends':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }
  
  const getCategoryColor = (category: string) => {
    const categoryMap: Record<string, string> = {
      'B2B & Enterprise': 'bg-interactive/10 text-interactive border-interactive/20',
      'SaaS & Software': 'bg-success/10 text-success border-success/20',
      'AI & Automation': 'bg-warning/10 text-warning border-warning/20',
      'Developer Tools & API': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Productivity & Workflow': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Startup & Entrepreneurship': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }
    return categoryMap[category] || 'bg-muted/50 text-muted-foreground border-muted/20'
  }

  return (
    <Card 
      className="border-stroke hover:border-interactive/30 transition-all duration-300 cursor-pointer group hover:shadow-card-hover"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header with Title and Relevance Score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 text-text-secondary">
                {getPlatformIcon(trend.source_platform)}
                <span className="text-caption font-medium capitalize">
                  {trend.source_platform?.replace('_', ' ')}
                </span>
              </div>
              
              {crossPlatformValidated && (
                <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-xs font-medium">Cross-Platform</span>
                </div>
              )}
              
              {trend.professional_analysis && (
                <div className="flex items-center gap-1 bg-interactive/10 text-interactive px-2 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-medium">AI Enhanced</span>
                </div>
              )}
            </div>
            
            <h3 className="text-heading-3 text-text-primary font-medium mb-2 line-clamp-2 group-hover:text-interactive transition-colors">
              {trend.title}
            </h3>
            
            {trend.trend_category && (
              <Badge className={`text-xs ${getCategoryColor(trend.trend_category)} mb-3`}>
                {trend.trend_category}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            <Badge 
              className={`text-xs font-medium ${getRelevanceColor(relevanceScore)} bg-current/10 border-current/20`}
            >
              {Math.round(relevanceScore * 100)}% relevance
            </Badge>
            
            {businessScore > 0 && (
              <div className="text-caption text-text-secondary">
                <span className="font-medium">${Math.round(businessScore * 100)}K</span> potential
              </div>
            )}
          </div>
        </div>

        {/* Professional Analysis Summary */}
        <div className="mb-4">
          <p className="text-body-secondary text-text-primary line-clamp-3 leading-relaxed">
            {trend.description || trend.market_opportunity || trend.ai_summary || 'Professional analysis in progress...'}
          </p>
        </div>

        {/* Professional Keywords */}
        {trend.professional_keywords && trend.professional_keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {trend.professional_keywords.slice(0, 5).map((keyword: string, index: number) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-background text-text-secondary border border-stroke rounded-md"
              >
                {keyword}
              </span>
            ))}
            {trend.professional_keywords.length > 5 && (
              <span className="text-xs text-text-secondary">+{trend.professional_keywords.length - 5} more</span>
            )}
          </div>
        )}

        {/* Professional Metrics Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Velocity Score */}
            {velocityScore > 0 && (
              <div className="flex items-center gap-1">
                <Zap className={`w-4 h-4 ${velocityScore > 0.7 ? 'text-success' : velocityScore > 0.4 ? 'text-warning' : 'text-text-secondary'}`} />
                <span className="text-caption text-text-secondary">
                  <span className="font-medium">{Math.round(velocityScore * 100)}%</span> velocity
                </span>
              </div>
            )}
            
            {/* Cross-Platform Mentions */}
            {trend.cross_platform_mentions && (
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-interactive" />
                <span className="text-caption text-text-secondary">
                  <span className="font-medium">{trend.cross_platform_mentions}</span> platforms
                </span>
              </div>
            )}
            
            {/* Business Confidence */}
            {trend.business_confidence_score && (
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-success" />
                <span className="text-caption text-text-secondary">
                  <span className="font-medium">{Math.round(trend.business_confidence_score * 100)}%</span> confidence
                </span>
              </div>
            )}
            
            {/* Engagement Metrics */}
            {(trend.like_count > 0 || trend.retweet_count > 0 || trend.comments > 0) && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-text-secondary" />
                <span className="text-caption text-text-secondary font-medium">
                  {(trend.like_count || 0) + (trend.retweet_count || 0) + (trend.comments || 0)} engagement
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Stamp */}
            <div className="flex items-center gap-1 text-caption text-text-secondary">
              <Clock className="w-3 h-3" />
              <span>{formatDate(trend.created_at)}</span>
            </div>
            
            {/* External Link */}
            {trend.source_url && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 text-text-secondary hover:text-interactive"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(trend.source_url, '_blank')
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            
            {/* View Details */}
            <Button
              variant="ghost"
              size="sm"
              className="text-caption text-interactive hover:bg-interactive/10"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              View Details
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}