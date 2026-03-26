import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

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
          <div className={`step-panel ${step === 1 ? 'active' : ''}`}>
            <span className="auth-eyebrow">Account recovery</span>
            <h1 className="auth-title">Reset your <em>password.</em></h1>
            <p className="auth-sub">Enter your registered email and we'll send a secure, single-use reset link. It expires in 15 minutes.</p>
            
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label>Email address</label>
              <input 
                type="email" 
                placeholder="you@school.edu.ph" 
                className={error ? 'input-error' : ''}
                value={email}
                onChange={(e) => {setEmail(e.target.value); setError('');}}
              />
              {error && <div className="error-msg">{error}</div>}
            </div>
            
            <button 
              className="btn btn-navy btn-full btn-lg" 
              onClick={handleSend}
            >
              Send reset link
            </button>

            
            <div className="form-footer">
              Remembered it? <Link to="/login" className="form-link">Back to sign in</Link>
            </div>
          </div>

          <div className={`step-panel ${step === 2 ? 'active' : ''}`}>
            <div className="success-wrap">
              <div className="s-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="9" width="20" height="14" rx="2.5" stroke="#22C55E" strokeWidth="2"/>
                  <path d="M4 13L14 19L24 13" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="s-title">Check your inbox.</div>
              <p className="s-sub">A password reset link has been sent to <strong>{email || 'your email'}</strong>. It's single-use and expires in 15 minutes.</p>
              <Link to="/login" className="btn btn-ghost btn-full btn-lg" style={{ border: '1.5px solid var(--border)' }}>← Return to sign in</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-visual">
        <div className="av-bg"></div>
        <div className="av-grid"></div>
        <div className="av-content">
          <div className="av-eyebrow">Account security</div>
          <h2 className="av-title">Your account and <em>event data</em> stay protected.</h2>
          <p className="av-sub">Reset links are single-use and expire quickly. Your competitions, rubrics, and scores are always safe on StandingsHQ.</p>
          
          <div className="av-pills" style={{ flexDirection: 'column', gap: '10px' }}>
            <div className="av-pill">
              <div className="ap-icon api-accent">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2.5" y="6" width="7" height="5" rx="1" stroke="var(--accent)" strokeWidth="1.2"/>
                  <path d="M4 6V4.5C4 3.4 4.9 2.5 6 2.5C7.1 2.5 8 3.4 8 4.5V6" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span>Link expires in 15 minutes</span>
            </div>
            <div className="av-pill">
              <div className="ap-icon api-white">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Single-use secure token</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
