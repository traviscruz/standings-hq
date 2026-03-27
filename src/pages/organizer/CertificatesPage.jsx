import React, { useState } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

const BORDER_TEMPLATES = [
  { id: 'classic', name: 'Classic Gold', bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '#D4AF37', accent: '#D4AF37' },
  { id: 'navy', name: 'Navy Royal', bg: 'linear-gradient(135deg, #0F1F3D 0%, #1A3460 100%)', border: 'rgba(59,130,246,0.8)', accent: '#60A5FA' },
  { id: 'sage', name: 'Emerald Prestige', bg: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', border: 'rgba(52,211,153,0.5)', accent: '#6EE7B7' },
  { id: 'crimson', name: 'Crimson Honor', bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', border: 'rgba(252,165,165,0.4)', accent: '#FCA5A5' },
];

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
  const [newSig, setNewSig] = useState({ name: '', title: '' });
  const [showAddSig, setShowAddSig] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [bulkRecipient, setBulkRecipient] = useState('all');
  const [activeBtnHover, setActiveBtnHover] = useState(null);

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
    setSignatories(prev => [...prev, { id: Date.now(), ...newSig }]);
    setNewSig({ name: '', title: '' });
    setShowAddSig(false);
    showToast('Signatory added.', 'success');
  };

  const removeSig = (id) => setSignatories(prev => prev.filter(s => s.id !== id));

  const targetList = participants.filter(p => {
    if (bulkRecipient === 'all') return true;
    if (bulkRecipient === 'winners') {
      const ranked = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      return ranked.slice(0, 3).some(r => r.id === p.id);
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
  };

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur = (e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; };

  return (
    <>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Certificates</h1>
          <p style={styles.pageDescription}>
            Design and generate e-certificates for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left: Preview + Builder ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Certificate Preview */}
          <div>
            <div style={{ padding: '4px 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '18px' }}>preview</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: colors.navy }}>Live Preview</span>
            </div>
            <div style={{ borderRadius: '18px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
              <div style={{ background: selectedTemplate.bg, padding: '48px', border: `4px solid ${selectedTemplate.border}`, borderRadius: '18px', minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
                {[['0px', null, '0px', null], ['0px', null, null, '0px'], [null, '12px', '0px', null], [null, '12px', null, '0px']].map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', top: pos[0] !== null ? '12px' : undefined, bottom: pos[1] !== null ? '12px' : undefined, left: pos[2] !== null ? '12px' : undefined, right: pos[3] !== null ? '12px' : undefined, width: '28px', height: '28px', border: `2px solid ${selectedTemplate.border}`, borderRadius: '2px', opacity: 0.4 }} />
                ))}
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: selectedTemplate.accent, marginBottom: '12px', opacity: 0.9 }}>
                  StandingsHQ · Certificate of Achievement
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '18px' }}>This is to certify that</div>
                <div style={{ fontSize: '32px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#fff', marginBottom: '18px', borderBottom: `1px solid ${selectedTemplate.border}`, paddingBottom: '14px', minWidth: '200px', opacity: 0.97 }}>
                  {recipientName || 'Recipient Name'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.75)', maxWidth: '480px', lineHeight: 1.8, marginBottom: '32px' }}>
                  {bodyText || 'Your certificate text will appear here. Fill in the form or use AI to generate it.'}
                </div>
                <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {signatories.map(s => (
                    <div key={s.id} style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ width: '100%', borderTop: `1px solid ${selectedTemplate.border}`, marginBottom: '8px', opacity: 0.5 }} />
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', opacity: 0.9 }}>{s.name}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{s.title}</div>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'absolute', bottom: '18px', right: '18px', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                  {selectedEvent.name} · {selectedEvent.startDate}
                </div>
              </div>
            </div>
          </div>

          {/* Content Builder */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">edit</span> Certificate Content
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={styles.label}>Certificate Type</label>
                  <select style={styles.input} value={certType} onChange={e => setCertType(e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="champion">Champion Award</option>
                    <option value="participation">Certificate of Participation</option>
                    <option value="recognition">Certificate of Recognition</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Preview Recipient Name</label>
                  <input type="text" style={styles.input} placeholder="e.g. Juan Dela Cruz" value={recipientName} onChange={e => setRecipientName(e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, margin: 0 }}>Body Text</label>
                  <button
                    style={styles.btn(activeBtnHover === 'aiw')}
                    onClick={handleAIGenerate}
                    disabled={aiLoading}
                    onMouseEnter={() => setActiveBtnHover('aiw')}
                    onMouseLeave={() => setActiveBtnHover(null)}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>{aiLoading ? 'refresh' : 'smart_toy'}</span>
                    {aiLoading ? 'Generating...' : 'AI Write'}
                  </button>
                </div>
                <textarea
                  style={{ ...styles.input, height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                  rows={4} value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="Write the certificate body text or use AI to generate it..."
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Settings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
          {/* Border Templates */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">palette</span> Border Template
            </div>
            <div style={{ ...styles.formSectionBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {BORDER_TEMPLATES.map(t => (
                <div key={t.id} onClick={() => setSelectedTemplate(t)} style={{
                  cursor: 'pointer', borderRadius: '12px', overflow: 'hidden',
                  border: `2px solid ${selectedTemplate.id === t.id ? colors.accent : 'transparent'}`,
                  transition: 'all 0.2s',
                  boxShadow: selectedTemplate.id === t.id ? `0 0 0 3px ${colors.accentGlow}` : 'none',
                }}>
                  <div style={{ background: t.bg, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '80%', height: '80%', border: `2px solid ${t.border}`, borderRadius: '4px', opacity: 0.6 }} />
                  </div>
                  <div style={{ padding: '6px 8px', background: '#fff', fontSize: '11.5px', fontWeight: 700, color: colors.navy, textAlign: 'center' }}>{t.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatories */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">co_present</span> Signatories
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {signatories.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: colors.pageBg, borderRadius: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: colors.navy }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: colors.inkMuted }}>{s.title}</div>
                  </div>
                  <button
                    style={styles.btnIcon(activeBtnHover === `rs-${s.id}`, true)}
                    onClick={() => removeSig(s.id)}
                    onMouseEnter={() => setActiveBtnHover(`rs-${s.id}`)}
                    onMouseLeave={() => setActiveBtnHover(null)}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ))}
              {showAddSig ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>
                  <input type="text" style={styles.input} placeholder="Full Name" value={newSig.name} onChange={e => setNewSig(p => ({ ...p, name: e.target.value }))} autoFocus onFocus={inputFocus} onBlur={inputBlur} />
                  <input type="text" style={styles.input} placeholder="Title (e.g. Head Judge)" value={newSig.title} onChange={e => setNewSig(p => ({ ...p, title: e.target.value }))} onFocus={inputFocus} onBlur={inputBlur} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ ...styles.btn(activeBtnHover === 'cxs'), flex: 1 }} onClick={() => setShowAddSig(false)} onMouseEnter={() => setActiveBtnHover('cxs')} onMouseLeave={() => setActiveBtnHover(null)}>Cancel</button>
                    <button style={{ ...styles.btn(activeBtnHover === 'ads', true), flex: 1 }} onClick={handleAddSig} onMouseEnter={() => setActiveBtnHover('ads')} onMouseLeave={() => setActiveBtnHover(null)}>Add</button>
                  </div>
                </div>
              ) : (
                <button
                  style={{ ...styles.btn(activeBtnHover === 'add-sig'), width: '100%', borderStyle: 'dashed' }}
                  onMouseEnter={() => setActiveBtnHover('add-sig')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                  onClick={() => setShowAddSig(true)}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span> Add Signatory
                </button>
              )}
            </div>
          </div>

          {/* Bulk Generation */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">batch_prediction</span> Bulk Generate
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.label}>Target Recipients</label>
                <select style={styles.input} value={bulkRecipient} onChange={e => setBulkRecipient(e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="all">All Participants ({participants.length})</option>
                  <option value="winners">Top 3 Winners Only</option>
                  <option value="registered">Registered Only ({participants.filter(p => p.status === 'Registered').length})</option>
                </select>
              </div>
              <p style={{ fontSize: '12.5px', color: colors.inkMuted, lineHeight: 1.6, margin: 0 }}>
                {targetList.length} certificate{targetList.length !== 1 ? 's' : ''} will be generated with the current design and text.
              </p>
              <button
                style={{ ...styles.btn(activeBtnHover === 'bulk-gen', true), width: '100%' }}
                onMouseEnter={() => setActiveBtnHover('bulk-gen')}
                onMouseLeave={() => setActiveBtnHover(null)}
                onClick={() => showToast(`Generating ${targetList.length} certificates as PDF...`, 'success')}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
                Generate {targetList.length} Certificates
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
