import { useState } from 'react'
import { stripePromise } from '../lib/stripe'
import { supabase } from '../lib/supabase'

export function useStripe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutSession = async (priceId: string, mode: 'payment' | 'subscription' = 'subscription') => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`,
          mode,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) throw error

      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to initialize')

      if (data.url) {
        window.location.href = data.url
      } else {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        })
        if (stripeError) throw stripeError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createPortalSession = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: window.location.origin,
        },
      })

      if (error) throw error

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    createPortalSession,
    loading,
    error,
  }
}