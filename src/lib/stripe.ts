import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Create a promise that resolves to null if Stripe fails to load
export const stripePromise = (() => {
  if (!stripePublishableKey) {
    console.warn('Missing Stripe publishable key - Stripe features will be disabled');
    return Promise.resolve(null);
  }

  return loadStripe(stripePublishableKey).catch((error) => {
    console.warn('Stripe failed to load (likely blocked by ad blocker):', error);
    return null;
  });
})();