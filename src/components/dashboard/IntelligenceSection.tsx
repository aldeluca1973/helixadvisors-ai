import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  Brain,
  TrendingUp,
  MessageCircle,
  BarChart4,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react'

export function IntelligenceSection() {
  const queryClient = useQueryClient()

  const { data: crossValidationData, isLoading: crossValidationLoading } = useQuery({
    queryKey: ['cross-validation-data'],
    queryFn: api.getCrossValidationData
  })

  const { data: sentimentTrends, isLoading: sentimentLoading } = useQuery({
    queryKey: ['sentiment-trends'],
    queryFn: () => api.getSentimentTrends(7)
  })

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['google-trends-data'],
    queryFn: () => api.getGoogleTrendsData(10)
  })

  const triggerIntelligenceMutation = useMutation({
    mutationFn: api.triggerMultiSourceIntelligence,
    onSuccess: () => {
      toast({
        title: 'Intelligence Analysis Started',
        description: `Analyzing painpoints from multiple sources...`,
      })
      
      // Refetch all intelligence data after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cross-validation-data'] })
        queryClient.invalidateQueries({ queryKey: ['sentiment-trends'] })
        queryClient.invalidateQueries({ queryKey: ['google-trends-data'] })
      }, 5000)
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to trigger intelligence analysis',
        variant: 'destructive'
      })
    }
  })

  const handleTriggerIntelligence = () => {
    triggerIntelligenceMutation.mutate()
  }

  return (
    <div className="space-y-6">
      {/* Intelligence Header */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-400" />
              <span>Multi-Source Intelligence</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                AI-Powered
              </Badge>
            </div>
            <Button 
              onClick={handleTriggerIntelligence}
              disabled={triggerIntelligenceMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {triggerIntelligenceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Intelligence Analysis
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">
            Comprehensive analysis across Hacker News, Google Trends, GitHub Issues, and App Store Reviews 
            with AI-powered sentiment analysis and cross-source validation.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cross-Validated Painpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Cross-Validated Painpoints</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {crossValidationLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : crossValidationData && crossValidationData.length > 0 ? (
              <div className="space-y-3">
                {crossValidationData.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant={item.cross_validation_score > 0.8 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {Math.round(item.cross_validation_score * 100)}% Validated
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.data_source_count} Sources
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          {Math.round(item.quality_score * 100)}
                        </div>
                        <div className="text-xs text-gray-400">Quality</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No cross-validated painpoints yet. Run intelligence analysis to discover them.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Analysis Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart4 className="w-5 h-5 text-purple-400" />
              <span>Sentiment Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sentimentLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : sentimentTrends && sentimentTrends.length > 0 ? (
              <div className="space-y-3">
                {sentimentTrends.slice(0, 5).map((item: any, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">
                          {item.startup_ideas?.title || 'Unknown'}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={item.frustration_intensity > 0.7 ? 'destructive' : 
                                   item.frustration_intensity > 0.4 ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {Math.round(item.frustration_intensity * 100)}% Frustration
                          </Badge>
                          <Badge 
                            variant={item.urgency_score > 0.7 ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {Math.round(item.urgency_score * 100)}% Urgent
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          item.sentiment_score < -0.5 ? 'text-red-400' :
                          item.sentiment_score < 0 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {item.sentiment_score > 0 ? '+' : ''}
                          {item.sentiment_score.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">Sentiment</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No sentiment analysis data yet. Run intelligence analysis to generate insights.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Google Trends Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span>Google Trends Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : trendsData && trendsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendsData.slice(0, 6).map((trend: any, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">
                      {trend.keyword}
                    </h4>
                    <Badge 
                      variant={trend.trend_direction === 'rising' ? 'default' : 
                             trend.trend_direction === 'falling' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {trend.trend_direction}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-400">
                        {trend.peak_interest}
                      </div>
                      <div className="text-xs text-gray-400">Peak Interest</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">
                        {Math.round(trend.momentum_score * 100)}
                      </div>
                      <div className="text-xs text-gray-400">Momentum</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No Google Trends data yet. Run intelligence analysis to discover trending painpoints.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}