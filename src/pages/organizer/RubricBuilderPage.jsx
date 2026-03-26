import React, { useState, useRef, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';

/* ─── criteria data ─────────────────────────────────────────────────────── */
const TEMPLATES = {
  Sports: [
    { name: 'Athleticism & Technique', weight: 40, maxScore: 10, description: 'Evaluation of master skill and form.' },
    { name: 'Teamwork & Coordination', weight: 30, maxScore: 10, description: 'Efficiency of group communication.' },
    { name: 'Showmanship',             weight: 20, maxScore: 10, description: 'Audience engagement and energy.' },
    { name: 'Costume & Props',         weight: 10, maxScore: 10, description: 'Aesthetic relevance to theme.' },
  ],
  Academic: [
    { name: 'Content & Logic',         weight: 40, maxScore: 10, description: 'Strength of factual logic.' },
    { name: 'Delivery & Presentation', weight: 30, maxScore: 10, description: 'Clarity and confidence.' },
    { name: 'Research Quality',        weight: 30, maxScore: 10, description: 'Depth and quality of sources.' },
  ],
  Debate: [
    { name: 'Argumentation',           weight: 40, maxScore: 10, description: 'Persuasive logic and clarity.' },
    { name: 'Rebuttal',                weight: 35, maxScore: 10, description: 'Ability to counter-argue.' },
    { name: 'Evidence',                weight: 25, maxScore: 10, description: 'Factual support and citations.' },
  ],
  Default: [
    { name: 'Innovation',              weight: 30, maxScore: 10, description: 'Originality of the approach.' },
    { name: 'Execution',               weight: 40, maxScore: 10, description: 'Mastery of the technique.' },
    { name: 'Presence',                weight: 20, maxScore: 10, description: 'Impact on the judges/audience.' },
    { name: 'Sustainability',          weight: 10, maxScore: 10, description: 'Long-term viability of the concept.' },
  ],
};

function makeId() { return Date.now() + Math.random(); }
function seed(list) { return list.map(c => ({ ...c, id: makeId() })); }

function aiGenerate(prompt) {
  const drafts = [
    [
      { name: 'Innovation',         weight: 30, maxScore: 10, description: `Creative depth based on: ${prompt}` },
      { name: 'Execution Quality',  weight: 35, maxScore: 10, description: 'How well the task was performed.' },
      { name: 'Clarity',            weight: 20, maxScore: 10, description: 'Communication of the core idea.' },
      { name: 'Relevance',          weight: 15, maxScore: 10, description: 'Alignment with event objectives.' },
    ],
    [
      { name: 'Skill Mastery',      weight: 40, maxScore: 10, description: `Proficiency in core discipline.` },
      { name: 'Strategic Depth',    weight: 25, maxScore: 10, description: 'Decision making and tactical approach.' },
      { name: 'Synergy',            weight: 20, maxScore: 10, description: 'Coordination between elements.' },
      { name: 'Professionalism',    weight: 15, maxScore: 10, description: 'Conduct and etiquette.' },
    ],
  ];
  return drafts[prompt.length % 2];
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function RubricBuilderPage() {
  const { selectedEvent, rubrics, setRubrics, showToast } = useEventContext();

  const [criteria, setCriteria]       = useState(rubrics.length > 0 ? rubrics : []);
  const [mode, setMode]               = useState(rubrics.length > 0 ? 'edit' : 'choose');
  const [scoringMode, setScoringMode] = useState('Standard Average');
  const [decimals, setDecimals]       = useState('1 Decimal');
  const [aiLoading, setAiLoading]     = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt]       = useState('');
  
  // Undo support
  const [undoItem, setUndoItem] = useState(null);
  const undoRef = useRef(null);

  const aiRef = useRef(null);

  const totalWeight  = criteria.reduce((s, c) => s + Number(c.weight), 0);
  const isComplete   = totalWeight === 100 && criteria.length > 0;

  const handleApplyTemplate = () => {
    const snap = [...criteria];
    setCriteria(seed(TEMPLATES[selectedEvent.type] || TEMPLATES.Default));
    setMode('edit');
    showToast('Template applied successfully.', 'success', () => {
      setCriteria(snap);
      showToast('Reverted to previous state.', 'info');
    });
  };

  const handleCreateBlank = () => {
    setCriteria([{ id: makeId(), name: 'New Criterion', weight: 0, maxScore: 10, description: '' }]);
    setMode('edit');
  }

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setShowAiModal(false);
    setAiLoading(true);
    const snap = [...criteria];
    setTimeout(() => {
      setCriteria(seed(aiGenerate(aiPrompt.trim())));
      setMode('edit');
      setAiLoading(false);
      showToast('AI rubric generated.', 'success', () => {
        setCriteria(snap);
        showToast('AI generation undone.', 'info');
      });
    }, 1500);
  };

  const updateC = (id, key, val) => 
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, [key]: key === 'weight' || key === 'maxScore' ? Number(val) || 0 : val } : c));

  const removeC = (id) => {
    const item = criteria.find(c => c.id === id);
    const idx = criteria.indexOf(item);
    setUndoItem({ items: [item], index: idx });
    setCriteria(prev => prev.filter(c => c.id !== id));
    
    if (undoRef.current) clearTimeout(undoRef.current);
    undoRef.current = setTimeout(() => setUndoItem(null), 5000);
  };

  const undoRemove = () => {
    if (!undoItem) return;
    setCriteria(prev => {
      const next = [...prev];
      next.splice(undoItem.index, 0, ...undoItem.items);
      return next;
    });
    setUndoItem(null);
    if (undoRef.current) clearTimeout(undoRef.current);
  };

  const addC = () =>
    setCriteria(prev => [...prev, { id: makeId(), name: 'New Criterion', weight: 0, maxScore: 10, description: '' }]);

  const handleSave = () => {
    setRubrics(selectedEvent.id, criteria);
    showToast('Rubric configuration saved successfully.', 'success');
  };

  /* ────────────────────────────────────────────────
     CHOOSE VIEW
  ────────────────────────────────────────────────── */
  if (mode === 'choose') {
    return (
      <>
        <div className="page-header">
          <div>
            <h1 className="page-title">Rubrics & Scoring</h1>
            <p className="page-description">Start by selecting a rubric creation method for <strong style={{color: 'var(--navy)'}}>{selectedEvent.name}</strong>.</p>
          </div>
        </div>

        {aiLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 0', gap: '20px' }}>
            <div className="loading-spinner" style={{ width: '48px', height: '48px', border: '3px solid var(--border-soft)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
            <p style={{ color: 'var(--ink-muted)', fontSize: '15px', fontWeight: 500 }}>Architecting your AI rubric configuration...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1024px' }}>
            <ChoiceCard
              title="Standard Template"
              desc={`Load a pre-configured rubric optimized for ${selectedEvent.type || 'your event'}.`}
              icon="auto_awesome"
              label="Recommended"
              primary 
              onClick={handleApplyTemplate}
            />
            <ChoiceCard
              title="AI Generation"
              desc="Explain your goals and let StandingsHQ AI balance your criteria and weights."
              icon="smart_toy"
              label="AI-Powered"
              onClick={() => { setAiPrompt(''); setShowAiModal(true); setTimeout(() => aiRef.current?.focus(), 100); }}
            />
            <ChoiceCard
              title="Manual Build"
              desc="Start from scratch and define every scoring attribute yourself."
              icon="edit_square"
              onClick={handleCreateBlank}
            />
          </div>
        )}

        {showAiModal && <AiModal 
          onClose={() => setShowAiModal(false)} 
          onGenerate={handleAiGenerate} 
          prompt={aiPrompt} 
          setPrompt={setAiPrompt} 
          inputRef={aiRef} 
        />}
      </>
    );
  }

  /* ────────────────────────────────────────────────
     EDIT VIEW
  ────────────────────────────────────────────────── */
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rubrics & Scoring</h1>
          <p className="page-description">Customize scoring criteria for your event.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-btn" onClick={() => setShowAiModal(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>smart_toy</span>
            AI Regenerate
          </button>
          <button className="secondary-btn" onClick={() => setMode('choose')}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>refresh</span>
            Reset
          </button>
          <button className="primary-btn" onClick={handleSave} disabled={!isComplete}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>
            {totalWeight === 100 ? 'Save Rubric' : `Allocation: ${totalWeight}%`}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-section" style={{ margin: 0 }}>
            <div className="form-section-head" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-rounded">checklist</span>
                Configured Criteria
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: totalWeight === 100 ? '#ecfdf5' : 'var(--page-bg)', color: totalWeight === 100 ? '#059669' : 'var(--ink-muted)', border: '1px solid currentColor', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {totalWeight}% Weight Total
              </div>
            </div>
            <div className="form-section-body" style={{ padding: 0 }}>
              {criteria.map((item, idx) => (
                <div key={item.id} className="rubric-row" style={{ padding: '24px', borderBottom: idx < criteria.length - 1 ? '1px solid var(--border-soft)' : 'none', display: 'flex', gap: '24px', background: '#fff', transition: 'background 0.2s' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px', gap: '16px' }}>
                      <div className="form-group">
                        <label className="custom-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>CRITERION NAME</label>
                        <input type="text" className="custom-input" style={{ fontWeight: 700, border: '1.5px solid var(--border-soft)' }} value={item.name} onChange={e => updateC(item.id, 'name', e.target.value)} placeholder="e.g. Creativity" />
                      </div>
                      <div className="form-group">
                        <label className="custom-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>WEIGHT</label>
                        <div style={{ position: 'relative' }}>
                          <input type="number" className="custom-input" style={{ fontWeight: 800, paddingRight: '28px', color: 'var(--accent)', border: '1.5px solid var(--border-soft)' }} value={item.weight} onChange={e => updateC(item.id, 'weight', e.target.value)} />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, fontSize: '14px', color: 'var(--accent)', pointerEvents: 'none' }}>%</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="custom-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>MAX PTS</label>
                        <input type="number" className="custom-input" style={{ fontWeight: 700, border: '1.5px solid var(--border-soft)' }} value={item.maxScore} onChange={e => updateC(item.id, 'maxScore', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="custom-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>GUIDELINE DESCRIPTION</label>
                      <input type="text" className="custom-input" style={{ fontSize: '13.5px', color: 'var(--ink-muted)', border: '1.5px solid var(--border-soft)' }} value={item.description} onChange={e => updateC(item.id, 'description', e.target.value)} placeholder="Guidelines for judges evaluating this criterion..." />
                    </div>
                  </div>
                  <button className="btn-icon" style={{ alignSelf: 'flex-start', marginTop: '28px', background: 'rgba(239, 68, 68, 0.08)', color: '#DC2626', width: '40px', height: '40px', borderRadius: '10px' }} onClick={() => removeC(item.id)}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                </div>
              ))}
              
              <div style={{ padding: '24px' }}>
                <button className="secondary-btn" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', height: '52px', fontWeight: 700 }} onClick={addC}>
                  <span className="material-symbols-rounded">add</span>
                  Add Manual Criterion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
          <div className="form-section" style={{ margin: 0 }}>
            <div className="form-section-head">
              <span className="material-symbols-rounded">settings</span>
              Scoring Strategy
            </div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="custom-label">Calculation Mode</label>
                <select className="custom-input" style={{ border: '1.5px solid var(--border-soft)' }} value={scoringMode} onChange={e => setScoringMode(e.target.value)}>
                  <option>Standard Average</option>
                  <option>Olympic (Trim Ends)</option>
                  <option>Cumulative Points</option>
                </select>
              </div>
              <div>
                <label className="custom-label">Precision</label>
                <select className="custom-input" style={{ border: '1.5px solid var(--border-soft)' }} value={decimals} onChange={e => setDecimals(e.target.value)}>
                  <option>Whole Numbers (9)</option>
                  <option>1 Decimal (9.5)</option>
                  <option>2 Decimals (9.55)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section" style={{ margin: 0 }}>
            <div className="form-section-head">
              <span className="material-symbols-rounded">monitoring</span>
              Weight Allocation
            </div>
            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-soft)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-muted)' }}>Status</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: totalWeight > 100 ? '#DC2626' : 'var(--navy)' }}>{totalWeight}% / 100%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--page-bg)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                  <div style={{ height: '100%', width: `${Math.min(totalWeight, 100)}%`, background: totalWeight > 100 ? '#DC2626' : 'var(--accent)', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
              </div>

              {criteria.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{c.name || 'Undefined'}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>{c.weight}%</span>
                </div>
              ))}
              
              {totalWeight !== 100 && (
                <div style={{ marginTop: '12px', padding: '14px', background: totalWeight > 100 ? 'rgba(220, 38, 38, 0.05)' : 'rgba(59, 130, 246, 0.05)', borderRadius: '10px', fontSize: '12.5px', color: totalWeight > 100 ? '#DC2626' : 'var(--accent-deep)', lineHeight: 1.6, display: 'flex', gap: '8px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{totalWeight > 100 ? 'error' : 'info'}</span>
                  {totalWeight > 100 ? `Weights must not exceed 100%. Please reduce by ${totalWeight - 100}%.` : `Add ${100 - totalWeight}% more to complete your rubric.`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AiModal 
        show={showAiModal} 
        onClose={() => setShowAiModal(false)} 
        onGenerate={handleAiGenerate} 
        prompt={aiPrompt} 
        setPrompt={setAiPrompt} 
        inputRef={aiRef} 
      />

      {undoItem && <UndoBar message="Criterion removed" onUndo={undoRemove} onDismiss={() => setUndoItem(null)} />}
    </>
  );
}

/* ── UI Components ── */

function ChoiceCard({ title, desc, icon, label, primary, onClick }) {
  return (
    <div onClick={onClick} className="form-section" style={{ margin: 0, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: primary ? '2px solid var(--accent)' : '1px solid var(--border-soft)' }} 
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
      <div style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: primary ? 'var(--accent)' : 'var(--page-bg)', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '32px', color: primary ? '#fff' : 'var(--ink-muted)' }}>{icon}</span>
        </div>
        <div>
          {label && <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: primary ? 'var(--accent)' : 'var(--ink-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>{label}</div>}
          <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 800, color: 'var(--navy)' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{desc}</p>
        </div>
        <button className={primary ? 'primary-btn' : 'secondary-btn'} style={{ minWidth: '140px', justifyContent: 'center' }}>Select</button>
      </div>
    </div>
  );
}

function AiModal({ show, onClose, onGenerate, prompt, setPrompt, inputRef }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '40px', borderRadius: '28px', border: '1px solid var(--border-soft)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.1)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>smart_toy</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', margin: '0 0 10px 0' }}>AI Rubric Architect</h2>
          <p style={{ fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            Explain your event vision and the AI will craft a balanced scoring model for you.
          </p>
        </div>
        <div style={{ marginBottom: '32px' }}>
          <label className="custom-label" style={{ fontWeight: 700 }}>CONTEXT PROMPT</label>
          <textarea 
            ref={inputRef}
            className="custom-input" 
            rows={5} 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)}
            style={{ padding: '16px', borderRadius: '16px', border: '1.5px solid var(--border-soft)', fontSize: '14.5px', lineHeight: 1.6 }}
            placeholder="e.g. A competitive baking event focused on presentation, flavor profile, and technical execution."
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button className="secondary-btn" onClick={onClose} style={{ height: '48px', justifyContent: 'center', fontWeight: 700 }}>Cancel</button>
          <button className="primary-btn" onClick={onGenerate} disabled={!prompt.trim()} style={{ height: '48px', justifyContent: 'center', fontWeight: 700 }}>
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="notification-container">
      <div className="notification-pill pill-info" style={{ '--duration': '5s' }}>
        <div className="pill-icon info">
          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>info</span>
        </div>
        <span className="pill-message">{message}</span>
        <button className="pill-action-btn" onClick={onUndo}>Undo</button>
        <button className="pill-close-btn" onClick={onDismiss}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
        </button>
        <div className="pill-progress">
          <div className="pill-progress-bar" style={{ width: `${progress}%`, animation: 'none' }} />
        </div>
      </div>
    </div>
  );
}
