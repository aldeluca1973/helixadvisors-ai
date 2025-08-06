import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { formatScore, formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  ExternalLink,
  Target,
  Building,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function IdeaDetails() {
  const { ideaId } = useParams<{ ideaId: string }>()
  
  const { data: ideaDetails, isLoading, error } = useQuery({
    queryKey: ['idea-details', ideaId],
    queryFn: () => api.getIdeaDetails(ideaId!),
    enabled: !!ideaId
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-700 rounded animate-skeleton"></div>
          <div className="h-8 bg-gray-700 rounded w-1/3 animate-skeleton"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded w-1/4 animate-skeleton"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded animate-skeleton"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 animate-skeleton"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !ideaDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Idea Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Unable to load the idea details. The idea might not exist or there was an error.
            </p>
            <Link to="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { idea, analysis, competitors } = ideaDetails

  // Chart data for score breakdown
  const scoreData = [
    { name: 'Market', score: idea.market_score, color: '#10B981' },
    { name: 'Competition', score: idea.competition_score, color: '#3B82F6' },
    { name: 'Development', score: idea.development_score, color: '#F97316' },
    { name: 'ROI', score: idea.roi_score, color: '#8B5CF6' }
  ]

  // TAM/SAM/SOM data
  const marketSizeData = analysis ? [
    { name: 'TAM', value: analysis.tam_size || 0, color: '#10B981' },
    { name: 'SAM', value: analysis.sam_size || 0, color: '#3B82F6' },
    { name: 'SOM', value: analysis.som_size || 0, color: '#F97316' }
  ] : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        {idea.source_url && (
          <Button variant="outline" asChild>
            <a href={idea.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Source
            </a>
          </Button>
        )}
      </div>

      {/* Idea Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white mb-2">
                {idea.title}
              </CardTitle>
              <p className="text-gray-300 leading-relaxed">
                {idea.description}
              </p>
              <div className="flex items-center space-x-3 mt-4">
                <Badge variant="outline">{idea.category}</Badge>
                {idea.industry && <Badge variant="secondary">{idea.industry}</Badge>}
                <Badge variant="outline">{idea.source_platform}</Badge>
                <span className="text-sm text-gray-400">
                  Discovered {formatDate(idea.discovered_at)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">
                {formatScore(idea.overall_score)}
              </div>
              <div className="text-sm text-gray-400">Overall Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Score Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {scoreData.map((score) => (
                <div key={score.name} className="text-center">
                  <div className={`text-2xl font-bold mb-1`} style={{ color: score.color }}>
                    {formatScore(score.score)}
                  </div>
                  <div className="text-sm text-gray-400">{score.name}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Size Analysis */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Market Size Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketSizeData.map((market) => (
                  <div key={market.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: market.color }}></div>
                      <span className="text-sm font-medium text-gray-300">{market.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(market.value)}
                    </span>
                  </div>
                ))}
              </div>
              {analysis.growth_projection && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Projected Growth</span>
                    <span className="text-sm font-bold text-green-400">
                      {analysis.growth_projection}% annually
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Analysis */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {analysis.market_analysis_text}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="text-lg font-bold text-white">
                      {analysis.competitor_count || 0}
                    </div>
                    <div className="text-xs text-gray-400">Competitors</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="text-lg font-bold text-white">
                      {analysis.market_saturation_level || 'Medium'}
                    </div>
                    <div className="text-xs text-gray-400">Saturation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Development & ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="text-lg font-bold text-white">
                      {analysis.estimated_cost ? formatCurrency(analysis.estimated_cost) : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">Est. Development Cost</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="text-lg font-bold text-white">
                      {analysis.time_to_market_months || 'N/A'} months
                    </div>
                    <div className="text-xs text-gray-400">Time to Market</div>
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Revenue Model</div>
                  <div className="text-sm text-gray-300">
                    {analysis.revenue_model || 'Not specified'}
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Complexity</div>
                  <div className="text-sm text-gray-300">
                    {analysis.development_complexity || 'Medium'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitors */}
      {competitors && competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-primary" />
              <span>Competitive Landscape</span>
              <Badge variant="outline">{competitors.length} competitors</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{competitor.competitor_name}</h4>
                      {competitor.competitor_url && (
                        <a 
                          href={competitor.competitor_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline"
                        >
                          {competitor.competitor_url}
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      {competitor.market_share && (
                        <div className="text-lg font-bold text-white">
                          {competitor.market_share}%
                        </div>
                      )}
                      <div className="text-xs text-gray-400">Market Share</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {competitor.funding_amount && (
                      <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-sm font-bold text-white">
                          {formatCurrency(competitor.funding_amount)}
                        </div>
                        <div className="text-xs text-gray-400">Funding</div>
                      </div>
                    )}
                    {competitor.founded_year && (
                      <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-sm font-bold text-white">
                          {competitor.founded_year}
                        </div>
                        <div className="text-xs text-gray-400">Founded</div>
                      </div>
                    )}
                    {competitor.employee_count && (
                      <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-sm font-bold text-white">
                          {formatNumber(competitor.employee_count)}
                        </div>
                        <div className="text-xs text-gray-400">Employees</div>
                      </div>
                    )}
                    {competitor.website_traffic && (
                      <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-sm font-bold text-white">
                          {formatNumber(competitor.website_traffic)}
                        </div>
                        <div className="text-xs text-gray-400">Monthly Traffic</div>
                      </div>
                    )}
                  </div>
                  {(competitor.strengths || competitor.weaknesses) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {competitor.strengths && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-gray-300">Strengths</span>
                          </div>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {Array.isArray(competitor.strengths) 
                              ? competitor.strengths.map((strength: any, index: number) => (
                                  <li key={index}>• {strength}</li>
                                ))
                              : <li>• {competitor.strengths}</li>
                            }
                          </ul>
                        </div>
                      )}
                      {competitor.weaknesses && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-gray-300">Weaknesses</span>
                          </div>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {Array.isArray(competitor.weaknesses) 
                              ? competitor.weaknesses.map((weakness: any, index: number) => (
                                  <li key={index}>• {weakness}</li>
                                ))
                              : <li>• {competitor.weaknesses}</li>
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {analysis?.risk_factors && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              <span>Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analysis.risk_factors).map(([key, value]) => {
                const riskLevel = String(value).toLowerCase()
                const riskColor = riskLevel === 'low' ? 'text-green-400' : 
                                 riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                const bgColor = riskLevel === 'low' ? 'bg-green-400/10' : 
                               riskLevel === 'medium' ? 'bg-yellow-400/10' : 'bg-red-400/10'
                
                return (
                  <div key={key} className={`p-3 rounded-lg ${bgColor}`}>
                    <div className={`text-sm font-bold ${riskColor} capitalize`}>
                      {String(value)}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {key.replace('_', ' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}