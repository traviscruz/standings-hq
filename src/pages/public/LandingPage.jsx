import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

/**
 * LANDING PAGE - FINAL POLISHED VERSION
 * 
 * UPDATES:
 * - Reduced layout gaps for a tighter, professional feel.
 * - Explicitly mentioned Portals for Organizers, Judges, and Participants.
 * - Ultra-noticeable section dividers (bold gradients & shadows).
 * - Brand-consistent logo (from Organizer Portal).
 * - Optimized content for clarity and trust.
 */
export default function LandingPage() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeHover, setActiveHover] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [visibleSections, setVisibleSections] = useState({});

  const sectionRefs = useRef({});

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    // Initialize observer for scroll-reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1 });

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const isDesktop = windowWidth > 1024;
  const isMobile = windowWidth <= 768;

  // ── BRAND LOGO (FROM ORGANIZER PORTAL) ──
  const BrandLogo = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
    </svg>
  );

  const lpStyle = {
    wrapper: {
      minHeight: '100vh',
      background: colors.white,
      fontFamily: "'Inter', sans-serif",
      color: colors.navy,
      overflowX: 'hidden',
    },
    nav: {
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: scrolled ? '72px' : '90px',
      background: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? `1px solid ${colors.borderSoft}` : '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 40px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
    },
    navInner: {
      maxWidth: '1280px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
    },
    logoBox: {
      width: '32px',
      height: '32px',
      background: colors.navy,
      borderRadius: '8px',
      display: 'grid',
      placeItems: 'center',
    },
    logoText: {
      fontSize: '20px',
      fontWeight: '800',
      color: colors.navy,
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '-0.03em',
    },
    section: (id, bg = colors.white) => ({
      padding: isMobile ? '80px 24px' : '100px 40px', // Reduced padding to pull layout closer
      background: bg,
      opacity: visibleSections[id] ? 1 : 0,
      transform: visibleSections[id] ? 'translateY(0)' : 'translateY(30px)',
      transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
      position: 'relative',
    }),
    divider: {
      height: '3px', // More noticeable thick divider
      background: `linear-gradient(90deg, rgba(59, 130, 246, 0.1), ${colors.borderSoft}, rgba(59, 130, 246, 0.1))`,
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      borderRadius: '2px',
    },
    tag: {
      display: 'inline-flex',
      padding: '6px 14px',
      background: colors.accentBg,
      color: colors.accent,
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '16px',
    },
    title: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '36px' : '52px',
      fontWeight: '900',
      lineHeight: '1.05',
      letterSpacing: '-0.04em',
      color: colors.navy,
      marginBottom: '20px',
    },
    desc: {
      fontSize: '18px',
      color: colors.inkMid,
      lineHeight: '1.6',
    },
    roleTag: {
      padding: '8px 16px',
      background: 'rgba(30, 45, 74, 0.05)',
      borderRadius: '50px',
      fontSize: '13px',
      fontWeight: '700',
      color: colors.navy,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    }
  };

  const proPrice = billingCycle === 'monthly' ? '499' : '399';

  return (
    <div style={lpStyle.wrapper}>
      <style>{`
        @keyframes lpPulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .lp-pulse { animation: lpPulse 2s infinite; }
        #st-root a { text-decoration: none; transition: 0.2s; }
        #st-root ul { list-style: none; padding: 0; margin: 0; }
        .lp-hover-grow { transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
        .lp-hover-grow:hover { transform: scale(1.02) translateY(-2px); }
      `}</style>

      <div id="st-root">
        {/* ── NAV ── */}
        <nav style={lpStyle.nav}>
          <div style={lpStyle.navInner}>
            <Link to="/" style={lpStyle.logo}>
              <div style={lpStyle.logoBox}><BrandLogo /></div>
              <span style={lpStyle.logoText}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
            </Link>

            {!isMobile && (
              <ul style={{ display: 'flex', gap: '32px' }}>
                {['How it works', 'Roles', 'Pricing'].map(l => (
                  <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: '14.5px', fontWeight: 600, color: activeHover === l ? colors.accent : colors.inkSoft }} onMouseEnter={() => setActiveHover(l)} onMouseLeave={() => setActiveHover(null)}>{l}</a></li>
                ))}
              </ul>
            )}

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Link to="/login" style={{ fontSize: '14px', fontWeight: 700, color: colors.navy }}>Log in</Link>
              <Link to="/register" style={{ padding: '12px 28px', background: colors.navy, color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }} className="lp-hover-grow">Try For Free</Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <header style={{ ...lpStyle.section('hero'), paddingTop: isMobile ? '130px' : '180px' }} id="hero" ref={el => sectionRefs.current.hero = el}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? '1.1fr 0.9fr' : '1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div style={lpStyle.tag}>Real-time Network</div>
              <h1 style={{ ...lpStyle.title, fontSize: isMobile ? '42px' : '72px' }}>The ecosystem for <br /><span style={{ color: colors.accent }}>Competitions.</span></h1>
              <p style={{ ...lpStyle.desc, marginBottom: '40px', fontSize: '19px' }}>Professional standings infrastructure for elite events. Automate ranking, evaluation, and certification in real-time.</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
                {['Organizers', 'Judges', 'Participants'].map(r => (
                  <div key={r} style={lpStyle.roleTag}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px', color: colors.accent }}>verified</span>
                    {r}
                  </div>
                ))}
              </div>

              <Link to="/register" style={{ padding: '16px 36px', background: colors.navy, color: '#fff', borderRadius: '14px', fontWeight: 800, fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' }} className="lp-hover-grow">Start Building Now →</Link>
            </div>
            
            {!isMobile && (
              <div style={{ background: '#fff', padding: '32px', borderRadius: '40px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)', border: `1px solid ${colors.borderSoft}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', color: colors.success, padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 800 }}>
                    <div className="lp-pulse" style={{ width: '8px', height: '8px', background: colors.success, borderRadius: '50%' }}></div>
                    LIVE ACTIVITY
                  </div>
                  <span className="material-symbols-rounded" style={{ color: colors.accent }}>sensors</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { name: 'Antonio Luna', team: 'Elite Team', score: '98.5', r: '1' },
                    { name: 'Jose Rizal', team: 'Solidaridad', score: '94.2', r: '2' },
                    { name: 'Maria Santos', team: 'Metro Innovate', score: '89.6', r: '3' }
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: i === 0 ? colors.accentBg : colors.pageBg, border: `1px solid ${i === 0 ? colors.accentBgMid : colors.borderSoft}`, borderRadius: '18px' }}>
                      <div style={{ width: '32px', height: '32px', background: i === 0 ? colors.accent : colors.navy, color: '#fff', borderRadius: '8px', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '12px' }}>{p.r}</div>
                      <div style={{ flex: 1, fontWeight: 700, fontSize: '14.5px' }}>{p.name}</div>
                      <div style={{ fontWeight: 900, fontSize: '17px', color: i === 0 ? colors.accentDeep : colors.navy }}>{p.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div style={lpStyle.divider} />

        {/* ── WORKFLOW ── */}
        <section style={lpStyle.section('how-it-works', '#F9FBFF')} id="how-it-works" ref={el => sectionRefs.current['how-it-works'] = el}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={lpStyle.tag}>The Process</div>
            <h2 style={lpStyle.title}>How it works.</h2>
          </div>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr', gap: '20px' }}>
            {[
              { t: 'Construct', d: 'Design weighted rubrics and event logic tailored for your institution.' },
              { t: 'Coordinate', d: 'Invite judges and register participants. Role-based access ensures total security.' },
              { t: 'Calculate', d: 'Judges score in real-time. Results are computed and synced in milliseconds.' },
              { t: 'Complete', d: 'Generate verified certificates and publish final standings to the public hub.' }
            ].map((s, i) => (
              <div key={i} style={{ padding: '32px', background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '24px' }} className="lp-hover-grow">
                <div style={{ fontSize: '12px', fontWeight: 900, color: colors.accent, marginBottom: '16px' }}>PHASE 0{i + 1}</div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: colors.navy, marginBottom: '12px' }}>{s.t}</h3>
                <p style={{ fontSize: '14px', color: colors.inkMid, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={lpStyle.divider} />

        {/* ── ECOSYSTEM ── */}
        <section style={lpStyle.section('roles')} id="roles" ref={el => sectionRefs.current.roles = el}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={lpStyle.tag}>Dedicated Hubs</div>
            <h2 style={lpStyle.title}>A Unified Network.</h2>
            <p style={{ ...lpStyle.desc, maxWidth: '600px', margin: '0 auto' }}>Specialized portals built specifically for **Organizers, Judges, and Participants**.</p>
          </div>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: '24px' }}>
            {[
              { r: 'Organizer', icon: 'shield_person', bg: colors.navy, color: '#fff', d: 'The control center. Manage logic, staff, and publish final standings with precision.' },
              { r: 'Judge', icon: 'gavel', bg: colors.white, color: colors.navy, d: 'The evaluation tool. Scoring rubrics designed for mobile-first speed and accuracy.' },
              { r: 'Participant', icon: 'person_celebrate', bg: colors.accentBg, color: colors.navy, d: 'The athlete hub. Track your ranking, view live results, and download certificates.' }
            ].map((r, i) => (
              <div key={i} style={{ padding: '40px', background: r.bg, color: r.color, border: i === 1 ? `1.5px solid ${colors.borderSoft}` : 'none', borderRadius: '32px' }} className="lp-hover-grow">
                <div style={{ width: '48px', height: '48px', background: i === 1 ? colors.pageBg : 'rgba(255,255,255,0.1)', color: i === 1 ? colors.accent : '#fff', borderRadius: '12px', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
                  <span className="material-symbols-rounded">{r.icon}</span>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>{r.r} Portal</h3>
                <p style={{ opacity: 0.8, fontSize: '15.5px', lineHeight: 1.6 }}>{r.d}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={lpStyle.divider} />

        {/* ── PRICING ── */}
        <section style={lpStyle.section('pricing', '#F8FAFC')} id="pricing" ref={el => sectionRefs.current.pricing = el}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={lpStyle.tag}>Pricing</div>
            <h2 style={lpStyle.title}>Simple Pricing.</h2>
            <div style={{ display: 'inline-flex', padding: '6px', background: '#fff', borderRadius: '100px', border: `1.5px solid ${colors.borderSoft}` }}>
              <button onClick={() => setBillingCycle('monthly')} style={{ padding: '10px 24px', background: billingCycle === 'monthly' ? colors.navy : 'transparent', color: billingCycle === 'monthly' ? '#fff' : colors.inkMuted, border: 'none', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>Monthly</button>
              <button onClick={() => setBillingCycle('yearly')} style={{ padding: '10px 24px', background: billingCycle === 'yearly' ? colors.navy : 'transparent', color: billingCycle === 'yearly' ? '#fff' : colors.inkMuted, border: 'none', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>Yearly (Save 20%)</button>
            </div>
          </div>
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '32px' }}>
            <div style={{ padding: '48px', background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '32px' }} className="lp-hover-grow">
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.02em', color: colors.navy }}>₱0</div>
                <div style={{ color: colors.inkMuted, fontWeight: 700, fontSize: '14px' }}>Free foundation plan</div>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {['Unlimited basic events', 'Live public leaderboards', 'Up to 50 participants', '2 Judges per event'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><span className="material-symbols-rounded" style={{ color: colors.success, fontSize: '20px' }}>check_circle</span>{f}</li>
                ))}
              </ul>
              <Link to="/register" style={{ padding: '16px', background: colors.navy, color: '#fff', borderRadius: '14px', fontWeight: 800, textAlign: 'center', display: 'block' }}>Launch Free</Link>
            </div>
            <div style={{ padding: '48px', background: colors.navy, color: '#fff', borderRadius: '32px', position: 'relative' }} className="lp-hover-grow">
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.02em' }}>₱{proPrice}</div>
                <div style={{ opacity: 0.6, fontWeight: 700, fontSize: '14px' }}>Per month / billed {billingCycle}</div>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {['Everything in Free', 'Unlimited Participants', 'Automated Certificates', 'CSV & Audit Exports', 'Priority Audit Support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}><span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>verified</span>{f}</li>
                ))}
              </ul>
              <Link to="/register" style={{ padding: '16px', background: colors.accent, color: '#fff', borderRadius: '14px', fontWeight: 900, textAlign: 'center', display: 'block' }}>Get Pro Elite</Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: colors.navy, padding: '60px 40px', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>
            <div style={lpStyle.logo}>
              <div style={lpStyle.logoBox}><BrandLogo /></div>
              <span style={{ ...lpStyle.logoText, color: '#fff' }}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
            </div>
            <p style={{ opacity: 0.4, fontSize: '13px' }}>© 2026 StandingsHQ. Focused performance tracking for every scale.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
