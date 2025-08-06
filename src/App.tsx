import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Pages
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { AuthCallback } from '@/pages/auth/AuthCallback'
import { DashboardPage } from '@/pages/DashboardPage'
import { PricingPage } from '@/pages/PricingPage'
import { StartupIdeasPage } from '@/pages/StartupIdeasPage'
import { TwitterTrendsPage } from '@/pages/TwitterTrendsPage'
import { TrendsFeed } from '@/pages/TrendsFeed'
import { SearchPage } from '@/pages/SearchPage'
import { SmartAppIdeasPage } from '@/pages/SmartAppIdeasPage'
import { CollectionsPage } from '@/pages/CollectionsPage'
import { HistoricalTrends } from '@/pages/HistoricalTrends'
import { Configuration } from '@/pages/Configuration'
import { IdeaDetails } from '@/pages/IdeaDetails'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

// Protected Route wrapper with demo mode for testing
function ProtectedRoute({ children, allowDemo = false }: { children: React.ReactNode, allowDemo?: boolean }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // Allow demo access for testing core features
  if (!user && !allowDemo) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public Route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } 
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trends-feed" 
        element={
          <ProtectedRoute allowDemo={true}>
            <TrendsFeed />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search" 
        element={
          <ProtectedRoute allowDemo={true}>
            <SearchPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/smart-app-ideas" 
        element={
          <ProtectedRoute allowDemo={true}>
            <SmartAppIdeasPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ideas" 
        element={
          <ProtectedRoute allowDemo={true}>
            <StartupIdeasPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/collections" 
        element={
          <ProtectedRoute allowDemo={true}>
            <CollectionsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/historical-trends" 
        element={
          <ProtectedRoute allowDemo={true}>
            <HistoricalTrends />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/config" 
        element={
          <ProtectedRoute>
            <Configuration />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/idea/:ideaId" 
        element={
          <ProtectedRoute allowDemo={true}>
            <IdeaDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trends" 
        element={
          <ProtectedRoute allowDemo={true}>
            <TwitterTrendsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/account" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-900">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1F2937',
                  color: '#F3F4F6',
                  border: '1px solid #374151'
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#F3F4F6'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#F3F4F6'
                  }
                }
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}