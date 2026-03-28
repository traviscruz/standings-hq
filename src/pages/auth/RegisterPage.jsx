import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ fname: '', lname: '', username: '', email: '', password: '', confirmPassword: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pwScore, setPwScore] = useState(0);
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

  const rGo = (s) => {
    if (s > step) {
      if (step === 0 && !formData.role) {
        setError('Please select your role in the ecosystem.');
        return;
      }
      if (step === 1 && (!formData.fname || !formData.lname)) {
        setError('Please enter your full name.');
        return;
      }
      if (step === 2 && (!formData.username || !formData.email)) {
        setError('Username and email are required.');
        return;
      }
      if (step === 3 && (pwScore < 2 || formData.password !== formData.confirmPassword)) {
        if (pwScore < 2) setError('Please create a stronger password.');
        else setError('Passwords do not match.');
        return;
      }
    }
    setError('');
    setStep(s);
  };

  const calcPw = (v) => {
    let s = 0; if (v.length >= 8) s++; if (/[A-Z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
    setPwScore(s);
    setFormData({ ...formData, password: v });
  };

  const roles = [
    { title: 'Organizer', icon: 'shield_person', desc: 'Create events, manage staff, and publish final standings.' },
    { title: 'Judge', icon: 'gavel', desc: 'Real-time mobile scoring, rubric evaluation, and consensus building.' },
    { title: 'Participant', icon: 'person_celebrate', desc: 'Track rankings, view live results, and download certificates.' }
  ];

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
      maxWidth: '520px',
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
      fontSize: isMobile ? '30px' : '38px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.04em',
      lineHeight: '1.2',
      marginBottom: '10px',
    },
    pageSub: {
      color: colors.inkMid,
      fontSize: '15.5px',
      lineHeight: '1.6',
      marginBottom: '32px',
    },
    stepIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '32px',
    },
    stepDot: (active, completed) => ({
      width: '34px',
      height: '34px',
      borderRadius: '10px',
      background: completed ? colors.success : (active ? colors.navy : colors.pageBg),
      color: (active || completed) ? '#fff' : colors.inkMuted,
      display: 'grid',
      placeItems: 'center',
      fontSize: '13px',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      border: `1.5px solid ${active ? colors.navy : colors.borderSoft}`,
    }),
    stepLine: (completed) => ({
      flex: 1,
      height: '3px',
      borderRadius: '2px',
      background: completed ? colors.success : colors.borderSoft,
      transition: 'all 0.4s ease',
    }),
    formGroup: {
      marginBottom: '24px',
    },
    roleCard: (selected, hovered) => ({
      padding: '20px',
      borderRadius: '20px',
      background: selected ? 'rgba(59, 130, 246, 0.03)' : (hovered ? colors.pageBg : '#fff'),
      border: `2px solid ${selected ? colors.accent : (hovered ? colors.border : colors.borderSoft)}`,
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '16px',
      boxShadow: selected ? `0 12px 24px -8px ${colors.accentGlow}` : 'none',
      transform: hovered ? 'translateX(6px)' : 'none',
    }),
    roleIcon: (selected) => ({
      width: '52px',
      height: '52px',
      borderRadius: '14px',
      background: selected ? colors.accent : colors.pageBg,
      color: selected ? '#fff' : colors.navy,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    }),
    primaryBtn: (hovered, variant = 'navy') => ({
      width: '100%',
      height: '54px',
      background: variant === 'navy' ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.accentDeep : colors.accent),
      color: '#fff',
      border: 'none',
      borderRadius: '16px',
      fontSize: '15.5px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: hovered ? '0 12px 24px -8px rgba(15, 23, 42, 0.3)' : 'none',
      transform: hovered ? 'translateY(-2px)' : 'none',
      marginTop: '12px',
    }),
    ghostBtn: (hovered) => ({
      height: '54px',
      padding: '0 24px',
      background: 'transparent',
      color: colors.navy,
      border: `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
      borderRadius: '16px',
      fontSize: '15.5px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }),
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
      transition: 'all 0.2s',
      fontFamily: "'Inter', sans-serif",
    }),
    label: {
      display: 'block',
      fontSize: '11.5px',
      fontWeight: '700',
      color: colors.inkMuted,
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
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
    visualContent: {
      position: 'relative',
      zIndex: 5,
      maxWidth: '480px',
      width: '100%',
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
    pwBadge: (n) => ({
      flex: 1,
      height: '5px',
      borderRadius: '10px',
      background: n <= pwScore ? (pwScore < 2 ? colors.error : pwScore < 4 ? colors.warning : colors.success) : colors.borderSoft,
      transition: 'all 0.3s ease',
    }),
    ruleItem: (valid) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      color: valid ? colors.success : colors.inkMid,
      fontWeight: valid ? '600' : '400',
      marginBottom: '8px',
      transition: 'all 0.2s',
    }),
  };

  const Rule = ({ valid, text }) => (
    <div style={styles.ruleItem(valid)}>
      <span className="material-symbols-rounded" style={{ fontSize: '18px', color: valid ? colors.success : colors.border }}>
        {valid ? 'check_circle' : 'circle'}
      </span>
      {text}
    </div>
  );

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        `}
      </style>

      {/* ── FORM SIDE ── */}
      <div style={styles.authPanel}>
        <div style={styles.header}>
          <Link
            to={step === 0 ? "/login" : "#"}
            onClick={(e) => { if (step > 0) { e.preventDefault(); rGo(step - 1); } }}
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
          {step < 4 && (
            <>
              <span style={styles.eyebrow}>
                {step === 0 ? 'Getting Started' : `Step ${step} of 3`}
              </span>
              <h1 style={styles.pageTitle}>
                {step === 0 ? "First, who are you?" 
                 : step === 1 ? "What's your name?" 
                 : step === 2 ? "Create your profile." 
                 : "Secure your workspace."}
              </h1>
              <p style={styles.pageSub}>
                {step === 0 ? "Select your role in the StandingsHQ ecosystem to customize your experience." 
                 : step === 1 ? "Let's get the basics down before we configure your dashboard." 
                 : step === 2 ? "This is how you'll be identified across all portals." 
                 : "Use a strong password to protect your event data and integrity."}
              </p>

              {step > 0 && (
                <div style={styles.stepIndicator}>
                  <div style={styles.stepDot(step === 1, step > 1)}>{step > 1 ? '✓' : '1'}</div>
                  <div style={styles.stepLine(step > 1)}></div>
                  <div style={styles.stepDot(step === 2, step > 2)}>{step > 2 ? '✓' : '2'}</div>
                  <div style={styles.stepLine(step > 2)}></div>
                  <div style={styles.stepDot(step === 3, step > 3)}>{step > 3 ? '✓' : '3'}</div>
                </div>
              )}
            </>
          )}

          {step === 0 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {roles.map((r) => (
                <div 
                  key={r.title}
                  style={styles.roleCard(formData.role === r.title, activeHover === r.title)}
                  onMouseEnter={() => setActiveHover(r.title)}
                  onMouseLeave={() => setActiveHover(null)}
                  onClick={() => setFormData({ ...formData, role: r.title })}
                >
                  <div style={styles.roleIcon(formData.role === r.title)}>
                    <span className="material-symbols-rounded">{r.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.navy, marginBottom: '4px' }}>{r.title}</h3>
                    <p style={{ fontSize: '13.5px', color: colors.inkMid, lineHeight: '1.4' }}>{r.desc}</p>
                  </div>
                  {formData.role === r.title && (
                    <span className="material-symbols-rounded" style={{ color: colors.accent }}>check_circle</span>
                  )}
                </div>
              ))}
              {error && <p style={{ color: colors.error, fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>{error}</p>}
              <button
                style={styles.primaryBtn(activeHover === 'role-next')}
                onMouseEnter={() => setActiveHover('role-next')}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => rGo(1)}
              >
                Continue as {formData.role || '...'}
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>arrow_forward</span>
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name</label>
                  <input type="text" style={styles.input(activeHover === 'fn', !!error)} onFocus={() => setActiveHover('fn')} onBlur={() => setActiveHover(null)} placeholder="John" value={formData.fname} onChange={(e) => setFormData({ ...formData, fname: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input type="text" style={styles.input(activeHover === 'ln', !!error)} onFocus={() => setActiveHover('ln')} onBlur={() => setActiveHover(null)} placeholder="Doe" value={formData.lname} onChange={(e) => setFormData({ ...formData, lname: e.target.value })} />
                </div>
              </div>
              {error && <p style={{ color: colors.error, fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>{error}</p>}
              <button
                style={styles.primaryBtn(activeHover === 'next')}
                onMouseEnter={() => setActiveHover('next')}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => rGo(2)}
              >
                Account Details
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>arrow_forward</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input type="text" style={styles.input(activeHover === 'un', !!error)} onFocus={() => setActiveHover('un')} onBlur={() => setActiveHover(null)} placeholder="johndoe_hq" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input type="email" style={styles.input(activeHover === 'em', !!error)} onFocus={() => setActiveHover('em')} onBlur={() => setActiveHover(null)} placeholder="john@events.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              {error && <p style={{ color: colors.error, fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>{error}</p>}
              <button
                style={styles.primaryBtn(activeHover === 'next')}
                onMouseEnter={() => setActiveHover('next')}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => rGo(3)}
              >
                Security Setup
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>arrow_forward</span>
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={styles.input(activeHover === 'pw', !!error)}
                    onFocus={() => setActiveHover('pw')}
                    onBlur={() => setActiveHover(null)}
                    placeholder="••••••••"
                    onChange={(e) => calcPw(e.target.value)}
                  />
                  <button style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.inkMuted }} onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-rounded">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '14px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map(n => <div key={n} style={styles.pwBadge(n)} />)}
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <Rule valid={formData.password.length >= 8} text="Minimum 8 characters" />
                  <Rule valid={/[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password)} text="Uppercase & numbers" />
                </div>
                <label style={styles.label}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={styles.input(activeHover === 'cpw', !!error && formData.password !== formData.confirmPassword)}
                    onFocus={() => setActiveHover('cpw')}
                    onBlur={() => setActiveHover(null)}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                {formData.confirmPassword && (
                   <div style={{ marginTop: '12px' }}>
                     <Rule valid={formData.password === formData.confirmPassword} text="Passwords match" />
                   </div>
                )}
              </div>
              {error && <p style={{ color: colors.error, fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>{error}</p>}
              <button
                style={styles.primaryBtn(activeHover === 'finish', 'accent')}
                onMouseEnter={() => setActiveHover('finish')}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => rGo(4)}
              >
                Complete Registration
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>verified</span>
              </button>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'left', animation: 'fadeInUp 0.6s' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'grid', placeItems: 'center', marginBottom: '32px', color: colors.success, boxShadow: `0 12px 24px rgba(16, 185, 129, 0.15)` }}>
                <span className="material-symbols-rounded" style={{ fontSize: '40px' }}>verified_user</span>
              </div>
              <h2 style={{ ...styles.pageTitle, fontSize: '32px' }}>Welcome, {formData.role}.</h2>
              <p style={{ ...styles.pageSub, marginBottom: '32px' }}>Your {formData.role.toLowerCase()} profile has been activated. You now have full access to the StandingsHQ high-precision ecosystem.</p>
              <Link 
                to={formData.role === 'Organizer' ? "/organizer/dashboard" : formData.role === 'Judge' ? "/judge/dashboard" : "/participant/dashboard"} 
                style={{ ...styles.primaryBtn(activeHover === 'dash'), textDecoration: 'none' }} 
                onMouseEnter={() => setActiveHover('dash')} 
                onMouseLeave={() => setActiveHover(null)}
              >
                Enter Your Hub
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>dashboard_customize</span>
              </Link>
            </div>
          )}
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