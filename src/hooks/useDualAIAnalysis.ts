import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface AnalysisRequest {
  item_type: string
  item_id: string
  content: string
  title?: string
}

interface AnalysisResult {
  gpt4_analysis: any
  claude_analysis?: any
  combined_analysis?: any
  tier_used: string
  usage_count: number
  daily_limit: number
}

export function useDualAIAnalysis() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const analysisMutation = useMutation({
    mutationFn: async (request: AnalysisRequest): Promise<AnalysisResult> => {
      if (!session) throw new Error('Authentication required')
      
      const { data, error } = await supabase.functions.invoke('dual-ai-analysis', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: request
      })
      
      if (error) throw error
      return data.data
    },
    onSuccess: (data) => {
      // Invalidate user profile to update usage counts
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      
      // Show success message based on tier
      if (data.tier_used === 'enterprise') {
        toast.success('🚀 Enterprise-grade analysis completed!')
      } else if (data.tier_used === 'investor') {
        toast.success('🎯 Dual-AI analysis completed!')
      } else {
        toast.success('✅ GPT-4 analysis completed!')
      }
    },
    onError: (error: any) => {
      if (error.message?.includes('limit')) {
        toast.error('Daily limit reached! Upgrade for more analyses.')
      } else {
        toast.error(error.message || 'Analysis failed')
      }
    }
  })

  return {
    analyzeItem: analysisMutation.mutate,
    isAnalyzing: analysisMutation.isPending,
    analysisError: analysisMutation.error,
    analysisResult: analysisMutation.data
  }
}