import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #1E1C1E; --paper: #F0EBE8; --gold: #C49090; --gold-dim: #A87878;
  --text-dim: #C8B8B8; --text-faint: #A89898;
  --border: rgba(196,144,144,0.28); --border-strong: rgba(196,144,144,0.55);
  --grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
}
html, body { min-height: 100%; background: #1E1C1E; }
body { font-family: 'Crimson Pro', Georgia, serif; background: var(--ink); color: var(--paper); -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

.page { min-height: 100vh; background: var(--ink); padding: 0 0 6rem; position: relative; }
.page::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse 70% 50% at 20% 20%, rgba(160,110,110,0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 70% at 80% 80%, rgba(100,70,70,0.12) 0%, transparent 60%); pointer-events: none; z-index: 0; }
.page::after { content: ''; position: fixed; inset: 0; background-image: var(--grain); opacity: 0.35; pointer-events: none; z-index: 0; }
.page > * { position: relative; z-index: 1; }

.back-link-wrap { padding: 1rem 1.5rem 0; max-width: 820px; margin: 0 auto; width: 100%; }
.back-link { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.12em; color: var(--text-faint); text-decoration: none; transition: color 0.2s; display: inline-block; }
.back-link:hover { color: var(--text-dim); }

/* ── 1. HERO ── */
.hero { text-align: center; padding: 5rem 2rem 4rem; max-width: 720px; margin: 0 auto; }
.hero-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 1.25rem; }
.hero-wordmark { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(3rem, 10vw, 6rem); font-weight: 300; letter-spacing: 0.3em; color: #F0EBE8; line-height: 1; margin-bottom: 0.2rem; padding-right: 0.3em; }
.hero-wordmark span { color: var(--gold); }
.hero-tagline { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(1.2rem, 3.5vw, 1.9rem); font-weight: 300; font-style: italic; color: var(--text-dim); margin-bottom: 2rem; }
.hero-rule { width: 1px; height: 55px; background: linear-gradient(to bottom, transparent, var(--gold-dim), transparent); margin: 0 auto 2rem; }
.hero-body { font-size: 1.1rem; line-height: 1.85; color: var(--text-faint); max-width: 520px; margin: 0 auto 2rem; }
.hero-sub { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); }
.hero-sub span { color: var(--gold-dim); margin: 0 0.5rem; }

/* ── 2. WHO IT'S FOR ── */
.who-section { max-width: 820px; margin: 0 auto; padding: 4rem 2rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.who-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 600px) { .who-grid { grid-template-columns: 1fr; } }
.section-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 1.25rem; }
.section-heading { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 300; color: var(--paper); line-height: 1.2; margin-bottom: 1.25rem; }
.section-body { font-size: 1rem; line-height: 1.85; color: var(--text-dim); }
.who-cards { display: flex; flex-direction: column; gap: 0.85rem; }
.who-card { border: 1px solid var(--border); padding: 1rem 1.25rem; background: rgba(255,255,255,0.02); }
.who-card-icon { font-size: 0.85rem; color: var(--gold-dim); margin-bottom: 0.4rem; display: block; }
.who-card-text { font-size: 0.9rem; line-height: 1.6; color: var(--text-dim); }

/* ── 3. WHAT IS OVERRIDE ── */
.what-section { max-width: 820px; margin: 0 auto; padding: 4rem 2rem; }
.what-intro { margin-bottom: 3rem; }
.chapters-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem; margin-bottom: 2.5rem; }
@media (max-width: 640px) { .chapters-grid { grid-template-columns: 1fr; } }
.chapter-card { border: 1px solid var(--border); padding: 1.5rem; background: rgba(255,255,255,0.02); position: relative; overflow: hidden; transition: border-color 0.3s; }
.chapter-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; }
.chapter-card:nth-child(1)::before { background: radial-gradient(circle at 30% 40%, rgba(160,110,110,0.1), transparent 70%); }
.chapter-card:nth-child(2)::before { background: radial-gradient(circle at 70% 40%, rgba(110,130,160,0.1), transparent 70%); }
.chapter-card:nth-child(3)::before { background: radial-gradient(circle at 50% 40%, rgba(110,160,120,0.1), transparent 70%); }
.chapter-card:hover { border-color: var(--border-strong); }
.chapter-card:hover::before { opacity: 1; }
.chapter-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.7rem; letter-spacing: 0.3em; color: var(--text-faint); font-style: italic; margin-bottom: 0.4rem; }
.chapter-icon { font-size: 1.2rem; margin-bottom: 0.6rem; display: block; }
.chapter-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.5rem; font-weight: 300; color: var(--paper); margin-bottom: 0.3rem; }
.chapter-tagline { font-size: 0.78rem; color: var(--text-faint); font-style: italic; margin-bottom: 0.85rem; }
.chapter-tools { display: flex; flex-direction: column; gap: 0.3rem; }
.chapter-tool { font-size: 0.8rem; color: var(--text-dim); display: flex; align-items: center; gap: 0.5rem; }
.chapter-tool::before { content: '◇'; font-size: 0.5rem; color: var(--gold-dim); flex-shrink: 0; }

.features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; }
@media (max-width: 520px) { .features-grid { grid-template-columns: 1fr; } }
.feature-card { border: 1px solid var(--border); padding: 1.1rem 1.25rem; background: rgba(255,255,255,0.015); }
.feature-card-icon { font-size: 0.9rem; color: var(--gold-dim); margin-bottom: 0.5rem; display: block; }
.feature-card-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem; color: var(--paper); margin-bottom: 0.3rem; }
.feature-card-text { font-size: 0.82rem; line-height: 1.6; color: var(--text-faint); }

/* ── DIVIDER ── */
.section-divider { max-width: 820px; margin: 0 auto; padding: 0 2rem; }
.divider-line { height: 1px; background: linear-gradient(to right, transparent, var(--border-strong), transparent); }

/* ── 4. PRICING ── */
.pricing-section { max-width: 820px; margin: 0 auto; padding: 4rem 2rem; }
.pricing-intro-block { margin-bottom: 3rem; }
.pricing-note { font-size: 0.92rem; line-height: 1.75; color: var(--text-faint); margin-top: 0.75rem; font-style: italic; }

.pricing-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 580px) { .pricing-cards { grid-template-columns: 1fr; } }

.price-card { border: 1px solid var(--border); background: rgba(255,255,255,0.02); display: flex; flex-direction: column; transition: border-color 0.3s, transform 0.3s; position: relative; }
.price-card:hover { border-color: var(--border-strong); transform: translateY(-3px); }
.price-card.highlight { border-color: var(--gold-dim); background: rgba(196,144,144,0.04); }
.price-card.highlight:hover { border-color: var(--gold); }
.highlight-badge { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); background: var(--gold-dim); color: var(--ink); font-family: 'DM Mono', monospace; font-size: 0.44rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.25rem 0.85rem; white-space: nowrap; }

.price-card-top { padding: 2rem 1.75rem 1.5rem; border-bottom: 1px solid var(--border); }
.price-card-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; font-weight: 300; color: var(--paper); margin-bottom: 0.2rem; }
.price-card-sub { font-size: 0.85rem; font-style: italic; color: var(--text-faint); margin-bottom: 1.5rem; line-height: 1.5; }
.price-display { display: flex; align-items: flex-end; gap: 0.25rem; margin-bottom: 0.4rem; }
.price-currency { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.3rem; color: var(--text-faint); margin-bottom: 0.35rem; }
.price-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 3.5rem; font-weight: 300; color: var(--paper); line-height: 1; }
.price-once { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 0.4rem; }
.price-desc { font-size: 0.82rem; color: var(--text-faint); line-height: 1.55; }

.price-card-features { padding: 1.5rem 1.75rem; flex: 1; }
.price-feature-label { font-family: 'DM Mono', monospace; font-size: 0.46rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 0.7rem; margin-top: 1rem; }
.price-feature-label:first-child { margin-top: 0; }
.price-feature-row { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.55rem; }
.pf-icon { font-size: 0.65rem; color: var(--gold); flex-shrink: 0; margin-top: 0.22rem; }
.pf-icon.off { color: rgba(196,144,144,0.25); }
.pf-text { font-size: 0.88rem; line-height: 1.5; color: var(--text-dim); }
.pf-text.off { color: var(--text-faint); opacity: 0.4; text-decoration: line-through; text-decoration-color: rgba(196,144,144,0.25); }

.price-card-cta { padding: 1.25rem 1.75rem 1.75rem; }
.btn-price { width: 100%; background: transparent; border: 1px solid var(--gold-dim); color: var(--paper); font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; letter-spacing: 0.1em; padding: 0.85rem 1.5rem; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
.btn-price::before { content: ''; position: absolute; inset: 0; background: rgba(196,144,144,0.08); transform: translateX(-100%); transition: 0.35s ease; }
.btn-price:hover { border-color: var(--gold); }
.btn-price:hover::before { transform: translateX(0); }
.btn-price.hl { border-color: var(--gold); background: rgba(196,144,144,0.06); }
.btn-price.hl::before { background: rgba(196,144,144,0.12); }
.cta-note { font-family: 'DM Mono', monospace; font-size: 0.46rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-faint); text-align: center; margin-top: 0.55rem; }

/* ── 5. COMPARISON ── */
.comparison-section { max-width: 820px; margin: 0 auto; padding: 4rem 2rem; border-top: 1px solid var(--border); }
.comp-table { width: 100%; border-collapse: collapse; }
.comp-table th { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); padding: 0.75rem 1rem; text-align: center; border-bottom: 1px solid var(--border); }
.comp-table th:first-child { text-align: left; width: 55%; }
.comp-table th.hl-col { color: var(--gold); }
.comp-table td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(196,144,144,0.08); font-size: 0.88rem; color: var(--text-dim); text-align: center; vertical-align: middle; }
.comp-table td:first-child { text-align: left; }
.comp-table tr:last-child td { border-bottom: none; }
.comp-table tr:hover td { background: rgba(196,144,144,0.02); }
.comp-table .cat-row td { font-family: 'DM Mono', monospace; font-size: 0.46rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dim); padding-top: 1.5rem; background: transparent !important; border-bottom: 1px solid var(--border); }
.check { color: var(--gold); }
.dash { color: rgba(196,144,144,0.22); }
.chip { font-family: 'DM Mono', monospace; font-size: 0.44rem; letter-spacing: 0.1em; color: var(--text-faint); }

/* ── 6. FAQ ── */
.faq-section { max-width: 680px; margin: 0 auto; padding: 4rem 2rem; border-top: 1px solid var(--border); }
.faq-item { border-bottom: 1px solid var(--border); }
.faq-btn { width: 100%; background: transparent; border: none; text-align: left; padding: 1.25rem 0; cursor: pointer; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.faq-q { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.15rem; font-weight: 300; color: var(--paper); line-height: 1.4; }
.faq-icon { font-family: 'DM Mono', monospace; font-size: 1rem; color: var(--gold-dim); flex-shrink: 0; transition: transform 0.3s; line-height: 1; margin-top: 0.1rem; }
.faq-icon.open { transform: rotate(45deg); }
.faq-a { font-size: 0.95rem; line-height: 1.82; color: var(--text-faint); padding-bottom: 1.35rem; animation: fadeUp 0.3s ease; }

/* ── 7. BOTTOM CTA ── */
.bottom-section { max-width: 680px; margin: 0 auto; padding: 4rem 2rem 2rem; text-align: center; }
.bottom-rule { height: 1px; background: linear-gradient(to right, transparent, var(--gold-dim), transparent); margin-bottom: 3rem; }
.bottom-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 300; font-style: italic; color: var(--paper); margin-bottom: 1rem; line-height: 1.3; }
.bottom-sub { font-size: 0.95rem; color: var(--text-faint); margin-bottom: 2.5rem; line-height: 1.75; }
.bottom-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-bottom { background: transparent; border: 1px solid var(--gold-dim); color: var(--paper); font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; letter-spacing: 0.1em; padding: 0.85rem 2.25rem; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
.btn-bottom::before { content: ''; position: absolute; inset: 0; background: rgba(196,144,144,0.08); transform: translateX(-100%); transition: 0.35s ease; }
.btn-bottom:hover { border-color: var(--gold); }
.btn-bottom:hover::before { transform: translateX(0); }
.btn-bottom.primary { border-color: var(--gold); background: rgba(196,144,144,0.06); }

.footer-mark { text-align: center; padding: 2rem; font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(196,144,144,0.2); }

@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

const FAQS = [
  {
    q: "Is this a subscription?",
    a: "No. Override is a one-time purchase — you pay once and own it permanently. There are no monthly charges, no renewals, and no pressure to complete it within a billing cycle. Work through it at your own pace.",
  },
  {
    q: "Is Override right for me?",
    a: "There's no wrong time to start Override. Some people come to it in the thick of it. Others come months later. The program works whenever you're ready to ask — who am I becoming?",
  },
  {
    q: "Will my entries and notes be saved?",
    a: "Yes — everything is saved to your account permanently. Your journal entries, tool notes, weather log, and Pause history are yours and never deleted. You can return to Override months or years later and find everything exactly where you left it.",
  },
  {
    q: "How is the AI reflection different from a generic chatbot?",
    a: "Every AI reflection responds specifically to what you wrote — not a script, not a CBT template. It reads your actual words and reflects back what it notices: the layers, the patterns, the things you may not have named yourself. It is a mirror, not a chatbot.",
  },
];

const COMPARISON = [
  { cat: "Override Program" },
  { f: "Chapter I — Grieve (3 tools + 5 tasks)", core: true, bundle: true },
  { f: "Chapter II — Rediscover (3 tools + 5 tasks)", core: true, bundle: true },
  { f: "Chapter III — Reclaim (3 tools + 5 tasks)", core: true, bundle: true },
  { f: "AI reflections on everything you write", core: true, bundle: true },
  { f: "Persistent notes — saved permanently", core: true, bundle: true },
  { f: "Progress tracking across all tools", core: true, bundle: true },
  { cat: "Daily Tools" },
  { f: "Daily Ritual — rotating journal prompts", core: true, bundle: true },
  { f: "Emotional Weather tracking", core: true, bundle: true },
  { f: "The Pause — don't contact your ex system", core: true, bundle: true },
  { f: "Future Override chapters as they're added", core: false, bundle: true },
  { cat: "Purchase" },
  { f: "One-time payment, no subscription", core: true, bundle: true },
  { f: "Lifetime access", core: true, bundle: true },
  { f: "Price", core: "$47", bundle: "$97" },
];

function Cell({ val }) {
  if (val === true) return <span className="check">✦</span>;
  if (val === false) return <span className="dash">—</span>;
  return <span className="chip">{val}</span>;
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="page">
      <div className="back-link-wrap">
        <Link to="/" className="back-link">← Back</Link>
      </div>

      {/* ── 1. HERO ── */}
      <div className="hero">
        <div className="hero-eyebrow">Override · A self-directed program</div>
        <div className="hero-wordmark">O<span>V</span>ERRIDE</div>
        <div className="hero-tagline">You're the author now.</div>
        <div className="hero-rule" />
        <p className="hero-body">
          You've been through heartbreak or divorce. Now comes the part where you decide who you become.
        </p>
        <div className="hero-sub">
          One-time purchase <span>·</span> No subscription <span>·</span> Yours permanently
        </div>
      </div>

      {/* ── 2. WHO IT'S FOR ── */}
      <div className="who-section">
        <div className="who-grid">
          <div>
            <div className="section-eyebrow">Who this is for</div>
            <h2 className="section-heading">A Program for the Becoming.</h2>
            <p className="section-body">
              Override is not a meditation app or a symptom manager. It's for the person who is past the acute phase — no longer falling apart every day — but still asking the harder question: <em>who am I now?</em>
            </p>
          </div>
          <div className="who-cards">
            {[
              ["◎", "You've been through heartbreak or divorce and still feel stuck in who you were inside that relationship."],
              ["◑", "You've done the survival work. Now you want to do the becoming work."],
              ["◕", "You don't need someone to listen. You need structure, tools, and a clear direction."],
              ["✦", "You want to rebuild your identity deliberately — not just wait for time to do it for you."],
            ].map(([icon, text]) => (
              <div key={text} className="who-card">
                <span className="who-card-icon">{icon}</span>
                <div className="who-card-text">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. WHAT IS OVERRIDE ── */}
      <div className="what-section">
        <div className="what-intro">
          <div className="section-eyebrow">The program</div>
          <h2 className="section-heading">Three chapters. Nine tools. Fifteen real-world tasks.</h2>
          <p className="section-body" style={{ marginBottom: "2rem" }}>
            Override is structured around a deliberate arc — not a feature menu. Each chapter builds on the last, moving you from honest grief through to active self-authorship.
          </p>
        </div>

        {/* Chapters */}
        <div className="chapters-grid">
          {[
            { number: "Chapter I", icon: "◎", name: "Grieve", tagline: "Let it be real.", tools: ["The Loss Inventory", "The Story You Were Told", "The Letter You'll Never Send"] },
            { number: "Chapter II", icon: "◑", name: "Rediscover", tagline: "Find what was buried.", tools: ["Before We Were 'We'", "Values Underground", "The Inner Cast"] },
            { number: "Chapter III", icon: "◕", name: "Reclaim", tagline: "Choose who you are.", tools: ["Letter from Your Future Self", "The Architecture of No", "Your Personal Manifesto"] },
          ].map((ch) => (
            <div key={ch.name} className="chapter-card">
              <div className="chapter-number">{ch.number}</div>
              <span className="chapter-icon">{ch.icon}</span>
              <div className="chapter-name">{ch.name}</div>
              <div className="chapter-tagline">{ch.tagline}</div>
              <div className="chapter-tools">
                {ch.tools.map((t) => <div key={t} className="chapter-tool">{t}</div>)}
              </div>
            </div>
          ))}
        </div>

        {/* Additional features */}
        <div className="section-eyebrow" style={{ marginBottom: "1rem" }}>Also included</div>
        <div className="features-grid">
          {[
            ["🌤", "Emotional Weather", "Pattern-based emotional tracking — not a mood score, a private witness to how you actually feel over time."],
            ["✦", "The Pause", "A dedicated system for the urge to contact your ex. A timer, a redirect question, and a write-through space."],
            ["◇", "Daily Ritual", "Rotating journal prompts for a few honest minutes with yourself every day."],
            ["◈", "AI Reflections", "Every reflection responds specifically to what you wrote — not a script, not a template. A real mirror."],
          ].map(([icon, title, text]) => (
            <div key={title} className="feature-card">
              <span className="feature-card-icon">{icon}</span>
              <div className="feature-card-title">{title}</div>
              <div className="feature-card-text">{text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider"><div className="divider-line" /></div>

      {/* ── 4. PRICING ── */}
      <div className="pricing-section">
        <div className="pricing-intro-block">
          <div className="section-eyebrow">Pricing</div>
          <h2 className="section-heading">One-time. No subscription. Yours to keep.</h2>
          <p className="section-body">
            Override is not a monthly charge. You buy it once and it's yours permanently — work through it in six weeks or return to it over two years. No billing cycle, no pressure to heal on a schedule.
          </p>
          <p className="pricing-note">All entries, notes, and history are saved to your account and never deleted.</p>
        </div>

        <div className="pricing-cards" style={{ gridTemplateColumns: "1fr", maxWidth: "480px", margin: "0 auto" }}>
          {/* Override only */}
          <div className="price-card">
            <div className="price-card-top">
              <div className="price-card-name">Override</div>
              <div className="price-card-sub">The complete identity rebuilding program. Everything you need to move from surviving to becoming.</div>
              <div className="price-display">
                <span className="price-currency">$</span>
                <span className="price-number">47</span>
              </div>
              <div className="price-once">One-time payment</div>
              <div className="price-desc">All three chapters, nine tools, fifteen identity tasks, AI reflections, and all daily tools included.</div>
            </div>
            <div className="price-card-features">
              <div className="price-feature-label">What's included</div>
              {["Full Override program — all 3 chapters", "9 reflective writing tools", "15 real-world identity tasks", "AI reflection on every entry", "Emotional Weather tracking", "The Pause system", "Daily Ritual journal", "Persistent notes — saved permanently"].map((f) => (
                <div key={f} className="price-feature-row">
                  <span className="pf-icon">✦</span>
                  <span className="pf-text">{f}</span>
                </div>
              ))}
            </div>
            <div className="price-card-cta">
              <button className="btn-price">Get Override →</button>
              <div className="cta-note">One-time · Lifetime access · No subscription</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. COMPARISON ── */}
      <div className="comparison-section">
        <div className="section-eyebrow" style={{ marginBottom: "0.75rem" }}>What's included</div>
        <h2 className="section-heading" style={{ marginBottom: "2rem" }}>Everything in Override — $47</h2>
        <table className="comp-table">
          <tbody>
            {[
              { cat: "The Program" },
              { f: "Chapter I — Grieve (3 tools + 5 tasks)" },
              { f: "Chapter II — Rediscover (3 tools + 5 tasks)" },
              { f: "Chapter III — Reclaim (3 tools + 5 tasks)" },
              { f: "AI reflections on everything you write" },
              { f: "Persistent notes — saved permanently" },
              { f: "Progress tracking across all tools" },
              { cat: "Daily Tools" },
              { f: "Daily Ritual — rotating journal prompts" },
              { f: "Emotional Weather tracking" },
              { f: "The Pause — don't contact your ex system" },
              { cat: "Purchase" },
              { f: "One-time payment — no subscription" },
              { f: "Lifetime access" },
              { f: "All entries and notes saved permanently" },
            ].map((row, i) => {
              if (row.cat) return (
                <tr key={i} className="cat-row"><td colSpan={2}>{row.cat}</td></tr>
              );
              return (
                <tr key={i}>
                  <td>{row.f}</td>
                  <td style={{ width: "60px" }}><span className="check">✦</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── 6. FAQ ── */}
      <div className="faq-section">
        <div className="section-eyebrow" style={{ marginBottom: "1.5rem" }}>Questions</div>
        {FAQS.map((faq, i) => (
          <div key={i} className="faq-item">
            <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span className="faq-q">{faq.q}</span>
              <span className={`faq-icon${openFaq === i ? " open" : ""}`}>+</span>
            </button>
            {openFaq === i && <div className="faq-a">{faq.a}</div>}
          </div>
        ))}
      </div>

      {/* ── 7. BOTTOM CTA ── */}
      <div className="bottom-section">
        <div className="bottom-rule" />
        <h2 className="bottom-title">The next chapter is yours to write.</h2>
        <p className="bottom-sub">
          One-time purchase. No subscription. No billing cycle.<br />
          Your notes and entries are saved permanently — come back whenever you're ready.
        </p>
        <div className="bottom-btns">
          <button className="btn-bottom primary">Get Override — $47 →</button>
        </div>
      </div>

      <div className="footer-mark">Override · A self-directed identity reconstruction program</div>
    </div>
  );
}
