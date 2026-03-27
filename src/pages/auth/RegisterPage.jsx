import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fname: '', lname: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pwScore, setPwScore] = useState(0);
  const [error, setError] = useState('');
  const [hovered, setHovered] = useState({ back: false, next: false, dash: false });

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

  const eyebrowStyle = {
    display: 'inline-flex',
    alignItems: 'center',
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

  const nextButtonStyle = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: hovered.next ? colors.navySoft : colors.navy,
    color: colors.white,
    border: 'none',
    transition: '0.22s ease',
  };

  const accentButtonStyle = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: hovered.next ? colors.accentDeep : colors.accent,
    color: colors.white,
    border: 'none',
    transition: '0.22s ease',
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
  };

  const sbNumStyle = (s) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: `2px solid ${step > s ? colors.accent : step === s ? colors.navy : colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    background: step > s ? colors.accent : step === s ? colors.navy : colors.white,
    color: step >= s ? colors.white : colors.inkMuted,
    transition: '0.22s ease',
    flexShrink: 0,
  });

  const pwBarStyle = (n) => ({
    flex: 1,
    height: '3px',
    borderRadius: '100px',
    background: n <= pwScore ? (pwScore === 1 ? colors.error : pwScore === 2 ? colors.accent : pwScore === 3 ? colors.accentDeep : colors.success) : colors.border,
    transition: '0.3s ease',
  });

  const rGo = (s) => {
    if (s > step) {
      if (step === 1 && (!formData.fname || !formData.lname)) {
        setError('Please enter your full name.');
        return;
      }
      if (step === 2 && (!formData.username || !formData.email)) {
        setError('Username and email are required.');
        return;
      }
      if (step === 3 && pwScore < 2) {
        setError('Please create a stronger password.');
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

  const Rule = ({ valid, text }) => (
    <div style={{ fontSize: '11.5px', color: valid ? colors.success : colors.inkMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>
        {valid ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      {text}
    </div>
  );

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
          <span style={eyebrowStyle}>Step {step} of 3</span>
          <h1 style={titleStyle}>{step === 1 ? "Your name." : step === 2 ? "Your account." : step === 3 ? "Secure it." : "You're all set."}</h1>
          <p style={subStyle}>
            {step === 1 ? "Let's start simple — what should we call you?" : step === 2 ? "Choose your unique username and email address." : step === 3 ? "Create a strong password to protect your account." : "Your organizer workspace is ready."}
          </p>

          {step < 4 && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: step >= 1 ? colors.ink : colors.inkMuted }}>
                <div style={sbNumStyle(1)}>
                  {step > 1 ? <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check</span> : '1'}
                </div>
                <span>Name</span>
              </div>
              <div style={{ flex: 1, height: '2px', background: step > 1 ? colors.accent : colors.border, margin: '0 6px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: step >= 2 ? colors.ink : colors.inkMuted }}>
                <div style={sbNumStyle(2)}>
                  {step > 2 ? <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check</span> : '2'}
                </div>
                <span>Account</span>
              </div>
              <div style={{ flex: 1, height: '2px', background: step > 2 ? colors.accent : colors.border, margin: '0 6px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: step >= 3 ? colors.ink : colors.inkMuted }}>
                <div style={sbNumStyle(3)}>
                  {step > 3 ? <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check</span> : '3'}
                </div>
                <span>Password</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: colors.inkSoft, marginBottom: '6px' }}>First name</label>
                  <input type="text" style={inputStyle} placeholder="John" value={formData.fname} onChange={(e) => setFormData({ ...formData, fname: e.target.value })} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: colors.inkSoft, marginBottom: '6px' }}>Last name</label>
                  <input type="text" style={inputStyle} placeholder="Doe" value={formData.lname} onChange={(e) => setFormData({ ...formData, lname: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <Rule valid={formData.fname && formData.lname && /^[a-zA-Z\s]*$/.test(formData.fname)} text="Real names only (no numbers or symbols)" />
              </div>
              {error && <div style={{ fontSize: '11.5px', color: colors.error, marginBottom: '14px', fontWeight: 600 }}>{error}</div>}
              <button style={nextButtonStyle} onMouseEnter={() => setHovered({...hovered, next: true})} onMouseLeave={() => setHovered({...hovered, next: false})} onClick={() => rGo(2)}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: colors.inkSoft, marginBottom: '6px' }}>Username</label>
                <input type="text" style={inputStyle} placeholder="johndoe" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                <div style={{ marginTop: '10px' }}>
                  <Rule valid={formData.username.length >= 3} text="Minimum 3 characters" />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: colors.inkSoft, marginBottom: '6px' }}>Email address</label>
                <input type="email" style={inputStyle} placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              {error && <div style={{ fontSize: '11.5px', color: colors.error, marginBottom: '14px', fontWeight: 600 }}>{error}</div>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ ...ghostButtonStyle, flex: 0.5 }} onClick={() => rGo(1)}>← Back</button>
                <button style={{ ...nextButtonStyle, flex: 1 }} onMouseEnter={() => setHovered({...hovered, next: true})} onMouseLeave={() => setHovered({...hovered, next: false})} onClick={() => rGo(3)}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: colors.inkSoft, marginBottom: '6px' }}>Create password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} style={inputStyle} onChange={(e) => calcPw(e.target.value)} />
                  <button style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.inkMuted, display: 'flex', alignItems: 'center' }} onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4].map(n => <div key={n} style={pwBarStyle(n)} />)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Rule valid={formData.password.length >= 8} text="At least 8 characters long" />
                  <Rule valid={/[A-Z]/.test(formData.password)} text="Include at least one uppercase letter" />
                </div>
              </div>
              {error && <div style={{ fontSize: '11.5px', color: colors.error, marginBottom: '14px', fontWeight: 600 }}>{error}</div>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ ...ghostButtonStyle, flex: 0.5 }} onClick={() => rGo(2)}>← Back</button>
                <button style={{ ...accentButtonStyle, flex: 1 }} onMouseEnter={() => setHovered({...hovered, next: true})} onMouseLeave={() => setHovered({...hovered, next: false})} onClick={() => rGo(4)}>Create account →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: colors.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <span className="material-symbols-rounded" style={{ color: colors.success, fontSize: '28px' }}>check_circle</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: colors.ink, marginBottom: '8px' }}>Account created!</h2>
              <p style={subStyle}>Your organizer workspace is ready.</p>
              <Link to="/" style={{ ...accentButtonStyle, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={() => setHovered({...hovered, dash: true})} onMouseLeave={() => setHovered({...hovered, dash: false})}>Go to dashboard →</Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: colors.navy, display: window.innerWidth > 1024 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1), transparent), ${colors.navy}` }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px', width: '100%' }}>
          <h2 style={{ fontSize: '28px', color: colors.white, fontWeight: '800', marginBottom: '10px' }}>Set up your event in <em style={{ color: colors.accent, fontStyle: 'normal' }}>under 5 minutes.</em></h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Built for the speed of competition day.</p>
        </div>
      </div>
    </div>
  );
}
