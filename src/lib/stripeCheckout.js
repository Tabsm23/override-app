import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '../supabase'

let stripePromise

function getStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!key) return null
  if (!stripePromise) {
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

/**
 * Starts Stripe Checkout for the signed-in user.
 * Loads @stripe/stripe-js then redirects to the hosted checkout URL.
 */
export async function startStripeCheckout({ onRequireAuth } = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    if (onRequireAuth) {
      onRequireAuth()
    } else {
      window.location.href = '/auth'
    }
    return
  }

  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  const priceId = import.meta.env.VITE_STRIPE_PRICE_ID

  if (!publishableKey || !priceId) {
    throw new Error('Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY and VITE_STRIPE_PRICE_ID.')
  }

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({}),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Could not start checkout')
  }

  if (!data.url) {
    throw new Error('No checkout URL returned')
  }

  await getStripe()
  window.location.assign(data.url)
}
