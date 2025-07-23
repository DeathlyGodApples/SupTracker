import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message)
    return new Response(err.message, { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  console.log(`🔔 Event received: ${receivedEvent.type}`)

  try {
    switch (receivedEvent.type) {
      case 'checkout.session.completed':
        const checkoutSession = receivedEvent.data.object as Stripe.Checkout.Session
        
        if (checkoutSession.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            checkoutSession.subscription as string
          )
          
          const customerId = checkoutSession.customer as string
          const userId = checkoutSession.metadata?.user_id

          if (userId) {
            await supabaseAdmin
              .from('profiles')
              .update({
                is_premium: true,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId)
          }
        }
        break

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = receivedEvent.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const isActive = subscription.status === 'active'
          
          await supabaseAdmin
            .from('profiles')
            .update({
              is_premium: isActive,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)
        }
        break

      case 'invoice.payment_failed':
        const invoice = receivedEvent.data.object as Stripe.Invoice
        const failedCustomerId = invoice.customer as string

        // Get user by customer ID
        const { data: failedProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', failedCustomerId)
          .single()

        if (failedProfile) {
          // You might want to send an email notification here
          console.log(`Payment failed for user ${failedProfile.id}`)
        }
        break

      default:
        console.log(`Unhandled event type: ${receivedEvent.type}`)
    }
  } catch (error) {
    console.log(`Error processing webhook: ${error.message}`)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})