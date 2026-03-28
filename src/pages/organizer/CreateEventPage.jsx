import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function getDuration(start, end) {
  if (!start || !end) return null;
  const s = new Date(start + 'T00:00');
  const e = new Date(end + 'T00:00');
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff === 1 ? '1 day' : `${diff} days`;
}

const EVENT_TYPES = ['Academic', 'Sports', 'Arts & Culture', 'Technology', 'Science', 'Debate', 'Dance / Performing Arts', 'Other'];

export default function CreateEventPage() {
  const { addEvent, showToast } = useEventContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', customName: '', type: '',
    startDate: '', startTime: '08:00',
    endDate: '', endTime: '17:00',
    description: '', visibility: 'Public',
    location: '',
  });
  const [useCustomName, setUseCustomName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth <= 1024;

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
      addEvent({ name, type: form.type, startDate: form.startDate, startTime: form.startTime, endDate: form.endDate, endTime: form.endTime, description: form.description, location: form.location, visibility: form.visibility });
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
              <span className="material-symbols-rounded">schedule</span> Timeline Configuration
            </div>
            <div style={{ ...styles.formSectionBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              {[['Commencement Date', 'startDate', 'date', true], ['Launch Time', 'startTime', 'time', false], ['Conclusion Date', 'endDate', 'date', true], ['Closing Time', 'endTime', 'time', false]].map(([label, key, type, req]) => (
                <div key={key}>
                  <label style={styles.label}>{label} {req && <span style={{ color: colors.coral }}>*</span>}</label>
                  <input type={type} style={styles.input} value={form[key]} onChange={e => set(key, e.target.value)} required={req} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              ))}
            </div>
          </div>

          {/* Venue Location */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>pin_drop</span> Venue & Address
            </div>
            <div style={styles.formSectionBody}>
              <label style={styles.label}>Venue Address / Office Location</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="e.g. Grand Ballroom, Hilton Manila" 
                value={form.location} 
                onChange={e => set('location', e.target.value)} 
                onFocus={inputFocus} 
                onBlur={inputBlur} 
              />
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
                      <span style={{ fontSize: '12px', color: colors.inkMuted }}>{form.startTime} - {form.endTime}</span>
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
