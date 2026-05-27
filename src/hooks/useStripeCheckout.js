import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startStripeCheckout } from '../lib/stripeCheckout'

export function useStripeCheckout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkout = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      await startStripeCheckout({
        onRequireAuth: () => {
          navigate('/auth')
        },
      })
    } catch (err) {
      setError(err.message || 'Could not start checkout')
      setLoading(false)
    }
  }, [navigate])

  return { checkout, loading, error, clearError: () => setError(null) }
}
