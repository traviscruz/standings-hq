import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

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
    location: selectedEvent.location || '',
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth <= 1024;

  React.useEffect(() => {
    setForm({
      name: selectedEvent.name, type: selectedEvent.type,
      startDate: selectedEvent.startDate, startTime: selectedEvent.startTime,
      endDate: selectedEvent.endDate, endTime: selectedEvent.endTime,
      description: selectedEvent.description, visibility: selectedEvent.visibility, status: selectedEvent.status,
      location: selectedEvent.location || '',
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
    if (remaining.length > 0) setSelectedEventId(remaining[0].id);
    deleteEvent(selectedEvent.id);
    setShowDeleteConfirm(false);
    navigate('/organizer/events/manage');
    showToast('Event deleted permanently.', 'info');
  };

  const styles = {
    pageHeader: {
      marginBottom: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '24px',
      flexWrap: 'wrap',
    },
    pageTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '32px',
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
    formSection: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    formSectionHead: {
      padding: '16px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontWeight: 700,
      fontSize: '14px',
      color: colors.navy,
      background: '#FAFBFC',
    },
    formSectionBody: {
      padding: '24px',
    },
    label: {
      fontSize: '11.5px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: colors.inkMuted,
      marginBottom: '8px',
      display: 'block',
    },
    input: {
      width: '100%',
      height: '42px',
      padding: '0 14px',
      border: `1.5px solid ${colors.border}`,
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      color: colors.navy,
      background: '#fff',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
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
      marginBottom: '10px',
    },
  };

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur = (e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; };

  return (
    <>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Event Settings</h1>
          <p style={styles.pageDescription}>
            Manage all settings for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
          </p>
        </div>
        <button
          style={{ ...styles.btn(activeBtnHover === 'save', true), minWidth: '140px' }}
          onMouseEnter={() => setActiveBtnHover('save')}
          onMouseLeave={() => setActiveBtnHover(null)}
          onClick={handleSave}
        >
          {saved ? (
            <><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check_circle</span> Saved!</>
          ) : (
            <><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span> Save Changes</>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 320px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Basic Info */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">info</span> Basic Information
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={styles.label}>Event Name</label>
                <input type="text" style={styles.input} value={form.name} onChange={e => set('name', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Event Type</label>
                  <select style={styles.input} value={form.type} onChange={e => set('type', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                    {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Status</label>
                  <select
                    style={{ ...styles.input, color: form.status === 'Active' ? colors.success : form.status === 'Cancelled' ? colors.coral : 'inherit' }}
                    value={form.status} onChange={e => set('status', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                  rows={3} value={form.description} onChange={e => set('description', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>
              <div>
                <label style={styles.label}>Venue / Address</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={form.location} 
                  onChange={e => set('location', e.target.value)} 
                  onFocus={inputFocus} 
                  onBlur={inputBlur} 
                  placeholder="Official event location..."
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">schedule</span> Schedule
            </div>
            <div style={{ ...styles.formSectionBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[['Start Date', 'startDate', 'date'], ['Start Time', 'startTime', 'time'], ['End Date', 'endDate', 'date'], ['End Time', 'endTime', 'time']].map(([label, key, type]) => (
                <div key={key}>
                  <label style={styles.label}>{label}</label>
                  <input type={type} style={styles.input} value={form[key]} onChange={e => set(key, e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">visibility</span> Visibility
            </div>
            <div style={styles.formSectionBody}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Public', 'Private'].map(v => (
                  <label key={v} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
                    border: `2px solid ${form.visibility === v ? colors.accent : colors.borderSoft}`,
                    borderRadius: '14px', cursor: 'pointer', flex: 1,
                    background: form.visibility === v ? colors.accentBg : '#fff', transition: 'all 0.2s',
                  }}>
                    <input type="radio" name="visibility" value={v} checked={form.visibility === v} onChange={() => set('visibility', v)} style={{ display: 'none' }} />
                    <span className="material-symbols-rounded" style={{ fontSize: '20px', color: form.visibility === v ? colors.accent : colors.inkMuted }}>
                      {v === 'Public' ? 'public' : 'lock'}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: form.visibility === v ? colors.accentDeep : colors.navy }}>{v}</div>
                      <div style={{ fontSize: '12px', color: colors.inkMuted }}>{v === 'Public' ? 'Anyone can view leaderboards' : 'Only participants & judges'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: isTablet ? 'static' : 'sticky', top: '24px' }}>
          {/* Current Status */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">info</span> Current Status
            </div>
            <div style={styles.formSectionBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ label: 'Event ID', value: `#${selectedEvent.id}` }, { label: 'Created', value: selectedEvent.createdAt }, { label: 'Status', value: selectedEvent.status }].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: colors.pageBg, borderRadius: '10px' }}>
                    <span style={{ fontSize: '13px', color: colors.inkMuted, fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: colors.navy }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ ...styles.formSection, border: '1px solid #FEE2E2' }}>
            <div style={{ ...styles.formSectionHead, color: '#DC2626', borderBottom: '1px solid #FEE2E2' }}>
              <span className="material-symbols-rounded">warning</span> Danger Zone
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', color: colors.inkMuted, marginBottom: '10px', lineHeight: '1.5' }}>
                  Cancel this event. Participants will be notified. This can be reversed by changing the status.
                </p>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  onMouseEnter={() => setActiveBtnHover('cancel-ev')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                  style={{ ...styles.btn(activeBtnHover === 'cancel-ev'), width: '100%', borderColor: '#FECACA', color: '#DC2626' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>cancel</span> Cancel Event
                </button>
              </div>
              <div style={{ borderTop: '1px solid #FEE2E2', paddingTop: '14px' }}>
                <p style={{ fontSize: '13px', color: colors.inkMuted, marginBottom: '10px', lineHeight: '1.5' }}>
                  Permanently delete this event and all associated data.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  onMouseEnter={() => setActiveBtnHover('delete-ev')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                  style={{ ...styles.btn(activeBtnHover === 'delete-ev', true), width: '100%', background: '#DC2626' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete_forever</span> Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirm */}
      {showCancelConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowCancelConfirm(false)}>
          <div style={styles.modalContainer()} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Cancel Event?</h2>
            <p style={{ fontSize: '14px', color: colors.inkSoft, lineHeight: '1.5', marginBottom: '28px' }}>
              "{selectedEvent.name}" will be marked as Cancelled. You can restore it by changing the status in settings.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={styles.btn(activeBtnHover === 'gb')} onClick={() => setShowCancelConfirm(false)} onMouseEnter={() => setActiveBtnHover('gb')} onMouseLeave={() => setActiveBtnHover(null)}>Go Back</button>
              <button style={{ ...styles.btn(activeBtnHover === 'yc', true), background: '#D97706' }} onClick={handleCancel} onMouseEnter={() => setActiveBtnHover('yc')} onMouseLeave={() => setActiveBtnHover(null)}>Yes, Cancel Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modalContainer()} onClick={e => e.stopPropagation()}>
            <div style={{ width: '52px', height: '52px', background: '#FEE2E2', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-rounded" style={{ color: '#DC2626', fontSize: '26px' }}>delete_forever</span>
            </div>
            <h2 style={{ ...styles.modalTitle, textAlign: 'center' }}>Delete "{selectedEvent.name}"?</h2>
            <p style={{ fontSize: '14px', color: colors.inkSoft, textAlign: 'center', lineHeight: '1.5', marginBottom: '28px' }}>
              All participants, judges, rubrics, and results will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button style={styles.btn(activeBtnHover === 'cd')} onClick={() => setShowDeleteConfirm(false)} onMouseEnter={() => setActiveBtnHover('cd')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
              <button style={{ ...styles.btn(activeBtnHover === 'dp', true), background: '#DC2626' }} onClick={handleDelete} onMouseEnter={() => setActiveBtnHover('dp')} onMouseLeave={() => setActiveBtnHover(null)}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
