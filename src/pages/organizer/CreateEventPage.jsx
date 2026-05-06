import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';
import { format } from 'date-fns';
import { API_URL } from '../../config';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyCbrk9Fnf3heYkZXpUtyjrxCI55JrdrnOI';

function formatDate(date) {
  if (!date) return '—';
  return format(date, 'MMMM d, yyyy');
}
function getDuration(start, end) {
  if (!start || !end) return null;
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff === 1 ? '1 day' : `${diff} days`;
}

const EVENT_TYPES = ['Academic', 'Sports', 'Arts & Culture', 'Technology', 'Science', 'Debate', 'Performing Arts', 'Other'];

const CustomRangeInput = React.forwardRef(({ value, onClick, startDate, endDate, className }, ref) => (
  <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onClick} ref={ref}>
    <input 
      className={`datepicker-input ${className || ''}`}
      style={{ paddingLeft: '44px', cursor: 'pointer' }}
      value={startDate ? (
        `Start: ${format(startDate, 'MMM d')}${endDate ? ` — End: ${format(endDate, 'MMM d, yyyy')}` : ' — Select End Date'}`
      ) : ''}
      readOnly
      placeholder="Select event duration..."
    />
    <span className="material-symbols-rounded" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.accent, fontSize: '20px' }}>event_repeat</span>
    {startDate && !endDate && (
      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 700, color: colors.coral, background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '6px', animation: 'pulse 2s infinite' }}>
        Finish Selection
      </div>
    )}
  </div>
));

export default function CreateEventPage() {
  const { addEvent, showToast } = useEventContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', type: '', customType: '',
    startDate: null, startTime: new Date(new Date().setHours(8, 0, 0, 0)),
    endDate: null, endTime: new Date(new Date().setHours(17, 0, 0, 0)),
    description: '', visibility: 'Public',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showConfirm, setShowConfirm] = useState(false);

  // Google Maps State
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 }); // Manila default
  const [markerPos, setMarkerPos] = useState(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth <= 1024;

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  // Helper for time restrictions
  const getMinMaxTimes = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const isToday = form.startDate && format(form.startDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    
    return {
      min: isToday ? now : start,
      max: end
    };
  };

  const { min: launchMinTime, max: launchMaxTime } = getMinMaxTimes();

  const validate = () => {
    const e = {};
    const finalType = form.type === 'Other' ? form.customType : form.type;
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!form.name || form.name.trim().length < 3) e.name = 'Event name must be at least 3 characters.';
    if (form.name && form.name.trim().length > 120) e.name = 'Event name must be 120 characters or fewer.';
    if (!finalType) e.type = form.type === 'Other' ? 'Please enter a custom category.' : 'Please select a category.';
    if (!form.startDate) e.startDate = 'Start date is required.';
    else if (format(form.startDate, 'yyyy-MM-dd') < today) e.startDate = 'Start date cannot be in the past.';
    if (!form.endDate) e.endDate = 'End date is required.';
    else if (form.startDate && format(form.endDate, 'yyyy-MM-dd') < format(form.startDate, 'yyyy-MM-dd')) e.endDate = 'End date must be on or after the start date.';
    if (form.startDate && form.endDate && format(form.startDate, 'yyyy-MM-dd') === format(form.endDate, 'yyyy-MM-dd')) {
      if (form.startTime && form.endTime && format(form.endTime, 'HH:mm') <= format(form.startTime, 'HH:mm'))
        e.endTime = 'End time must be after start time on same-day events.';
    }
    if (form.description && form.description.length > 1000) e.description = `Description is too long (${form.description.length}/1000).`;
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }
    setErrors({});
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    const finalType = form.type === 'Other' ? form.customType : form.type;
    const organizer_id = localStorage.getItem('user_id') || null;

    setLoading(true);
    try {
      const payload = {
        organizer_id,
        name: form.name,
        type: finalType,
        start_date: format(form.startDate, 'yyyy-MM-dd'),
        start_time: format(form.startTime, 'HH:mm'),
        end_date: format(form.endDate, 'yyyy-MM-dd'),
        end_time: format(form.endTime, 'HH:mm'),
        description: form.description || null,
        location: form.location || null,
        latitude: markerPos ? markerPos.lat : null,
        longitude: markerPos ? markerPos.lng : null,
        visibility: form.visibility,
      };

      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create event.');
      }

      addEvent({ ...payload, id: json.data.id });
      showToast(`Event "${form.name}" created successfully!`, 'success');
      navigate('/organizer/dashboard');
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
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
      padding: '12px 28px',
      borderRadius: '14px',
      fontSize: '14px',
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
    linkBtn: {
      background: 'none',
      border: 'none',
      color: colors.accent,
      fontWeight: 600,
      fontSize: '13.5px',
      cursor: 'pointer',
      padding: 0,
      fontFamily: "'Inter', sans-serif",
      textDecoration: 'underline',
      textDecorationStyle: 'dotted',
    },
  };

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur = (e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: colors.accentBg, border: `1px solid rgba(59,130,246,0.15)`, marginBottom: '12px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>add_circle</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: colors.accent, letterSpacing: '0.04em' }}>New Event</span>
        </div>
        <h1 style={styles.pageTitle}>Create an Event</h1>
        <p style={styles.pageDescription}>Configure your competition's core identity. You can refine participants and routing later.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 360px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left: Main Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Event Name */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">edit</span> Core Identity
            </div>
            <div style={styles.formSectionBody}>
              <div>
                <label style={styles.label}>Event Name <span style={{ color: colors.coral }}>*</span></label>
                <input 
                  type="text" 
                  style={{ ...styles.input, borderColor: errors.name ? '#EF4444' : undefined, background: errors.name ? '#FFF5F5' : undefined }} 
                  placeholder="Enter event name..." 
                  value={form.name} 
                  onChange={e => set('name', e.target.value)} 
                  onFocus={inputFocus} 
                  onBlur={inputBlur} 
                  maxLength={120}
                />
                {errors.name && <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.name}</div>}
              </div>
            </div>
          </div>

          {/* Type & Visibility */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">category</span> Classification &amp; Access
            </div>
            <div style={{ ...styles.formSectionBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <div>
                <label style={styles.label}>Competition Vertical <span style={{ color: colors.coral }}>*</span></label>
                <select style={{ ...styles.input, borderColor: errors.type ? '#EF4444' : undefined, background: errors.type ? '#FFF5F5' : undefined }} value={form.type} onChange={e => set('type', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="">— Select category —</option>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                {errors.type && !form.customType && <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.type}</div>}
                
                {form.type === 'Other' && (
                  <div style={{ marginTop: '14px', animation: 'slideDown 0.3s ease-out' }}>
                    <label style={styles.label}>Custom Category <span style={{ color: colors.coral }}>*</span></label>
                    <input 
                      type="text" 
                      style={{ ...styles.input, borderColor: errors.type ? '#EF4444' : undefined, background: errors.type ? '#FFF5F5' : undefined }} 
                      placeholder="Enter custom category..." 
                      value={form.customType} 
                      onChange={e => set('customType', e.target.value)} 
                      autoFocus 
                      onFocus={inputFocus} 
                      onBlur={inputBlur} 
                    />
                    {errors.type && <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.type}</div>}
                  </div>
                )}
              </div>
              <div>
                <label style={styles.label}>Privacy Model</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Public', 'Private'].map(v => (
                    <label key={v} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                      border: `2px solid ${form.visibility === v ? colors.accent : colors.borderSoft}`,
                      borderRadius: '14px', cursor: 'pointer', flex: 1,
                      background: form.visibility === v ? colors.accentBg : '#fff', transition: 'all 0.2s',
                    }}>
                      <input type="radio" name="visibility" value={v} checked={form.visibility === v} onChange={() => set('visibility', v)} style={{ display: 'none' }} />
                      <span className="material-symbols-rounded" style={{ fontSize: '20px', color: form.visibility === v ? colors.accent : colors.inkMuted }}>
                        {v === 'Public' ? 'public' : 'lock'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: form.visibility === v ? colors.accentDeep : colors.inkSoft }}>{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">calendar_today</span> Event Schedule
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={styles.label}>Event Window (Start & End) <span style={{ color: colors.coral }}>*</span></label>
                <DatePicker
                  selectsRange={true}
                  startDate={form.startDate}
                  endDate={form.endDate}
                  onChange={(update) => {
                    const [start, end] = update;
                    setForm(prev => ({ ...prev, startDate: start, endDate: end }));
                    if (errors.startDate || errors.endDate) setErrors(prev => { const e = { ...prev }; delete e.startDate; delete e.endDate; return e; });
                  }}
                  isClearable={true}
                  minDate={new Date()}
                  customInput={
                    <CustomRangeInput 
                      startDate={form.startDate} 
                      endDate={form.endDate}
                      hasError={!!(errors.startDate || errors.endDate)}
                    />
                  }
                />
                {(errors.startDate || errors.endDate) && <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.startDate || errors.endDate}</div>}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={styles.label}>Launch Time</label>
                  <DatePicker
                    selected={form.startTime}
                    onChange={(date) => set('startTime', date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="datepicker-input"
                    minTime={launchMinTime}
                    maxTime={launchMaxTime}
                  />
                </div>
                <div>
                  <label style={styles.label}>Closing Time</label>
                  <DatePicker
                    selected={form.endTime}
                    onChange={(date) => set('endTime', date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="datepicker-input"
                    minTime={new Date(new Date().setHours(0, 0, 0, 0))}
                    maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                  />
                  {errors.endTime && <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>{errors.endTime}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Venue Location */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>pin_drop</span> Venue & Address
            </div>
            <div style={styles.formSectionBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Search Venue Address</label>
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
                        style={styles.input} 
                        placeholder="Search for a venue or address..." 
                        value={form.location} 
                        onChange={e => set('location', e.target.value)} 
                        onFocus={inputFocus} 
                        onBlur={inputBlur} 
                      />
                    </Autocomplete>
                  ) : (
                    <input 
                      type="text" 
                      style={styles.input} 
                      placeholder="Loading Maps API..." 
                      disabled 
                    />
                  )}
                </div>

                {isLoaded && GOOGLE_MAPS_API_KEY && (
                  <div style={{ height: '300px', width: '100%', borderRadius: '14px', overflow: 'hidden', border: `1px solid ${colors.borderSoft}` }}>
                    <GoogleMap
                      mapContainerStyle={{ height: '100%', width: '100%' }}
                      center={mapCenter}
                      zoom={15}
                      onClick={(e) => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setMarkerPos({ lat, lng });
                        // Reverse geocoding could be added here to update address string
                      }}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                          { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#1F2937" }] },
                          { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#DBEAFE" }] }
                        ]
                      }}
                    >
                      {markerPos && <Marker position={markerPos} />}
                    </GoogleMap>
                  </div>
                )}
                
                {!GOOGLE_MAPS_API_KEY && (
                  <div style={{ padding: '20px', background: colors.pageBg, borderRadius: '14px', border: `1px dashed ${colors.border}`, textAlign: 'center' }}>
                    <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '32px', marginBottom: '8px' }}>map</span>
                    <p style={{ fontSize: '13px', color: colors.inkMuted, margin: 0 }}>
                      Google Maps preview requires an API key. <br/>
                      <span style={{ fontSize: '11px', opacity: 0.7 }}>Check your .env.local for REACT_APP_GOOGLE_MAPS_API_KEY</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">description</span> Extended Manifest
            </div>
            <div style={styles.formSectionBody}>
              <label style={styles.label}>Event Brief</label>
              <textarea
                style={{ ...styles.input, height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                rows={4} placeholder="Define the scope and objectives for participants..."
                value={form.description} onChange={e => set('description', e.target.value)}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '28px' }}>
            <button type="button"
              style={styles.btn(activeBtnHover === 'discard')}
              onMouseEnter={() => setActiveBtnHover('discard')}
              onMouseLeave={() => setActiveBtnHover(null)}
              onClick={() => navigate('/organizer/events/manage')}
            >
              Discard
            </button>
            <button type="submit"
              style={{ ...styles.btn(activeBtnHover === 'submit', true), minWidth: '180px' }}
              disabled={loading}
              onMouseEnter={() => setActiveBtnHover('submit')}
              onMouseLeave={() => setActiveBtnHover(null)}
            >
              {loading
                ? <><span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>cached</span>Processing...</>
                : <><span className="material-symbols-rounded">rocket_launch</span>Establish Event</>
              }
            </button>
          </div>
        </form>

        {/* ── Right: Live Card Preview ── */}
        {!isTablet && (
          <div style={{ position: 'sticky', top: '32px' }}>
            <div style={{ ...styles.formSection, padding: 0 }}>
              <div style={styles.formSectionHead}>
                <span className="material-symbols-rounded">visibility</span> Live Card Preview
              </div>
              <div style={{ padding: '20px 24px 32px' }}>
                <div style={{ background: colors.navy, borderRadius: '20px', padding: '28px', color: '#fff', boxShadow: '0 20px 40px -10px rgba(15,23,42,0.3)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', color: '#fff' }}>
                      {(form.type === 'Other' ? form.customType : form.type) || 'Undefined Category'}
                    </div>
                    <span className="material-symbols-rounded" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>
                      {form.visibility === 'Public' ? 'public' : 'lock'}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 800, marginBottom: '14px', lineHeight: 1.2 }}>
                    {form.name || <span style={{ opacity: 0.2 }}>Event Name</span>}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, marginBottom: '6px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>calendar_month</span>
                    {form.startDate ? formatDate(form.startDate) : 'Pending Date'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>pin_drop</span>
                    {form.location || 'Pending Location'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '16px', background: colors.pageBg, border: `1px dashed ${colors.border}`, borderRadius: '14px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '8px', letterSpacing: '0.05em' }}>Duration Manifest</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: colors.navy }}>{getDuration(form.startDate, form.endDate) || '—'}</span>
                      <span style={{ fontSize: '12px', color: colors.inkMuted }}>
                        {form.startTime ? format(form.startTime, 'h:mm aa') : '—'} - {form.endTime ? format(form.endTime, 'h:mm aa') : '—'}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: colors.pageBg, border: `1px dashed ${colors.border}`, borderRadius: '14px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: '8px', letterSpacing: '0.05em' }}>Overview Preview</div>
                    <p style={{ fontSize: '13px', color: colors.inkMuted, lineHeight: 1.5, margin: 0 }}>
                      {form.description || 'Provide a description to see how it will appear to your attendees and participants.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
    {showConfirm && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
        padding: '24px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '36px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 32px 64px -12px rgba(15,23,42,0.35)',
          animation: 'modalUp 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        }}>
          {/* Icon */}
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: colors.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '28px', color: colors.accent }}>rocket_launch</span>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 800, color: colors.navy, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Confirm Event Creation
          </h2>
          <p style={{ fontSize: '14px', color: colors.inkMid, lineHeight: 1.6, margin: '0 0 24px' }}>
            You're about to establish this event. Please review the details below before proceeding.
          </p>

          {/* Summary */}
          <div style={{ background: colors.pageBg, borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: 'edit', label: 'Event Name', value: form.name },
              { icon: 'category', label: 'Category', value: form.type === 'Other' ? form.customType : form.type },
              { icon: 'calendar_month', label: 'Dates', value: form.startDate && form.endDate ? `${format(form.startDate, 'MMM d')} — ${format(form.endDate, 'MMM d, yyyy')}` : '—' },
              { icon: 'pin_drop', label: 'Venue', value: form.location || 'Not specified' },
              { icon: form.visibility === 'Public' ? 'public' : 'lock', label: 'Visibility', value: form.visibility },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '16px', color: colors.accent, marginTop: '1px', flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.inkMuted, marginBottom: '1px' }}>{label}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.navy }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              style={{
                flex: 1, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', background: '#fff', color: colors.inkSoft,
                border: `1.5px solid ${colors.border}`, transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
              }}
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={confirmSubmit}
              style={{
                flex: 2, padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', background: colors.navy, color: '#fff',
                border: 'none', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check_circle</span>
              Yes, Establish Event
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
