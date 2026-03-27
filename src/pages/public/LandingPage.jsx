import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/public.css';

export default function LandingPage() {
  return (
    <div id="page-landing" className="page active" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="logo-mark" style={{ background: 'var(--navy)' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12.5" cy="5" r="2" fill="var(--accent)" />
              </svg>
            </div>
            <span className="logo-text">Standings<span>HQ</span></span>
          </Link>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#roles">Roles</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-accent btn-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-layout">
          <div>
            <div className="live-badge"><span className="live-dot"></span>Live scoring — available now</div>
            <h1 className="hero-title">
              <span className="block">Run competitions.</span>
              <span className="block">Publish <span className="accent">standings.</span></span>
              <span className="block">Ship results.</span>
            </h1>
            <p className="hero-desc">StandingsHQ is the end-to-end platform for professional and community competitions — rubric setup, live scoring, leaderboards, and official certificates in one place.</p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-accent btn-xl">Start your event free →</Link>
              <Link to="/login" className="btn btn-navy btn-xl">Sign in</Link>
            </div>
            <div className="hero-trust">
              <span className="trust-label">Trusted format</span>
              <div className="trust-div"></div>
              <div className="trust-badges">
                <span className="trust-badge">Accurate Results</span>
                <span className="trust-badge">Live Events</span>
                <span className="trust-badge">Verified Achievements</span>
              </div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hv-card hv-main">
              <div className="hv-head">
                <span className="hv-head-title">Interschool Debate Championships</span>
                <span className="hv-live-pill"><span className="live-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}></span>Live</span>
              </div>
              <div className="hv-body">
                <div className="rank-list">
                  <div className="rrow g1"><span className="rrank gold">🥇</span><div><div className="rname">Team Alpha — UST</div><div className="rorg">Round 3 complete</div></div><span className="rscore gold">94.6</span></div>
                  <div className="rrow"><span className="rrank">#2</span><div><div className="rname">Team Bravo — DLSU</div><div className="rorg">Round 3 complete</div></div><span className="rscore">89.2</span></div>
                  <div className="rrow"><span className="rrank">#3</span><div><div className="rname">Team Delta — UP</div><div className="rorg">Scoring…</div></div><span className="rscore">86.5</span></div>
                  <div className="rrow"><span className="rrank">#4</span><div><div className="rname">Team Echo — Ateneo</div><div className="rorg">Round 2 complete</div></div><span className="rscore">83.1</span></div>
                </div>
              </div>
            </div>
            <div className="hv-card hv-score">
              <div className="sc-head"><div className="sc-ev">Judge: Prof. Reyes</div><div className="sc-name">Team Alpha · Round 3</div></div>
              <div className="sc-body">
                <div className="crit-list">
                  <div className="crit-row"><span className="crit-lbl">Content & Logic</span><span className="crit-val">38/40</span></div>
                  <div className="crit-row"><span className="crit-lbl">Delivery</span><span className="crit-val">28/30</span></div>
                  <div className="crit-row"><span className="crit-lbl">Rebuttal</span><span className="crit-val">18/20</span></div>
                  <div className="crit-row"><span className="crit-lbl">Teamwork</span><span className="crit-val">9/10</span></div>
                </div>
                <div className="sc-total"><span className="sc-total-lbl">Total</span><span className="sc-total-val">94.6</span></div>
              </div>
            </div>
            <div className="hv-card hv-mini">
              <div className="mini-top"><div className="mini-lbl">Event progress</div><div className="mini-big">72<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-muted)' }}>/100</span></div><div className="mini-sub">scores submitted</div></div>
              <div className="mini-body">
                <div className="mbar-row"><div className="mbar-lbl"><span>Round 1</span><span>100%</span></div><div className="mbar"><div className="mbar-fill g" style={{ width: '100%' }}></div></div></div>
                <div className="mbar-row"><div className="mbar-lbl"><span>Round 2</span><span>100%</span></div><div className="mbar"><div className="mbar-fill" style={{ width: '100%' }}></div></div></div>
                <div className="mbar-row"><div className="mbar-lbl"><span>Round 3</span><span>44%</span></div><div className="mbar"><div className="mbar-fill" style={{ width: '44%' }}></div></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item"><div className="stat-num">3<em>+</em></div><div className="stat-lbl">User roles supported</div></div>
          <div className="stat-item"><div className="stat-num"><em>∞</em></div><div className="stat-lbl">Events per account</div></div>
          <div className="stat-item"><div className="stat-num"><em>Real-</em>time</div><div className="stat-lbl">Live score updates</div></div>
          <div className="stat-item"><div className="stat-num">1<em>-click</em></div><div className="stat-lbl">Certificate generation</div></div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="s-eyebrow">Platform features</div>
        <h2 className="s-title">Everything a competition<br />organizer actually needs.</h2>
        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="5" rx="1.5" stroke="var(--navy)" strokeWidth="1.5" />
                <rect x="11" y="3" width="6" height="5" rx="1.5" stroke="var(--navy)" strokeWidth="1.5" />
                <rect x="3" y="12" width="6" height="5" rx="1.5" stroke="var(--navy)" strokeWidth="1.5" />
                <rect x="11" y="12" width="6" height="5" rx="1.5" stroke="var(--navy)" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="feat-title">Rubric Builder</div>
            <div className="feat-desc">Design weighted scoring rubrics from scratch — multiple criteria, custom point values, instant calculations.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 15L7 7L11 11L14 5" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="14" cy="5" r="2" stroke="var(--navy)" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="feat-title">Live Leaderboards</div>
            <div className="feat-desc">Rankings refresh instantly as scores are submitted. Display on-screen or share the public link with audiences.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 3H14C15.1 3 16 3.9 16 5V15C16 16.1 15.1 17 14 17H6C4.9 17 4 16.1 4 15V5C4 3.9 4.9 3 6 3Z" stroke="var(--navy)" strokeWidth="1.5" />
                <path d="M8 8H12M8 11H12M8 14H10" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="feat-title">Certificate Generation</div>
            <div className="feat-desc">Auto-fill certificates for every participant. Custom templates, bulk download, official-grade output in seconds.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke="var(--navy)" strokeWidth="1.5" />
                <path d="M4 17C4 14.2 6.7 12 10 12C13.3 12 16 14.2 16 17" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="feat-title">Role-based Dashboards</div>
            <div className="feat-desc">Organizers, judges, and participants each get a focused workspace — no shared clutter, no confusion.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="12" rx="2" stroke="var(--navy)" strokeWidth="1.5" />
                <path d="M3 8H17M8 8V16" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="feat-title">Invite Management</div>
            <div className="feat-desc">Email invitations for judges and participants. Track acceptances, send reminders, manage responses in one view.</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="var(--navy)" strokeWidth="1.5" />
                <path d="M10 6V10L13 12" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="feat-title">Event Archive</div>
            <div className="feat-desc">Every published event is permanently archived — full results, winners, and highlights searchable by the public.</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how-it-works">
        <div className="how-inner">
          <div className="s-eyebrow how-s-eyebrow">How it works</div>
          <h2 className="s-title how-s-title">From setup to published results<br />in four steps.</h2>
          <div className="steps-grid">
            <div className="step-item"><div className="step-badge">01</div><div className="step-title">Create your event</div><div className="step-desc">Name it, set the date, build scoring rubrics, and configure competition rounds.</div></div>
            <div className="step-item"><div className="step-badge">02</div><div className="step-title">Invite everyone</div><div className="step-desc">Send email invites. Each role gets their own workspace — no admin overhead required.</div></div>
            <div className="step-item hl"><div className="step-badge">03</div><div className="step-title">Score live</div><div className="step-desc">Judges score from any device. Standings update instantly. Audiences follow in real time.</div></div>
            <div className="step-item"><div className="step-badge">04</div><div className="step-title">Publish & archive</div><div className="step-desc">Finalize results, generate certificates for all, publish to the public archive.</div></div>
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="roles-section" id="roles">
        <div className="s-eyebrow">Who it's built for</div>
        <h2 className="s-title">Three roles. One platform.<br />Zero confusion.</h2>
        <div className="roles-grid">
          <div className="role-card">
            <div className="role-top navy">
              <div className="role-icon ri-navy">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="6" height="5" rx="1.2" fill="rgba(255,255,255,0.5)" />
                  <rect x="11" y="3" width="6" height="5" rx="1.2" fill="var(--accent)" opacity="0.8" />
                  <rect x="3" y="12" width="14" height="5" rx="1.2" fill="rgba(255,255,255,0.15)" />
                </svg>
              </div>
              <div className="role-name rn-white">Organizer</div>
              <div className="role-tag rt-faint">Full platform control</div>
            </div>
            <div className="role-body">
              <div className="role-perks">
                <div className="perk">Create and manage unlimited events</div>
                <div className="perk">Build custom scoring rubrics</div>
                <div className="perk">Invite and track judges & participants</div>
                <div className="perk">Publish results and generate certificates</div>
              </div>
            </div>
          </div>
          <div className="role-card">
            <div className="role-top white">
              <div className="role-icon ri-light">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 15L7 7L11 11L14 5" stroke="var(--navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="14" cy="5" r="2.5" fill="var(--navy)" />
                </svg>
              </div>
              <div className="role-name rn-dark">Judge</div>
              <div className="role-tag rt-muted">Focused scoring workspace</div>
            </div>
            <div className="role-body">
              <div className="role-perks">
                <div className="perk">Accept event invitations via email</div>
                <div className="perk">Review assigned rubrics before the event</div>
                <div className="perk">Score participants via clean live interface</div>
                <div className="perk">View all assigned events and pending tasks</div>
              </div>
            </div>
          </div>
          <div className="role-card">
            <div className="role-top accent-tint">
              <div className="role-icon ri-accent">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3L12.5 8.5H18L13.5 11.5L15.5 17.5L10 14L4.5 17.5L6.5 11.5L2 8.5H7.5L10 3Z" fill="var(--accent)" opacity="0.85" />
                </svg>
              </div>
              <div className="role-name rn-accent">Participant</div>
              <div className="role-tag rt-accent">Your competition journey</div>
            </div>
            <div className="role-body">
              <div className="role-perks">
                <div className="perk">Accept event invitations</div>
                <div className="perk">Follow live leaderboards during competition</div>
                <div className="perk">Track your schedule and assignments</div>
                <div className="perk">Download official certificates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing-section" id="pricing" style={{ padding: '120px 24px', background: 'linear-gradient(180deg, #fff 0%, #f1f5f9 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-soft), transparent)' }}></div>
        <div className="s-eyebrow" style={{ textAlign: 'center', margin: '0 auto 16px', display: 'block' }}>Simple Pricing</div>
        <h2 className="s-title" style={{ textAlign: 'center', marginBottom: '16px' }}>Ready to elevate your competition?</h2>
        <p style={{ textAlign: 'center', color: 'var(--ink-muted)', maxWidth: '600px', margin: '0 auto 64px', fontSize: '18px' }}>Transparent pricing designed for events of every scale. No hidden fees, just pure competition focus.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Free Plan */}
          <div className="pricing-card" style={{
            padding: '56px',
            background: '#fff',
            borderRadius: '32px',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-12px)'; e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)'; }}>
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', opacity: 0.8 }}>Essential</h3>
              <p style={{ fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>The core essentials for small clubs and local house matches.</p>
            </div>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '64px', fontWeight: 900, color: 'var(--navy)', letterSpacing: '-0.04em' }}>₱0</div>
              <div style={{ fontSize: '14px', color: 'var(--ink-muted)', fontWeight: 600, marginTop: '4px' }}>Free forever • No credit card required</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '56px', flex: 1 }}>
              {['Unlimited basic events', 'Mobile-first scoring app', 'Live leaderboard public link', 'Up to 50 participants per event', 'Community forum support'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15px', color: 'var(--ink-soft)', fontWeight: 500 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F1F5F9', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--navy)' }}>check</span>
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Link to="/register" className="btn btn-navy btn-xl" style={{ width: '100%', justifyContent: 'center', borderRadius: '16px', padding: '16px' }}>Start for free</Link>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card highlighted" style={{
            padding: '56px',
            background: 'var(--navy)',
            borderRadius: '32px',
            border: '2px solid var(--accent)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            color: '#fff',
            transition: 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-16px)'; e.currentTarget.style.boxShadow = '0 30px 60px -15px rgba(15, 23, 42, 0.5), 0 20px 40px -20px var(--accent-glow)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(15, 23, 42, 0.3)'; }}>
            <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--accent)', color: '#fff', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>Most Popular</div>
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-bright)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Pro Elite</h3>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>Unleash the full power of StandingsHQ for institutional events.</p>
            </div>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '64px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>₱499</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: '4px' }}>Per event access • Priority features</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '56px', flex: 1 }}>
              {[
                { text: 'Everything in Essential', highlight: true },
                { text: 'Unlimited participants', highlight: false },
                { text: 'Branded certificate set generation', highlight: false },
                { text: 'Exportable CSV analytics & reports', highlight: false },
                { text: 'Bulk email judge invitations', highlight: false },
                { text: 'Priority 24/7 technical support', highlight: false }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15px', color: f.highlight ? '#fff' : 'rgba(255,255,255,0.85)', fontWeight: f.highlight ? 700 : 500 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#fff' }}>verified</span>
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
            <Link to="/register" className="btn btn-accent btn-xl" style={{ width: '100%', justifyContent: 'center', borderRadius: '16px', padding: '16px', fontWeight: 900, fontSize: '16px' }}>Go Pro now</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <div className="footer-cta">
        <h2>Ready to run your next <em>competition?</em></h2>
        <p>Powerful enough for institutions. Simple enough for everyone. Set up in minutes.</p>
        <div className="footer-cta-btns">
          <Link to="/register" className="btn btn-accent btn-xl">Create a free account →</Link>
          <Link to="/login" className="btn btn-ghost-white btn-xl">Sign in</Link>
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="footer-bar">
        <p>© 2025 StandingsHQ. The world-class platform for every competition.</p>
        <ul className="footer-links">
          <li><Link to="/privacy">Privacy</Link></li>
          <li><Link to="/terms">Terms</Link></li>
          <li><Link to="#">Support</Link></li>
          <li><Link to="#">Docs</Link></li>
        </ul>
      </div>
    </div>
  );
}
