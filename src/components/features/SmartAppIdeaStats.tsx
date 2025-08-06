import React from 'react';
import { SmartAppIdeaStats as StatsType } from '@/types/smart-app-ideas';
import { Card } from '@/components/ui/card';
import { Clock, Code, DollarSign, Sparkles } from 'lucide-react';

interface SmartAppIdeaStatsProps {
  stats: StatsType;
}

export const SmartAppIdeaStats: React.FC<SmartAppIdeaStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Opportunities */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.total_opportunities}</div>
            <div className="text-sm text-gray-400">Smart Ideas Found</div>
          </div>
        </div>
      </Card>

      {/* New This Week */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.new_this_week}</div>
            <div className="text-sm text-gray-400">New This Week</div>
          </div>
        </div>
      </Card>

      {/* Average Delivery Time */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.avg_delivery_time}w</div>
            <div className="text-sm text-gray-400">Avg Build Time</div>
          </div>
        </div>
      </Card>

      {/* Revenue Potential */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">${stats.avg_revenue_potential}</div>
            <div className="text-sm text-gray-400">Avg Revenue/mo</div>
          </div>
        </div>
      </Card>

      {/* Build Complexity Breakdown */}
      <Card className="p-4 md:col-span-2">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-white mb-1">Build Complexity</h3>
          <div className="text-sm text-gray-400">Distribution of project difficulties</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{stats.simple_builds}</div>
            <div className="text-xs text-gray-400">Simple</div>
            <div className="text-xs text-green-400">1-2 weeks</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{stats.medium_builds}</div>
            <div className="text-xs text-gray-400">Medium</div>
            <div className="text-xs text-yellow-400">2-3 weeks</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{stats.complex_builds}</div>
            <div className="text-xs text-gray-400">Complex</div>
            <div className="text-xs text-red-400">3-4 weeks</div>
          </div>
        </div>
      </Card>

      {/* Top Sources */}
      <Card className="p-4 md:col-span-2">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-white mb-1">Top Idea Sources</h3>
          <div className="text-sm text-gray-400">Where we discover smart opportunities</div>
        </div>
        
        <div className="space-y-2">
          {stats.top_painpoint_sources.slice(0, 3).map((source, index) => (
            <div key={source.source} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-blue-400' : 
                  index === 1 ? 'bg-purple-400' : 'bg-green-400'
                }`} />
                <span className="text-sm text-gray-300">{source.source}</span>
              </div>
              <span className="text-sm font-medium text-white">{source.count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};