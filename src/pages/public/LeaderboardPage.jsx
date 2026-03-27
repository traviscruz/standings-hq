import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

const SAMPLE_EVENT = {
  name: 'Metro Manila Debate Open',
  type: 'Academic Competition',
  startDate: '2026-10-15',
  participants: [
    { id: 1, name: 'Antonio Luna', team: 'Sharpshooters', score: 94.2, rank: 1, trend: 'up', barangay: 'Brgy 001' },
    { id: 2, name: 'Maria Santos', team: 'La Solidaridad', score: 91.0, rank: 2, trend: 'up', barangay: 'Brgy 002' },
    { id: 3, name: 'Jose Rizal', team: 'The Enlightened', score: 88.5, rank: 3, trend: 'down', barangay: 'Brgy 003' },
    { id: 4, name: 'Gabriela Silang', team: 'Team Alpha', score: 87.5, rank: 4, trend: 'stable', barangay: 'Brgy 004' },
    { id: 5, name: 'Andres Bonifacio', team: 'Magdiwang', score: 82.0, rank: 5, trend: 'up', barangay: 'Brgy 005' },
    { id: 6, name: 'Emilio Aguinaldo', team: 'Magdalo', score: 79.5, rank: 6, trend: 'down', barangay: 'Brgy 006' },
    { id: 7, name: 'Marcelo Del Pilar', team: 'The Propagandist', score: 76.2, rank: 7, trend: 'stable', barangay: 'Brgy 007' }
  ],
  judges: ['Dingdong Dantes', 'Marian Rivera', 'Sarah Geronimo'],
  location: 'UP Diliman, Quezon City'
};

export default function LeaderboardPage() {
  const [syncTime, setSyncTime] = useState(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setSyncTime(new Date().toLocaleTimeString());
        setIsSyncing(false);
      }, 1000);
    }, 15000); // Sync every 15s
    return () => clearInterval(timer);
  }, []);

  const styles = {
    page: {
      minHeight: '100vh',
      background: colors.pageBg,
      paddingBottom: '80px',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    header: {
      background: colors.navy,
      padding: isMobile ? '16px 20px' : '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
    },
    logoMark: {
      background: colors.accent,
      width: '38px',
      height: '38px',
      borderRadius: '10px',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    },
    logoText: {
      fontSize: '22px',
      fontWeight: 800,
      color: colors.white,
      fontFamily: "'DM Sans', sans-serif",
      display: 'block',
      letterSpacing: '-0.03em',
    },
    liveBadge: {
      fontSize: '11px',
      color: colors.inkMuted,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginTop: '-2px',
    },
    syncWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    lastSyncLabel: {
      fontSize: '12px',
      fontWeight: 600,
      color: colors.inkMuted,
      textAlign: 'right',
    },
    syncTime: {
      fontSize: '14px',
      fontWeight: 700,
      color: colors.white,
    },
    loginBtn: {
      padding: '10px 24px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.1)',
      color: colors.white,
      fontSize: '14px',
      fontWeight: 600,
      textDecoration: 'none',
      display: isMobile ? 'none' : 'block',
    },
    hero: {
      background: colors.navySoft,
      padding: isMobile ? '40px 20px 80px' : '60px 40px 100px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    statusBadge: {
      display: 'inline-flex',
      padding: '6px 16px',
      background: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: 800,
      color: '#4ADE80',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '16px',
      alignItems: 'center',
      gap: '8px',
    },
    pulseDot: {
      width: '8px',
      height: '8px',
      background: colors.success,
      borderRadius: '50%',
      display: 'block',
      animation: 'pulse 1.5s infinite',
    },
    main: {
      maxWidth: '1100px',
      margin: '-60px auto 0',
      padding: '0 20px',
      position: 'relative',
      zIndex: 2,
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth > 1024 ? 'minmax(0, 1fr) 300px' : '1fr',
      gap: '32px',
    },
    leaderboardCard: {
      background: colors.white,
      borderRadius: '24px',
      border: `1px solid ${colors.border}`,
      padding: isMobile ? '20px' : '32px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
      overflowX: 'auto',
    },
    cardTitle: {
      fontSize: '24px',
      fontWeight: 800,
      color: colors.navy,
    },
    categoryTag: {
      padding: '6px 12px',
      background: colors.borderSoft,
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 700,
      color: colors.inkSoft,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '500px',
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      fontSize: '12px',
      fontWeight: 700,
      color: colors.inkMuted,
      textTransform: 'uppercase',
      borderBottom: `1px solid ${colors.border}`,
    },
    rankBadge: (rank) => ({
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      display: 'grid',
      placeItems: 'center',
      fontSize: '14px',
      fontWeight: 800,
      background: rank === 1 ? '#FEF3C7' : rank === 2 ? colors.borderSoft : rank === 3 ? '#FFEDD5' : 'transparent',
      color: rank === 1 ? '#92400E' : rank === 2 ? colors.inkSoft : rank === 3 ? '#9A3412' : colors.inkMuted,
      border: rank > 3 ? `1px solid ${colors.border}` : 'none',
    }),
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    insightCard: {
      background: colors.navy,
      borderRadius: '24px',
      padding: '24px',
      color: colors.white,
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoMark}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12.5" cy="5" r="2.2" fill="#fff" />
            </svg>
          </div>
          <div>
            <span style={styles.logoText}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
            <div style={styles.liveBadge}>Live Leaderboard</div>
          </div>
        </Link>
        <div style={styles.syncWrapper}>
          <div style={styles.lastSyncLabel}>
            <div>LAST SYNC</div>
            <div style={styles.syncTime}>{syncTime} {isSyncing && <span style={{ color: colors.accent, fontSize: '10px', marginLeft: '4px' }}>Updating...</span>}</div>
          </div>
          <Link to="/login" style={styles.loginBtn}>Portal Login</Link>
        </div>
      </header>

      <section style={styles.hero}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={styles.statusBadge}>
            <span style={styles.pulseDot} />
            Live Scoring in Progress
          </div>
          <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 800, color: colors.white, letterSpacing: '-0.03em', marginBottom: '12px' }}>{SAMPLE_EVENT.name}</h1>
          <p style={{ fontSize: '18px', color: colors.inkMuted, maxWidth: '600px', margin: '0 auto' }}>Tracking technical excellence across multiple rounds of argumentation and logic.</p>
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </section>

      <main style={styles.main}>
        <div style={styles.contentGrid}>
          <div style={styles.leaderboardCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={styles.cardTitle}>Performance Statistics</h2>
              <div style={styles.categoryTag}>Category: {SAMPLE_EVENT.type}</div>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Participant</th>
                  <th style={styles.th}>Team</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Avg Score</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_EVENT.participants.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={styles.rankBadge(p.rank)}>
                        {p.rank}
                      </div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: colors.navy }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: colors.inkMuted }}>{p.barangay}</div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontSize: '14px', color: colors.inkSoft }}>{p.team}</div>
                    </td>
                    <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: colors.accent }}>{p.score}</div>
                    </td>
                    <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                      <span className="material-symbols-rounded" style={{
                        color: p.trend === 'up' ? colors.success : p.trend === 'down' ? colors.error : colors.inkMuted,
                        fontSize: '20px'
                      }}>
                        {p.trend === 'up' ? 'trending_up' : p.trend === 'down' ? 'trending_down' : 'trending_flat'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.insightCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="material-symbols-rounded" style={{ color: colors.accent }}>analytics</span>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Scoring Insights</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: colors.inkMuted, fontWeight: 700, textTransform: 'uppercase' }}>Verified Judges</div>
                  <div style={{ fontSize: '15px', color: colors.white, marginTop: '4px' }}>{SAMPLE_EVENT.judges.length} Official Judges</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: colors.inkMuted, fontWeight: 700, textTransform: 'uppercase' }}>Current Stage</div>
                  <div style={{ fontSize: '15px', color: colors.white, marginTop: '4px' }}>Final Rebuttal Round</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: colors.inkMuted, fontWeight: 700, textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontSize: '15px', color: colors.white, marginTop: '4px' }}>{SAMPLE_EVENT.location}</div>
                </div>
              </div>
            </div>

            <div style={{ background: colors.white, borderRadius: '24px', border: `1px solid ${colors.border}`, padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: colors.navy, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>gavel</span>
                Judging Panel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {SAMPLE_EVENT.judges.map(judge => (
                  <div key={judge} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.success }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.inkSoft }}>{judge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: colors.borderSoft, border: `2px dashed ${colors.border}`, borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.inkMuted, marginBottom: '12px' }}>qr_code_2</span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: colors.inkMuted }}>Scan to share results</div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

