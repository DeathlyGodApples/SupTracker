import React from 'react'
import { Clock, Crown, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStripe } from '../hooks/useStripe'

export function TrialBanner() {
  const { profile, isPremium, isTrialExpired } = useAuth()
  const { createCheckoutSession, loading, error } = useStripe()

  if (isPremium || !profile) return null

  const handleUpgrade = async () => {
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID
    
    if (!priceId) {
      console.error('Stripe Price ID not configured')
      return
    }

    await createCheckoutSession(priceId)
  }

  const trialEndsAt = new Date(profile.trial_ends_at)
  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  if (isTrialExpired) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">
              Your free trial has expired. Upgrade to continue using all features.
            </span>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-1 px-3 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade Now'
            )}
          </button>
        </div>
        {error && (
          <div className="text-red-200 text-xs text-center mt-2">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Crown className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {daysLeft > 0 
              ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial`
              : 'Your free trial ends today'
            }
          </span>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-white/20 hover:bg-white/30 text-white font-medium py-1 px-3 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing...
            </>
          ) : (
            'Upgrade'
          )}
        </button>
      </div>
      {error && (
        <div className="text-red-200 text-xs text-center mt-2">
          {error}
        </div>
      )}
    </div>
  )
}