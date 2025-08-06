import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useDualAIAnalysis } from '@/hooks/useDualAIAnalysis'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useHiddenIdeas } from '@/hooks/useHiddenIdeas'
import { Button } from '@/components/ui/Button'
import { Brain, Lightbulb, TrendingUp, Lock, Zap, Loader, EyeOff, Bookmark, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface StartupIdea {
  id: string
  title: string
  description: string
  category?: string
  trend_category?: string
  trending_score?: number
  market_size?: string
  market_size_estimate?: string
  overall_relevance_score?: number
  professional_confidence_score?: number
}

export function StartupIdeasPage() {
  const { profileData } = useUserProfile()
  const { analyzeItem, isAnalyzing, analysisResult } = useDualAIAnalysis()
  const { hideIdea, isLoading: hidingIdea } = useHiddenIdeas()
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [startupIdeas, setStartupIdeas] = useState<StartupIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showHideModal, setShowHideModal] = useState<{ideaId: string, title: string} | null>(null)
  
  // Handle demo mode for testing (when no user is authenticated)
  const currentTier = (profileData as any)?.current_tier || 'free'
  const dailyUsage = (profileData as any)?.profile?.daily_usage_count || 0
  const dailyLimit = (profileData as any)?.monthly_limit || 0
  const canAnalyze = dailyLimit === -1 || dailyUsage < dailyLimit
  
  // Get current user email to check for admin status
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  
  // Check if current user is admin
  useEffect(() => {
    const checkUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email || null
      console.log('Current user email:', email) // Debug log
      setCurrentUserEmail(email)
    }
    
    checkUserEmail()
  }, [])
  
  // Check if user is admin - only admin can hide ideas
  // Force admin to true for the specific admin email, but also allow for URL param override for testing
  const urlParams = new URLSearchParams(window.location.search)
  const forceAdmin = urlParams.get('admin') === 'true'
  const isAdmin = (currentUserEmail === 'helixadmin@carismusa.com') || forceAdmin
  console.log('Is admin?', isAdmin, 'Email:', currentUserEmail, 'Force admin:', forceAdmin) // Debug log

  // Fetch startup ideas from the backend
  useEffect(() => {
    const fetchStartupIdeas = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get session for authentication
        const { data: { session } } = await supabase.auth.getSession()
        
        const { data, error } = await supabase.functions.invoke('get-filtered-ideas', {
          body: {},
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}
        })
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch startup ideas')
        }
        
        if (data?.success && data?.data) {
          // Transform the data to match our interface
          const transformedIdeas = data.data.map((idea: any) => ({
            id: idea.id,
            title: idea.title,
            description: idea.description || '',
            category: idea.trend_category || 'General',
            trending_score: Math.round((idea.overall_relevance_score || 0) * 100),
            market_size: idea.market_size_estimate || 'Medium'
          }))
          setStartupIdeas(transformedIdeas)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error fetching startup ideas:', err)
        setError(err instanceof Error ? err.message : 'Failed to load startup ideas')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStartupIdeas()
  }, [])

  const handleAnalyze = (idea: any) => {
    if (!canAnalyze) {
      return
    }
    
    setSelectedIdea(idea.id)
    analyzeItem({
      item_type: 'startup_idea',
      item_id: idea.id,
      title: idea.title,
      content: `${idea.description}\n\nCategory: ${idea.category}\nTrending Score: ${idea.trending_score}\nMarket Size: ${idea.market_size}`
    })
  }

  const handleHideIdea = async (ideaId: string, status: 'hidden' | 'building' = 'hidden') => {
    try {
      await hideIdea({ 
        idea_id: ideaId, 
        status,
        notes: status === 'building' ? 'Added to personal projects' : 'Hidden from feed'
      })
      
      // Remove from current list
      setStartupIdeas(prev => prev.filter(idea => idea.id !== ideaId))
      setShowHideModal(null)
      
      // Show success message
      alert(status === 'building' ? 'Idea added to your personal projects!' : 'Idea hidden from your feed!')
    } catch (err) {
      console.error('Failed to hide idea:', err)
      alert('Failed to hide idea. Please try again.')
    }
  }

  const handleQuickHide = (ideaId: string, title: string) => {
    setShowHideModal({ ideaId, title })
  }

  const renderAnalysisResult = () => {
    if (!analysisResult || !selectedIdea) return null
    
    const idea = startupIdeas.find(i => i.id === selectedIdea)
    if (!idea) return null

    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Analysis Results</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            analysisResult.tier_used === 'enterprise' ? 'bg-yellow-500 text-gray-900' :
            analysisResult.tier_used === 'investor' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-blue-500/20 text-blue-500'
          }`}>
            {analysisResult.tier_used.toUpperCase()} TIER
          </span>
        </div>
        
        <div className="text-white font-semibold">{idea.title}</div>
        
        {/* GPT-4 Analysis */}
        {analysisResult.gpt4_analysis && (
          <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-600/20">
            <div className="flex items-center mb-3">
              <Brain className="w-5 h-5 text-blue-400 mr-2" />
              <h4 className="font-semibold text-blue-400">GPT-4 Technical Analysis</h4>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {typeof analysisResult.gpt4_analysis === 'string' 
                  ? analysisResult.gpt4_analysis 
                  : JSON.stringify(analysisResult.gpt4_analysis, null, 2)
                }
              </pre>
            </div>
          </div>
        )}
        
        {/* Claude Analysis */}
        {analysisResult.claude_analysis && (
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-yellow-500 mr-2" />
              <h4 className="font-semibold text-yellow-500">Claude Strategic Insights</h4>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {typeof analysisResult.claude_analysis === 'string' 
                  ? analysisResult.claude_analysis 
                  : JSON.stringify(analysisResult.claude_analysis, null, 2)
                }
              </pre>
            </div>
          </div>
        )}
        
        {/* Combined Analysis */}
        {analysisResult.combined_analysis && (
          <div className="bg-purple-600/10 rounded-lg p-4 border border-purple-600/20">
            <div className="flex items-center mb-3">
              <Zap className="w-5 h-5 text-purple-400 mr-2" />
              <h4 className="font-semibold text-purple-400">Combined Investment Thesis</h4>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {typeof analysisResult.combined_analysis === 'string' 
                  ? analysisResult.combined_analysis 
                  : JSON.stringify(analysisResult.combined_analysis, null, 2)
                }
              </pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout 
      title={`Startup Ideas ${isAdmin ? '(Admin Mode)' : ''}`} 
      subtitle={`Discover and analyze opportunities with ${currentTier === 'free' || currentTier === 'founder' ? 'GPT-4' : 'dual-AI'} intelligence${isAdmin ? ' - Admin controls enabled' : ''}`}
    >
      <div className="space-y-6">
        {/* Usage Status */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-blue-500" />
              <span className="text-white font-medium">
                Daily Usage: {dailyUsage}{dailyLimit > 0 ? `/${dailyLimit}` : ' (Unlimited)'}
              </span>
              {isAdmin && (
                <span className="px-2 py-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full">
                  ADMIN ACCESS
                </span>
              )}
            </div>
            {!canAnalyze && (
              <Link to="/pricing">
                <Button size="sm">
                  Upgrade for More
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Analysis Result */}
        {renderAnalysisResult()}
        
        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading startup ideas...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">Error loading startup ideas: {error}</p>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
          </div>
        )}
        
        {/* Ideas Grid */}
        {!isLoading && !error && (
          <div className="grid gap-6">
            {startupIdeas.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                <p className="text-gray-300">No startup ideas found.</p>
              </div>
            ) : (
              startupIdeas.map((idea) => (
                <div key={idea.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-bold text-white">{idea.title}</h3>
                    <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                      {idea.category}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{idea.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-gray-300">Score: {idea.trending_score || 0}</span>
                    </div>
                    <div className="text-gray-300">Market: {idea.market_size || 'Unknown'}</div>
                  </div>
                </div>
                
                <div className="ml-6 space-y-2">
                  <div className="flex flex-col space-y-2">
                    {/* Debug info */}
                    <div style={{background: '#333', padding: '8px', fontSize: '10px', color: '#aaa'}}>
                      isAdmin: {isAdmin ? 'true' : 'false'}, 
                      email: {currentUserEmail || 'none'}
                    </div>
                    {canAnalyze ? (
                      <Button
                        onClick={() => handleAnalyze(idea)}
                        disabled={isAnalyzing && selectedIdea === idea.id || hidingIdea}
                        size="sm"
                      >
                        {currentTier === 'free' || currentTier === 'founder' ? 'Analyze' : 'Dual-AI Analyze'}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg mb-1">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <Link to="/pricing">
                          <Button size="sm" variant="secondary">
                            Upgrade
                          </Button>
                        </Link>
                      </div>
                    )}
                    
                    {/* Hide buttons - ADMIN ONLY */}
                    <div className="flex space-x-1 mt-2" style={{background: '#502828', padding: '10px', borderRadius: '8px', border: isAdmin ? '2px solid #ffcc00' : '2px solid #333', display: isAdmin ? 'flex' : 'none'}}>
                      {/* Force visible for debugging */}
                        <Button
                          onClick={() => handleHideIdea(idea.id, 'building')}
                          variant="secondary"
                          size="sm"
                          disabled={hidingIdea}
                          className="flex-1"
                          style={{background: '#2a623d', color: 'white'}}
                        >
                          <Building2 className="w-3 h-3 mr-1" />
                          Admin: I'm Building This
                        </Button>
                        <Button
                          onClick={() => handleQuickHide(idea.id, idea.title)}
                          variant="secondary"
                          size="sm"
                          disabled={hidingIdea}
                          style={{background: '#8c3d00', color: 'white'}}
                        >
                          <EyeOff className="w-3 h-3 mr-1" />
                          Admin: Hide Idea
                        </Button>
                      </div>
                  </div>
                </div>
                </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Upgrade Prompt */}
        {(currentTier === 'free' || currentTier === 'founder') && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-blue-500/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Unlock Strategic Business Analysis
              </h3>
              <p className="text-gray-300 mb-4">
                Upgrade to Investor tier to get Claude's strategic insights alongside GPT-4's technical analysis.
              </p>
              <Link to="/pricing">
                <Button>
                  <Zap className="mr-2 w-4 h-4" />
                  See Dual-AI Plans
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Hide Idea Modal - ADMIN ONLY */}
      {isAdmin && showHideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Admin: Hide Idea</h3>
            <p className="text-gray-300 mb-4">
              How would you like to handle "<span className="font-semibold">{showHideModal.title}</span>"?
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleHideIdea(showHideModal.ideaId, 'building')}
                disabled={hidingIdea}
                className="w-full justify-start"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Admin: I'm Building This (Add to Projects)
              </Button>
              
              <Button
                onClick={() => handleHideIdea(showHideModal.ideaId, 'hidden')}
                variant="secondary"
                disabled={hidingIdea}
                className="w-full justify-start"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Admin: Just Hide It (Not Interested)
              </Button>
              
              <Button
                onClick={() => setShowHideModal(null)}
                variant="secondary"
                disabled={hidingIdea}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}