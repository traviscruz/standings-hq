import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

export default function ManageEventPage() {
  const { eventsList, setSelectedEventId, showToast, deleteEvent, updateEvent, addEvent } = useEventContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

/* ─── Status Badge ──────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const configs = {
    Active:    { color: '#166534', bg: '#DCFCE7', icon: 'sensors', pulse: true },
    Upcoming:  { color: '#92400E', bg: '#FEF3C7', icon: 'schedule' },
    Completed: { color: '#3730A3', bg: '#E0E7FF', icon: 'check_circle' },
    Cancelled: { color: '#991B1B', bg: '#FEE2E2', icon: 'cancel' }
  };
  const cfg = configs[status] || { color: '#475569', bg: '#F1F5F9', icon: 'circle' };
  
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '100px',
      background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em',
      border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <span className="material-symbols-rounded" style={{ 
        fontSize: '14px', 
        animation: cfg.pulse ? 'pulse 2s infinite' : 'none' 
      }}>{cfg.icon}</span>
      {status}
    </div>
  );
}

  const filtered = eventsList
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    .filter(e => {
      if (filter === 'all') return true;
      if (filter === 'active') return e.status === 'Active';
      if (filter === 'upcoming') return e.status === 'Upcoming';
      if (filter === 'past') return e.status === 'Completed' || e.status === 'Cancelled';
      return true;
    });

  const handleSwitch = (ev) => {
    setSelectedEventId(ev.id);
    navigate('/organizer/dashboard');
    showToast(`Switched workspace to "${ev.name}"`, 'info');
  };

  const handleToggleStatus = (ev) => {
    const prev = ev.status;
    const next = ev.status === 'Active' ? 'Upcoming' : 'Active';
    updateEvent(ev.id, { status: next });
    showToast(`"${ev.name}" is now ${next}.`, 'success', () => {
      updateEvent(ev.id, { status: prev });
      showToast('Status reverted.', 'info');
    });
  };

  const handleDeleteEvent = (ev) => {
    const snap = { ...ev };
    deleteEvent(ev.id);
    setConfirmDelete(null);
    showToast(`"${ev.name}" deleted.`, 'info', () => {
      addEvent(snap, true);
      showToast('Event restored.', 'success');
    });
  };

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
    tableContainer: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '22px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    tableHeader: {
      padding: '16px 20px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
    },
    searchInput: {
      height: '40px',
      padding: '0 16px 0 38px',
      background: colors.pageBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '100px',
      fontSize: '14px',
      color: colors.navy,
      outline: 'none',
      transition: 'all 0.2s',
      fontFamily: "'Inter', sans-serif",
      width: isMobile ? '100%' : '240px',
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
    btnIcon: (hovered, danger = false) => ({
      background: hovered ? (danger ? 'rgba(239,68,68,0.1)' : 'rgba(15,31,61,0.05)') : 'none',
      border: 'none',
      color: hovered ? (danger ? colors.coral : colors.navy) : colors.inkMuted,
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '10px',
      display: 'grid',
      placeItems: 'center',
      transition: 'all 0.15s',
    }),
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
    modalContainer: (maxWidth = '420px') => ({
      background: '#fff',
      borderRadius: '22px',
      width: '100%',
      maxWidth: maxWidth,
      boxShadow: '0 16px 48px rgba(26,24,20,0.12)',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
      animation: 'modalUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }),
    modalTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '22px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.02em',
      margin: 0,
    },
  };

  return (
    <>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>My Events</h1>
          <p style={styles.pageDescription}>All events you've created. Switch workspaces, edit details, or manage status.</p>
        </div>
        <button
          style={styles.btn(activeBtnHover === 'new', true)}
          onMouseEnter={() => setActiveBtnHover('new')}
          onMouseLeave={() => setActiveBtnHover(null)}
          onClick={() => navigate('/organizer/events/create')}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span>
          New Event
        </button>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'active', 'upcoming', 'past'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '100px',
                background: filter === f ? colors.navy : 'transparent',
                color: filter === f ? '#fff' : colors.inkMuted,
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Inter', sans-serif",
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <span className="material-symbols-rounded" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: colors.inkMuted, pointerEvents: 'none' }}>search</span>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
              onFocus={e => { e.target.style.borderColor = colors.accent; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; }}
              onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.background = colors.pageBg; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '80px 32px', textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>event_busy</span>
            <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No events match your search.</p>
            <button
              style={{ ...styles.btn(activeBtnHover === 'create', true), margin: '16px auto 0' }}
              onMouseEnter={() => setActiveBtnHover('create')}
              onMouseLeave={() => setActiveBtnHover(null)}
              onClick={() => navigate('/organizer/events/create')}
            >
              Create your first event
            </button>
          </div>
        ) : (
          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Schedule</th>
                <th style={styles.th}>Visibility</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => {
                return (
                  <tr key={ev.id}
                    style={{ background: hoveredRow === ev.id ? colors.pageBg : 'transparent', transition: 'background 0.2s' }}
                    onMouseEnter={() => setHoveredRow(ev.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, color: colors.navy, fontSize: '14px', marginBottom: '2px' }}>{ev.name}</div>
                      <div style={{ fontSize: '12px', color: colors.inkMuted }}>Created {ev.createdAt}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '13px', color: colors.inkMid, background: colors.pageBg, padding: '3px 10px', borderRadius: '100px', fontWeight: 500 }}>{ev.type}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.inkSoft }}>{ev.startDate}</div>
                      <div style={{ fontSize: '12px', color: colors.inkMuted }}>{ev.startTime} – {ev.endTime}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: colors.inkMid }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{ev.visibility === 'Public' ? 'public' : 'lock'}</span>
                        {ev.visibility}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <StatusBadge status={ev.status} />
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button style={styles.btnIcon(activeBtnHover === `sw-${ev.id}`)} title="Open Workspace" onClick={() => handleSwitch(ev)} onMouseEnter={() => setActiveBtnHover(`sw-${ev.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>open_in_new</span>
                        </button>
                        <button style={styles.btnIcon(activeBtnHover === `st-${ev.id}`)} title="Settings" onClick={() => { setSelectedEventId(ev.id); navigate('/organizer/events/settings'); }} onMouseEnter={() => setActiveBtnHover(`st-${ev.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>settings</span>
                        </button>
                        {ev.status !== 'Completed' && (
                          <button style={styles.btnIcon(activeBtnHover === `tg-${ev.id}`)} title={ev.status === 'Active' ? 'Mark as Upcoming' : 'Set as Active'} onClick={() => handleToggleStatus(ev)} onMouseEnter={() => setActiveBtnHover(`tg-${ev.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{ev.status === 'Active' ? 'pause_circle' : 'play_circle'}</span>
                          </button>
                        )}
                        <button style={styles.btnIcon(activeBtnHover === `dl-${ev.id}`, true)} title="Delete" onClick={() => setConfirmDelete({ ev })} onMouseEnter={() => setActiveBtnHover(`dl-${ev.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmDelete && (
        <div style={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.modalContainer()} onClick={e => e.stopPropagation()}>
            <div style={{ width: '52px', height: '52px', background: '#FEE2E2', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-rounded" style={{ color: '#DC2626', fontSize: '26px' }}>delete_forever</span>
            </div>
            <h2 style={{ ...styles.modalTitle, textAlign: 'center', marginBottom: '10px' }}>Delete Event?</h2>
            <p style={{ fontSize: '14px', color: colors.inkSoft, textAlign: 'center', lineHeight: '1.5', marginBottom: '28px' }}>
              "<strong>{confirmDelete.ev.name}</strong>" and all its data will be permanently deleted. This can be undone with the toast notification.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button style={styles.btn(activeBtnHover === 'cancel-del')} onClick={() => setConfirmDelete(null)} onMouseEnter={() => setActiveBtnHover('cancel-del')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
              <button
                style={{ ...styles.btn(activeBtnHover === 'confirm-del', true), background: '#DC2626' }}
                onClick={() => handleDeleteEvent(confirmDelete.ev)}
                onMouseEnter={() => setActiveBtnHover('confirm-del')}
                onMouseLeave={() => setActiveBtnHover(null)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete_forever</span>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
