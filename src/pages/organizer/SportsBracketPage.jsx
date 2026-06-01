import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { API_URL } from '../../config';
import { createClient } from '../../utils/supabase/client';

function groupByRound(matches) {
  const rounds = {};
  matches.forEach(m => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });
  return Object.entries(rounds)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([round, mList]) => ({
      round: Number(round),
      label: mList[0]?.round_label || `Round ${round}`,
      matches: mList.sort((a, b) => a.match_order - b.match_order)
    }));
}

export default function SportsBracketPage() {
  const { selectedEvent, showToast, eventsLoading } = useEventContext();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [sportsSetup, setSportsSetup] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [hoveredMatch, setHoveredMatch] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => { setHasData(false); }, [selectedEvent?.id]);

  const isMobile = windowWidth <= 768;
  const isSportsEvent = selectedEvent?.competition_mode === 'sports';

  const fetchData = useCallback(async () => {
    if (!selectedEvent) return;
    try {
      const [setupRes, bracketsRes] = await Promise.all([
        fetch(`${API_URL}/sports/setup?event_id=${selectedEvent.id}`),
        fetch(`${API_URL}/sports/brackets?event_id=${selectedEvent.id}`)
      ]);
      const setupJson = await setupRes.json();
      const bracketsJson = await bracketsRes.json();
      if (setupJson.success) setSportsSetup(setupJson.data);
      if (bracketsJson.success) setMatches(bracketsJson.data || []);
      setHasData(true);
    } catch {
      setHasData(true);
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    if (selectedEvent?.id) {
      const supabase = createClient();
      const channel = supabase
        .channel('sports-brackets-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'match_brackets', filter: `event_id=eq.${selectedEvent.id}` }, fetchData)
        .subscribe();
      return () => { clearInterval(interval); supabase.removeChannel(channel); };
    }
    return () => clearInterval(interval);
  }, [fetchData, selectedEvent?.id]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch(`${API_URL}/sports/brackets/event/${selectedEvent.id}`, { method: 'DELETE' });
      const cfg = sportsSetup?.config;
      if (cfg?.teams) {
        const res = await fetch(`${API_URL}/sports/brackets/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: selectedEvent.id, teams: cfg.teams.map(t => t.name), bracketFormat: cfg.bracketFormat })
        });
        const json = await res.json();
        if (json.success) setMatches(json.data || []);
      }
      showToast('Bracket reset successfully.', 'success');
    } catch {
      showToast('Failed to reset bracket.', 'error');
    } finally {
      setIsResetting(false);
      setConfirmReset(false);
    }
  };

  const cfg = sportsSetup?.config || {};
  const teamColors = {};
  (cfg.teams || []).forEach(t => { teamColors[t.name] = t.color; });
  const getColor = name => teamColors[name] || colors.accent;

  const winCondition = cfg.winCondition || 'most_points';
  const periodLabel = cfg.periodLabel || 'Quarter';
  const periodsPerMatch = cfg.periodsPerMatch || 4;
  const isRoundRobin = cfg.bracketFormat === 'round_robin' || matches.some(m => m.round_label === 'Round Robin');
  const roundedData = groupByRound(matches);
  const allCompleted = matches.length > 0 && matches.every(m => m.status === 'completed');

  const champion = React.useMemo(() => {
    if (!matches.length) return null;
    if (isRoundRobin) {
      if (!allCompleted) return null;
      const wins = {};
      matches.forEach(m => { if (m.status === 'completed' && m.winner) wins[m.winner] = (wins[m.winner] || 0) + 1; });
      const sorted = Object.entries(wins).sort((a, b) => b[1] - a[1]);
      if (sorted.length && (!sorted[1] || sorted[0][1] > sorted[1][1])) return sorted[0][0];
      return null;
    }
    const maxRound = roundedData.length ? Math.max(...roundedData.map(r => r.round)) : 0;
    return roundedData.find(r => r.round === maxRound)?.matches[0]?.winner || null;
  }, [matches, isRoundRobin, allCompleted, roundedData]);

  const rrStandings = React.useMemo(() => {
    if (!isRoundRobin) return [];
    const map = {};
    matches.forEach(m => {
      [m.team_a, m.team_b].forEach(t => { if (t && t !== 'BYE' && !map[t]) map[t] = { name: t, wins: 0, losses: 0, played: 0, pf: 0, pa: 0 }; });
      if (m.status === 'completed' && m.winner) {
        const sa = Object.values(m.score_a || {}).reduce((s, v) => s + Number(v), 0);
        const sb = Object.values(m.score_b || {}).reduce((s, v) => s + Number(v), 0);
        if (map[m.team_a]) { map[m.team_a].played++; map[m.team_a].pf += sa; map[m.team_a].pa += sb; }
        if (map[m.team_b]) { map[m.team_b].played++; map[m.team_b].pf += sb; map[m.team_b].pa += sa; }
        if (map[m.winner]) map[m.winner].wins++;
        const loser = m.winner === m.team_a ? m.team_b : m.team_a;
        if (map[loser]) map[loser].losses++;
      }
    });
    return Object.values(map).sort((a, b) => b.wins - a.wins || (b.pf - b.pa) - (a.pf - a.pa));
  }, [matches, isRoundRobin]);

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!isSportsEvent && !eventsLoading && selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: colors.accentBg, display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: colors.accent }}>account_tree</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>Bracket Unavailable</h2>
        <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
          Match Brackets are only available for <strong>Sports</strong> competition events.
        </p>
      </div>
    );
  }

  if (!hasData || eventsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${colors.borderSoft}`, borderTopColor: colors.accent, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: colors.inkMuted, fontWeight: '600' }}>Loading bracket...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!sportsSetup) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#F59E0B' }}>sports</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>No Sport Setup Found</h2>
        <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Complete the Sport Setup Builder first to generate match brackets.
        </p>
        <button onClick={() => navigate('/organizer/sports-setup')} style={{ padding: '12px 24px', borderRadius: '14px', background: colors.navy, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          Go to Sport Setup
        </button>
      </div>
    );
  }


  const getMatchScore = (m) => {
    if (!m.score_a || !Object.keys(m.score_a).length) return null;
    if (winCondition === 'most_points') {
      const totA = Object.values(m.score_a).reduce((s, v) => s + Number(v), 0);
      const totB = Object.values(m.score_b || {}).reduce((s, v) => s + Number(v), 0);
      return { a: totA, b: totB, label: 'pts' };
    }
    let wA = 0, wB = 0;
    for (let p = 1; p <= periodsPerMatch; p++) {
      const va = Number(m.score_a[`p${p}`] || 0), vb = Number((m.score_b || {})[`p${p}`] || 0);
      if (va > vb) wA++; else if (vb > va) wB++;
    }
    return { a: wA, b: wB, label: `${periodLabel.toLowerCase()}${wA + wB !== 1 ? 's' : ''} won` };
  };

  const CARD_H = 116; // taller for sports to fit score + period chips
  const CARD_W = 240;
  const SLOT_H = 176;
  const CONNECTOR_W = 48;

  // ── Match Card ──────────────────────────────────────────────────────────────
  const MatchCard = ({ match }) => {
    const isHovered = hoveredMatch === match.id;
    const isCompleted = match.status === 'completed';
    const hasBothTeams = match.team_a && match.team_b && match.team_a !== 'BYE' && match.team_b !== 'BYE';
    const score = getMatchScore(match);

    // Period chips (compact row at bottom)
    const periodChips = score && match.score_a && Object.keys(match.score_a).length > 0
      ? Array.from({ length: periodsPerMatch }, (_, p) => {
          const va = match.score_a?.[`p${p + 1}`];
          const vb = (match.score_b || {})[`p${p + 1}`];
          if (va == null) return null;
          return { p: p + 1, va: Number(va), vb: Number(vb) };
        }).filter(Boolean)
      : [];

    const chipH = periodChips.length > 0 ? 22 : 0;
    const teamRowH = (CARD_H - 26 - chipH) / 2; // 26 = header

    return (
      <div
        onMouseEnter={() => setHoveredMatch(match.id)}
        onMouseLeave={() => setHoveredMatch(null)}
        style={{
          width: CARD_W, height: CARD_H,
          background: '#fff',
          borderRadius: '14px',
          border: `1.5px solid ${isCompleted ? 'rgba(16,185,129,0.35)' : isHovered ? colors.accent + '60' : colors.borderSoft}`,
          boxShadow: isCompleted ? '0 4px 16px rgba(16,185,129,0.1)' : isHovered ? '0 8px 28px rgba(15,23,42,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          transition: 'all 0.2s',
        }}
      >
        {/* Header */}
        <div style={{ height: '26px', padding: '0 11px', background: isCompleted ? 'rgba(16,185,129,0.06)' : '#F8FAFC', borderBottom: '1px solid rgba(0,0,0,0.055)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: colors.inkMuted }}>
            Match {match.match_order}
          </span>
          {isCompleted ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 800, color: colors.success, textTransform: 'uppercase' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '11px' }}>check_circle</span> Done
            </span>
          ) : hasBothTeams ? (
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#D97706', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase' }}>Pending</span>
          ) : (
            <span style={{ fontSize: '9px', color: colors.inkMuted, fontWeight: 600 }}>Waiting</span>
          )}
        </div>

        {/* Team rows */}
        {[{ team: match.team_a, side: 'a' }, { team: match.team_b, side: 'b' }].map(({ team, side }) => {
          const isWinner = match.winner === team;
          const isLoser = match.winner && match.winner !== team && team;
          const isTBD = !team || team === 'BYE';
          const teamColor = isTBD ? '#CBD5E1' : getColor(team);
          const sideScore = score ? (side === 'a' ? score.a : score.b) : null;

          return (
            <div key={side} style={{
              height: teamRowH, display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0 10px',
              borderBottom: side === 'a' ? '1px solid rgba(0,0,0,0.05)' : 'none',
              background: isWinner ? `${teamColor}12` : 'transparent',
              opacity: isLoser ? 0.36 : 1,
              position: 'relative', overflow: 'hidden',
              flexShrink: 0,
            }}>
              {isWinner && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: teamColor }} />}
              <div style={{ width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, background: isTBD ? '#E2E8F0' : teamColor, display: 'grid', placeItems: 'center' }}>
                {isWinner
                  ? <span className="material-symbols-rounded" style={{ fontSize: '12px', color: '#fff' }}>emoji_events</span>
                  : isTBD
                    ? <span className="material-symbols-rounded" style={{ fontSize: '11px', color: '#94A3B8' }}>more_horiz</span>
                    : <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff' }}>{team?.[0]}</span>}
              </div>
              <span style={{ flex: 1, fontSize: '12px', fontWeight: isWinner ? 800 : 600, color: isTBD ? colors.inkMuted : isWinner ? teamColor : colors.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isTBD ? 'TBD' : team}
              </span>
              {sideScore !== null && (
                <span style={{ fontSize: '14px', fontWeight: 900, color: isWinner ? teamColor : colors.inkMuted, flexShrink: 0, minWidth: '18px', textAlign: 'right' }}>{sideScore}</span>
              )}
            </div>
          );
        })}

        {/* Period chips */}
        {periodChips.length > 0 && (
          <div style={{ height: chipH, padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px', background: colors.pageBg, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {periodChips.map(({ p, va, vb }) => (
              <div key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '1px 5px', borderRadius: '4px', background: '#fff', border: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
                <span style={{ fontSize: '8px', color: colors.inkMuted, fontWeight: 700 }}>{periodLabel[0]}{p}</span>
                <span style={{ fontSize: '8.5px', fontWeight: 800, color: colors.navy }}>{va}–{vb}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes champPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(252,211,77,0.4); } 50% { box-shadow: 0 0 0 16px rgba(252,211,77,0); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: '12px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>account_tree</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: colors.accent, letterSpacing: '0.04em' }}>Match Brackets</span>
          </div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '32px', fontWeight: 800, color: colors.navy, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            {cfg.sportType || cfg.sportName || 'Sports'} Bracket
          </h1>
          <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '520px', lineHeight: '1.55', margin: 0 }}>
            Scores are recorded by judges in real-time. Winners advance automatically.
          </p>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', transition: 'all 0.2s' }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>restart_alt</span>
          Reset Bracket
        </button>
      </div>

      {/* Champion Banner */}
      {champion && (
        <div style={{ background: 'linear-gradient(135deg, #1E2D4A 0%, #2E4268 100%)', borderRadius: '20px', padding: '28px 32px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(252,211,77,0.15)', border: '2px solid rgba(252,211,77,0.3)', display: 'grid', placeItems: 'center', flexShrink: 0, animation: 'champPulse 2.5s ease-in-out infinite' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '34px', color: '#FCD34D' }}>emoji_events</span>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>🏆 Champion</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '28px', fontWeight: 900, color: '#FCD34D', letterSpacing: '-0.02em' }}>{champion}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{cfg.sportType || cfg.sportName} · {selectedEvent.name}</div>
          </div>
        </div>
      )}

      {/* Round Robin Standings */}
      {isRoundRobin && rrStandings.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '20px', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', alignItems: 'center', gap: '10px', background: '#FAFBFC' }}>
            <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>leaderboard</span>
            <span style={{ fontWeight: 800, color: colors.navy, fontSize: '15px' }}>Standings</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.borderSoft}`, background: colors.pageBg }}>
                  {['#', 'Team', 'W', 'L', 'Played', 'Pts For', 'Pts Agst'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Team' ? 'left' : 'center', fontSize: '11px', fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rrStandings.map((t, i) => (
                  <tr key={t.name} style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800, margin: '0 auto',
                        background: i === 0 ? '#FEF3C7' : i === 1 ? '#F1F5F9' : i === 2 ? '#FFEDD5' : colors.pageBg,
                        color: i === 0 ? '#92400E' : i === 1 ? '#475569' : i === 2 ? '#9A3412' : colors.inkMuted }}>
                        {i + 1}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getColor(t.name), flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: colors.navy, fontSize: '13.5px' }}>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: colors.success }}>{t.wins}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: colors.inkMuted, fontWeight: 600 }}>{t.losses}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: colors.inkMuted }}>{t.played}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: colors.navy }}>{t.pf}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: colors.inkMuted }}>{t.pa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bracket Display */}
      <div style={{ overflowX: 'auto', paddingBottom: '24px' }}>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', background: '#fff', borderRadius: '24px', border: `1.5px dashed ${colors.borderSoft}` }}>
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>account_tree</span>
            <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No bracket generated yet. Complete the Sport Setup Builder first.</p>
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {roundedData.map(({ round, label, matches: rMatches }) => (
              <div key={round}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: colors.navy, display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{round}</span>
                  </div>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 800, color: colors.navy, margin: 0 }}>{label}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {rMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (() => {
          const round1Count = roundedData[0]?.matches.length || 1;
          const totalBracketH = round1Count * SLOT_H;
          const totalRounds = roundedData.length;

          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Round labels */}
              <div style={{ display: 'flex', marginBottom: '16px' }}>
                {roundedData.map(({ round, label }, ridx) => (
                  <React.Fragment key={round}>
                    <div style={{ width: CARD_W, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ padding: '5px 14px', borderRadius: '100px', background: round === totalRounds ? 'rgba(252,211,77,0.12)' : colors.accentBg, border: `1px solid ${round === totalRounds ? 'rgba(252,211,77,0.35)' : colors.accent + '30'}` }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: round === totalRounds ? '#B45309' : colors.accentDeep }}>{label}</span>
                      </div>
                    </div>
                    {ridx < totalRounds - 1 && <div style={{ width: CONNECTOR_W }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Bracket */}
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {roundedData.map(({ round, matches: rMatches }, ridx) => {
                  const slotH = SLOT_H * Math.pow(2, ridx);
                  const isLastRound = ridx === totalRounds - 1;

                  return (
                    <React.Fragment key={round}>
                      <div style={{ position: 'relative', width: CARD_W, height: totalBracketH, flexShrink: 0 }}>
                        {rMatches.map((m, idx) => (
                          <div key={m.id} style={{ position: 'absolute', top: idx * slotH + (slotH - CARD_H) / 2, left: 0 }}>
                            <MatchCard match={m} />
                          </div>
                        ))}
                      </div>

                      {!isLastRound && (
                        <svg width={CONNECTOR_W} height={totalBracketH} style={{ flexShrink: 0, display: 'block' }}>
                          {Array.from({ length: Math.ceil(rMatches.length / 2) }, (_, pairIdx) => {
                            const top = rMatches[pairIdx * 2];
                            const bot = rMatches[pairIdx * 2 + 1];
                            const y1 = pairIdx * 2 * slotH + slotH / 2;
                            const y2 = bot ? (pairIdx * 2 + 1) * slotH + slotH / 2 : y1;
                            const yMid = (y1 + y2) / 2;
                            const hw = CONNECTOR_W / 2;
                            const bothDone = top?.status === 'completed' && (!bot || bot?.status === 'completed');
                            const lineColor = bothDone ? 'rgba(16,185,129,0.5)' : '#D1D5DB';
                            const strokeW = bothDone ? 2 : 1.5;

                            return (
                              <g key={pairIdx}>
                                <line x1={0} y1={y1} x2={hw} y2={y1} stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round" />
                                {bot && <>
                                  <line x1={0} y1={y2} x2={hw} y2={y2} stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round" />
                                  <line x1={hw} y1={y1} x2={hw} y2={y2} stroke={lineColor} strokeWidth={strokeW} />
                                </>}
                                <line x1={hw} y1={yMid} x2={CONNECTOR_W} y2={yMid} stroke={lineColor} strokeWidth={strokeW} strokeLinecap="round" />
                              </g>
                            );
                          })}
                        </svg>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Reset Modal */}
      {confirmReset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.5)', backdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setConfirmReset(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '420px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', display: 'grid', placeItems: 'center', marginBottom: '20px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '28px', color: '#EF4444' }}>restart_alt</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '8px' }}>Reset Bracket?</h2>
            <p style={{ fontSize: '14.5px', color: colors.inkMid, lineHeight: '1.6', marginBottom: '28px' }}>All match results and scores will be cleared and the bracket regenerated. This cannot be undone.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleReset} disabled={isResetting} style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#EF4444', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 700, cursor: isResetting ? 'not-allowed' : 'pointer', opacity: isResetting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isResetting ? <><span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>cached</span> Resetting...</> : 'Yes, Reset Bracket'}
              </button>
              <button onClick={() => setConfirmReset(false)} style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
