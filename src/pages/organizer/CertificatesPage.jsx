import React, { useState } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

const BORDER_TEMPLATES = [
  { id: 'classic', name: 'Master Gold', bg: '#fdfcf0', border: '#D4AF37', accent: '#B8860B', isDark: false, borderStyle: 'double', type: 'ornate' },
  { id: 'baroque', name: 'Baroque Legacy', bg: '#fffdf5', border: '#8b4513', accent: '#5c4033', isDark: false, borderStyle: 'ridge', type: 'fancy' },
  { id: 'navy', name: 'Royal Navy', bg: '#f8fafc', border: '#1e293b', accent: '#334155', isDark: false, borderStyle: 'solid', type: 'modern' },
  { id: 'minimal', name: 'Silver Minimal', bg: '#fff', border: '#e2e8f0', accent: '#94a3b8', isDark: false, borderStyle: 'solid', type: 'simple' },
  { id: 'ivory', name: 'Ivory Diploma', bg: '#fffdf5', border: '#5c4033', accent: '#8b4513', isDark: false, borderStyle: 'inset', type: 'filigree' },
  { id: 'circuit', name: 'Tech Circuit', bg: '#020617', border: '#38bdf8', accent: '#0ea5e9', isDark: true, borderStyle: 'double', type: 'circuit' },
  { id: 'modern', name: 'Midnight Pro', bg: '#0f172a', border: '#38bdf8', accent: '#7dd3fc', isDark: true, borderStyle: 'groove', type: 'modern' },
];

const PAPER_SIZES = {
  a4: { name: 'A4', ratio: 1.414 }, // 210 x 297
  letter: { name: 'Letter', ratio: 1.294 }, // 8.5 x 11
  long: { name: 'Long', ratio: 1.529 }, // 8.5 x 13
};

const AI_TEXTS = {
  champion: (name, event) => `This is to certify that ${name || '[Recipient Name]'} has demonstrated exemplary excellence and outstanding achievement, earning the highest distinction in the ${event}. This recognition stands as a testament to their unmatched dedication, skill, and unwavering commitment to excellence.`,
  participation: (name, event) => `This is to certify that ${name || '[Recipient Name]'} has successfully participated in ${event}, demonstrating remarkable effort, sportsmanship, and a steadfast commitment to personal growth throughout the competition.`,
  recognition: (name, event) => `In recognition of the valuable contributions and dedicated service rendered to the ${event}, this certificate is proudly presented to ${name || '[Recipient Name]'} with the sincerest appreciation and highest commendation.`,
};

export default function CertificatesPage() {
  const { selectedEvent, participants, showToast } = useEventContext();

  const [selectedTemplate, setSelectedTemplate] = useState(BORDER_TEMPLATES[0]);
  const [certType, setCertType] = useState('champion');
  const [recipientName, setRecipientName] = useState('');
  const [customText, setCustomText] = useState('');
  const [signatories, setSignatories] = useState([
    { id: 1, name: 'Juan Dela Cruz', title: 'Event Organizer' },
    { id: 2, name: 'Maria Santos', title: 'Head Judge' },
  ]);
  const [newSig, setNewSig] = useState({ name: '', title: '', esign: null });
  const [showAddSig, setShowAddSig] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [bulkRecipient, setBulkRecipient] = useState('all');
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 1024;

  // New Certificate Layout States
  const [bgImage, setBgImage] = useState(null);
  const [bgScale, setBgScale] = useState(100);
  const [bgX, setBgX] = useState(0);
  const [bgY, setBgY] = useState(0);
  const [bgStretch, setBgStretch] = useState(false);
  const [certOrientation, setCertOrientation] = useState('landscape');
  const [paperSize, setPaperSize] = useState('a4');

  // Sidebar Controls
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    design: true,
    sigs: false,
    bulk: false
  });

  const toggleSection = (id) => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  const bodyText = customText || AI_TEXTS[certType]?.(recipientName, selectedEvent.name) || '';

  const handleAIGenerate = () => {
    setAiLoading(true);
    setTimeout(() => {
      setCustomText(AI_TEXTS[certType]?.(recipientName, selectedEvent.name) || '');
      setAiLoading(false);
      showToast('AI-generated certificate text applied!', 'success');
    }, 1000);
  };

  const handleAddSig = () => {
    if (!newSig.name) { showToast('Signatory name required.', 'error'); return; }
    
    // Auto-retrieve if name matches a judge's profile signature
    const autoSig = localStorage.getItem(`esign_${newSig.name}`);
    const finalSig = newSig.esign || autoSig;

    setSignatories(prev => [...prev, { id: Date.now(), ...newSig, esign: finalSig }]);
    setNewSig({ name: '', title: '', esign: null });
    setShowAddSig(false);
    showToast('Signatory added' + (finalSig ? ' with digital signature.' : '.'), 'success');
  };

  const removeSig = (id) => setSignatories(prev => prev.filter(s => s.id !== id));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const targetList = participants.filter(p => {
    if (bulkRecipient === 'all') return true;
    if (bulkRecipient === 'winners') {
      const ranked = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      ranked.slice(0, 3).some(r => r.id === p.id);
    }
    if (bulkRecipient === 'registered') return p.status === 'Registered';
    return true;
  });

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
      padding: '9px 18px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', sans-serif",
      whiteSpace: 'nowrap',
      height: '42px',
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
    btnIcon: (hovered, danger = false) => ({
      background: hovered ? (danger ? 'rgba(239,68,68,0.1)' : 'rgba(15,31,61,0.05)') : 'none',
      border: 'none',
      color: hovered ? (danger ? colors.coral : colors.navy) : colors.inkMuted,
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '8px',
      display: 'grid',
      placeItems: 'center',
      transition: 'all 0.15s',
    }),
    pageContainer: {
      padding: '0',
      maxWidth: '100%',
      margin: '0 auto',
    },
    mainGrid: {
      display: 'grid', 
      gridTemplateColumns: 'repeat(12, 1fr)', 
      gap: '32px', 
      alignItems: 'flex-start'
    },
    collapseHeader: {
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      background: '#fff',
      transition: 'background 0.2s',
      fontWeight: 700,
      fontSize: '13px',
      color: colors.navy,
      borderBottom: `1px solid ${colors.borderSoft}`,
    },
    sectionIcon: {
      width: '24px', height: '24px', borderRadius: '6px', background: colors.pageBg, display: 'grid', placeItems: 'center', 
      fontSize: '15px', color: colors.navy
    }
  };

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur = (e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Certificates & Recognition</h1>
          <p style={styles.pageDescription}>
            Design professional e-certificates for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
          </p>
        </div>
        <button
          style={styles.btn(activeBtnHover === 'gen', true)}
          onMouseEnter={() => setActiveBtnHover('gen')}
          onMouseLeave={() => setActiveBtnHover(null)}
          onClick={() => showToast(`Generating ${targetList.length} certificate(s)...`, 'success')}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>workspace_premium</span>
          Generate All ({targetList.length})
        </button>
      </div>

      <div style={styles.mainGrid}>
        {/* ── LEFT: PURE PREVIEW (Col 1-7) ── */}
        <div style={{ gridColumn: isMobile ? 'span 12' : 'span 7', position: 'sticky', top: '24px' }}>
          <div style={{ padding: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>auto_awesome</span>
            <span style={{ fontWeight: 800, fontSize: '15px', color: colors.navy, letterSpacing: '-0.01em' }}>Design Canvas</span>
          </div>

          <div style={{ 
            borderRadius: '18px', 
            overflow: 'hidden', 
            boxShadow: '0 35px 80px rgba(0,0,0,0.22)',
            margin: '0 auto',
            width: '100%',
            maxWidth: certOrientation === 'landscape' ? '820px' : '580px',
            transition: 'max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `6px solid #fff`,
            background: '#fff'
          }}>
            <div style={{ 
              aspectRatio: certOrientation === 'landscape' ? PAPER_SIZES[paperSize].ratio : 1 / PAPER_SIZES[paperSize].ratio,
              background: bgImage ? `url(${bgImage})` : selectedTemplate.bg,
              backgroundPosition: `${bgX}% ${bgY}%`,
              backgroundSize: bgImage ? (bgStretch ? '100% 100%' : `${bgScale}%`) : 'cover',
              backgroundRepeat: 'no-repeat',
              padding: `60px`, 
              border: bgImage ? 'none' : `16px ${selectedTemplate.borderStyle} ${selectedTemplate.border}`, 
              borderRadius: '2px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center', 
              position: 'relative',
              transition: 'all 0.3s ease',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}>
              {!bgImage && [['0px', null, '0px', null], ['0px', null, null, '0px'], [null, '12px', '0px', null], [null, '12px', null, '0px']].map((pos, i) => (
                <div key={i} style={{ 
                  position: 'absolute', top: pos[0] !== null ? '20px' : undefined, bottom: pos[1] !== null ? '20px' : undefined, left: pos[2] !== null ? '20px' : undefined, right: pos[3] !== null ? '20px' : undefined, 
                  width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ position: 'absolute', inset: 0, borderTop: pos[0] !== null ? `4px solid ${selectedTemplate.border}` : 'none', borderBottom: pos[1] !== null ? `4px solid ${selectedTemplate.border}` : 'none', borderLeft: pos[2] !== null ? `4px solid ${selectedTemplate.border}` : 'none', borderRight: pos[3] !== null ? `4px solid ${selectedTemplate.border}` : 'none' }} />
                  {selectedTemplate.type === 'ornate' && <div style={{ width: '30px', height: '30px', border: `2px solid ${selectedTemplate.border}`, transform: 'rotate(45deg)', opacity: 0.8 }} />}
                  {selectedTemplate.type === 'filigree' && <div style={{ display: 'flex', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedTemplate.border }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedTemplate.border }} /><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedTemplate.border }} /></div>}
                  {selectedTemplate.type === 'circuit' && <div style={{ width: '30px', height: '30px', border: `1px solid ${selectedTemplate.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '4px', height: '4px', background: selectedTemplate.border, borderRadius: '50%' }} /></div>}
                  {selectedTemplate.type === 'simple' && <div style={{ width: '10px', height: '10px', border: `2px solid ${selectedTemplate.border}`, borderRadius: '50%' }} />}
                  {selectedTemplate.type === 'fancy' && <div style={{ width: '40px', height: '40px', border: `2px solid ${selectedTemplate.border}`, borderRadius: '50%', display: 'grid', placeItems: 'center' }}><div style={{ width: '20px', height: '20px', border: `1px solid ${selectedTemplate.border}`, transform: 'rotate(45deg)' }} /></div>}
                </div>
              ))}
              {!bgImage && selectedTemplate.type === 'circuit' && <div style={{ position: 'absolute', inset: '10px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1 }} />}
              {!bgImage && selectedTemplate.type === 'simple' && <div style={{ position: 'absolute', inset: '16px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.05 }} />}
              {!bgImage && selectedTemplate.type === 'fancy' && <><div style={{ position: 'absolute', inset: '8px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1, borderRadius: '4px' }} /><div style={{ position: 'absolute', inset: '24px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.1, borderRadius: '2px' }} /></>}
              {!bgImage && selectedTemplate.type === 'ornate' && <div style={{ position: 'absolute', inset: '40px', border: `1px solid ${selectedTemplate.border}`, opacity: 0.2, borderRadius: '2px' }} />}
              {!bgImage && selectedTemplate.type === 'filigree' && <div style={{ position: 'absolute', inset: '0', padding: '12px' }}><div style={{ width: '100%', height: '100%', border: `1px dashed ${selectedTemplate.border}`, opacity: 0.15 }} /></div>}

              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: (bgImage || !selectedTemplate.isDark) ? colors.navy : selectedTemplate.accent, marginBottom: '20px', opacity: 0.9 }}>StandingsHQ · Official Recognition</div>
                <div style={{ fontSize: '56px', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>CERTIFICATE</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: (bgImage || !selectedTemplate.isDark) ? colors.inkSoft : 'rgba(255,255,255,0.6)', marginBottom: '24px', letterSpacing: '0.1em' }}>OF ACHIEVEMENT & EXCELLENCE</div>
                <div style={{ fontSize: '15px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMid : 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>This prestigious award is proudly presented to</div>
                <div style={{ fontSize: '42px', fontFamily: "Georgia, serif", fontStyle: 'italic', color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff', marginBottom: '20px', borderBottom: `2px solid ${bgImage || !selectedTemplate.isDark ? colors.borderSoft : selectedTemplate.border}`, paddingBottom: '16px', minWidth: '320px', fontWeight: 700 }}>{recipientName || 'Recipient Name'}</div>
                <div style={{ fontSize: '14px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkSoft : 'rgba(255,255,255,0.8)', maxWidth: '540px', lineHeight: 1.8, marginBottom: '40px', fontStyle: 'italic' }}>{bodyText || 'Your certificate text will appear here.'}</div>
                <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {signatories.map(s => (
                    <div key={s.id} style={{ textAlign: 'center', minWidth: '140px', position: 'relative' }}>
                      {s.esign && (
                        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '100px', pointerEvents: 'none' }}>
                           <img src={s.esign} alt="Sign" style={{ width: '100%', filter: 'contrast(1.2) brightness(0.9) grayscale(0.2)', mixBlendMode: 'multiply' }} />
                        </div>
                      )}
                      <div style={{ width: '100%', borderTop: `1px solid ${bgImage || !selectedTemplate.isDark ? colors.borderSoft : selectedTemplate.border}`, marginBottom: '10px', opacity: 0.6 }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMuted : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.title}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 <div style={{ fontSize: '11px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMuted : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>DATE: {selectedEvent.startDate}</div>
                 <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: `1px solid ${bgImage || !selectedTemplate.isDark ? colors.border : 'rgba(255,255,255,0.2)'}`, display: 'grid', placeItems: 'center' }}><span className="material-symbols-rounded" style={{ fontSize: '20px', color: (bgImage || !selectedTemplate.isDark) ? colors.navy : '#fff', opacity: 0.5 }}>verified</span></div>
                 <div style={{ fontSize: '11px', color: (bgImage || !selectedTemplate.isDark) ? colors.inkMuted : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>EVENT ID: #SHQ-2026-{selectedEvent.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: TOOLS (Col 8-12) ── */}
        <div style={{ gridColumn: isMobile ? 'span 12' : 'span 5', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Section: Content */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('content')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">edit_note</span></div>
                Certificate Content
              </div>
              <span className="material-symbols-rounded">{expandedSections.content ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.content && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={styles.label}>Type</label>
                      <select style={styles.input} value={certType} onChange={e => setCertType(e.target.value)}>
                        <option value="champion">Champion Award</option>
                        <option value="participation">Participation</option>
                        <option value="recognition">Recognition</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Sample Name</label>
                      <input type="text" style={styles.input} placeholder="Recipient Name" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ ...styles.label, margin: 0 }}>Message Body</label>
                      <button style={{ ...styles.btn(activeBtnHover === 'aiw'), height: '28px', padding: '0 10px', borderRadius: '8px' }} onClick={handleAIGenerate} disabled={aiLoading} onMouseEnter={() => setActiveBtnHover('aiw')} onMouseLeave={() => setActiveBtnHover(null)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>smart_toy</span> AI Write
                      </button>
                    </div>
                    <textarea style={{ ...styles.input, height: 'auto', padding: '12px', resize: 'vertical' }} rows={3} value={customText} onChange={e => setCustomText(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Visual & Templates */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('design')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">brush</span></div>
                Visual & Format
              </div>
              <span className="material-symbols-rounded">{expandedSections.design ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.design && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={styles.label}>Paper Size</label>
                      <select style={styles.input} value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                        <option value="a4">A4 (210x297)</option>
                        <option value="letter">Letter (8.5x11)</option>
                        <option value="long">Long (8.5x13)</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>Orientation</label>
                      <select style={styles.input} value={certOrientation} onChange={e => setCertOrientation(e.target.value)}>
                        <option value="landscape">Landscape</option>
                        <option value="portrait">Portrait</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label style={styles.label}>Built-in Borders</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {BORDER_TEMPLATES.map(t => (
                        <div key={t.id} onClick={() => setSelectedTemplate(t)} style={{
                          cursor: 'pointer', borderRadius: '10px', height: '40px', background: t.bg, border: `2px solid ${selectedTemplate.id === t.id ? colors.accent : colors.borderSoft}`,
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{ width: '80%', height: '60%', border: `1px solid ${t.border}`, borderRadius: '2px', opacity: 0.5 }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${colors.borderSoft}`, paddingTop: '16px' }}>
                    <label style={styles.label}>Background Border Image</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ ...styles.btn(activeBtnHover === 'upl-img'), flex: 1, cursor: 'pointer', height: '36px' }} onMouseEnter={() => setActiveBtnHover('upl-img')} onMouseLeave={() => setActiveBtnHover(null)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload_file</span>
                        Upload Image
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                      </label>
                      {bgImage && (
                        <button style={styles.btnIcon(activeBtnHover === 'clr-img', true)} onClick={() => setBgImage(null)} onMouseEnter={() => setActiveBtnHover('clr-img')} onMouseLeave={() => setActiveBtnHover(null)}>
                          <span className="material-symbols-rounded">delete</span>
                        </button>
                      )}
                    </div>
                    {bgImage && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <input type="checkbox" id="stretch" checked={bgStretch} onChange={e => setBgStretch(e.target.checked)} />
                           <label htmlFor="stretch" style={{ fontSize: '11.5px', fontWeight: 600, color: colors.navy }}>Stretch to Full Page</label>
                        </div>
                        {!bgStretch && <>
                          <div><label style={styles.label}>Scale: {bgScale}%</label><input type="range" min="50" max="250" value={bgScale} onChange={e => setBgScale(e.target.value)} style={{ width: '100%' }} /></div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div><label style={styles.label}>X: {bgX}%</label><input type="range" min="0" max="100" value={bgX} onChange={e => setBgX(e.target.value)} style={{ width: '100%' }} /></div>
                            <div><label style={styles.label}>Y: {bgY}%</label><input type="range" min="0" max="100" value={bgY} onChange={e => setBgY(e.target.value)} style={{ width: '100%' }} /></div>
                          </div>
                        </>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Signatories */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('sigs')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">verified_user</span></div>
                Authentication
              </div>
              <span className="material-symbols-rounded">{expandedSections.sigs ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.sigs && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {signatories.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: colors.pageBg, borderRadius: '12px' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.navy }}>{s.name}</div>
                          <div style={{ fontSize: '11px', color: colors.inkMuted }}>{s.title}</div>
                        </div>
                        {s.esign && (
                          <div style={{ background: colors.successBg, color: colors.success, fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>SIGNED</div>
                        )}
                      </div>
                      <button style={styles.btnIcon(activeBtnHover === `rs-${s.id}`, true)} onClick={() => removeSig(s.id)} onMouseEnter={() => setActiveBtnHover(`rs-${s.id}`)} onMouseLeave={() => setActiveBtnHover(null)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                      </button>
                    </div>
                  ))}
                  {showAddSig ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>
                      <input type="text" style={styles.input} placeholder="Signatory Name" value={newSig.name} onChange={e => setNewSig(p => ({ ...p, name: e.target.value }))} autoFocus />
                      <input type="text" style={styles.input} placeholder="Title" value={newSig.title} onChange={e => setNewSig(p => ({ ...p, title: e.target.value }))} />
                      
                      <label style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '10px',
                        background: '#fff', border: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'all 0.2s'
                      }}>
                        <input type="file" hidden accept="image/*" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewSig(p => ({ ...p, esign: reader.result }));
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <span className="material-symbols-rounded" style={{ fontSize: '18px', color: newSig.esign ? colors.success : colors.inkMuted }}>
                          {newSig.esign ? 'task_alt' : 'draw'}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: colors.navy }}>
                          {newSig.esign ? 'E-Signature Attached' : 'Attach Signature (Optional)'}
                        </span>
                      </label>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ ...styles.btn(false), flex: 1, height: '32px' }} onClick={() => setShowAddSig(false)}>Cancel</button>
                        <button style={{ ...styles.btn(false, true), flex: 1, height: '32px' }} onClick={handleAddSig}>Add</button>
                      </div>
                    </div>
                  ) : (
                    <button style={{ ...styles.btn(activeBtnHover === 'adds'), width: '100%', height: '36px', borderStyle: 'dashed' }} onClick={() => setShowAddSig(true)} onMouseEnter={() => setActiveBtnHover('adds')} onMouseLeave={() => setActiveBtnHover(null)}>
                      <span className="material-symbols-rounded">add</span> Signatory
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Export */}
          <div style={styles.formSection}>
            <div style={styles.collapseHeader} onClick={() => toggleSection('bulk')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.sectionIcon}><span className="material-symbols-rounded">rocket_launch</span></div>
                Generate & Export
              </div>
              <span className="material-symbols-rounded">{expandedSections.bulk ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
            </div>
            {expandedSections.bulk && (
              <div style={styles.formSectionBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={styles.label}>Bulk Target</label>
                    <select style={styles.input} value={bulkRecipient} onChange={e => setBulkRecipient(e.target.value)}>
                      <option value="all">All Recipients ({participants.length})</option>
                      <option value="winners">Winners Only (Top 3)</option>
                      <option value="registered">Registered Only</option>
                    </select>
                  </div>
                  <button style={{ ...styles.btn(activeBtnHover === 'bulk-g', true), width: '100%', height: '44px' }} onClick={() => showToast(`Exporting certificates...`, 'success')} onMouseEnter={() => setActiveBtnHover('bulk-g')} onMouseLeave={() => setActiveBtnHover(null)}>
                    <span className="material-symbols-rounded">download</span> Export Certificates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
