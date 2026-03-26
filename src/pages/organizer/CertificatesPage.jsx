import React, { useState } from 'react';
import { useEventContext } from './OrganizerLayout';

const BORDER_TEMPLATES = [
  { id: 'classic',   name: 'Classic Gold',    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '#D4AF37', accent: '#D4AF37' },
  { id: 'navy',      name: 'Navy Royal',      bg: 'linear-gradient(135deg, #0F1F3D 0%, #1A3460 100%)', border: 'rgba(59,130,246,0.8)', accent: '#60A5FA' },
  { id: 'sage',      name: 'Emerald Prestige',bg: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', border: 'rgba(52,211,153,0.5)', accent: '#6EE7B7' },
  { id: 'crimson',   name: 'Crimson Honor',   bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', border: 'rgba(252,165,165,0.4)', accent: '#FCA5A5' },
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

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="page-description">Design and generate e-certificates for <strong style={{ color: 'var(--navy)' }}>{selectedEvent.name}</strong>.</p>
        </div>
        <button className="primary-btn" onClick={() => showToast(`Generating ${targetList.length} certificate(s)...`, 'success')}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>workspace_premium</span>
          Generate All ({targetList.length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left: Preview + Builder ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Certificate Preview */}
          <div>
            <div style={{ padding: '8px 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '18px' }}>preview</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)' }}>Live Preview</span>
            </div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ background: selectedTemplate.bg, padding: '48px 48px', border: `4px solid ${selectedTemplate.border}`, borderRadius: 'var(--radius-lg)', minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
                {/* Decorative corners */}
                {['0 0', '0 auto', 'auto 0', 'auto auto'].map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', top: i < 2 ? '12px' : undefined, bottom: i >= 2 ? '12px' : undefined, left: i % 2 === 0 ? '12px' : undefined, right: i % 2 === 1 ? '12px' : undefined, width: '28px', height: '28px', border: `2px solid ${selectedTemplate.border}`, borderRadius: '2px', opacity: 0.4 }} />
                ))}

                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: selectedTemplate.accent, marginBottom: '12px', opacity: 0.9 }}>
                  StandingsHQ · Certificate of Achievement
                </div>

                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '18px' }}>
                  This is to certify that
                </div>

                <div style={{ fontSize: '32px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#fff', marginBottom: '18px', borderBottom: `1px solid ${selectedTemplate.border}`, paddingBottom: '14px', minWidth: '200px', opacity: 0.97 }}>
                  {recipientName || 'Recipient Name'}
                </div>

                <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.75)', maxWidth: '480px', lineHeight: 1.8, marginBottom: '32px' }}>
                  {bodyText || 'Your certificate text will appear here. Fill in the form or use AI to generate it.'}
                </div>

                {/* Signatories */}
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
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">edit</span> Certificate Content</div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="custom-label">Certificate Type</label>
                  <select className="custom-input" value={certType} onChange={e => setCertType(e.target.value)}>
                    <option value="champion">Champion Award</option>
                    <option value="participation">Certificate of Participation</option>
                    <option value="recognition">Certificate of Recognition</option>
                  </select>
                </div>
                <div>
                  <label className="custom-label">Preview Recipient Name</label>
                  <input type="text" className="custom-input" placeholder="e.g. Juan Dela Cruz" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="custom-label" style={{ margin: 0 }}>Body Text</label>
                  <button className="secondary-btn" style={{ padding: '5px 12px', fontSize: '12.5px' }} onClick={handleAIGenerate} disabled={aiLoading}>
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>{aiLoading ? 'refresh' : 'smart_toy'}</span>
                    {aiLoading ? 'Generating...' : 'AI Write'}
                  </button>
                </div>
                <textarea className="custom-input" rows={4} value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="Write the certificate body text or use AI to generate it..." style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Settings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
          {/* Border Templates */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">palette</span> Border Template</div>
            <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {BORDER_TEMPLATES.map(t => (
                <div key={t.id} onClick={() => setSelectedTemplate(t)} style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: `2px solid ${selectedTemplate.id === t.id ? 'var(--accent)' : 'transparent'}`, transition: 'all var(--transition)', boxShadow: selectedTemplate.id === t.id ? '0 0 0 3px var(--accent-bg)' : 'none' }}>
                  <div style={{ background: t.bg, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '80%', height: '80%', border: `2px solid ${t.border}`, borderRadius: '4px', opacity: 0.6 }} />
                  </div>
                  <div style={{ padding: '6px 8px', background: '#fff', fontSize: '11.5px', fontWeight: 700, color: 'var(--navy)', textAlign: 'center' }}>{t.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatories */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">co_present</span> Signatories</div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {signatories.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--page-bg)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--navy)' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{s.title}</div>
                  </div>
                  <button className="btn-icon" style={{ color: 'var(--coral)' }} onClick={() => removeSig(s.id)}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ))}
              {showAddSig ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: '1px dashed var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                  <input type="text" className="custom-input" style={{ padding: '8px 12px' }} placeholder="Full Name" value={newSig.name} onChange={e => setNewSig(p => ({ ...p, name: e.target.value }))} autoFocus />
                  <input type="text" className="custom-input" style={{ padding: '8px 12px' }} placeholder="Title (e.g. Head Judge)" value={newSig.title} onChange={e => setNewSig(p => ({ ...p, title: e.target.value }))} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondary-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '7px' }} onClick={() => setShowAddSig(false)}>Cancel</button>
                    <button className="primary-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '7px' }} onClick={handleAddSig}>Add</button>
                  </div>
                </div>
              ) : (
                <button className="secondary-btn" style={{ justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => setShowAddSig(true)}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span> Add Signatory
                </button>
              )}
            </div>
          </div>

          {/* Bulk Generation */}
          <div className="form-section">
            <div className="form-section-head"><span className="material-symbols-rounded">batch_prediction</span> Bulk Generate</div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="custom-label">Target Recipients</label>
                <select className="custom-input" value={bulkRecipient} onChange={e => setBulkRecipient(e.target.value)}>
                  <option value="all">All Participants ({participants.length})</option>
                  <option value="winners">Top 3 Winners Only</option>
                  <option value="registered">Registered Only ({participants.filter(p => p.status === 'Registered').length})</option>
                </select>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                {targetList.length} certificate{targetList.length !== 1 ? 's' : ''} will be generated with the current design and text.
              </p>
              <button className="primary-btn" style={{ justifyContent: 'center' }} onClick={() => showToast(`Generating ${targetList.length} certificates as PDF...`, 'success')}>
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
