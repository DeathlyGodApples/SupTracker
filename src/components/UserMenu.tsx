import React, { useState } from 'react'
import { User, Settings, CreditCard, LogOut, ChevronDown, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { useStripe } from '../hooks/useStripe'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const { subscription, isPremium, productInfo } = useSubscription()
  const { createPortalSession, loading } = useStripe()
  const [isOpen, setIsOpen] = useState(false)

  const handleManageBilling = async () => {
    await createPortalSession()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center relative">
          <User className="w-4 h-4 text-white" />
          {isPremium && (
            <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
          )}
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium text-gray-900 dark:text-white">
                  {user?.email}
                </div>
                {isPremium && productInfo && (
                  <div className="flex items-center mt-1">
                    <Crown className="w-3 h-3 text-yellow-500 mr-1" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      {productInfo.name}
                    </span>
                  </div>
                )}
                {subscription?.subscription_status && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Status: {subscription.subscription_status}
                  </div>
                )}
              </div>
              
              {isPremium && (
                <button
                  onClick={handleManageBilling}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </button>
              )}
              
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}