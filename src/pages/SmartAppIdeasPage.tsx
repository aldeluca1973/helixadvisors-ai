import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SmartAppIdeaCard } from '@/components/features/SmartAppIdeaCard';
import { SmartAppIdeaStats } from '@/components/features/SmartAppIdeaStats';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { 
  getSmartAppIdeasOpportunities, 
  getSmartAppIdeasStats, 
  triggerHistoricalBackfill 
} from '@/api/smart-app-ideas';
import { 
  Sparkles, 
  Code, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Target
} from 'lucide-react';

export const SmartAppIdeasPage: React.FC = () => {
  const { data: opportunities = [], isLoading: opportunitiesLoading, refetch: refetchOpportunities } = useQuery({
    queryKey: ['smartAppIdeasOpportunities'],
    queryFn: () => getSmartAppIdeasOpportunities(15)
  });

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['smartAppIdeasStats'],
    queryFn: getSmartAppIdeasStats
  });

  const [isBackfilling, setIsBackfilling] = React.useState(false);

  const handleBackfill = async () => {
    setIsBackfilling(true);
    try {
      const result = await triggerHistoricalBackfill();
      if (result.success) {
        // Refresh data after backfill
        setTimeout(() => {
          refetchOpportunities();
          refetchStats();
        }, 2000);
      }
    } catch (error) {
      console.error('Backfill error:', error);
    } finally {
      setIsBackfilling(false);
    }
  };

  const topOpportunities = opportunities.slice(0, 10);
  const specialMentions = opportunities.slice(10, 15);

  if (opportunitiesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Smart App Ideas</h1>
                <p className="text-gray-400">AI-powered SaaS opportunities under $20K</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  refetchOpportunities();
                  refetchStats();
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              
              <Button
                variant="default"
                onClick={handleBackfill}
                disabled={isBackfilling}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isBackfilling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Discover More
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 border-blue-500/30">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white">Quick Build</div>
                  <div className="text-xs text-gray-400">1-4 weeks delivery</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-green-500/30">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">Low Investment</div>
                  <div className="text-xs text-gray-400">Under $20K to build</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-purple-500/30">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm font-medium text-white">Real Painpoints</div>
                  <div className="text-xs text-gray-400">Validated user needs</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        {stats && <SmartAppIdeaStats stats={stats} />}

        {/* Top Opportunities */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Top 10 Opportunities</h2>
              <p className="text-gray-400">Ranked by painpoint severity, technical feasibility, and revenue potential</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4" />
              Refreshed daily at 7 AM
            </div>
          </div>

          {topOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topOpportunities.map((opportunity, index) => (
                <SmartAppIdeaCard
                  key={opportunity.id}
                  idea={opportunity}
                  rank={index + 1}
                  showDetails={index < 3} // Show details for top 3
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Smart Ideas Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                We're discovering profitable app ideas from Reddit, Indie Hackers, and other sources. 
                Click "Discover More" to start the AI-powered idea discovery process.
              </p>
              <Button
                variant="default"
                onClick={handleBackfill}
                disabled={isBackfilling}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isBackfilling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Discovering Painpoints...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Discovery
                  </>
                )}
              </Button>
            </Card>
          )}
        </div>

        {/* Special Mentions */}
        {specialMentions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Special Mentions</h2>
                <p className="text-gray-400">Additional opportunities worth considering</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {specialMentions.map((opportunity, index) => (
                <SmartAppIdeaCard
                  key={opportunity.id}
                  idea={opportunity}
                  rank={index + 11}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};