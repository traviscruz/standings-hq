import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function ArchivePage() {
  const styles = {
    page: {
      minHeight: '100vh',
      background: colors.pageBg,
      paddingBottom: '100px',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    header: {
      background: colors.white,
      borderBottom: `1px solid ${colors.borderSoft}`,
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
    },
    logoMark: {
      background: colors.navy,
      width: '30px',
      height: '30px',
      borderRadius: '8px',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    },
    logoText: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '18px',
      fontWeight: 800,
      color: colors.navy,
      letterSpacing: '-0.03em',
    },
    archiveLabel: {
      color: colors.inkMuted,
      fontWeight: 600,
      fontSize: '14px',
      marginLeft: '4px',
    },
    navLinks: {
      display: 'flex',
      gap: '24px',
      alignItems: 'center',
    },
    link: {
      fontSize: '14px',
      fontWeight: 600,
      color: colors.inkMuted,
      textDecoration: 'none',
      transition: 'color 0.2s ease',
    },
    loginBtn: {
      padding: '8px 20px',
      background: colors.navy,
      borderRadius: '8px',
      color: colors.white,
      fontSize: '13px',
      fontWeight: 700,
      textDecoration: 'none',
      transition: 'all 0.2s ease',
    },
    main: {
      maxWidth: '900px',
      margin: '60px auto',
      padding: '0 24px',
    },
    breadcrumb: {
      display: 'flex',
      gap: '8px',
      fontSize: '12px',
      fontWeight: 700,
      color: colors.inkMuted,
      textTransform: 'uppercase',
      marginBottom: '24px',
      letterSpacing: '0.05em',
    },
    eyebrow: {
      display: 'inline-flex',
      padding: '4px 12px',
      background: colors.borderSoft,
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 800,
      color: colors.inkSoft,
      textTransform: 'uppercase',
      marginBottom: '16px',
    },
    title: {
      fontSize: 'clamp(32px, 5vw, 48px)',
      fontWeight: 800,
      color: colors.navy,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      marginBottom: '20px',
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      color: colors.inkMuted,
      fontSize: '14px',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    galleryWrapper: {
      width: '100%',
      aspectRatio: '16/9',
      background: `linear-gradient(135deg, ${colors.borderSoft} 0%, ${colors.border} 100%)`,
      borderRadius: '24px',
      marginBottom: '48px',
      display: 'grid',
      placeItems: 'center',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    },
    galleryLabel: {
      textAlign: 'center',
      color: colors.inkMuted,
    },
    articleBody: {
      fontSize: '18px',
      color: colors.inkSoft,
      lineHeight: 1.8,
      marginBottom: '60px',
    },
    blockquote: {
      margin: '40px 0',
      paddingLeft: '32px',
      borderLeft: `4px solid ${colors.accent}`,
      fontStyle: 'italic',
      fontSize: '22px',
      fontWeight: 500,
      color: colors.navy,
      lineHeight: 1.5,
    },
    quoteFooter: {
      fontSize: '14px',
      color: colors.inkMuted,
      marginTop: '12px',
      fontStyle: 'normal',
      fontWeight: 700,
    },
    resultsCard: {
      background: colors.navy,
      borderRadius: '32px',
      padding: '48px',
      color: colors.white,
      boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)',
    },
    resultsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '40px',
      flexWrap: 'wrap',
      gap: '20px',
    },
    resultsTitle: {
      fontSize: '32px',
      fontWeight: 800,
      color: colors.white,
    },
    resultsEyebrow: {
      fontSize: '12px',
      fontWeight: 800,
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '8px',
    },
    scoreLabel: {
      fontSize: '11px',
      color: 'rgba(255,255,255,0.4)',
      fontWeight: 600,
      textAlign: 'right',
    },
    scoreValue: {
      fontSize: '36px',
      fontWeight: 900,
      color: colors.success,
    },
    medalsGrid: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
      gap: '24px',
    },
    medalCard: {
      background: 'rgba(255,255,255,0.05)',
      padding: '24px',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center',
    },
    resultsFooter: {
      marginTop: '48px',
      paddingTop: '32px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px',
    },
    footer: {
      background: colors.white,
      borderTop: `1px solid ${colors.borderSoft}`,
      padding: '60px 0',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoMark}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
            </svg>
          </div>
          <span style={styles.logoText}>
            Standings<span style={{ color: colors.accent }}>HQ</span> 
            <span style={styles.archiveLabel}>Archive</span>
          </span>
        </Link>
        <div style={styles.navLinks}>
          <Link to="/leaderboard" style={styles.link}>Live Standings</Link>
          <Link to="/login" style={styles.loginBtn}>Portal Login</Link>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.breadcrumb}>
          <span>Home</span> <span>/</span> <span>Archives</span> <span>/</span> <span style={{ color: colors.accent }}>Event Recap</span>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <div style={styles.eyebrow}>
            Featured Completion · Science & Technology
          </div>
          <h1 style={styles.title}>
            InnovateMNL: The 2025 National Robotics & AI Symposium Final Results
          </h1>
          <div style={styles.meta}>
            <div style={styles.metaItem}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>calendar_today</span>
              Published Dec 12, 2025
            </div>
            <div style={styles.metaItem}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>location_on</span>
              Manila International Expo
            </div>
          </div>
        </div>

        <div style={styles.galleryWrapper}>
          <div style={styles.galleryLabel}>
            <span className="material-symbols-rounded" style={{ fontSize: '120px', marginBottom: '12px' }}>photo_library</span>
            <div style={{ fontWeight: 600 }}>Event Gallery · 42 Official Photos</div>
          </div>
        </div>

        <div style={styles.articleBody}>
          <p style={{ marginBottom: '24px', fontWeight: 500 }}>
            After three days of intense competition, technical assessments, and live demonstrations, the InnovateMNL 2025 National Robotics Symposium has officially concluded. This year’s event saw a record-breaking 1,200 participants from 85 schools across the archipelago, showcasing the next generation of industrial automation and artificial intelligence.
          </p>

          <p style={{ marginBottom: '24px' }}>
            The final round, held at the Grand Hall, featured the top 12 teams in a head-to-head challenge involving "Autonomous Disaster Response." Judges noted that the level of precision and algorithm efficiency reached new heights this year. <strong>Team BitBuster</strong>, representing Quezon City Technical Institute, delivered a flawless performance in the final segment, securing their spot as the 2025 Grand Champion.
          </p>

          <blockquote style={styles.blockquote}>
            "The synergy between hardware robustness and software intelligence displayed this year was simply world-class. These students aren't just building robots; they are engineering solutions for the future of our nation."
            <footer style={styles.quoteFooter}>
              — Dr. Elena Reyes, Head of the Judging Panel
            </footer>
          </blockquote>

          <p style={{ marginBottom: '24px' }}>
            Beyond the robotics competition, the symposium hosted series of seminars and workshop tracks. StandingsHQ was proud to provide the official real-time scoring and certified result publication for the entire duration of the event, ensuring that every point was tracked with 100% transparency and precision.
          </p>
        </div>

        <div style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <div>
              <div style={styles.resultsEyebrow}>Official Standings</div>
              <h3 style={styles.resultsTitle}>InnovateMNL 2025 Champion</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={styles.scoreLabel}>FINAL SCORE</div>
              <div style={styles.scoreValue}>98.24</div>
            </div>
          </div>

          <div style={styles.medalsGrid}>
            <div style={styles.medalCard}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥇</div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>Team BitBuster</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>QC Technical Institute</div>
              <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '16px', color: colors.success }}>1ST PLACE</div>
            </div>
            <div style={styles.medalCard}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥈</div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>CodeCrafters</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>Science Unified Academy</div>
              <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '16px', color: colors.inkMuted }}>2ND PLACE</div>
            </div>
            <div style={styles.medalCard}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥉</div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>RoboKinetics</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>Regional Science High</div>
              <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '16px', color: colors.inkMuted }}>3RD PLACE</div>
            </div>
          </div>

          <div style={styles.resultsFooter}>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Certified Results by StandingsHQ Verification Engine</div>
            <Link to="/leaderboard" style={{ 
              padding: '12px 24px', 
              background: colors.accent, 
              borderRadius: '12px', 
              color: colors.white, 
              fontSize: '13px', 
              fontWeight: 700, 
              textDecoration: 'none' 
            }}>
              View Full Score Breakdown
            </Link>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={{ fontSize: '14px', color: colors.inkMuted }}>&copy; 2026 StandingsHQ Archive · Built for Transparency in Every Score.</p>
      </footer>
    </div>
  );
}

