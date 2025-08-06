import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Sliders,
  Database,
  Save,
  RotateCcw,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  TestTube,
  Shield,
  Calendar,
  History
} from 'lucide-react'

export function Configuration() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Check admin access
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-white">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              You need administrator privileges to access this configuration page.
            </p>
            <p className="text-sm text-gray-400">
              Please contact your system administrator if you believe you should have access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    openai: '',
    github: '',
    serpapi: ''
  })
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({
    openai: false,
    github: false,
    serpapi: false
  })
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({})
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({})
  const [historicalTimeRange, setHistoricalTimeRange] = useState<string>('1_month')
  const [savingTimeRange, setSavingTimeRange] = useState(false)
  const queryClient = useQueryClient()

  const { data: scoringWeights, isLoading: weightsLoading } = useQuery({
    queryKey: ['scoring-weights'],
    queryFn: api.getScoringWeights
  })

  const { data: apiKeysStatus, refetch: refetchApiKeys } = useQuery({
    queryKey: ['api-keys-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-keys-manager', {
        body: { action: 'status' }
      })
      if (error) throw error
      return data.data
    }
  })

  React.useEffect(() => {
    if (scoringWeights) {
      // Only include actual scoring weights, exclude configuration parameters
      const actualScoringWeights = scoringWeights.filter(weight => 
        !weight.weight_name.includes('time_range') && 
        !weight.weight_name.includes('_days') &&
        weight.weight_name !== 'historical_time_range_days'
      )
      
      const initialWeights = actualScoringWeights.reduce((acc: Record<string, number>, weight) => {
        acc[weight.weight_name] = weight.weight_value
        return acc
      }, {} as Record<string, number>)
      setWeights(initialWeights)
    }
  }, [scoringWeights])

  // Load current historical time range setting
  React.useEffect(() => {
    const loadTimeRangeSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('scoring_weights')
          .select('weight_value')
          .eq('weight_name', 'historical_time_range_days')
          .maybeSingle()
        
        if (!error && data) {
          const days = data.weight_value
          if (days <= 7) setHistoricalTimeRange('1_week')
          else if (days <= 30) setHistoricalTimeRange('1_month')
          else if (days <= 90) setHistoricalTimeRange('3_months')
          else if (days <= 180) setHistoricalTimeRange('6_months')
          else setHistoricalTimeRange('1_year')
        }
      } catch (error) {
        console.error('Error loading time range setting:', error)
      }
    }
    loadTimeRangeSetting()
  }, [])

  const updateWeightMutation = useMutation({
    mutationFn: ({ weightName, newValue }: { weightName: string, newValue: number }) => 
      api.updateScoringWeight(weightName, newValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-weights'] })
      toast({
        title: 'Configuration Saved',
        description: 'Scoring weights have been updated successfully.',
      })
      setHasChanges(false)
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to update scoring weights.',
        variant: 'destructive'
      })
    }
  })

  const handleWeightChange = (weightName: string, value: number) => {
    setWeights(prev => ({ ...prev, [weightName]: value }))
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    try {
      for (const [weightName, value] of Object.entries(weights)) {
        await updateWeightMutation.mutateAsync({ weightName, newValue: value })
      }
    } catch (error) {
      console.error('Error saving weights:', error)
    }
  }

  const handleResetDefaults = () => {
    const defaultWeights = {
      'market_size': 0.25,
      'market_growth': 0.15,
      'competition_level': 0.20,
      'development_complexity': 0.10,
      'time_to_market': 0.10,
      'revenue_potential': 0.15,
      'risk_factor': 0.05
    }
    setWeights(defaultWeights)
    setHasChanges(true)
  }

  const handleApiKeyChange = (keyType: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [keyType]: value }))
  }

  const toggleApiKeyVisibility = (keyType: string) => {
    setShowApiKeys(prev => ({ ...prev, [keyType]: !prev[keyType] }))
  }

  const handleTestApiKey = async (keyType: string) => {
    if (!apiKeys[keyType]) {
      toast({
        title: 'Error',
        description: 'Please enter an API key before testing.',
        variant: 'destructive'
      })
      return
    }

    setTestingKeys(prev => ({ ...prev, [keyType]: true }))
    
    try {
      const { data, error } = await supabase.functions.invoke('api-keys-manager', {
        body: {
          action: 'test',
          keyType,
          keyValue: apiKeys[keyType]
        }
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: 'Test Successful',
          description: data.message,
        })
      } else {
        toast({
          title: 'Test Failed',
          description: data.message,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Test Error',
        description: error.message || 'Failed to test API key',
        variant: 'destructive'
      })
    } finally {
      setTestingKeys(prev => ({ ...prev, [keyType]: false }))
    }
  }

  const handleSaveApiKey = async (keyType: string) => {
    if (!apiKeys[keyType]) {
      toast({
        title: 'Error',
        description: 'Please enter an API key before saving.',
        variant: 'destructive'
      })
      return
    }

    setSavingKeys(prev => ({ ...prev, [keyType]: true }))
    
    try {
      const { data, error } = await supabase.functions.invoke('api-keys-manager', {
        body: {
          action: 'save',
          keyType,
          keyValue: apiKeys[keyType]
        }
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: 'Saved Successfully',
          description: data.message,
        })
        
        // Clear the input field for security
        setApiKeys(prev => ({ ...prev, [keyType]: '' }))
        
        // Refresh API keys status
        refetchApiKeys()
      } else {
        toast({
          title: 'Save Failed',
          description: data.message,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Save Error',
        description: error.message || 'Failed to save API key',
        variant: 'destructive'
      })
    } finally {
      setSavingKeys(prev => ({ ...prev, [keyType]: false }))
    }
  }

  const getApiKeyStatus = (keyType: string) => {
    if (!apiKeysStatus?.keys) return null
    return apiKeysStatus.keys.find((key: any) => key.keyType === keyType)
  }

  const handleTimeRangeChange = async (value: string) => {
    setHistoricalTimeRange(value)
    setSavingTimeRange(true)
    
    try {
      // Convert time range to days
      const timeRangeToDays: { [key: string]: number } = {
        '1_week': 7,
        '1_month': 30,
        '3_months': 90,
        '6_months': 180,
        '1_year': 365
      }
      
      const days = timeRangeToDays[value] || 30
      
      // Update or insert the historical time range setting
      const { error } = await supabase
        .from('scoring_weights')
        .upsert({
          weight_name: 'historical_time_range_days',
          weight_value: days,
          description: 'Number of days to look back for app idea discovery',
          is_active: true,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      toast({
        title: 'Time Range Updated',
        description: `Historical search range set to ${value.replace('_', ' ')}.`,
      })
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update time range setting.',
        variant: 'destructive'
      })
    } finally {
      setSavingTimeRange(false)
    }
  }

  // Calculate total weight to ensure it equals 1.0
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  const isValidTotal = Math.abs(totalWeight - 1.0) < 0.001

  if (weightsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/3 animate-skeleton"></div>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded w-1/4 animate-skeleton"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-16 bg-gray-700 rounded animate-skeleton"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Configuration</h1>
          <p className="text-gray-400 mt-1">
            Configure scoring weights, API keys, and data source settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="warning" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleResetDefaults}
            disabled={updateWeightMutation.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || !isValidTotal || updateWeightMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateWeightMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Weight Validation Alert */}
      {!isValidTotal && Object.keys(weights).length > 0 && (
        <Card className="border-red-500 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="font-medium text-red-400">Invalid Weight Configuration</h4>
                <p className="text-sm text-red-300">
                  Total weights must equal 1.0 (currently: {totalWeight.toFixed(3)})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Time Range Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-primary" />
            <span>Historical Data Collection Range</span>
            <Badge variant="secondary" className="ml-2">
              <Calendar className="w-3 h-3 mr-1" />
              Admin Setting
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Control how far back the system searches for app ideas and startup trends.
              This affects data collection algorithms for Smart App Ideas discovery and market intelligence.
            </p>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">Time Range for Historical Search</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { value: '1_week', label: '1 Week', description: 'Most recent trends only' },
                  { value: '1_month', label: '1 Month', description: 'Balanced recency vs coverage' },
                  { value: '3_months', label: '3 Months', description: 'Broader trend analysis' },
                  { value: '6_months', label: '6 Months', description: 'Comprehensive insights' },
                  { value: '1_year', label: '1 Year', description: 'Full historical context' }
                ].map((option) => (
                  <div key={option.value} className="space-y-2">
                    <Button
                      variant={historicalTimeRange === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeRangeChange(option.value)}
                      disabled={savingTimeRange}
                      className={`w-full justify-center ${
                        historicalTimeRange === option.value 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : ''
                      }`}
                    >
                      {savingTimeRange ? (
                        <Clock className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Calendar className="w-3 h-3 mr-1" />
                      )}
                      {option.label}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Information */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-400">Impact on Data Collection</h4>
                  <p className="text-sm text-blue-300 mt-1">
                    This setting affects the historical backfill process and determines how far back 
                    the system searches across Reddit, Indie Hackers, GitHub, and other sources for 
                    app ideas and market trends. Longer ranges provide more comprehensive insights 
                    but may include less relevant historical data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-primary" />
            <span>API Keys Management</span>
            <Badge variant="secondary" className="ml-2">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-sm text-gray-400">
              Securely configure API keys for enhanced data collection and AI-powered analysis. 
              All keys are encrypted and stored securely.
            </p>
            
            <div className="grid gap-6">
              {/* OpenAI API Key */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-white">OpenAI API Key</Label>
                    <p className="text-xs text-gray-400">
                      Required for AI-powered painpoint analysis and sentiment scoring
                    </p>
                  </div>
                  {getApiKeyStatus('openai') && (
                    <div className="flex items-center space-x-2">
                      {getApiKeyStatus('openai')?.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400">Not Connected</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKeys.openai ? 'text' : 'password'}
                      placeholder="sk-proj-... or sk-..."
                      value={apiKeys.openai}
                      onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => toggleApiKeyVisibility('openai')}
                    >
                      {showApiKeys.openai ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestApiKey('openai')}
                    disabled={testingKeys.openai || !apiKeys.openai}
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    {testingKeys.openai ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveApiKey('openai')}
                    disabled={savingKeys.openai || !apiKeys.openai}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {savingKeys.openai ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>

              {/* GitHub Personal Access Token */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-white">GitHub Personal Access Token</Label>
                    <p className="text-xs text-gray-400">
                      For GitHub Issues and repository analysis
                    </p>
                  </div>
                  {getApiKeyStatus('github') && (
                    <div className="flex items-center space-x-2">
                      {getApiKeyStatus('github')?.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400">Not Connected</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKeys.github ? 'text' : 'password'}
                      placeholder="ghp_... or github_pat_..."
                      value={apiKeys.github}
                      onChange={(e) => handleApiKeyChange('github', e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => toggleApiKeyVisibility('github')}
                    >
                      {showApiKeys.github ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestApiKey('github')}
                    disabled={testingKeys.github || !apiKeys.github}
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    {testingKeys.github ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveApiKey('github')}
                    disabled={savingKeys.github || !apiKeys.github}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {savingKeys.github ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>

              {/* SERPAPI Key */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-white">SERPAPI Key</Label>
                    <p className="text-xs text-gray-400">
                      For Google Trends and web search (user mentioned already added)
                    </p>
                  </div>
                  {getApiKeyStatus('serpapi') && (
                    <div className="flex items-center space-x-2">
                      {getApiKeyStatus('serpapi')?.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400">Not Connected</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKeys.serpapi ? 'text' : 'password'}
                      placeholder="Your SERPAPI key"
                      value={apiKeys.serpapi}
                      onChange={(e) => handleApiKeyChange('serpapi', e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => toggleApiKeyVisibility('serpapi')}
                    >
                      {showApiKeys.serpapi ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestApiKey('serpapi')}
                    disabled={testingKeys.serpapi || !apiKeys.serpapi}
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    {testingKeys.serpapi ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveApiKey('serpapi')}
                    disabled={savingKeys.serpapi || !apiKeys.serpapi}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {savingKeys.serpapi ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-400">Security Information</h4>
                  <p className="text-sm text-blue-300 mt-1">
                    All API keys are encrypted and stored securely. Keys are never exposed in the frontend 
                    and are only accessible by authorized backend services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Weights Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-primary" />
            <span>Scoring Algorithm Weights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-sm text-gray-400">
              Adjust the importance of each factor in the overall scoring algorithm. 
              All weights must sum to 1.0 (100%).
            </p>
            
            <div className="space-y-4">
              {scoringWeights?.map((weight) => {
                const currentValue = weights[weight.weight_name] || 0
                const percentage = Math.round(currentValue * 100)
                
                return (
                  <div key={weight.weight_name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-white capitalize">
                          {weight.weight_name.replace('_', ' ')}
                        </label>
                        <p className="text-xs text-gray-400">
                          {weight.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {percentage}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {currentValue.toFixed(3)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={currentValue}
                        onChange={(e) => handleWeightChange(weight.weight_name, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Total Weight Display */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Total Weight</span>
                <div className="flex items-center space-x-2">
                  {isValidTotal ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-lg font-bold ${
                    isValidTotal ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {totalWeight.toFixed(3)}
                  </span>
                  <span className="text-sm text-gray-400">/ 1.000</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Data Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Monitor the status and configuration of data collection sources.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Product Hunt', status: 'active', lastSync: '2 hours ago', frequency: '24h' },
                { name: 'TechCrunch', status: 'active', lastSync: '1 hour ago', frequency: '12h' },
                { name: 'Reddit Startups', status: 'active', lastSync: '30 minutes ago', frequency: '6h' },
                { name: 'AngelList', status: 'active', lastSync: '4 hours ago', frequency: '24h' },
                { name: 'VentureBeat', status: 'active', lastSync: '1 hour ago', frequency: '12h' }
              ].map((source) => (
                <div key={source.name} className="p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{source.name}</h4>
                    <Badge variant={source.status === 'active' ? 'success' : 'destructive'}>
                      {source.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Last Sync:</span>
                      <span>{source.lastSync}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Frequency:</span>
                      <span>{source.frequency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-white">Data Collection</div>
              <div className="text-xs text-green-400">Active</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-white">Analysis Engine</div>
              <div className="text-xs text-green-400">Running</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-white">Next Automation</div>
              <div className="text-xs text-blue-400">6:00 AM Tomorrow</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}