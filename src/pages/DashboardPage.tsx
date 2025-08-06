import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { HiddenIdeasSection } from '@/components/HiddenIdeasSection'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TrendingUp, Brain, Zap, ArrowRight, BarChart3, Users, Target } from 'lucide-react'
import { PLAN_FEATURES } from '@/lib/stripe'

export function DashboardPage() {
  const { profileData, isLoading } = useUserProfile()

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Welcome to your intelligence hub">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  const currentTier = (profileData as any)?.current_tier || 'free'
  const planFeatures = PLAN_FEATURES[currentTier as keyof typeof PLAN_FEATURES]
  const dailyUsage = (profileData as any)?.profile?.daily_usage_count || 0
  const dailyLimit = (profileData as any)?.monthly_limit || 0
  const usagePercentage = dailyLimit > 0 ? (dailyUsage / dailyLimit) * 100 : 0

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle={`Welcome to your ${planFeatures?.name || 'intelligence'} hub`}
    >
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Usage</p>
                <p className="text-2xl font-bold text-white">
                  {dailyUsage}
                  {dailyLimit > 0 && <span className="text-gray-400 text-lg">/{dailyLimit}</span>}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            {dailyLimit > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      usagePercentage > 80 ? 'bg-red-500' : 
                      usagePercentage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Tier</p>
                <p className="text-2xl font-bold text-white capitalize">{currentTier}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">AI Engines</p>
                <p className="text-2xl font-bold text-white">
                  {currentTier === 'free' ? '1' : currentTier === 'founder' ? '1' : '2'}
                  <span className="text-gray-400 text-lg">/2</span>
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-500 mr-3" />
              <h3 className="text-xl font-bold text-white">Startup Ideas</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Discover and analyze the latest startup opportunities with {currentTier === 'free' || currentTier === 'founder' ? 'GPT-4' : 'dual-AI'} intelligence.
            </p>
            <Link to="/ideas">
              <Button className="w-full">
                Explore Ideas
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-500 mr-3" />
              <h3 className="text-xl font-bold text-white">Twitter Trends</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Analyze trending topics and emerging opportunities with real-time intelligence.
            </p>
            <Link to="/trends">
              <Button className="w-full" variant="secondary">
                View Trends
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* My Hidden Ideas Section */}
        <HiddenIdeasSection />

        {/* Upgrade Prompt for Free/Founder Users */}
        {(currentTier === 'free' || currentTier === 'founder') && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-blue-500/10 border border-yellow-500/20 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Unlock Dual-AI Strategic Analysis
                </h3>
                <p className="text-gray-300 mb-4">
                  Combine GPT-4 technical analysis with Claude's strategic insights for comprehensive business intelligence.
                </p>
                <ul className="text-gray-300 space-y-1">
                  <li>• Business model validation</li>
                  <li>• Go-to-market strategy</li>
                  <li>• Investment thesis reports</li>
                  {currentTier === 'founder' && <li>• 5x more daily analyses</li>}
                </ul>
              </div>
              <div className="ml-8">
                <Link to="/pricing">
                  <Button size="lg">
                    <Zap className="mr-2 w-5 h-5" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Enterprise Features */}
        {(profileData as any)?.is_enterprise && (
          <div className="bg-gray-800 p-6 rounded-xl border border-yellow-500">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-xl font-bold text-white">Enterprise Features</h3>
              <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 text-gray-900 rounded-full font-bold">
                ACTIVE
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/api" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">API Access</h4>
                  <p className="text-gray-300 text-sm">Programmatic access to all analysis</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <div className="flex items-center p-4 bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Unlimited Analysis</h4>
                  <p className="text-gray-300 text-sm">No daily limits on AI analysis</p>
                </div>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}