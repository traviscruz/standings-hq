import React, { useState, useEffect } from 'react';
import { useJudgeContext } from './JudgeLayout';
import { colors } from '../../styles/colors';

export default function ScoringPage() {
  const { event, segments, participants, scores, submittedSegments, updateScore, submitSegment, showToast } = useJudgeContext();
  const [activeSegment, setActiveSegment] = useState(null);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoveredScore, setHoveredScore] = useState(null); // id-criterion-val
  const [isSubmitBtnHovered, setIsSubmitBtnHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync active segment with loaded segments list
  useEffect(() => {
    if (segments && segments.length > 0) {
      if (!activeSegment || !segments.some(s => s.id === activeSegment)) {
        setActiveSegment(segments[0].id);
      }
    }
  }, [segments, activeSegment]);

  const seg = segments ? segments.find(s => s.id === activeSegment) : null;
  const isSubmitted = (submittedSegments && activeSegment) ? submittedSegments[activeSegment] : false;
  const isLockedByStatus = event?.status?.toLowerCase() !== 'active' && event?.status?.toLowerCase() !== 'ongoing';
  const isScoringDisabled = isSubmitted || isLockedByStatus;

  // Render a sleek loading spinner if segments are still loading or empty
  if (!segments || segments.length === 0 || !seg) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${colors.borderSoft}`, borderTopColor: colors.accent, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: colors.inkMuted, fontWeight: '600' }}>Loading scoring sheet...</span>
      </div>
    );
  }

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

  const isMobile = windowWidth <= 768;

  const eyebrowBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: 'rgba(59, 130, 246, 0.08)',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '800',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  };

  const pageTitleStyle = {
    fontSize: isMobile ? '26px' : '32px',
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '8px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const pageDescriptionStyle = {
    color: colors.inkMid,
    fontSize: '15px',
    maxWidth: '600px',
    lineHeight: '1.55',
  };

  const segmentTabContainerStyle = {
    display: 'flex',
    gap: '12px',
    padding: '8px',
    background: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '100px',
    width: isMobile ? '100%' : 'fit-content',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  };

  const getSegmentPillStyle = (id, isActive, isSubmitted) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: isMobile ? '8px 14px' : '10px 20px',
    borderRadius: '100px',
    background: isActive ? colors.navy : (hoveredSegment === id ? '#F8FAFC' : 'transparent'),
    color: isActive ? '#fff' : (hoveredSegment === id ? colors.navy : colors.inkMuted),
    fontSize: isMobile ? '12.5px' : '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    border: isSubmitted ? `1px solid ${colors.borderSoft}` : 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive ? '0 10px 15px -3px rgba(15, 23, 42, 0.2)' : 'none',
  });

  const scoringTableContainerStyle = {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
    scrollbarWidth: 'thin',
  };

  const scoringTableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    background: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    border: `1px solid ${colors.borderSoft}`,
  };

  const thStyle = {
    background: '#F8FAFC',
    padding: isMobile ? '12px 16px' : '20px 24px',
    textAlign: 'left',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.inkMuted,
    borderBottom: `1px solid ${colors.borderSoft}`,
  };

  const tdStyle = {
    padding: isMobile ? '12px 16px' : '16px 24px',
    borderBottom: `1px solid ${colors.borderSoft}`,
    verticalAlign: 'middle',
  };

  const scorePillStyle = (pId, cId, val, isActive, isSubmitted) => {
    const isHovered = hoveredScore === `${pId}-${cId}-${val}`;
    return {
      width: isMobile ? '28px' : '32px',
      height: isMobile ? '28px' : '32px',
      borderRadius: '8px',
      border: `1px solid ${colors.borderSoft}`,
      background: isActive ? colors.navy : (isHovered && !isSubmitted ? '#F8FAFC' : '#fff'),
      color: isActive ? '#fff' : colors.navy,
      fontWeight: '700',
      fontSize: '13px',
      cursor: isSubmitted ? 'not-allowed' : 'pointer',
      display: 'grid',
      placeItems: 'center',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: 0,
      opacity: isSubmitted && !isActive ? 0.3 : 1,
      transform: (isHovered && !isSubmitted) ? 'translateY(-2px)' : 'none',
      boxShadow: (isActive || (isHovered && !isSubmitted)) ? '0 4px 10px rgba(15, 23, 42, 0.15)' : 'none',
    };
  };

  const stickySubmitBarStyle = {
    position: 'sticky',
    bottom: isMobile ? '20px' : '0px',
    marginTop: '32px',
    padding: isMobile ? '16px' : '20px 32px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: isMobile ? '16px' : '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: isMobile ? '16px' : 'normal',
    flexDirection: isMobile ? 'column' : 'row',
    textAlign: isMobile ? 'center' : 'left',
    zIndex: 40,
    boxShadow: '0 -10px 25px -10px rgba(0, 0, 0, 0.05)',
  };

  const lockRibbonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#16A34A',
    fontWeight: '700',
    fontSize: '12px',
    padding: '6px 14px',
    background: '#F0FDF4',
    borderRadius: '100px',
    border: '1px solid rgba(22, 163, 74, 0.1)',
  };

  const primaryBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: (isScoringDisabled || !allFilled) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    background: isSubmitBtnHovered && !isScoringDisabled && allFilled ? colors.navySoft : colors.navy,
    color: '#fff',
    border: 'none',
    opacity: (isScoringDisabled || !allFilled) ? 0.55 : 1,
    boxShadow: isSubmitBtnHovered && !isScoringDisabled && allFilled ? '0 4px 12px rgba(15, 31, 61, 0.15)' : 'none',
    transform: isSubmitBtnHovered && !isScoringDisabled && allFilled ? 'translateY(-1px)' : 'none',
    paddingLeft: '24px',
    paddingRight: '24px',
    minWidth: '180px',
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulseLock {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}
      </style>

      <div style={{ position: 'relative', minHeight: '60vh' }}>
        
        {/* Content Layer (Blurred if locked) */}
        <div style={{
          filter: isLockedByStatus ? 'blur(8px)' : 'none',
          pointerEvents: isLockedByStatus ? 'none' : 'auto',
          userSelect: isLockedByStatus ? 'none' : 'auto',
          transition: 'all 0.4s ease',
        }}>
          <div className="slide-up-anim">
            {/* ── Page Header ── */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
              <div>
                <div style={eyebrowBadgeStyle}>
                  <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>edit_note</span>
                  Score Sheet
                </div>
                <h1 style={pageTitleStyle}>{seg.label} Evaluation</h1>
                <p style={pageDescriptionStyle}>Record scores for all contestants. Evaluation is saved but must be finalized to be official.</p>
              </div>
            </div>

            {/* ── Segment Pills ── */}
            <div style={segmentTabContainerStyle}>
              {segments.map(s => (
                <button
                  key={s.id}
                  style={getSegmentPillStyle(s.id, activeSegment === s.id, submittedSegments[s.id])}
                  onClick={() => setActiveSegment(s.id)}
                  onMouseEnter={() => setHoveredSegment(s.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
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
            <div style={scoringTableContainerStyle}>
              <table style={scoringTableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: isMobile ? 'auto' : '250px' }}>Contestant</th>
                    {seg.criteria.map(c => (
                      <th key={c.id} style={{ ...thStyle, textAlign: 'center' }}>
                        {c.name}
                        <div style={{ fontSize: '10px', textTransform: 'none', fontWeight: 500, opacity: 0.6 }}>Max {c.maxScore} pts</div>
                      </th>
                    ))}
                    <th style={{ ...thStyle, textAlign: 'center', background: '#F8FAFC', color: colors.navy, width: '120px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(p => {
                    const total = getParticipantTotal(p.id);
                    return (
                      <tr key={p.id}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: colors.navy, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '12px' }}>{p.number}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '14.5px', fontWeight: '700', color: colors.navy }}>{p.name}</span>
                              <span style={{ fontSize: '11px', color: colors.inkMuted }}>{p.barangay}</span>
                            </div>
                          </div>
                        </td>
                        {seg.criteria.map(c => (
                          <td key={c.id} style={{ ...tdStyle, textAlign: 'center' }}>
                            {c.maxScore <= 10 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: isMobile ? '160px' : '210px', margin: '0 auto' }}>
                                {Array.from({ length: c.maxScore }, (_, i) => i + 1).map(val => (
                                  <button
                                    key={val}
                                    disabled={isScoringDisabled}
                                    style={scorePillStyle(p.id, c.id, val, Number(scores[p.id]?.[activeSegment]?.[c.id]) === val, isScoringDisabled)}
                                    onClick={() => updateScore(p.id, activeSegment, c.id, String(val))}
                                    onMouseEnter={() => setHoveredScore(`${p.id}-${c.id}-${val}`)}
                                    onMouseLeave={() => setHoveredScore(null)}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max={c.maxScore}
                                    step="0.5"
                                    disabled={isScoringDisabled}
                                    value={scores[p.id]?.[activeSegment]?.[c.id] ?? ''}
                                    onChange={(e) => {
                                      let val = e.target.value;
                                      if (val !== '') {
                                        const num = parseFloat(val);
                                        if (num < 0) val = '0';
                                        if (num > c.maxScore) val = String(c.maxScore);
                                      }
                                      updateScore(p.id, activeSegment, c.id, val);
                                    }}
                                    placeholder={`0-${c.maxScore}`}
                                    style={{
                                      width: '95px',
                                      padding: '8px 12px',
                                      borderRadius: '10px',
                                      border: `1.5px solid ${scores[p.id]?.[activeSegment]?.[c.id] ? colors.accent : colors.borderSoft}`,
                                      outline: 'none',
                                      fontSize: '14px',
                                      fontWeight: '700',
                                      color: colors.navy,
                                      textAlign: 'center',
                                      background: isScoringDisabled ? colors.pageBg : '#fff',
                                      transition: 'all 0.2s',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                  <span style={{ fontSize: '13px', fontWeight: '700', color: colors.inkMuted }}>/ {c.maxScore}</span>
                                </div>
                              </div>
                            )}
                          </td>
                        ))}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ padding: '8px', borderRadius: '12px', background: colors.navy, color: '#fff', display: 'inline-block', minWidth: '60px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, opacity: 0.5, marginBottom: '2px' }}>Sum</div>
                            <div style={{ fontWeight: 800, fontSize: '18px' }}>{total % 1 === 0 ? total.toFixed(0) : total.toFixed(1)}</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Sticky Submit Bar ── */}
            <div style={stickySubmitBarStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {isLockedByStatus ? (
                  <div style={{ ...lockRibbonStyle, color: '#DC2626', background: '#FEF2F2', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
                    <span className="material-symbols-rounded">lock</span>
                    Event status is {event.status || 'upcoming'} — Scoring Locked
                  </div>
                ) : isSubmitted ? (
                  <div style={lockRibbonStyle}>
                    <span className="material-symbols-rounded">verified</span>
                    Submissions secured and encrypted
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: colors.inkMuted }}>
                    {allFilled ? (
                      <span style={{ color: colors.navy, fontWeight: 600 }}>Ready to transmit evaluation data.</span>
                    ) : (
                      'Review criteria before finalized submission.'
                    )}
                  </div>
                )}
              </div>

              <button
                style={primaryBtnStyle}
                disabled={isScoringDisabled || !allFilled}
                onClick={handleSubmit}
                onMouseEnter={() => setIsSubmitBtnHovered(true)}
                onMouseLeave={() => setIsSubmitBtnHovered(false)}
              >
                <span className="material-symbols-rounded">{isLockedByStatus ? 'lock' : isSubmitted ? 'lock' : 'send_and_archive'}</span>
                {isLockedByStatus ? 'Locked (Inactive)' : isSubmitted ? 'Locked & Sent' : 'Transmit Scores'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Lock Glass Overlay ── */}
        {isLockedByStatus && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '40px 20px',
            animation: 'fadeIn 0.4s ease-out',
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(3px)',
            borderRadius: '24px',
          }}>
            <div style={{
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'modalUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
              {/* Animated Pulsing Lock Symbol */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#EF4444',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '24px',
                animation: 'pulseLock 2s infinite',
                border: '2px solid rgba(239, 68, 68, 0.15)',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '38px' }}>lock</span>
              </div>

              <h2 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: colors.navy,
                marginBottom: '16px',
                letterSpacing: '-0.03em',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Evaluation Room Locked
              </h2>

              <p style={{
                fontSize: '15.5px',
                color: colors.inkMid,
                lineHeight: '1.7',
                marginBottom: '32px',
                maxWidth: '440px',
              }}>
                Scoring is not yet open for <strong style={{ color: colors.navy }}>{event?.name}</strong>. 
                The current event status is <span style={{ 
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#EF4444'
                }}>{event?.status || 'upcoming'}</span>.
                Scoring will automatically unlock once the event is marked active by the organizer.
              </p>

              <button
                onClick={() => window.history.back()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '100px',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: `1.5px solid ${colors.border}`,
                  background: '#fff',
                  color: colors.inkSoft,
                  transition: 'all 0.2s',
                  width: '240px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      {confirmingSubmit && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(15, 31, 61, 0.5)', 
            backdropFilter: 'blur(12px)', 
            WebkitBackdropFilter: 'blur(12px)',
            display: 'grid', 
            placeItems: 'center', 
            zIndex: 1000, 
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out'
          }} 
          onClick={() => setConfirmingSubmit(false)}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              background: '#fff', 
              borderRadius: '24px', 
              width: '100%', 
              maxWidth: '440px', 
              padding: '40px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
              position: 'relative',
              animation: 'modalUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: colors.navy, color: '#fff', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '30px' }}>verified_user</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: colors.navy, marginBottom: '8px', letterSpacing: '-0.02em', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Confirm Final Data</h2>
            <p style={{ fontSize: '15px', color: colors.inkMid, marginBottom: '32px', lineHeight: '1.5' }}>
              This will finalize evaluation for <strong>{seg.label}</strong>. You will no longer be able to modify these assessment values.
            </p>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                style={{ ...primaryBtnStyle, width: '100%', background: '#16A34A', opacity: 1, cursor: 'pointer', height: '48px' }} 
                onClick={confirmSubmit}
              >
                Confirm & Send
              </button>
              <button 
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, width: '100%', height: '48px' }} 
                onClick={() => setConfirmingSubmit(false)}
              >
                Return to Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}