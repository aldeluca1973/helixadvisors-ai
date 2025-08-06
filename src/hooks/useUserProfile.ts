import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  current_tier: string
  daily_usage_count: number
  last_usage_reset: string
  created_at: string
  updated_at: string
}

interface Subscription {
  id: number
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  price_id: string
  status: string
  created_at: string
  updated_at: string
  saas_plans: {
    plan_type: string
    price: number
    monthly_limit: number
  }
}

interface ProfileData {
  profile: UserProfile
  subscription: Subscription | null
  plan: any
  usage_analytics: any[]
  current_tier: string
  monthly_limit: number
  is_enterprise: boolean
}

export function useUserProfile() {
  const { user, session } = useAuth()
  const queryClient = useQueryClient()

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async (): Promise<ProfileData> => {
      if (!session) throw new Error('No session')
      
      const { data, error } = await supabase.functions.invoke('user-profile-manager', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      
      if (error) throw error
      return data.data
    },
    enabled: !!user && !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: false // Don't retry for demo mode
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { full_name: string }) => {
      if (!session) throw new Error('No session')
      
      const { data, error } = await supabase.functions.invoke('user-profile-manager', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: updates
      })
      
      if (error) throw error
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] })
      toast.success('Profile updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile')
    }
  })

  return {
    profileData,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending
  }
}