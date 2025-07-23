import React from 'react'
import { Crown, X, Check, Loader2 } from 'lucide-react'
import { useStripe } from '../hooks/useStripe'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  feature: string
}

export function UpgradePrompt({ isOpen, onClose, title, description, feature }: UpgradePromptProps) {
  const { createCheckoutSession, loading, error } = useStripe()

  if (!isOpen) return null

  const handleUpgrade = async () => {
    // Replace with your actual Stripe Price ID
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID
    
    if (!priceId) {
      console.error('Stripe Price ID not configured')
      return
    }

    await createCheckoutSession(priceId)
  }

  const features = [
    'Unlimited medications',
    'Advanced analytics & insights',
    'Full calendar access (past & future)',
    'Cloud sync & backup',
    'Priority support',
    'Export data (PDF, CSV)'
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Premium Features Include:
          </h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade to Premium - $9.99/month'
            )}
          </button>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            onClick={onClose}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}