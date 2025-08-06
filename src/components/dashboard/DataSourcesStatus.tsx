import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  GitBranch,
  TrendingUp,
  MessageCircle,
  Smartphone,
  CheckCircle,
  Clock
} from 'lucide-react'

const DATA_SOURCES = [
  {
    name: 'Hacker News Enhanced',
    icon: MessageCircle,
    description: 'Ask HN and Show HN posts with pain point extraction',
    color: 'text-orange-400'
  },
  {
    name: 'Google Trends',
    icon: TrendingUp,
    description: 'Rising search trends and momentum analysis',
    color: 'text-blue-400'
  },
  {
    name: 'GitHub Issues',
    icon: GitBranch,
    description: 'Feature requests and enhancement issues',
    color: 'text-purple-400'
  },
  {
    name: 'App Store Reviews',
    icon: Smartphone,
    description: 'Low-rated reviews with missing features',
    color: 'text-green-400'
  }
]

export function DataSourcesStatus() {
  const { data: trendsData } = useQuery({
    queryKey: ['google-trends-data'],
    queryFn: () => api.getGoogleTrendsData(5)
  })

  const { data: githubData } = useQuery({
    queryKey: ['github-issues-data'],
    queryFn: () => api.getGitHubIssuesData(5)
  })

  // Calculate status based on recent data
  const getSourceStatus = (sourceName: string) => {
    switch (sourceName) {
      case 'Google Trends':
        return trendsData && trendsData.length > 0 ? 'active' : 'inactive'
      case 'GitHub Issues':
        return githubData && githubData.length > 0 ? 'active' : 'inactive'
      default:
        return 'active' // Default for HN and App Store
    }
  }

  const getLastSync = (sourceName: string) => {
    switch (sourceName) {
      case 'Google Trends':
      case 'GitHub Issues':
        return 'Sync on next intelligence run'
      default:
        return '< 1 hour ago'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-primary" />
          <span>Multi-Source Data Collection</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA_SOURCES.map((source) => {
            const Icon = source.icon
            const status = getSourceStatus(source.name)
            const lastSync = getLastSync(source.name)
            
            return (
              <div key={source.name} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${source.color}`} />
                    <h4 className="font-medium text-white">{source.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status === 'active' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <Badge variant="default" className="text-xs bg-green-600">
                          Active
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {source.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last sync:</span>
                  <span className="text-gray-400">{lastSync}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}