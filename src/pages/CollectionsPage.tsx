import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import {
  Bookmark,
  Search,
  Star,
  Calendar,
  Lightbulb,
  Plus,
  Folder,
  Grid,
  List
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Mock data for collections - in a real app this would come from the database
const mockCollections = [
  {
    id: '1',
    name: 'AI & Machine Learning',
    description: 'AI-powered startup ideas and opportunities',
    ideas: [],
    created_at: new Date().toISOString(),
    icon: '🤖'
  },
  {
    id: '2',
    name: 'High ROI Opportunities',
    description: 'Ideas with strong revenue potential',
    ideas: [],
    created_at: new Date().toISOString(),
    icon: '💰'
  },
  {
    id: '3',
    name: 'Quick Wins',
    description: 'Low complexity, fast time-to-market ideas',
    ideas: [],
    created_at: new Date().toISOString(),
    icon: '⚡'
  }
]

interface Collection {
  id: string
  name: string
  description: string
  ideas: any[]
  created_at: string
  icon: string
}

export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>(mockCollections)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')

  // Get all startup ideas to populate collections
  const { data: allIdeas } = useQuery({
    queryKey: ['all-startup-ideas'],
    queryFn: () => api.getStartupIdeas(100, 0)
  })

  // Simulate some saved ideas in collections
  useEffect(() => {
    if (allIdeas && allIdeas.length > 0) {
      setCollections(prev => prev.map(collection => {
        if (collection.id === '1') {
          // AI collection gets AI-related ideas
          return {
            ...collection,
            ideas: allIdeas.filter(idea => 
              idea.title.toLowerCase().includes('ai') || 
              idea.title.toLowerCase().includes('ml') ||
              idea.category === 'ai_ml'
            ).slice(0, 5)
          }
        }
        if (collection.id === '2') {
          // High ROI gets top scoring ideas
          return {
            ...collection,
            ideas: allIdeas.filter(idea => idea.overall_score > 80).slice(0, 4)
          }
        }
        if (collection.id === '3') {
          // Quick wins gets medium complexity ideas
          return {
            ...collection,
            ideas: allIdeas.filter(idea => 
              idea.development_score > 70 && idea.overall_score > 60
            ).slice(0, 3)
          }
        }
        return collection
      }))
    }
  }, [allIdeas])

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: newCollectionName,
        description: newCollectionDescription,
        ideas: [],
        created_at: new Date().toISOString(),
        icon: '📁'
      }
      setCollections(prev => [...prev, newCollection])
      setNewCollectionName('')
      setNewCollectionDescription('')
      setShowCreateForm(false)
    }
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCollectionData = selectedCollection 
    ? collections.find(c => c.id === selectedCollection)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Collections</h1>
          <p className="text-gray-400 mt-1">
            Organize and save your favorite startup opportunities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Collection Form */}
      {showCreateForm && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Create New Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Collection Name</label>
                <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter collection name..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description (Optional)</label>
                <Input
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Collection
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collections View */}
      {!selectedCollection ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredCollections.map((collection) => (
            <Card 
              key={collection.id} 
              className="hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedCollection(collection.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{collection.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
                      <p className="text-gray-400 text-sm">{collection.description}</p>
                    </div>
                  </div>
                  <Bookmark className="w-5 h-5 text-blue-400" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{collection.ideas.length} ideas</span>
                    <span>{formatDate(collection.created_at)}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Collection Detail View */
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setSelectedCollection(null)}
            >
              ← Back to Collections
            </Button>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{selectedCollectionData?.icon}</div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCollectionData?.name}</h2>
                <p className="text-gray-400">{selectedCollectionData?.description}</p>
              </div>
            </div>
          </div>

          {selectedCollectionData?.ideas && selectedCollectionData.ideas.length > 0 ? (
            <div className="space-y-4">
              {selectedCollectionData.ideas.map((idea) => (
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
                          <p className="text-gray-300 mb-4 line-clamp-2">{idea.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(idea.created_at)}</span>
                          </div>
                          {idea.market_score && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>Market: {idea.market_score.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/idea/${idea.id}`}>
                            <Lightbulb className="w-4 h-4 mr-2" />
                            View Details
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Collection is Empty</h3>
                <p className="text-gray-400">
                  Start adding ideas to this collection from the search or ideas pages.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
