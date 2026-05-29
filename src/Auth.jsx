import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, signUpOptions } from './supabase'

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #1E1C1E; --paper: #F0EBE8; --gold: #C49090; --gold-dim: #A87878;
  --text-dim: #C8B8B8; --text-faint: #A89898;
  --border: rgba(196,144,144,0.28); --border-strong: rgba(196,144,144,0.55);
  --grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
}

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: #1E1C1E;
  position: relative;
  overflow: hidden;
}
.auth-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 20% 30%, rgba(160,110,110,0.14) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 70%, rgba(100,70,70,0.18) 0%, transparent 60%);
  pointer-events: none;
}
.auth-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--grain);
  opacity: 0.35;
  pointer-events: none;
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
  padding: 2.5rem 2rem 2rem;
}

.auth-wordmark {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  font-weight: 400;
  letter-spacing: 0.2em;
  color: #F0EBE8;
  text-align: center;
  margin-bottom: 0.35rem;
  padding-right: 0.2em;
}
.auth-wordmark span { color: var(--gold); }

.auth-heading {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 300;
  font-style: italic;
  color: var(--paper);
  text-align: center;
  margin-bottom: 0.5rem;
}

.auth-sub {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-faint);
  text-align: center;
  margin-bottom: 2rem;
}

.auth-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border: 1px solid var(--border);
}
.auth-toggle-btn {
  flex: 1;
  background: transparent;
  border: none;
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-faint);
  padding: 0.65rem 0.5rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.auth-toggle-btn.active {
  color: var(--gold);
  background: rgba(196,144,144,0.08);
}
.auth-toggle-btn:hover:not(.active) { color: var(--text-dim); }

.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
.auth-row { display: flex; justify-content: flex-end; margin-top: -0.25rem; }
.auth-link {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-faint);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.auth-link:hover { color: var(--paper); }

.auth-field { display: flex; flex-direction: column; gap: 0.45rem; }
.auth-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold-dim);
}
.auth-input {
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
.auth-input::placeholder { color: var(--text-faint); opacity: 0.7; }
.auth-input:focus { border-color: var(--border-strong); }

.auth-error {
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

.auth-message {
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

.auth-submit {
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
.auth-submit:hover:not(:disabled) {
  border-color: var(--gold);
  background: rgba(196,144,144,0.08);
}
.auth-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.auth-checkboxes { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.25rem; }
.auth-checkbox-row { display: flex; align-items: flex-start; gap: 0.65rem; text-align: left; cursor: pointer; }
.auth-checkbox-row input { margin-top: 0.15rem; width: 13px; height: 13px; flex-shrink: 0; accent-color: var(--gold); cursor: pointer; }
.auth-checkbox-text { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.04em; line-height: 1.65; color: var(--text-faint); }
.auth-checkbox-text a { color: var(--gold); text-decoration: underline; text-underline-offset: 2px; }
.auth-checkbox-text a:hover { color: var(--paper); }
`

export default function Auth() {
  const [tab, setTab] = useState('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [resetEmail, setResetEmail] = useState('')
  const [resetResult, setResetResult] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupError, setSignupError] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false)
  const [agreedAge, setAgreedAge] = useState(false)

  const canCreateAccount = agreedTerms && agreedDisclaimer && agreedAge

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  async function handleLogin(e) {
    if (e?.preventDefault) e.preventDefault()
    setLoginError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      })

      if (error) {
        setLoginError(error.message)
        return
      }

      if (!data.session) {
        setLoginError('Login succeeded but no session was returned.')
        return
      }

      window.location.href = '/program'
    } catch (err) {
      setLoginError(err?.message ?? 'Login failed. Please try again.')
    }
  }

  function getResetRedirectBase() {
    return (
      import.meta.env.VITE_CHECKOUT_BASE_URL ||
      import.meta.env.CHECKOUT_BASE_URL ||
      import.meta.env.VITE_AUTH_REDIRECT_URL ||
      window.location.origin
    ).replace(/\/$/, '')
  }

  async function handleForgotPassword(e) {
    if (e?.preventDefault) e.preventDefault()
    setResetResult('')
    const email = resetEmail.trim()
    if (!email) return

    try {
      const redirectTo = `${getResetRedirectBase()}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (error) {
        setResetResult(`Error: ${error.message}`)
        return
      }
      setResetResult('Reset link sent. Check your email.')
    } catch (err) {
      setResetResult(`Error: ${err?.message ?? 'Could not send reset link.'}`)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setSignupError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: signUpOptions,
      })

      if (error) {
        setSignupError(`Error: ${error.message}`)
        return
      }

      window.location.href = '/program'
    } catch (err) {
      setSignupError(err?.message ?? 'Sign up failed. Please try again.')
    }
  }

  const isSignUp = tab === 'signup'
  const isForgot = tab === 'forgot'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-wordmark">O<span>V</span>ERRIDE</div>
        <h1 className="auth-heading">
          {isSignUp ? 'Create your account' : isForgot ? 'Reset your password' : 'Welcome back'}
        </h1>
        <p className="auth-sub">
          {isSignUp
            ? 'Begin your identity reconstruction'
            : isForgot
              ? 'We’ll email you a reset link'
              : 'Continue your program'}
        </p>

        <div className="auth-toggle">
          <button
            type="button"
            className={`auth-toggle-btn${!isSignUp && !isForgot ? ' active' : ''}`}
            onClick={() => { setTab('login'); setResetResult('') }}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-toggle-btn${isSignUp ? ' active' : ''}`}
            onClick={() => { setTab('signup'); setResetResult('') }}
          >
            Sign up
          </button>
        </div>

        {!isSignUp && !isForgot ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="auth-input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {loginError && <p className="auth-error">{loginError}</p>}

            <button type="submit" className="auth-submit">Log in</button>
            <div className="auth-row">
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setResetEmail(loginEmail.trim())
                  setResetResult('')
                  setTab('forgot')
                }}
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : isForgot ? (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            {resetResult && (
              <p className={resetResult.startsWith('Error:') ? 'auth-error' : 'auth-message'}>
                {resetResult}
              </p>
            )}

            <button type="submit" className="auth-submit">Send reset link</button>
            <div className="auth-row" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="auth-link" onClick={() => { setTab('login'); setResetResult('') }}>
                ← Back to login
              </button>
              <a className="auth-link" href="/reset-password">
                I already have a link →
              </a>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                className="auth-input"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {signupError && <p className="auth-error">{signupError}</p>}

            <div className="auth-checkboxes">
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                />
                <span className="auth-checkbox-text">
                  I agree to the <Link to="/terms">Terms of Service</Link>
                </span>
              </label>
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedDisclaimer}
                  onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                />
                <span className="auth-checkbox-text">
                  I understand Override is a self-directed program, not a mental health service or crisis support
                </span>
              </label>
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedAge}
                  onChange={(e) => setAgreedAge(e.target.checked)}
                />
                <span className="auth-checkbox-text">
                  I confirm I am 18 years of age or older
                </span>
              </label>
            </div>

            <button type="submit" className="auth-submit" disabled={!canCreateAccount}>Create account</button>
          </form>
        )}
      </div>
    </div>
  )
}
