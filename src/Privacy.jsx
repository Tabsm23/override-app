import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #1E1C1E; --paper: #F0EBE8; --gold: #C49090; --gold-dim: #A87878;
  --text-dim: #C8B8B8; --text-faint: #A89898;
  --grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
}
html, body { min-height: 100%; background: #1E1C1E; }
body { font-family: 'Crimson Pro', Georgia, serif; background: var(--ink); color: var(--paper); -webkit-font-smoothing: antialiased; }

.legal-page { min-height: 100vh; background: var(--ink); position: relative; }
.legal-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 70% 50% at 20% 20%, rgba(160,110,110,0.1) 0%, transparent 60%),
    radial-gradient(ellipse 50% 70% at 80% 80%, rgba(100,70,70,0.12) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}
.legal-page::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: var(--grain);
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}
.legal-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }
.legal-back { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-faint); text-decoration: none; display: inline-block; margin-bottom: 2.5rem; transition: color 0.2s; }
.legal-back:hover { color: var(--gold); }
.legal-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 300; letter-spacing: 0.12em; color: var(--paper); margin-bottom: 0.5rem; }
.legal-updated { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 2.5rem; }
.legal-section { margin-bottom: 1.75rem; }
.legal-section h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.35rem; font-weight: 400; color: var(--paper); margin-bottom: 0.5rem; }
.legal-section p, .legal-section li { font-size: 1.05rem; line-height: 1.85; color: var(--text-dim); }
.legal-section ul { list-style: none; padding: 0; margin-top: 0.35rem; }
.legal-section li { padding-left: 1.1rem; position: relative; margin-bottom: 0.35rem; }
.legal-section li::before { content: '—'; position: absolute; left: 0; color: var(--gold-dim); }
.legal-section a { color: var(--gold); text-decoration: underline; text-underline-offset: 2px; }
.legal-section a:hover { color: var(--paper); }
.legal-processor { margin-bottom: 0.85rem; }
.legal-processor:last-child { margin-bottom: 0; }
`

const SECTIONS = [
  {
    title: '1. Who We Are',
    body: (
      <>
        Override is a self-directed identity reconstruction program. Contact:{' '}
        <a href="mailto:hello@theoverride.app">hello@theoverride.app</a>
      </>
    ),
  },
  {
    title: '2. What Data We Collect',
    list: [
      'Email address and account information',
      'Written entries, reflections, notes, and journal content you create in the app',
      'Payment record (processed by Stripe — we do not store card details)',
      'Basic usage data',
    ],
  },
  {
    title: '3. How We Use Your Data',
    body: 'To provide the Override program and generate AI reflections. To send account-related emails. To improve the service. We do not use your data to train AI models. We do not sell your data.',
  },
  {
    title: '4. Third-Party Processors',
    processors: [
      {
        name: 'Anthropic',
        text: "— your written entries are sent to Anthropic's API to generate reflections.",
        href: 'https://www.anthropic.com/privacy',
        label: 'anthropic.com/privacy',
      },
      {
        name: 'Supabase',
        text: '— account and entry data is stored on Supabase infrastructure.',
        href: 'https://supabase.com/privacy',
        label: 'supabase.com/privacy',
      },
      {
        name: 'Stripe',
        text: '— payment is processed by Stripe.',
        href: 'https://stripe.com/privacy',
        label: 'stripe.com/privacy',
      },
    ],
  },
  {
    title: '5. Data Retention',
    body: 'We retain your data while your account is active. Upon account deletion, personal data is deleted within 30 days except where legally required.',
  },
  {
    title: '6. Data Security',
    body: (
      <>
        All data is encrypted in transit (TLS) and at rest. If you become aware of a security issue contact{' '}
        <a href="mailto:hello@theoverride.app">hello@theoverride.app</a> immediately.
      </>
    ),
  },
  {
    title: '7. Your Rights',
    body: (
      <>
        You have the right to access, correct, or delete your data at any time. To request deletion email{' '}
        <a href="mailto:hello@theoverride.app">hello@theoverride.app</a> with subject line &ldquo;Data Deletion Request&rdquo; and your account email. We will process within 30 days.
      </>
    ),
  },
  {
    title: '8. Children',
    body: 'Override is not intended for users under 18. We do not knowingly collect data from minors.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this policy. Material changes will be notified by email.',
  },
  {
    title: '10. Contact',
    body: <a href="mailto:hello@theoverride.app">hello@theoverride.app</a>,
  },
]

export default function Privacy() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="legal-page">
      <div className="legal-inner">
        <Link to="/" className="legal-back">← Back</Link>
        <h1 className="legal-title">PRIVACY POLICY</h1>
        <p className="legal-updated">Last updated: May 2026</p>
        {SECTIONS.map((section) => (
          <section key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            {section.list ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : section.processors ? (
              <div>
                {section.processors.map((p) => (
                  <p key={p.name} className="legal-processor">
                    <strong style={{ color: 'var(--paper)', fontWeight: 400 }}>{p.name}</strong>
                    {p.text}{' '}
                    <a href={p.href} target="_blank" rel="noopener noreferrer">{p.label}</a>
                  </p>
                ))}
              </div>
            ) : (
              <p>{section.body}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
