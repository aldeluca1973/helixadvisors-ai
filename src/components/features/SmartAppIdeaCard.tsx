import React from 'react';
import { SmartAppIdea } from '@/types/smart-app-ideas';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Clock, Code, DollarSign, Users, ExternalLink, Sparkles } from 'lucide-react';

interface SmartAppIdeaCardProps {
  idea: SmartAppIdea;
  rank: number;
  showDetails?: boolean;
}

export const SmartAppIdeaCard: React.FC<SmartAppIdeaCardProps> = ({ 
  idea, 
  rank, 
  showDetails = false 
}) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'simple': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'complex': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getComplexityBg = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'simple': return 'bg-green-500/20 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'complex': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-yellow-500/20 border-yellow-500/30';
    }
  };

  return (
    <Card className="relative group hover:border-blue-500/50 transition-all duration-300">
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
        {rank}
      </div>

      {/* NEW Badge */}
      {idea.is_new_entry && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          <Sparkles className="w-3 h-3" />
          NEW
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
              {idea.title}
            </h3>
            <p className="text-gray-300 text-sm line-clamp-3 mb-3">
              {idea.painpoint_description || idea.description}
            </p>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.round(idea.overall_score)}
            </div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">{idea.delivery_timeline_weeks}w build</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Code className={`w-4 h-4 ${getComplexityColor(idea.analysis?.build_complexity || 'Medium')}`} />
            <span className={getComplexityColor(idea.analysis?.build_complexity || 'Medium')}>
              {idea.analysis?.build_complexity || 'Medium'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">
              {idea.analysis?.revenue_potential_monthly || '$500/month'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{idea.source}</span>
          </div>
        </div>

        {/* Analysis Scores */}
        {idea.analysis && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {Math.round(idea.analysis.painpoint_severity_score)}
              </div>
              <div className="text-xs text-gray-400">Pain Level</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {Math.round(idea.analysis.technical_feasibility)}
              </div>
              <div className="text-xs text-gray-400">Feasible</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {Math.round(idea.analysis.saas_viability_score)}
              </div>
              <div className="text-xs text-gray-400">SaaS Fit</div>
            </div>
          </div>
        )}

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">Tech Stack</div>
          <div className="flex flex-wrap gap-1">
            {idea.technical_stack_required.split(',').map((tech, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-gray-300"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Build Complexity Badge */}
        {idea.analysis?.build_complexity && (
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${getComplexityBg(idea.analysis.build_complexity)}`}>
              <Code className="w-3 h-3" />
              {idea.analysis.build_complexity} Build
            </span>
          </div>
        )}

        {/* Detailed Explanation */}
        {showDetails && idea.analysis?.detailed_explanation && (
          <div className="mb-4 p-3 bg-gray-800/30 border border-gray-700 rounded">
            <div className="text-sm text-gray-300 line-clamp-4">
              {idea.analysis.detailed_explanation}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Found on {new Date(idea.date_discovered).toLocaleDateString()}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(idea.url, '_blank')}
              className="flex items-center gap-1 text-xs"
            >
              <ExternalLink className="w-3 h-3" />
              Source
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Code className="w-3 h-3" />
              Build Smart
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};