import React, { useState, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getElapsed(startDate, startTime) {
  if (!startDate) return null;
  const start = new Date(`${startDate}T${startTime || '00:00'}`);
  const now = new Date();
  const diff = now - start;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

export default function ResultsPage() {
  const { selectedEvent, participants, judges, showToast, eventsLoading } = useEventContext();
  const [, forceUpdate] = useState(0);
  const [liveToggle, setLiveToggle] = useState(true);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  if (eventsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: '12px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Loading results…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>event_busy</span>
        <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No event selected.</p>
      </div>
    );
  }

  const ranked = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const scoredCount = participants.filter(p => p.score != null).length;
  const highScore = ranked.find(p => p.score != null)?.score ?? null;
  const avgScore = scoredCount > 0
    ? (participants.filter(p => p.score != null).reduce((s, p) => s + p.score, 0) / scoredCount).toFixed(1)
    : null;
  const elapsed = getElapsed(selectedEvent.startDate, selectedEvent.startTime);
  const isLive = selectedEvent.status === 'Active';

  const styles = {
    pageHeader: {
      marginBottom: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '24px',
    },
    pageTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '28px' : '32px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.03em',
      lineHeight: '1.1',
      margin: 0,
      marginBottom: '8px',
    },
    pageDescription: {
      color: colors.inkMid,
      fontSize: '15px',
      maxWidth: '600px',
      lineHeight: '1.55',
      margin: 0,
    },
    btn: (hovered, primary = false) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: '14px',
      fontSize: '13.5px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', sans-serif",
      whiteSpace: 'nowrap',
      background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1px solid ${hovered ? colors.navy : colors.border}`,
      boxShadow: hovered ? '0 4px 12px rgba(15, 31, 61, 0.15)' : '0 1px 3px rgba(26,24,20,0.06)',
      transform: hovered ? 'translateY(-1px)' : 'none',
      height: '42px',
    }),
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
      gap: '24px',
      marginBottom: '28px',
    },
    widgetCard: (span) => ({
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '18px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      gridColumn: isMobile ? 'span 1' : `span ${span}`,
    }),
    statLabel: {
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.inkMuted,
      marginBottom: '8px',
      display: 'block',
    },
    statValue: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '32px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.04em',
      lineHeight: '1',
    },
    tableContainer: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '22px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    tableHeader: {
      padding: '20px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    },
    tableTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '18px',
      fontWeight: '700',
      color: colors.navy,
      margin: 0,
    },
    dataTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
    },
    th: {
      padding: '14px 24px',
      background: '#F8FAFC',
      fontSize: '11.5px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: colors.inkMuted,
      borderBottom: `1px solid ${colors.borderSoft}`,
    },
    td: {
      padding: '16px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      fontSize: '14px',
      color: colors.inkMid,
    },
    userAvatar: (size = 34, fontSize = 11, bg = colors.accentBg, text = colors.accentDeep) => ({
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: bg,
      color: text,
      display: 'grid',
      placeItems: 'center',
      fontSize: `${fontSize}px`,
      fontWeight: '700',
    }),
  };

  return (
    <>
      <div style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {isLive && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: '100px',
              }}>
                <span style={{ width: '6px', height: '6px', background: '#DC2626', borderRadius: '50%', animation: 'blink 1.2s infinite' }} />
                Live
              </span>
            )}
            {elapsed && <span style={{ fontSize: '13px', color: colors.inkMuted }}>Running for {elapsed}</span>}
          </div>
          <h1 style={styles.pageTitle}>Results &amp; Standings</h1>
          <p style={styles.pageDescription}>
            Live scoring overview for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            style={styles.btn(activeBtnHover === 'pause')}
            onMouseEnter={() => setActiveBtnHover('pause')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => { setLiveToggle(!liveToggle); showToast(liveToggle ? 'Live refresh paused.' : 'Live refresh resumed.', 'info'); }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{liveToggle ? 'pause' : 'play_arrow'}</span>
            {liveToggle ? 'Pause Live' : 'Resume Live'}
          </button>
          <button
            style={styles.btn(activeBtnHover === 'export', true)}
            onMouseEnter={() => setActiveBtnHover('export')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => showToast('Generating PDF rankings... Download starting.', 'success')}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Event Summary KPIs ── */}
      <div style={styles.dashboardGrid}>
        {[
          { label: 'Event Status', value: selectedEvent.status, icon: 'info', color: isLive ? '#16A34A' : colors.navy },
          { label: 'Schedule Ends', value: `${formatDate(selectedEvent.endDate)} at ${selectedEvent.endTime || '—'}`, icon: 'event', color: colors.navy },
          { label: 'Participants', value: `${participants.length} total`, icon: 'groups', color: colors.navy },
          { label: 'Judges', value: `${judges.filter(j => j.status === 'Accepted' || j.rsvp === 'Accepted').length} active`, icon: 'gavel', color: colors.navy },
        ].map(k => (
          <div key={k.label} style={styles.widgetCard(3)}>
            <span style={styles.statLabel}>{k.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '22px', color: k.color }}>{k.icon}</span>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '17px', fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Score Stats ── */}
      <div style={styles.dashboardGrid}>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Scores Submitted</span>
          <div style={styles.statValue}>
            {scoredCount}
            <span style={{ fontSize: '16px', color: colors.inkMuted, marginLeft: '4px' }}>/{participants.length}</span>
          </div>
          {participants.length > 0 && (
            <div style={{ marginTop: '10px', height: '5px', background: colors.borderSoft, borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(scoredCount / participants.length) * 100}%`, background: colors.accent, borderRadius: '100px', transition: 'width 0.5s' }} />
            </div>
          )}
        </div>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Highest Score</span>
          <div style={{ ...styles.statValue, color: highScore != null ? '#16A34A' : colors.inkMuted }}>
            {highScore ?? '—'}
          </div>
          {ranked[0] && highScore != null && (
            <div style={{ marginTop: '10px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>emoji_events</span>
              {ranked[0].name}
            </div>
          )}
        </div>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Average Score</span>
          <div style={{ ...styles.statValue, color: avgScore ? colors.navy : colors.inkMuted }}>{avgScore ?? '—'}</div>
        </div>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Current Leader</span>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: colors.navy, marginTop: '10px' }}>
            {ranked[0] && ranked[0].score != null ? ranked[0].name : '—'}
          </div>
          {ranked[0] && ranked[0].score != null && (
            <div style={{ fontSize: '12px', color: colors.inkMuted, marginTop: '4px' }}>{ranked[0].team}</div>
          )}
        </div>
      </div>

      {/* ── Leaderboard Table ── */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={{ ...styles.tableTitle, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.navy }}>leaderboard</span>
            Official Leaderboard
            {isLive && liveToggle && (
              <span style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%', animation: 'blink 1.2s infinite', marginLeft: '4px' }} />
            )}
          </h3>
          <span style={{ fontSize: '12px', color: colors.inkMuted }}>{liveToggle ? 'Auto-refreshing...' : 'Paused'}</span>
        </div>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '70px', textAlign: 'center' }}>Rank</th>
              <th style={styles.th}>Participant</th>
              <th style={styles.th}>Team</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Criteria</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '64px', textAlign: 'center', color: colors.inkMuted }}>
                  No participants added yet.
                </td>
              </tr>
            ) : ranked.map((p, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
              const rankDisplay = p.score != null ? (medal || idx + 1) : '—';
              return (
                <tr key={p.id}
                  style={{ background: hoveredRow === p.id ? colors.pageBg : (idx === 0 && p.score != null ? 'rgba(250,204,21,0.04)' : 'transparent'), transition: 'background 0.2s' }}
                  onMouseEnter={() => setHoveredRow(p.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ ...styles.td, textAlign: 'center', fontWeight: 800, fontSize: idx < 3 && p.score != null ? '20px' : '16px', color: p.score != null ? colors.navy : colors.inkMuted }}>
                    {rankDisplay}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, color: colors.navy }}>
                      <div style={styles.userAvatar(32, 11, idx === 0 && p.score != null ? 'rgba(250,204,21,0.15)' : colors.accentBg, idx === 0 && p.score != null ? '#B45309' : colors.accentDeep)}>
                        {p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      {p.name}
                    </div>
                  </td>
                  <td style={{ ...styles.td, fontSize: '13px' }}>{p.team}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ background: colors.pageBg, color: p.score != null ? colors.success : colors.inkMuted, borderRadius: '100px', padding: '3px 12px', fontSize: '12px', fontWeight: 700 }}>
                      {p.score != null ? 'Scored' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '22px', color: p.score != null ? (idx === 0 ? '#16A34A' : colors.navy) : colors.inkMuted }}>
                    {p.score ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
