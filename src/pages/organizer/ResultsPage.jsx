import React, { useState, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getElapsed(startDate, startTime) {
  if (!startDate) return null;
  const start = new Date(`${startDate}T${startTime || '00:00'}`);
  const now = new Date();
  const diff = now - start;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours/24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

export default function ResultsPage() {
  const { selectedEvent, participants, judges, showToast } = useEventContext();
  const [, forceUpdate] = useState(0);
  const [liveToggle, setLiveToggle] = useState(true);

  // Tick every 30s for elapsed time
  useEffect(() => { const t = setInterval(() => forceUpdate(n => n + 1), 30000); return () => clearInterval(t); }, []);

  // Sort participants by score desc
  const ranked = [...participants].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const scoredCount = participants.filter(p => p.score != null).length;
  const highScore = ranked.find(p => p.score != null)?.score ?? null;
  const avgScore = scoredCount > 0 ? (participants.filter(p => p.score != null).reduce((s, p) => s + p.score, 0) / scoredCount).toFixed(1) : null;
  const elapsed = getElapsed(selectedEvent.startDate, selectedEvent.startTime);

  const isLive = selectedEvent.status === 'Active';

  return (
    <>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {isLive && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: '100px' }}>
                <span style={{ width: '6px', height: '6px', background: '#DC2626', borderRadius: '50%', animation: 'blink 1.2s infinite' }} />
                Live
              </span>
            )}
            {elapsed && <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>Running for {elapsed}</span>}
          </div>
          <h1 className="page-title">Results & Standings</h1>
          <p className="page-description">Live scoring overview for <strong style={{ color: 'var(--navy)' }}>{selectedEvent.name}</strong>.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-btn" onClick={() => { setLiveToggle(!liveToggle); showToast(liveToggle ? 'Live refresh paused.' : 'Live refresh resumed.', 'info'); }}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{liveToggle ? 'pause' : 'play_arrow'}</span>
            {liveToggle ? 'Pause Live' : 'Resume Live'}
          </button>
          <button className="primary-btn" onClick={() => showToast('Generating PDF rankings... Download starting.', 'success')}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Event Summary KPIs ── */}
      <div className="dashboard-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Event Status', value: selectedEvent.status, icon: 'info', color: isLive ? '#16A34A' : 'var(--navy)' },
          { label: 'Schedule Ends', value: `${formatDate(selectedEvent.endDate)} at ${selectedEvent.endTime || '—'}`, icon: 'event', color: 'var(--navy)' },
          { label: 'Participants', value: `${participants.length} total`, icon: 'groups', color: 'var(--navy)' },
          { label: 'Judges', value: `${judges.filter(j => j.status === 'Accepted').length} active`, icon: 'gavel', color: 'var(--navy)' },
        ].map(k => (
          <div key={k.label} className="widget-card col-span-3">
            <span className="stat-label">{k.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '20px', color: k.color }}>{k.icon}</span>
              <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-head)', color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Score Stats ── */}
      <div className="dashboard-grid" style={{ marginBottom: '28px' }}>
        <div className="widget-card col-span-3">
          <span className="stat-label">Scores Submitted</span>
          <div className="stat-value">{scoredCount}<span style={{ fontSize: '16px', color: 'var(--ink-muted)', marginLeft: '4px' }}>/{participants.length}</span></div>
          {participants.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ height: '5px', background: 'var(--border-soft)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(scoredCount / participants.length) * 100}%`, background: 'var(--accent)', borderRadius: '100px', transition: 'width 0.5s' }} />
              </div>
            </div>
          )}
        </div>
        <div className="widget-card col-span-3">
          <span className="stat-label">Highest Score</span>
          <div className="stat-value" style={{ color: highScore != null ? '#16A34A' : 'var(--ink-muted)' }}>
            {highScore ?? '—'}
          </div>
          {ranked[0] && highScore != null && (
            <div className="stat-trend"><span className="material-symbols-rounded" style={{ fontSize: '16px' }}>emoji_events</span>{ranked[0].name}</div>
          )}
        </div>
        <div className="widget-card col-span-3">
          <span className="stat-label">Average Score</span>
          <div className="stat-value" style={{ color: avgScore ? 'var(--navy)' : 'var(--ink-muted)' }}>{avgScore ?? '—'}</div>
        </div>
        <div className="widget-card col-span-3">
          <span className="stat-label">Current Leader</span>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: '10px' }}>
            {ranked[0] && ranked[0].score != null ? ranked[0].name : '—'}
          </div>
          {ranked[0] && ranked[0].score != null && (
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>{ranked[0].team}</div>
          )}
        </div>
      </div>

      {/* ── Leaderboard Table ── */}
      <div className="table-container">
        <div className="table-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px', color: 'var(--navy)' }}>leaderboard</span>
            Official Leaderboard
            {isLive && liveToggle && <span style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%', animation: 'blink 1.2s infinite', marginLeft: '4px' }} />}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
            {liveToggle ? 'Auto-refreshing...' : 'Paused'}
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '70px', textAlign: 'center' }}>Rank</th>
              <th>Participant</th>
              <th>Team</th>
              <th style={{ textAlign: 'center' }}>Criteria</th>
              <th style={{ textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '64px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                No participants added yet.
              </td></tr>
            ) : (
              ranked.map((p, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                const rankDisplay = p.score != null ? (medal || idx + 1) : '—';
                return (
                  <tr key={p.id} style={{ background: idx === 0 && p.score != null ? 'rgba(250, 204, 21, 0.04)' : undefined }}>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: idx < 3 && p.score != null ? '20px' : '16px', color: p.score != null ? 'var(--navy)' : 'var(--ink-muted)' }}>
                      {rankDisplay}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, color: 'var(--navy)' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '11px', background: idx === 0 && p.score != null ? 'rgba(250,204,21,0.15)' : 'var(--accent-bg)', color: idx === 0 && p.score != null ? '#B45309' : 'var(--accent-deep)' }}>
                          {p.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        {p.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink-mid)', fontSize: '13px' }}>{p.team}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: 'var(--page-bg)', color: 'var(--ink-muted)', borderRadius: '100px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>
                        {p.score != null ? 'Scored' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '22px', color: p.score != null ? (idx === 0 ? '#16A34A' : 'var(--navy)') : 'var(--ink-muted)' }}>
                      {p.score ?? '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
