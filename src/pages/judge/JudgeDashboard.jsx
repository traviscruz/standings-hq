import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJudgeContext } from './JudgeLayout';

export default function JudgeDashboard() {
  const { event, participants, segments, scores, submittedSegments, showToast } = useJudgeContext();
  const navigate = useNavigate();

  const totalSegments = segments.length;
  const submittedCount = Object.keys(submittedSegments).length;

  const hasScored = (pId) => {
    return segments.some(seg =>
      seg.criteria.some(c => scores[pId]?.[seg.id]?.[c.id] !== '')
    );
  };

  const getSegmentStatus = (segId) => {
    if (submittedSegments[segId]) return 'submitted';
    const filled = participants.every(p =>
      segments.find(s => s.id === segId)?.criteria.every(c => scores[p.id]?.[segId]?.[c.id] !== '')
    );
    return filled ? 'ready' : 'pending';
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>visibility</span>
            Judge Command Center
          </div>
          <h1 className="page-title">Welcome back, Marian</h1>
          <p className="page-description">
            Your evaluation manifest for <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{event.name}</span> is ready for review.
          </p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/judge/scoring')}>
          <span className="material-symbols-rounded">edit_note</span>
          Open Score Sheet
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div className="dashboard-grid" style={{ marginBottom: '40px' }}>
        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Participants Scored</span>
            <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '20px' }}>groups</span>
          </div>
          <div className="stat-value">{participants.filter(p => hasScored(p.id)).length}<span style={{ fontSize: '18px', opacity: 0.5, fontWeight: 400 }}>/{participants.length}</span></div>
          <div className="stat-trend" style={{ color: 'var(--sage)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check_circle</span>
            Evaluation active
          </div>
        </div>

        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Segment Progress</span>
            <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '20px' }}>layers</span>
          </div>
          <div className="stat-value">{submittedCount}<span style={{ fontSize: '18px', opacity: 0.5, fontWeight: 400 }}>/{totalSegments}</span></div>
          <div style={{ marginTop: '12px', height: '6px', background: 'var(--page-bg)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(submittedCount / totalSegments) * 100}%`, background: 'var(--accent)', borderRadius: '10px', transition: 'width 1s ease-out' }} />
          </div>
        </div>

        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Total Weightage</span>
            <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '20px' }}>balance</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--navy)' }}>100%</div>
          <div className="stat-trend" style={{ color: 'var(--sage)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>verified</span>
            Validated Rubric
          </div>
        </div>

        <div className="widget-card col-span-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="stat-label">Live Status</span>
            <span className="material-symbols-rounded" style={{ color: '#16A34A', fontSize: '20px' }}>sensors</span>
          </div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#16A34A' }}>Active Flow</div>
          <div className="stat-trend" style={{ color: 'var(--ink-muted)' }}>
            Real-time scoring sync
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left: Component Checklist */}
        <div className="col-span-8">
          <div className="form-section">
            <div className="form-section-head">
              <span className="material-symbols-rounded">playlist_add_check</span>
              Scoring Segments Checklist
            </div>
            <div style={{ padding: '8px 0' }}>
              {segments.map(seg => {
                const status = getSegmentStatus(seg.id);
                return (
                  <div key={seg.id} className="judge-score-row" style={{ display: 'flex', gap: '20px', padding: '20px 32px', borderBottom: '1px solid var(--border-soft)', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/judge/scoring')}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: seg.colorBg, color: seg.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>{seg.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>{seg.label}</p>
                      <p style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{seg.criteria.length} Criteria · Max {seg.criteria.reduce((a, c) => a + c.maxScore, 0)} points</p>
                    </div>
                    <div className={`status-badge ${status === 'submitted' ? 'status-active' : status === 'ready' ? 'status-completed' : 'status-pending'}`}>
                      {status === 'submitted' ? 'Finalized' : status === 'ready' ? 'Ready to Lock' : 'In Progress'}
                    </div>
                    <span className="material-symbols-rounded" style={{ color: 'var(--border)', fontSize: '20px' }}>chevron_right</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Contestant Breakdown */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="widget-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--accent)' }}>person_check</span>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '16px' }}>Contestants</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {participants.map(p => {
                const scored = hasScored(p.id);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '14px', background: scored ? 'var(--accent-bg)' : 'var(--page-bg)', border: scored ? '1px solid rgba(99,102,241,0.1)' : '1px solid transparent' }}>
                    <div className="contestant-num-badge" style={{ background: scored ? 'var(--accent)' : 'var(--navy)', width: '30px', height: '30px', fontSize: '12px', borderRadius: '10px' }}>{p.number}</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="contestant-name" style={{ fontSize: '13.5px' }}>{p.name}</div>
                      <div className="contestant-sub" style={{ fontSize: '11px', opacity: 0.6 }}>{p.barangay}</div>
                    </div>
                    {scored && <span className="material-symbols-rounded" style={{ color: 'var(--accent)', fontSize: '18px' }}>done_all</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="widget-card" style={{ background: 'var(--navy)', border: 'none', color: '#fff' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Assigned Event</h3>
            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '20px' }}>You are authorized to judge this room.</p>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontWeight: 800 }}>Event Identity</div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{event.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '12px', color: 'rgba(255,255,255,0.6)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>calendar_today</span>
                {event.date}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
