import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';

/* ─── data ──────────────────────────────────────────────────────────────── */
const USER_POOL = [
  { id: 9001, name: 'Lapu-Lapu',      email: 'lapulapu@mactan.ph', team: 'Kadato-an Warriors' },
  { id: 9002, name: 'Diego Cera',     email: 'diego@manila.ph',    team: 'Tondo FC' },
  { id: 9003, name: 'Rajah Soliman',  email: 'soliman@maynila.ph', team: 'Pasig Royals' },
  { id: 9004, name: 'Tupas',          email: 'tupas@cebu.ph',      team: 'Visayas United' },
  { id: 9005, name: 'Humabon',        email: 'humabon@cebu.ph',    team: 'Visayas United' },
  { id: 9006, name: 'Si Awi',         email: 'siawi@visayas.ph',   team: 'Leyte Eagles' },
  { id: 9007, name: 'Datu Mangal',    email: 'mangal@mindanao.ph', team: 'Southern Stars' },
];

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

/* ─── EditableCell: noticeable edit-cue ─────────────────────────────────── */
function EditableCell({ value, options, onSave, placeholder = '— click to edit —', type = 'text' }) {
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
    <input autoFocus type={type} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
      style={{ fontSize: '13px', padding: '5px 10px', border: '2px solid var(--accent)', borderRadius: '8px', width: '150px', outline: 'none', fontFamily: 'var(--font-main)', boxShadow: '0 0 0 3px var(--accent-glow)' }} />
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
      <span style={{ fontSize: '13px', color: value ? 'var(--ink-mid)' : 'var(--ink-muted)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || placeholder}
      </span>
      <span className="material-symbols-rounded" style={{ fontSize: '13px', color: hovered ? 'var(--accent)' : 'transparent', transition: 'color 0.15s', flexShrink: 0 }}>
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
  const { selectedEvent, participants, addParticipant, removeParticipant, updateParticipant, showToast } = useEventContext();

  const undo = useUndo();

  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [pending, setPending]       = useState([]);
  const [viewParticipant, setViewParticipant] = useState(null);
  const [confirmKick, setConfirmKick]         = useState(null);
  const [showBulkTeam, setShowBulkTeam]       = useState(false);
  const [bulkTeamVal, setBulkTeamVal]         = useState('');

  const knownTeams = [...new Set(participants.map(p => p.team).filter(Boolean))];

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.team || '').toLowerCase().includes(search.toLowerCase())
  );

  const allChecked  = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  const someChecked = filtered.some(p => selected.has(p.id));

  const toggleAll = () => allChecked ? setSelected(new Set()) : setSelected(new Set(filtered.map(p => p.id)));
  const toggleOne = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* ── invite pool ── */
  const poolResults = USER_POOL.filter(u =>
    userSearch.length > 0 &&
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())) &&
    !participants.find(p => p.id === u.id) && !pending.find(p => p.id === u.id)
  );
  const addToPending     = u => setPending(prev => [...prev, u]);
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

  /* ── remove ── */
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

  const registered   = participants.filter(p => p.status === 'Registered').length;
  const pendingCount = participants.filter(p => p.status === 'Pending').length;
  const sel          = selected.size;

  return (
    <>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Participants</h1>
          <p className="page-description">Manage competitors for <strong style={{ color: 'var(--navy)' }}>{selectedEvent.name}</strong>.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="secondary-btn" style={{ cursor: 'pointer', height: '42px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload_file</span>
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileImport} />
          </label>
          <button className="primary-btn" style={{ height: '42px' }} onClick={() => setShowInviteModal(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>person_add</span>
            Invite Participant
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="dashboard-grid" style={{ marginBottom: '28px' }}>
        <div className="widget-card col-span-4"><span className="stat-label">Total</span><div className="stat-value">{participants.length}</div></div>
        <div className="widget-card col-span-4"><span className="stat-label">Registered</span><div className="stat-value" style={{ color: 'var(--sage)' }}>{registered}</div></div>
        <div className="widget-card col-span-4"><span className="stat-label">Pending Invite</span><div className="stat-value" style={{ color: '#D97706' }}>{pendingCount}</div></div>
      </div>

      {/* ── Table ── */}
      <div className="table-container">
        <div className="table-header">
          <h3 style={{ margin: 0 }}>Participant List ({participants.length})</h3>
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
                <th>Participant</th>
                <th>Email</th>
                <th title="Click any cell below to edit">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Team / Affiliation
                    <span className="material-symbols-rounded" style={{ fontSize: '13px', color: 'var(--accent)', opacity: 0.7 }}>edit</span>
                  </span>
                </th>
                <th>Score</th>
                <th title="Click any cell below to edit">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Status
                    <span className="material-symbols-rounded" style={{ fontSize: '13px', color: 'var(--accent)', opacity: 0.7 }}>edit</span>
                  </span>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '72px', textAlign: 'center' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '40px', color: 'var(--border)', display: 'block', marginBottom: '10px' }}>groups</span>
                  <span style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>
                    {participants.length === 0 ? 'No participants yet. Invite some!' : 'No results match.'}
                  </span>
                </td></tr>
              ) : filtered.map(p => {
                const isSel = selected.has(p.id);
                return (
                  <tr key={p.id} style={{ background: isSel ? 'rgba(59,130,246,0.05)' : '', transition: 'background 0.15s' }}>
                    <td>
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(p.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '11px', flexShrink: 0, background: isSel ? 'var(--accent)' : 'var(--accent-bg)', color: isSel ? '#fff' : 'var(--accent-deep)', transition: 'all 0.2s' }}>
                          {initials(p.name)}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '14px' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink-mid)', fontSize: '13px' }}>{p.email}</td>
                    <td>
                      <EditableCell
                        value={p.team}
                        options={knownTeams.length > 0 ? knownTeams : undefined}
                        onSave={val => { updateParticipant(selectedEvent.id, p.id, { team: val }); showToast('Team updated.', 'success'); }}
                        placeholder="— assign team —"
                      />
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '17px', color: p.score != null ? 'var(--navy)' : 'var(--ink-muted)' }}>
                        {p.score ?? '—'}
                      </span>
                    </td>
                    <td>
                      <EditableCell value={p.status} options={['Registered', 'Pending']}
                        onSave={val => updateParticipant(selectedEvent.id, p.id, { status: val })} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" title="View Profile" onClick={() => setViewParticipant(p)}>
                          <span className="material-symbols-rounded">person</span>
                        </button>
                        {p.status === 'Pending' && (
                          <button className="btn-icon" title="Resend Invite" onClick={() => showToast(`Resent invite to ${p.email}.`, 'info')}>
                            <span className="material-symbols-rounded">mail</span>
                          </button>
                        )}
                        <button className="btn-icon" title="Remove" style={{ color: 'var(--coral)' }} onClick={() => setConfirmKick(p)}>
                          <span className="material-symbols-rounded">person_remove</span>
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
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 14px',
            background: 'rgba(15,23,42,0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '10px', borderRight: '1px solid rgba(255,255,255,0.15)', marginRight: '4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800 }}>{sel}</div>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>selected</span>
            </div>
            {[
              { icon: 'group_work', label: 'Set Team', action: () => { setShowBulkTeam(true); setBulkTeamVal(''); } },
              { icon: 'check_circle', label: 'Mark Registered', action: () => { [...selected].forEach(id => updateParticipant(selectedEvent.id, id, { status: 'Registered' })); showToast(`Marked ${sel} as Registered.`, 'success'); setSelected(new Set()); } },
            ].map(a => (
              <button key={a.label} onClick={a.action} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', padding: '7px 14px', borderRadius: '10px',
                fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
            <button onClick={() => doRemove([...selected])} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#FCA5A5', padding: '7px 14px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}>
              <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>delete</span>
              Remove
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
        <div className="modal-overlay" onClick={() => { setShowInviteModal(false); setPending([]); setUserSearch(''); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Invite Participants</h2>
                  <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>Search, add to list, then send all invites at once.</p>
                </div>
                <button className="btn-icon" onClick={() => { setShowInviteModal(false); setPending([]); setUserSearch(''); }}><span className="material-symbols-rounded">close</span></button>
              </div>
              <div style={{ position: 'relative', marginTop: '16px' }}>
                <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--ink-muted)' }}>search</span>
                <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="custom-input" style={{ paddingLeft: '44px' }} autoFocus />
              </div>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto', borderBottom: '1px solid var(--border-soft)' }}>
              {userSearch.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '28px', display: 'block', marginBottom: '6px', opacity: .3 }}>person_search</span>
                  Type a name or email to find participants.
                </div>
              ) : poolResults.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-muted)' }}>No users found for "<strong>{userSearch}</strong>".</div>
              ) : poolResults.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 24px', borderBottom: '1px solid var(--border-soft)', transition: 'background var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '12px', flexShrink: 0 }}>{initials(u.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{u.email} · {u.team}</div>
                  </div>
                  <button className="primary-btn" style={{ padding: '7px 16px', fontSize: '13px' }} onClick={() => addToPending(u)}>
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>add</span> Add
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 24px', background: 'var(--page-bg)', borderBottom: '1px solid var(--border-soft)', minHeight: '56px' }}>
              {pending.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center', margin: 0 }}>Added participants will appear here.</p>
              ) : (
                <>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px' }}>To be invited ({pending.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {pending.map(u => (
                      <div key={u.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid var(--border-soft)', borderRadius: '100px', padding: '4px 10px 4px 6px' }}>
                        <div className="user-avatar" style={{ width: '20px', height: '20px', fontSize: '8px' }}>{initials(u.name)}</div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>{u.name}</span>
                        <button onClick={() => removeFromPending(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 0, display: 'grid', placeItems: 'center' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="secondary-btn" onClick={() => { setShowInviteModal(false); setPending([]); setUserSearch(''); }}>Cancel</button>
              <button className="primary-btn" disabled={pending.length === 0} onClick={handleBulkAdd}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>send</span>
                Send Invites ({pending.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BULK TEAM MODAL ══ */}
      {showBulkTeam && (
        <div className="modal-overlay" onClick={() => setShowBulkTeam(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 className="modal-title">Set Team</h2>
            <p className="modal-sub">Applying to <strong>{sel}</strong> selected participant(s).</p>
            <label className="custom-label">Team Name</label>
            <input type="text" className="custom-input" list="team-dl" placeholder="Type or choose a team…"
              value={bulkTeamVal} onChange={e => setBulkTeamVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBulkTeam()} autoFocus />
            <datalist id="team-dl">{knownTeams.map(t => <option key={t} value={t} />)}</datalist>
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="secondary-btn" onClick={() => setShowBulkTeam(false)}>Cancel</button>
              <button className="primary-btn" disabled={!bulkTeamVal.trim()} onClick={handleBulkTeam}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>group_work</span> Apply Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW PROFILE MODAL ══ */}
      {viewParticipant && (
        <div className="modal-overlay" onClick={() => setViewParticipant(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="user-avatar" style={{ width: '72px', height: '72px', fontSize: '24px', margin: '0 auto 14px' }}>{initials(viewParticipant.name)}</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '22px', color: 'var(--navy)', marginBottom: '4px' }}>{viewParticipant.name}</h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: '13px' }}>{viewParticipant.team}</p>
            </div>
            {[{ label: 'Email', value: viewParticipant.email, icon: 'mail' }, { label: 'Status', value: viewParticipant.status, icon: 'info' }, { label: 'Score', value: viewParticipant.score ?? 'Not scored', icon: 'leaderboard' }].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'var(--page-bg)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '18px' }}>{icon}</span>
                <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)' }}>{value}</div></div>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewParticipant(null)}>Close</button>
              <button className="primary-btn" style={{ flex: 1, justifyContent: 'center', background: '#DC2626' }} onClick={() => { setConfirmKick(viewParticipant); setViewParticipant(null); }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ REMOVE CONFIRM ══ */}
      {confirmKick && (
        <div className="modal-overlay" onClick={() => setConfirmKick(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h2 className="modal-title">Remove Participant?</h2>
            <p className="modal-sub">"<strong>{confirmKick.name}</strong>" will be removed. You get 5 seconds to undo.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setConfirmKick(null)}>Cancel</button>
              <button className="primary-btn" style={{ background: '#DC2626' }} onClick={() => { doRemove([confirmKick.id]); setConfirmKick(null); }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {undo.bar}
    </>
  );
}
