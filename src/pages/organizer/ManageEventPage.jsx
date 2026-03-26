import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';

export default function ManageEventPage() {
  const { eventsList, setSelectedEventId, showToast, deleteEvent, updateEvent, addEvent } = useEventContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const statusColor = (s) => {
    if (s === 'Active') return { bg: '#DCFCE7', color: '#166534' };
    if (s === 'Completed') return { bg: '#E0E7FF', color: '#3730A3' };
    if (s === 'Upcoming') return { bg: '#FEF3C7', color: '#92400E' };
    if (s === 'Cancelled') return { bg: '#FEE2E2', color: '#991B1B' };
    return { bg: '#F1F5F9', color: '#475569' };
  };

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

  const handleCancelEvent = (ev) => {
    const prev = ev.status;
    updateEvent(ev.id, { status: 'Cancelled' });
    setConfirmDelete(null);
    showToast(`"${ev.name}" cancelled.`, 'info', () => {
      updateEvent(ev.id, { status: prev });
      showToast('Cancellation undone.', 'success');
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

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-description">All events you've created. Switch workspaces, edit details, or manage status.</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/organizer/events/create')}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span>
          New Event
        </button>
      </div>

      <div className="table-container">
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'active', 'upcoming', 'past'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: '100px',
                  background: filter === f ? 'var(--navy)' : 'transparent',
                  color: filter === f ? '#fff' : 'var(--ink-muted)',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <span className="material-symbols-rounded" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--ink-muted)' }}>search</span>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="custom-input"
              style={{ paddingLeft: '38px', borderRadius: '100px', height: '40px', width: '240px' }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '80px 32px', textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--border)', display: 'block', marginBottom: '12px' }}>event_busy</span>
            <p style={{ color: 'var(--ink-muted)', fontSize: '15px' }}>No events match your search.</p>
            <button className="primary-btn" style={{ margin: '16px auto 0' }} onClick={() => navigate('/organizer/events/create')}>
              Create your first event
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Schedule</th>
                <th>Visibility</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => {
                const sc = statusColor(ev.status);
                return (
                  <tr key={ev.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '14px', marginBottom: '2px' }}>{ev.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Created {ev.createdAt}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--ink-mid)', background: 'var(--page-bg)', padding: '3px 10px', borderRadius: '100px', fontWeight: 500 }}>{ev.type}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)' }}>{ev.startDate}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{ev.startTime} – {ev.endTime}</div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--ink-mid)' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{ev.visibility === 'Public' ? 'public' : 'lock'}</span>
                        {ev.visibility}
                      </span>
                    </td>
                    <td>
                      <span style={{ ...sc, padding: '4px 12px', borderRadius: '100px', fontSize: '11.5px', fontWeight: 700, display: 'inline-block' }}>
                        {ev.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" title="Open Workspace" onClick={() => handleSwitch(ev)}>
                          <span className="material-symbols-rounded">open_in_new</span>
                        </button>
                        <button className="btn-icon" title="Settings" onClick={() => { setSelectedEventId(ev.id); navigate('/organizer/events/settings'); }}>
                          <span className="material-symbols-rounded">settings</span>
                        </button>
                        {ev.status !== 'Completed' && (
                          <button className="btn-icon" title={ev.status === 'Active' ? 'Mark as Upcoming' : 'Set as Active'} onClick={() => handleToggleStatus(ev)}>
                            <span className="material-symbols-rounded">{ev.status === 'Active' ? 'pause_circle' : 'play_circle'}</span>
                          </button>
                        )}
                        <button className="btn-icon" title="Delete" style={{ color: 'var(--coral)' }} onClick={() => setConfirmDelete({ ev, action: 'delete' })}>
                          <span className="material-symbols-rounded">delete</span>
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

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ width: '52px', height: '52px', background: '#FEE2E2', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-rounded" style={{ color: '#DC2626', fontSize: '26px' }}>delete_forever</span>
            </div>
            <h2 className="modal-title" style={{ textAlign: 'center', fontSize: '22px' }}>Delete Event?</h2>
            <p className="modal-sub" style={{ textAlign: 'center' }}>
              "<strong>{confirmDelete.ev.name}</strong>" and all its data (participants, judges, rubrics) will be permanently deleted. This cannot be undone.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="secondary-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="primary-btn" style={{ background: '#DC2626' }} onClick={() => handleDeleteEvent(confirmDelete.ev)}>
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
