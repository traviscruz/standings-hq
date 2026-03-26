import React from 'react';
import { useJudgeContext } from './JudgeLayout';
import { useNavigate } from 'react-router-dom';

export default function RubricReviewPage() {
  const { segments, event, showToast } = useJudgeContext();
  const navigate = useNavigate();

  const grandTotal = segments.reduce((a, seg) =>
    a + seg.criteria.reduce((b, c) => b + c.maxScore, 0), 0
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Scoring Rubric</h1>
          <p className="page-description">
            Official rubric for <strong style={{ color: 'var(--navy)' }}>{event.name}</strong>. Review criteria and weights before scoring.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary-btn" onClick={() => showToast('Rubric downloaded as PDF.')}>
            <span className="material-symbols-rounded">download</span>
            Export PDF
          </button>
          <button className="primary-btn" onClick={() => navigate('/judge/scoring')}>
            <span className="material-symbols-rounded">edit_note</span>
            Go to Score Sheet
          </button>
        </div>
      </div>

      {/* Grand Total Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px', borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.12)',
        marginBottom: '28px'
      }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--navy)', fontSize: '22px' }}>workspace_premium</span>
        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>Grand Total Possible Score:</span>
        <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>
          {grandTotal} pts
        </span>
        <span style={{ fontSize: '13px', color: 'var(--ink-muted)', marginLeft: 'auto' }}>
          {segments.length} segments · Standard Average scoring mode
        </span>
      </div>

      {/* Segments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {segments.map((seg, idx) => {
          const segMax = seg.criteria.reduce((a, c) => a + c.maxScore, 0);
          const pct = grandTotal > 0 ? Math.round((segMax / grandTotal) * 100) : 0;
          return (
            <div className="card-container" key={seg.id} style={{ padding: 0, overflow: 'hidden' }}>
              {/* Segment Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '14px',
                backgroundColor: seg.colorBg,
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  color: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${seg.color}30`,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>{seg.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '16px' }}>
                    {String(idx + 1).padStart(2, '0')}. {seg.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
                    {seg.criteria.length} judging criteria
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: seg.color }}>{segMax} pts</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{pct}% of total</div>
                </div>
              </div>

              {/* Criteria Table */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Criterion</th>
                    <th style={{ textAlign: 'center' }}>Max Score</th>
                    <th>Scoring Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  {seg.criteria.map((c, ci) => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--ink-muted)', fontWeight: 600, width: '40px' }}>
                        {ci + 1}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 12px',
                          borderRadius: '20px', fontWeight: 700,
                          backgroundColor: `${seg.color}15`, color: seg.color,
                          fontSize: '13px',
                        }}>
                          {c.maxScore} pts
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
                        Score from 0 to {c.maxScore}. Half points (0.5) are allowed.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Segment footer */}
              <div style={{
                backgroundColor: 'var(--cream)', padding: '10px 24px',
                borderTop: '1px solid var(--border-soft)',
                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Segment Maximum:</span>
                <strong style={{ color: 'var(--ink)', fontSize: '14px' }}>{segMax} pts</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scoring Rules Footer */}
      <div className="card-container" style={{ marginTop: '8px' }}>
        <h2 className="card-title">
          <span className="material-symbols-rounded" style={{ color: 'var(--coral)', fontSize: '22px' }}>info</span>
          General Scoring Rules
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { icon: 'calculate', title: 'Scoring Mode', desc: 'Standard Average — all judges\' scores are averaged per criterion.' },
            { icon: 'exposure', title: 'Decimal Precision', desc: 'Half-point increments (0.5) are allowed. Whole numbers are preferred.' },
            { icon: 'lock', title: 'Final Submission', desc: 'Once a segment is submitted, it is locked and cannot be edited.' },
            { icon: 'policy', title: 'Impartiality', desc: 'Judges must not confer with each other before submitting scores.' },
          ].map((rule, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', padding: '14px 16px',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              backgroundColor: 'var(--cream)',
            }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--navy)', fontSize: '20px', marginTop: '2px' }}>{rule.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '4px' }}>{rule.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>{rule.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
