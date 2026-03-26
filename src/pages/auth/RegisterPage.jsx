import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth.css';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fname: '', lname: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pwScore, setPwScore] = useState(0);

  const [error, setError] = useState('');

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
      if (step === 2 && formData.username.length < 3) {
        setError('Username must be at least 3 characters.');
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

  const getStepTitle = () => {
    if (step === 1) return "Your name.";
    if (step === 2) return "Your account.";
    if (step === 3) return "Secure it.";
    return "You're all set.";
  };

  const getStepSub = () => {
    if (step === 1) return "Let's start simple — what should we call you?";
    if (step === 2) return "Choose your unique username and email address.";
    if (step === 3) return "Create a strong password to protect your account.";
    return "Your organizer workspace is ready.";
  };

  const pwColors = ['', '#EF4444', '#3B82F6', '#2563EB', '#10B981'];
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const Rule = ({ valid, text }) => (
    <div className={`rule-item ${valid ? 'valid' : ''}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {valid ? <path d="M20 6L9 17l-5-5"/> : <circle cx="12" cy="12" r="10"/>}
      </svg>
      {text}
    </div>
  );

  const isNameValid = (n) => /^[a-zA-Z\s]*$/.test(n);

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-header">
          <Link to="/login" className="auth-panel-back" title="Back to sign in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <Link to="/" className="auth-logo">
            <div className="logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12.5" cy="5" r="2" fill="var(--accent)"/>
              </svg>
            </div>
            <span className="logo-text">Standings<span>HQ</span></span>
          </Link>
        </div>

        <div className="auth-form-wrap">
          <span className="auth-eyebrow">Step {step} of 3</span>
          <h1 className="auth-title">{getStepTitle()}</h1>
          <p className="auth-sub">{getStepSub()}</p>

          {step < 4 && (
            <div className="step-bar">
              <div className={`sb-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
                <div className="sb-num">{step > 1 ? '✓' : '1'}</div>
                <span className="sb-label">Name</span>
              </div>
              <div className={`sb-line ${step > 1 ? 'done' : ''}`}></div>
              <div className={`sb-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
                <div className="sb-num">{step > 2 ? '✓' : '2'}</div>
                <span className="sb-label">Account</span>
              </div>
              <div className={`sb-line ${step > 2 ? 'done' : ''}`}></div>
              <div className={`sb-step ${step === 3 ? 'active' : step > 3 ? 'done' : ''}`}>
                <div className="sb-num">{step > 3 ? '✓' : '3'}</div>
                <span className="sb-label">Password</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="step-panel active">
              <div className="form-row">
                <div className="form-group">
                  <label>First name</label>
                  <input type="text" className={error && (!formData.fname || !isNameValid(formData.fname)) ? 'input-error' : ''} placeholder="Maria" value={formData.fname} onChange={(e) => {setFormData({...formData, fname: e.target.value}); setError('')}} />
                </div>
                <div className="form-group">
                  <label>Last name</label>
                  <input type="text" className={error && (!formData.lname || !isNameValid(formData.lname)) ? 'input-error' : ''} placeholder="Santos" value={formData.lname} onChange={(e) => {setFormData({...formData, lname: e.target.value}); setError('')}} />
                </div>
              </div>
              <div className="rules-list" style={{ marginBottom: '14px' }}>
                <Rule valid={formData.fname && formData.lname && isNameValid(formData.fname) && isNameValid(formData.lname)} text="Real names only (no numbers or symbols)" />
              </div>
              {error && <div className="error-msg" style={{ marginBottom: '14px' }}>{error}</div>}
              <button 
                className="btn btn-navy btn-full btn-lg" 
                onClick={() => rGo(2)}
              >
                Continue →
              </button>
              <div className="form-footer">
                Already registered? <Link to="/login" className="form-link">Sign in</Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-panel active">
              <div className="form-group">
                <label>Username</label>
                <input type="text" className={error && (!formData.username || formData.username.length < 3) ? 'input-error' : ''} placeholder="mariasantos" value={formData.username} onChange={(e) => {setFormData({...formData, username: e.target.value}); setError('')}} />
                <div className="rules-list">
                  <Rule valid={formData.username.length >= 3} text="Minimum 3 characters" />
                  <Rule valid={/^[a-zA-Z0-9_]+$/.test(formData.username) && formData.username.length > 0} text="Letters, numbers, and underscores only" />
                </div>
              </div>
              <div className="form-group">
                <label>Email address</label>
                <input type="email" className={error && !formData.email ? 'input-error' : ''} placeholder="maria@school.edu.ph" value={formData.email} onChange={(e) => {setFormData({...formData, email: e.target.value}); setError('')}} />
              </div>
              {error && <div className="error-msg" style={{ marginBottom: '14px' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button className="btn btn-ghost btn-lg" style={{ flex: 0.5 }} onClick={() => rGo(1)}>← Back</button>
                <button 
                  className="btn btn-navy btn-full btn-lg" 
                  style={{ flex: 1 }} 
                  onClick={() => rGo(3)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-panel active">
              <div className="form-group">
                <label>Create password</label>
                <div className="input-wrap">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Min. 8 characters" 
                    className={error && pwScore < 2 ? 'input-error' : ''}
                    onChange={(e) => {calcPw(e.target.value); setError('')}} 
                  />
                  <button 
                    className="input-icon" 
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  </button>
                </div>
                <div className="pw-strength" style={{ display: 'flex', gap: '4px', marginTop: '7px', marginBottom: '12px', alignItems: 'center' }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="pw-bar" style={{ flex: 1, height: '3px', borderRadius: '100px', background: n <= pwScore ? pwColors[pwScore] : 'var(--border)' }}></div>
                  ))}
                  <span className="pw-label" style={{ fontSize: '11px', color: pwColors[pwScore] || 'var(--ink-muted)', width: '54px', textAlign: 'right', fontWeight: 600 }}>{formData.password ? pwLabels[pwScore] : ''}</span>
                </div>
                <div className="rules-list">
                  <Rule valid={formData.password.length >= 8} text="At least 8 characters long" />
                  <Rule valid={/[A-Z]/.test(formData.password)} text="Include at least one uppercase letter" />
                  <Rule valid={/[0-9]/.test(formData.password)} text="Include at least one number" />
                  <Rule valid={/[^A-Za-z0-9]/.test(formData.password)} text="Include one special character" />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm password</label>
                <input type="password" placeholder="Repeat your password" />
              </div>

              {error && <div className="error-msg" style={{ marginBottom: '14px' }}>{error}</div>}

              <div className="terms-wrap" style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', marginBottom: '18px' }}>
                <input type="checkbox" id="r-terms" style={{ width: '16px', height: '16px', accentColor: 'var(--navy)', marginTop: '2px', cursor: 'pointer' }} />
                <label htmlFor="r-terms" style={{ fontSize: '12.5px', color: 'var(--ink-muted)', cursor: 'pointer', lineHeight: 1.5 }}>
                  I agree to the <Link to="/terms" className="form-link">Terms of Service</Link> and <Link to="/privacy" className="form-link">Privacy Policy</Link>.
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-ghost btn-lg" style={{ flex: 0.5 }} onClick={() => rGo(2)}>← Back</button>
                <button 
                  className="btn btn-accent btn-full btn-lg" 
                  style={{ flex: 1 }} 
                  onClick={() => rGo(4)}
                >
                  Create account →
                </button>
              </div>

            </div>
          )}

          {step === 4 && (
            <div className="step-panel active">
              <div className="success-wrap">
                <div className="s-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M5 14L11 20L23 8" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="s-title">Account created!</div>
                <p className="s-sub">Welcome to StandingsHQ, <strong>{formData.fname || 'there'}</strong>. Your organizer dashboard is ready — start creating your first competition event.</p>
                <Link to="/" className="btn btn-accent btn-full btn-lg">Go to dashboard →</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="auth-visual">
        <div className="av-bg"></div>
        <div className="av-grid"></div>
        <div className="av-content">
          <div className="av-eyebrow">Join competition organizers</div>
          <h2 className="av-title">Set up your first event in <em>under 5 minutes.</em></h2>
          <p className="av-sub">Build rubrics, invite judges, go live. No training needed — StandingsHQ is built for the speed of competition day.</p>
          
          <div className="av-card" style={{ marginBottom: '20px' }}>
            <div className="av-card-head">
              <span className="av-card-title">Event Setup Progress</span>
            </div>
            <div className="av-rows">
              <div className="av-row" style={{ background: 'rgba(34, 197, 94, 0.07)', border: '1px solid rgba(34, 197, 94, 0.14)' }}>
                <span style={{ fontSize: '13px' }}>✅</span>
                <div><div className="av-rname">Event created</div></div>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)' }}>Done</span>
              </div>
              <div className="av-row" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-bg-mid)' }}>
                <span style={{ fontSize: '13px' }}>⚡</span>
                <div><div className="av-rname">Rubric built</div></div>
                <span style={{ fontSize: '11px', color: 'var(--accent)' }}>Active</span>
              </div>
              <div className="av-row">
                <span style={{ fontSize: '13px', opacity: 0.3 }}>📋</span>
                <div><div className="av-rname" style={{ opacity: 0.4 }}>Invite judges</div></div>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.2)' }}>Next</span>
              </div>
            </div>
          </div>

          <div className="av-pills">
            <div className="av-pill">
              <div className="ap-icon api-accent">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10.5L6 8.3L2.5 10.5L3.5 6.5L1 4.5H4.5L6 1Z" fill="var(--accent)"/>
                </svg>
              </div>
              <span>Free for schools</span>
            </div>
            <div className="av-pill">
              <div className="ap-icon api-white">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>No training needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
