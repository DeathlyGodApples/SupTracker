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
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error) {
        console.error('Error fetching subscription:', error)
        setError(error.message)
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

  const isActive = subscription?.subscription_status === 'active'
  const isTrialing = subscription?.subscription_status === 'trialing'
  const isPremium = isActive || isTrialing

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