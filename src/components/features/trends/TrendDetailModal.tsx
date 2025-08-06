import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import {
  ExternalLink,
  X,
  Github,
  MessageSquare,
  TrendingUp,
  Activity,
  BarChart3,
  Users,
  Clock,
  Zap,
  Brain,
  DollarSign,
  Lightbulb,
  Star,
  Bookmark
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TrendDetailModalProps {
  trend: any
  open: boolean
  onClose: () => void
}

export function TrendDetailModal({ trend, open, onClose }: TrendDetailModalProps) {
  if (!trend) return null

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

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-success'
    if (score >= 0.6) return 'text-warning'
    return 'text-danger'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-surface border-stroke">
        <DialogHeader className="border-b border-stroke pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getPlatformIcon(trend.source_platform)}
                <span className="text-caption text-text-secondary font-medium capitalize">
                  {trend.source_platform?.replace('_', ' ')}
                </span>
                {trend.cross_platform_validated && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    Cross-Platform Validated
                  </Badge>
                )}
              </div>
              
              <DialogTitle className="text-heading-2 text-text-primary mb-2">
                {trend.title}
              </DialogTitle>
              
              {trend.trend_category && (
                <Badge className="bg-interactive/10 text-interactive border-interactive/20">
                  {trend.trend_category}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {trend.source_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(trend.source_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Source
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Professional Analysis */}
          <Card className="border-stroke">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading-3">
                <Brain className="w-5 h-5 text-interactive" />
                Professional Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-primary text-text-primary leading-relaxed">
                {trend.description || trend.market_opportunity || trend.ai_summary || 'Detailed analysis pending...'}
              </p>
              
              {trend.target_audience && (
                <div>
                  <h4 className="text-body-secondary font-medium text-text-primary mb-2">Target Audience</h4>
                  <p className="text-body-secondary text-text-secondary">{trend.target_audience}</p>
                </div>
              )}
              
              {trend.technical_requirements && (
                <div>
                  <h4 className="text-body-secondary font-medium text-text-primary mb-2">Technical Requirements</h4>
                  <p className="text-body-secondary text-text-secondary">{trend.technical_requirements}</p>
                </div>
              )}
              
              {trend.competitive_landscape && (
                <div>
                  <h4 className="text-body-secondary font-medium text-text-primary mb-2">Competitive Landscape</h4>
                  <p className="text-body-secondary text-text-secondary">{trend.competitive_landscape}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-stroke">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-interactive" />
                  <span className={`text-heading-3 font-semibold ${getScoreColor(trend.overall_relevance_score || 0)}`}>
                    {Math.round((trend.overall_relevance_score || 0) * 100)}%
                  </span>
                </div>
                <p className="text-body-secondary text-text-secondary">Professional Relevance</p>
              </CardContent>
            </Card>
            
            {trend.business_viability_score && (
              <Card className="border-stroke">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    <span className={`text-heading-3 font-semibold ${getScoreColor(trend.business_viability_score)}`}>
                      {Math.round(trend.business_viability_score * 100)}%
                    </span>
                  </div>
                  <p className="text-body-secondary text-text-secondary">Business Viability</p>
                </CardContent>
              </Card>
            )}
            
            {trend.velocity_score && (
              <Card className="border-stroke">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-warning" />
                    <span className={`text-heading-3 font-semibold ${getScoreColor(trend.velocity_score)}`}>
                      {Math.round(trend.velocity_score * 100)}%
                    </span>
                  </div>
                  <p className="text-body-secondary text-text-secondary">Trend Velocity</p>
                </CardContent>
              </Card>
            )}
            
            {trend.technical_feasibility_score && (
              <Card className="border-stroke">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Lightbulb className="w-5 h-5 text-purple-400" />
                    <span className={`text-heading-3 font-semibold ${getScoreColor(trend.technical_feasibility_score)}`}>
                      {Math.round(trend.technical_feasibility_score * 100)}%
                    </span>
                  </div>
                  <p className="text-body-secondary text-text-secondary">Technical Feasibility</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Business Intelligence */}
          {(trend.business_model_potential || trend.monetization_potential || trend.market_size_estimate) && (
            <Card className="border-stroke">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-heading-3">
                  <DollarSign className="w-5 h-5 text-success" />
                  Business Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trend.business_model_potential && (
                  <div>
                    <h4 className="text-body-secondary font-medium text-text-primary mb-2">Business Model Potential</h4>
                    <p className="text-body-secondary text-text-secondary">{trend.business_model_potential}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trend.monetization_potential && (
                    <div className="p-3 bg-background rounded-lg border border-stroke">
                      <p className="text-caption text-text-secondary mb-1">Monetization Potential</p>
                      <p className="text-body-secondary font-medium text-text-primary capitalize">
                        {trend.monetization_potential}
                      </p>
                    </div>
                  )}
                  
                  {trend.market_size_estimate && (
                    <div className="p-3 bg-background rounded-lg border border-stroke">
                      <p className="text-caption text-text-secondary mb-1">Market Size</p>
                      <p className="text-body-secondary font-medium text-text-primary capitalize">
                        {trend.market_size_estimate}
                      </p>
                    </div>
                  )}
                  
                  {trend.implementation_complexity && (
                    <div className="p-3 bg-background rounded-lg border border-stroke">
                      <p className="text-caption text-text-secondary mb-1">Implementation Complexity</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < (trend.implementation_complexity || 3) 
                                ? 'text-warning fill-current' 
                                : 'text-text-secondary'
                            }`} 
                          />
                        ))}
                        <span className="text-caption text-text-secondary ml-1">
                          ({trend.implementation_complexity || 3}/5)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Professional Keywords */}
          {trend.professional_keywords && trend.professional_keywords.length > 0 && (
            <Card className="border-stroke">
              <CardHeader>
                <CardTitle className="text-heading-3">Professional Keywords</CardTitle>
                <CardDescription>
                  Key terms and concepts identified in this opportunity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trend.professional_keywords.map((keyword: string, index: number) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="text-caption bg-background text-text-secondary border-stroke"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Engagement and Source Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            {(trend.like_count > 0 || trend.retweet_count > 0 || trend.comments > 0 || trend.reactions > 0) && (
              <Card className="border-stroke">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-heading-3">
                    <Users className="w-5 h-5 text-interactive" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trend.like_count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body-secondary text-text-secondary">Likes</span>
                      <span className="text-body-secondary font-medium text-text-primary">{trend.like_count}</span>
                    </div>
                  )}
                  {trend.retweet_count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body-secondary text-text-secondary">Retweets</span>
                      <span className="text-body-secondary font-medium text-text-primary">{trend.retweet_count}</span>
                    </div>
                  )}
                  {trend.comments > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body-secondary text-text-secondary">Comments</span>
                      <span className="text-body-secondary font-medium text-text-primary">{trend.comments}</span>
                    </div>
                  )}
                  {trend.reactions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-body-secondary text-text-secondary">Reactions</span>
                      <span className="text-body-secondary font-medium text-text-primary">{trend.reactions}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Source Information */}
            <Card className="border-stroke">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-heading-3">
                  <Clock className="w-5 h-5 text-text-secondary" />
                  Source Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-body-secondary text-text-secondary">Platform</span>
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(trend.source_platform)}
                    <span className="text-body-secondary font-medium text-text-primary capitalize">
                      {trend.source_platform?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-secondary text-text-secondary">Discovered</span>
                  <span className="text-body-secondary font-medium text-text-primary">
                    {formatDate(trend.created_at)}
                  </span>
                </div>
                {trend.author_username && (
                  <div className="flex justify-between">
                    <span className="text-body-secondary text-text-secondary">Author</span>
                    <span className="text-body-secondary font-medium text-text-primary">
                      @{trend.author_username}
                    </span>
                  </div>
                )}
                {trend.cross_platform_mentions && (
                  <div className="flex justify-between">
                    <span className="text-body-secondary text-text-secondary">Cross-Platform Mentions</span>
                    <span className="text-body-secondary font-medium text-success">
                      {trend.cross_platform_mentions} platforms
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}