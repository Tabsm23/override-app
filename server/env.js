import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Defaults match `src/supabase.js` fallbacks.
const SUPABASE_URL_DEFAULT = 'https://lpzwhrapkwuqnxhlyeln.supabase.co'
const SUPABASE_ANON_DEFAULT =
  'sb_publishable_PlZlJUAHx-pOLMXYvWRR6Q_BZG5XSQh'

export const CHECKOUT_BASE_DEFAULT = 'http://localhost:5178'

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  const content = readFileSync(filePath, 'utf8')
  const out = {}

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    out[key] = value
  }

  return out
}

/**
 * Returns a plain object of env vars suitable for server runtime.
 * - Reads `.env*` files from `root`
 * - Overlays `process.env` (so actual runtime env wins)
 *
 * IMPORTANT: This is intentionally plain JSON-ish data (no getters/setters).
 */
export function getServerEnv(mode = 'development', root = process.cwd()) {
  const envDir = root || process.cwd()
  const files = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]
  const fromFiles = {}

  for (const file of files) {
    Object.assign(fromFiles, parseEnvFile(resolve(envDir, file)))
  }

  return {
    ...fromFiles,
    ...process.env,
  }
}

export function getCheckoutBase(env) {
  const base = String(
    env.CHECKOUT_BASE_URL || env.VITE_AUTH_REDIRECT_URL || CHECKOUT_BASE_DEFAULT,
  ).trim()
  return base.replace(/\/$/, '')
}

export function getStripeConfig(env) {
  return {
    secretKey: String(env.STRIPE_SECRET_KEY || '').trim(),
    priceId: String(env.VITE_STRIPE_PRICE_ID || env.STRIPE_PRICE_ID || '').trim(),
  }
}

export function getSupabaseAuthConfig(env) {
  return {
    url: String(env.VITE_SUPABASE_URL || env.SUPABASE_URL || SUPABASE_URL_DEFAULT).trim(),
    anonKey: String(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || SUPABASE_ANON_DEFAULT).trim(),
    serviceKey: String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
  }
}

export function logStripeConfigStatus(env, label = 'checkout') {
  const { secretKey, priceId } = getStripeConfig(env)
  const { url, anonKey, serviceKey } = getSupabaseAuthConfig(env)
  console.info(`[stripe-api:${label}] env check`, {
    hasStripeSecretKey: Boolean(secretKey),
    stripeSecretKeyPrefix: secretKey ? `${secretKey.slice(0, 7)}…` : null,
    priceId: priceId || null,
    hasSupabaseUrl: Boolean(url),
    hasSupabaseAnonKey: Boolean(anonKey),
    hasSupabaseServiceKey: Boolean(serviceKey),
    checkoutBase: getCheckoutBase(env),
  })
}

export function logStripeError(label, err, extra = {}) {
  console.error(`[stripe-api:${label}]`, {
    message: err?.message,
    type: err?.type,
    code: err?.code,
    statusCode: err?.statusCode,
    rawType: err?.rawType,
    detail: err?.detail,
    stack: err?.stack,
    ...extra,
  })
  if (err?.raw) {
    console.error(`[stripe-api:${label}] raw:`, err.raw)
  }
}
