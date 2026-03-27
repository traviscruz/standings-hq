import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

/* ─── data ──────────────────────────────────────────────────────────────── */
const JUDGE_POOL = [
  { id: 8001, name: 'Dr. Margarita del Pilar', expertise: 'Literature', email: 'mdelpilar@ateneo.ph' },
  { id: 8002, name: 'Prof. Ben Aguinaldo', expertise: 'Engineering', email: 'ben@up.edu.ph' },
  { id: 8003, name: 'Atty. Verna Reyes', expertise: 'Governance', email: 'vreyes@ust.edu.ph' },
  { id: 8004, name: 'Coach Ramon Torres', expertise: 'Athletics', email: 'rtorres@psa.gov.ph' },
  { id: 8005, name: 'Ms. Felicia Cruz', expertise: 'Performing Arts', email: 'fcruz@feu.edu.ph' },
  { id: 8006, name: 'Dr. Salvador Luna', expertise: 'Science', email: 'sluna@dlsu.edu.ph' },
];

const ROLES = ['Line Judge', 'Technical Judge', 'Head Judge', 'Guest / Celebrity Judge'];
const RSVPS = ['Pending', 'Accepted', 'Declined'];

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

/* ─── EditableCell ───────────────────────────────────────────────────────── */
function EditableCell({ value, options, onSave, placeholder = '— click to edit —' }) {
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
    <input autoFocus type="text" value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
      style={{ fontSize: '13px', padding: '5px 10px', border: `2px solid ${colors.accent}`, borderRadius: '8px', width: '150px', outline: 'none', fontFamily: "'Inter', sans-serif", boxShadow: `0 0 0 3px ${colors.accentGlow}` }} />
  );

  return (
    <div onClick={() => { setDraft(value); setEditing(true); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Click to edit"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 9px', borderRadius: '8px', cursor: 'pointer',
        background: hovered ? 'rgba(59,130,246,0.08)' : 'transparent',
        border: `1.5px solid ${hovered ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
        transition: 'all 0.15s',
      }}>
      <span style={{ fontSize: '13px', color: value ? colors.inkMid : colors.inkMuted, fontStyle: value ? 'normal' : 'italic' }}>
        {value || placeholder}
      </span>
      <span className="material-symbols-rounded" style={{ fontSize: '13px', color: hovered ? colors.accent : 'transparent', transition: 'color 0.15s', flexShrink: 0 }}>edit</span>
    </div>
  );
}

/* ─── RSVP badge (inline editable) ────────────────────────────────────── */
function RsvpCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const rsvpColors = { Accepted: { bg: '#DCFCE7', color: '#166534' }, Pending: { bg: '#FEF3C7', color: '#92400E' }, Declined: { bg: '#FEE2E2', color: '#991B1B' } };
  const c = rsvpColors[value] || rsvpColors.Pending;

  if (editing) return (
    <select autoFocus value={value}
      onChange={e => { onSave(e.target.value); setEditing(false); }}
      onBlur={() => setEditing(false)}
      style={{ fontSize: '12px', padding: '4px 8px', border: `2px solid ${colors.accent}`, borderRadius: '8px', outline: 'none', fontFamily: "'Inter', sans-serif", boxShadow: `0 0 0 3px ${colors.accentGlow}` }}>
      {RSVPS.map(r => <option key={r}>{r}</option>)}
    </select>
  );

  return (
    <span onClick={() => setEditing(true)} title="Click to change RSVP"
      style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
        background: c.bg, color: c.color, cursor: 'pointer', transition: 'opacity 0.15s', userSelect: 'none' 
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {value}
      <span className="material-symbols-rounded" style={{ fontSize: '12px', opacity: 0.6 }}>expand_more</span>
    </span>
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

function useUndo() {
  const [state, setState] = useState(null);
  const timerRef = useRef(null);
  const show = useCallback((msg, fn) => {
    clearTimeout(timerRef.current);
    setState({ msg, fn });
    timerRef.current = setTimeout(() => setState(null), 5000);
  }, []);
  const dismiss = useCallback(() => { clearTimeout(timerRef.current); setState(null); }, []);
  const doUndo = useCallback(() => { state?.fn?.(); dismiss(); }, [state, dismiss]);
  const bar = state ? <UndoBar message={state.msg} onUndo={doUndo} onDismiss={dismiss} /> : null;
  return { show, bar };
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function JudgesPage() {
  const { selectedEvent, judges, addJudge, removeJudge, updateJudge, showToast } = useEventContext();
  const undo = useUndo();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [judgeSearch, setJudgeSearch] = useState('');
  const [pending, setPending] = useState([]);
  const [pendingRoles, setPendingRoles] = useState({});
  const [viewJudge, setViewJudge] = useState(null);
  const [confirmRev, setConfirmRev] = useState(null);
  const [showBulkRole, setShowBulkRole] = useState(false);
  const [bulkRoleVal, setBulkRoleVal] = useState(ROLES[0]);

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

  const filtered = judges.filter(j =>
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    (j.expertise || '').toLowerCase().includes(search.toLowerCase())
  );

  const allChecked = filtered.length > 0 && filtered.every(j => selected.has(j.id));
  const someChecked = filtered.some(j => selected.has(j.id));

  const toggleAll = () => allChecked ? setSelected(new Set()) : setSelected(new Set(filtered.map(j => j.id)));
  const toggleOne = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const poolResults = JUDGE_POOL.filter(u =>
    judgeSearch.length > 0 &&
    (u.name.toLowerCase().includes(judgeSearch.toLowerCase()) ||
      u.expertise.toLowerCase().includes(judgeSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(judgeSearch.toLowerCase())) &&
    !judges.find(j => j.id === u.id) && !pending.find(j => j.id === u.id)
  );

  const addToPending = u => { setPending(p => [...p, u]); setPendingRoles(r => ({ ...r, [u.id]: ROLES[0] })); };
  const removeFromPending = id => { setPending(p => p.filter(u => u.id !== id)); setPendingRoles(r => { const n = { ...r }; delete n[id]; return n; }); };

  const handleBulkInvite = () => {
    const ids = pending.map(u => u.id);
    pending.forEach(u => addJudge(selectedEvent.id, { ...u, role: pendingRoles[u.id] || ROLES[0], rsvp: 'Pending' }));
    showToast(`Invited ${pending.length} judge(s).`, 'success', () => {
      ids.forEach(id => removeJudge(selectedEvent.id, id));
      showToast('Invitations revoked.', 'info');
    });
    setPending([]); setPendingRoles({}); setJudgeSearch(''); setShowInviteModal(false);
  };
  const closeModal = () => { setShowInviteModal(false); setPending([]); setPendingRoles({}); setJudgeSearch(''); };

  const doRevoke = ids => {
    const snap = judges.filter(j => ids.includes(j.id));
    ids.forEach(id => removeJudge(selectedEvent.id, id));
    setSelected(new Set());
    undo.show(`${ids.length} judge(s) revoked.`, () => { snap.forEach(j => addJudge(selectedEvent.id, j)); showToast('Restored.', 'success'); });
  };

  const handleBulkRole = () => {
    [...selected].forEach(id => updateJudge(selectedEvent.id, id, { role: bulkRoleVal }));
    showToast(`Role updated for ${selected.size} judge(s).`, 'success');
    setSelected(new Set()); setShowBulkRole(false);
  };

  const handleFileImport = e => {
    const file = e.target.files?.[0]; if (!file) return;
    showToast(`Importing from "${file.name}"...`, 'info');
    setTimeout(() => {
      const newItems = [
        { id: Date.now() + 1, name: 'CSV Judge A', email: 'a@csv.ph', expertise: 'General', role: 'Line Judge', rsvp: 'Pending' },
        { id: Date.now() + 2, name: 'CSV Judge B', email: 'b@csv.ph', expertise: 'General', role: 'Line Judge', rsvp: 'Pending' },
      ];
      const ids = newItems.map(j => j.id);
      newItems.forEach(j => addJudge(selectedEvent.id, j));
      showToast(`Imported ${newItems.length} judges.`, 'success', () => {
        ids.forEach(id => removeJudge(selectedEvent.id, id));
        showToast('Import undone.', 'info');
      });
    }, 800);
    e.target.value = '';
  };

  const accepted = judges.filter(j => j.rsvp === 'Accepted' || j.status === 'Accepted').length;
  const pendingCount = judges.filter(j => j.rsvp === 'Pending' || j.status === 'Pending').length;
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

  return (
    <>
      {/* ── Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Judges</h1>
          <p style={styles.pageDescription}>Manage evaluators for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
            style={styles.btn(activeBtnHover === 'invite', true)} 
            onMouseEnter={() => setActiveBtnHover('invite')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => setShowInviteModal(true)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>person_add</span>
            Invite Judge
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={styles.dashboardGrid}>
        <div style={styles.widgetCard(4)}><span style={styles.statLabel}>Total Invited</span><div style={styles.statValue}>{judges.length}</div></div>
        <div style={styles.widgetCard(4)}><span style={styles.statLabel}>Accepted</span><div style={{ ...styles.statValue, color: colors.success }}>{accepted}</div></div>
        <div style={styles.widgetCard(4)}><span style={styles.statLabel}>Pending RSVP</span><div style={{ ...styles.statValue, color: '#D97706' }}>{pendingCount}</div></div>
      </div>

      {/* ── Table ── */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Judge Panel ({judges.length})</h3>
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
                <th style={styles.th}>Judge</th>
                <th style={styles.th}>Email</th>
                <th style={{ ...styles.th, cursor: 'help' }} title="Click any cell below to edit">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Expertise
                    <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent, opacity: 0.7 }}>edit</span>
                  </div>
                </th>
                <th style={{ ...styles.th, cursor: 'help' }} title="Click any cell below to edit">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Role
                    <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent, opacity: 0.7 }}>edit</span>
                  </div>
                </th>
                <th style={styles.th}>RSVP</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '72px', textAlign: 'center' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '16px' }}>gavel</span>
                  <span style={{ color: colors.inkMuted, fontSize: '15px' }}>
                    {judges.length === 0 ? 'No judges invited yet. Invite some!' : 'No results match your search.'}
                  </span>
                </td></tr>
              ) : filtered.map(j => {
                const isSel = selected.has(j.id);
                return (
                  <tr 
                    key={j.id} 
                    style={{ background: isSel ? 'rgba(59,130,246,0.04)' : (hoveredRow === j.id ? colors.pageBg : 'transparent'), transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredRow(j.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(j.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: colors.accent }} />
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.userAvatar(34, 11, isSel ? colors.accent : colors.accentBg, isSel ? '#fff' : colors.accentDeep)}>
                          {initials(j.name)}
                        </div>
                        <span style={{ fontWeight: 700, color: colors.navy, fontSize: '14px' }}>{j.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '13px' }}>{j.email || '—'}</td>
                    <td style={styles.td}>
                      <EditableCell value={j.expertise} onSave={val => { updateJudge(selectedEvent.id, j.id, { expertise: val }); showToast('Expertise updated.', 'success'); }} placeholder="— add expertise —" />
                    </td>
                    <td style={styles.td}>
                      <EditableCell value={j.role} options={ROLES} onSave={val => updateJudge(selectedEvent.id, j.id, { role: val })} />
                    </td>
                    <td style={styles.td}>
                      <RsvpCell value={j.rsvp || j.status || 'Pending'} onSave={val => updateJudge(selectedEvent.id, j.id, { rsvp: val, status: val })} />
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button style={styles.btnIcon(activeBtnHover === `vj-${j.id}`)} title="View Details" onClick={() => setViewJudge(j)} onMouseEnter={() => setActiveBtnHover(`vj-${j.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>account_circle</span>
                        </button>
                        {(j.rsvp || j.status) === 'Pending' && (
                          <button style={styles.btnIcon(activeBtnHover === `ri-${j.id}`)} title="Resend Invite" onClick={() => showToast(`Resent invite to ${j.name}.`, 'info')} onMouseEnter={() => setActiveBtnHover(`ri-${j.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>mail</span>
                          </button>
                        )}
                        <button style={styles.btnIcon(activeBtnHover === `rev-${j.id}`, true)} title="Revoke" onClick={() => setConfirmRev(j)} onMouseEnter={() => setActiveBtnHover(`rev-${j.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>block</span>
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
            { icon: 'badge', label: 'Set Role', action: () => setShowBulkRole(true), id: 'bulk-role' },
            { icon: 'check_circle', label: 'Mark Accepted', action: () => { [...selected].forEach(id => updateJudge(selectedEvent.id, id, { rsvp: 'Accepted', status: 'Accepted' })); showToast(`Accepted ${sel} judge(s).`, 'success'); setSelected(new Set()); }, id: 'bulk-acc' },
            { icon: 'mail', label: 'Resend Invite', action: () => { showToast(`Resent ${sel} invite(s).`, 'info'); setSelected(new Set()); }, id: 'bulk-mail' },
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
          <button onClick={() => doRevoke([...selected])} 
            onMouseEnter={() => setActiveBtnHover('bulk-rev')}
            onMouseLeave={() => setActiveBtnHover(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: activeBtnHover === 'bulk-rev' ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.2)', 
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#FCA5A5', padding: '7px 14px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>block</span>
            Revoke
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
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContainer('620px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '28px 32px 20px', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={styles.modalTitle}>Invite Judges</h2>
                  <p style={{ fontSize: '14px', color: colors.inkMuted, marginTop: '6px', margin: 0 }}>Search by name or expertise, assign roles, then send all invites at once.</p>
                </div>
                <button style={styles.btnIcon(activeBtnHover === 'modal-close')} onClick={closeModal} onMouseEnter={() => setActiveBtnHover('modal-close')} onMouseLeave={() => setActiveBtnHover(null)}>
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
              <div style={{ position: 'relative', marginTop: '20px' }}>
                <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: colors.inkMuted, pointerEvents: 'none' }}>search</span>
                <input type="text" placeholder="Search by name or expertise..." value={judgeSearch} onChange={e => setJudgeSearch(e.target.value)} 
                  style={{ ...styles.searchInput, width: '100%', background: '#fff', paddingLeft: '44px' }} 
                  autoFocus 
                  onFocus={e => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; }}
                  onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto', borderBottom: `1px solid ${colors.borderSoft}` }}>
              {judgeSearch.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: colors.inkMuted }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', opacity: 0.3 }}>person_search</span>
                  Type to search for judges.
                </div>
              ) : poolResults.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: colors.inkMuted }}>No judges found for "<strong>{judgeSearch}</strong>".</div>
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
                    <div style={{ fontSize: '12px', color: colors.inkMuted }}>{u.expertise} · {u.email}</div>
                  </div>
                  <button onClick={() => addToPending(u)} onMouseEnter={() => setActiveBtnHover(`add-${u.id}`)} onMouseLeave={() => setActiveBtnHover(null)} style={{ ...styles.btn(activeBtnHover === `add-${u.id}`, true), padding: '6px 14px', height: '34px', fontSize: '12.5px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span> Add
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 32px', background: colors.pageBg, borderBottom: `1px solid ${colors.borderSoft}`, minHeight: '60px' }}>
              {pending.length === 0 ? (
                <p style={{ fontSize: '13px', color: colors.inkMuted, textAlign: 'center', margin: '4px 0' }}>Added judges appear here — assign roles before sending.</p>
              ) : (
                <>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '10px', letterSpacing: '0.05em' }}>To be invited ({pending.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pending.map(u => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '14px', padding: '10px 16px' }}>
                        <div style={styles.userAvatar(26, 9)}>{initials(u.name)}</div>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, flex: 1, color: colors.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                        <select 
                          style={{ ...styles.searchInput, width: '160px', height: '32px', padding: '0 8px', fontSize: '12px', background: colors.pageBg }}
                          value={pendingRoles[u.id] || ROLES[0]} onChange={e => setPendingRoles(r => ({ ...r, [u.id]: e.target.value }))}
                        >
                          {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <button onClick={() => removeFromPending(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.inkMuted, padding: 0, display: 'grid', placeItems: 'center', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = colors.coral} onMouseLeave={e => e.currentTarget.style.color = colors.inkMuted}>
                          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close_circle</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '20px 32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={styles.btn(activeBtnHover === 'cancel-invite')} onClick={closeModal} onMouseEnter={() => setActiveBtnHover('cancel-invite')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
              <button 
                style={styles.btn(activeBtnHover === 'confirm-invite', true)} 
                disabled={pending.length === 0} 
                onClick={handleBulkInvite}
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

      {/* ══ BULK ROLE MODAL ══ */}
      {showBulkRole && (
        <div style={styles.modalOverlay} onClick={() => setShowBulkRole(false)}>
          <div style={styles.modalContainer('400px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px' }}>
              <h2 style={styles.modalTitle}>Set Role</h2>
              <p style={{ fontSize: '14px', color: colors.inkMuted, marginTop: '6px', marginBottom: '24px' }}>Applying to <strong>{sel}</strong> selected judge(s).</p>
              
              <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '8px', display: 'block' }}>Role</label>
              <select 
                style={{ ...styles.searchInput, width: '100%', background: colors.pageBg, paddingLeft: '12px' }} 
                value={bulkRoleVal} onChange={e => setBulkRoleVal(e.target.value)} 
                autoFocus
                onFocus={e => { e.target.style.borderColor = colors.accent; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; }}
                onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.background = colors.pageBg; e.target.style.boxShadow = 'none'; }}
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button style={styles.btn(activeBtnHover === 'cancel-bulk')} onClick={() => setShowBulkRole(false)} onMouseEnter={() => setActiveBtnHover('cancel-bulk')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
                <button 
                  style={styles.btn(activeBtnHover === 'apply-bulk', true)} 
                  onClick={handleBulkRole}
                  onMouseEnter={() => setActiveBtnHover('apply-bulk')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>badge</span> Apply Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW JUDGE MODAL ══ */}
      {viewJudge && (
        <div style={styles.modalOverlay} onClick={() => setViewJudge(null)}>
          <div style={styles.modalContainer('400px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '40px 32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ ...styles.userAvatar(72, 24), margin: '0 auto 16px' }}>{initials(viewJudge.name)}</div>
                <h2 style={{ ...styles.modalTitle, marginBottom: '4px' }}>{viewJudge.name}</h2>
                <p style={{ color: colors.inkMuted, fontSize: '14px', margin: 0 }}>{viewJudge.role}</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ label: 'Email', value: viewJudge.email || '—', icon: 'mail' }, { label: 'Expertise', value: viewJudge.expertise, icon: 'school' }, { label: 'RSVP', value: viewJudge.rsvp || viewJudge.status || 'Pending', icon: 'verified' }].map(({ label, value, icon }) => (
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
                <button style={{ ...styles.btn(activeBtnHover === 'close-vj'), flex: 1 }} onClick={() => setViewJudge(null)} onMouseEnter={() => setActiveBtnHover('close-vj')} onMouseLeave={() => setActiveBtnHover(null)}>Close</button>
                <button style={{ ...styles.btn(activeBtnHover === 'kick-vj', true), flex: 1, background: colors.coral }} onClick={() => { setConfirmRev(viewJudge); setViewJudge(null); }} onMouseEnter={() => setActiveBtnHover('kick-vj')} onMouseLeave={() => setActiveBtnHover(null)}>Revoke Access</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ REVOKE CONFIRM ══ */}
      {confirmRev && (
        <div style={styles.modalOverlay} onClick={() => setConfirmRev(null)}>
          <div style={styles.modalContainer('420px')} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px' }}>
              <h2 style={styles.modalTitle}>Revoke Access?</h2>
              <p style={{ fontSize: '14px', color: colors.inkSoft, marginTop: '8px', lineHeight: '1.5' }}>
                "<strong>{confirmRev.name}</strong>" will lose access to score this event. You will have 5 seconds to undo this action.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button style={styles.btn(activeBtnHover === 'cancel-rev')} onClick={() => setConfirmRev(null)} onMouseEnter={() => setActiveBtnHover('cancel-rev')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
                <button 
                  style={{ ...styles.btn(activeBtnHover === 'confirm-rev', true), background: colors.coral }} 
                  onClick={() => { doRevoke([confirmRev.id]); setConfirmRev(null); }}
                  onMouseEnter={() => setActiveBtnHover('confirm-kick')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                >
                  Revoke Access
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
