import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getDuration(start, end) {
  if (!start || !end) return null;
  const s = new Date(start + 'T00:00');
  const e = new Date(end + 'T00:00');
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff === 1 ? '1 day' : `${diff} days`;
}

const EVENT_TYPES = [
  'Academic', 'Sports', 'Arts & Culture', 'Technology', 'Science', 'Debate', 'Dance / Performing Arts', 'Other',
];

export default function CreateEventPage() {
  const { addEvent, showToast } = useEventContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    customName: '',
    type: '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '17:00',
    description: '',
    visibility: 'Public',
  });
  const [useCustomName, setUseCustomName] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = useCustomName ? form.customName : form.name;
    if (!name || !form.type || !form.startDate || !form.endDate) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newId = addEvent({
        name,
        type: form.type,
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate,
        endTime: form.endTime,
        description: form.description,
        visibility: form.visibility,
      });
      showToast(`Event "${name}" created successfully!`, 'success');
      navigate('/organizer/dashboard');
    }, 1200);
  };

  return (
    <div className="dashboard-page" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>add_circle</span>
            New Event
          </div>
          <h1 className="page-title">Create an Event</h1>
          <p className="page-description">Configure your competition's core identity. You can refine participants and routing later.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ── Left: Main Form ── */}
        <div className="col-span-8">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Event Name */}
            <div className="form-section">
              <div className="form-section-head">
                <span className="material-symbols-rounded">edit</span>
                Core Identity
              </div>
              <div className="form-section-body">
                {!useCustomName ? (
                  <div>
                    <label className="custom-label">Event Template Name</label>
                    <select className="custom-input" value={form.name} onChange={e => set('name', e.target.value)} required={!useCustomName}>
                      <option value="">— Select a template —</option>
                      <option>Palarong Pambansa</option>
                      <option>Regional Science Fair</option>
                      <option>Interschool Debate Championship</option>
                      <option>National IT Olympics</option>
                      <option>Cultural Arts Festival</option>
                      <option>Mathematics Olympiad</option>
                      <option>Dance Sport Championships</option>
                    </select>
                    <div style={{ marginTop: '14px' }}>
                      <button type="button" className="link-btn" onClick={() => setUseCustomName(true)}>
                        Or define a bespoke event name →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="custom-label">Bespoke Event Name <span style={{ color: 'var(--coral)' }}>*</span></label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="e.g. Metro Manila Debate Open 2026"
                      value={form.customName}
                      onChange={e => set('customName', e.target.value)}
                      required
                      autoFocus
                    />
                    <div style={{ marginTop: '14px' }}>
                      <button type="button" className="link-btn" onClick={() => setUseCustomName(false)}>
                        ← Revert to templates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Type & Visibility */}
            <div className="form-section">
              <div className="form-section-head"><span className="material-symbols-rounded">category</span> Classification & Access</div>
              <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                <div>
                  <label className="custom-label">Competition Vertical <span style={{ color: 'var(--coral)' }}>*</span></label>
                  <select className="custom-input" value={form.type} onChange={e => set('type', e.target.value)} required>
                    <option value="">— Select category —</option>
                    {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="custom-label">Privacy Model</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['Public', 'Private'].map(v => (
                      <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: `2px solid ${form.visibility === v ? 'var(--accent)' : 'var(--border-soft)'}`, borderRadius: '14px', cursor: 'pointer', flex: 1, background: form.visibility === v ? 'var(--accent-bg)' : '#fff', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <input type="radio" name="visibility" value={v} checked={form.visibility === v} onChange={() => set('visibility', v)} style={{ display: 'none' }} />
                        <span className="material-symbols-rounded" style={{ fontSize: '20px', color: form.visibility === v ? 'var(--accent)' : 'var(--ink-muted)' }}>{v === 'Public' ? 'public' : 'lock'}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: form.visibility === v ? 'var(--accent-deep)' : 'var(--ink-soft)' }}>{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="form-section">
              <div className="form-section-head"><span className="material-symbols-rounded">schedule</span> Timeline Configuration</div>
              <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                  <label className="custom-label">Commencement Date <span style={{ color: 'var(--coral)' }}>*</span></label>
                  <input type="date" className="custom-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
                </div>
                <div>
                  <label className="custom-label">Launch Time</label>
                  <input type="time" className="custom-input" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
                </div>
                <div>
                  <label className="custom-label">Conclusion Date <span style={{ color: 'var(--coral)' }}>*</span></label>
                  <input type="date" className="custom-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
                </div>
                <div>
                  <label className="custom-label">Closing Time</label>
                  <input type="time" className="custom-input" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-section" style={{ marginBottom: '40px' }}>
              <div className="form-section-head"><span className="material-symbols-rounded">description</span> Extended Manifest</div>
              <div className="form-section-body">
                <label className="custom-label">Event Brief</label>
                <textarea
                  className="custom-input"
                  rows={4}
                  placeholder="Define the scope and objectives for participants..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid var(--border-soft)', paddingTop: '32px' }}>
              <button type="button" className="secondary-btn" style={{ padding: '12px 28px' }} onClick={() => navigate('/organizer/events/manage')}>Discard</button>
              <button type="submit" className="primary-btn" disabled={loading} style={{ minWidth: '180px', padding: '12px 32px' }}>
                {loading ? (
                  <><span className="material-symbols-rounded spin">cached</span> Processing...</>
                ) : (
                  <><span className="material-symbols-rounded">rocket_launch</span> Establish Event</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: Live Card Preview ── */}
        <div className="col-span-4" style={{ position: 'sticky', top: '32px' }}>
          <div className="widget-card" style={{ padding: 0 }}>
            <div className="form-section-head" style={{ borderBottom: 'none' }}>
              <span className="material-symbols-rounded">visibility</span>
              Live Card Preview
            </div>
            <div style={{ padding: '0 24px 32px 24px' }}>
              <div style={{ background: 'var(--navy)', borderRadius: '20px', padding: '32px', color: '#fff', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div className="eyebrow-badge" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '10px' }}>
                    {form.type || 'Undefined Category'}
                  </div>
                  <span className="material-symbols-rounded" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>
                    {form.visibility === 'Public' ? 'public' : 'lock'}
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
                  {(useCustomName ? form.customName : form.name) || <span style={{ opacity: 0.2 }}>Event Name</span>}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>calendar_month</span>
                  {form.startDate ? formatDate(form.startDate) : 'Pending Date'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="widget-card" style={{ padding: '16px', borderStyle: 'dashed', background: 'var(--page-bg)', boxShadow: 'none' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px' }}>Duration Manifest</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)' }}>
                      {getDuration(form.startDate, form.endDate) || '—'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{form.startTime} - {form.endTime}</span>
                  </div>
                </div>

                <div className="widget-card" style={{ padding: '16px', borderStyle: 'dashed', background: 'var(--page-bg)', boxShadow: 'none' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px' }}>Overview Preview</div>
                  <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.5, margin: 0 }}>
                    {form.description || 'Provide a description to see how it will appear to your attendees and participants.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
