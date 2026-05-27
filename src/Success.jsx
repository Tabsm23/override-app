import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Crimson+Pro:ital,wght@0,400;1,400&family=DM+Mono:wght@400&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #1E1C1E; --paper: #F0EBE8; --gold: #C49090; --gold-dim: #A87878;
  --text-dim: #C8B8B8; --text-faint: #A89898;
  --border: rgba(196,144,144,0.28);
}
html, body { min-height: 100%; background: #1E1C1E; }
body { font-family: 'Crimson Pro', Georgia, serif; color: var(--paper); -webkit-font-smoothing: antialiased; }
.success-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 3rem 2rem; background: #1E1C1E; text-align: center; }
.success-inner { max-width: 440px; width: 100%; }
.success-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 6vw, 2.8rem); font-weight: 300; color: var(--paper); margin-bottom: 0.75rem; }
.success-body { font-size: 1.1rem; line-height: 1.75; color: var(--text-dim); margin-bottom: 1.5rem; }
.success-status { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 1.25rem; }
.success-error { color: #e8a0a0; font-size: 1rem; line-height: 1.6; margin-bottom: 1rem; }
.success-actions { display: flex; flex-direction: column; gap: 0.75rem; align-items: center; }
.success-btn { display: inline-block; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; letter-spacing: 0.08em; color: var(--paper); border: 1px solid var(--gold-dim); padding: 0.7rem 1.75rem; text-decoration: none; transition: border-color 0.2s, color 0.2s; }
.success-btn:hover { border-color: var(--gold); color: var(--gold); }
.success-btn-ghost { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-faint); background: none; border: none; cursor: pointer; text-decoration: underline; }
.success-btn-ghost:hover { color: var(--paper); }
`

export default function Success() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [status, setStatus] = useState('verifying')
  const [error, setError] = useState(null)
  const [needsAccount, setNeedsAccount] = useState(false)
  const [paidEmail, setPaidEmail] = useState(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      navigate('/pricing', { replace: true })
      return
    }

    let cancelled = false

    async function confirmPayment() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession()

        const headers = { 'Content-Type': 'application/json' }
        if (authSession?.access_token) {
          headers.Authorization = `Bearer ${authSession.access_token}`
        }

        const response = await fetch('/api/confirm-checkout', {
          method: 'POST',
          headers,
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.error || 'Could not verify payment')
        }

        if (cancelled) return

        if (data.has_paid) {
          if (authSession) {
            await refreshProfile()
            if (cancelled) return
            navigate('/program', { replace: true })
            return
          }
          setNeedsAccount(false)
          setStatus('success')
          return
        }

        if (data.needsAccount) {
          setNeedsAccount(true)
          setPaidEmail(data.email || null)
          setStatus('success')
          return
        }

        setStatus('success')
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setError(err.message || 'Something went wrong')
      }
    }

    confirmPayment()
    return () => {
      cancelled = true
    }
  }, [navigate, refreshProfile, searchParams])

  return (
    <div className="success-page">
      <div className="success-inner">
        {status === 'error' && (
          <>
            <h1 className="success-title">Something went wrong</h1>
            <p className="success-error">{error}</p>
            <div className="success-actions">
              <button type="button" className="success-btn-ghost" onClick={() => navigate('/pricing')}>
                Back to pricing
              </button>
            </div>
          </>
        )}

        {status === 'verifying' && (
          <>
            <h1 className="success-title">Payment received</h1>
            <p className="success-body">Confirming your purchase…</p>
            <p className="success-status">Please wait</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="success-title">You&apos;re in</h1>
            <p className="success-body">
              {needsAccount
                ? paidEmail
                  ? `Your payment is confirmed for ${paidEmail}. Create an account or log in with that email to unlock Override.`
                  : 'Your payment is confirmed. Create an account or log in with the same email you used at checkout to unlock Override.'
                : 'Your payment is confirmed and Override is unlocked. Head to the program when you are ready.'}
            </p>
            <p className="success-status">✦ Payment confirmed</p>
            <div className="success-actions">
              {needsAccount ? (
                <>
                  <Link to="/auth" className="success-btn">
                    Sign up or log in →
                  </Link>
                  <button type="button" className="success-btn-ghost" onClick={() => navigate('/')}>
                    Back to home
                  </button>
                </>
              ) : (
                <Link to="/program" className="success-btn">
                  Open your program →
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
