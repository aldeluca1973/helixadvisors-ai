import { loadStripe } from '@stripe/stripe-js'

// This is the publishable key from Stripe (not secret)
// In a real app, this would come from environment variables
const stripePromise = loadStripe('pk_live_51RrMo43dFeGcmSWnCHoICrUi4qDfcOT5QcDUZrJ5dCPE1TjDPVL6I3d8xLDOLrODlVnFktfrNNhb3F66RMEaStU100qB3KcfPm')

export default stripePromise

export const PLAN_FEATURES = {
  founder: {
    name: 'Founder Tier',
    price: '$29',
    interval: '/month',
    description: 'Perfect for startup founders exploring new opportunities',
    features: [
      'GPT-4 Technical Analysis',
      '10 Daily Ideas',
      'Core Intelligence Features',
      'Basic Trend Detection',
      'Email Support'
    ],
    dailyLimit: 10,
    color: 'from-gray-600 to-gray-800'
  },
  investor: {
    name: 'Investor Tier',
    price: '$79',
    interval: '/month',
    description: 'Advanced dual-AI analysis for serious investors',
    features: [
      'GPT-4 + Claude Strategic Analysis',
      '50 Daily Ideas',
      'Business Model Validation',
      'Go-to-Market Insights',
      'Competitive Analysis',
      'Priority Support'
    ],
    dailyLimit: 50,
    color: 'from-yellow-600 to-yellow-800',
    popular: true
  },
  enterprise: {
    name: 'Enterprise Tier',
    price: '$199',
    interval: '/month',
    description: 'Complete dual-AI platform with API access',
    features: [
      'Full Dual-AI Analysis',
      'Unlimited Ideas',
      'Complete Business Plans',
      'Investment Thesis Reports',
      'API Access',
      'Custom Integrations',
      'White-glove Support'
    ],
    dailyLimit: -1,
    color: 'from-blue-600 to-purple-800'
  }
}

export type PlanType = keyof typeof PLAN_FEATURES