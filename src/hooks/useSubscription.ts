import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import stripePromise from '@/lib/stripe'
import toast from 'react-hot-toast'
import { PlanType } from '@/lib/stripe'

export function useSubscription() {
  const { user, session } = useAuth()

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planType: PlanType) => {
      if (!user || !session) throw new Error('Authentication required')
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planType,
          customerEmail: user.email
        }
      })
      
      if (error) throw error
      return data.data
    },
    onSuccess: async (data) => {
      if (data.checkoutUrl) {
        toast.success('Redirecting to payment...')
        window.location.href = data.checkoutUrl
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create subscription')
    }
  })

  const createCustomerPortalMutation = useMutation({
    mutationFn: async () => {
      if (!user || !session) throw new Error('Authentication required')
      
      // This would call a customer portal edge function
      // For now, we'll redirect to a simple billing page
      toast('Billing management coming soon!', { icon: 'ℹ️' })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to open billing portal')
    }
  })

  return {
    subscribe: createSubscriptionMutation.mutate,
    isSubscribing: createSubscriptionMutation.isPending,
    openBillingPortal: createCustomerPortalMutation.mutate,
    isOpeningPortal: createCustomerPortalMutation.isPending
  }
}