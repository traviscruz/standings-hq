import React, { useState, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';

export default function OrganizerAnalyticsPage() {
  const { selectedEventId, getParticipants, getJudges, getRubrics, showToast } = useEventContext();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const participants = getParticipants();
  const judges = getJudges();
  const rubrics = getRubrics();

  const avgScore = participants.length > 0 ? (participants.reduce((a, b) => a + (b.score || 0), 0) / participants.length).toFixed(1) : '88.5';
  
  // Memoized mock data so values don't change on re-render (e.g. during hover)
  const criteriaStats = React.useMemo(() => {
    return rubrics.length > 0 ? rubrics.map((r, i) => ({
      name: r.name,
      value: 70 + (i * 5) + Math.random() * 10,
      color: colors.accent
    })) : [
      { name: 'Technical Execution', value: 85 },
      { name: 'Artistic Presentation', value: 78 },
      { name: 'Complexity', value: 92 },
      { name: 'Timing', value: 88 }
    ];
  }, [rubrics]);

  const judgeStats = React.useMemo(() => {
    return judges.length > 0 ? judges.map((j, i) => ({
      name: j.name.split(' ')[0],
      avg: 85 + Math.random() * 8,
      color: i % 2 === 0 ? colors.navy : colors.navySoft
    })) : [
      { name: 'Sarah', avg: 89, color: colors.navy },
      { name: 'Marian', avg: 84, color: colors.navySoft },
      { name: 'Dingdong', avg: 91, color: colors.navy }
    ];
  }, [judges]);

  const styles = {
    pageContainer: {
      animation: 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '24px',
      marginBottom: '40px',
    },
    pageTitle: {
      fontSize: isMobile ? '28px' : '36px',
      fontWeight: '900',
      color: colors.navy,
      letterSpacing: '-0.04em',
      fontFamily: "'DM Sans', sans-serif",
      margin: '0 0 12px 0',
    },
    btn: (hovered, primary = false) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 24px',
      borderRadius: '14px',
      fontSize: '14.5px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
      boxShadow: hovered ? '0 8px 24px -6px rgba(15, 31, 61, 0.2)' : 'none',
      transform: hovered ? 'translateY(-2px)' : 'none',
    }),
    widgetCard: (id, span, gradient = 'none') => ({
      background: hoveredCard === id ? '#fff' : (gradient !== 'none' ? gradient : '#fff'),
      border: `1.5px solid ${hoveredCard === id ? colors.accent : colors.borderSoft}`,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: hoveredCard === id ? '0 30px 60px -12px rgba(15, 23, 42, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      gridColumn: isMobile ? 'span 1' : `span ${span}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
      transform: hoveredCard === id ? 'translateY(-6px)' : 'none',
    }),
    iconWrapper: (bg, color) => ({
      width: '44px',
      height: '44px',
      borderRadius: '14px',
      background: bg,
      color: color,
      display: 'grid',
      placeItems: 'center',
      marginBottom: '4px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    }),
    chartLabel: {
      fontSize: '11px',
      fontWeight: '900',
      textTransform: 'uppercase',
      color: colors.inkMuted,
      letterSpacing: '0.04em',
    }
  };

  return (
    <div style={styles.pageContainer}>
      <header style={styles.pageHeader}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '100px', fontSize: '11px', fontWeight: '800', color: colors.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>analytics</span>
            Insight Hub
          </div>
          <h1 style={styles.pageTitle}>Data Intelligence</h1>
          <p style={{ color: colors.inkSoft, fontSize: '16px', maxWidth: '600px' }}>
            Comprehensive performance metrics and scoring distribution analysis for the current event.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={styles.btn(activeBtnHover === 'export', true)} 
            onMouseEnter={() => setActiveBtnHover('export')} 
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => showToast('Preparing your audit export...', 'info')}
          >
            <span className="material-symbols-rounded">download</span>
            Export Audit
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={styles.widgetCard('kpi-1', 3, `linear-gradient(135deg, #fff 40%, ${colors.accentBg} 100%)`)} onMouseEnter={() => setHoveredCard('kpi-1')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper(colors.accentBg, colors.accent)}>
            <span className="material-symbols-rounded">monitoring</span>
          </div>
          <div style={styles.chartLabel}>Overall Average</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy }}>{avgScore}</div>
          <div style={{ fontSize: '13px', color: colors.success, fontWeight: 700 }}>+2.4% vs last</div>
        </div>

        <div style={styles.widgetCard('kpi-2', 3, 'linear-gradient(135deg, #fff 40%, #EEF2FF 100%)')} onMouseEnter={() => setHoveredCard('kpi-2')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper('#EEF2FF', '#6366F1')}>
            <span className="material-symbols-rounded">electric_bolt</span>
          </div>
          <div style={styles.chartLabel}>Velocity</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy }}>4.2m</div>
          <div style={{ fontSize: '13px', color: colors.success, fontWeight: 700 }}>12% faster</div>
        </div>

        <div style={styles.widgetCard('kpi-3', 3, 'linear-gradient(135deg, #fff 40%, #F0FDF4 100%)')} onMouseEnter={() => setHoveredCard('kpi-3')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper('#F0FDF4', colors.success)}>
            <span className="material-symbols-rounded">verified_user</span>
          </div>
          <div style={styles.chartLabel}>Consensus</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy }}>94%</div>
          <div style={{ fontSize: '13px', color: colors.success, fontWeight: 700 }}>Highly Reliable</div>
        </div>

        <div style={styles.widgetCard('kpi-4', 3, 'linear-gradient(135deg, #fff 40%, #FFF7ED 100%)')} onMouseEnter={() => setHoveredCard('kpi-4')} onMouseLeave={() => setHoveredCard(null)}>
          <div style={styles.iconWrapper('#FFF7ED', '#EA580C')}>
            <span className="material-symbols-rounded">groups</span>
          </div>
          <div style={styles.chartLabel}>Participation</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy }}>{participants.length}</div>
          <div style={{ fontSize: '13px', color: colors.success, fontWeight: 700 }}>+15% join rate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)', gap: '32px' }}>
        {/* Left Main Section (Span 8) */}
        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Scoring Strength */}
          <div style={{ ...styles.widgetCard('chart-1', 12), gap: '24px' }} onMouseEnter={() => setHoveredCard('chart-1')} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>equalizer</span>
              <span style={{ fontWeight: 800, color: colors.navy, fontSize: '16px' }}>Scoring Strength by Criteria</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {criteriaStats.map((stat, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: colors.navy }}>{stat.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '900', color: colors.accent }}>{stat.value.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: '12px', background: colors.pageBg, borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${stat.value}%`, 
                        background: hoveredCard === 'chart-1' ? `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accentDeep} 100%)` : colors.accent,
                        borderRadius: '100px',
                        transition: 'width 1s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                      }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Demographic performance list (Extended) */}
          <div style={{ ...styles.widgetCard('chart-extra', 12), padding: 0, overflow: 'hidden' }} onMouseEnter={() => setHoveredCard('chart-extra')} onMouseLeave={() => setHoveredCard(null)}>
             <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-rounded" style={{ color: colors.success, fontSize: '20px' }}>map</span>
                  <span style={{ fontWeight: 800, color: colors.navy, fontSize: '16px' }}>Top Performing Regions</span>
                </div>
                <button style={{ background: 'none', border: 'none', color: colors.accent, fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>View Heatmap</button>
             </div>
             <div style={{ padding: '12px 24px 24px' }}>
                {[
                  { n: 'Quezon City South', v: 92.4, t: '+5.2%' },
                  { n: 'Manila Bay Area', v: 88.1, t: '+1.8%' },
                  { n: 'Caloocan North', v: 84.5, t: '-0.4%' },
                  { n: 'Makati Business Dist', v: 81.0, t: '+2.5%' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 0', borderBottom: i < 3 ? `1px solid ${colors.borderSoft}` : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: colors.pageBg, display: 'grid', placeItems: 'center', fontWeight: '800', color: colors.navy, fontSize: '12px' }}>{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: colors.navy }}>{r.n}</div>
                      <div style={{ fontSize: '12px', color: colors.inkMuted }}>Historical Rating</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: colors.navy }}>{r.v}</div>
                      <div style={{ fontSize: '11px', color: r.t.startsWith('+') ? colors.success : colors.error, fontWeight: 700 }}>{r.t}</div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Sidebar Section (Span 4) */}
        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Submission Pie Widget */}
          <div style={{ ...styles.widgetCard('chart-2', 12), alignItems: 'center', padding: '32px 24px' }} onMouseEnter={() => setHoveredCard('chart-2')} onMouseLeave={() => setHoveredCard(null)}>
              <div style={styles.chartLabel}>Current Submission State</div>
              <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
                  <svg width="150" height="150" viewBox="0 0 36 36">
                    <path fill="none" stroke="#F1F5F9" strokeWidth="4" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path fill="none" stroke={colors.accent} strokeWidth="4" strokeDasharray="65, 100" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: colors.navy }}>65%</div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done</div>
                  </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.accent }} />
                   <span style={{ color: colors.navy, fontWeight: 700 }}>Finalized: 65%</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F1F5F9' }} />
                   <span style={{ color: colors.inkMuted, fontWeight: 600 }}>In Review: 35%</span>
                 </div>
              </div>
          </div>

          {/* Judge Stats Small */}
          <div style={{ ...styles.widgetCard('chart-3', 12), gap: '20px' }} onMouseEnter={() => setHoveredCard('chart-3')} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-rounded" style={{ color: '#6366F1', fontSize: '18px' }}>psychology</span>
              <span style={{ fontWeight: 800, color: colors.navy, fontSize: '14.5px' }}>Judge Tendencies</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '100px', paddingBottom: '16px' }}>
                {judgeStats.map((j, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '100%', 
                      background: hoveredCard === 'chart-3' ? colors.accent : j.color, 
                      height: `${j.avg}%`, 
                      borderRadius: '8px 8px 3px 3px', 
                      position: 'relative',
                      transition: 'all 0.5s',
                      opacity: 0.8
                    }}>
                      <div style={{ position: 'absolute', top: '-22px', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: '900', color: colors.navy }}>{j.avg.toFixed(0)}</div>
                    </div>
                  </div>
                ))}
            </div>
            <p style={{ fontSize: '11px', color: colors.inkMuted, margin: 0, textAlign: 'center' }}>Scoring consistency is **Optimal**</p>
          </div>

          {/* Premium Audit CTA (Repurposed from Dashboard roadmap style) */}
          <div style={{ 
              background: colors.navy,
              borderRadius: '24px',
              padding: '28px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden'
          }}>
              <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '80px' }}>verified_user</span>
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', position: 'relative' }}>Final Audit</h4>
              <p style={{ margin: '0 0 20px 0', opacity: 0.6, fontSize: '12.5px', lineHeight: '1.5', position: 'relative' }}>
                  Generate a tamper-proof technical audit of all scores.
              </p>
              <button style={{ ...styles.btn(activeBtnHover === 'cta', true), background: '#fff', color: colors.navy, width: '100%', padding: '10px', fontSize: '13px' }}
                  onMouseEnter={() => setActiveBtnHover('cta')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                  onClick={() => showToast('Generating high-resolution PDF...', 'success')}
              >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>description</span>
                  Export Audit PDF
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
