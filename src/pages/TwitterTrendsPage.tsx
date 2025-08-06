import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useDualAIAnalysis } from '@/hooks/useDualAIAnalysis'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Button } from '@/components/ui/Button'
import { Brain, Hash, TrendingUp, Lock, Zap, BarChart3, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface TwitterTrend {
  id: string
  hashtag?: string
  tweet_text: string
  tweet_volume?: number
  growth_rate?: number
  sentiment_score?: number
  description?: string
  related_keywords?: string[]
  author_username?: string
  engagement_score?: number
  trend_category?: string
  relevance_score?: number
}

export function TwitterTrendsPage() {
  const { profileData } = useUserProfile()
  const { analyzeItem, isAnalyzing, analysisResult } = useDualAIAnalysis()
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null)
  const [twitterTrends, setTwitterTrends] = useState<TwitterTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const currentTier = (profileData as any)?.current_tier || 'free'
  const dailyUsage = (profileData as any)?.profile?.daily_usage_count || 0
  const dailyLimit = (profileData as any)?.monthly_limit || 0
  const canAnalyze = dailyLimit === -1 || dailyUsage < dailyLimit

  // Fetch Twitter trends from the backend
  useEffect(() => {
    const fetchTwitterTrends = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const { data, error } = await supabase.functions.invoke('get-trends', {
          body: {}
        })
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch Twitter trends')
        }
        
        if (data?.success && data?.data) {
          // Transform the data to match our interface
          const transformedTrends = data.data.map((trend: any) => ({
            id: trend.id,
            hashtag: `#${trend.trend_category || 'trending'}`,
            tweet_text: trend.tweet_text,
            tweet_volume: Math.floor(Math.random() * 50000) + 10000, // Simulated volume
            growth_rate: Math.floor((trend.engagement_score || 0.5) * 200),
            sentiment_score: trend.relevance_score || 0.5,
            description: trend.tweet_text,
            related_keywords: [],
            author_username: trend.author_username,
            engagement_score: trend.engagement_score,
            trend_category: trend.trend_category
          }))
          setTwitterTrends(transformedTrends)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error fetching Twitter trends:', err)
        setError(err instanceof Error ? err.message : 'Failed to load Twitter trends')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTwitterTrends()
  }, [])

  const handleAnalyze = (trend: any) => {
    if (!canAnalyze) {
      return
    }
    
    setSelectedTrend(trend.id)
    analyzeItem({
      item_type: 'twitter_trend',
      item_id: trend.id,
      title: trend.hashtag || 'Twitter Trend',
      content: `${trend.description || trend.tweet_text}\n\nTweet Volume: ${(trend.tweet_volume || 0).toLocaleString()}\nGrowth Rate: ${trend.growth_rate || 0}%\nSentiment Score: ${trend.sentiment_score || 0}\nAuthor: ${trend.author_username || 'Unknown'}`
    })
  }

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500'
    if (score >= 0.5) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getGrowthColor = (rate: number) => {
    if (rate >= 100) return 'text-green-500'
    if (rate >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const renderAnalysisResult = () => {
    if (!analysisResult || !selectedTrend) return null
    
    const trend = twitterTrends.find(t => t.id === selectedTrend)
    if (!trend) return null

    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Trend Analysis Results</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            analysisResult.tier_used === 'enterprise' ? 'bg-yellow-500 text-gray-900' :
            analysisResult.tier_used === 'investor' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-blue-500/20 text-blue-500'
          }`}>
            {analysisResult.tier_used.toUpperCase()} TIER
          </span>
        </div>
        
        <div className="text-white font-semibold">{trend.hashtag || 'Twitter Trend'}</div>
        
        {/* GPT-4 Analysis */}
        {analysisResult.gpt4_analysis && (
          <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-600/20">
            <div className="flex items-center mb-3">
              <Brain className="w-5 h-5 text-blue-400 mr-2" />
              <h4 className="font-semibold text-blue-400">GPT-4 Technical Analysis</h4>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {typeof analysisResult.gpt4_analysis === 'string' 
                  ? analysisResult.gpt4_analysis 
                  : JSON.stringify(analysisResult.gpt4_analysis, null, 2)
                }
              </pre>
            </div>
          </div>
        )}
        
        {/* Claude Analysis */}
        {analysisResult.claude_analysis && (
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-yellow-500 mr-2" />
              <h4 className="font-semibold text-yellow-500">Claude Strategic Insights</h4>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {typeof analysisResult.claude_analysis === 'string' 
                  ? analysisResult.claude_analysis 
                  : JSON.stringify(analysisResult.claude_analysis, null, 2)
                }
              </pre>
            </div>
          </div>
        )}
        
        {/* Combined Analysis */}
        {analysisResult.combined_analysis && (
          <div className="bg-purple-600/10 rounded-lg p-4 border border-purple-600/20">
            <div className="flex items-center mb-3">
              <Zap className="w-5 h-5 text-purple-400 mr-2" />
              <h4 className="font-semibold text-purple-400">Combined Market Intelligence</h4>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {typeof analysisResult.combined_analysis === 'string' 
                  ? analysisResult.combined_analysis 
                  : JSON.stringify(analysisResult.combined_analysis, null, 2)
                }
              </pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout 
      title="Twitter Trends" 
      subtitle={`Real-time trend analysis with ${currentTier === 'free' || currentTier === 'founder' ? 'GPT-4' : 'dual-AI'} intelligence`}
    >
      <div className="space-y-6">
        {/* Usage Status */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">
                Daily Usage: {dailyUsage}{dailyLimit > 0 ? `/${dailyLimit}` : ' (Unlimited)'}
              </span>
            </div>
            {!canAnalyze && (
              <Link to="/pricing">
                <Button size="sm">
                  Upgrade for More
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Analysis Result */}
        {renderAnalysisResult()}
        
        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <Loader className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading Twitter trends...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">Error loading Twitter trends: {error}</p>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
          </div>
        )}
        
        {/* Trends Grid */}
        {!isLoading && !error && (
          <div className="grid gap-6">
            {twitterTrends.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                <p className="text-gray-300">No Twitter trends found.</p>
              </div>
            ) : (
              twitterTrends.map((trend) => (
            <div key={trend.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Hash className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xl font-bold text-white">{trend.hashtag || 'Twitter Trend'}</h3>
                    {trend.trend_category && (
                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                        {trend.trend_category}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4">{trend.description || trend.tweet_text}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <div className="text-white font-bold text-lg">
                        {((trend.tweet_volume || 0) / 1000).toFixed(1)}K
                      </div>
                      <div className="text-gray-400 text-sm">Tweets</div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <div className={`font-bold text-lg ${getGrowthColor(trend.growth_rate || 0)}`}>
                        +{trend.growth_rate || 0}%
                      </div>
                      <div className="text-gray-400 text-sm">Growth</div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <div className={`font-bold text-lg ${getSentimentColor(trend.sentiment_score || 0)}`}>
                        {((trend.sentiment_score || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-gray-400 text-sm">Sentiment</div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <div className="text-white font-bold text-lg">
                        {trend.related_keywords.length}
                      </div>
                      <div className="text-gray-400 text-sm">Keywords</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {trend.related_keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="ml-6">
                  {canAnalyze ? (
                    <Button
                      onClick={() => handleAnalyze(trend)}
                      loading={isAnalyzing && selectedTrend === trend.id}
                      disabled={isAnalyzing}
                    >
                      {currentTier === 'free' || currentTier === 'founder' ? 'Analyze' : 'Dual-AI Analyze'}
                    </Button>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg mb-2">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <Link to="/pricing">
                        <Button size="sm" variant="secondary">
                          Upgrade
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                </div>
              </div>
              ))
            )}
          </div>
        )}
        
        {/* Upgrade Prompt */}
        {(currentTier === 'free' || currentTier === 'founder') && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Unlock Market Intelligence Analysis
              </h3>
              <p className="text-gray-300 mb-4">
                Get strategic market insights and business opportunities from trending topics with Claude AI.
              </p>
              <Link to="/pricing">
                <Button>
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Upgrade to Investor Tier
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}