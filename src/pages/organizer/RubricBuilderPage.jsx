import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

/* ─── data ─────────────────────────────────────────────────────────────── */
const TEMPLATES = {
  Sports: [
    { name: 'Athleticism & Technique', weight: 40, maxScore: 10, description: 'Evaluation of master skill and form.' },
    { name: 'Teamwork & Coordination', weight: 30, maxScore: 10, description: 'Efficiency of group communication.' },
    { name: 'Showmanship', weight: 20, maxScore: 10, description: 'Audience engagement and energy.' },
    { name: 'Costume & Props', weight: 10, maxScore: 10, description: 'Aesthetic relevance to theme.' },
  ],
  Academic: [
    { name: 'Content & Logic', weight: 40, maxScore: 10, description: 'Strength of factual logic.' },
    { name: 'Delivery & Presentation', weight: 30, maxScore: 10, description: 'Clarity and confidence.' },
    { name: 'Research Quality', weight: 30, maxScore: 10, description: 'Depth and quality of sources.' },
  ],
  Debate: [
    { name: 'Argumentation', weight: 40, maxScore: 10, description: 'Persuasive logic and clarity.' },
    { name: 'Rebuttal', weight: 35, maxScore: 10, description: 'Ability to counter-argue.' },
    { name: 'Evidence', weight: 25, maxScore: 10, description: 'Factual support and citations.' },
  ],
  Default: [
    { name: 'Innovation', weight: 30, maxScore: 10, description: 'Originality of the approach.' },
    { name: 'Execution', weight: 40, maxScore: 10, description: 'Mastery of the technique.' },
    { name: 'Presence', weight: 20, maxScore: 10, description: 'Impact on the judges/audience.' },
    { name: 'Sustainability', weight: 10, maxScore: 10, description: 'Long-term viability of the concept.' },
  ],
};

function makeId() { return Date.now() + Math.random(); }
function seed(list) { return list.map(c => ({ ...c, id: makeId() })); }
function aiGenerate(prompt) {
  const drafts = [
    [
      { name: 'Innovation', weight: 30, maxScore: 10, description: `Creative depth based on: ${prompt}` },
      { name: 'Execution Quality', weight: 35, maxScore: 10, description: 'How well the task was performed.' },
      { name: 'Clarity', weight: 20, maxScore: 10, description: 'Communication of the core idea.' },
      { name: 'Relevance', weight: 15, maxScore: 10, description: 'Alignment with event objectives.' },
    ],
    [
      { name: 'Skill Mastery', weight: 40, maxScore: 10, description: 'Proficiency in core discipline.' },
      { name: 'Strategic Depth', weight: 25, maxScore: 10, description: 'Decision making and tactical approach.' },
      { name: 'Synergy', weight: 20, maxScore: 10, description: 'Coordination between elements.' },
      { name: 'Professionalism', weight: 15, maxScore: 10, description: 'Conduct and etiquette.' },
    ],
  ];
  return drafts[prompt.length % 2];
}

/* ─── 5-second undo bar ─────────────────────────────────────────────────── */
function UndoBar({ message, onUndo, onDismiss }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const el = Date.now() - start;
      const pct = Math.max(0, 100 - (el / 5000) * 100);
      setProgress(pct);
      if (pct === 0) { clearInterval(iv); onDismiss(); }
    }, 50);
    return () => clearInterval(iv);
  }, [onDismiss]);

  return (
    <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, pointerEvents: 'none' }}>
      <div style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', color: '#fff', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'auto', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'grid', placeItems: 'center', color: colors.accent }}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>info</span>
        </div>
        <span style={{ fontSize: '13.5px', fontWeight: 500, flex: 1 }}>{message}</span>
        <button onClick={onUndo} style={{ background: 'none', border: 'none', color: colors.accent, fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Undo</button>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'grid', placeItems: 'center' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
        </button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: `${progress}%`, background: colors.accent, transition: 'width 0.05s linear' }} />
      </div>
    </div>
  );
}

function useUndo() {
  const [state, setState] = useState(null);
  const timerRef = useRef(null);
  const show = useCallback((msg, fn) => {
    clearTimeout(timerRef.current);
    setState({ msg, fn });
    timerRef.current = setTimeout(() => setState(null), 5000);
  }, []);
  const dismiss = useCallback(() => { clearTimeout(timerRef.current); setState(null); }, []);
  const doUndo = useCallback(() => { state?.fn?.(); dismiss(); }, [state, dismiss]);
  const bar = state ? <UndoBar message={state.msg} onUndo={doUndo} onDismiss={dismiss} /> : null;
  return { show, bar };
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function RubricBuilderPage() {
  const { selectedEvent, rubrics, setRubrics, showToast, eventsLoading } = useEventContext();
  const undo = useUndo();

  const [criteria, setCriteria] = useState(rubrics.length > 0 ? rubrics : []);
  const [mode, setMode] = useState(rubrics.length > 0 ? 'edit' : 'choose');
  const [scoringMode, setScoringMode] = useState('Standard Average');
  const [decimals, setDecimals] = useState('1 Decimal');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const aiRef = useRef(null);

  const totalWeight = criteria.reduce((s, c) => s + Number(c.weight), 0);
  const isComplete = totalWeight === 100 && criteria.length > 0;

  const handleApplyTemplate = () => {
    const snap = [...criteria];
    setCriteria(seed(TEMPLATES[selectedEvent.type] || TEMPLATES.Default));
    setMode('edit');
    showToast('Template applied successfully.', 'success', () => { setCriteria(snap); showToast('Reverted to previous state.', 'info'); });
  };

  const handleCreateBlank = () => {
    setCriteria([{ id: makeId(), name: 'New Criterion', weight: 0, maxScore: 10, description: '' }]);
    setMode('edit');
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setShowAiModal(false);
    setAiLoading(true);
    const snap = [...criteria];
    setTimeout(() => {
      setCriteria(seed(aiGenerate(aiPrompt.trim())));
      setMode('edit');
      setAiLoading(false);
      showToast('AI rubric generated.', 'success', () => { setCriteria(snap); showToast('AI generation undone.', 'info'); });
    }, 1500);
  };

  const updateC = (id, key, val) =>
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, [key]: key === 'weight' || key === 'maxScore' ? Number(val) || 0 : val } : c));

  const removeC = (id) => {
    const item = criteria.find(c => c.id === id);
    const idx = criteria.indexOf(item);
    setCriteria(prev => prev.filter(c => c.id !== id));
    undo.show('Criterion removed', () => {
      setCriteria(prev => { const next = [...prev]; next.splice(idx, 0, item); return next; });
    });
  };

  const addC = () => setCriteria(prev => [...prev, { id: makeId(), name: 'New Criterion', weight: 0, maxScore: 10, description: '' }]);

  const handleSave = () => {
    setRubrics(selectedEvent.id, criteria);
    showToast('Rubric configuration saved successfully.', 'success');
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
      padding: '9px 18px',
      borderRadius: '12px',
      fontSize: '13.5px',
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
      fontSize: '10.5px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: colors.inkMuted,
      marginBottom: '6px',
      display: 'block',
    },
    input: {
      width: '100%',
      height: '40px',
      padding: '0 12px',
      border: `1.5px solid ${colors.border}`,
      borderRadius: '10px',
      fontSize: '13.5px',
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
      background: 'rgba(15, 31, 61, 0.5)',
      backdropFilter: 'blur(12px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out forwards',
    },
    modalContainer: (maxWidth = '540px') => ({
      background: '#fff',
      borderRadius: '24px',
      width: '100%',
      maxWidth: maxWidth,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'modalUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
    }),
    modalHeader: {
      padding: '40px 48px 24px',
      textAlign: 'center',
    },
    modalBody: {
      padding: '0 48px 32px',
      overflowY: 'auto',
      flex: 1,
    },
    modalFooter: {
      padding: '0 48px 48px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    closeBtn: {
      position: 'absolute',
      top: '24px',
      right: '24px',
      background: colors.pageBg,
      border: 'none',
      cursor: 'pointer',
      color: colors.inkMuted,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      transition: 'all 0.2s',
      zIndex: 10
    },
    modalTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '24px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.02em',
      margin: 0,
      marginBottom: '10px',
    },
  };

  const inputFocus = (e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; };
  const inputBlur = (e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; };

  if (eventsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: '12px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Loading rubric settings…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>event_busy</span>
        <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No event selected.</p>
      </div>
    );
  }

  /* ── CHOOSE VIEW ── */
  if (mode === 'choose') {
    return (
      <>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Rubrics &amp; Scoring</h1>
            <p style={styles.pageDescription}>
              Start by selecting a rubric creation method for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
            </p>
          </div>
        </div>

        {aiLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 0', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', border: `3px solid ${colors.borderSoft}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
            <p style={{ color: colors.inkMuted, fontSize: '15px', fontWeight: 500 }}>Architecting your AI rubric configuration...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px' }}>
            <ChoiceCard title="Standard Template" desc={`Load a pre-configured rubric optimized for ${selectedEvent.type || 'your event'}.`} icon="auto_awesome" label="Recommended" primary onClick={handleApplyTemplate} />
            <ChoiceCard title="AI Generation" desc="Explain your goals and let StandingsHQ AI balance your criteria and weights." icon="smart_toy" label="AI-Powered" onClick={() => { setAiPrompt(''); setShowAiModal(true); setTimeout(() => aiRef.current?.focus(), 100); }} />
            <ChoiceCard title="Manual Build" desc="Start from scratch and define every scoring attribute yourself." icon="edit_square" onClick={handleCreateBlank} />
          </div>
        )}

        {showAiModal && (
          <AiModal
            show={showAiModal}
            onClose={() => setShowAiModal(false)}
            onGenerate={handleAiGenerate}
            prompt={aiPrompt}
            setPrompt={setAiPrompt}
            inputRef={aiRef}
            styles={styles}
            inputFocus={inputFocus}
            inputBlur={inputBlur}
          />
        )}
      </>
    );
  }

  /* ── EDIT VIEW ── */
  return (
    <>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Rubrics &amp; Scoring</h1>
          <p style={styles.pageDescription}>
            Customize scoring criteria for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            style={styles.btn(activeBtnHover === 'air')}
            onClick={() => setShowAiModal(true)}
            onMouseEnter={() => setActiveBtnHover('air')}
            onMouseLeave={() => setActiveBtnHover(null)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>smart_toy</span> AI Regenerate
          </button>
          <button
            style={styles.btn(activeBtnHover === 'rst')}
            onClick={() => setMode('choose')}
            onMouseEnter={() => setActiveBtnHover('rst')}
            onMouseLeave={() => setActiveBtnHover(null)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>refresh</span> Reset
          </button>
          <button
            style={styles.btn(activeBtnHover === 'sav', true)}
            onClick={handleSave}
            disabled={!isComplete}
            onMouseEnter={() => setActiveBtnHover('sav')}
            onMouseLeave={() => setActiveBtnHover(null)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>
            {totalWeight === 100 ? 'Save Rubric' : `Allocation: ${totalWeight}%`}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
        {/* ── Left: Criteria ── */}
        <div style={styles.formSection}>
          <div style={{ ...styles.formSectionHead, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-rounded">checklist</span>
              Configured Criteria
            </div>
            <div style={{
              fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px',
              background: totalWeight === 100 ? '#ecfdf5' : colors.pageBg,
              color: totalWeight === 100 ? '#059669' : colors.inkMuted,
              border: '1px solid currentColor', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {totalWeight}% Weight Total
            </div>
          </div>
          <div>
            {criteria.map((item, idx) => (
              <div key={item.id} style={{ padding: '24px', borderBottom: idx < criteria.length - 1 ? `1px solid ${colors.borderSoft}` : 'none', display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px', gap: '14px' }}>
                    <div>
                      <label style={styles.label}>Criterion Name</label>
                      <input type="text" style={styles.input} value={item.name} onChange={e => updateC(item.id, 'name', e.target.value)} placeholder="e.g. Creativity" onFocus={inputFocus} onBlur={inputBlur} />
                    </div>
                    <div>
                      <label style={styles.label}>Weight</label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" style={{ ...styles.input, fontWeight: 800, paddingRight: '28px', color: colors.accent }} value={item.weight} onChange={e => updateC(item.id, 'weight', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, fontSize: '14px', color: colors.accent, pointerEvents: 'none' }}>%</span>
                      </div>
                    </div>
                    <div>
                      <label style={styles.label}>Max Pts</label>
                      <input type="number" style={{ ...styles.input, fontWeight: 700 }} value={item.maxScore} onChange={e => updateC(item.id, 'maxScore', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                    </div>
                  </div>
                  <div>
                    <label style={styles.label}>Guideline Description</label>
                    <input type="text" style={{ ...styles.input, fontSize: '13px', color: colors.inkMuted }} value={item.description} onChange={e => updateC(item.id, 'description', e.target.value)} placeholder="Guidelines for judges evaluating this criterion..." onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>
                <button
                  onClick={() => removeC(item.id)}
                  onMouseEnter={() => setActiveBtnHover(`rm-${item.id}`)}
                  onMouseLeave={() => setActiveBtnHover(null)}
                  style={{
                    alignSelf: 'flex-start', marginTop: '26px',
                    background: activeBtnHover === `rm-${item.id}` ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
                    border: 'none', color: '#DC2626', width: '40px', height: '40px',
                    borderRadius: '10px', display: 'grid', placeItems: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                </button>
              </div>
            ))}
            <div style={{ padding: '20px 24px' }}>
              <button
                style={{ ...styles.btn(activeBtnHover === 'add-c'), width: '100%', height: '52px', borderStyle: 'dashed', fontWeight: 700 }}
                onClick={addC}
                onMouseEnter={() => setActiveBtnHover('add-c')}
                onMouseLeave={() => setActiveBtnHover(null)}
              >
                <span className="material-symbols-rounded">add</span> Add Manual Criterion
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
          {/* Scoring Strategy */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">settings</span> Scoring Strategy
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Calculation Mode</label>
                <select style={styles.input} value={scoringMode} onChange={e => setScoringMode(e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                  <option>Standard Average</option>
                  <option>Olympic (Trim Ends)</option>
                  <option>Cumulative Points</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Precision</label>
                <select style={styles.input} value={decimals} onChange={e => setDecimals(e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                  <option>Whole Numbers (9)</option>
                  <option>1 Decimal (9.5)</option>
                  <option>2 Decimals (9.55)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weight Allocation */}
          <div style={styles.formSection}>
            <div style={styles.formSectionHead}>
              <span className="material-symbols-rounded">monitoring</span> Weight Allocation
            </div>
            <div style={{ ...styles.formSectionBody, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ paddingBottom: '14px', borderBottom: `1px solid ${colors.borderSoft}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.inkMuted }}>Status</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: totalWeight > 100 ? '#DC2626' : colors.navy }}>{totalWeight}% / 100%</span>
                </div>
                <div style={{ height: '8px', background: colors.pageBg, borderRadius: '100px', overflow: 'hidden', border: `1px solid ${colors.borderSoft}` }}>
                  <div style={{ height: '100%', width: `${Math.min(totalWeight, 100)}%`, background: totalWeight > 100 ? '#DC2626' : colors.accent, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
              {criteria.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: '13px', color: colors.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{c.name || 'Undefined'}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.navy }}>{c.weight}%</span>
                </div>
              ))}
              {totalWeight !== 100 && (
                <div style={{ marginTop: '8px', padding: '12px', background: totalWeight > 100 ? 'rgba(220,38,38,0.05)' : 'rgba(59,130,246,0.05)', borderRadius: '10px', fontSize: '12.5px', color: totalWeight > 100 ? '#DC2626' : colors.accentDeep, lineHeight: 1.6, display: 'flex', gap: '8px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{totalWeight > 100 ? 'error' : 'info'}</span>
                  {totalWeight > 100 ? `Weights must not exceed 100%. Reduce by ${totalWeight - 100}%.` : `Add ${100 - totalWeight}% more to complete your rubric.`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {undo.bar}

      <AiModal
        show={showAiModal}
        onClose={() => setShowAiModal(false)}
        onGenerate={handleAiGenerate}
        prompt={aiPrompt}
        setPrompt={setAiPrompt}
        inputRef={aiRef}
        styles={styles}
        inputFocus={inputFocus}
        inputBlur={inputBlur}
      />
    </>
  );
}

/* ── Sub-components ── */
function ChoiceCard({ title, desc, icon, label, primary, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `${primary ? '2px' : '1px'} solid ${primary ? colors.accent : (hovered ? colors.border : colors.borderSoft)}`,
        borderRadius: '18px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '18px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: primary ? colors.accent : colors.pageBg, display: 'grid', placeItems: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '32px', color: primary ? '#fff' : colors.inkMuted }}>{icon}</span>
        </div>
        <div>
          {label && <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: primary ? colors.accent : colors.inkMuted, marginBottom: '8px', letterSpacing: '0.05em' }}>{label}</div>}
          <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 800, color: colors.navy }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '14px', color: colors.inkMuted, lineHeight: 1.6 }}>{desc}</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, fontFamily: "'Inter', sans-serif", background: primary ? colors.navy : '#fff', color: primary ? '#fff' : colors.inkSoft, border: primary ? 'none' : `1px solid ${colors.border}` }}>
          Select
        </div>
      </div>
    </div>
  );
}

function AiModal({ show, onClose, onGenerate, prompt, setPrompt, inputRef, styles }) {
  const [btnHover, setBtnHover] = useState(null);
  if (!show) return null;

  return createPortal(
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContainer('540px')} onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          style={styles.closeBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.borderSoft; e.currentTarget.style.color = colors.navy; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = colors.pageBg; e.currentTarget.style.color = colors.inkMuted; }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
        </button>

        <div style={styles.modalHeader}>
          <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: colors.accentBg, color: colors.accent, display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>smart_toy</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: colors.navy, marginBottom: '8px', margin: 0, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>
            AI Rubric Architect
          </h2>
          <p style={{ fontSize: '15px', color: colors.inkMuted, lineHeight: 1.6, margin: 0 }}>
            Explain your event vision and the AI will craft a balanced scoring model for you.
          </p>
        </div>

        <div style={styles.modalBody}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
              Context Prompt
            </label>
            <textarea
              ref={inputRef}
              style={{ 
                width: '100%',
                padding: '16px', 
                borderRadius: '16px', 
                fontSize: '14.5px', 
                lineHeight: 1.6, 
                resize: 'none',
                border: `1px solid ${colors.border}`,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                minHeight: '140px',
                background: colors.pageBg,
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              rows={5}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. A competitive baking event focused on presentation, flavor profile, and technical execution."
              onFocus={(e) => { 
                e.target.style.borderColor = colors.accent; 
                e.target.style.boxShadow = `0 0 0 3px ${colors.accentGlow}`; 
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => { 
                e.target.style.borderColor = colors.border; 
                e.target.style.boxShadow = 'none';
                e.target.style.background = colors.pageBg;
              }}
            />
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button
            onClick={onClose}
            onMouseEnter={() => setBtnHover('c')}
            onMouseLeave={() => setBtnHover(null)}
            style={{ ...styles.btn(btnHover === 'c'), height: '48px', width: '100%', fontSize: '15px' }}
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={!prompt.trim()}
            onMouseEnter={() => setBtnHover('g')}
            onMouseLeave={() => setBtnHover(null)}
            style={{ 
              ...styles.btn(btnHover === 'g', true), 
              height: '48px', 
              width: '100%', 
              fontSize: '15px',
              cursor: !prompt.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            Generate Rubric
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
