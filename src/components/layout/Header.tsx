import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  RefreshCw,
  Download,
  Bell,
  Calendar,
  TrendingUp,
  X,
  User
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps = {}) {
  const { user, isAdmin } = useAuth()
  const { profileData } = useUserProfile()
  const [showNotifications, setShowNotifications] = useState(false)
  
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(5)
  })

  const { data: dailyReport, isLoading: reportLoading } = useQuery({
    queryKey: ['daily-report'],
    queryFn: () => api.getDailyReport()
  })

  const handleManualRefresh = async () => {
    try {
      toast({
        title: 'Refreshing Data',
        description: 'Triggering manual data collection and analysis...',
      })
      
      await Promise.all([
        api.triggerDataCollection(),
        api.generateReport()
      ])
      
      toast({
        title: 'Refresh Complete',
        description: 'Data has been updated successfully.',
      })
      
      // Refresh the page data
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'There was an error updating the data.',
        variant: 'destructive'
      })
    }
  }

  const handleExportReport = () => {
    if (!dailyReport?.top_ideas) {
      toast({
        title: 'No Data Available',
        description: 'No report data available to export.',
        variant: 'destructive'
      })
      return
    }

    // Create CSV content
    const headers = [
      'Rank',
      'Title',
      'Category',
      'Overall Score',
      'Market Score',
      'Competition Score',
      'Development Score',
      'ROI Score',
      'Source Platform'
    ]
    
    const csvContent = [
      headers.join(','),
      ...dailyReport.top_ideas.map((idea: any) => [
        idea.rank,
        `"${idea.title}"`,
        idea.category,
        idea.overall_score,
        idea.market_score,
        idea.competition_score,
        idea.development_score,
        idea.roi_score,
        idea.source_platform
      ].join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `startup-ideas-report-${dailyReport.report_date}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Export Complete',
      description: `Report exported as CSV file.`,
    })
  }

  const unreadNotifications = notifications?.filter(n => !n.is_read)?.length || 0

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {title || "Daily Startup Discovery Report"}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(new Date())}</span>
              {dailyReport && (
                <>
                  <span>•</span>
                  <TrendingUp className="w-4 h-4" />
                  <span>{dailyReport.total_ideas_analyzed || 0} ideas analyzed</span>
                </>
              )}
              {reportLoading && (
                <>
                  <span>•</span>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  {(profileData as any)?.profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </span>
                {isAdmin && (
                  <Badge variant="default" className="text-xs bg-red-600 hover:bg-red-700 px-1.5 py-0.5">
                    ADMIN
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {((profileData as any)?.current_tier?.toUpperCase()) || 'FREE'} Tier
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-900" />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
            </Button>
            {unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
            
            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-white font-medium">Notifications</h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowNotifications(false)}
                    className="h-6 w-6 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-700 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notification.is_read ? 'bg-gray-500' : 'bg-blue-400'}`}></div>
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-medium">{notification.title}</h4>
                            <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-500 text-xs mt-2">{formatDate(notification.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      No notifications available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>

          {/* Export Report */}
          <Button
            variant="default"
            size="sm"
            onClick={handleExportReport}
            disabled={!dailyReport?.top_ideas}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {dailyReport && (
        <div className="mt-4 flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">System Active</span>
            </div>
            <div className="text-sm text-gray-400">
              Last Report: {formatDate(dailyReport.generated_at)}
            </div>
            <div className="text-sm text-gray-400">
              Top Score: {dailyReport.top_ideas?.[0]?.overall_score?.toFixed(1) || 'N/A'}/100
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Next update in:</span>
            <Badge variant="outline" className="text-xs">
              {Math.ceil((24 - new Date().getHours()) % 24)} hours
            </Badge>
          </div>
        </div>
      )}
    </header>
  )
}