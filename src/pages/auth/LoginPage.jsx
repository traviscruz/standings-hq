import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);

  // Prof's Format: Style constants with colors pulling from colors.js
  const pageStyle = {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const panelStyle = {
    background: colors.white,
    display: 'flex',
    flexDirection: 'column',
    padding: window.innerWidth > 1024 ? '36px 48px' : '36px 32px',
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle = {
    marginBottom: '52px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const backButtonStyle = {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: isBackHovered ? colors.white : colors.offWhite,
    border: `1px solid ${isBackHovered ? colors.accent : colors.border}`,
    color: isBackHovered ? colors.navy : colors.inkMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: '0.22s ease',
    textDecoration: 'none',
    transform: isBackHovered ? 'translateY(-1px)' : 'none',
    boxShadow: isBackHovered ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  };

  const logoMarkStyle = {
    width: '32px',
    height: '32px',
    background: colors.navy,
    borderRadius: '7px',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  };

  const logoTextStyle = {
    fontSize: '16px',
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: '-0.03em',
  };

  const eyebrowStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: colors.accentBg,
    border: `1px solid ${colors.accentBgMid}`,
    color: colors.accentDeep,
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '5px 14px',
    borderRadius: '100px',
    marginBottom: '20px',
    width: 'fit-content',
  };

  const titleStyle = {
    fontSize: '30px',
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: '-0.03em',
    lineHeight: '1.15',
    marginBottom: '6px',
  };

  const subStyle = {
    fontSize: '14px',
    color: colors.inkMuted,
    marginBottom: '30px',
    lineHeight: '1.6',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: `1.5px solid ${error ? colors.error : colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: colors.ink,
    background: error ? colors.errorBg : colors.offWhite,
    outline: 'none',
    transition: '0.22s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: '600',
    color: colors.inkSoft,
    marginBottom: '6px',
  };

  const loginButtonStyle = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: isLoginHovered ? colors.navySoft : colors.navy,
    color: colors.white,
    border: 'none',
    transition: '0.22s ease',
    marginTop: '20px',
  };

  const demoButtonStyle = {
    background: 'transparent',
    border: `1.5px solid ${colors.border}`,
    color: colors.ink,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  };

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    // Mock login logic
    if (email === 'juan@email.com' && password === 'password') {
      window.location.href = '/organizer/dashboard';
    } else if (email === 'judge@email.com' && password === 'password') {
      window.location.href = '/judge/dashboard';
    } else if (email === 'riley@email.com' && password === 'password') {
      window.location.href = '/participant/dashboard';
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <Link 
            to="/" 
            style={backButtonStyle} 
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            title="Back to home"
          >
             <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <Link to="/" style={logoStyle}>
             <div style={logoMarkStyle}>
                <span className="material-symbols-rounded" style={{ color: colors.white, fontSize: '18px' }}>monitoring</span>
             </div>
             <span style={logoTextStyle}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
          </Link>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '420px', margin: '0 auto', width: '100%' }}>
          <span style={eyebrowStyle}>Welcome back</span>
          
          <h1 style={titleStyle}>Sign in to your <em style={{ color: colors.accent, fontStyle: 'normal' }}>workspace.</em></h1>
          <p style={subStyle}>Enter your credentials to continue. Your events, scores, and certificates are waiting.</p>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Email address</label>
            <input 
              type="email" 
              placeholder="name@email.com" 
              style={inputStyle}
              value={email}
              onChange={(e) => {setEmail(e.target.value); setError('');}}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Your password" 
                style={inputStyle}
                value={password}
                onChange={(e) => {setPassword(e.target.value); setError('');}}
              />
              <button 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.inkMuted, display: 'flex', alignItems: 'center' }}
                onClick={() => setShowPassword(!showPassword)} 
                type="button"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {error && <div style={{ fontSize: '11.5px', color: colors.error, marginTop: '5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>
              {error}
            </div>}
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ display: 'block', fontSize: '12.5px', color: colors.inkMuted, textDecoration: 'none', fontWeight: 500, marginTop: '-10px', marginBottom: '12px' }}>Forgot password?</Link>
          </div>

          <button 
            style={loginButtonStyle} 
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
            onClick={handleLogin}
          >
            Sign in
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px' }}>
            <button style={demoButtonStyle} onClick={() => window.location.href='/organizer/dashboard'}>Demo: Organizer</button>
            <button style={demoButtonStyle} onClick={() => window.location.href='/judge/dashboard'}>Demo: Judge</button>
            <button style={demoButtonStyle} onClick={() => window.location.href='/participant/dashboard'}>Demo: Participant</button>
            <div style={{ padding: '4px', borderTop: `1px solid ${colors.borderSoft}`, gridColumn: '1 / -1', margin: '4px 0' }} />
            <button style={{ ...demoButtonStyle, color: '#6366f1' }} onClick={() => window.location.href='/archive'}>Demo: Public Archive</button>
            <button style={{ ...demoButtonStyle, color: '#10b981' }} onClick={() => window.location.href='/leaderboard'}>Demo: Public Leaderboard</button>
            <button style={demoButtonStyle} onClick={() => window.location.href='/404-test-page'}>Test: 404 Page</button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: colors.inkMuted }}>
            No account yet? <Link to="/register" style={{ color: colors.accentDeep, fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
          </div>
        </div>
      </div>

      <div style={{ background: colors.navy, position: 'relative', overflow: 'hidden', display: window.innerWidth > 1024 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 70% at 20% 20%, rgba(59, 130, 246, 0.1), transparent 55%), radial-gradient(ellipse 60% 60% at 85% 80%, rgba(30, 58, 110, 0.7), transparent 60%), ${colors.navy}` }}></div>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.accent, marginBottom: '14px' }}>Live competition platform</div>
          <h2 style={{ fontSize: 'clamp(21px, 2.2vw, 28px)', fontWeight: '800', color: colors.white, letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '10px' }}>Your <em style={{ color: colors.accent, fontStyle: 'normal' }}>competition hub</em> is live and ready.</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: '1.65', marginBottom: '30px' }}>Manage events, judge scores, and publish results — one professional platform built for the pace of competition day.</p>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.09)', borderRadius: '14px', overflow: 'hidden', marginBottom: '22px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.07)', padding: '11px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live Standings</span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>Updating</span>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '20px', textAlign: 'center' }}>🥇</span>
                <div><div style={{ fontSize: '12.5px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.75)' }}>Team Alpha</div></div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: colors.accent }}>94.6</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', textAlign: 'center', color: 'rgba(255, 255, 255, 0.3)' }}>#2</span>
                <div><div style={{ fontSize: '12.5px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.75)' }}>Team Bravo</div></div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: colors.white }}>89.2</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', textAlign: 'center', color: 'rgba(255, 255, 255, 0.3)' }}>#3</span>
                <div><div style={{ fontSize: '12.5px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.75)' }}>Team Delta</div></div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: colors.white }}>86.5</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '8px 13px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: colors.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '16px' }}>insights</span>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>Real-time scoring</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '8px 13px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-rounded" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>workspace_premium</span>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>1-click certificates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
