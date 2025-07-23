import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { STRIPE_PRODUCTS } from '../stripe-config'

interface SubscriptionData {
  customer_id: string | null
  subscription_id: string | null
  subscription_status: string | null
  price_id: string | null
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean | null
  payment_method_brand: string | null
  payment_method_last4: string | null
}

export function useSubscription() {
  const { user, profile, loading: profileLoading } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profileLoading) {
      // Wait for profile to load first
      return
    }
    
    if (user) {
      fetchSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user, profileLoading])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error) {
        // If Stripe tables don't exist, fall back to profile-based premium status
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('Stripe tables not yet created, using profile-based premium status')
          setSubscription(null)
        } else {
          console.error('Error fetching subscription:', error)
          setError(error.message)
        }
      } else {
        setSubscription(data)
      }
    } catch (err) {
      console.error('Error in fetchSubscription:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getProductInfo = () => {
    if (!subscription?.price_id) return null
    
    return STRIPE_PRODUCTS.find(product => product.priceId === subscription.price_id) || null
  }

  // If we have subscription data, use it
  const isActive = subscription?.subscription_status === 'active'
  const isTrialing = subscription?.subscription_status === 'trialing'
  
  // Fall back to profile-based premium status if no subscription data
  const isPremium = isActive || isTrialing || (profile?.is_premium ?? false)

  return {
    subscription,
    loading,
    error,
    isActive,
    isTrialing,
    isPremium,
    productInfo: getProductInfo(),
    refetch: fetchSubscription,
  }
}