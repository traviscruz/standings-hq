import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

/**
 * LANDING PAGE - FINAL REFINED VERSION
 * 
 * Consistent with Authentication pages:
 * - Split Hero (Split Desktop) with signature gradients and patterns.
 * - Roles Section (Organizers, Judges, Participants).
 * - Premium Pricing with enhanced hover effects.
 * - Cleaned Footer with functional links.
 */
export default function LandingPage() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeHover, setActiveHover] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [visibleSections, setVisibleSections] = useState({ hero: true });

  const sectionRefs = useRef({});

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

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

  const lpStyle = {
    wrapper: {
      minHeight: '100vh',
      background: '#fff',
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
      padding: isMobile ? '0 24px' : '0 40px',
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
      color: scrolled ? colors.navy : '#fff',
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '-0.03em',
    },
    heroSection: {
      position: 'relative',
      minHeight: '100vh',
      background: colors.navy,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    },
    bgGradient: {
      position: 'absolute',
      inset: 0,
      background: `
        radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 1) 0%, ${colors.navy} 100%)
      `,
    },
    bgPattern: {
      position: 'absolute',
      inset: 0,
      opacity: 0.15,
      backgroundImage: `radial-gradient(${colors.accent} 0.8px, transparent 0.8px)`,
      backgroundSize: '24px 24px',
    },
    section: (id, bg = '#fff') => ({
      padding: isMobile ? '80px 24px' : '100px 40px',
      background: bg,
      opacity: visibleSections[id] ? 1 : 0,
      transform: visibleSections[id] ? 'translateY(0)' : 'translateY(30px)',
      transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
      position: 'relative',
    }),
    tag: {
      display: 'inline-flex',
      padding: '6px 14px',
      background: 'rgba(59, 130, 246, 0.1)',
      color: colors.accent,
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '20px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
    },
    title: (isDark) => ({
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '42px' : '72px',
      fontWeight: '900',
      lineHeight: '1.05',
      letterSpacing: '-0.04em',
      color: isDark ? '#fff' : colors.navy,
      marginBottom: '24px',
    }),
    desc: (isDark) => ({
      fontSize: '19px',
      color: isDark ? 'rgba(255,255,255,0.6)' : colors.inkMid,
      lineHeight: '1.6',
      marginBottom: '40px',
      maxWidth: '540px',
    }),
    primaryBtn: (hovered) => ({
      padding: '16px 36px',
      background: hovered ? colors.accentDeep : colors.accent,
      color: '#fff',
      borderRadius: '14px',
      fontWeight: '800',
      fontSize: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: hovered ? 'translateY(-2px)' : 'none',
      boxShadow: hovered ? `0 12px 24px -8px ${colors.accent}` : 'none',
    }),
    mockupCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '32px',
      padding: '32px',
      width: '100%',
      maxWidth: '520px',
      position: 'relative',
      zIndex: 5,
    },
    pricingCard: (hovered, variant = 'light') => ({
      padding: '56px',
      background: variant === 'dark' ? colors.navy : '#fff',
      color: variant === 'dark' ? '#fff' : colors.navy,
      border: `1.5px solid ${variant === 'dark' ? 'transparent' : colors.borderSoft}`,
      borderRadius: '40px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: hovered ? 'translateY(-12px) scale(1.02)' : 'none',
      boxShadow: hovered ? `0 32px 64px -16px ${variant === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(0,0,0,0.1)'}` : 'none',
      position: 'relative',
      overflow: 'hidden',
    }),
    workflowCard: (hovered) => ({
      padding: '40px',
      background: '#fff',
      border: `1.5px solid ${hovered ? colors.accent : colors.borderSoft}`,
      borderRadius: '28px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: hovered ? 'translateY(-10px)' : 'none',
      boxShadow: hovered ? '0 20px 40px -10px rgba(0,0,0,0.05)' : 'none',
    }),
    roleCard: (id, hovered) => ({
      padding: '48px',
      background: id === 0 ? colors.navy : (id === 1 ? '#fff' : colors.accentBg),
      color: id === 0 ? '#fff' : colors.navy,
      border: id === 1 ? `1.5px solid ${colors.borderSoft}` : 'none',
      borderRadius: '40px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: hovered ? (id === 0 ? 'translateX(12px)' : 'translateY(-12px)') : 'none',
      boxShadow: hovered ? (id === 0 ? 'none' : '0 24px 48px -12px rgba(0,0,0,0.1)') : 'none',
    })
  };

  const proPrice = billingCycle === 'monthly' ? '499' : '399';

  return (
    <div style={lpStyle.wrapper}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .lp-animate-float { animation: float 4s ease-in-out infinite; }
        .lp-pulse { animation: pulse 2s infinite; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── NAVIGATION ── */}
      <nav style={lpStyle.nav}>
        <div style={lpStyle.navInner}>
          <Link to="/" style={lpStyle.logo}>
            <div style={{ ...lpStyle.logoBox, background: scrolled ? colors.navy : colors.accent }}>
              <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '18px' }}>monitoring</span>
            </div>
            <span style={lpStyle.logoText}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
          </Link>

          {!isMobile && (
            <ul style={{ display: 'flex', gap: '32px', listStyle: 'none', margin: 0, padding: 0 }}>
              {['How it works', 'Roles', 'Pricing'].map(l => (
                <li key={l}>
                  <a href={`#${l.toLowerCase().replace(/ /g, '-')}`} style={{ 
                    fontSize: '14.5px', 
                    fontWeight: 600, 
                    color: scrolled ? (activeHover === l ? colors.accent : colors.inkSoft) : (activeHover === l ? '#fff' : 'rgba(255,255,255,0.7)'),
                    textDecoration: 'none',
                    transition: '0.2s'
                  }} onMouseEnter={() => setActiveHover(l)} onMouseLeave={() => setActiveHover(null)}>{l}</a>
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: '14.5px', fontWeight: 700, color: scrolled ? colors.navy : '#fff', textDecoration: 'none' }}>Log in</Link>
            <Link to="/register" style={{ 
              padding: '12px 24px', 
              background: scrolled ? colors.navy : '#fff', 
              color: scrolled ? '#fff' : colors.navy, 
              borderRadius: '12px', 
              fontWeight: 800, 
              fontSize: '14px',
              textDecoration: 'none'
            }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── SPLIT HERO ── */}
      <header style={lpStyle.heroSection} id="hero">
        <div style={lpStyle.bgGradient} />
        <div style={lpStyle.bgPattern} />
        
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: isMobile ? '120px 24px 80px' : '0 40px', display: 'grid', gridTemplateColumns: isDesktop ? '1.1fr 0.9fr' : '1fr', gap: '80px', alignItems: 'center', position: 'relative', zIndex: 5 }}>
          <div style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
            <div style={lpStyle.tag}>Premium Performance Infrastructure</div>
            <h1 style={lpStyle.title(true)}>The ecosystem for <br /><span style={{ color: colors.accent }}>Competitions.</span></h1>
            <p style={lpStyle.desc(true)}>Elite standings infrastructure for professional events. Automate ranking, evaluation, and certification in real-time with millisecond precision.</p>
            
            <Link to="/register" 
              style={lpStyle.primaryBtn(activeHover === 'hero-primary')}
              onMouseEnter={() => setActiveHover('hero-primary')}
              onMouseLeave={() => setActiveHover(null)}
            >
              Launch Your Event
              <span className="material-symbols-rounded">arrow_forward</span>
            </Link>
          </div>
          
          {!isMobile && (
            <div className="lp-animate-float" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={lpStyle.mockupCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', color: colors.success, padding: '8px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div className="lp-pulse" style={{ width: '8px', height: '8px', background: colors.success, borderRadius: '50%' }}></div>
                    LIVE SYNCING
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: 'Antonio Luna', team: 'Elite Staff', score: '98.5', r: '1', trend: 'up' },
                    { name: 'Jose Rizal', team: 'Solidaridad', score: '94.2', r: '2', trend: 'down' },
                    { name: 'Maria Santos', team: 'Metro Innovate', score: '89.6', r: '3', trend: 'up' }
                  ].map((p, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      padding: '20px', 
                      background: i === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)', 
                      border: `1px solid ${i === 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`, 
                      borderRadius: '20px'
                    }}>
                      <div style={{ width: '36px', height: '36px', background: i === 0 ? colors.accent : 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '14px' }}>{p.r}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{p.team}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '18px', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.7)' }}>{p.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── WORKFLOW SECTION ── */}
      <section style={lpStyle.section('how-it-works', '#F9FBFF')} id="how-it-works" ref={el => sectionRefs.current['how-it-works'] = el}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={lpStyle.tag}>The Workflow</div>
          <h2 style={{ ...lpStyle.title(false), fontSize: isMobile ? '36px' : '48px' }}>How it works.</h2>
          <p style={{ ...lpStyle.desc(false), margin: '0 auto' }}>A seamless integration of logic and data, designed for scale.</p>
        </div>
        
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { t: 'Construct', i: 'architecture', d: 'Design weighted rubrics and event logic tailored for your institution.' },
            { t: 'Coordinate', i: 'groups', d: 'Invite judges and register participants. Role-based access ensures security.' },
            { t: 'Calculate', i: 'calculate', d: 'Judges score in real-time. Results are computed and synced in milliseconds.' },
            { t: 'Complete', i: 'verified', d: 'Generate verified certificates and publish final standings to the public hub.' }
          ].map((s, i) => (
            <div 
              key={i} 
              style={lpStyle.workflowCard(activeHover === `workflow-${i}`)}
              onMouseEnter={() => setActiveHover(`workflow-${i}`)}
              onMouseLeave={() => setActiveHover(null)}
            >
              <div style={{ width: '56px', height: '56px', background: colors.pageBg, color: colors.accent, borderRadius: '16px', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>{s.i}</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 900, color: colors.accent, marginBottom: '12px', letterSpacing: '0.1em' }}>PHASE 0{i + 1}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: colors.navy, marginBottom: '16px' }}>{s.t}</h3>
              <p style={{ fontSize: '15px', color: colors.inkMid, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLES SECTION (FOR WHAT USERS TOO) ── */}
      <section style={lpStyle.section('roles')} id="roles" ref={el => sectionRefs.current.roles = el}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={lpStyle.tag}>Dedicated Hubs</div>
          <h2 style={{ ...lpStyle.title(false), fontSize: isMobile ? '36px' : '48px' }}>Built for everyone.</h2>
          <p style={{ ...lpStyle.desc(false), maxWidth: '600px', margin: '0 auto' }}>Specialized portals tailored for every role in the ecosystem.</p>
        </div>
        
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: '32px' }}>
          {[
            { r: 'Organizer', icon: 'shield_person', d: 'The control center. Manage logic, staff, and publish final standings with precision.' },
            { r: 'Judge', icon: 'gavel', d: 'The evaluation tool. Scoring rubrics designed for mobile-first speed and accuracy.' },
            { r: 'Participant', icon: 'person_celebrate', d: 'The athlete hub. Track your ranking, view live results, and download certificates.' }
          ].map((r, i) => (
            <div 
              key={i} 
              style={lpStyle.roleCard(i, activeHover === `role-${i}`)}
              onMouseEnter={() => setActiveHover(`role-${i}`)}
              onMouseLeave={() => setActiveHover(null)}
            >
              <div style={{ width: '64px', height: '64px', background: i === 0 ? 'rgba(255,255,255,0.08)' : (i === 1 ? colors.pageBg : 'rgba(59, 130, 246, 0.1)'), color: i === 0 ? '#fff' : (i === 1 ? colors.accent : colors.navy), borderRadius: '20px', display: 'grid', placeItems: 'center', marginBottom: '32px', transition: '0.3s' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '30px' }}>{r.icon}</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '20px', fontFamily: "'DM Sans', sans-serif" }}>{r.r} Hub</h3>
              <p style={{ opacity: 0.8, fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>{r.d}</p>
              <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: '700', color: i === 0 ? colors.accent : colors.navy, textDecoration: 'none' }}>
                Join as {r.r} <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING SECTION (ENHANCED HOVER) ── */}
      <section style={lpStyle.section('pricing', colors.pageBg)} id="pricing" ref={el => sectionRefs.current.pricing = el}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={lpStyle.tag}>Scalable Plans</div>
          <h2 style={{ ...lpStyle.title(false), fontSize: isMobile ? '36px' : '48px' }}>Simple Pricing.</h2>
          <div style={{ display: 'inline-flex', padding: '6px', background: '#fff', borderRadius: '100px', border: `1.5px solid ${colors.borderSoft}`, marginTop: '12px' }}>
            <button onClick={() => setBillingCycle('monthly')} style={{ padding: '12px 28px', background: billingCycle === 'monthly' ? colors.navy : 'transparent', color: billingCycle === 'monthly' ? '#fff' : colors.inkMuted, border: 'none', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>Monthly</button>
            <button onClick={() => setBillingCycle('yearly')} style={{ padding: '12px 28px', background: billingCycle === 'yearly' ? colors.navy : 'transparent', color: billingCycle === 'yearly' ? '#fff' : colors.inkMuted, border: 'none', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>Yearly (Save 20%)</button>
          </div>
        </div>
        
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '32px' }}>
          <div 
            style={lpStyle.pricingCard(activeHover === 'price-free', 'light')} 
            onMouseEnter={() => setActiveHover('price-free')} 
            onMouseLeave={() => setActiveHover(null)}
          >
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: colors.inkMuted, marginBottom: '16px', textTransform: 'uppercase' }}>Foundation</div>
              <div style={{ fontSize: '56px', fontWeight: 900, color: colors.navy }}>₱0</div>
              <div style={{ color: colors.inkSoft, fontWeight: 600, fontSize: '15px' }}>Free for small events</div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '56px', flex: 1 }}>
              {['Unlimited basic events', 'Live public leaderboards', 'Up to 50 participants', '2 Judges per event'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15.5px', color: colors.inkMid }}><span className="material-symbols-rounded" style={{ color: colors.success, fontSize: '22px' }}>check_circle</span>{f}</li>
              ))}
            </ul>
            <Link to="/register" style={{ padding: '18px', background: colors.navy, color: '#fff', borderRadius: '16px', fontWeight: 800, textAlign: 'center', display: 'block', textDecoration: 'none' }}>Launch Free</Link>
          </div>
          
          <div 
            style={lpStyle.pricingCard(activeHover === 'price-pro', 'dark')}
            onMouseEnter={() => setActiveHover('price-pro')} 
            onMouseLeave={() => setActiveHover(null)}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px 24px', background: colors.accent, color: '#fff', fontSize: '12px', fontWeight: 900, borderRadius: '0 0 0 20px' }}>Best Value</div>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, opacity: 0.6, marginBottom: '16px', textTransform: 'uppercase' }}>Pro Elite</div>
              <div style={{ fontSize: '56px', fontWeight: 900 }}>₱{proPrice}</div>
              <div style={{ opacity: 0.6, fontWeight: 600, fontSize: '15px' }}>Per month / billed {billingCycle}</div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '56px', flex: 1 }}>
              {['Unlimited Participants', 'Automated Certificates', 'CSV & Audit Exports', 'Advanced Rubric Logic', 'Priority Support'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15.5px' }}><span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '22px' }}>verified</span>{f}</li>
              ))}
            </ul>
            <Link to="/register" style={{ padding: '18px', background: colors.accent, color: '#fff', borderRadius: '16px', fontWeight: 900, textAlign: 'center', display: 'block', textDecoration: 'none' }}>Subscribe Now</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTERSECTION ── */}
      <footer style={{ background: colors.navy, padding: '80px 40px', color: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '60px' }}>
          <div>
            <Link to="/" style={{ ...lpStyle.logo, marginBottom: '24px' }}>
              <div style={{ ...lpStyle.logoBox, background: colors.accent }}>
                <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '18px' }}>monitoring</span>
              </div>
              <span style={{ ...lpStyle.logoText, color: '#fff' }}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
            </Link>
            <p style={{ opacity: 0.5, fontSize: '14px', lineHeight: 1.6, maxWidth: '300px' }}>The professional gold standard for event ranking, evaluation, and certification.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px', color: colors.accent }}>COMPANY</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/leaderboard" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14.5px' }}>Live Leaderboard</Link>
                <Link to="/archive" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14.5px' }}>Archive</Link>
                <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14.5px' }}>Workflow</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px', color: colors.accent }}>LEGAL</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14.5px' }}>Privacy Policy</Link>
                <Link to="/terms" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14.5px' }}>Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ maxWidth: '1280px', margin: '60px auto 0', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
          <p>© 2026 StandingsHQ. Focused performance tracking.</p>
        </div>
      </footer>
    </div>
  );
}
