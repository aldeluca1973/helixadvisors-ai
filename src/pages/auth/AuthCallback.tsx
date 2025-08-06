import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Brain } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          // No session found, redirect to login
          navigate('/login?error=No session found')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login?error=Authentication failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-lg">
            <Brain className="w-8 h-8 text-gray-900" />
          </div>
          <span className="text-2xl font-bold text-white">Dual AI</span>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication</h2>
        <p className="text-gray-400">Please wait while we verify your account...</p>
      </div>
    </div>
  )
}