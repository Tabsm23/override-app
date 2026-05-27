import { getServerEnv } from '../server/env.js'
import { handleConfirmCheckout } from '../server/stripeApi.js'

export default async function handler(req, res) {
  const env = getServerEnv(process.env.NODE_ENV || 'production', process.cwd())
  await handleConfirmCheckout(req, res, env)
}
