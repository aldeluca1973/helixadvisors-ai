import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface HiddenIdea {
  id: string
  user_id: string
  idea_id: string
  status: 'hidden' | 'building' | 'completed' | 'paused'
  notes: string
  progress_percentage: number
  priority: 'low' | 'medium' | 'high'
  estimated_budget?: number
  target_launch_date?: string
  tags: string[]
  private_notes: string
  created_at: string
  updated_at: string
  startup_ideas?: {
    id: string
    title: string
    description: string
    category?: string
    overall_score?: number
  }
}

export interface HideIdeaParams {
  idea_id: string
  status?: 'hidden' | 'building' | 'completed' | 'paused'
  notes?: string
  progress_percentage?: number
  priority?: 'low' | 'medium' | 'high'
  estimated_budget?: number
  target_launch_date?: string
  tags?: string[]
  private_notes?: string
}

export function useHiddenIdeas() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hiddenIdeas, setHiddenIdeas] = useState<HiddenIdea[]>([])

  // Hide/bookmark an idea
  const hideIdea = useCallback(async (params: HideIdeaParams) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required to hide ideas')
      }

      const { data, error } = await supabase.functions.invoke('manage-hidden-ideas', {
        body: {
          action: 'hide',
          ...params
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to hide idea')
      }

      if (!data?.success) {
        throw new Error(data?.error?.message || 'Failed to hide idea')
      }

      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to hide idea'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get all hidden ideas for the user
  const getHiddenIdeas = useCallback(async (statusFilter?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required to view hidden ideas')
      }

      const { data, error } = await supabase.functions.invoke('manage-hidden-ideas', {
        body: {
          action: 'list',
          status_filter: statusFilter
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch hidden ideas')
      }

      if (!data?.success) {
        throw new Error(data?.error?.message || 'Failed to fetch hidden ideas')
      }

      setHiddenIdeas(data.data || [])
      return data.data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hidden ideas'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update hidden idea details
  const updateHiddenIdea = useCallback(async (ideaId: string, updates: Partial<HideIdeaParams>) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required to update ideas')
      }

      const { data, error } = await supabase.functions.invoke('manage-hidden-ideas', {
        body: {
          action: 'update',
          idea_id: ideaId,
          ...updates
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to update idea')
      }

      if (!data?.success) {
        throw new Error(data?.error?.message || 'Failed to update idea')
      }

      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update idea'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Unhide an idea
  const unhideIdea = useCallback(async (ideaId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required to unhide ideas')
      }

      const { data, error } = await supabase.functions.invoke('manage-hidden-ideas', {
        body: {
          action: 'unhide',
          idea_id: ideaId
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to unhide idea')
      }

      if (!data?.success) {
        throw new Error(data?.error?.message || 'Failed to unhide idea')
      }

      // Remove from local state
      setHiddenIdeas(prev => prev.filter(item => item.idea_id !== ideaId))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unhide idea'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Export hidden ideas
  const exportHiddenIdeas = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required to export ideas')
      }

      const { data, error } = await supabase.functions.invoke('manage-hidden-ideas', {
        body: {
          action: 'export'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to export ideas')
      }

      if (!data?.success) {
        throw new Error(data?.error?.message || 'Failed to export ideas')
      }

      // Create downloadable file
      const exportData = data.data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hidden-ideas-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return exportData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export ideas'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    hiddenIdeas,
    hideIdea,
    getHiddenIdeas,
    updateHiddenIdea,
    unhideIdea,
    exportHiddenIdeas
  }
}