import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';

/* ─── data ──────────────────────────────────────────────────────────────── */
const JUDGE_POOL = [
  { id: 8001, name: 'Dr. Margarita del Pilar', expertise: 'Literature',       email: 'mdelpilar@ateneo.ph' },
  { id: 8002, name: 'Prof. Ben Aguinaldo',      expertise: 'Engineering',     email: 'ben@up.edu.ph' },
  { id: 8003, name: 'Atty. Verna Reyes',        expertise: 'Governance',      email: 'vreyes@ust.edu.ph' },
  { id: 8004, name: 'Coach Ramon Torres',       expertise: 'Athletics',       email: 'rtorres@psa.gov.ph' },
  { id: 8005, name: 'Ms. Felicia Cruz',         expertise: 'Performing Arts', email: 'fcruz@feu.edu.ph' },
  { id: 8006, name: 'Dr. Salvador Luna',        expertise: 'Science',         email: 'sluna@dlsu.edu.ph' },
];

const ROLES = ['Line Judge', 'Technical Judge', 'Head Judge', 'Guest / Celebrity Judge'];
const RSVPS = ['Pending', 'Accepted', 'Declined'];

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

/* ─── EditableCell ───────────────────────────────────────────────────────── */
function EditableCell({ value, options, onSave, placeholder = '— click to edit —' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const [hovered, setHovered] = useState(false);

  const commit = () => { if (draft !== value) onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing && options) return (
    <select autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => e.key === 'Escape' && cancel()}
      style={{ fontSize: '13px', padding: '5px 10px', border: '2px solid var(--accent)', borderRadius: '8px', outline: 'none', background: '#fff', fontFamily: 'var(--font-main)', boxShadow: '0 0 0 3px var(--accent-glow)' }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  if (editing) return (
    <input autoFocus type="text" value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
      style={{ fontSize: '13px', padding: '5px 10px', border: '2px solid var(--accent)', borderRadius: '8px', width: '150px', outline: 'none', fontFamily: 'var(--font-main)', boxShadow: '0 0 0 3px var(--accent-glow)' }} />
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
      <span style={{ fontSize: '13px', color: value ? 'var(--ink-mid)' : 'var(--ink-muted)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || placeholder}
      </span>
      <span className="material-symbols-rounded" style={{ fontSize: '13px', color: hovered ? 'var(--accent)' : 'transparent', transition: 'color 0.15s', flexShrink: 0 }}>edit</span>
    </div>
  );
}

/* ─── RSVP badge (inline editable) ────────────────────────────────────── */
function RsvpCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const colors = { Accepted: { bg: '#DCFCE7', color: '#166534' }, Pending: { bg: '#FEF3C7', color: '#92400E' }, Declined: { bg: '#FEE2E2', color: '#991B1B' } };
  const c = colors[value] || colors.Pending;

  if (editing) return (
    <select autoFocus value={value}
      onChange={e => { onSave(e.target.value); setEditing(false); }}
      onBlur={() => setEditing(false)}
      style={{ fontSize: '12px', padding: '4px 8px', border: '2px solid var(--accent)', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-main)', boxShadow: '0 0 0 3px var(--accent-glow)' }}>
      {RSVPS.map(r => <option key={r}>{r}</option>)}
    </select>
  );

  return (
    <span onClick={() => setEditing(true)} title="Click to change RSVP"
      className="status-badge"
      style={{ background: c.bg, color: c.color, cursor: 'pointer', transition: 'opacity 0.15s', userSelect: 'none' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {value}
      <span className="material-symbols-rounded" style={{ fontSize: '12px', marginLeft: '4px', opacity: 0.6 }}>expand_more</span>
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
    <div className="notification-container">
      <div className="notification-pill pill-info" style={{ '--duration': '5s' }}>
        <div className="pill-icon info">
          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>info</span>
        </div>
        <span className="pill-message">{message}</span>
        <button className="pill-action-btn" onClick={onUndo}>Undo</button>
        <button className="pill-close-btn" onClick={onDismiss}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
        </button>
        <div className="pill-progress">
          <div className="pill-progress-bar" style={{ width: `${progress}%`, animation: 'none' }} />
        </div>
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
  const doUndo  = useCallback(() => { state?.fn?.(); dismiss(); }, [state, dismiss]);
  const bar = state ? <UndoBar message={state.msg} onUndo={doUndo} onDismiss={dismiss} /> : null;
  return { show, bar };
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function JudgesPage() {
  const { selectedEvent, judges, addJudge, removeJudge, updateJudge, showToast } = useEventContext();
  const undo = useUndo();

  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [judgeSearch, setJudgeSearch]   = useState('');
  const [pending, setPending]           = useState([]);
  const [pendingRoles, setPendingRoles] = useState({});
  const [viewJudge, setViewJudge]       = useState(null);
  const [confirmRev, setConfirmRev]     = useState(null);
  const [showBulkRole, setShowBulkRole] = useState(false);
  const [bulkRoleVal, setBulkRoleVal]   = useState(ROLES[0]);

  const filtered = judges.filter(j =>
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    (j.expertise || '').toLowerCase().includes(search.toLowerCase())
  );

  const allChecked  = filtered.length > 0 && filtered.every(j => selected.has(j.id));
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

  const addToPending     = u => { setPending(p => [...p, u]); setPendingRoles(r => ({ ...r, [u.id]: ROLES[0] })); };
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

  const accepted    = judges.filter(j => j.rsvp === 'Accepted').length;
  const pendingCount = judges.filter(j => j.rsvp === 'Pending').length;
  const sel         = selected.size;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Judges</h1>
          <p className="page-description">Manage evaluators for <strong style={{ color: 'var(--navy)' }}>{selectedEvent.name}</strong>.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="secondary-btn" style={{ cursor: 'pointer', height: '42px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload_file</span>
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileImport} />
          </label>
          <button className="primary-btn" style={{ height: '42px' }} onClick={() => setShowInviteModal(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>person_add</span>
            Invite Judge
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '28px' }}>
        <div className="widget-card col-span-4"><span className="stat-label">Total Invited</span><div className="stat-value">{judges.length}</div></div>
        <div className="widget-card col-span-4"><span className="stat-label">Accepted</span><div className="stat-value" style={{ color: 'var(--sage)' }}>{accepted}</div></div>
        <div className="widget-card col-span-4"><span className="stat-label">Pending RSVP</span><div className="stat-value" style={{ color: '#D97706' }}>{pendingCount}</div></div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3 style={{ margin: 0 }}>Judge Panel ({judges.length})</h3>
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <span className="material-symbols-rounded" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--ink-muted)' }}>search</span>
            <input type="text" className="custom-input" placeholder="Filter..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', height: '38px', borderRadius: '100px', width: '210px' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '48px' }}>
                  <input type="checkbox" checked={allChecked} ref={el => el && (el.indeterminate = someChecked && !allChecked)}
                    onChange={toggleAll} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                </th>
                <th>Judge</th>
                <th>Email</th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Expertise
                    <span className="material-symbols-rounded" style={{ fontSize: '13px', color: 'var(--accent)', opacity: 0.7 }}>edit</span>
                  </span>
                </th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Role
                    <span className="material-symbols-rounded" style={{ fontSize: '13px', color: 'var(--accent)', opacity: 0.7 }}>edit</span>
                  </span>
                </th>
                <th>RSVP</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '72px', textAlign: 'center' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '40px', color: 'var(--border)', display: 'block', marginBottom: '10px' }}>gavel</span>
                  <span style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>
                    {judges.length === 0 ? 'No judges invited yet.' : 'No results match.'}
                  </span>
                </td></tr>
              ) : filtered.map(j => {
                const isSel = selected.has(j.id);
                return (
                  <tr key={j.id} style={{ background: isSel ? 'rgba(59,130,246,0.05)' : '', transition: 'background 0.15s' }}>
                    <td>
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(j.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '11px', flexShrink: 0, background: isSel ? 'var(--accent)' : 'var(--accent-bg)', color: isSel ? '#fff' : 'var(--accent-deep)', transition: 'all 0.2s' }}>
                          {initials(j.name)}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '14px' }}>{j.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink-mid)', fontSize: '13px' }}>{j.email || '—'}</td>
                    <td>
                      <EditableCell value={j.expertise} onSave={val => { updateJudge(selectedEvent.id, j.id, { expertise: val }); showToast('Expertise updated.', 'success'); }} placeholder="— add expertise —" />
                    </td>
                    <td>
                      <EditableCell value={j.role} options={ROLES} onSave={val => updateJudge(selectedEvent.id, j.id, { role: val })} />
                    </td>
                    <td>
                      <RsvpCell value={j.rsvp || j.status || 'Pending'} onSave={val => updateJudge(selectedEvent.id, j.id, { rsvp: val, status: val })} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" title="View Details" onClick={() => setViewJudge(j)}>
                          <span className="material-symbols-rounded">person</span>
                        </button>
                        {(j.rsvp || j.status) === 'Pending' && (
                          <button className="btn-icon" title="Resend Invite" onClick={() => showToast(`Resent invite to ${j.name}.`, 'info')}>
                            <span className="material-symbols-rounded">mail</span>
                          </button>
                        )}
                        <button className="btn-icon" title="Revoke" style={{ color: 'var(--coral)' }} onClick={() => setConfirmRev(j)}>
                          <span className="material-symbols-rounded">block</span>
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
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, animation: 'undoSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px',
            background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)', color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '10px', borderRight: '1px solid rgba(255,255,255,0.15)', marginRight: '4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800 }}>{sel}</div>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>selected</span>
            </div>
            {[
              { icon: 'badge', label: 'Set Role', action: () => setShowBulkRole(true) },
              { icon: 'check_circle', label: 'Mark Accepted', action: () => { [...selected].forEach(id => updateJudge(selectedEvent.id, id, { rsvp: 'Accepted', status: 'Accepted' })); showToast(`Accepted ${sel} judge(s).`, 'success'); setSelected(new Set()); } },
              { icon: 'mail', label: 'Resend Invite', action: () => { showToast(`Resent ${sel} invite(s).`, 'info'); setSelected(new Set()); } },
            ].map(a => (
              <button key={a.label} onClick={a.action} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', padding: '7px 14px', borderRadius: '10px',
                fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
            <button onClick={() => doRevoke([...selected])} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#FCA5A5', padding: '7px 14px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.35)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}>
              <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>block</span>
              Revoke
            </button>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
            <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '6px', display: 'grid', placeItems: 'center', borderRadius: '8px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        </div>
      )}

      {/* ══ INVITE MODAL ══ */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Invite Judges</h2>
                  <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>Search by name or expertise, assign roles, then send all invites at once.</p>
                </div>
                <button className="btn-icon" onClick={closeModal}><span className="material-symbols-rounded">close</span></button>
              </div>
              <div style={{ position: 'relative', marginTop: '16px' }}>
                <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--ink-muted)' }}>search</span>
                <input type="text" placeholder="Search by name or expertise..." value={judgeSearch} onChange={e => setJudgeSearch(e.target.value)} className="custom-input" style={{ paddingLeft: '44px' }} autoFocus />
              </div>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto', borderBottom: '1px solid var(--border-soft)' }}>
              {judgeSearch.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '28px', display: 'block', marginBottom: '6px', opacity: .3 }}>person_search</span>
                  Type to search for judges.
                </div>
              ) : poolResults.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-muted)' }}>No judges found for "<strong>{judgeSearch}</strong>".</div>
              ) : poolResults.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 24px', borderBottom: '1px solid var(--border-soft)', transition: 'background var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '12px', flexShrink: 0 }}>{initials(u.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{u.expertise} · {u.email}</div>
                  </div>
                  <button className="primary-btn" style={{ padding: '7px 16px', fontSize: '13px' }} onClick={() => addToPending(u)}>
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>add</span> Add
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 24px', background: 'var(--page-bg)', borderBottom: '1px solid var(--border-soft)', minHeight: '60px' }}>
              {pending.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center', margin: 0 }}>Added judges appear here — assign roles before sending.</p>
              ) : (
                <>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px' }}>To be invited ({pending.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pending.map(u => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', padding: '9px 14px' }}>
                        <div className="user-avatar" style={{ width: '26px', height: '26px', fontSize: '9px', flexShrink: 0 }}>{initials(u.name)}</div>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, flex: 1, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                        <select className="custom-input" style={{ width: '180px', padding: '5px 10px', fontSize: '12.5px', height: 'auto', flexShrink: 0 }}
                          value={pendingRoles[u.id] || ROLES[0]} onChange={e => setPendingRoles(r => ({ ...r, [u.id]: e.target.value }))}>
                          {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <button onClick={() => removeFromPending(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)', padding: 0, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="secondary-btn" onClick={closeModal}>Cancel</button>
              <button className="primary-btn" disabled={pending.length === 0} onClick={handleBulkInvite}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>send</span>
                Send Invites ({pending.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BULK ROLE MODAL ══ */}
      {showBulkRole && (
        <div className="modal-overlay" onClick={() => setShowBulkRole(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 className="modal-title">Set Role</h2>
            <p className="modal-sub">Applying to <strong>{sel}</strong> selected judge(s).</p>
            <label className="custom-label">Role</label>
            <select className="custom-input" value={bulkRoleVal} onChange={e => setBulkRoleVal(e.target.value)} autoFocus>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="secondary-btn" onClick={() => setShowBulkRole(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleBulkRole}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>badge</span> Apply Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW JUDGE MODAL ══ */}
      {viewJudge && (
        <div className="modal-overlay" onClick={() => setViewJudge(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="user-avatar" style={{ width: '72px', height: '72px', fontSize: '24px', margin: '0 auto 14px' }}>{initials(viewJudge.name)}</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '22px', color: 'var(--navy)', marginBottom: '4px' }}>{viewJudge.name}</h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: '13px' }}>{viewJudge.role}</p>
            </div>
            {[{ label: 'Email', value: viewJudge.email || '—', icon: 'mail' }, { label: 'Expertise', value: viewJudge.expertise, icon: 'school' }, { label: 'RSVP', value: viewJudge.rsvp || viewJudge.status || 'Pending', icon: 'info' }].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'var(--page-bg)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '18px' }}>{icon}</span>
                <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)' }}>{value}</div></div>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewJudge(null)}>Close</button>
              <button className="primary-btn" style={{ flex: 1, justifyContent: 'center', background: '#DC2626' }} onClick={() => { setConfirmRev(viewJudge); setViewJudge(null); }}>Revoke Access</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ REVOKE CONFIRM ══ */}
      {confirmRev && (
        <div className="modal-overlay" onClick={() => setConfirmRev(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h2 className="modal-title">Revoke Access?</h2>
            <p className="modal-sub">"<strong>{confirmRev.name}</strong>" will lose scoring access. You get 5 seconds to undo.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setConfirmRev(null)}>Cancel</button>
              <button className="primary-btn" style={{ background: '#DC2626' }} onClick={() => { doRevoke([confirmRev.id]); setConfirmRev(null); }}>Revoke</button>
            </div>
          </div>
        </div>
      )}

      {undo.bar}
    </>
  );
}
