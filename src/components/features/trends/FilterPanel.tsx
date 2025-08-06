import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import {
  X,
  Github,
  MessageSquare,
  TrendingUp,
  Filter,
  RotateCcw
} from 'lucide-react'

interface FilterPanelProps {
  filters: {
    sources: string[]
    dateRange: string
    relevanceMin: number
    sortBy: string
    searchQuery: string
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
}

const sourceOptions = [
  { id: 'twitter', name: 'X (Twitter)', icon: X, color: 'text-blue-400' },
  { id: 'hacker_news', name: 'Hacker News', icon: MessageSquare, color: 'text-orange-400' },
  { id: 'github', name: 'GitHub', icon: Github, color: 'text-green-400' },
  { id: 'google_trends', name: 'Google Trends', icon: TrendingUp, color: 'text-purple-400' }
]

const dateOptions = [
  { id: '24h', name: 'Last 24 Hours' },
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
  { id: 'all', name: 'All Time' }
]

const sortOptions = [
  { id: 'relevance', name: 'Relevance Score' },
  { id: 'newest', name: 'Newest First' },
  { id: 'velocity', name: 'Trend Velocity' },
  { id: 'engagement', name: 'Engagement' }
]

export function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleSource = (sourceId: string) => {
    const newSources = filters.sources.includes(sourceId)
      ? filters.sources.filter(id => id !== sourceId)
      : [...filters.sources, sourceId]
    updateFilter('sources', newSources)
  }

  const resetFilters = () => {
    onFiltersChange({
      sources: ['twitter', 'hacker_news', 'github', 'google_trends'],
      dateRange: '7d',
      relevanceMin: 0.5,
      sortBy: 'relevance',
      searchQuery: ''
    })
  }

  return (
    <Card className="border-stroke animate-slide-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-heading-3 flex items-center gap-2">
              <Filter className="w-5 h-5 text-interactive" />
              Professional Filters
            </CardTitle>
            <CardDescription className="text-body-secondary">
              Refine your intelligence feed with advanced filtering options
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Data Sources */}
        <div>
          <Label className="text-body-secondary font-medium text-text-primary mb-3 block">
            Data Sources
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sourceOptions.map((source) => {
              const isSelected = filters.sources.includes(source.id)
              const Icon = source.icon
              
              return (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border transition-all duration-200
                    ${isSelected 
                      ? 'bg-interactive/10 border-interactive text-interactive' 
                      : 'bg-surface border-stroke text-text-secondary hover:border-interactive/50 hover:bg-interactive/5'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-interactive' : source.color}`} />
                  <span className="text-body-secondary font-medium truncate">
                    {source.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range */}
          <div>
            <Label className="text-body-secondary font-medium text-text-primary mb-3 block">
              Time Range
            </Label>
            <div className="space-y-2">
              {dateOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateFilter('dateRange', option.id)}
                  className={`
                    w-full flex items-center justify-between p-2 rounded-md border transition-all duration-200
                    ${filters.dateRange === option.id
                      ? 'bg-interactive/10 border-interactive text-interactive'
                      : 'bg-surface border-stroke text-text-secondary hover:border-interactive/50'
                    }
                  `}
                >
                  <span className="text-body-secondary">{option.name}</span>
                  {filters.dateRange === option.id && (
                    <div className="w-2 h-2 bg-interactive rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <Label className="text-body-secondary font-medium text-text-primary mb-3 block">
              Sort By
            </Label>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateFilter('sortBy', option.id)}
                  className={`
                    w-full flex items-center justify-between p-2 rounded-md border transition-all duration-200
                    ${filters.sortBy === option.id
                      ? 'bg-interactive/10 border-interactive text-interactive'
                      : 'bg-surface border-stroke text-text-secondary hover:border-interactive/50'
                    }
                  `}
                >
                  <span className="text-body-secondary">{option.name}</span>
                  {filters.sortBy === option.id && (
                    <div className="w-2 h-2 bg-interactive rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Relevance Threshold */}
          <div>
            <Label className="text-body-secondary font-medium text-text-primary mb-3 block">
              Minimum Relevance Score
            </Label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.relevanceMin}
                  onChange={(e) => updateFilter('relevanceMin', parseFloat(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-caption text-text-secondary mt-1">
                  <span>0%</span>
                  <span className="font-medium text-interactive">
                    {Math.round(filters.relevanceMin * 100)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {[0.5, 0.7, 0.8, 0.9].map((value) => (
                  <button
                    key={value}
                    onClick={() => updateFilter('relevanceMin', value)}
                    className={`
                      px-2 py-1 rounded text-caption border transition-colors
                      ${filters.relevanceMin === value
                        ? 'bg-interactive text-white border-interactive'
                        : 'bg-surface text-text-secondary border-stroke hover:border-interactive/50'
                      }
                    `}
                  >
                    {Math.round(value * 100)}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="pt-4 border-t border-stroke">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-secondary font-medium text-text-primary">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.sources.length < 4 && (
                  <Badge variant="outline" className="text-xs">
                    {filters.sources.length} source{filters.sources.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {filters.dateRange !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    {dateOptions.find(d => d.id === filters.dateRange)?.name}
                  </Badge>
                )}
                {filters.relevanceMin > 0.5 && (
                  <Badge variant="outline" className="text-xs">
                    ≥{Math.round(filters.relevanceMin * 100)}% relevance
                  </Badge>
                )}
                {filters.searchQuery && (
                  <Badge variant="outline" className="text-xs">
                    Search: "{filters.searchQuery.slice(0, 20)}{filters.searchQuery.length > 20 ? '...' : ''}"
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-text-secondary hover:text-text-primary"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom CSS for range slider
const sliderStyles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = sliderStyles
  document.head.appendChild(style)
}