export const STRIPE_PRODUCTS = [
  {
    priceId: 'price_1RnxlaRoH7JOI5ttHIVeNVCZ',
    name: 'MedTracker Premium Subscription',
    description: 'Enjoy unlimited access to all premium features, including full analytics, unlimited medication tracking, calendar navigation, and multi-year planning. After your 7-day free trial, continue your journey with a premium subscription. Cancel anytime.',
    mode: 'subscription' as const,
    price: '$9.99/month'
  }
] as const;

export type StripeProduct = typeof STRIPE_PRODUCTS[number];