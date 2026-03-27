import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [hovered, setHovered] = useState({ back: false, send: false });

  // Prof's Format: Style constants using imported global colors
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
    background: hovered.back ? colors.white : colors.offWhite,
    border: `1px solid ${hovered.back ? colors.accent : colors.border}`,
    color: hovered.back ? colors.navy : colors.inkMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: '0.22s ease',
    textDecoration: 'none',
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

  const sendButtonStyle = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: hovered.send ? colors.navySoft : colors.navy,
    color: colors.white,
    border: 'none',
    transition: '0.22s ease',
    marginTop: '20px',
  };

  const ghostButtonStyle = {
    background: 'transparent',
    border: `1.5px solid ${colors.border}`,
    color: colors.ink,
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.22s ease',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const handleSend = () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setStep(2);
  };

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <Link 
            to="/login" 
            style={backButtonStyle} 
            onMouseEnter={() => setHovered({ ...hovered, back: true })}
            onMouseLeave={() => setHovered({ ...hovered, back: false })}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', background: colors.navy, borderRadius: '7px', display: 'grid', placeItems: 'center' }}>
              <span className="material-symbols-rounded" style={{ color: colors.white, fontSize: '18px' }}>monitoring</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: colors.ink }}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
          </div>
        </div>

        <div style={{ ...panelStyle, flex: 1, padding: 0, justifyContent: 'center', maxWidth: '420px', margin: '0 auto', width: '100%', overflow: 'visible' }}>
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: colors.accentDeep, background: colors.accentBg, padding: '5px 14px', borderRadius: '100px', marginBottom: '20px', display: 'inline-block' }}>Account recovery</span>
              <h1 style={titleStyle}>Reset your <em style={{ color: colors.accent, fontStyle: 'normal' }}>password.</em></h1>
              <p style={subStyle}>Enter your email to receive a secure reset link.</p>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: colors.inkSoft, marginBottom: '6px' }}>Email address</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
                {error && <div style={{ fontSize: '11.5px', color: colors.error, marginTop: '5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>
                  {error}
                </div>}
              </div>

              <button
                style={sendButtonStyle}
                onMouseEnter={() => setHovered({ ...hovered, send: true })}
                onMouseLeave={() => setHovered({ ...hovered, send: false })}
                onClick={handleSend}
              >
                Send reset link
              </button>

              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: colors.inkMuted }}>
                Remembered it? <Link to="/login" style={{ color: colors.accentDeep, fontWeight: 700, textDecoration: 'none' }}>Back to sign in</Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: colors.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <span className="material-symbols-rounded" style={{ color: colors.success, fontSize: '28px' }}>mail</span>
              </div>
              <h1 style={titleStyle}>Check your inbox.</h1>
              <p style={subStyle}>A password reset link has been sent to <strong>{email}</strong>.</p>
              <Link to="/login" style={ghostButtonStyle}>Back to sign in</Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: colors.navy, display: window.innerWidth > 1024 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '28px', color: colors.white, fontWeight: '800', marginBottom: '10px' }}>Account security is our <em style={{ color: colors.accent, fontStyle: 'normal' }}>priority.</em></h2>
      </div>
    </div>
  );
}
