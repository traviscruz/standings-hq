import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeHover, setActiveHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth > 1024;
  const isMobile = windowWidth <= 768;

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (email === 'juan@email.com' && password === 'password') {
      localStorage.setItem('username', 'Juan Dela Cruz');
      window.location.href = '/organizer/dashboard';
    } else if (email === 'judge@email.com' && password === 'password') {
      localStorage.setItem('username', 'Marian Rivera');
      window.location.href = '/judge/dashboard';
    } else if (email === 'riley@email.com' && password === 'password') {
      localStorage.setItem('username', 'Riley Cruz');
      window.location.href = '/participant/dashboard';
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  /* ── Styles ── */
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: isDesktop ? '1.1fr 1fr' : '1fr',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#fff',
    },
    authPanel: {
      display: 'flex',
      flexDirection: 'column',
      padding: isDesktop ? '48px 80px' : '32px 24px',
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'center',
    },
    header: {
      position: 'absolute',
      top: isDesktop ? '48px' : '32px',
      left: isDesktop ? '80px' : '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      zIndex: 10,
    },
    backLink: (hovered) => ({
      width: '38px',
      height: '38px',
      borderRadius: '12px',
      background: hovered ? colors.pageBg : '#fff',
      border: `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: hovered ? colors.navy : colors.inkMuted,
      textDecoration: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    }),
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
    },
    logoBox: {
      width: '28px',
      height: '28px',
      background: colors.navy,
      borderRadius: '8px',
      display: 'grid',
      placeItems: 'center',
    },
    logoText: {
      fontSize: '15px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.03em',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: '420px',
      margin: '0 auto',
      animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    },
    eyebrow: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      background: 'rgba(59, 130, 246, 0.08)',
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: '800',
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '20px',
    },
    pageTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '32px' : '42px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.04em',
      lineHeight: '1.1',
      marginBottom: '16px',
    },
    pageSub: {
      color: colors.inkMid,
      fontSize: '16px',
      lineHeight: '1.6',
      marginBottom: '40px',
    },
    formGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      fontSize: '11.5px',
      fontWeight: '700',
      color: colors.inkMuted,
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    input: (focused, hasError) => ({
      width: '100%',
      height: '52px',
      padding: '0 16px',
      background: colors.pageBg,
      border: `1.5px solid ${hasError ? colors.error : (focused ? colors.accent : colors.borderSoft)}`,
      borderRadius: '14px',
      fontSize: '15px',
      color: colors.navy,
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: focused ? `0 0 0 4px ${colors.accentGlow}` : 'none',
      fontFamily: "'Inter', sans-serif",
    }),
    passwordWrapper: {
      position: 'relative',
    },
    passToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: colors.inkMuted,
      padding: '8px',
      display: 'grid',
      placeItems: 'center',
      borderRadius: '8px',
      transition: 'all 0.2s',
    },
    primaryBtn: (hovered) => ({
      width: '100%',
      height: '54px',
      background: hovered ? colors.navySoft : colors.navy,
      color: '#fff',
      border: 'none',
      borderRadius: '16px',
      fontSize: '15.5px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      marginTop: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: hovered ? '0 12px 24px -8px rgba(15, 23, 42, 0.35)' : 'none',
      transform: hovered ? 'translateY(-2px)' : 'none',
    }),
    demoBtn: (hovered) => ({
      flex: 1,
      height: '40px',
      background: hovered ? colors.pageBg : '#fff',
      color: colors.navy,
      border: `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
      borderRadius: '12px',
      fontSize: '12.5px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    linkBtn: (hovered) => ({
      color: colors.accent,
      fontWeight: '700',
      textDecoration: 'none',
      transition: 'all 0.2s',
      borderBottom: `1.5px solid ${hovered ? colors.accent : 'transparent'}`,
      paddingBottom: '1px',
    }),
    forgotLink: (hovered) => ({
      fontSize: '13px',
      color: hovered ? colors.accent : colors.inkMuted,
      textDecoration: 'none',
      fontWeight: '600',
      display: 'block',
      textAlign: 'right',
      marginTop: '12px',
      transition: 'all 0.2s',
    }),
    footerText: {
      textAlign: 'center',
      marginTop: '32px',
      fontSize: '14.5px',
      color: colors.inkMid,
    },
    errorBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: '#FEF2F2',
      border: '1px solid #FEE2E2',
      padding: '12px 16px',
      borderRadius: '14px',
      marginBottom: '24px',
      animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
    },
    visualPanel: {
      background: colors.navy,
      position: 'relative',
      overflow: 'hidden',
      display: isDesktop ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px',
    },
    visualContent: {
      position: 'relative',
      zIndex: 5,
      maxWidth: '480px',
      width: '100%',
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
    featureCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      gap: '16px',
      transition: 'all 0.3s ease',
      marginBottom: '16px',
    },
    featureIcon: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'rgba(59, 130, 246, 0.1)',
      color: colors.accent,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    }
  };

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        `}
      </style>

      {/* ── AUTH SIDE ── */}
      <div style={styles.authPanel}>
        <div style={styles.header}>
          <Link 
            to="/" 
            style={styles.backLink(activeHover === 'back')}
            onMouseEnter={() => setActiveHover('back')}
            onMouseLeave={() => setActiveHover(null)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <div style={styles.logo}>
            <div style={styles.logoBox}>
              <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '16px' }}>monitoring</span>
            </div>
            <span style={styles.logoText}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
          </div>
        </div>

        <div style={styles.contentWrapper}>
          <span style={styles.eyebrow}>Secure Workspace Login</span>
          <h1 style={styles.pageTitle}>Welcome back <br /> to the <span style={{ color: colors.accent }}>HQ.</span></h1>
          <p style={styles.pageSub}>Access your professional event management dashboard and real-time results.</p>

          {error && (
            <div style={styles.errorBox}>
              <span className="material-symbols-rounded" style={{ color: colors.error, fontSize: '20px' }}>error</span>
              <span style={{ color: colors.error, fontSize: '14px', fontWeight: '600' }}>{error}</span>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Corporate Email</label>
            <input 
              type="email" 
              placeholder="name@organization.com" 
              style={styles.input(activeHover === 'email-focus', !!error)}
              onFocus={() => setActiveHover('email-focus')}
              onBlur={() => setActiveHover(null)}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
            />
          </div>

          <div style={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <label style={styles.label}>Password</label>
            </div>
            <div style={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                style={styles.input(activeHover === 'pass-focus', !!error)}
                onFocus={() => setActiveHover('pass-focus')}
                onBlur={() => setActiveHover(null)}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
              <button 
                style={styles.passToggle}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={() => setActiveHover('pass-toggle')}
                onMouseLeave={() => setActiveHover(null)}
                type="button"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px', color: activeHover === 'pass-toggle' ? colors.navy : colors.inkMuted }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <Link 
              to="/forgot-password" 
              style={styles.forgotLink(activeHover === 'forgot')}
              onMouseEnter={() => setActiveHover('forgot')}
              onMouseLeave={() => setActiveHover(null)}
            >
              Trouble signing in? Reset password.
            </Link>
          </div>

          <button 
            style={styles.primaryBtn(activeHover === 'login-btn')}
            onMouseEnter={() => setActiveHover('login-btn')}
            onMouseLeave={() => setActiveHover(null)}
            onClick={handleLogin}
          >
            Sign In to Workspace
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>login</span>
          </button>

          <p style={styles.footerText}>
            Don't have an account? <Link 
              to="/register" 
              style={styles.linkBtn(activeHover === 'reg')}
              onMouseEnter={() => setActiveHover('reg')}
              onMouseLeave={() => setActiveHover(null)}
            >Create one</Link>
          </p>

          <div style={{ marginTop: '48px', borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '32px' }}>
            <p style={{ ...styles.label, textAlign: 'center', marginBottom: '16px' }}>Immediate Demo Access</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.demoBtn(activeHover === 'demo-1')} onMouseEnter={() => setActiveHover('demo-1')} onMouseLeave={() => setActiveHover(null)} onClick={() => { setEmail('juan@email.com'); setPassword('password'); }}>Organizer</button>
              <button style={styles.demoBtn(activeHover === 'demo-2')} onMouseEnter={() => setActiveHover('demo-2')} onMouseLeave={() => setActiveHover(null)} onClick={() => { setEmail('judge@email.com'); setPassword('password'); }}>Judge</button>
              <button style={styles.demoBtn(activeHover === 'demo-3')} onMouseEnter={() => setActiveHover('demo-3')} onMouseLeave={() => setActiveHover(null)} onClick={() => { setEmail('riley@email.com'); setPassword('password'); }}>Participant</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── VISUAL SIDE ── */}
      <div style={styles.visualPanel}>
        <div style={styles.bgGradient} />
        <div style={styles.bgPattern} />
        
        <div style={styles.visualContent}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '24px', marginBottom: '24px', animation: 'float 4s ease-in-out infinite', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.accent }}>shield_with_heart</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '40px', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '20px' }}>
              The ecosystem for <br /> <span style={{ color: colors.accent }}>Competitions.</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', margin: 0 }}>
              Elite standings infrastructure for professional events. Automate ranking, evaluation, and certification in real-time.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: 'bolt', title: 'Ultra-low Latency', desc: 'Real-time scoring updates for live audiences.' },
              { icon: 'hub', title: 'Unified Ecosystem', desc: 'One account for organizers, judges, and users.' },
              { icon: 'workspace_premium', title: 'Automated Compliance', desc: 'Built-in rubric validation and audit trails.' }
            ].map((item, i) => (
              <div 
                key={i} 
                style={{ ...styles.featureCard, transform: activeHover === `feat-${i}` ? 'translateX(10px)' : 'none' }}
                onMouseEnter={() => setActiveHover(`feat-${i}`)}
                onMouseLeave={() => setActiveHover(null)}
              >
                <div style={styles.featureIcon}>
                  <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>{item.icon}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
