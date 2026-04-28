import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { API_URL } from '../../config';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [activeHover, setActiveHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth > 1024;
  const isMobile = windowWidth <= 768;

  const handleSend = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send reset code');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      setError('Please enter both the code and your new password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Reset failed');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      maxWidth: '440px',
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
      lineHeight: '1.2',
      marginBottom: '12px',
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
      transition: 'all 0.25s',
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: hovered ? '0 12px 24px -8px rgba(15, 23, 42, 0.35)' : 'none',
      transform: hovered ? 'translateY(-2px)' : 'none',
    }),
    ghostBtn: (hovered) => ({
      height: '52px',
      padding: '0 24px',
      background: 'transparent',
      color: colors.navy,
      border: `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
      borderRadius: '14px',
      fontSize: '15.5px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }),
    footerLink: (hovered) => ({
      color: colors.accent,
      fontWeight: '700',
      textDecoration: 'none',
      paddingBottom: '2px',
      borderBottom: `2.5px solid ${hovered ? colors.accent : 'transparent'}`,
      transition: 'all 0.2s',
    }),
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
    successIcon: {
      width: '80px',
      height: '80px',
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      color: colors.success,
      borderRadius: '24px',
      display: 'grid',
      placeItems: 'center',
      marginBottom: '32px',
      boxShadow: '0 12px 24px rgba(16, 185, 129, 0.1)',
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
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}
      </style>

      {/* ── FORM SIDE ── */}
      <div style={styles.authPanel}>
        <div style={styles.header}>
          <Link 
            to="/login" 
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
          {step === 1 && (
            <div style={{ animation: 'fadeInUp 0.6s' }}>
              <span style={styles.eyebrow}>Security Recovery</span>
              <h1 style={styles.pageTitle}>Forgot your <br /> <span style={{ color: colors.accent }}>password?</span></h1>
              <p style={styles.pageSub}>Don't worry, even the best organizers need a reset sometimes. Enter your email to recover your workspace.</p>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  style={styles.input(activeHover === 'email', !!error)}
                  onFocus={() => setActiveHover('email')}
                  onBlur={() => setActiveHover(null)}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
                {error && <p style={{ color: colors.error, fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>{error}</p>}
              </div>

              <button
                style={styles.primaryBtn(activeHover === 'send')}
                onMouseEnter={() => setActiveHover('send')}
                onMouseLeave={() => setActiveHover(null)}
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  'Send Recovery Code'
                )}
              </button>

              <div style={{ textAlign: 'left', marginTop: '32px', fontSize: '14.5px', color: colors.inkMid }}>
                Remembered? <Link to="/login" style={styles.footerLink(activeHover === 'signin')} onMouseEnter={() => setActiveHover('signin')} onMouseLeave={() => setActiveHover(null)}>Go back to sign in</Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeInUp 0.6s' }}>
              <span style={styles.eyebrow}>Step 2: Verification</span>
              <h1 style={styles.pageTitle}>Check your <br /> <span style={{ color: colors.accent }}>inbox.</span></h1>
              <p style={{ ...styles.pageSub, marginBottom: '12px' }}>We've sent a 6-digit recovery code to <strong>{email}</strong>.</p>
              <p style={{ fontSize: '13.5px', color: colors.inkMid, marginBottom: '32px', textAlign: 'center' }}>
                Don't see it? Check your <strong>spam or junk</strong> folder.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`otp-reset-${index}`}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ''}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                      if (pasteData) {
                        setOtp(pasteData);
                        const nextIndex = Math.min(pasteData.length, 5);
                        document.getElementById(`otp-reset-${nextIndex}`).focus();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                      if (val) {
                        const newOtp = otp.split('');
                        newOtp[index] = val;
                        const finalOtp = newOtp.join('').slice(0, 6);
                        setOtp(finalOtp);
                        if (index < 5) document.getElementById(`otp-reset-${index + 1}`).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        if (!otp[index] && index > 0) {
                          const newOtp = otp.split('');
                          newOtp[index - 1] = '';
                          setOtp(newOtp.join(''));
                          document.getElementById(`otp-reset-${index - 1}`).focus();
                        } else {
                          const newOtp = otp.split('');
                          newOtp[index] = '';
                          setOtp(newOtp.join(''));
                        }
                      }
                    }}
                    style={{
                      width: '50px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: '800',
                      borderRadius: '12px',
                      border: `2px solid ${activeHover === `otp-reset-${index}` ? colors.accent : colors.borderSoft}`,
                      background: colors.pageBg,
                      outline: 'none',
                      transition: 'all 0.2s',
                      color: colors.navy
                    }}
                    onFocus={() => setActiveHover(`otp-reset-${index}`)}
                    onBlur={() => setActiveHover(null)}
                  />
                ))}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    style={styles.input(activeHover === 'pass', !!error)}
                    onFocus={() => setActiveHover('pass')}
                    onBlur={() => setActiveHover(null)}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button 
                    style={styles.passToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {error && <p style={{ color: colors.error, fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>{error}</p>}

              <button
                style={styles.primaryBtn(activeHover === 'reset')}
                onMouseEnter={() => setActiveHover('reset')}
                onMouseLeave={() => setActiveHover(null)}
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'left', animation: 'fadeInUp 0.6s' }}>
              <div style={styles.successIcon}>
                <span className="material-symbols-rounded" style={{ fontSize: '40px' }}>task_alt</span>
              </div>
              <h1 style={styles.pageTitle}>Password Reset <br /> <span style={{ color: colors.success }}>Successful.</span></h1>
              <p style={{ ...styles.pageSub, marginBottom: '32px' }}>Your account security has been updated. You can now sign in with your new credentials.</p>
              <Link to="/login" style={styles.primaryBtn(activeHover === 'back-btn')} onMouseEnter={() => setActiveHover('back-btn')} onMouseLeave={() => setActiveHover(null)}>
                Sign In Now
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
