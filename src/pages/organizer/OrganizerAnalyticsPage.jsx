import React, { useState, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { formatDate } from '../../utils/dateUtils';
import { colors } from '../../styles/colors';

export default function OrganizerAnalyticsPage() {
  const { selectedEvent, getParticipants, getJudges, getRubrics, rubricConfig, showToast } = useEventContext();
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

  // ── Derived data ──
  const registered   = participants.filter(p => p.status === 'Registered');
  const pending      = participants.filter(p => p.status === 'Pending');
  const scored       = registered.filter(p => p.score != null);
  const unscored     = registered.filter(p => p.score == null);
  const confirmedJ   = judges.filter(j => j.rsvp === 'Accepted' || j.status === 'Accepted');
  const pendingJ     = judges.filter(j => j.rsvp !== 'Accepted' && j.status !== 'Accepted');
  const totalWeight  = rubrics.reduce((s, r) => s + (Number(r.weight) || 0), 0);

  const scores       = scored.map(p => Number(p.score));
  const avgScore     = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const highScore    = scores.length ? Math.max(...scores) : null;
  const lowScore     = scores.length ? Math.min(...scores) : null;

  const topPerformers = [...scored]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 5);

  // Score distribution buckets
  const buckets = [
    { label: '0–20',   min: 0,  max: 20  },
    { label: '21–40',  min: 21, max: 40  },
    { label: '41–60',  min: 41, max: 60  },
    { label: '61–80',  min: 61, max: 80  },
    { label: '81–100', min: 81, max: 100 },
  ].map(b => ({
    ...b,
    count: scores.filter(s => s >= b.min && s <= b.max).length,
  }));
  const maxBucket = Math.max(...buckets.map(b => b.count), 1);

  // ── Export report ──
  const handleExport = () => {
    const win = window.open('', '_blank');
    if (!win) { showToast('Popup blocked. Please allow popups.', 'error'); return; }

    const rankList = [...scored].sort((a, b) => Number(b.score) - Number(a.score));

    win.document.write(`
      <html><head><title>${selectedEvent.name} – Analytics Report</title>
      <style>
        body { font-family: -apple-system, sans-serif; color: #0f172a; padding: 40px; margin: 0; }
        h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; }
        .meta { font-size: 13px; color: #64748b; margin-bottom: 28px; }
        .brand { font-size: 18px; font-weight: 800; }
        .brand span { color: #3b82f6; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
        .kpi { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #f8fafc; }
        .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
        .kpi-value { font-size: 20px; font-weight: 800; }
        h2 { font-size: 15px; font-weight: 700; margin: 24px 0 12px; border-left: 3px solid #3b82f6; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
      </style></head><body>
      <div class="header">
        <div>
          <h1>${selectedEvent.name} – Analytics Report</h1>
          <div class="meta">Generated ${new Date().toLocaleString()} · Status: ${selectedEvent.status}</div>
        </div>
        <div class="brand">Standings<span>HQ</span></div>
      </div>
      <div class="kpis">
        <div class="kpi"><div class="kpi-label">Participants</div><div class="kpi-value">${registered.length}</div></div>
        <div class="kpi"><div class="kpi-label">Scored</div><div class="kpi-value">${scored.length}</div></div>
        <div class="kpi"><div class="kpi-label">Avg Score</div><div class="kpi-value">${avgScore != null ? avgScore.toFixed(1) : '—'}</div></div>
        <div class="kpi"><div class="kpi-label">Judges</div><div class="kpi-value">${judges.length} (${confirmedJ.length} confirmed)</div></div>
      </div>
      <h2>Participant Rankings</h2>
      <table>
        <thead><tr><th>#</th><th>Name</th>${rubricConfig?.format === 'group' || rubricConfig?.format === 'team' ? '<th>Team</th>' : ''}<th>Score</th><th>Status</th></tr></thead>
        <tbody>
          ${registered.map((p, i) => {
            const rank = rankList.findIndex(r => r.id === p.id);
            return `<tr>
              <td>${rank >= 0 ? rank + 1 : '—'}</td>
              <td style="font-weight:700">${p.name}</td>
              ${rubricConfig?.format === 'group' || rubricConfig?.format === 'team' ? `<td>${p.team || '—'}</td>` : ''}
              <td style="font-weight:800">${p.score != null ? Number(p.score).toFixed(1) : '—'}</td>
              <td>${p.score != null ? 'Scored' : 'Pending'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <h2>Rubric Configuration</h2>
      <table>
        <thead><tr><th>Criterion</th><th>Weight</th></tr></thead>
        <tbody>${rubrics.map(r => `<tr><td style="font-weight:700">${r.name || r.label}</td><td>${r.weight}%</td></tr>`).join('')}</tbody>
      </table>
      <h2>Judge Panel</h2>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>${judges.map(j => `<tr><td style="font-weight:700">${j.name || '—'}</td><td>${j.email || '—'}</td><td>${j.rsvp === 'Accepted' || j.status === 'Accepted' ? 'Confirmed' : 'Pending'}</td></tr>`).join('')}</tbody>
      </table>
      <script>window.onload=()=>{ window.print(); setTimeout(()=>window.close(),500); }</script>
      </body></html>
    `);
    win.document.close();
    showToast('Report generated!', 'success');
  };

  // ── Styles ──
  const card = (id, extra = {}) => ({
    background: '#fff',
    border: `1.5px solid ${hoveredCard === id ? colors.accent : colors.borderSoft}`,
    borderRadius: '20px',
    padding: '24px',
    boxShadow: hoveredCard === id ? '0 20px 40px -12px rgba(15,23,42,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
    transition: 'all 0.3s ease',
    transform: hoveredCard === id ? 'translateY(-4px)' : 'none',
    ...extra,
  });

  const iconWrap = (bg, color) => ({
    width: '40px', height: '40px', borderRadius: '12px',
    background: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0,
  });

  const btn = (hovered, primary = false) => ({
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '11px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.2s',
    background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
    color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
    border: primary ? 'none' : `1.5px solid ${hovered ? colors.navy : colors.borderSoft}`,
    boxShadow: hovered ? '0 6px 20px -4px rgba(15,31,61,0.2)' : 'none',
    transform: hovered ? 'translateY(-1px)' : 'none',
  });

  const kpis = [
    {
      id: 'kpi-1', icon: 'groups', bg: colors.accentBg, color: colors.accent,
      label: rubricConfig?.format === 'group' ? 'Teams' : 'Participants',
      value: registered.length,
      sub: pending.length > 0 ? `${pending.length} pending` : 'All registered',
      subColor: pending.length > 0 ? '#D97706' : colors.success,
      grad: `linear-gradient(135deg,#fff 40%,${colors.accentBg} 100%)`,
    },
    {
      id: 'kpi-2', icon: 'gavel', bg: '#F0FDF4', color: '#16A34A',
      label: 'Judges',
      value: judges.length,
      sub: `${confirmedJ.length} confirmed`,
      subColor: confirmedJ.length === judges.length && judges.length > 0 ? colors.success : '#D97706',
      grad: 'linear-gradient(135deg,#fff 40%,#F0FDF4 100%)',
    },
    {
      id: 'kpi-3', icon: 'edit_note', bg: '#FFF7ED', color: '#EA580C',
      label: 'Scoring Progress',
      value: `${scored.length}/${registered.length}`,
      sub: registered.length > 0 ? `${Math.round((scored.length / registered.length) * 100)}% complete` : 'No participants',
      subColor: colors.inkMuted,
      grad: 'linear-gradient(135deg,#fff 40%,#FFF7ED 100%)',
      bar: registered.length > 0 ? scored.length / registered.length : 0,
    },
    {
      id: 'kpi-4', icon: 'analytics', bg: '#EEF2FF', color: '#4F46E5',
      label: 'Rubric Balance',
      value: `${totalWeight}%`,
      sub: totalWeight === 100 ? 'Balanced' : totalWeight > 100 ? 'Over 100%' : 'Under 100%',
      subColor: totalWeight === 100 ? colors.success : colors.error,
      grad: 'linear-gradient(135deg,#fff 40%,#EEF2FF 100%)',
    },
  ];

  return (
    <div className="slide-up-anim">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: '20px', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: '100px', fontSize: '11px', fontWeight: '800', color: colors.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>analytics</span>
            Event Analytics
          </div>
          <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobile ? '28px' : '34px', fontWeight: '900', color: colors.navy, letterSpacing: '-0.04em', margin: '0 0 10px' }}>
            {selectedEvent.name}
          </h1>
          <p style={{ color: colors.inkSoft, fontSize: '15px', margin: 0 }}>
            {selectedEvent.startDate ? formatDate(selectedEvent.startDate) : 'Date TBD'} · {selectedEvent.status}
          </p>
        </div>
        <button
          style={btn(activeBtnHover === 'export', true)}
          onMouseEnter={() => setActiveBtnHover('export')}
          onMouseLeave={() => setActiveBtnHover(null)}
          onClick={handleExport}
        >
          <span className="material-symbols-rounded">download</span>
          Export Report
        </button>
      </header>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: '20px', marginBottom: '28px' }}>
        {kpis.map(k => (
          <div key={k.id} style={{ ...card(k.id, { background: hoveredCard === k.id ? '#fff' : k.grad }) }}
            onMouseEnter={() => setHoveredCard(k.id)} onMouseLeave={() => setHoveredCard(null)}>
            <div style={iconWrap(k.bg, k.color)}>
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.inkMuted, marginTop: '4px' }}>{k.label}</div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: colors.navy, letterSpacing: '-0.03em' }}>{k.value}</div>
            {k.bar != null && (
              <div style={{ height: '4px', background: colors.pageBg, borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${k.bar * 100}%`, background: '#EA580C', borderRadius: '100px' }} />
              </div>
            )}
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: k.subColor }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '24px' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Score Distribution */}
          <div style={card('dist')} onMouseEnter={() => setHoveredCard('dist')} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={iconWrap(colors.accentBg, colors.accent)}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>bar_chart</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: colors.navy, fontSize: '15px' }}>Score Distribution</div>
                <div style={{ fontSize: '12px', color: colors.inkMuted }}>
                  {scored.length > 0 ? `${scored.length} scored · Avg ${avgScore.toFixed(1)} · High ${highScore.toFixed(1)} · Low ${lowScore.toFixed(1)}` : 'No scores recorded yet'}
                </div>
              </div>
            </div>
            {scored.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.border, display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
                <p style={{ color: colors.inkMuted, fontSize: '13px' }}>Scores will appear here once judging begins.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px' }}>
                {buckets.map(b => (
                  <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: colors.navy }}>{b.count > 0 ? b.count : ''}</div>
                    <div style={{ width: '100%', background: b.count > 0 ? colors.accent : colors.pageBg, borderRadius: '8px 8px 4px 4px', height: `${(b.count / maxBucket) * 100}%`, minHeight: b.count > 0 ? '8px' : '4px', transition: 'height 0.5s ease' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, textAlign: 'center' }}>{b.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rubric Weights */}
          <div style={card('rubric')} onMouseEnter={() => setHoveredCard('rubric')} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconWrap('#EEF2FF', '#4F46E5')}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>balance</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: colors.navy, fontSize: '15px' }}>Rubric Breakdown</div>
                  <div style={{ fontSize: '12px', color: colors.inkMuted }}>{rubrics.length} criteria · Total weight: {totalWeight}%</div>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', background: totalWeight === 100 ? '#DCFCE7' : '#FEF3C7', color: totalWeight === 100 ? '#166534' : '#92400E' }}>
                {totalWeight === 100 ? 'Balanced' : 'Imbalanced'}
              </span>
            </div>
            {rubrics.length === 0 ? (
              <p style={{ color: colors.inkMuted, fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No rubric configured yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rubrics.map((r, i) => (
                  <div key={r.id || i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: colors.navy }}>{r.name || r.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#4F46E5' }}>{r.weight}%</span>
                    </div>
                    <div style={{ height: '8px', background: colors.pageBg, borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${r.weight}%`, background: '#4F46E5', borderRadius: '100px', opacity: 0.75 + (i * 0.05) }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Top Performers */}
          <div style={{ ...card('top'), padding: 0, overflow: 'hidden' }} onMouseEnter={() => setHoveredCard('top')} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={iconWrap('#FFFBEB', '#D97706')}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>emoji_events</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: colors.navy, fontSize: '14px' }}>Top Performers</div>
                <div style={{ fontSize: '11px', color: colors.inkMuted }}>By current score</div>
              </div>
            </div>
            {topPerformers.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: colors.inkMuted, fontSize: '13px' }}>No scores yet.</p>
              </div>
            ) : (
              <div>
                {topPerformers.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: i < topPerformers.length - 1 ? `1px solid ${colors.borderSoft}` : 'none' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px', display: 'grid', placeItems: 'center',
                      fontSize: '12px', fontWeight: 800, flexShrink: 0,
                      background: i === 0 ? '#FEF3C7' : i === 1 ? '#F1F5F9' : i === 2 ? '#FFEDD5' : colors.pageBg,
                      color: i === 0 ? '#92400E' : i === 1 ? '#475569' : i === 2 ? '#9A3412' : colors.inkMuted,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      {p.team && <div style={{ fontSize: '11px', color: colors.inkMuted }}>{p.team}</div>}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: colors.navy, flexShrink: 0 }}>{Number(p.score).toFixed(1)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Judge Status */}
          <div style={{ ...card('judges'), padding: 0, overflow: 'hidden' }} onMouseEnter={() => setHoveredCard('judges')} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconWrap('#F0FDF4', '#16A34A')}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>gavel</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: colors.navy, fontSize: '14px' }}>Judge Panel</div>
                  <div style={{ fontSize: '11px', color: colors.inkMuted }}>{confirmedJ.length} of {judges.length} confirmed</div>
                </div>
              </div>
            </div>
            {judges.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center' }}>
                <p style={{ color: colors.inkMuted, fontSize: '13px' }}>No judges assigned yet.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {judges.map(j => {
                  const confirmed = j.rsvp === 'Accepted' || j.status === 'Accepted';
                  return (
                    <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px', borderBottom: `1px solid ${colors.borderSoft}` }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: confirmed ? '#DCFCE7' : '#FEF3C7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '15px', color: confirmed ? '#166534' : '#92400E' }}>
                          {confirmed ? 'how_to_reg' : 'pending'}
                        </span>
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.name || j.email}</div>
                        {j.name && j.email && <div style={{ fontSize: '11px', color: colors.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.email}</div>}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '100px', flexShrink: 0, background: confirmed ? '#DCFCE7' : '#FEF3C7', color: confirmed ? '#166534' : '#92400E' }}>
                        {confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Participant status summary */}
          <div style={card('pstatus')} onMouseEnter={() => setHoveredCard('pstatus')} onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={iconWrap(colors.accentBg, colors.accent)}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>people</span>
              </div>
              <div style={{ fontWeight: 800, color: colors.navy, fontSize: '14px' }}>Participant Summary</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Registered', value: registered.length, color: colors.accent, bg: colors.accentBg },
                { label: 'Pending', value: pending.length, color: '#D97706', bg: '#FFFBEB' },
                { label: 'Scored', value: scored.length, color: '#16A34A', bg: '#F0FDF4' },
                { label: 'Awaiting Score', value: unscored.length, color: '#6366F1', bg: '#EEF2FF' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: row.bg }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.navy }}>{row.label}</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
