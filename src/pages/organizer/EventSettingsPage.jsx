import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyCbrk9Fnf3heYkZXpUtyjrxCI55JrdrnOI';

const STATUS_OPTIONS  = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
const TYPE_OPTIONS    = ['Academic', 'Sports', 'Performing Arts', 'Arts & Culture', 'Technology', 'Science', 'Debate', 'Other'];

/* ── Inline validation ─────────────────────────────────────────── */
function validate(form) {
  const errors = {};
  if (!form.name || form.name.trim().length < 3)
    errors.name = 'Event name must be at least 3 characters.';
  if (form.name && form.name.trim().length > 120)
    errors.name = 'Event name must be 120 characters or fewer.';
  if (!form.type)
    errors.type = 'Please select a category.';
  if (!form.startDate)
    errors.startDate = 'Start date is required.';
  if (!form.endDate)
    errors.endDate = 'End date is required.';
  if (form.startDate && form.endDate && form.endDate < form.startDate)
    errors.endDate = 'End date must be on or after the start date.';
  if (form.startDate && form.endDate && form.startDate === form.endDate) {
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      errors.endTime = 'End time must be after start time on same-day events.';
  }
  if (form.description && form.description.length > 1000)
    errors.description = `Description is too long (${form.description.length}/1000).`;
  return errors;
}

export default function EventSettingsPage() {
  const { selectedEvent, updateEvent, deleteEvent, showToast, setSelectedEventId, eventsList, eventsLoading } = useEventContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', type: '', startDate: '', startTime: '',
    endDate: '', endTime: '', description: '', visibility: 'Public', status: 'Upcoming', location: '',
  });
  const [errors, setErrors]             = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth]   = useState(window.innerWidth);

  // Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 });
  const [markerPos, setMarkerPos] = useState(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth <= 1024;

  // Sync form when selectedEvent changes
  useEffect(() => {
    if (!selectedEvent) return;
    setForm({
      name:        selectedEvent.name        || '',
      type:        selectedEvent.type        || '',
      startDate:   selectedEvent.startDate   || '',
      startTime:   selectedEvent.startTime   || '',
      endDate:     selectedEvent.endDate     || '',
      endTime:     selectedEvent.endTime     || '',
      description: selectedEvent.description || '',
      visibility:  selectedEvent.visibility  || 'Public',
      status:      selectedEvent.status      || 'Upcoming',
      location:    selectedEvent.location    || '',
    });
    setErrors({});
    setSaved(false);
    // Sync map center if lat/lng exist on the event
    if (selectedEvent.latitude && selectedEvent.longitude) {
      const pos = { lat: selectedEvent.latitude, lng: selectedEvent.longitude };
      setMapCenter(pos);
      setMarkerPos(pos);
    } else {
      setMarkerPos(null);
    }
  }, [selectedEvent?.id]);

  const set = (key, val) => {
    // Status validation: block setting Active if outside event date window
    if (key === 'status' && val === 'Active') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = form.startDate ? new Date(form.startDate + 'T00:00:00') : null;
      const endDate   = form.endDate   ? new Date(form.endDate   + 'T00:00:00') : null;

      if (startDate && today < startDate) {
        showToast(
          `Can't set as Active yet — event starts on ${startDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
          'error'
        );
        return;
      }
      if (endDate && today > endDate) {
        showToast(
          `Event ended on ${endDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}. Mark it as Completed instead.`,
          'error'
        );
        return;
      }
    }

    setForm(prev => ({ ...prev, [key]: val }));
    setSaved(false);
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast('Please fix the highlighted errors before saving.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateEvent(selectedEvent.id, {
        name:       form.name.trim(),
        type:       form.type,
        start_date: form.startDate,
        start_time: form.startTime,
        end_date:   form.endDate,
        end_time:   form.endTime,
        description: form.description,
        visibility:  form.visibility,
        status:      form.status.toLowerCase(),
        location:    form.location,
      });
      setSaved(true);
      showToast('Event settings saved successfully.', 'success');
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    await updateEvent(selectedEvent.id, { status: 'cancelled' });
    setShowCancelConfirm(false);
    showToast(`"${selectedEvent.name}" has been cancelled.`, 'info');
  };

  const handleDelete = async () => {
    const remaining = eventsList.filter(e => e.id !== selectedEvent.id);
    if (remaining.length > 0) setSelectedEventId(remaining[0].id);
    await deleteEvent(selectedEvent.id);
    setShowDeleteConfirm(false);
    navigate('/organizer/events/manage');
    showToast('Event deleted permanently.', 'info');
  };

  /* ── Styles ── */
  const fieldStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 14px',
    border: `1.5px solid ${hasError ? '#EF4444' : colors.border}`,
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    color: colors.navy,
    background: hasError ? '#FFF5F5' : '#fff',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  });

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur  = (e) => { e.target.style.boxShadow = 'none'; };

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
    errorMsg: {
      fontSize: '12px',
      color: '#EF4444',
      fontWeight: 600,
      marginTop: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
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

  // Loading / no event guard
  if (eventsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: '12px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Loading event settings…</p>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>calendar_month</span>
        <p style={{ color: colors.inkMuted, fontSize: '15px', marginBottom: '16px' }}>No event selected.</p>
        <button style={styles.btn(false, true)} onClick={() => navigate('/organizer/events/create')}>
          Create your first event
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={styles.pageHeader}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: colors.accentBg, border: `1px solid rgba(59,130,246,0.15)`, marginBottom: '12px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>settings</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: colors.accent, letterSpacing: '0.04em' }}>Event Settings</span>
          </div>
          <h1 style={styles.pageTitle}>Configure Event</h1>
          <p style={styles.pageDescription}>
            Manage all settings for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
          </p>
        </div>
        <button
          style={{ ...styles.btn(activeBtnHover === 'save', true), minWidth: '140px', opacity: saving ? 0.7 : 1 }}
          onMouseEnter={() => setActiveBtnHover('save')}
          onMouseLeave={() => setActiveBtnHover(null)}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <><span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>progress_activity</span> Saving…</>
          ) : saved ? (
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
                <label style={styles.label}>Event Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  style={fieldStyle(!!errors.name)}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  onFocus={inputFocus} onBlur={inputBlur}
                  placeholder="Enter event name..."
                  maxLength={120}
                />
                {errors.name && <div style={styles.errorMsg}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.name}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Category <span style={{ color: '#EF4444' }}>*</span></label>
                  <select style={{ ...fieldStyle(!!errors.type), cursor: 'pointer' }} value={form.type} onChange={e => set('type', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="">Select category…</option>
                    {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {errors.type && <div style={styles.errorMsg}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.type}</div>}
                </div>
              </div>

              {/* Status — radio cards */}
              <div>
                <label style={styles.label}>Event Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  {[
                    { value: 'Upcoming',  icon: 'schedule',     color: '#92400E', bg: '#FEF3C7', border: '#FDE68A',  desc: 'Not started' },
                    { value: 'Active',    icon: 'sensors',      color: '#166534', bg: '#DCFCE7', border: '#86EFAC',  desc: 'Live now' },
                    { value: 'Completed', icon: 'check_circle', color: '#1E3A8A', bg: '#EFF6FF', border: '#BFDBFE',  desc: 'Finished' },
                    { value: 'Cancelled', icon: 'cancel',       color: '#991B1B', bg: '#FEF2F2', border: '#FECACA',  desc: 'Cancelled' },
                  ].map(({ value, icon, color, bg, border, desc }) => {
                    const isSelected = form.status === value;
                    return (
                      <label key={value} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        padding: '14px 10px',
                        border: `2px solid ${isSelected ? border : colors.borderSoft}`,
                        borderRadius: '14px',
                        cursor: 'pointer',
                        background: isSelected ? bg : '#fff',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}>
                        <input type="radio" name="status" value={value} checked={isSelected} onChange={() => set('status', value)} style={{ display: 'none' }} />
                        <span className="material-symbols-rounded" style={{ fontSize: '22px', color: isSelected ? color : colors.inkMuted }}>{icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? color : colors.navy, letterSpacing: '0.02em' }}>{value}</span>
                        <span style={{ fontSize: '10px', color: colors.inkMuted, fontWeight: 500 }}>{desc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={styles.label}>Description <span style={{ color: colors.inkMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional · {form.description.length}/1000)</span></label>
                <textarea
                  style={{ ...fieldStyle(!!errors.description), height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                  rows={3}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  onFocus={inputFocus} onBlur={inputBlur}
                  maxLength={1000}
                  placeholder="Describe your event..."
                />
                {errors.description && <div style={styles.errorMsg}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.description}</div>}
              </div>

              <div>
                <label style={styles.label}>Venue / Address</label>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(instance) => { autocompleteRef.current = instance; }}
                    onPlaceChanged={() => {
                      const ac = autocompleteRef.current;
                      if (ac) {
                        const place = ac.getPlace();
                        if (place && place.geometry) {
                          const addr = place.formatted_address;
                          const lat = place.geometry.location.lat();
                          const lng = place.geometry.location.lng();
                          set('location', addr);
                          setMapCenter({ lat, lng });
                          setMarkerPos({ lat, lng });
                        }
                      }
                    }}
                  >
                    <input
                      type="text"
                      style={fieldStyle(false)}
                      value={form.location}
                      onChange={e => set('location', e.target.value)}
                      onFocus={inputFocus} onBlur={inputBlur}
                      placeholder="Search for a venue or address..."
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    style={fieldStyle(false)}
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    onFocus={inputFocus} onBlur={inputBlur}
                    placeholder="Enter venue or address..."
                  />
                )}

                {isLoaded && (
                  <div style={{ height: '280px', width: '100%', borderRadius: '14px', overflow: 'hidden', border: `1px solid ${colors.borderSoft}`, marginTop: '14px' }}>
                    <GoogleMap
                      mapContainerStyle={{ height: '100%', width: '100%' }}
                      center={mapCenter}
                      zoom={markerPos ? 15 : 11}
                      onClick={(e) => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setMarkerPos({ lat, lng });
                      }}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                          { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#1F2937' }] },
                          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DBEAFE' }] },
                        ],
                      }}
                    >
                      {markerPos && <Marker position={markerPos} />}
                    </GoogleMap>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">schedule</span> Schedule
            </div>
            <div style={{ ...styles.formSectionBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Start Date', key: 'startDate', type: 'date', req: true },
                { label: 'Start Time', key: 'startTime', type: 'time', req: true },
                { label: 'End Date',   key: 'endDate',   type: 'date', req: true },
                { label: 'End Time',   key: 'endTime',   type: 'time', req: true },
              ].map(({ label, key, type, req }) => (
                <div key={key}>
                  <label style={styles.label}>{label} {req && <span style={{ color: '#EF4444' }}>*</span>}</label>
                  <input
                    type={type}
                    style={fieldStyle(!!errors[key])}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                  {errors[key] && <div style={styles.errorMsg}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors[key]}</div>}
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
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {['Public', 'Private'].map(v => (
                  <label key={v} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
                    border: `2px solid ${form.visibility === v ? colors.accent : colors.borderSoft}`,
                    borderRadius: '14px', cursor: 'pointer', flex: 1, minWidth: '160px',
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

          {/* Event Meta */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">info</span> Event Info
            </div>
            <div style={styles.formSectionBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Event ID',  value: `#${String(selectedEvent.id).substring(0, 8)}` },
                  { label: 'Created',   value: selectedEvent.createdAt ? new Date(selectedEvent.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                  { label: 'Status',    value: selectedEvent.status || '—' },
                  { label: 'Organizer', value: localStorage.getItem('full_name') || localStorage.getItem('username') || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: colors.pageBg, borderRadius: '10px', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: colors.inkMuted, fontWeight: 600, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: colors.navy, textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

