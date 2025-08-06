import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Filter,
  TrendingUp,
  Star,
  Calendar,
  ExternalLink,
  Lightbulb
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface SearchFilters {
  query: string
  category: string
  minScore: number
  sortBy: string
}

const initialFilters: SearchFilters = {
  query: '',
  category: 'all',
  minScore: 0,
  sortBy: 'score'
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'saas', label: 'SaaS' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'web_app', label: 'Web App' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'ai_ml', label: 'AI/ML' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'health_wellness', label: 'Health & Wellness' }
]

export function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  const { data: ideas, isLoading, error } = useQuery({
    queryKey: ['search-ideas'],
    queryFn: () => api.getStartupIdeas(100, 0)
  })

  const filteredIdeas = useMemo(() => {
    if (!ideas) return []

    return ideas.filter(idea => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase()
        const matchesQuery = 
          idea.title.toLowerCase().includes(query) ||
          idea.description?.toLowerCase().includes(query) ||
          idea.category?.toLowerCase().includes(query)
        if (!matchesQuery) return false
      }

      // Category filter
      if (filters.category !== 'all' && idea.category !== filters.category) {
        return false
      }

      // Score filter
      if (idea.overall_score < filters.minScore) {
        return false
      }

      return true
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return b.overall_score - a.overall_score
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
  }, [ideas, filters])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/3 animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                <div className="h-20 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500 bg-red-500/10">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div>
              <h4 className="font-medium text-red-400">Search Error</h4>
              <p className="text-sm text-red-300">Failed to load startup ideas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Search Ideas</h1>
          <p className="text-gray-400 mt-1">
            Deep search through {ideas?.length || 0} startup opportunities
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="text-gray-300 border-gray-600 hover:bg-gray-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search ideas, categories, or keywords..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Score Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Minimum Score: {filters.minScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minScore}
                  onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="score">Score (High to Low)</option>
                  <option value="date">Date (Newest First)</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {filteredIdeas.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Found {filteredIdeas.length} matching ideas
              </p>
            </div>
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="hover:border-gray-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{idea.title}</h3>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                          <Star className="w-3 h-3 mr-1" />
                          {idea.overall_score.toFixed(1)}
                        </Badge>
                        {idea.category && (
                          <Badge variant="outline" className="text-gray-300">
                            {idea.category}
                          </Badge>
                        )}
                      </div>
                      
                      {idea.description && (
                        <p className="text-gray-300 mb-4 line-clamp-3">{idea.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(idea.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Market Score: {idea.market_score?.toFixed(1) || 'N/A'}</span>
                        </div>
                        {idea.source_platform && (
                          <div className="flex items-center space-x-1">
                            <ExternalLink className="w-4 h-4" />
                            <span>{idea.source_platform}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/idea/${idea.id}`}>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          View Details
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Results Found</h3>
              <p className="text-gray-400">
                Try adjusting your search query or filters to find relevant ideas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
