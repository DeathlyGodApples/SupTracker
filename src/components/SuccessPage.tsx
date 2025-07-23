import React, { useEffect } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function SuccessPage() {
  const { refreshProfile } = useAuth()

  useEffect(() => {
    // Refresh user profile to get updated premium status
    const timer = setTimeout(() => {
      refreshProfile()
    }, 2000)

    return () => clearTimeout(timer)
  }, [refreshProfile])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Premium!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your subscription has been activated successfully. You now have access to all premium features including unlimited medications, advanced analytics, and full calendar access.
          </p>
          
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}