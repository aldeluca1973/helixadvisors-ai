import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { PLAN_FEATURES, PlanType } from '@/lib/stripe'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

export function PricingPage() {
  const { user } = useAuth()
  const { profileData } = useUserProfile()
  const { subscribe, isSubscribing } = useSubscription()
  
  const currentTier = (profileData as any)?.current_tier || 'free'
  const isAuthenticated = !!user

  const handleSubscribe = (planType: PlanType) => {
    if (!isAuthenticated) {
      // Redirect to signup if not authenticated
      window.location.href = '/signup'
      return
    }
    subscribe(planType)
  }

  const renderPricingCard = (planKey: string, plan: any, isPopular = false) => {
    const isCurrentPlan = currentTier === planKey
    const isUpgrade = !isCurrentPlan && planKey !== 'founder'
    
    return (
      <div 
        key={planKey}
        className={`relative bg-gray-800 p-8 rounded-xl border-2 transition-all hover:scale-105 ${
          isPopular ? 'border-yellow-500 ring-4 ring-yellow-500/20' : 
          isCurrentPlan ? 'border-blue-500 ring-4 ring-blue-500/20' :
          'border-gray-700 hover:border-gray-600'
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-yellow-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              MOST POPULAR
            </span>
          </div>
        )}
        
        {isCurrentPlan && (
          <div className="absolute -top-4 right-4">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              CURRENT
            </span>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
            {planKey === 'enterprise' && <Crown className="w-6 h-6 mr-2 text-yellow-500" />}
            {planKey === 'investor' && <Star className="w-6 h-6 mr-2 text-yellow-500" />}
            {planKey === 'founder' && <Zap className="w-6 h-6 mr-2 text-blue-500" />}
            {plan.name}
          </h3>
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-5xl font-bold text-white">{plan.price}</span>
            <span className="text-gray-400 ml-2 text-lg">{plan.interval}</span>
          </div>
          <p className="text-gray-300">{plan.description}</p>
        </div>
        
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start text-gray-300">
              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="space-y-3">
          {isCurrentPlan ? (
            <div className="w-full py-3 text-center bg-gray-700 text-gray-300 rounded-lg font-semibold">
              Current Plan
            </div>
          ) : (
            <Button 
              className="w-full" 
              variant={isPopular ? 'default' : 'outline'}
              disabled={isSubscribing}
              onClick={() => handleSubscribe(planKey as PlanType)}
            >
              {isUpgrade ? 'Upgrade to' : 'Start with'} {plan.name}
            </Button>
          )}
          
          {planKey === 'founder' && currentTier === 'free' && (
            <p className="text-xs text-gray-400 text-center">
              Perfect starting point for entrepreneurs
            </p>
          )}
          
          {planKey === 'investor' && (currentTier === 'free' || currentTier === 'founder') && (
            <p className="text-xs text-gray-400 text-center">
              Unlock dual-AI strategic insights
            </p>
          )}
          
          {planKey === 'enterprise' && currentTier !== 'enterprise' && (
            <p className="text-xs text-gray-400 text-center">
              Complete platform with API access
            </p>
          )}
        </div>
      </div>
    )
  }

  const content = (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Choose Your Intelligence Tier
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Unlock revolutionary insights with our tiered dual-AI analysis platform. 
          Each tier builds upon the previous with more powerful AI capabilities.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {Object.entries(PLAN_FEATURES).map(([key, plan]) => 
          renderPricingCard(key, plan, 'popular' in plan ? plan.popular : false)
        )}
      </div>
      
      {/* Feature Comparison */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          AI Analysis Comparison
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Founder Tier</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-center p-3 bg-blue-600/20 rounded-lg">
                <span className="text-blue-400 font-semibold">GPT-4 Analysis</span>
              </div>
              <p className="text-gray-400 text-sm">Technical feasibility & implementation insights</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Investor Tier</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-center p-3 bg-blue-600/20 rounded-lg">
                <span className="text-blue-400 font-semibold">GPT-4 Analysis</span>
              </div>
              <div className="flex items-center justify-center p-3 bg-yellow-500/20 rounded-lg">
                <span className="text-yellow-500 font-semibold">+ Claude Strategic</span>
              </div>
              <p className="text-gray-400 text-sm">Technical + Business model validation</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Enterprise Tier</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-center p-3 bg-blue-600/20 rounded-lg">
                <span className="text-blue-400 font-semibold">GPT-4 Analysis</span>
              </div>
              <div className="flex items-center justify-center p-3 bg-yellow-500/20 rounded-lg">
                <span className="text-yellow-500 font-semibold">+ Claude Strategic</span>
              </div>
              <div className="flex items-center justify-center p-3 bg-purple-600/20 rounded-lg">
                <span className="text-purple-400 font-semibold">+ Combined Synthesis</span>
              </div>
              <p className="text-gray-400 text-sm">Investment-grade reports & API access</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Frequently Asked Questions
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-2">What's dual-AI analysis?</h4>
            <p className="text-gray-300 text-sm">
              We combine GPT-4's technical analysis with Claude's strategic business insights to provide comprehensive startup intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Can I upgrade anytime?</h4>
            <p className="text-gray-300 text-sm">
              Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">What's included in Enterprise API?</h4>
            <p className="text-gray-300 text-sm">
              Full programmatic access to all analysis results, usage analytics, and custom integrations.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Do you offer refunds?</h4>
            <p className="text-gray-300 text-sm">
              We offer a 7-day money-back guarantee for all paid plans. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  if (isAuthenticated) {
    return (
      <DashboardLayout title="Pricing" subtitle="Choose the perfect plan for your needs">
        {content}
      </DashboardLayout>
    )
  }

  // Standalone pricing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-lg">
                <Zap className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-white">Dual AI</span>
            </Link>
            <div className="space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white">
                Sign In
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {content}
      </div>
    </div>
  )
}