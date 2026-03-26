import React, { useState } from 'react';
import { useJudgeContext } from './JudgeLayout';

export default function ScoringPage() {
  const { segments, participants, scores, submittedSegments, updateScore, submitSegment, showToast } = useJudgeContext();
  const [activeSegment, setActiveSegment] = useState(segments[0].id);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);

  const seg = segments.find(s => s.id === activeSegment);
  const isSubmitted = submittedSegments[activeSegment];

  const getParticipantTotal = (pId) =>
    seg.criteria.reduce((sum, c) => sum + (parseFloat(scores[pId]?.[activeSegment]?.[c.id]) || 0), 0);

  const allFilled = participants.every(p =>
    seg.criteria.every(c => scores[p.id]?.[activeSegment]?.[c.id] !== '')
  );

  const maxSegmentScore = seg.criteria.reduce((a, c) => a + c.maxScore, 0);

  const handleSubmit = () => {
    if (!allFilled) {
      showToast('Please fill in all scores before submitting.', 'info');
      return;
    }
    setConfirmingSubmit(true);
  };

  const confirmSubmit = () => {
    submitSegment(activeSegment);
    setConfirmingSubmit(false);
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>edit_note</span>
            Score Sheet
          </div>
          <h1 className="page-title">{seg.label} Evaluation</h1>
          <p className="page-description">Record scores for all contestants. Evaluation is saved but must be finalized to be official.</p>
        </div>
      </div>

      {/* ── Segment Pills ── */}
      <div className="segment-tab-container">
        {segments.map(s => (
          <button
            key={s.id}
            className={`segment-pill ${activeSegment === s.id ? 'active' : ''} ${submittedSegments[s.id] ? 'submitted' : ''}`}
            onClick={() => setActiveSegment(s.id)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{s.icon}</span>
            <span>{s.label}</span>
            {submittedSegments[s.id] && (
              <span className="material-symbols-rounded" style={{ fontSize: '16px', marginLeft: '4px' }}>lock</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Scoring Table ── */}
      <div className="scoring-table-container" style={{ animation: 'none' }}>
        <table className="scoring-table">
          <thead>
            <tr>
              <th style={{ width: '250px' }}>Contestant</th>
              {seg.criteria.map(c => (
                <th key={c.id} style={{ textAlign: 'center' }}>
                  {c.name}
                  <div style={{ fontSize: '10px', textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>Max {c.maxScore} pts</div>
                </th>
              ))}
              <th style={{ textAlign: 'center', background: 'var(--page-bg)', color: 'var(--navy)', width: '120px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => {
              const total = getParticipantTotal(p.id);
              const pct = (total / maxSegmentScore) * 100;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="contestant-card">
                      <div className="contestant-num-badge" style={{ width: '30px', height: '30px', fontSize: '12px' }}>{p.number}</div>
                      <div className="contestant-meta">
                        <span className="contestant-name">{p.name}</span>
                        <span className="contestant-sub">{p.barangay}</span>
                      </div>
                    </div>
                  </td>
                  {seg.criteria.map(c => (
                    <td key={c.id} style={{ textAlign: 'center' }}>
                      <div className="score-selector-grid">
                        {Array.from({ length: c.maxScore }, (_, i) => i + 1).map(val => (
                          <button
                            key={val}
                            disabled={isSubmitted}
                            className={`score-pill ${Number(scores[p.id]?.[activeSegment]?.[c.id]) === val ? 'active' : ''}`}
                            onClick={() => updateScore(p.id, activeSegment, c.id, String(val))}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ padding: '8px', borderRadius: '12px', background: 'var(--navy)', color: '#fff', display: 'inline-block', minWidth: '60px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, opacity: 0.5, marginBottom: '2px' }}>Sum</div>
                      <div style={{ fontWeight: 800, fontSize: '18px' }}>{total.toFixed(0)}</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Sticky Submit Bar ── */}
      <div className="sticky-submit-bar" style={{ animation: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isSubmitted ? (
            <div className="lock-ribbon">
              <span className="material-symbols-rounded">verified</span>
              Submissions secured and encrypted
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>
              {allFilled ? (
                <span style={{ color: 'var(--navy)', fontWeight: 600 }}>Ready to transmit evaluation data.</span>
              ) : (
                'Review criteria before finalized submission.'
              )}
            </div>
          )}
        </div>
        
        <button 
          className="primary-btn" 
          disabled={isSubmitted || !allFilled} 
          onClick={handleSubmit}
          style={{ paddingLeft: '24px', paddingRight: '24px', minWidth: '180px' }}
        >
          <span className="material-symbols-rounded">{isSubmitted ? 'lock' : 'send_and_archive'}</span>
          {isSubmitted ? 'Locked & Sent' : 'Transmit Scores'}
        </button>
      </div>

      {/* ── Confirmation Modal ── */}
      {confirmingSubmit && (
        <div className="modal-overlay" onClick={() => setConfirmingSubmit(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--navy)', color: '#fff', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '30px' }}>verified_user</span>
            </div>
            <h2 className="modal-title">Confirm Final Data</h2>
            <p className="modal-sub">
              This will finalize evaluation for <strong>{seg.label}</strong>. You will no longer be able to modify these assessment values.
            </p>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="primary-btn" onClick={confirmSubmit} style={{ width: '100%', background: '#16A34A', border: 'none' }}>Confirm & Send</button>
              <button className="secondary-btn" onClick={() => setConfirmingSubmit(false)} style={{ width: '100%' }}>Return to Sheet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
