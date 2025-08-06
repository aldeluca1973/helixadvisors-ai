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
import { GiftTierManager } from '@/components/admin/GiftTierManager'
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
  History,
  Gift
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
      let days = 30
      switch (value) {
        case '1_week': days = 7; break;
        case '1_month': days = 30; break;
        case '3_months': days = 90; break;
        case '6_months': days = 180; break;
        case '1_year': days = 365; break;
      }
      
      const { error } = await supabase
        .from('scoring_weights')
        .update({ weight_value: days })
        .eq('weight_name', 'historical_time_range_days')
      
      if (error) throw error
      
      toast({
        title: 'Time Range Updated',
        description: `Historical data range set to ${days} days.`,
      })
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update time range.',
        variant: 'destructive'
      })
    } finally {
      setSavingTimeRange(false)
    }
  }

  const getTotalWeight = () => {
    return Object.values(weights).reduce((sum, value) => sum + value, 0)
  }

  const isValidWeightSum = () => {
    const total = getTotalWeight()
    return Math.abs(total - 1.0) < 0.01 // Allow small rounding errors
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            System Configuration
          </h1>
          <p className="text-gray-400">
            Manage AI settings, API keys, and system parameters
          </p>
        </div>
        <Badge variant="outline" className="text-red-500 border-red-500">
          Admin Mode
        </Badge>
      </div>

      {/* User Management Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Gift className="mr-2 h-5 w-5 text-yellow-500" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GiftTierManager />
        </CardContent>
      </Card>
      
      {/* Scoring Weights Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sliders className="mr-2 h-5 w-5 text-blue-500" />
            AI Scoring Weights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weightsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(weights).map(([weightName, value]) => (
                  <div key={weightName} className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor={weightName} className="text-gray-300 capitalize">
                        {weightName.replace(/_/g, ' ')}
                      </Label>
                      <span className="text-sm text-gray-400">{(value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2 items-center">
                      <input
                        id={weightName}
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={value}
                        onChange={(e) => handleWeightChange(weightName, parseFloat(e.target.value))}
                        className="col-span-5"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={value}
                        onChange={(e) => handleWeightChange(weightName, parseFloat(e.target.value))}
                        className="w-full bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Total Weight:</span>
                  <Badge 
                    variant={isValidWeightSum() ? 'default' : 'destructive'}
                    className={isValidWeightSum() ? 'bg-green-600' : ''}
                  >
                    {getTotalWeight().toFixed(2)}
                  </Badge>
                  {!isValidWeightSum() && (
                    <span className="text-xs text-red-500">
                      Total must equal 1.0
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetDefaults}
                    className="text-gray-300 border-gray-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Defaults
                  </Button>
                  <Button
                    disabled={!hasChanges || !isValidWeightSum() || updateWeightMutation.isPending}
                    onClick={handleSaveChanges}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* API Keys Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="mr-2 h-5 w-5 text-blue-500" />
            API Keys & Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* OpenAI API Key */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">AI</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">OpenAI API Key</h3>
                    <p className="text-sm text-gray-400">Used for GPT-4 analysis</p>
                  </div>
                </div>
                {getApiKeyStatus('openai') && (
                  <Badge 
                    variant={getApiKeyStatus('openai').isValid ? 'default' : 'destructive'}
                    className={getApiKeyStatus('openai').isValid ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {getApiKeyStatus('openai').isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2 mb-2">
                <div className="flex-1 relative">
                  <Input
                    type={showApiKeys.openai ? 'text' : 'password'} 
                    placeholder="Enter OpenAI API key"
                    value={apiKeys.openai}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    className="w-full bg-gray-800 border-gray-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('openai')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showApiKeys.openai ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  className="text-gray-300 border-gray-600"
                  onClick={() => handleTestApiKey('openai')}
                  disabled={testingKeys.openai}
                >
                  {testingKeys.openai ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  <span className="ml-2">Test</span>
                </Button>
                <Button
                  onClick={() => handleSaveApiKey('openai')}
                  disabled={savingKeys.openai}
                >
                  {savingKeys.openai ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="ml-2">Save</span>
                </Button>
              </div>
              
              {getApiKeyStatus('openai') && getApiKeyStatus('openai').lastChecked && (
                <p className="text-xs text-gray-500">
                  Last checked: {new Date(getApiKeyStatus('openai').lastChecked).toLocaleString()}
                </p>
              )}
            </div>
            
            {/* GitHub API Key */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">GH</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">GitHub API Key</h3>
                    <p className="text-sm text-gray-400">Used for repository analysis</p>
                  </div>
                </div>
                {getApiKeyStatus('github') && (
                  <Badge 
                    variant={getApiKeyStatus('github').isValid ? 'default' : 'destructive'}
                    className={getApiKeyStatus('github').isValid ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {getApiKeyStatus('github').isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2 mb-2">
                <div className="flex-1 relative">
                  <Input
                    type={showApiKeys.github ? 'text' : 'password'} 
                    placeholder="Enter GitHub API key"
                    value={apiKeys.github}
                    onChange={(e) => handleApiKeyChange('github', e.target.value)}
                    className="w-full bg-gray-800 border-gray-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('github')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showApiKeys.github ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  className="text-gray-300 border-gray-600"
                  onClick={() => handleTestApiKey('github')}
                  disabled={testingKeys.github}
                >
                  {testingKeys.github ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  <span className="ml-2">Test</span>
                </Button>
                <Button
                  onClick={() => handleSaveApiKey('github')}
                  disabled={savingKeys.github}
                >
                  {savingKeys.github ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="ml-2">Save</span>
                </Button>
              </div>
              
              {getApiKeyStatus('github') && getApiKeyStatus('github').lastChecked && (
                <p className="text-xs text-gray-500">
                  Last checked: {new Date(getApiKeyStatus('github').lastChecked).toLocaleString()}
                </p>
              )}
            </div>
            
            {/* SerpAPI Key */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">SE</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">SerpAPI Key</h3>
                    <p className="text-sm text-gray-400">Used for market research</p>
                  </div>
                </div>
                {getApiKeyStatus('serpapi') && (
                  <Badge 
                    variant={getApiKeyStatus('serpapi').isValid ? 'default' : 'destructive'}
                    className={getApiKeyStatus('serpapi').isValid ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {getApiKeyStatus('serpapi').isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2 mb-2">
                <div className="flex-1 relative">
                  <Input
                    type={showApiKeys.serpapi ? 'text' : 'password'} 
                    placeholder="Enter SerpAPI key"
                    value={apiKeys.serpapi}
                    onChange={(e) => handleApiKeyChange('serpapi', e.target.value)}
                    className="w-full bg-gray-800 border-gray-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('serpapi')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showApiKeys.serpapi ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  className="text-gray-300 border-gray-600"
                  onClick={() => handleTestApiKey('serpapi')}
                  disabled={testingKeys.serpapi}
                >
                  {testingKeys.serpapi ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  <span className="ml-2">Test</span>
                </Button>
                <Button
                  onClick={() => handleSaveApiKey('serpapi')}
                  disabled={savingKeys.serpapi}
                >
                  {savingKeys.serpapi ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="ml-2">Save</span>
                </Button>
              </div>
              
              {getApiKeyStatus('serpapi') && getApiKeyStatus('serpapi').lastChecked && (
                <p className="text-xs text-gray-500">
                  Last checked: {new Date(getApiKeyStatus('serpapi').lastChecked).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Historical Data Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="mr-2 h-5 w-5 text-blue-500" />
            Historical Data Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="block text-gray-300 mb-2">
                Historical Data Time Range
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={historicalTimeRange === '1_week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('1_week')}
                  disabled={savingTimeRange}
                  className={historicalTimeRange !== '1_week' ? 'text-gray-300 border-gray-600' : ''}
                >
                  1 Week
                </Button>
                <Button
                  variant={historicalTimeRange === '1_month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('1_month')}
                  disabled={savingTimeRange}
                  className={historicalTimeRange !== '1_month' ? 'text-gray-300 border-gray-600' : ''}
                >
                  1 Month
                </Button>
                <Button
                  variant={historicalTimeRange === '3_months' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('3_months')}
                  disabled={savingTimeRange}
                  className={historicalTimeRange !== '3_months' ? 'text-gray-300 border-gray-600' : ''}
                >
                  3 Months
                </Button>
                <Button
                  variant={historicalTimeRange === '6_months' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('6_months')}
                  disabled={savingTimeRange}
                  className={historicalTimeRange !== '6_months' ? 'text-gray-300 border-gray-600' : ''}
                >
                  6 Months
                </Button>
                <Button
                  variant={historicalTimeRange === '1_year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('1_year')}
                  disabled={savingTimeRange}
                  className={historicalTimeRange !== '1_year' ? 'text-gray-300 border-gray-600' : ''}
                >
                  1 Year
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Affects how far back the system looks for historical data and trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* System Status Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-500" />
            System Status & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-white">System Health</div>
              <div className="text-xs text-green-400">All Systems Normal</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <History className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-white">Last Analysis</div>
              <div className="text-xs text-yellow-400">Today, 6:00 AM</div>
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