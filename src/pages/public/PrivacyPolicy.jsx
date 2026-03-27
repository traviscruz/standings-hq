import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function PrivacyPolicy() {
  const [isBackHovered, setIsBackHovered] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const styles = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      background: colors.offWhite,
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    header: {
      padding: '24px 40px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      background: colors.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    headerInner: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      maxWidth: '800px',
      position: 'relative',
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: `1px solid ${isBackHovered ? colors.navy : colors.border}`,
      color: isBackHovered ? colors.navy : colors.inkMuted,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      background: isBackHovered ? colors.borderSoft : colors.white,
      position: 'absolute',
      left: 0,
      transform: isBackHovered ? 'translateX(-3px)' : 'none',
      textDecoration: 'none',
    },
    logo: {
      margin: '0 auto',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoMark: {
      width: '32px',
      height: '32px',
      background: colors.navy,
      borderRadius: '7px',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 800,
      color: colors.ink,
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '-0.03em',
    },
    main: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '80px 40px 120px',
      width: '100%',
    },
    contentTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '42px',
      fontWeight: 800,
      color: colors.navy,
      letterSpacing: '-0.03em',
      marginBottom: '12px',
    },
    contentDate: {
      fontSize: '14px',
      color: colors.inkMuted,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    body: {
      color: colors.inkSoft,
      fontSize: '16px',
      lineHeight: 1.8,
    },
    heading: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '24px',
      fontWeight: 700,
      color: colors.navy,
      marginTop: '48px',
      marginBottom: '20px',
    },
    footer: {
      background: colors.ink,
      padding: '40px',
      marginTop: 'auto',
      display: 'flex',
      flexDirection: window.innerWidth > 768 ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
    },
    footerText: {
      fontSize: '12.5px',
      color: 'rgba(255, 255, 255, 0.3)',
    },
    footerLinks: {
      display: 'flex',
      gap: '22px',
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    footerLink: {
      fontSize: '12.5px',
      color: 'rgba(255, 255, 255, 0.3)',
      textDecoration: 'none',
      transition: 'color 0.2s',
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link 
            to="/" 
            style={styles.backBtn}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>

          <Link to="/" style={styles.logo}>
            <div style={styles.logoMark}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
              </svg>
            </div>
            <span style={styles.logoText}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
          </Link>
        </div>
      </header>

      <main style={styles.main}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 style={styles.contentTitle}>Privacy Policy</h1>
          <div style={styles.contentDate}>
            Last updated: March 27, 2026
          </div>
        </div>

        <div style={styles.body}>
          <p style={{ marginBottom: '24px' }}>At StandingsHQ, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform for managing competitions.</p>
          
          <h2 style={styles.heading}>1. Information We Collect</h2>
          <p style={{ marginBottom: '16px' }}>We only collect the information necessary to provide our services and ensure a smooth experience for organizers, judges, and participants. This includes:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li style={{ marginBottom: '12px' }}><strong>Account Information:</strong> Name, email address, and role (Organizer, Judge, Participant).</li>
            <li style={{ marginBottom: '12px' }}><strong>Event Data:</strong> Competition names, rubrics, and scores submitted by judges.</li>
            <li style={{ marginBottom: '12px' }}><strong>Participant Data:</strong> Names and performance metrics for generating certificates and leaderboards.</li>
          </ul>
          
          <h2 style={styles.heading}>2. How We Use Your Information</h2>
          <p style={{ marginBottom: '16px' }}>Your data is strictly used for platform functionality:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li style={{ marginBottom: '12px' }}>To authenticate users and provide role-based access.</li>
            <li style={{ marginBottom: '12px' }}>To process scores and maintain live leaderboards during events.</li>
            <li style={{ marginBottom: '12px' }}>To generate downloadable certificates.</li>
            <li style={{ marginBottom: '12px' }}>To notify users of account activities (e.g., password resets).</li>
          </ul>
          
          <h2 style={styles.heading}>3. Data Protection</h2>
          <p style={{ marginBottom: '24px' }}>Your data is securely stored using industry-standard encryption. We do not sell your personal information to third parties. Public event pages only display information explicitly approved by organizers.</p>
          
          <h2 style={styles.heading}>4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact our data protection team at <strong>support@standingshq.edu.ph</strong>.</p>
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 StandingsHQ. Built for Philippine schools and universities.</p>
        <ul style={styles.footerLinks}>
          <li><Link to="/privacy" style={styles.footerLink}>Privacy</Link></li>
          <li><Link to="/terms" style={styles.footerLink}>Terms</Link></li>
          <li><Link to="/archive" style={styles.footerLink}>Archive</Link></li>
          <li><Link to="/leaderboard" style={styles.footerLink}>Leaderboard</Link></li>
        </ul>
      </footer>
    </div>
  );
}

