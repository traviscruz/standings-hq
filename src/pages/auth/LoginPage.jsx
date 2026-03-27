import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-header">
          <Link to="/" className="auth-panel-back" title="Back to home">
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
          <span className="auth-eyebrow">Welcome back</span>
          
          <h1 className="auth-title">Sign in to your <em>workspace.</em></h1>
          <p className="auth-sub">Enter your credentials to continue. Your events, scores, and certificates are waiting.</p>

          <div className="form-group">
            <label>Email address</label>
            <input 
              type="email" 
              placeholder="you@school.edu.ph" 
              className={error ? 'input-error' : ''}
              value={email}
              onChange={(e) => {setEmail(e.target.value); setError('');}}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Your password" 
                className={error ? 'input-error' : ''}
                value={password}
                onChange={(e) => {setPassword(e.target.value); setError('');}}
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
            {error && <div className="error-msg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>}
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" title="Forgot password?" className="forgot-link">Forgot password?</Link>
          </div>

          <button 
            className="btn btn-navy btn-full btn-lg" 
            onClick={handleLogin}
          >
            Sign in
          </button>



          <div className="mock-login-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px' }}>
            <Link to="/organizer/dashboard" className="btn btn-ghost btn-full btn-sm" style={{ textAlign: 'center' }}>Demo: Organizer</Link>
            <Link to="/judge/dashboard" className="btn btn-ghost btn-full btn-sm" style={{ textAlign: 'center' }}>Demo: Judge</Link>
            <Link to="/participant/dashboard" className="btn btn-ghost btn-full btn-sm" style={{ textAlign: 'center' }}>Demo: Participant</Link>
            <div style={{ padding: '4px', borderTop: '1px solid rgba(0,0,0,0.05)', gridColumn: '1 / -1', margin: '4px 0' }} />
            <Link to="/archive" className="btn btn-ghost btn-full btn-sm" style={{ textAlign: 'center', color: '#6366f1' }}>Demo: Public Archive</Link>
            <Link to="/leaderboard" className="btn btn-ghost btn-full btn-sm" style={{ textAlign: 'center', color: '#10b981' }}>Demo: Public Leaderboard</Link>
            <Link to="/404-test-page" className="btn btn-ghost btn-full btn-sm" style={{ textAlign: 'center' }}>Test: 404 Page</Link>
          </div>

          <div className="form-footer">
            No account yet? <Link to="/register" className="form-link">Register here</Link>
          </div>
        </div>
      </div>

      <div className="auth-visual">
        <div className="av-bg"></div>
        <div className="av-grid"></div>
        <div className="av-content">
          <div className="av-eyebrow">Live competition platform</div>
          <h2 className="av-title">Your <em>competition hub</em> is live and ready.</h2>
          <p className="av-sub">Manage events, judge scores, and publish results — one professional platform built for the pace of competition day.</p>
          
          <div className="av-card">
            <div className="av-card-head">
              <span className="av-card-title">Live Standings</span>
              <span className="av-card-live">Updating</span>
            </div>
            <div className="av-rows">
              <div className="av-row">
                <span className="av-rk g">🥇</span>
                <div><div className="av-rname">Team Alpha</div></div>
                <span className="av-rscore g">94.6</span>
              </div>
              <div className="av-row">
                <span className="av-rk d">#2</span>
                <div><div className="av-rname">Team Bravo</div></div>
                <span className="av-rscore">89.2</span>
              </div>
              <div className="av-row">
                <span className="av-rk d">#3</span>
                <div><div className="av-rname">Team Delta</div></div>
                <span className="av-rscore">86.5</span>
              </div>
            </div>
          </div>

          <div className="av-pills">
            <div className="av-pill">
              <div className="ap-icon api-accent">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 9L5 4L8 6.5L10 2" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <span>Real-time scoring</span>
            </div>
            <div className="av-pill">
              <div className="ap-icon api-white">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>1-click certificates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
