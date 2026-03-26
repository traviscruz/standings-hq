import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';

const STATUS_OPTIONS = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
const TYPE_OPTIONS = ['Academic', 'Sports', 'Arts & Culture', 'Technology', 'Science', 'Debate', 'Dance / Performing Arts', 'Other'];

export default function EventSettingsPage() {
  const { selectedEvent, updateEvent, deleteEvent, showToast, setSelectedEventId, eventsList } = useEventContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: selectedEvent.name,
    type: selectedEvent.type,
    startDate: selectedEvent.startDate,
    startTime: selectedEvent.startTime,
    endDate: selectedEvent.endDate,
    endTime: selectedEvent.endTime,
    description: selectedEvent.description,
    visibility: selectedEvent.visibility,
    status: selectedEvent.status,
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  // Keep form in sync when event switches
  React.useEffect(() => {
    setForm({
      name: selectedEvent.name,
      type: selectedEvent.type,
      startDate: selectedEvent.startDate,
      startTime: selectedEvent.startTime,
      endDate: selectedEvent.endDate,
      endTime: selectedEvent.endTime,
      description: selectedEvent.description,
      visibility: selectedEvent.visibility,
      status: selectedEvent.status,
    });
  }, [selectedEvent.id]);

  const set = (key, val) => { setForm(prev => ({ ...prev, [key]: val })); setSaved(false); };

  const handleSave = () => {
    updateEvent(selectedEvent.id, form);
    setSaved(true);
    showToast('Event settings saved.', 'success');
  };

  const handleCancel = () => {
    updateEvent(selectedEvent.id, { status: 'Cancelled' });
    setShowCancelConfirm(false);
    showToast(`"${selectedEvent.name}" has been cancelled.`, 'info');
  };

  const handleDelete = () => {
    const remaining = eventsList.filter(e => e.id !== selectedEvent.id);
    if (remaining.length > 0) {
      setSelectedEventId(remaining[0].id);
    }
    deleteEvent(selectedEvent.id);
    setShowDeleteConfirm(false);
    navigate('/organizer/events/manage');
    showToast('Event deleted permanently.', 'info');
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="custom-label">{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Settings</h1>
          <p className="page-description">Manage all settings and configuration for <strong style={{ color: 'var(--navy)' }}>{selectedEvent.name}</strong>.</p>
        </div>
        <button className="primary-btn" onClick={handleSave} style={{ minWidth: '140px' }}>
          {saved ? (
            <><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check_circle</span> Saved!</>
          ) : (
            <><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span> Save Changes</>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Basic Info */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">info</span> Basic Information</div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Field label="Event Name">
                <input type="text" className="custom-input" value={form.name} onChange={e => set('name', e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Event Type">
                  <select className="custom-input" value={form.type} onChange={e => set('type', e.target.value)}>
                    {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select className="custom-input" value={form.status} onChange={e => set('status', e.target.value)} style={{ color: form.status === 'Active' ? 'var(--sage)' : form.status === 'Cancelled' ? 'var(--coral)' : 'inherit' }}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Description">
                <textarea className="custom-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </Field>
            </div>
          </div>

          {/* Schedule */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">schedule</span> Schedule</div>
            <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Start Date"><input type="date" className="custom-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></Field>
              <Field label="Start Time"><input type="time" className="custom-input" value={form.startTime} onChange={e => set('startTime', e.target.value)} /></Field>
              <Field label="End Date"><input type="date" className="custom-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></Field>
              <Field label="End Time"><input type="time" className="custom-input" value={form.endTime} onChange={e => set('endTime', e.target.value)} /></Field>
            </div>
          </div>

          {/* Visibility */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">visibility</span> Visibility</div>
            <div className="form-section-body">
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Public', 'Private'].map(v => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', border: `2px solid ${form.visibility === v ? 'var(--accent)' : 'var(--border-soft)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', flex: 1, background: form.visibility === v ? 'var(--accent-bg)' : '#fff', transition: 'all var(--transition)' }}>
                    <input type="radio" name="visibility" value={v} checked={form.visibility === v} onChange={() => set('visibility', v)} style={{ display: 'none' }} />
                    <span className="material-symbols-rounded" style={{ fontSize: '20px', color: form.visibility === v ? 'var(--accent)' : 'var(--ink-muted)' }}>{v === 'Public' ? 'public' : 'lock'}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: form.visibility === v ? 'var(--accent-deep)' : 'var(--navy)' }}>{v}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{v === 'Public' ? 'Anyone can view leaderboards' : 'Only participants & judges'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Danger Zone ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
          {/* Event Status Card */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">info</span> Current Status</div>
            <div className="form-section-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Event ID', value: `#${selectedEvent.id}` },
                  { label: 'Created', value: selectedEvent.createdAt },
                  { label: 'Status', value: selectedEvent.status },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--page-bg)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--ink-muted)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="form-section" style={{ border: '1px solid #FEE2E2' }}>
            <div className="form-section-head" style={{ color: '#DC2626', borderBottom: '1px solid #FEE2E2' }}>
              <span className="material-symbols-rounded">warning</span> Danger Zone
            </div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '10px' }}>Cancel this event. Participants will be notified. This can be reversed by changing the status back.</p>
                <button className="secondary-btn" style={{ width: '100%', justifyContent: 'center', borderColor: '#FECACA', color: '#DC2626' }} onClick={() => setShowCancelConfirm(true)}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>cancel</span>
                  Cancel Event
                </button>
              </div>
              <div style={{ borderTop: '1px solid #FEE2E2', paddingTop: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '10px' }}>Permanently delete this event and all associated data. This cannot be undone.</p>
                <button className="primary-btn" style={{ width: '100%', justifyContent: 'center', background: '#DC2626' }} onClick={() => setShowDeleteConfirm(true)}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete_forever</span>
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirm */}
      {showCancelConfirm && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h2 className="modal-title">Cancel Event?</h2>
            <p className="modal-sub">"{selectedEvent.name}" will be marked as Cancelled. You can restore it by changing the status in settings.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowCancelConfirm(false)}>Go Back</button>
              <button className="primary-btn" style={{ background: '#D97706' }} onClick={handleCancel}>Yes, Cancel Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ width: '52px', height: '52px', background: '#FEE2E2', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-rounded" style={{ color: '#DC2626', fontSize: '26px' }}>delete_forever</span>
            </div>
            <h2 className="modal-title" style={{ textAlign: 'center' }}>Delete "{selectedEvent.name}"?</h2>
            <p className="modal-sub" style={{ textAlign: 'center' }}>All participants, judges, rubrics, and results will be permanently removed. This cannot be undone.</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="secondary-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="primary-btn" style={{ background: '#DC2626' }} onClick={handleDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
