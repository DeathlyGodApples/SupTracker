import React, { useEffect } from 'react'
import { CheckCircle, ArrowRight, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'

export function SuccessPage() {
  const { refreshProfile } = useAuth()
  const { refetch, productInfo, isPremium } = useSubscription()

  useEffect(() => {
    // Refresh user profile and subscription data to get updated premium status
    const timer = setTimeout(() => {
      refreshProfile()
      refetch()
    }, 2000)

    return () => clearTimeout(timer)
  }, [refreshProfile, refetch])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isPremium ? 'Welcome to Premium!' : 'Payment Successful!'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isPremium 
              ? `Your ${productInfo?.name || 'premium'} subscription has been activated successfully. You now have access to all premium features including unlimited medications, advanced analytics, and full calendar access.`
              : 'Your payment has been processed successfully. Please wait a moment while we activate your subscription.'
            }
          </p>

          {productInfo && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {productInfo.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {productInfo.description}
              </p>
            </div>
          )}
          
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