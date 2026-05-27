import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import {
  getCheckoutBase,
  getServerEnv,
  getStripeConfig,
  getSupabaseAuthConfig,
  logStripeConfigStatus,
  logStripeError,
} from './env.js'

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization
  if (!header || typeof header !== 'string') return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

function createSupabaseAdmin(env) {
  const { url, serviceKey } = getSupabaseAuthConfig(env)
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or Supabase URL')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function getUserFromRequest(req, env) {
  const token = getBearerToken(req)
  if (!token) return { error: 'Not authenticated', status: 401 }

  const { url, anonKey } = getSupabaseAuthConfig(env)
  if (!url || !anonKey) {
    return { error: 'Supabase is not configured', status: 500 }
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    console.error('[stripe-api:auth] getUser failed:', error?.message || 'no user')
    return { error: 'Invalid session', status: 401 }
  }
  return { user: data.user }
}

export async function handleCreateCheckoutSession(req, res, env) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  logStripeConfigStatus(env, 'create-checkout-session')

  try {
    const auth = await getUserFromRequest(req, env)
    if (auth.error) {
      json(res, auth.status, { error: auth.error })
      return
    }

    const { secretKey, priceId } = getStripeConfig(env)
    if (!secretKey) {
      console.error('[stripe-api:create-checkout-session] STRIPE_SECRET_KEY is missing from .env')
      json(res, 500, { error: 'Stripe secret key is not configured (STRIPE_SECRET_KEY)' })
      return
    }
    if (!priceId) {
      console.error('[stripe-api:create-checkout-session] VITE_STRIPE_PRICE_ID is missing from .env')
      json(res, 500, { error: 'Stripe price ID is not configured (VITE_STRIPE_PRICE_ID)' })
      return
    }

    const base = getCheckoutBase(env)
    const successUrl = `${base}/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${base}/pricing`

    console.info('[stripe-api:create-checkout-session] creating session', {
      userId: auth.user.id,
      priceId,
      successUrl,
      cancelUrl,
    })

    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: auth.user.id,
      metadata: { supabase_user_id: auth.user.id },
      customer_email: auth.user.email ?? undefined,
    })

    json(res, 200, { url: session.url, sessionId: session.id })
  } catch (err) {
    logStripeError('create-checkout-session', err)
    json(res, 500, {
      error: err.message || 'Could not start checkout',
      code: err.code || err.type || undefined,
    })
  }
}

function getCheckoutCustomerEmail(checkoutSession) {
  const email =
    checkoutSession.customer_details?.email ||
    checkoutSession.customer_email ||
    ''
  return email.trim().toLowerCase()
}

async function unlockProfileById(supabaseAdmin, userId) {
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ has_paid: true })
    .eq('id', userId)

  if (updateError) {
    throw updateError
  }
}

async function recordPaymentGrant(supabaseAdmin, email, stripeSessionId) {
  const { error: grantError } = await supabaseAdmin.from('payment_grants').upsert(
    {
      email,
      stripe_session_id: stripeSessionId,
    },
    { onConflict: 'email' },
  )

  if (grantError) {
    throw grantError
  }
}

export async function handleConfirmCheckout(req, res, env) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  logStripeConfigStatus(env, 'confirm-checkout')

  try {
    const { secretKey } = getStripeConfig(env)
    if (!secretKey) {
      json(res, 500, { error: 'Stripe secret key is not configured (STRIPE_SECRET_KEY)' })
      return
    }

    let body
    try {
      body = await readBody(req)
    } catch (parseErr) {
      logStripeError('confirm-checkout', parseErr, { step: 'parse-body' })
      json(res, 400, { error: 'Invalid request body' })
      return
    }

    const sessionId = body.sessionId || body.session_id
    if (!sessionId) {
      json(res, 400, { error: 'Missing session_id' })
      return
    }

    const stripe = new Stripe(secretKey)
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    const paid =
      checkoutSession.payment_status === 'paid' ||
      checkoutSession.status === 'complete'

    if (!paid) {
      json(res, 400, { error: 'Payment not completed' })
      return
    }

    const ownerId =
      checkoutSession.metadata?.supabase_user_id ||
      checkoutSession.client_reference_id ||
      null

    const customerEmail = getCheckoutCustomerEmail(checkoutSession)

    const token = getBearerToken(req)
    let authUser = null
    if (token) {
      const auth = await getUserFromRequest(req, env)
      if (auth.user) {
        authUser = auth.user
      }
    }

    if (authUser && ownerId && authUser.id !== ownerId) {
      json(res, 403, { error: 'Checkout session does not belong to this account' })
      return
    }

    const supabaseAdmin = createSupabaseAdmin(env)

    if (ownerId) {
      await unlockProfileById(supabaseAdmin, ownerId)
      console.info('[stripe-api:confirm-checkout] unlocked profile', { userId: ownerId })
      json(res, 200, {
        ok: true,
        has_paid: true,
        needsAccount: false,
        userId: ownerId,
      })
      return
    }

    if (customerEmail) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle()

      if (existingProfile?.id) {
        await unlockProfileById(supabaseAdmin, existingProfile.id)
        console.info('[stripe-api:confirm-checkout] unlocked by email', {
          email: customerEmail,
          userId: existingProfile.id,
        })
        json(res, 200, {
          ok: true,
          has_paid: true,
          needsAccount: false,
          userId: existingProfile.id,
        })
        return
      }

      await recordPaymentGrant(supabaseAdmin, customerEmail, sessionId)
      console.info('[stripe-api:confirm-checkout] payment grant stored', {
        email: customerEmail,
      })
      json(res, 200, {
        ok: true,
        has_paid: false,
        needsAccount: true,
        email: customerEmail,
      })
      return
    }

    json(res, 400, {
      error: 'Could not link this payment to an account. Contact support with your receipt.',
    })
  } catch (err) {
    logStripeError('confirm-checkout', err)
    json(res, 500, { error: err.message || 'Could not verify payment' })
  }
}

export async function handleStripeApiRequest(req, res, env) {
  const base = getCheckoutBase(env)
  const url = new URL(req.url, `${base}/`)

  try {
    if (url.pathname === '/api/create-checkout-session') {
      await handleCreateCheckoutSession(req, res, env)
      return true
    }

    if (url.pathname === '/api/confirm-checkout') {
      await handleConfirmCheckout(req, res, env)
      return true
    }

    return false
  } catch (err) {
    logStripeError('unhandled', err, { path: url.pathname })
    json(res, 500, { error: err.message || 'Internal server error' })
    return true
  }
}
