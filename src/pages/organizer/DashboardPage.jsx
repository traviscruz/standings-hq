import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { formatDate, getDuration, getCountdown } from '../../utils/dateUtils';
import { colors } from '../../styles/colors';

/**
 * DASHBOARD PAGE - VIBRANT & HIGH-FIDELITY VERSION
 * 
 * FEATURES:
 * - Status Badges with color-coded logic
 * - Colorful action icons with subtle backgrounds
 * - Key performance indicators with distinct visual weight
 * - Refined roadmap and checklist for a 'Premium' feel
 */

// ── Status Component (Reusable) ──
const StatusBadge = ({ status }) => {
  const configs = {
    Active:    { color: colors.success, bg: colors.successBg, border: colors.successBgMid, icon: 'sensors' },
    Upcoming:  { color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7', icon: 'schedule' },
    Completed: { color: colors.navy, bg: colors.pageBg, border: colors.borderSoft, icon: 'check_circle' },
    Cancelled: { color: colors.error, bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.12)', icon: 'cancel' }
  };
  const cfg = configs[status] || { color: colors.inkMuted, bg: colors.pageBg, border: colors.borderSoft, icon: 'circle' };

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '6px 14px', borderRadius: '100px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em'
    }}>
      <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{cfg.icon}</span>
      {status}
    </div>
  );
};

export default function DashboardPage() {
  const { selectedEvent, participants, judges, rubrics, showToast, updateEvent } = useEventContext();
  const userName = localStorage.getItem('full_name') || 'Organizer';
  const userRole = localStorage.getItem('role') || 'Organizer';
  const userHandle = localStorage.getItem('username') || '';
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
  const isDesktop = windowWidth > 1024;

  const accepted = judges.filter(j => j.rsvp === 'Accepted' || j.status === 'Accepted').length;
  const pending = participants.filter(p => p.status === 'Pending').length;
  const scoredCount = participants.filter(p => p.score != null).length;
  const totalWeight = rubrics.reduce((s, r) => s + r.weight, 0);
  const countdown = getCountdown(selectedEvent.startDate, selectedEvent.startTime);
  const duration = getDuration(selectedEvent.startDate, selectedEvent.endDate);

  const goLive = () => {
    const prev = selectedEvent.status;
    updateEvent(selectedEvent.id, { status: 'Active' });
    showToast(`"${selectedEvent.name}" is now live!`, 'success', () => {
      updateEvent(selectedEvent.id, { status: prev });
      showToast('Status reverted.', 'info');
    });
  };

  const styles = {
    pageContainer: {
      position: 'relative',
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      gap: isMobile ? '16px' : '24px',
      flexDirection: isMobile ? 'column' : 'row',
      marginBottom: '40px',
    },
    pageTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '28px' : '36px',
      fontWeight: '900',
      color: colors.navy,
      letterSpacing: '-0.04em',
      lineHeight: '1.1',
      marginBottom: '12px',
    },
    btn: (hovered, primary = false) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '14px',
      fontSize: '14.5px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
      boxShadow: hovered ? '0 8px 24px -6px rgba(15, 31, 61, 0.2)' : 'none',
      transform: hovered ? 'translateY(-2px)' : 'none',
    }),
    widgetCard: (id, span, gradient = 'none') => ({
      background: hoveredCard === id ? '#fff' : (gradient !== 'none' ? gradient : '#fff'),
      border: `1.5px solid ${hoveredCard === id ? colors.accent : colors.borderSoft}`,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: hoveredCard === id ? '0 25px 50px -12px rgba(15, 23, 42, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      gridColumn: isMobile ? 'span 1' : `span ${span}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
      transform: hoveredCard === id ? 'translateY(-6px)' : 'none',
    }),
    iconWrapper: (bg, color) => ({
      width: '44px',
      height: '44px',
      borderRadius: '14px',
      background: bg,
      color: color,
      display: 'grid',
      placeItems: 'center',
      marginBottom: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    })
  };

  const auditLogs = [
    { label: 'Event status updated to Active', time: '12m ago', icon: 'sync', color: '#6366F1', bg: '#EEF2FF', user: 'Self' },
    { label: 'Bulk participant invite sent', time: '45m ago', icon: 'group_add', color: colors.accent, bg: colors.accentBg, user: 'Self' },
    { label: 'Judge seat confirmed: Marian Rivera', time: '2h ago', icon: 'how_to_reg', color: '#16A34A', bg: '#F0FDF4', user: 'System' },
    { label: 'Rubric criteria updated', time: 'Yesterday', icon: 'edit_square', color: '#D97706', bg: '#FFFBEB', user: 'Self' },
  ];

  return (
    <div style={styles.pageContainer}>
      <header style={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <StatusBadge status={selectedEvent.status} />
            {localStorage.getItem(`pfp_${userHandle}`) && (
              <img 
                src={localStorage.getItem(`pfp_${userHandle}`)} 
                alt="Profile" 
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.accentBg}` }} 
              />
            )}
            <div style={{ ...styles.eyebrow, marginBottom: 0 }}>
               <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>waving_hand</span>
               Welcome, {userName.split(' ')[0]}!
            </div>
          </div>
          <h1 style={styles.pageTitle}>{selectedEvent.name}</h1>
          <p style={{ color: colors.inkSoft, fontSize: '16px', maxWidth: '600px' }}>
            {selectedEvent.description || 'Welcome to your workspace. Manage participants, rubrics, and real-time scoring effortlessly.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={styles.btn(activeBtnHover === 'share')} onMouseEnter={() => setActiveBtnHover('share')} onMouseLeave={() => setActiveBtnHover(null)}>
            <span className="material-symbols-rounded">share</span> Share
          </button>
          <button style={styles.btn(activeBtnHover === 'primary', true)} onMouseEnter={() => setActiveBtnHover('primary')} onMouseLeave={() => setActiveBtnHover(null)} onClick={goLive}>
            <span className="material-symbols-rounded">{selectedEvent.status === 'Active' ? 'leaderboard' : 'play_circle'}</span>
            {selectedEvent.status === 'Active' ? 'View Live Rankings' : 'Go Live Now'}
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={styles.widgetCard('kpi-p', 3, `linear-gradient(135deg, #fff 40%, ${colors.accentBg} 100%)`)} onMouseEnter={() => setHoveredCard('kpi-p')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper(colors.accentBg, colors.accent)}>
            <span className="material-symbols-rounded">groups</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: colors.inkMuted }}>Participants</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy }}>{participants.length}</div>
          <div style={{ fontSize: '13px', color: colors.success, fontWeight: 700 }}>+{pending} pending</div>
        </div>

        <div style={styles.widgetCard('kpi-j', 3, 'linear-gradient(135deg, #fff 40%, #F0FDF4 100%)')} onMouseEnter={() => setHoveredCard('kpi-j')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper('#F0FDF4', '#16A34A')}>
            <span className="material-symbols-rounded">gavel</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: colors.inkMuted }}>Judges</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy }}>{judges.length}</div>
          <div style={{ fontSize: '13px', color: colors.inkMuted, fontWeight: 600 }}>{accepted} accepted</div>
        </div>

        <div style={styles.widgetCard('kpi-s', 3, 'linear-gradient(135deg, #fff 40%, #FFF7ED 100%)')} onMouseEnter={() => setHoveredCard('kpi-s')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper('#FFF7ED', '#EA580C')}>
            <span className="material-symbols-rounded">edit_note</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: colors.inkMuted }}>Progress</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy }}>{scoredCount}<span style={{ fontSize: '18px', opacity: 0.4 }}>/{participants.length}</span></div>
          <div style={{ height: '4px', background: colors.pageBg, borderRadius: '10px' }}>
            <div style={{ height: '100%', width: participants.length ? `${(scoredCount / participants.length) * 100}%` : '0%', background: '#EA580C', borderRadius: '10px' }} />
          </div>
        </div>

        <div style={styles.widgetCard('kpi-r', 3, 'linear-gradient(135deg, #fff 40%, #EEF2FF 100%)')} onMouseEnter={() => setHoveredCard('kpi-r')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper('#EFF6FF', '#2563EB')}>
            <span className="material-symbols-rounded">analytics</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: colors.inkMuted }}>Rubric Logic</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: totalWeight === 100 ? colors.success : colors.navy }}>{totalWeight}%</div>
          <div style={{ fontSize: '13px', color: totalWeight === 100 ? colors.success : '#D97706', fontWeight: 700 }}>
            {totalWeight === 100 ? 'Balanced' : 'Imbalanced'}
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr', gap: '32px' }}>
        <div style={{ background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, color: colors.navy }}>Audit & Security Log</h3>
            <button style={{ background: 'none', border: 'none', color: colors.accent, fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Full History</button>
          </div>
          <div>
            {auditLogs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px 24px', borderBottom: i < auditLogs.length - 1 ? `1px solid ${colors.borderSoft}` : 'none', alignItems: 'center' }}>
                <div style={styles.iconWrapper(log.bg, log.color)}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{log.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14.5px', fontWeight: 700, color: colors.navy, marginBottom: '2px' }}>{log.label}</p>
                  <p style={{ fontSize: '12px', color: colors.inkMuted }}>By {log.user} · <span style={{ color: colors.accent, fontWeight: 600 }}>{log.time}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: colors.navy, padding: '32px', borderRadius: '24px', color: '#fff' }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, marginBottom: '8px' }}>Active Roadmap</h3>
            <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '24px' }}>Essential tasks to complete configuration.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { l: 'Configure Rubrics', m: totalWeight === 100 },
                { l: 'Invite Expert Judges', m: judges.length > 0 },
                { l: 'Admit Participants', m: participants.length > 0 }
              ].map((task, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: task.m ? colors.accent : 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                    {task.m && <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.navy }}>check</span>}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, opacity: task.m ? 1 : 0.4 }}>{task.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
