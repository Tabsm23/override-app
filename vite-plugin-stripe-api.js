import { getServerEnv } from './server/env.js'
import { handleStripeApiRequest } from './server/stripeApi.js'

function attachStripeMiddleware(server, mode, root) {
  server.middlewares.use(async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) {
      next()
      return
    }

    const env = getServerEnv(mode, root)

    try {
      const handled = await handleStripeApiRequest(req, res, env)
      if (!handled) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Not found' }))
      }
    } catch (err) {
      console.error('[stripe-api:middleware] unhandled error:', err?.stack || err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: err?.message || 'Internal server error' }))
    }
  })
}

export function stripeApiPlugin() {
  return {
    name: 'stripe-api',
    configureServer(server) {
      attachStripeMiddleware(server, server.config.mode, server.config.root)
    },
    configurePreviewServer(server) {
      attachStripeMiddleware(server, server.config.mode, server.config.root)
    },
  }
}
