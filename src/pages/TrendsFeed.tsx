import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import {
  Filter,
  Search,
  TrendingUp,
  Activity,
  X,
  Github,
  MessageSquare,
  Zap,
  AlertCircle
} from 'lucide-react'
import { ProfessionalTrendCard } from '@/components/features/trends/ProfessionalTrendCard'
import { FilterPanel } from '@/components/features/trends/FilterPanel'
import { TrendDetailModal } from '@/components/features/trends/TrendDetailModal'

interface FilterState {
  sources: string[]
  dateRange: string
  relevanceMin: number
  sortBy: string
  searchQuery: string
}

const initialFilters: FilterState = {
  sources: ['twitter', 'hacker_news', 'github', 'google_trends'],
  dateRange: '7d',
  relevanceMin: 0.1, // Lower threshold to show more data
  sortBy: 'relevance',
  searchQuery: ''
}

export function TrendsFeed() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState<any>(null)

  const { data: trends, isLoading, error } = useQuery({
    queryKey: ['professional-trends', filters],
    queryFn: () => api.getProfessionalTrends(filters),
    refetchInterval: 30000 // Refresh every 30 seconds for real-time feel
  })

  const { data: correlations } = useQuery({
    queryKey: ['trend-correlations'],
    queryFn: () => api.getTrendCorrelations()
  })

  const filteredTrends = useMemo(() => {
    if (!trends) return []
    
    return trends.filter(trend => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesSearch = 
          trend.title?.toLowerCase().includes(query) ||
          trend.description?.toLowerCase().includes(query) ||
          trend.professional_keywords?.some((keyword: string) => 
            keyword.toLowerCase().includes(query)
          )
        if (!matchesSearch) return false
      }
      
      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(trend.source_platform)) {
        return false
      }
      
      // Relevance filter
      if (trend.overall_relevance_score < filters.relevanceMin) {
        return false
      }
      
      // Date range filter
      const trendDate = new Date(trend.created_at)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - trendDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (filters.dateRange) {
        case '24h': return daysDiff <= 1
        case '7d': return daysDiff <= 7
        case '30d': return daysDiff <= 30
        default: return true
      }
    })
  }, [trends, filters])

  const sortedTrends = useMemo(() => {
    if (!filteredTrends) return []
    
    return [...filteredTrends].sort((a, b) => {
      switch (filters.sortBy) {
        case 'relevance':
          return (b.overall_relevance_score || 0) - (a.overall_relevance_score || 0)
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'velocity':
          return (b.velocity_score || 0) - (a.velocity_score || 0)
        case 'engagement':
          return (b.engagement_score || 0) - (a.engagement_score || 0)
        default:
          return 0
      }
    })
  }, [filteredTrends, filters.sortBy])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <ProfessionalTrendsHeader />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProfessionalTrendCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertCircle className="w-5 h-5" />
              Error Loading Trends
            </CardTitle>
            <CardDescription>
              Unable to load the professional trends feed. Please try refreshing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-text-primary font-semibold">
            Trends Feed
          </h1>
          <p className="text-body-secondary text-text-secondary mt-1">
            Live cross-platform intelligence with professional filtering and analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-caption text-text-secondary">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="font-medium">{sortedTrends?.length || 0} trends</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-interactive/10 border-interactive' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Professional Search Bar */}
      <Card className="border-stroke">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Search trends, keywords, or business opportunities..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10 text-body-secondary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Cross-Platform Correlations */}
      {correlations && correlations.length > 0 && (
        <Card className="border-interactive/20 bg-interactive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-heading-3">
              <Zap className="w-5 h-5 text-interactive" />
              Cross-Platform Correlations
            </CardTitle>
            <CardDescription>
              Trends validated across multiple platforms with high confidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {correlations.slice(0, 3).map((correlation) => (
                <div key={correlation.id} className="p-4 bg-surface rounded-lg border border-stroke">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-body-primary font-medium text-text-primary truncate">
                      {correlation.trend_topic}
                    </h4>
                    <Badge variant="outline" className="text-caption bg-success/10 text-success border-success/20">
                      {correlation.platforms?.length || 0} platforms
                    </Badge>
                  </div>
                  <p className="text-caption text-text-secondary mb-3 line-clamp-2">
                    {correlation.ai_summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {correlation.platforms?.map((platform: string) => (
                        <PlatformIcon key={platform} platform={platform} className="w-4 h-4" />
                      ))}
                    </div>
                    <span className="text-caption text-text-secondary">
                      {correlation.mention_volume} mentions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Trends Feed */}
      <div className="space-y-4">
        {sortedTrends && sortedTrends.length > 0 ? (
          sortedTrends.map((trend) => (
            <ProfessionalTrendCard
              key={trend.id}
              trend={trend}
              onClick={() => setSelectedTrend(trend)}
            />
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-heading-3 text-text-primary mb-2">No trends found</h3>
                  <p className="text-body-secondary text-text-secondary max-w-md">
                    Try adjusting your filters or search query to find relevant trends and opportunities.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setFilters(initialFilters)}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trend Detail Modal */}
      {selectedTrend && (
        <TrendDetailModal
          trend={selectedTrend}
          open={!!selectedTrend}
          onClose={() => setSelectedTrend(null)}
        />
      )}
    </div>
  )
}

// Professional Trend Card Skeleton
function ProfessionalTrendCardSkeleton() {
  return (
    <Card className="border-stroke">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <div className="w-16 h-6 bg-muted rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-muted rounded"></div>
              <div className="w-16 h-6 bg-muted rounded"></div>
            </div>
            <div className="w-20 h-4 bg-muted rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Platform Icon Component
function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const iconProps = { className }
  
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return <X {...iconProps} />
    case 'github':
      return <Github {...iconProps} />
    case 'hacker_news':
      return <MessageSquare {...iconProps} />
    case 'google_trends':
      return <TrendingUp {...iconProps} />
    default:
      return <Activity {...iconProps} />
  }
}

// Professional Trends Header Component
function ProfessionalTrendsHeader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="flex gap-3">
          <div className="w-20 h-8 bg-muted rounded"></div>
          <div className="w-24 h-8 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}