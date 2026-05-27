import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabase'

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #1E1C1E; --paper: #F0EBE8; --gold: #C49090; --gold-dim: #A87878;
  --text-dim: #C8B8B8; --text-faint: #A89898;
  --border: rgba(196,144,144,0.28); --border-strong: rgba(196,144,144,0.55);
  --grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
}

.rp-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: #1E1C1E;
  position: relative;
  overflow: hidden;
}
.rp-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 20% 30%, rgba(160,110,110,0.14) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 70%, rgba(100,70,70,0.18) 0%, transparent 60%);
  pointer-events: none;
}
.rp-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--grain);
  opacity: 0.35;
  pointer-events: none;
}

.rp-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
  padding: 2.5rem 2rem 2rem;
}
.rp-wordmark {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  font-weight: 400;
  letter-spacing: 0.2em;
  color: #F0EBE8;
  text-align: center;
  margin-bottom: 0.35rem;
  padding-right: 0.2em;
}
.rp-wordmark span { color: var(--gold); }
.rp-heading {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 300;
  font-style: italic;
  color: var(--paper);
  text-align: center;
  margin-bottom: 0.5rem;
}
.rp-sub {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-faint);
  text-align: center;
  margin-bottom: 2rem;
}

.rp-form { display: flex; flex-direction: column; gap: 1.25rem; }
.rp-field { display: flex; flex-direction: column; gap: 0.45rem; }
.rp-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold-dim);
}
.rp-input {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  color: var(--paper);
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  padding: 0.75rem 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.rp-input::placeholder { color: var(--text-faint); opacity: 0.7; }
.rp-input:focus { border-color: var(--border-strong); }

.rp-error {
  font-family: 'DM Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  color: #c49090;
  background: rgba(139,58,58,0.12);
  border: 1px solid rgba(196,144,144,0.35);
  padding: 0.65rem 0.85rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.rp-message {
  font-family: 'DM Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  background: rgba(196,144,144,0.06);
  border: 1px solid var(--border);
  padding: 0.65rem 0.85rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.rp-submit {
  margin-top: 0.25rem;
  width: 100%;
  background: transparent;
  border: 1px solid var(--gold-dim);
  color: var(--paper);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  letter-spacing: 0.12em;
  padding: 0.85rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.rp-submit:hover:not(:disabled) {
  border-color: var(--gold);
  background: rgba(196,144,144,0.08);
}
.rp-submit:disabled { opacity: 0.55; cursor: default; }

.rp-row { display: flex; justify-content: space-between; margin-top: 1.25rem; gap: 1rem; flex-wrap: wrap; }
.rp-link {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-faint);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.rp-link:hover { color: var(--paper); }
`

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('checking') // checking | ready | saving | done | error
  const [message, setMessage] = useState('')

  const code = useMemo(() => searchParams.get('code'), [searchParams])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        // Newer recovery links may include ?code=... (PKCE)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setStatus('error')
          setMessage('This reset link is invalid or expired. Request a new one from the login page.')
          return
        }

        if (!cancelled) setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setMessage(err?.message ?? 'Could not validate reset link.')
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [code])

  async function handleUpdatePassword(e) {
    if (e?.preventDefault) e.preventDefault()
    setMessage('')

    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    setStatus('saving')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setStatus('done')
      setMessage('Password updated. You can log in now.')
      setTimeout(() => navigate('/auth'), 800)
    } catch (err) {
      setStatus('error')
      setMessage(err?.message ?? 'Could not update password.')
    }
  }

  return (
    <div className="rp-page">
      <div className="rp-card">
        <div className="rp-wordmark">O<span>V</span>ERRIDE</div>
        <h1 className="rp-heading">Set a new password</h1>
        <p className="rp-sub">Reset your account access</p>

        {message && (
          <p className={status === 'error' ? 'rp-error' : 'rp-message'}>{message}</p>
        )}

        <form className="rp-form" onSubmit={handleUpdatePassword}>
          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-password">New password</label>
            <input
              id="rp-password"
              className="rp-input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status !== 'ready' && status !== 'error'}
              required
              minLength={6}
            />
          </div>

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-confirm">Confirm password</label>
            <input
              id="rp-confirm"
              className="rp-input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={status !== 'ready' && status !== 'error'}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="rp-submit"
            disabled={status === 'checking' || status === 'saving' || status === 'done'}
          >
            {status === 'saving' ? 'Saving…' : 'Update password'}
          </button>
        </form>

        <div className="rp-row">
          <Link className="rp-link" to="/auth">← Back to login</Link>
          <a className="rp-link" href="/pricing">Pricing</a>
        </div>
      </div>
    </div>
  )
}

