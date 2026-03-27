import React, { useState, useEffect } from 'react';
import { useJudgeContext } from './JudgeLayout';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function RubricReviewPage() {
  const { segments, event, showToast } = useJudgeContext();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredButton, setHoveredButton] = useState(null); // export, scoring

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const grandTotal = segments.reduce((a, seg) =>
    a + seg.criteria.reduce((b, c) => b + c.maxScore, 0), 0
  );

  const isMobile = windowWidth <= 768;

  const pageHeaderStyle = {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'stretch' : 'flex-start',
    gap: '24px',
    flexDirection: isMobile ? 'column' : 'row',
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

  const primaryBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: hoveredButton === 'scoring' ? colors.navySoft : colors.navy,
    color: '#fff',
    border: 'none',
    boxShadow: hoveredButton === 'scoring' ? '0 4px 12px rgba(15, 31, 61, 0.15)' : 'none',
    transform: hoveredButton === 'scoring' ? 'translateY(-1px)' : 'none',
  };

  const secondaryBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: hoveredButton === 'export' ? '#F8FAFC' : '#fff',
    color: colors.inkSoft,
    border: `1px solid ${colors.border}`,
    transform: hoveredButton === 'export' ? 'translateY(-1px)' : 'none',
  };

  const cardStyle = {
    background: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
    marginBottom: '32px',
    position: 'relative',
    overflow: 'hidden',
  };

  const dataTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    background: '#F8FAFC',
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.inkMuted,
  };

  const tdStyle = {
    padding: '16px 24px',
    borderBottom: `1px solid ${colors.borderSoft}`,
    fontSize: '14px',
    color: colors.inkSoft,
  };

  return (
    <div className="slide-up-anim">
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Scoring Rubric</h1>
          <p style={pageDescriptionStyle}>
            Official rubric for <strong style={{ color: colors.navy }}>{event.name}</strong>. Review criteria and weights before scoring.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
          <button 
            style={secondaryBtnStyle} 
            onClick={() => showToast('Rubric downloaded as PDF.')}
            onMouseEnter={() => setHoveredButton('export')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="material-symbols-rounded">download</span>
            Export PDF
          </button>
          <button 
            style={primaryBtnStyle} 
            onClick={() => navigate('/judge/scoring')}
            onMouseEnter={() => setHoveredButton('scoring')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="material-symbols-rounded">edit_note</span>
            Go to Score Sheet
          </button>
        </div>
      </div>

      {/* Grand Total Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px', borderRadius: '16px',
        backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.12)',
        marginBottom: '28px', flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>
        <span className="material-symbols-rounded" style={{ color: colors.navy, fontSize: '22px' }}>workspace_premium</span>
        <span style={{ fontWeight: 600, color: colors.navy }}>Grand Total Possible Score:</span>
        <span style={{ fontSize: '22px', fontWeight: 800, color: colors.navy, fontFamily: "'DM Sans', sans-serif" }}>
          {grandTotal} pts
        </span>
        <span style={{ fontSize: '13px', color: colors.inkMuted, marginLeft: isMobile ? '0' : 'auto' }}>
          {segments.length} segments · Standard Average scoring mode
        </span>
      </div>

      {/* Segments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {segments.map((seg, idx) => {
          const segMax = seg.criteria.reduce((a, c) => a + c.maxScore, 0);
          const pct = grandTotal > 0 ? Math.round((segMax / grandTotal) * 100) : 0;
          return (
            <div key={seg.id} style={{ ...cardStyle, padding: 0 }}>
              {/* Segment Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex', alignItems: 'center', gap: '14px',
                backgroundColor: seg.colorBg,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  color: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${seg.color}30`,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>{seg.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: colors.ink, fontSize: '16px' }}>
                    {String(idx + 1).padStart(2, '0')}. {seg.label}
                  </div>
                  <div style={{ fontSize: '13px', color: colors.inkMuted }}>
                    {seg.criteria.length} judging criteria
                  </div>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right', minWidth: isMobile ? '100%' : 'auto' }}>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: seg.color }}>{segMax} pts</div>
                  <div style={{ fontSize: '12px', color: colors.inkMuted }}>{pct}% of total</div>
                </div>
              </div>

              {/* Criteria Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={dataTableStyle}>
                    <thead>
                    <tr>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Criterion</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Max Score</th>
                        <th style={thStyle}>Scoring Guidance</th>
                    </tr>
                    </thead>
                    <tbody>
                    {seg.criteria.map((c, ci) => (
                        <tr key={c.id}>
                        <td style={{ ...tdStyle, color: colors.inkMuted, fontWeight: 600, width: '40px' }}>
                            {ci + 1}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: colors.ink }}>{c.name}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{
                            display: 'inline-block', padding: '4px 12px',
                            borderRadius: '20px', fontWeight: 700,
                            backgroundColor: `${seg.color}15`, color: seg.color,
                            fontSize: '13px',
                            }}>
                            {c.maxScore} pts
                            </span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: '13px', color: colors.inkMuted }}>
                            Score from 0 to {c.maxScore}. Half points (0.5) are allowed.
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>

              {/* Segment footer */}
              <div style={{
                backgroundColor: colors.offWhite, padding: '10px 24px',
                borderTop: `1px solid ${colors.borderSoft}`,
                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '12px', color: colors.inkMuted }}>Segment Maximum:</span>
                <strong style={{ color: colors.ink, fontSize: '14px' }}>{segMax} pts</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scoring Rules Footer */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: colors.navy, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <span className="material-symbols-rounded" style={{ color: colors.error, fontSize: '22px' }}>info</span>
          General Scoring Rules
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          {[
            { icon: 'calculate', title: 'Scoring Mode', desc: 'Standard Average — all judges\' scores are averaged per criterion.' },
            { icon: 'exposure', title: 'Decimal Precision', desc: 'Half-point increments (0.5) are allowed. Whole numbers are preferred.' },
            { icon: 'lock', title: 'Final Submission', desc: 'Once a segment is submitted, it is locked and cannot be edited.' },
            { icon: 'policy', title: 'Impartiality', desc: 'Judges must not confer with each other before submitting scores.' },
          ].map((rule, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', padding: '14px 16px',
              borderRadius: '8px', border: `1px solid ${colors.border}`,
              backgroundColor: colors.offWhite,
            }}>
              <span className="material-symbols-rounded" style={{ color: colors.navy, fontSize: '20px', marginTop: '2px' }}>{rule.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: colors.ink, marginBottom: '4px' }}>{rule.title}</div>
                <div style={{ fontSize: '13px', color: colors.inkMuted, lineHeight: 1.5 }}>{rule.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}