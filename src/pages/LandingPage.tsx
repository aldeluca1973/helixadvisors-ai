import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Zap, Target, Cpu, Users, ArrowRight, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PLAN_FEATURES } from '@/lib/stripe'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-lg">
                <Brain className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-white">HelixAdvisors.AI</span>
            </div>
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

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8">
            Revolutionary
            <span className="block bg-gradient-to-r from-yellow-500 to-blue-500 bg-clip-text text-transparent">
              AI-Powered Intelligence
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Transform startup ideas into investment opportunities with advanced AI strategic analysis. 
            The only platform that combines technical feasibility with business intelligence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/ideas">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                See Demo
              </Button>
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="mt-16 flex justify-center items-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>1,000+ Entrepreneurs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>$50M+ Ideas Analyzed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose HelixAdvisors.AI Analysis?
            </h2>
            <p className="text-xl text-gray-300">
              Advanced AI intelligence for smarter investment decisions. Get technical and strategic insights in one platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">GPT-4 Technical Analysis</h3>
              <p className="text-gray-300">
                Deep technical feasibility analysis, implementation complexity assessment, and scalability evaluation.
              </p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Claude Strategic Insights</h3>
              <p className="text-gray-300">
                Business model validation, market opportunity analysis, and go-to-market strategy development.
              </p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Investment-Grade Reports</h3>
              <p className="text-gray-300">
                Combined analysis produces C-level reports with investment thesis and growth projections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Intelligence Tier
            </h2>
            <p className="text-xl text-gray-300">
              Unlock revolutionary insights with our tiered AI analysis platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(PLAN_FEATURES).map(([key, plan]) => (
              <div 
                key={key}
                className={`relative bg-gray-800 p-8 rounded-xl border ${
                  'popular' in plan && plan.popular ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-gray-700'
                }`}
              >
                {'popular' in plan && plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.interval}</span>
                  </div>
                  <p className="text-gray-300 mt-4">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link to="/signup">
                  <Button 
                    className="w-full" 
                    variant={'popular' in plan && plan.popular ? 'default' : 'outline'}
                  >
                    Start {plan.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-lg">
              <Brain className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-xl font-bold text-white">HelixAdvisors.AI</span>
          </div>
          <p className="text-gray-400">
            2025 HelixAdvisors.AI - Powered by Carism USA - All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  )
}