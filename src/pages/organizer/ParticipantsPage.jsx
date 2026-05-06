import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

/* ─── data ──────────────────────────────────────────────────────────────── */
const USER_POOL = [
  { id: 9001, name: 'Lapu-Lapu', email: 'lapulapu@mactan.ph', team: 'Kadato-an Warriors' },
  { id: 9002, name: 'Diego Cera', email: 'diego@manila.ph', team: 'Tondo FC' },
  { id: 9003, name: 'Rajah Soliman', email: 'soliman@maynila.ph', team: 'Pasig Royals' },
  { id: 9004, name: 'Tupas', email: 'tupas@cebu.ph', team: 'Visayas United' },
  { id: 9005, name: 'Humabon', email: 'humabon@cebu.ph', team: 'Visayas United' },
  { id: 9006, name: 'Si Awi', email: 'siawi@visayas.ph', team: 'Leyte Eagles' },
  { id: 9007, name: 'Datu Mangal', email: 'mangal@mindanao.ph', team: 'Southern Stars' },
];

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

/* ─── Status Badge (Read Only) ─────────────────────────────────────────── */
function StatusBadge({ status }) {
  const configs = {
    Registered: { bg: '#DCFCE7', color: '#166534', icon: 'check_circle' },
    Pending: { bg: '#FEF3C7', color: '#92400E', icon: 'schedule' }
  };
  const c = configs[status] || configs.Pending;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '5px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em',
      background: c.bg, color: c.color, userSelect: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: `1px solid rgba(0,0,0,0.03)`
    }}>
      <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{c.icon}</span>
      {status}
    </div>
  );
}

/* ─── EditableCell: noticeable edit-cue ─────────────────────────────────── */
function EditableCell({ value, options, onSave, placeholder = '— click to edit —', type = 'text' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hovered, setHovered] = useState(false);

  const commit = () => { if (draft !== value) onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing && options) return (
    <select autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => e.key === 'Escape' && cancel()}
      style={{ fontSize: '13px', padding: '5px 10px', border: `2px solid ${colors.accent}`, borderRadius: '8px', outline: 'none', background: '#fff', fontFamily: "'Inter', sans-serif", boxShadow: `0 0 0 3px ${colors.accentGlow}` }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  if (editing) return (
    <input autoFocus type={type} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
      style={{ fontSize: '13px', padding: '5px 10px', border: `2px solid ${colors.accent}`, borderRadius: '8px', width: '150px', outline: 'none', fontFamily: "'Inter', sans-serif", boxShadow: `0 0 0 3px ${colors.accentGlow}` }} />
  );

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Click to edit"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 9px', borderRadius: '8px', cursor: 'pointer',
        background: hovered ? 'rgba(59,130,246,0.08)' : 'transparent',
        border: `1.5px solid ${hovered ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '13px', color: value ? colors.inkMid : colors.inkMuted, fontStyle: value ? 'normal' : 'italic' }}>
        {value || placeholder}
      </span>
      <span className="material-symbols-rounded" style={{ fontSize: '13px', color: hovered ? colors.accent : 'transparent', transition: 'color 0.15s', flexShrink: 0 }}>
        edit
      </span>
    </div>
  );
}

/* ─── 5-second undo bar ─────────────────────────────────────────────────── */
function UndoBar({ message, onUndo, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => {
      const el = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (el / 5000) * 100);
      setProgress(pct);
      if (pct === 0) clearInterval(iv);
    }, 50);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'auto', maxWidth: '400px', pointerEvents: 'none'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', color: '#fff', borderRadius: '16px',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
        pointerEvents: 'auto', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'grid', placeItems: 'center', color: colors.accent }}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>info</span>
        </div>
        <span style={{ fontSize: '13.5px', fontWeight: 500, flex: 1 }}>{message}</span>
        <button onClick={onUndo} style={{ background: 'none', border: 'none', color: colors.accent, fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Undo</button>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'grid', placeItems: 'center' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
        </button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: `${progress}%`, background: colors.accent, transition: 'width 0.05s linear' }} />
      </div>
    </div>
  );
}

/* ─── hook ──────────────────────────────────────────────────────────────── */
function useUndo() {
  const [state, setState] = useState(null); // { message, onUndo }
  const timerRef = useRef(null);

  const show = useCallback((message, onUndo) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ message, onUndo });
    timerRef.current = setTimeout(() => setState(null), 5000);
  }, []);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setState(null);
  }, []);

  const doUndo = useCallback(() => {
    state?.onUndo?.();
    dismiss();
  }, [state, dismiss]);

  const bar = state ? <UndoBar message={state.message} onUndo={doUndo} onDismiss={dismiss} /> : null;
  return { show, bar };
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function ParticipantsPage() {
  const { selectedEvent, participants, addParticipant, removeParticipant, updateParticipant, showToast, eventsLoading } = useEventContext();

  const undo = useUndo();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [pending, setPending] = useState([]);
  const [viewParticipant, setViewParticipant] = useState(null);
  const [confirmKick, setConfirmKick] = useState(null);
  const [showBulkTeam, setShowBulkTeam] = useState(false);
  const [bulkTeamVal, setBulkTeamVal] = useState('');
  const [showCsvHelp, setShowCsvHelp] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  const knownTeams = [...new Set(participants.map(p => p.team).filter(Boolean))];

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.team || '').toLowerCase().includes(search.toLowerCase())
  );

  const allChecked = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  const someChecked = filtered.some(p => selected.has(p.id));

  const toggleAll = () => allChecked ? setSelected(new Set()) : setSelected(new Set(filtered.map(p => p.id)));
  const toggleOne = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const poolResults = USER_POOL.filter(u =>
    userSearch.length > 0 &&
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())) &&
    !participants.find(p => p.id === u.id) && !pending.find(p => p.id === u.id)
  );
  const addToPending = u => setPending(prev => [...prev, u]);
  const removeFromPending = id => setPending(prev => prev.filter(u => u.id !== id));

  const handleBulkAdd = () => {
    const ids = pending.map(u => u.id);
    pending.forEach(u => addParticipant(selectedEvent.id, { ...u, status: 'Pending', score: null }));
    showToast(`Invited ${pending.length} participant(s).`, 'success', () => {
      ids.forEach(id => removeParticipant(selectedEvent.id, id));
      showToast('Invitations revoked.', 'info');
    });
    setPending([]); setUserSearch(''); setShowInviteModal(false);
  };

  const doRemove = ids => {
    const snap = participants.filter(p => ids.includes(p.id));
    ids.forEach(id => removeParticipant(selectedEvent.id, id));
    setSelected(new Set());
    undo.show(
      `${ids.length} participant(s) removed.`,
      () => { snap.forEach(p => addParticipant(selectedEvent.id, p)); showToast('Restored.', 'success'); }
    );
  };

  const handleBulkTeam = () => {
    if (!bulkTeamVal.trim()) return;
    [...selected].forEach(id => updateParticipant(selectedEvent.id, id, { team: bulkTeamVal.trim() }));
    showToast(`Set team for ${selected.size} participant(s).`, 'success');
    setSelected(new Set()); setShowBulkTeam(false); setBulkTeamVal('');
  };

  const handleFileImport = e => {
    const file = e.target.files?.[0]; if (!file) return;
    showToast(`Importing from "${file.name}"...`, 'info');
    setTimeout(() => {
      const newItems = [
        { id: Date.now() + 1, name: 'CSV User One', email: 'one@csv.ph', team: 'CSV Team A', status: 'Pending', score: null },
        { id: Date.now() + 2, name: 'CSV User Two', email: 'two@csv.ph', team: 'CSV Team B', status: 'Pending', score: null },
      ];
      const ids = newItems.map(p => p.id);
      newItems.forEach(p => addParticipant(selectedEvent.id, p));
      showToast(`Imported ${newItems.length} participants.`, 'success', () => {
        ids.forEach(id => removeParticipant(selectedEvent.id, id));
        showToast('Import undone.', 'info');
      });
    }, 800);
    e.target.value = '';
  };

  const registered = participants.filter(p => p.status === 'Registered').length;
  const pendingCount = participants.filter(p => p.status === 'Pending').length;
  const sel = selected.size;

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
    widgetCard: (span, gradient = 'none') => ({
      background: gradient !== 'none' ? gradient : '#fff',
      border: `1.5px solid ${colors.borderSoft}`,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      gridColumn: isMobile ? 'span 1' : `span ${span}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28), box-shadow 0.3s ease',
      cursor: 'default',
    }),
    iconWrapper: (bg, color) => ({
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: bg,
      color: color,
      display: 'grid',
      placeItems: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    }),
    statLabel: {
      fontSize: '11px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.inkMuted,
    },
    statValue: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '32px',
      fontWeight: '900',
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
      marginBottom: '80px',
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
    searchInputWrapper: {
      position: 'relative',
      width: isMobile ? '100%' : '240px',
    },
    searchInput: {
      width: '100%',
      height: '40px',
      padding: '0 16px 0 40px',
      background: colors.pageBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '100px',
      fontSize: '14px',
      color: colors.navy,
      outline: 'none',
      transition: 'all 0.2s',
      fontFamily: "'Inter', sans-serif",
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
      transition: 'all 0.2s',
    }),
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
    modalContainer: (maxWidth = '600px') => ({
      background: '#fff',
      borderRadius: '22px',
      width: '100%',
      maxWidth: maxWidth,
      boxShadow: '0 16px 48px rgba(26,24,20,0.12)',
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
    floatingToolbar: {
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      background: 'rgba(15,23,42,0.92)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '18px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
      color: '#fff',
      animation: 'undoSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    },
  };

  if (eventsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: '12px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Loading participants…</p>
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

  return (
    <>
      {/* ── Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Participants</h1>
          <p style={styles.pageDescription}>Manage competitors for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              style={styles.btn(activeBtnHover === 'import')}
              onMouseEnter={() => setActiveBtnHover('import')}
              onMouseLeave={() => setActiveBtnHover(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload_file</span>
              Import CSV
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileImport} />
            </label>
            <button 
              style={styles.btn(activeBtnHover === 'csv-help')}
              onClick={() => setShowCsvHelp(true)}
              onMouseEnter={() => setActiveBtnHover('csv-help')}
              onMouseLeave={() => setActiveBtnHover(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>help</span>
              Format Guide
            </button>
          </div>
          <button
            style={styles.btn(activeBtnHover === 'invite', true)}
            onMouseEnter={() => setActiveBtnHover('invite')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => setShowInviteModal(true)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>person_add</span>
            Invite Participant
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={styles.dashboardGrid}>
        <div style={{ ...styles.widgetCard(4, `linear-gradient(135deg, #fff 40%, ${colors.accentBg} 100%)`), transform: activeBtnHover === 'kpi-t' ? 'translateY(-4px)' : 'none', boxShadow: activeBtnHover === 'kpi-t' ? '0 12px 30px rgba(0,0,0,0.06)' : styles.widgetCard(4).boxShadow }} onMouseEnter={() => setActiveBtnHover('kpi-t')} onMouseLeave={() => setActiveBtnHover(null)}>
          <div style={styles.iconWrapper(colors.accentBg, colors.accent)}><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>groups</span></div>
          <span style={styles.statLabel}>Total</span>
          <div style={styles.statValue}>{participants.length}</div>
        </div>
        <div style={{ ...styles.widgetCard(4, 'linear-gradient(135deg, #fff 40%, #F0FDF4 100%)'), transform: activeBtnHover === 'kpi-r' ? 'translateY(-4px)' : 'none', boxShadow: activeBtnHover === 'kpi-r' ? '0 12px 30px rgba(0,0,0,0.06)' : styles.widgetCard(4).boxShadow }} onMouseEnter={() => setActiveBtnHover('kpi-r')} onMouseLeave={() => setActiveBtnHover(null)}>
          <div style={styles.iconWrapper('#F0FDF4', colors.success)}><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>how_to_reg</span></div>
          <span style={styles.statLabel}>Registered</span>
          <div style={{ ...styles.statValue, color: colors.success }}>{registered}</div>
        </div>
        <div style={{ ...styles.widgetCard(4, 'linear-gradient(135deg, #fff 40%, #FFF7ED 100%)'), transform: activeBtnHover === 'kpi-p' ? 'translateY(-4px)' : 'none', boxShadow: activeBtnHover === 'kpi-p' ? '0 12px 30px rgba(0,0,0,0.06)' : styles.widgetCard(4).boxShadow }} onMouseEnter={() => setActiveBtnHover('kpi-p')} onMouseLeave={() => setActiveBtnHover(null)}>
          <div style={styles.iconWrapper('#FFF7ED', '#D97706')}><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>person_outline</span></div>
          <span style={styles.statLabel}>Pending Invite</span>
          <div style={{ ...styles.statValue, color: '#D97706' }}>{pendingCount}</div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Participant List ({participants.length})</h3>
          <div style={styles.searchInputWrapper}>
            <span className="material-symbols-rounded" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: colors.inkMuted, pointerEvents: 'none' }}>search</span>
            <input type="text" placeholder="Filter..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
              onFocus={e => { e.target.style.borderColor = colors.accent; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; }}
              onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.background = colors.pageBg; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '48px' }}>
                  <input type="checkbox" checked={allChecked} ref={el => el && (el.indeterminate = someChecked && !allChecked)}
                    onChange={toggleAll} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: colors.accent }} />
                </th>
                <th style={styles.th}>Participant</th>
                <th style={styles.th}>Email</th>
                <th style={{ ...styles.th, cursor: 'help' }} title="Click any cell below to edit">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Team / Affiliation
                    <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent, opacity: 0.7 }}>edit</span>
                  </div>
                </th>
                <th style={styles.th}>Score</th>
                <th style={{ ...styles.th, cursor: 'help' }} title="Click any cell below to edit">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Status
                  </div>
                </th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '72px', textAlign: 'center' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '16px' }}>groups_2</span>
                  <span style={{ color: colors.inkMuted, fontSize: '15px' }}>
                    {participants.length === 0 ? 'No participants yet. Invite some!' : 'No results match your search.'}
                  </span>
                </td></tr>
              ) : filtered.map(p => {
                const isSel = selected.has(p.id);
                return (
                  <tr
                    key={p.id}
                    style={{ background: isSel ? 'rgba(59,130,246,0.04)' : (hoveredRow === p.id ? colors.pageBg : 'transparent'), transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredRow(p.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(p.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: colors.accent }} />
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.userAvatar(34, 11, isSel ? colors.accent : colors.accentBg, isSel ? '#fff' : colors.accentDeep)}>
                          {initials(p.name)}
                        </div>
                        <span style={{ fontWeight: 700, color: colors.navy, fontSize: '14px' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '13px' }}>{p.email}</td>
                    <td style={styles.td}>
                      <EditableCell
                        value={p.team}
                        options={knownTeams.length > 0 ? knownTeams : undefined}
                        onSave={val => { updateParticipant(selectedEvent.id, p.id, { team: val }); showToast('Team updated.', 'success'); }}
                        placeholder="— assign team —"
                      />
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '17px', color: p.score != null ? colors.navy : colors.inkMuted }}>
                        {p.score ?? '—'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button style={styles.btnIcon(activeBtnHover === `vp-${p.id}`)} title="View Profile" onClick={() => setViewParticipant(p)} onMouseEnter={() => setActiveBtnHover(`vp-${p.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>account_circle</span>
                        </button>
                        {p.status === 'Pending' && (
                          <button style={styles.btnIcon(activeBtnHover === `ri-${p.id}`)} title="Resend Invite" onClick={() => showToast(`Resent invite to ${p.email}.`, 'info')} onMouseEnter={() => setActiveBtnHover(`ri-${p.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>mail</span>
                          </button>
                        )}
                        <button style={styles.btnIcon(activeBtnHover === `rm-${p.id}`, true)} title="Remove" onClick={() => setConfirmKick(p)} onMouseEnter={() => setActiveBtnHover(`rm-${p.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>person_remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ FLOATING SELECTION TOOLBAR ══ */}
      {sel > 0 && (
        <div style={styles.floatingToolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.15)', marginRight: '4px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: colors.accent, display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800 }}>{sel}</div>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>selected</span>
          </div>
          {[
            { icon: 'group_work', label: 'Set Team', action: () => { setShowBulkTeam(true); setBulkTeamVal(''); }, id: 'bulk-team' },
            { icon: 'check_circle', label: 'Mark Registered', action: () => { [...selected].forEach(id => updateParticipant(selectedEvent.id, id, { status: 'Registered' })); showToast(`Marked ${sel} as Registered.`, 'success'); setSelected(new Set()); }, id: 'bulk-reg' },
          ].map(a => (
            <button key={a.id} onClick={a.action} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeBtnHover === a.id ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e2e8f0', padding: '7px 14px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={() => setActiveBtnHover(a.id)}
              onMouseLeave={() => setActiveBtnHover(null)}>
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
          <button onClick={() => doRemove([...selected])}
            onMouseEnter={() => setActiveBtnHover('bulk-rm')}
            onMouseLeave={() => setActiveBtnHover(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeBtnHover === 'bulk-rm' ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#FCA5A5', padding: '7px 14px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
            Remove
          </button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
          <button
            onClick={() => setSelected(new Set())}
            onMouseEnter={() => setActiveBtnHover('bulk-close')}
            onMouseLeave={() => setActiveBtnHover(null)}
            style={{
              background: activeBtnHover === 'bulk-close' ? 'rgba(255,255,255,0.1)' : 'none',
              border: 'none', color: activeBtnHover === 'bulk-close' ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', padding: '6px', display: 'grid', placeItems: 'center', borderRadius: '8px', transition: 'all 0.15s'
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}

      {/* ── INVITE MODAL ── */}
      {showInviteModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowInviteModal(false); setPending([]); setUserSearch(''); }}>
          <div style={styles.modalContainer('600px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '28px 32px 20px', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={styles.modalTitle}>Invite Participants</h2>
                  <p style={{ fontSize: '14px', color: colors.inkMuted, marginTop: '6px', margin: 0 }}>Search, add to list, then send all invites at once.</p>
                </div>
                <button style={styles.btnIcon(activeBtnHover === 'modal-close')} onClick={() => { setShowInviteModal(false); setPending([]); setUserSearch(''); }} onMouseEnter={() => setActiveBtnHover('modal-close')} onMouseLeave={() => setActiveBtnHover(null)}>
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
              <div style={{ position: 'relative', marginTop: '20px' }}>
                <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: colors.inkMuted, pointerEvents: 'none' }}>search</span>
                <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  style={{ ...styles.searchInput, width: '100%', background: '#fff', paddingLeft: '44px' }}
                  autoFocus
                  onFocus={e => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; }}
                  onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto', borderBottom: `1px solid ${colors.borderSoft}` }}>
              {userSearch.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: colors.inkMuted }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', opacity: 0.3 }}>person_search</span>
                  Type a name or email to find participants.
                </div>
              ) : poolResults.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: colors.inkMuted }}>No users found for "<strong>{userSearch}</strong>".</div>
              ) : poolResults.map(u => (
                <div
                  key={u.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 32px', borderBottom: `1px solid ${colors.borderSoft}`, transition: 'background 0.2s', background: hoveredRow === u.id ? colors.pageBg : 'transparent' }}
                  onMouseEnter={() => setHoveredRow(u.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div style={styles.userAvatar(36, 12)}>{initials(u.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: colors.navy }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: colors.inkMuted }}>{u.email} · {u.team}</div>
                  </div>
                  <button onClick={() => addToPending(u)} onMouseEnter={() => setActiveBtnHover(`add-${u.id}`)} onMouseLeave={() => setActiveBtnHover(null)} style={{ ...styles.btn(activeBtnHover === `add-${u.id}`, true), padding: '6px 14px', height: '34px', fontSize: '12.5px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span> Add
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 32px', background: colors.pageBg, borderBottom: `1px solid ${colors.borderSoft}`, minHeight: '60px' }}>
              {pending.length === 0 ? (
                <p style={{ fontSize: '13px', color: colors.inkMuted, textAlign: 'center', margin: '4px 0' }}>Added participants will appear here.</p>
              ) : (
                <>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '10px', letterSpacing: '0.05em' }}>To be invited ({pending.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {pending.map(u => (
                      <div key={u.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '100px', padding: '4px 10px 4px 6px' }}>
                        <div style={styles.userAvatar(22, 8)}>{initials(u.name)}</div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.navy }}>{u.name}</span>
                        <button onClick={() => removeFromPending(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.inkMuted, padding: 0, display: 'grid', placeItems: 'center', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = colors.coral} onMouseLeave={e => e.currentTarget.style.color = colors.inkMuted}>
                          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '20px 32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={styles.btn(activeBtnHover === 'cancel-invite')} onClick={() => { setShowInviteModal(false); setPending([]); setUserSearch(''); }} onMouseEnter={() => setActiveBtnHover('cancel-invite')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
              <button
                style={styles.btn(activeBtnHover === 'confirm-invite', true)}
                disabled={pending.length === 0}
                onClick={handleBulkAdd}
                onMouseEnter={() => setActiveBtnHover('confirm-invite')}
                onMouseLeave={() => setActiveBtnHover(null)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>send</span>
                Send Invites ({pending.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CSV HELP MODAL ══ */}
      {showCsvHelp && (
        <div style={styles.modalOverlay} onClick={() => setShowCsvHelp(false)}>
          <div style={styles.modalContainer('540px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={styles.modalTitle}>CSV Import Guide</h2>
                  <p style={{ fontSize: '14px', color: colors.inkMuted, marginTop: '6px', margin: 0 }}>Ensure your file has these exact column headers.</p>
                </div>
                <button style={styles.btnIcon(activeBtnHover === 'help-close')} onClick={() => setShowCsvHelp(false)} onMouseEnter={() => setActiveBtnHover('help-close')} onMouseLeave={() => setActiveBtnHover(null)}>
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>

              <div style={{ background: colors.pageBg, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.borderSoft}`, marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.inkMuted, marginBottom: '12px' }}>Required Columns</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['name', 'email', 'team'].map(col => (
                    <code key={col} style={{ background: '#fff', border: `1px solid ${colors.border}`, padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: colors.navy }}>{col}</code>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.inkMuted, marginBottom: '12px' }}>Sample Data</div>
              <div style={{ border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: colors.pageBg }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${colors.borderSoft}`, color: colors.inkMuted }}>name</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${colors.borderSoft}`, color: colors.inkMuted }}>email</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${colors.borderSoft}`, color: colors.inkMuted }}>team</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${colors.borderSoft}`, color: colors.navy, fontWeight: 500 }}>Lapu-Lapu</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${colors.borderSoft}` }}>lapu@mactan.ph</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${colors.borderSoft}` }}>Kadato-an Warriors</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', color: colors.navy, fontWeight: 500 }}>Diego Cera</td>
                      <td style={{ padding: '10px 14px' }}>diego@manila.ph</td>
                      <td style={{ padding: '10px 14px' }}>Tondo FC</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  style={styles.btn(activeBtnHover === 'help-ok', true)} 
                  onClick={() => setShowCsvHelp(false)}
                  onMouseEnter={() => setActiveBtnHover('help-ok')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ BULK TEAM MODAL ══ */}
      {showBulkTeam && (
        <div style={styles.modalOverlay} onClick={() => setShowBulkTeam(false)}>
          <div style={styles.modalContainer('400px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px' }}>
              <h2 style={styles.modalTitle}>Set Team</h2>
              <p style={{ fontSize: '14px', color: colors.inkMuted, marginTop: '6px', marginBottom: '24px' }}>Applying to <strong>{sel}</strong> selected participant(s).</p>

              <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '8px', display: 'block' }}>Team Name</label>
              <input type="text" list="team-dl" placeholder="Type or choose a team…"
                value={bulkTeamVal} onChange={e => setBulkTeamVal(e.target.value)}
                style={{ ...styles.searchInput, width: '100%', background: colors.pageBg, paddingLeft: '16px' }}
                onKeyDown={e => e.key === 'Enter' && handleBulkTeam()}
                autoFocus
                onFocus={e => { e.target.style.borderColor = colors.accent; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; }}
                onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.background = colors.pageBg; e.target.style.boxShadow = 'none'; }}
              />
              <datalist id="team-dl">{knownTeams.map(t => <option key={t} value={t} />)}</datalist>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button style={styles.btn(activeBtnHover === 'cancel-bulk')} onClick={() => setShowBulkTeam(false)} onMouseEnter={() => setActiveBtnHover('cancel-bulk')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
                <button
                  style={styles.btn(activeBtnHover === 'apply-bulk', true)}
                  disabled={!bulkTeamVal.trim()}
                  onClick={handleBulkTeam}
                  onMouseEnter={() => setActiveBtnHover('apply-bulk')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>group_work</span> Apply Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW PROFILE MODAL ══ */}
      {viewParticipant && (
        <div style={styles.modalOverlay} onClick={() => setViewParticipant(null)}>
          <div style={styles.modalContainer('400px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '40px 32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ ...styles.userAvatar(72, 24), margin: '0 auto 16px' }}>{initials(viewParticipant.name)}</div>
                <h2 style={{ ...styles.modalTitle, marginBottom: '4px' }}>{viewParticipant.name}</h2>
                <p style={{ color: colors.inkMuted, fontSize: '14px', margin: 0 }}>{viewParticipant.team}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ label: 'Email', value: viewParticipant.email, icon: 'mail' }, { label: 'Status', value: viewParticipant.status, icon: 'verified' }, { label: 'Score', value: viewParticipant.score ?? 'Not scored', icon: 'analytics' }].map(({ label, value, icon }) => (
                  <div key={label} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', background: colors.pageBg, borderRadius: '14px', border: `1px solid ${colors.borderSoft}` }}>
                    <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: colors.inkMuted, letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: colors.navy }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button style={{ ...styles.btn(activeBtnHover === 'close-vp'), flex: 1 }} onClick={() => setViewParticipant(null)} onMouseEnter={() => setActiveBtnHover('close-vp')} onMouseLeave={() => setActiveBtnHover(null)}>Close</button>
                <button style={{ ...styles.btn(activeBtnHover === 'kick-vp', true), flex: 1, background: colors.coral }} onClick={() => { setConfirmKick(viewParticipant); setViewParticipant(null); }} onMouseEnter={() => setActiveBtnHover('kick-vp')} onMouseLeave={() => setActiveBtnHover(null)}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ REMOVE CONFIRM ══ */}
      {confirmKick && (
        <div style={styles.modalOverlay} onClick={() => setConfirmKick(null)}>
          <div style={styles.modalContainer('420px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px' }}>
              <h2 style={styles.modalTitle}>Remove Participant?</h2>
              <p style={{ fontSize: '14px', color: colors.inkSoft, marginTop: '8px', lineHeight: '1.5' }}>
                "<strong>{confirmKick.name}</strong>" will be removed from this event. You will have 5 seconds to undo this action.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button style={styles.btn(activeBtnHover === 'cancel-kick')} onClick={() => setConfirmKick(null)} onMouseEnter={() => setActiveBtnHover('cancel-kick')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
                <button
                  style={{ ...styles.btn(activeBtnHover === 'confirm-kick', true), background: colors.coral }}
                  onClick={() => { doRemove([confirmKick.id]); setConfirmKick(null); }}
                  onMouseEnter={() => setActiveBtnHover('confirm-kick')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                >
                  Remove Participant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {undo.bar}
    </>
  );
}
