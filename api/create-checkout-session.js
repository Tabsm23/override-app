import { getServerEnv } from '../server/env.js'
import { handleCreateCheckoutSession } from '../server/stripeApi.js'

export default async function handler(req, res) {
  const env = getServerEnv(process.env.NODE_ENV || 'production', process.cwd())
  await handleCreateCheckoutSession(req, res, env)
}
