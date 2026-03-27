import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function NotFoundPage() {
  const styles = {
    page: {
      minHeight: '100vh',
      background: colors.navy,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.white,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    glow: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      justifyContent: 'center',
      marginBottom: '40px',
    },
    logoMark: {
      background: colors.accent,
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    },
    logoText: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '20px',
      fontWeight: 800,
      color: colors.white,
      letterSpacing: '-0.03em',
    },
    errorCode: {
      fontSize: window.innerWidth > 768 ? '180px' : '120px',
      fontWeight: 900,
      color: 'rgba(255,255,255,0.05)',
      lineHeight: 1,
      letterSpacing: '-0.05em',
      marginBottom: '-40px',
    },
    statusBadge: {
      display: 'inline-flex',
      padding: '6px 16px',
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: '100px',
      fontSize: '12px',
      fontWeight: 800,
      color: '#f87171',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '24px',
    },
    title: {
      fontSize: window.innerWidth > 768 ? '48px' : '36px',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      marginBottom: '16px',
      color: colors.white,
    },
    desc: {
      fontSize: '18px',
      color: colors.inkMuted,
      maxWidth: '500px',
      lineHeight: 1.6,
      marginBottom: '40px',
      padding: '0 20px',
    },
    btnContainer: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    primaryBtn: {
      padding: '14px 32px',
      background: colors.accent,
      borderRadius: '12px',
      color: colors.white,
      fontSize: '15px',
      fontWeight: 700,
      textDecoration: 'none',
      transition: 'all 0.2s',
    },
    secondaryBtn: {
      padding: '14px 32px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      color: colors.white,
      fontSize: '15px',
      fontWeight: 700,
      textDecoration: 'none',
    },
    footerRef: {
      position: 'absolute',
      bottom: '40px',
      fontSize: '14px',
      color: colors.inkMuted,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Link to="/" style={styles.logoWrapper}>
          <div style={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12.5" cy="5" r="2" fill="#fff" />
            </svg>
          </div>
          <span style={styles.logoText}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
        </Link>
        <div style={styles.errorCode}>404</div>
        <div style={styles.statusBadge}>
          Page Not Found
        </div>
        <h1 style={styles.title}>Out of Bounds</h1>
        <p style={styles.desc}>
          It seems you've wandered into an unjudged territory. The page you're looking for doesn't exist or has been archived.
        </p>

        <div style={styles.btnContainer}>
          <Link to="/" style={styles.primaryBtn}>
            Go Back Home
          </Link>
          <Link to="/login" style={styles.secondaryBtn}>
            Member Login
          </Link>
        </div>
      </div>

      <div style={styles.footerRef}>
        StandingsHQ · Error Reference ID: SHQ-404-LIVE
      </div>
    </div>
  );
}

