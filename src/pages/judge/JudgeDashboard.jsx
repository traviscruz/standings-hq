import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJudgeContext } from './JudgeLayout';
import { colors } from '../../styles/colors';

export default function JudgeDashboard() {
  const { event, participants, segments, scores, submittedSegments } = useJudgeContext();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isPrimaryBtnHovered, setIsPrimaryBtnHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  const pageHeaderStyle = {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'stretch' : 'flex-start',
    gap: '24px',
    flexDirection: isMobile ? 'column' : 'row',
  };

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
    background: isPrimaryBtnHovered ? colors.navySoft : colors.navy,
    color: '#fff',
    border: 'none',
    boxShadow: isPrimaryBtnHovered ? '0 4px 12px rgba(15, 31, 61, 0.15)' : '0 1px 3px rgba(26,24,20,0.06)',
    transform: isPrimaryBtnHovered ? 'translateY(-1px)' : 'none',
  };

  const dashboardGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(6, 1fr)' : 'repeat(12, 1fr)'),
    gap: '24px',
  };

  const widgetCardStyle = (id) => ({
    background: '#fff',
    border: `1px solid ${hoveredCard === id ? colors.border : colors.borderSoft}`,
    borderRadius: '20px',
    padding: '24px',
    boxShadow: hoveredCard === id ? '0 10px 15px -3px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    transform: hoveredCard === id ? 'translateY(-2px)' : 'none',
  });

  const statLabelStyle = {
    fontSize: '11.5px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.inkMuted,
    marginBottom: '12px',
    display: 'block',
  };

  const statValueStyle = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '32px',
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: '-0.04em',
    lineHeight: '1',
  };

  const statTrendStyle = {
    marginTop: '14px',
    fontSize: '12.5px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  const formSectionStyle = {
    background: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
  };

  const formSectionHeadStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 24px',
    borderBottom: `1px solid ${colors.borderSoft}`,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '14.5px',
    fontWeight: '700',
    color: colors.navy,
    background: '#F8FAFC',
  };

  const getColSpanStyle = (span) => {
    if (isMobile) return { gridColumn: 'span 1' };
    if (isTablet) {
        if (span === 3) return { gridColumn: 'span 3' };
        if (span === 4) return { gridColumn: 'span 3' };
        if (span === 8) return { gridColumn: 'span 6' };
        return { gridColumn: `span ${span}` };
    }
    return { gridColumn: `span ${span}` };
  };

  const statusBadgeStyle = (status) => {
    let bg = '#FEF3C7';
    let color = '#92400E';
    if (status === 'submitted') { bg = '#DCFCE7'; color = '#166534'; }
    else if (status === 'ready') { bg = '#E0E7FF'; color = '#3730A3'; }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '11.5px',
      fontWeight: '700',
      background: bg,
      color: color,
    };
  };

  return (
    <div className="slide-up-anim">
      {/* ── Page Header ── */}
      <div style={pageHeaderStyle}>
        <div>
          <div style={eyebrowBadgeStyle}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>visibility</span>
            Judge Command Center
          </div>
          <h1 style={pageTitleStyle}>Welcome back, Marian</h1>
          <p style={pageDescriptionStyle}>
            Your evaluation manifest for <span style={{ fontWeight: 700, color: colors.navy }}>{event.name}</span> is ready for review.
          </p>
        </div>
        <button 
          style={primaryBtnStyle} 
          onClick={() => navigate('/judge/scoring')}
          onMouseEnter={() => setIsPrimaryBtnHovered(true)}
          onMouseLeave={() => setIsPrimaryBtnHovered(false)}
        >
          <span className="material-symbols-rounded">edit_note</span>
          Open Score Sheet
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ ...dashboardGridStyle, marginBottom: '40px' }}>
        <div 
          style={{ ...widgetCardStyle('stat-1'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-1')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={statLabelStyle}>Participants Scored</span>
            <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '20px' }}>groups</span>
          </div>
          <div style={statValueStyle}>{participants.filter(p => hasScored(p.id)).length}<span style={{ fontSize: '18px', opacity: 0.5, fontWeight: 400 }}>/{participants.length}</span></div>
          <div style={{ ...statTrendStyle, color: colors.success }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check_circle</span>
            Evaluation active
          </div>
        </div>

        <div 
          style={{ ...widgetCardStyle('stat-2'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-2')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={statLabelStyle}>Segment Progress</span>
            <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '20px' }}>layers</span>
          </div>
          <div style={statValueStyle}>{submittedCount}<span style={{ fontSize: '18px', opacity: 0.5, fontWeight: 400 }}>/{totalSegments}</span></div>
          <div style={{ marginTop: '12px', height: '6px', background: '#F8FAFC', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(submittedCount / totalSegments) * 100}%`, background: colors.accent, borderRadius: '100px', transition: 'width 1s ease-out' }} />
          </div>
        </div>

        <div 
          style={{ ...widgetCardStyle('stat-3'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-3')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={statLabelStyle}>Total Weightage</span>
            <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '20px' }}>balance</span>
          </div>
          <div style={{ ...statValueStyle, color: colors.navy }}>100%</div>
          <div style={{ ...statTrendStyle, color: colors.success }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>verified</span>
            Validated Rubric
          </div>
        </div>

        <div 
          style={{ ...widgetCardStyle('stat-4'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-4')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={statLabelStyle}>Live Status</span>
            <span className="material-symbols-rounded" style={{ color: '#16A34A', fontSize: '20px' }}>sensors</span>
          </div>
          <div style={{ ...statValueStyle, fontSize: '24px', color: '#16A34A' }}>Active Flow</div>
          <div style={{ ...statTrendStyle, color: colors.inkMuted }}>
            Real-time scoring sync
          </div>
        </div>
      </div>

      <div style={dashboardGridStyle}>
        {/* Left: Component Checklist */}
        <div style={getColSpanStyle(8)}>
          <div style={formSectionStyle}>
            <div style={formSectionHeadStyle}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', color: colors.inkMuted }}>playlist_add_check</span>
              Scoring Segments Checklist
            </div>
            <div style={{ padding: '8px 0' }}>
              {segments.map(seg => {
                const status = getSegmentStatus(seg.id);
                const isHovered = hoveredSegment === seg.id;
                return (
                  <div 
                    key={seg.id} 
                    style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        padding: '20px 32px', 
                        borderBottom: `1px solid ${colors.borderSoft}`, 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isHovered ? 'rgba(248, 250, 252, 0.8)' : 'transparent',
                    }} 
                    onClick={() => navigate('/judge/scoring')}
                    onMouseEnter={() => setHoveredSegment(seg.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: seg.colorBg, color: seg.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>{seg.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: colors.navy, marginBottom: '4px' }}>{seg.label}</p>
                      <p style={{ fontSize: '13px', color: colors.inkMuted }}>{seg.criteria.length} Criteria · Max {seg.criteria.reduce((a, c) => a + c.maxScore, 0)} points</p>
                    </div>
                    <div style={statusBadgeStyle(status)}>
                      {status === 'submitted' ? 'Finalized' : status === 'ready' ? 'Ready to Lock' : 'In Progress'}
                    </div>
                    <span className="material-symbols-rounded" style={{ color: colors.border, fontSize: '20px', transform: isHovered ? 'translateX(4px)' : 'none', transition: 'transform 0.22s' }}>chevron_right</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Contestant Breakdown */}
        <div style={{ ...getColSpanStyle(4), display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={widgetCardStyle('participants-mini')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span className="material-symbols-rounded" style={{ color: colors.accent }}>person_check</span>
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '16px', color: colors.navy }}>Contestants</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {participants.map(p => {
                const scored = hasScored(p.id);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '14px', background: scored ? colors.accentBg : '#F8FAFC', border: scored ? `1px solid ${colors.accentBgMid}` : '1px solid transparent' }}>
                    <div style={{ background: scored ? colors.accent : colors.navy, width: '30px', height: '30px', fontSize: '12px', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', borderRadius: '10px' }}>{p.number}</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: colors.navy }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: colors.inkMuted, opacity: 0.8 }}>{p.barangay}</div>
                    </div>
                    {scored && <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '18px' }}>done_all</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...widgetCardStyle('assigned-event'), background: colors.navy, border: 'none', color: '#fff', boxShadow: hoveredCard === 'assigned-event' ? '0 10px 25px -5px rgba(15, 23, 42, 0.4)' : 'none' }}>
            <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Assigned Event</h3>
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