import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { formatDate } from '@/lib/utils'
import {
  BarChart3,
  PieChart,
  Tag,
  Activity,
  Filter
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts'
import { useState } from 'react'

const COLORS = ['#4F46E5', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#3B82F6']

export function HistoricalTrends() {
  const [timeRange, setTimeRange] = useState(30)
  
  const { data: trends, isLoading } = useQuery({
    queryKey: ['historical-trends', timeRange],
    queryFn: () => api.getHistoricalTrends(timeRange)
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/3 animate-skeleton"></div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded w-1/4 animate-skeleton"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-700 rounded animate-skeleton"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>No Historical Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Historical trend data will be available after the system has been running for a few days.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Process data for charts
  const categoryTrends = trends.filter(t => t.category)
  const industryTrends = trends.filter(t => t.industry)
  
  // Group by date for timeline chart
  const timelineData = trends.reduce((acc: any[], trend) => {
    const date = trend.trend_date
    const existing = acc.find(item => item.date === date)
    
    if (existing) {
      existing.avgScore = (existing.avgScore + (trend.avg_score || 0)) / 2
      existing.totalIdeas += trend.idea_count || 0
    } else {
      acc.push({
        date,
        avgScore: trend.avg_score || 0,
        totalIdeas: trend.idea_count || 0,
        formattedDate: formatDate(date)
      })
    }
    
    return acc
  }, [])

  // Category distribution
  const categoryData = categoryTrends.reduce((acc: any[], trend) => {
    const existing = acc.find(item => item.name === trend.category)
    
    if (existing) {
      existing.value += trend.idea_count || 0
      existing.avgScore = (existing.avgScore + (trend.avg_score || 0)) / 2
    } else {
      acc.push({
        name: trend.category,
        value: trend.idea_count || 0,
        avgScore: trend.avg_score || 0
      })
    }
    
    return acc
  }, [])

  // Industry performance
  const industryData = industryTrends.reduce((acc: any[], trend) => {
    const existing = acc.find(item => item.name === trend.industry)
    
    if (existing) {
      existing.ideas += trend.idea_count || 0
      existing.avgScore = (existing.avgScore + (trend.avg_score || 0)) / 2
    } else {
      acc.push({
        name: trend.industry,
        ideas: trend.idea_count || 0,
        avgScore: trend.avg_score || 0
      })
    }
    
    return acc
  }, [])

  // Top trending keywords
  const allKeywords = trends.flatMap(trend => 
    trend.trending_keywords ? Object.values(trend.trending_keywords as Record<string, any>) : []
  )
  
  const keywordCounts = allKeywords.reduce((acc: Record<string, number>, keyword: any) => {
    if (keyword && keyword.word) {
      acc[keyword.word] = (acc[keyword.word] || 0) + (keyword.count || 1)
    }
    return acc
  }, {})
  
  const topKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Historical Trends & Analysis</h1>
          <p className="text-gray-400 mt-1">
            Tracking startup idea patterns and market evolution over time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {trends.reduce((sum, t) => sum + (t.idea_count || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Ideas in {timeRange} days</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(trends.reduce((sum, t) => sum + (t.avg_score || 0), 0) / trends.length).toFixed(1)}
            </div>
            <div className="text-xs text-green-400">+2.3% from previous period</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Set(categoryTrends.map(t => t.category)).size}
            </div>
            <div className="text-xs text-gray-500">Active categories</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Top Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white truncate">
              {industryData.sort((a, b) => b.ideas - a.ideas)[0]?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Most active sector</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Score & Volume Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgScore" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Avg Score"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="totalIdeas" 
                stroke="#3B82F6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Total Ideas"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-primary" />
              <span>Category Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryData.slice(0, 6).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-gray-300">{category.name}</span>
                    </div>
                    <div className="text-white font-medium">{category.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Industry Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={industryData.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="avgScore" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trending Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-primary" />
            <span>Trending Keywords</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {topKeywords.map((keyword, index) => (
              <div key={keyword.word} className="text-center">
                <Badge 
                  variant={index < 3 ? 'default' : 'outline'} 
                  className="w-full justify-center py-2"
                >
                  {keyword.word}
                </Badge>
                <div className="text-xs text-gray-400 mt-1">
                  {String(keyword.count)} mentions
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}