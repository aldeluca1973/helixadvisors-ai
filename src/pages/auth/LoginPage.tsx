import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Brain } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-lg">
              <Brain className="w-8 h-8 text-gray-900" />
            </div>
            <span className="text-2xl font-bold text-white">Dual AI</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-400">
            Sign in to access your dual-AI intelligence platform
          </p>
        </div>
        
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-medium">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}