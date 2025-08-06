import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { formatScore, getScoreBadgeVariant, truncateText } from '@/lib/utils'
import { Link } from 'react-router-dom'
import {
  Star,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'
import type { SpecialMention } from '@/lib/database.types'

interface SpecialMentionsSectionProps {
  specialMentions: SpecialMention[]
}

function getReasonIcon(reason: string) {
  if (reason.includes('Market')) return TrendingUp
  if (reason.includes('ROI')) return Target
  if (reason.includes('Development')) return Zap
  if (reason.includes('Competition')) return Target
  return Award
}

function getReasonColor(reason: string) {
  if (reason.includes('Market')) return 'text-green-400'
  if (reason.includes('ROI')) return 'text-blue-400'
  if (reason.includes('Development')) return 'text-purple-400'
  if (reason.includes('Competition')) return 'text-orange-400'
  return 'text-yellow-400'
}

export function SpecialMentionsSection({ specialMentions }: SpecialMentionsSectionProps) {
  if (!specialMentions || specialMentions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-accent" />
            <span>Special Mentions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No special mentions available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-accent" />
          <span>Special Mentions</span>
          <Badge variant="outline" className="ml-auto">
            {specialMentions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {specialMentions.map((mention) => {
            const ReasonIcon = getReasonIcon(mention.reason)
            const reasonColor = getReasonColor(mention.reason)
            
            return (
              <div
                key={mention.id}
                className="group p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-all hover:bg-gray-800/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white group-hover:text-primary transition-colors">
                      {mention.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {truncateText(mention.description, 80)}
                    </p>
                  </div>
                  <Badge variant={getScoreBadgeVariant(mention.overall_score)} className="ml-2">
                    {formatScore(mention.overall_score)}
                  </Badge>
                </div>

                {/* Reason */}
                <div className="flex items-center space-x-2 mb-3">
                  <ReasonIcon className={`w-4 h-4 ${reasonColor}`} />
                  <span className="text-sm font-medium text-gray-300">
                    {mention.reason}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Market</div>
                      <div className={`text-sm font-medium ${mention.market_score >= 80 ? 'text-green-400' : 'text-gray-300'}`}>
                        {formatScore(mention.market_score)}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-700"></div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Category</div>
                      <div className="text-sm font-medium text-gray-300">
                        {mention.category}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <Link to={`/idea/${mention.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <div>
              <h4 className="text-sm font-medium text-white">
                Strategic Opportunities
              </h4>
              <p className="text-xs text-gray-400">
                These ideas show exceptional potential in specific areas and warrant special consideration.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}