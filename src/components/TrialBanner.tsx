import React from 'react'
import { Clock, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function TrialBanner() {
  const { profile, isPremium, isTrialExpired } = useAuth()

  if (isPremium || !profile) return null

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
            onClick={() => {
              // TODO: Implement payment flow
              console.log('Upgrade to premium')
            }}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-1 px-3 rounded-md transition-colors text-sm"
          >
            Upgrade Now
          </button>
        </div>
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
          onClick={() => {
            // TODO: Implement payment flow
            console.log('Upgrade to premium')
          }}
          className="bg-white/20 hover:bg-white/30 text-white font-medium py-1 px-3 rounded-md transition-colors text-sm"
        >
          Upgrade
        </button>
      </div>
    </div>
  )
}