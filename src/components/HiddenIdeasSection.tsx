import React, { useState, useEffect } from 'react'
import { useHiddenIdeas, HiddenIdea } from '@/hooks/useHiddenIdeas'
import { Button } from '@/components/ui/Button'
import { Building2, Eye, Download, Plus, Calendar, DollarSign, Flag, Tag, Trash2, Edit3, CheckCircle2 } from 'lucide-react'

interface HiddenIdeasSectionProps {
  className?: string
}

export function HiddenIdeasSection({ className = '' }: HiddenIdeasSectionProps) {
  const { getHiddenIdeas, updateHiddenIdea, unhideIdea, exportHiddenIdeas, isLoading, error } = useHiddenIdeas()
  const [hiddenIdeas, setHiddenIdeas] = useState<HiddenIdea[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [editingIdea, setEditingIdea] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    status: string
    notes: string
    progress_percentage: number
    priority: string
    estimated_budget: string
    target_launch_date: string
  }>({ status: '', notes: '', progress_percentage: 0, priority: 'medium', estimated_budget: '', target_launch_date: '' })

  useEffect(() => {
    loadHiddenIdeas()
  }, [])

  const loadHiddenIdeas = async () => {
    try {
      const ideas = await getHiddenIdeas()
      setHiddenIdeas(ideas)
    } catch (err) {
      console.error('Failed to load hidden ideas:', err)
    }
  }

  const filteredIdeas = hiddenIdeas.filter(idea => {
    if (filter === 'all') return true
    return idea.status === filter
  })

  const handleUnhide = async (ideaId: string) => {
    try {
      await unhideIdea(ideaId)
      setHiddenIdeas(prev => prev.filter(idea => idea.idea_id !== ideaId))
    } catch (err) {
      console.error('Failed to unhide idea:', err)
    }
  }

  const handleEdit = (idea: HiddenIdea) => {
    setEditingIdea(idea.idea_id)
    setEditForm({
      status: idea.status,
      notes: idea.notes || '',
      progress_percentage: idea.progress_percentage,
      priority: idea.priority,
      estimated_budget: idea.estimated_budget?.toString() || '',
      target_launch_date: idea.target_launch_date || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingIdea) return
    
    try {
      const updates: any = {
        status: editForm.status,
        notes: editForm.notes,
        progress_percentage: editForm.progress_percentage,
        priority: editForm.priority
      }
      
      if (editForm.estimated_budget) {
        updates.estimated_budget = parseFloat(editForm.estimated_budget)
      }
      
      if (editForm.target_launch_date) {
        updates.target_launch_date = editForm.target_launch_date
      }
      
      await updateHiddenIdea(editingIdea, updates)
      
      // Update local state
      setHiddenIdeas(prev => prev.map(idea => 
        idea.idea_id === editingIdea 
          ? { ...idea, ...updates }
          : idea
      ))
      
      setEditingIdea(null)
    } catch (err) {
      console.error('Failed to update idea:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'building': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-white">My Hidden Ideas</h3>
          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
            {hiddenIdeas.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={exportHiddenIdeas}
            variant="secondary"
            size="sm"
            disabled={isLoading || hiddenIdeas.length === 0}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-700 rounded-lg p-1">
        {[
          { key: 'all', label: 'All', count: hiddenIdeas.length },
          { key: 'building', label: 'Building', count: hiddenIdeas.filter(i => i.status === 'building').length },
          { key: 'hidden', label: 'Hidden', count: hiddenIdeas.filter(i => i.status === 'hidden').length },
          { key: 'completed', label: 'Completed', count: hiddenIdeas.filter(i => i.status === 'completed').length },
          { key: 'paused', label: 'Paused', count: hiddenIdeas.filter(i => i.status === 'paused').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-gray-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Ideas List */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {filter === 'all' 
              ? "No hidden ideas yet. Start by hiding ideas you're interested in from the main feed."
              : `No ${filter} ideas found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map(idea => (
            <div key={idea.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              {editingIdea === idea.idea_id ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{idea.startup_ideas?.title}</h4>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveEdit} size="sm">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={() => setEditingIdea(null)} variant="secondary" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                      >
                        <option value="hidden">Hidden</option>
                        <option value="building">Building</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Progress (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.progress_percentage}
                        onChange={(e) => setEditForm(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Target Launch</label>
                      <input
                        type="date"
                        value={editForm.target_launch_date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, target_launch_date: e.target.value }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Budget ($)</label>
                      <input
                        type="number"
                        value={editForm.estimated_budget}
                        onChange={(e) => setEditForm(prev => ({ ...prev, estimated_budget: e.target.value }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                        placeholder="e.g., 50000"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white h-20"
                        placeholder="Add your notes about this idea..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-white">{idea.startup_ideas?.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)} text-white`}>
                          {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                        </span>
                        <span className={`text-sm ${getPriorityColor(idea.priority)}`}>
                          <Flag className="w-3 h-3 inline mr-1" />
                          {idea.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{idea.startup_ideas?.description}</p>
                      
                      {idea.notes && (
                        <p className="text-gray-400 text-sm mb-3 italic">"{idea.notes}"</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        {idea.progress_percentage > 0 && (
                          <span className="flex items-center">
                            <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${idea.progress_percentage}%` }}
                              ></div>
                            </div>
                            {idea.progress_percentage}%
                          </span>
                        )}
                        
                        {idea.target_launch_date && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(idea.target_launch_date).toLocaleDateString()}
                          </span>
                        )}
                        
                        {idea.estimated_budget && (
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {idea.estimated_budget.toLocaleString()}
                          </span>
                        )}
                        
                        <span>Hidden {new Date(idea.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => handleEdit(idea)}
                        variant="secondary"
                        size="sm"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        onClick={() => handleUnhide(idea.idea_id)}
                        variant="secondary"
                        size="sm"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mt-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}