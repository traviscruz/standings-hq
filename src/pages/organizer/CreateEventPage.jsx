import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';
import { format, parse } from 'date-fns';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

function formatDate(date) {
  if (!date) return '—';
  return format(date, 'MMMM d, yyyy');
}
function getDuration(start, end) {
  if (!start || !end) return null;
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff === 1 ? '1 day' : `${diff} days`;
}

const EVENT_TYPES = ['Academic', 'Sports', 'Arts & Culture', 'Technology', 'Science', 'Debate', 'Dance / Performing Arts', 'Other'];

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
    name: '', customName: '', type: '',
    startDate: null, startTime: new Date(new Date().setHours(8, 0, 0, 0)),
    endDate: null, endTime: new Date(new Date().setHours(17, 0, 0, 0)),
    description: '', visibility: 'Public',
    location: '',
  });

  const [useCustomName, setUseCustomName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Google Maps State
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 }); // Manila default
  const [markerPos, setMarkerPos] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth <= 1024;

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = useCustomName ? form.customName : form.name;
    if (!name || !form.type || !form.startDate || !form.endDate) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addEvent({ 
        name, 
        type: form.type, 
        startDate: format(form.startDate, 'yyyy-MM-dd'), 
        startTime: format(form.startTime, 'HH:mm'), 
        endDate: format(form.endDate, 'yyyy-MM-dd'), 
        endTime: format(form.endTime, 'HH:mm'), 
        description: form.description, 
        location: form.location, 
        visibility: form.visibility 
      });
      showToast(`Event "${name}" created successfully!`, 'success');
      navigate('/organizer/dashboard');
    }, 1200);
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
              {!useCustomName ? (
                <div>
                  <label style={styles.label}>Event Template Name</label>
                  <select style={styles.input} value={form.name} onChange={e => set('name', e.target.value)} required={!useCustomName} onFocus={inputFocus} onBlur={inputBlur}>
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
                    <button type="button" style={styles.linkBtn} onClick={() => setUseCustomName(true)}>
                      Or define a bespoke event name →
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={styles.label}>Bespoke Event Name <span style={{ color: colors.coral }}>*</span></label>
                  <input type="text" style={styles.input} placeholder="e.g. Metro Manila Debate Open 2026" value={form.customName} onChange={e => set('customName', e.target.value)} required autoFocus onFocus={inputFocus} onBlur={inputBlur} />
                  <div style={{ marginTop: '14px' }}>
                    <button type="button" style={styles.linkBtn} onClick={() => setUseCustomName(false)}>← Revert to templates</button>
                  </div>
                </div>
              )}
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
                <select style={styles.input} value={form.type} onChange={e => set('type', e.target.value)} required onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="">— Select category —</option>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
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
                  }}
                  isClearable={true}
                  minDate={new Date()}
                  required
                  customInput={
                    <CustomRangeInput 
                      startDate={form.startDate} 
                      endDate={form.endDate} 
                    />
                  }
                />
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
                      onLoad={(autocomplete) => {
                        window.autocomplete = autocomplete;
                      }}
                      onPlaceChanged={() => {
                        const place = window.autocomplete.getPlace();
                        if (place.geometry) {
                          const addr = place.formatted_address;
                          const lat = place.geometry.location.lat();
                          const lng = place.geometry.location.lng();
                          set('location', addr);
                          setMapCenter({ lat, lng });
                          setMarkerPos({ lat, lng });
                        }
                      }}
                    >
                      <input 
                        type="text" 
                        style={styles.input} 
                        placeholder="Search for a location (e.g. Hilton Manila)" 
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
                      <span style={{ fontSize: '11px', opacity: 0.7 }}>Search will still work if you add REACT_APP_GOOGLE_MAPS_API_KEY to your .env</span>
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
                      {form.type || 'Undefined Category'}
                    </div>
                    <span className="material-symbols-rounded" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>
                      {form.visibility === 'Public' ? 'public' : 'lock'}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 800, marginBottom: '14px', lineHeight: 1.2 }}>
                    {(useCustomName ? form.customName : form.name) || <span style={{ opacity: 0.2 }}>Event Name</span>}
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
    </div>
  );
}
