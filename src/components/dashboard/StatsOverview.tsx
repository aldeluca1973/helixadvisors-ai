import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface StatsOverviewProps {
  totalIdeas: number
  topIdeasCount: number
  specialMentionsCount: number
  reportDate: string
}

export function StatsOverview({ 
  totalIdeas, 
  topIdeasCount, 
  specialMentionsCount, 
  reportDate 
}: StatsOverviewProps) {
  const stats = [
    {
      title: 'Total Ideas Analyzed',
      value: totalIdeas,
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      change: '+12% from yesterday'
    },
    {
      title: 'Top Ranked Ideas',
      value: topIdeasCount,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      change: 'Daily top 15'
    },
    {
      title: 'Special Mentions',
      value: specialMentionsCount,
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      change: 'Strategic opportunities'
    },
    {
      title: 'Analysis Date',
      value: formatDate(reportDate),
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      change: 'Latest report'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="transition-all hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}