import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { formatScore, getScoreBadgeVariant, truncateText } from '@/lib/utils'
import { Link } from 'react-router-dom'
import {
  ExternalLink,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  ChevronRight,
  Award
} from 'lucide-react'
import type { TopIdea } from '@/lib/database.types'

interface TopIdeasSectionProps {
  topIdeas: TopIdea[]
}

export function TopIdeasSection({ topIdeas }: TopIdeasSectionProps) {
  if (!topIdeas || topIdeas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Top 15 Startup Ideas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No top ideas available. Run the analysis to generate rankings.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-primary" />
          <span>Top 15 Startup Ideas</span>
          <Badge variant="outline" className="ml-auto">
            {topIdeas.length} ideas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topIdeas.map((idea) => (
            <div
              key={idea.id}
              className="group p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-all hover:bg-gray-800/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white font-bold text-sm">
                    {idea.rank}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {truncateText(idea.description, 120)}
                    </p>
                  </div>
                </div>
                <Badge variant={getScoreBadgeVariant(idea.overall_score)} className="text-sm font-bold">
                  {formatScore(idea.overall_score)}
                </Badge>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-xs text-gray-500">Market</div>
                    <div className="text-sm font-medium text-white">
                      {formatScore(idea.market_score)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs text-gray-500">Competition</div>
                    <div className="text-sm font-medium text-white">
                      {formatScore(idea.competition_score)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-xs text-gray-500">Development</div>
                    <div className="text-sm font-medium text-white">
                      {formatScore(idea.development_score)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-xs text-gray-500">ROI</div>
                    <div className="text-sm font-medium text-white">
                      {formatScore(idea.roi_score)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {idea.category}
                  </Badge>
                  {idea.industry && (
                    <Badge variant="secondary" className="text-xs">
                      {idea.industry}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {idea.source_platform}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {idea.source_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={idea.source_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Link to={`/idea/${idea.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}