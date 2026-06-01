import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJudgeContext } from './JudgeLayout';
import { colors } from '../../styles/colors';
import { API_URL as API_BASE } from '../../config';

export default function SportsMatchListPage() {
  const navigate = useNavigate();
  const { event } = useJudgeContext();
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMatch, setHoveredMatch] = useState(null);

  useEffect(() => {
    if (!event?.id) { setLoading(false); return; }
    fetch(`${API_BASE}/sports/brackets?event_id=${event.id}`)
      .then(r => r.json())
      .then(data => { if (data.success) setBrackets(data.data.filter(b => b.round_number > 0)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [event?.id]);

  if (!event) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '16px', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border }}>sports</span>
        <h3 style={{ fontWeight: '700', color: colors.navy, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>No event selected</h3>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Accept a sports event invitation to access match scoring.</p>
      </div>
    );
  }

  if (event.competition_category !== 'sports' && event.type !== 'Sports') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '16px', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border }}>block</span>
        <h3 style={{ fontWeight: '700', color: colors.navy, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Not a sports event</h3>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>The selected event is not configured as a sports competition.</p>
      </div>
    );
  }

  const sport = event.sport_config || {};

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${colors.navy}, ${colors.navySoft})`, display: 'grid', placeItems: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px', color: '#fff' }}>sports</span>
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: colors.navy, margin: 0, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              {sport.display_name || 'Sports'} Matches
            </h1>
            <p style={{ fontSize: '13px', color: colors.inkMuted, margin: 0 }}>{event.name} · Select a match to score</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '80px', background: colors.pageBg, borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      ) : brackets.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '64px 32px', textAlign: 'center', border: `1px solid ${colors.borderSoft}` }}>
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '16px' }}>bracket</span>
          <h3 style={{ fontWeight: '700', color: colors.navy, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>No matches yet</h3>
          <p style={{ color: colors.inkMuted, fontSize: '13px' }}>The organizer hasn't generated brackets for this event yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...new Set(brackets.map(b => b.round_number))].sort((a, b) => a - b).map(round => (
            <div key={round}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 8px 4px' }}>Round {round}</div>
              {brackets.filter(b => b.round_number === round).map(b => {
                const ta = b.team_a;
                const tb = b.team_b;
                const isHov = hoveredMatch === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/judge/sports-scoring/${b.id}`)}
                    onMouseEnter={() => setHoveredMatch(b.id)}
                    onMouseLeave={() => setHoveredMatch(null)}
                    style={{
                      background: '#fff', borderRadius: '16px', padding: '16px 20px',
                      border: `1px solid ${isHov ? colors.accentGlow : colors.borderSoft}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: isHov ? '0 6px 20px rgba(15,23,42,0.08)' : '0 2px 6px rgba(15,23,42,0.04)',
                      display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, minWidth: '44px', textAlign: 'center' }}>M{b.match_number}</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: ta ? colors.navy : colors.inkMuted, fontStyle: ta ? 'normal' : 'italic' }}>{ta?.name || 'TBD'}</span>
                      </div>
                      <div style={{ padding: '4px 12px', background: colors.pageBg, borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: colors.inkMuted }}>vs</div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: tb ? colors.navy : colors.inkMuted, fontStyle: tb ? 'normal' : 'italic' }}>{tb?.name || 'TBD'}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', flexShrink: 0,
                      background: b.status === 'completed' ? colors.successBg : b.status === 'in_progress' ? colors.accentBg : colors.pageBg,
                      color: b.status === 'completed' ? colors.success : b.status === 'in_progress' ? colors.accent : colors.inkMuted,
                    }}>
                      {b.status === 'in_progress' ? 'Live' : b.status?.replace('_', ' ')}
                    </span>
                    {b.status !== 'completed' && (
                      <span className="material-symbols-rounded" style={{ fontSize: '18px', color: colors.inkMuted }}>chevron_right</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
