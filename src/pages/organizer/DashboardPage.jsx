import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { formatDate, getDuration, getCountdown } from '../../utils/dateUtils';
import { colors } from '../../styles/colors';

export default function DashboardPage() {
  const { selectedEvent, participants, judges, rubrics, showToast, updateEvent } = useEventContext();
  const navigate = useNavigate();
  const [showLogModal, setShowLogModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  const accepted = judges.filter(j => j.rsvp === 'Accepted' || j.status === 'Accepted').length;
  const pending = participants.filter(p => p.status === 'Pending').length;
  const scoredCount = participants.filter(p => p.score != null).length;
  const totalWeight = rubrics.reduce((s, r) => s + r.weight, 0);
  const countdown = getCountdown(selectedEvent.startDate, selectedEvent.startTime);
  const duration = getDuration(selectedEvent.startDate, selectedEvent.endDate);

  const statusColors = { Active: '#16A34A', Upcoming: '#D97706', Completed: colors.navy, Cancelled: '#DC2626' };
  const statusColor = statusColors[selectedEvent.status] || colors.inkMuted;

  const auditLogs = [
    { label: 'Event status updated to Active', time: '12m ago', icon: 'sync', color: '#6366F1', bg: '#EEF2FF', user: 'Self' },
    { label: 'Bulk participant invite sent', time: '45m ago', icon: 'group_add', color: colors.accent, bg: colors.accentBg, user: 'Self' },
    { label: 'Judge seat confirmed: Marian Rivera', time: '2h ago', icon: 'how_to_reg', color: '#16A34A', bg: '#F0FDF4', user: 'System' },
    { label: 'Rubric criteria updated', time: 'Yesterday', icon: 'edit_square', color: '#D97706', bg: '#FFFBEB', user: 'Self' },
    { label: 'Event workspace created', time: '3 days ago', icon: 'add_circle', color: colors.navy, bg: colors.pageBg, user: 'Self' },
  ];

  const recentActivity = [
    ...participants.slice(0, 3).map((p, i) => ({ label: `${p.name} registered`, sub: p.team, time: `${i * 2 + 1}m ago`, icon: 'person_add', bg: colors.accentBg, color: colors.accentDeep })),
    ...judges.slice(0, 2).map((j, i) => ({ label: `${j.name} invited`, sub: j.role, time: `${(i + 1) * 8}m ago`, icon: 'mail', bg: '#F0FDF4', color: '#166534' })),
  ];

  const goLive = () => {
    const prev = selectedEvent.status;
    updateEvent(selectedEvent.id, { status: 'Active' });
    showToast(`"${selectedEvent.name}" is now live!`, 'success', () => {
      updateEvent(selectedEvent.id, { status: prev });
      showToast('Status reverted.', 'info');
    });
  };

  /* ── Styles ── */
  const styles = {
    pageContainer: {
      animation: 'fadeIn 0.5s ease-out',
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      gap: isMobile ? '16px' : '24px',
      flexDirection: isMobile ? 'column' : 'row',
      marginBottom: '32px',
    },
    eyebrowBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      background: 'rgba(59, 130, 246, 0.08)',
      border: isMobile ? `1px solid ${colors.accentGlow}` : 'none',
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: '800',
      color: colors.navy,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    pageTitle: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: isMobile ? '26px' : '32px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.03em',
      lineHeight: '1.1',
      marginBottom: '8px',
    },
    pageDescription: {
      color: colors.inkSoft,
      fontSize: '15px',
      maxWidth: '600px',
      lineHeight: '1.55',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    btn: (hovered, primary = false) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', sans-serif",
      whiteSpace: 'nowrap',
      textDecoration: 'none',
      background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1px solid ${hovered ? colors.navy : colors.border}`,
      boxShadow: hovered ? '0 4px 12px rgba(15, 31, 61, 0.15)' : '0 1px 3px rgba(26,24,20,0.06)',
      transform: hovered ? 'translateY(-1px)' : 'none',
    }),
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
      gap: '24px',
    },
    widgetCard: (id, span) => ({
      background: '#fff',
      border: `1px solid ${hoveredCard === id ? colors.border : colors.borderSoft}`,
      borderRadius: '20px',
      padding: '24px',
      boxShadow: hoveredCard === id ? '0 10px 15px -3px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      gridColumn: isMobile ? 'span 1' : isTablet ? (span <= 3 ? 'span 3' : 'span 6') : `span ${span}`,
      transform: hoveredCard === id ? 'translateY(-2px)' : 'none',
    }),
    statLabel: {
      fontSize: '11.5px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.inkMuted,
      marginBottom: '12px',
      display: 'block',
    },
    statValue: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: '36px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.04em',
      lineHeight: '1',
    },
    statTrend: {
      marginTop: '14px',
      fontSize: '12.5px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    formSection: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '22px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
    },
    formSectionHead: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14.5px',
      fontWeight: '700',
      color: colors.navy,
      background: colors.pageBg,
    },
    linkBtn: (hovered) => ({
      background: 'none',
      border: 'none',
      color: hovered ? colors.accentDeep : colors.accent,
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      padding: 0,
      textDecoration: hovered ? 'underline' : 'none',
      textUnderlineOffset: '4px',
      transition: 'all 0.22s',
    }),
    quickActionBtn: (hovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      width: '100%',
      padding: '16px',
      background: '#fff',
      border: `1px solid ${hovered ? colors.accentGlow : colors.borderSoft}`,
      borderRadius: '14px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.22s',
      boxShadow: hovered ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
      transform: hovered ? 'translateX(4px)' : 'none',
    }),
    qaIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    },
    qaTitle: {
      fontWeight: '700',
      fontSize: '14px',
      color: colors.navy,
      margin: 0,
    },
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 31, 61, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out',
    },
    modalContainer: {
      background: '#fff',
      borderRadius: '22px',
      width: '100%',
      maxWidth: '600px',
      padding: isMobile ? '24px' : '40px',
      boxShadow: '0 16px 48px rgba(26,24,20,0.12)',
      position: 'relative',
      animation: 'modalUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    modalTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '26px',
      fontWeight: '800',
      color: colors.navy,
      marginBottom: '8px',
      letterSpacing: '-0.02em',
    },
    modalSub: {
      fontSize: '14px',
      color: colors.inkSoft,
      marginBottom: '32px',
    },
  };

  return (
    <div style={styles.pageContainer} className="slide-up-anim">
      <style>
        {`
          @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>
      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={styles.eyebrowBadge}>
              <span style={{ 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                background: statusColor, 
                flexShrink: 0,
                animation: selectedEvent.status === 'Active' ? 'blink 1.2s infinite' : 'none' 
              }} />
              {selectedEvent.status}
            </div>
            {countdown && <span style={{ fontSize: '13px', fontWeight: 600, color: colors.inkMuted }}>Starts in {countdown}</span>}
          </div>
          <h1 style={styles.pageTitle}>{selectedEvent.name}</h1>
          <p style={styles.pageDescription}>{selectedEvent.description || 'Elevate your event with real-time scoring and professional management.'}</p>
        </div>
        <div style={styles.buttonGroup}>
          <button 
            style={styles.btn(activeBtnHover === 'share')} 
            onMouseEnter={() => setActiveBtnHover('share')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Sharing link copied!', 'success'); }}
          >
            <span className="material-symbols-rounded">share</span>
            Share
          </button>

          {selectedEvent.status === 'Active' ? (
            <button 
              style={styles.btn(activeBtnHover === 'primary', true)} 
              onMouseEnter={() => setActiveBtnHover('primary')}
              onMouseLeave={() => setActiveBtnHover(null)}
              onClick={() => navigate('/organizer/results')}
            >
              <span className="material-symbols-rounded">leaderboard</span>
              Real-time Results
            </button>
          ) : selectedEvent.status === 'Completed' ? (
            <button 
              style={styles.btn(activeBtnHover === 'primary', true)} 
              onMouseEnter={() => setActiveBtnHover('primary')}
              onMouseLeave={() => setActiveBtnHover(null)}
              onClick={() => navigate('/organizer/results')}
            >
              <span className="material-symbols-rounded">analytics</span>
              Final Standings
            </button>
          ) : (
            <button 
              style={{ ...styles.btn(activeBtnHover === 'primary', true), background: activeBtnHover === 'primary' ? '#15803D' : '#16A34A' }} 
              onMouseEnter={() => setActiveBtnHover('primary')}
              onMouseLeave={() => setActiveBtnHover(null)}
              onClick={goLive}
            >
              <span className="material-symbols-rounded">play_circle</span>
              Go Live
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div style={styles.dashboardGrid}>
        <div 
          style={styles.widgetCard('kpi-1', 3)}
          onMouseEnter={() => setHoveredCard('kpi-1')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={styles.statLabel}>Participants</span>
            <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '20px' }}>groups</span>
          </div>
          <div style={styles.statValue}>{participants.length}</div>
          <div style={{ ...styles.statTrend, color: pending > 0 ? '#D97706' : colors.success }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{pending > 0 ? 'pending' : 'check_circle'}</span>
            {pending} pending registration
          </div>
        </div>

        <div 
          style={styles.widgetCard('kpi-2', 3)}
          onMouseEnter={() => setHoveredCard('kpi-2')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={styles.statLabel}>Judges</span>
            <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '20px' }}>gavel</span>
          </div>
          <div style={styles.statValue}>{judges.length}</div>
          <div style={{ ...styles.statTrend, color: colors.success }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>how_to_reg</span>
            {accepted} accepted invites
          </div>
        </div>

        <div 
          style={styles.widgetCard('kpi-3', 3)}
          onMouseEnter={() => setHoveredCard('kpi-3')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={styles.statLabel}>Scoring Progress</span>
            <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '20px' }}>edit_note</span>
          </div>
          <div style={styles.statValue}>{scoredCount}<span style={{ fontSize: '18px', fontWeight: 400, color: colors.inkMuted, opacity: 0.6 }}>/{participants.length}</span></div>
          <div style={{ marginTop: '12px', height: '6px', background: colors.pageBg, borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: participants.length ? `${(scoredCount / participants.length) * 100}%` : '0%', background: colors.accent, borderRadius: '10px', transition: 'width 1s ease-out' }} />
          </div>
        </div>

        <div 
          style={styles.widgetCard('kpi-4', 3)}
          onMouseEnter={() => setHoveredCard('kpi-4')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={styles.statLabel}>Rubric Health</span>
            <span className="material-symbols-rounded" style={{ color: totalWeight === 100 ? colors.success : '#D97706', fontSize: '20px' }}>{totalWeight === 100 ? 'verified' : 'report'}</span>
          </div>
          <div style={{ ...styles.statValue, color: totalWeight === 100 ? colors.success : colors.navy }}>{totalWeight}%</div>
          <div style={{ ...styles.statTrend, color: totalWeight === 100 ? colors.success : '#D97706' }}>
            {totalWeight === 100 ? 'Critera balanced' : 'Needs adjustment'}
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ ...styles.dashboardGrid, marginTop: '24px' }}>
        {/* Left: Combined Activity + Details */}
        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Recent Activity */}
          <div style={styles.formSection}>
            <div style={{ ...styles.formSectionHead, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px', color: colors.inkMuted }}>notifications_active</span>
                Recent Activity
              </div>
              <button 
                style={styles.linkBtn(activeBtnHover === 'view-log')} 
                onMouseEnter={() => setActiveBtnHover('view-log')}
                onMouseLeave={() => setActiveBtnHover(null)}
                onClick={() => setShowLogModal(true)}
              >
                View Audit Log
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 24px', borderBottom: i < recentActivity.length - 1 ? `1px solid ${colors.borderSoft}` : 'none', alignItems: 'center', transition: 'background 0.2s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.pageBg}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: a.bg, display: 'grid', placeItems: 'center', color: a.color, flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{a.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: colors.navy, marginBottom: '2px' }}>{a.label}</p>
                    <p style={{ fontSize: '12px', color: colors.inkMuted }}>{a.sub}</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: colors.inkMuted }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details & Info */}
          <div 
            style={styles.widgetCard('roadmap', 12)}
            onMouseEnter={() => setHoveredCard('roadmap')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '24px', color: colors.navy }}>Event Roadmap</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>Schedule</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: colors.navy, fontWeight: 500 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px', color: colors.inkMuted }}>calendar_today</span>
                    {formatDate(selectedEvent.startDate)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.inkMuted }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>schedule</span>
                    {selectedEvent.startTime} – {selectedEvent.endTime} ({duration})
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>Configuration</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: colors.navy, fontWeight: 500 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px', color: colors.inkMuted }}>category</span>
                    {selectedEvent.type} Event
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.inkMuted }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{selectedEvent.visibility === 'Public' ? 'public' : 'lock'}</span>
                    {selectedEvent.visibility} Access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ ...styles.widgetCard('checklist', 12), background: colors.navy, border: 'none', color: '#fff' }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Launch Checklist</h3>
            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px' }}>Complete these to ensure a smooth event.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Set up Rubrics', met: totalWeight === 100, path: '/organizer/rubrics' },
                { label: 'Invite Judges', met: judges.length > 0, path: '/organizer/judges' },
                { label: 'Register Participants', met: participants.length > 0, path: '/organizer/participants' },
              ].map((c, i) => {
                const isItemHovered = activeBtnHover === `checklist-${i}`;
                return (
                  <div 
                    key={i} 
                    onClick={() => navigate(c.path)} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      marginLeft: '-8px',
                      borderRadius: '8px',
                      background: isItemHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={() => setActiveBtnHover(`checklist-${i}`)}
                    onMouseLeave={() => setActiveBtnHover(null)}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.met ? colors.accent : 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                      {c.met && <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.navy }}>check</span>}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, opacity: c.met ? 1 : (isItemHovered ? 1 : 0.6) }}>{c.label}</span>
                    {isItemHovered && <span className="material-symbols-rounded" style={{ fontSize: '16px', marginLeft: 'auto', opacity: 0.5 }}>chevron_right</span>}
                </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: 'person_add', label: 'Invite Participants', path: '/organizer/participants', color: colors.accent, id: 'qa-1' },
              { icon: 'rule', label: 'Configure Rubric', path: '/organizer/rubrics', color: '#16A34A', id: 'qa-2' },
              { icon: 'gavel', label: 'Manage Judges', path: '/organizer/judges', color: '#D97706', id: 'qa-3' },
              { icon: 'settings', label: 'Event Settings', path: '/organizer/events/settings', color: colors.inkMid, id: 'qa-4' },
            ].map(a => (
              <button 
                key={a.label} 
                style={styles.quickActionBtn(hoveredCard === a.id)} 
                onClick={() => navigate(a.path)}
                onMouseEnter={() => setHoveredCard(a.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ ...styles.qaIcon, background: colors.pageBg, color: a.color }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{a.icon}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                  <span style={styles.qaTitle}>{a.label}</span>
                  <span className="material-symbols-rounded" style={{ fontSize: '16px', opacity: 0.3 }}>chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showLogModal && (
        <div style={styles.modalOverlay} onClick={() => setShowLogModal(false)}>
          <div style={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={styles.modalTitle}>Audit Log</h3>
                <p style={styles.modalSub}>Event history and security logs.</p>
              </div>
              <button 
                style={styles.linkBtn(activeBtnHover === 'log-close')} 
                onMouseEnter={() => setActiveBtnHover('log-close')}
                onMouseLeave={() => setActiveBtnHover(null)}
                onClick={() => setShowLogModal(false)}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div style={{ padding: '0', maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ padding: '10px 0' }}>
                {auditLogs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: i < auditLogs.length - 1 ? `1px solid ${colors.borderSoft}` : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: log.bg, display: 'grid', placeItems: 'center', color: log.color, flexShrink: 0 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{log.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: colors.navy, marginBottom: '4px' }}>{log.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: colors.inkMuted }}>{log.time}</span>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: colors.border }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: colors.accent }}>User: {log.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                style={styles.btn(activeBtnHover === 'log-bottom-close')} 
                onMouseEnter={() => setActiveBtnHover('log-bottom-close')}
                onMouseLeave={() => setActiveBtnHover(null)}
                onClick={() => setShowLogModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
