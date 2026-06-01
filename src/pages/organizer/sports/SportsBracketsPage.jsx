import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from '../OrganizerLayout';
import { colors } from '../../../styles/colors';
import { API_URL as API_BASE } from '../../../config';

// ── Layout constants ──────────────────────────────────────────────────────────
const CARD_W  = 190;   // match card width
const CARD_H  = 80;    // match card height
const ROW_H   = 40;    // single team row height
const ROUND_GAP = 64;  // horizontal gap between rounds
const V_GAP   = 20;    // vertical gap between cards in round 1
const BASE_UNIT = CARD_H + V_GAP;
const CHAMP_W = 160;
const CHAMP_H = 80;
const LABEL_H = 32;    // height of round label row above bracket

// ── Get round display label ────────────────────────────────────────────────────
function getRoundLabel(round, maxRound) {
  if (round === maxRound) return 'Finals';
  if (round === maxRound - 1) return 'Semifinals';
  if (round === maxRound - 2 && maxRound >= 4) return 'Quarterfinals';
  return `Round ${round}`;
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ match, x, y, hoveredTeamId, setHoveredTeamId, onClick }) {
  const [hov, setHov] = useState(false);
  const ta  = match.team_a;
  const tb  = match.team_b;
  const win = match.winner;
  const live = match.status === 'in_progress';
  const done = match.status === 'completed';

  const teamRow = (team, isTop) => {
    if (!team) {
      return (
        <div style={{
          height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 12px',
          background: 'transparent', borderBottom: isTop ? `1px solid ${colors.borderSoft}` : 'none',
        }}>
          <span style={{ fontSize: 11, color: '#C4C4BF', fontStyle: 'italic' }}>TBD</span>
        </div>
      );
    }

    const isWinner = done && win && win.id === team.id;
    const isLoser  = done && win && win.id !== team.id;
    const isHovered = hoveredTeamId === team.id;

    // Get score values from JSON fields
    const scoreVal = isTop
      ? (match.team_a_score?.total ?? match.team_a_score?.score ?? (typeof match.team_a_score === 'number' ? match.team_a_score : null))
      : (match.team_b_score?.total ?? match.team_b_score?.score ?? (typeof match.team_b_score === 'number' ? match.team_b_score : null));
    const showScore = match.status !== 'pending' || scoreVal !== undefined;

    return (
      <div 
        onMouseEnter={() => setHoveredTeamId(team.id)}
        onMouseLeave={() => setHoveredTeamId(null)}
        style={{
          height: ROW_H, display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 0 12px',
          background: isWinner ? 'rgba(16, 185, 129, 0.05)' : isHovered ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
          borderBottom: isTop ? `1px solid ${colors.borderSoft}` : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Seed box */}
        <div style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          background: isWinner ? '#DEF7EC' : isHovered ? colors.accentBg : '#E8E4DC',
          display: 'grid', placeItems: 'center',
          fontSize: 9, fontWeight: 800, color: isWinner ? colors.success : isHovered ? colors.accent : colors.inkMuted,
        }}>
          {team.seed || team.name?.charAt(0)}
        </div>

        {/* Team name */}
        <span style={{
          fontSize: 12, fontWeight: isWinner ? 750 : isHovered ? 700 : 600, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: isWinner ? colors.success : isLoser ? '#A8A29E' : colors.navy,
          textDecoration: isLoser ? 'line-through' : 'none',
        }}>{team.name}</span>

        {/* Score indicator */}
        {showScore && (
          <div style={{
            width: 32, height: '100%', display: 'grid', placeItems: 'center',
            background: isWinner ? 'rgba(16, 185, 129, 0.12)' : isLoser ? 'rgba(0, 0, 0, 0.02)' : colors.pageBg,
            color: isWinner ? colors.success : isLoser ? '#8C8880' : colors.navy,
            fontWeight: 800, fontSize: 13, borderLeft: `1px solid ${colors.borderSoft}`,
            fontFamily: "'DM Sans', monospace",
          }}>
            {scoreVal ?? 0}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={() => !done && onClick()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      data-clickable="true"
      style={{
        position: 'absolute', left: x, top: y + LABEL_H, width: CARD_W, height: CARD_H,
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        border: `1.5px solid ${live ? colors.success : done ? colors.borderSoft : (hov ? colors.accent : colors.borderSoft)}`,
        boxShadow: live
          ? `0 0 0 3px rgba(16, 185, 129, 0.2), 0 8px 24px rgba(16,185,129,0.15)`
          : hov && !done ? '0 8px 28px rgba(15,23,42,0.12)' : '0 2px 8px rgba(15,23,42,0.04)',
        cursor: done ? 'default' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hov && !done ? 'translateY(-2px)' : 'none',
      }}
    >
      {live && (
        <div style={{ position: 'absolute', top: 4, right: 36, display: 'flex', alignItems: 'center', gap: 3, zIndex: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.success, display: 'block', animation: 'blink 1s infinite' }} />
          <span style={{ fontSize: 8, fontWeight: 900, color: colors.success, letterSpacing: '0.08em' }}>LIVE</span>
        </div>
      )}
      {teamRow(ta, true)}
      {teamRow(tb, false)}
    </div>
  );
}

// ── Round-robin table ─────────────────────────────────────────────────────────
function RoundRobinTable({ brackets, teams, onMatchClick }) {
  const done = brackets.filter(b => b.status === 'completed');
  const standings = teams.map(t => {
    const w = done.filter(b => b.winner?.id === t.id).length;
    const l = done.filter(b => b.status === 'completed' && b.winner?.id !== t.id && (b.team_a?.id === t.id || b.team_b?.id === t.id)).length;
    return { team: t, w, l, played: w + l, pts: w * 3 };
  }).sort((a, b) => b.pts - a.pts || b.w - a.w);

  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', width: '100%' }}>
      {/* Standings */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <h3 style={{ fontWeight: 800, color: colors.navy, margin: '0 0 16px', fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>Standings</h3>
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${colors.borderSoft}`, boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 48px 48px 48px 60px', padding: '12px 18px', background: colors.navy }}>
            {['#','Team','W','L','P','Pts'].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Team' ? 'left' : 'center' }}>{h}</div>)}
          </div>
          {standings.map((s, i) => (
            <div key={s.team.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 48px 48px 48px 60px', padding: '14px 18px', borderBottom: i < standings.length - 1 ? `1px solid ${colors.borderSoft}` : 'none', background: i === 0 ? 'rgba(16, 185, 129, 0.03)' : '#fff' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? colors.success : colors.inkMuted, textAlign: 'center', alignSelf: 'center' }}>{i === 0 ? '🏆' : i + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: colors.accentBg, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: colors.accent }}>{s.team.name?.charAt(0)}</div>
                <span style={{ fontSize: 13, fontWeight: 650, color: colors.navy }}>{s.team.name}</span>
              </div>
              {[s.w, s.l, s.played].map((v, vi) => <div key={vi} style={{ textAlign: 'center', fontSize: 13, fontWeight: vi === 0 ? 800 : 500, color: vi === 0 ? colors.success : vi === 1 ? colors.error : colors.inkMuted, alignSelf: 'center' }}>{v}</div>)}
              <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 900, color: colors.navy, alignSelf: 'center' }}>{s.pts}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All matches */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <h3 style={{ fontWeight: 800, color: colors.navy, margin: '0 0 16px', fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>All Matches</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {brackets.map(b => {
            const ta = b.team_a; const tb = b.team_b; const win = b.winner;
            const live = b.status === 'in_progress'; const done = b.status === 'completed';
            const scoreA = b.team_a_score?.total ?? b.team_a_score?.score ?? (typeof b.team_a_score === 'number' ? b.team_a_score : null);
            const scoreB = b.team_b_score?.total ?? b.team_b_score?.score ?? (typeof b.team_b_score === 'number' ? b.team_b_score : null);

            return (
              <div 
                key={b.id} 
                onClick={() => onMatchClick(b)} 
                style={{ 
                  background: '#fff', borderRadius: 16, padding: '14px 20px', 
                  border: `1.5px solid ${live ? colors.success : colors.borderSoft}`, 
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = live ? colors.success : colors.borderSoft; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: win?.id === ta?.id ? 750 : 600, color: win?.id === ta?.id ? colors.success : ta ? colors.navy : colors.inkMuted }}>{ta?.name || 'TBD'}</span>
                </div>
                
                {/* Score badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: colors.pageBg, border: `1px solid ${colors.borderSoft}`, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: win?.id === ta?.id ? colors.success : colors.navy, fontFamily: "'DM Sans', monospace" }}>{scoreA ?? '—'}</span>
                  <span style={{ fontSize: 10, color: colors.inkMuted, fontWeight: 800 }}>:</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: win?.id === tb?.id ? colors.success : colors.navy, fontFamily: "'DM Sans', monospace" }}>{scoreB ?? '—'}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: win?.id === tb?.id ? 750 : 600, color: win?.id === tb?.id ? colors.success : tb ? colors.navy : colors.inkMuted }}>{tb?.name || 'TBD'}</span>
                </div>
                
                <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 10px', borderRadius: 100, background: done ? 'rgba(16, 185, 129, 0.1)' : live ? 'rgba(59, 130, 246, 0.1)' : colors.pageBg, color: done ? colors.success : live ? colors.accent : colors.inkMuted, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {done ? 'Done' : live ? 'Live' : 'Soon'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Unified Bracket Canvas (Winners & Losers together with Zoom/Pan) ──────────
function BracketCanvas({ brackets, teams, onMatchClick, navigate, eventId, hoveredTeamId, setHoveredTeamId }) {
  const wrapperRef = useRef(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const pos = brackets.filter(b => b.round_number > 0);
  const neg = brackets.filter(b => b.round_number < 0);

  // Bind mouse-wheel zoom
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.05;
      setZoom(prev => Math.max(0.4, Math.min(2.0, e.deltaY < 0 ? prev + zoomFactor : prev - zoomFactor)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  if (pos.length === 0) return (
    <div style={{ textAlign: 'center', padding: 64, color: colors.inkMuted }}>
      <span className="material-symbols-rounded" style={{ fontSize: 56, display: 'block', marginBottom: 16, color: colors.border }}>bracket</span>
      <p style={{ margin: 0, fontWeight: 600 }}>No bracket matches found.</p>
    </div>
  );

  // Group winners by round
  const winnersByRound = {};
  pos.forEach(b => {
    if (!winnersByRound[b.round_number]) winnersByRound[b.round_number] = [];
    winnersByRound[b.round_number].push(b);
  });
  Object.keys(winnersByRound).forEach(r => winnersByRound[r].sort((a, b) => a.match_number - b.match_number));

  const winRoundNums = Object.keys(winnersByRound).map(Number).sort((a, b) => a - b);
  const maxWinRound  = Math.max(...winRoundNums);
  const winR1Count   = winnersByRound[1]?.length || 1;

  // Group losers by round
  const losersByRound = {};
  neg.forEach(b => {
    const r = Math.abs(b.round_number);
    if (!losersByRound[r]) losersByRound[r] = [];
    losersByRound[r].push(b);
  });
  Object.keys(losersByRound).forEach(r => losersByRound[r].sort((a, b) => a.match_number - b.match_number));

  const loseRoundNums = Object.keys(losersByRound).map(Number).sort((a, b) => a - b);
  const maxLoseRound  = Math.max(...loseRoundNums);
  const loseR1Count   = losersByRound[1]?.length || 1;

  // Spacing helper functions
  const cy = (r, m) => {
    const spacing = BASE_UNIT * Math.pow(2, r - 1);
    return spacing * (m - 0.5);
  };
  const rx = (r) => (r - 1) * (CARD_W + ROUND_GAP);

  // Layout limits
  const winnersH = winR1Count * BASE_UNIT + V_GAP;
  const losersOffsetH = winnersH + 120;
  const losersH  = loseR1Count > 0 ? (loseR1Count * BASE_UNIT + V_GAP) : 0;
  const totalH   = losersOffsetH + losersH + 40;

  const winChampX = maxWinRound * (CARD_W + ROUND_GAP);
  const winChampCY = cy(maxWinRound, 1);
  const totalW = Math.max(winChampX + CHAMP_W + 80, maxLoseRound * (CARD_W + ROUND_GAP) + 80);

  // SVG Paths
  const paths = [];

  // Winners paths
  winRoundNums.forEach(r => {
    if (r >= maxWinRound) return;
    (winnersByRound[r] || []).forEach(match => {
      const m  = match.match_number;
      const x1 = rx(r) + CARD_W;
      const y1 = cy(r, m) + LABEL_H;
      const nm = Math.ceil(m / 2);
      const x2 = rx(r + 1);
      const y2 = cy(r + 1, nm) + LABEL_H;
      const mx = x1 + ROUND_GAP / 2;
      
      const teamId = match.winner?.id || (match.status === 'completed' ? null : (m % 2 === 1 ? match.team_a?.id : match.team_b?.id));

      paths.push({
        key: `w_${r}_${m}`,
        // Cubic bezier path
        d: `M ${x1} ${y1} C ${mx} ${y1}, ${x2 - ROUND_GAP/2} ${y2}, ${x2} ${y2}`,
        teamId,
        completed: !!match.winner,
      });
    });
  });

  // Winner Final -> Champ box
  const finalPos = winnersByRound[maxWinRound]?.[0];
  if (finalPos) {
    const x1 = rx(maxWinRound) + CARD_W;
    const y1 = cy(maxWinRound, 1) + LABEL_H;
    paths.push({
      key: 'w_to_champ',
      d: `M ${x1} ${y1} H ${winChampX}`,
      teamId: finalPos.winner?.id,
      completed: !!finalPos.winner,
    });
  }

  // Losers paths
  loseRoundNums.forEach(r => {
    if (r >= maxLoseRound) return;
    (losersByRound[r] || []).forEach(match => {
      const m  = match.match_number;
      const x1 = rx(r) + CARD_W;
      const y1 = cy(r, m) + LABEL_H + losersOffsetH;
      const nm = Math.ceil(m / 2);
      const x2 = rx(r + 1);
      const y2 = cy(r + 1, nm) + LABEL_H + losersOffsetH;
      const mx = x1 + ROUND_GAP / 2;
      
      const teamId = match.winner?.id;

      paths.push({
        key: `l_${r}_${m}`,
        d: `M ${x1} ${y1} C ${mx} ${y1}, ${x2 - ROUND_GAP/2} ${y2}, ${x2} ${y2}`,
        teamId,
        completed: !!match.winner,
      });
    });
  });

  const championName = finalPos?.winner?.name;

  // Zoom & Pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-clickable]')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      ref={wrapperRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'relative', width: '100%', height: Math.max(500, totalH * 0.7),
        overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab',
        background: '#FAF8F4', borderRadius: 20, border: `1px solid ${colors.borderSoft}`,
        userSelect: 'none',
      }}
    >
      {/* Sleek controls bar */}
      <div 
        data-clickable="true"
        style={{
          position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 6,
          background: 'rgba(30, 45, 74, 0.95)', backdropFilter: 'blur(10px)',
          padding: '6px', borderRadius: 14, zIndex: 100, border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <button 
          onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} 
          style={{ width: 34, height: 34, borderRadius: 10, background: 'transparent', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >+</button>
        <button 
          onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} 
          style={{ width: 34, height: 34, borderRadius: 10, background: 'transparent', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >−</button>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', margin: '4px 2px' }} />
        <button 
          onClick={() => { setZoom(0.85); setPan({ x: 40, y: 30 }); }} 
          style={{ padding: '0 10px', height: 34, borderRadius: 10, background: 'transparent', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >RESET</button>
      </div>

      {/* Floating Canvas */}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'top left',
          width: totalW,
          height: totalH,
          transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
      >
        {/* SVG backdrop for curves */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: totalW, height: totalH, pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.25" />
            </filter>
          </defs>
          {paths.map(p => {
            const isHovered = hoveredTeamId && p.teamId === hoveredTeamId;
            return (
              <path
                key={p.key}
                d={p.d}
                stroke={isHovered ? colors.accent : p.completed ? colors.success : '#CBD5E1'}
                strokeWidth={isHovered ? 3.5 : p.completed ? 2.5 : 1.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isHovered ? 'url(#shadow)' : 'none'}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
            );
          })}
        </svg>

        {/* ── WINNERS BRACKET TREE ── */}
        <div>
          {winRoundNums.map(r => (
            <div key={`wl_${r}`} style={{
              position: 'absolute', left: rx(r), top: 0, width: CARD_W, height: LABEL_H,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {getRoundLabel(r, maxWinRound)}
            </div>
          ))}

          {/* Match cards */}
          {winRoundNums.flatMap(r =>
            (winnersByRound[r] || []).map(match => (
              <MatchCard
                key={match.id}
                match={match}
                x={rx(r)}
                y={cy(r, match.match_number) - CARD_H / 2}
                hoveredTeamId={hoveredTeamId}
                setHoveredTeamId={setHoveredTeamId}
                onClick={() => navigate(`/organizer/sports/score/${match.id}`)}
              />
            ))
          )}

          {/* Champion slot */}
          <div style={{
            position: 'absolute', left: winChampX, top: 0, width: CHAMP_W, height: LABEL_H,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>Champion</div>

          <div style={{
            position: 'absolute',
            left: winChampX,
            top: winChampCY - CHAMP_H / 2 + LABEL_H,
            width: CHAMP_W,
            height: CHAMP_H,
            background: championName
              ? 'linear-gradient(135deg, #FFFDF5 0%, #FEF3C7 100%)'
              : 'linear-gradient(135deg, #FFFDF9 0%, #FFFBEB 100%)',
            border: `2.5px solid ${championName ? '#F59E0B' : '#FDE68A'}`,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            boxShadow: championName ? '0 10px 30px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.6)' : 'none',
            animation: championName ? 'pulse 2s infinite' : 'none',
          }}>
            <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🏆</span>
            {championName ? (
              <span style={{ fontSize: 12, fontWeight: 900, color: '#92400E', textAlign: 'center', padding: '0 12px', lineHeight: 1.3 }}>{championName}</span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>TBD Champion</span>
            )}
          </div>
        </div>

        {/* ── LOSERS BRACKET TREE ── */}
        {neg.length > 0 && (
          <div style={{ position: 'relative', top: losersOffsetH }}>
            <div style={{ position: 'absolute', left: 0, top: -20, fontSize: 12, fontWeight: 850, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Losers Bracket</div>
            {loseRoundNums.map(r => (
              <div key={`ll_${r}`} style={{ position: 'absolute', left: rx(r), top: 0, width: CARD_W, height: LABEL_H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Losers Round {r}
              </div>
            ))}
            {loseRoundNums.flatMap(r =>
              (losersByRound[r] || []).map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  x={rx(r)} 
                  y={cy(r, match.match_number) - CARD_H / 2} 
                  hoveredTeamId={hoveredTeamId}
                  setHoveredTeamId={setHoveredTeamId}
                  onClick={() => navigate(`/organizer/sports/score/${match.id}`)} 
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function SportsBracketsPage() {
  const navigate   = useNavigate();
  const { selectedEvent } = useEventContext();
  const [brackets, setBrackets] = useState([]);
  const [teams,    setTeams]    = useState([]);
  const [sport,    setSport]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [hoveredTeamId, setHoveredTeamId] = useState(null);

  useEffect(() => {
    if (!selectedEvent?.id) { setLoading(false); return; }

    Promise.all([
      fetch(`${API_BASE}/events/${selectedEvent.id}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API_BASE}/sports/brackets?event_id=${selectedEvent.id}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API_BASE}/sports/teams?event_id=${selectedEvent.id}`, { cache: 'no-store' }).then(r => r.json()),
    ]).then(([evData, bData, tData]) => {
      if (evData.success && evData.data?.sport_config) setSport(evData.data.sport_config);
      if (bData.success) setBrackets(bData.data);
      if (tData.success) setTeams(tData.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedEvent?.id]);

  if (!selectedEvent) return (
    <div style={{ textAlign: 'center', padding: 80, color: colors.inkMuted }}>
      <span className="material-symbols-rounded" style={{ fontSize: 48, display: 'block', marginBottom: 12, color: colors.border }}>bracket</span>
      <p>Select a Sports event to view brackets.</p>
    </div>
  );

  if (selectedEvent.type !== 'Sports') return (
    <div style={{ textAlign: 'center', padding: 80, color: colors.inkMuted }}>
      <p>This is not a Sports event.</p>
    </div>
  );

  const bracketType = sport?.structure?.bracket_type;
  const hasLosers   = brackets.some(b => b.round_number < 0);
  const hasPos      = brackets.some(b => b.round_number > 0);
  const completed   = brackets.filter(b => b.status === 'completed').length;
  const total       = brackets.filter(b => b.round_number > 0).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: colors.navy, margin: '0 0 5px', letterSpacing: '-0.02em', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Brackets</h1>
        <p style={{ fontSize: 14, color: colors.inkMuted, margin: 0 }}>
          {selectedEvent.name}
          {sport?.display_name && ` · ${sport.display_name}`}
          {sport?.structure?.bracket_type && sport.structure.bracket_type !== 'null' && ` · ${sport.structure.bracket_type.replace(/_/g, ' ')}`}
        </p>
      </div>

      {/* Not configured */}
      {!sport && !loading && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 56, textAlign: 'center', border: `2px dashed ${colors.border}` }}>
          <span className="material-symbols-rounded" style={{ fontSize: 52, color: colors.border, display: 'block', marginBottom: 16 }}>auto_awesome</span>
          <h3 style={{ fontWeight: 700, color: colors.navy, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>Sport not configured yet</h3>
          <p style={{ color: colors.inkMuted, fontSize: 14, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>Configure the sport first to auto-generate brackets from your participant teams.</p>
          <button onClick={() => navigate('/organizer/sports/config')} style={{ padding: '12px 28px', background: colors.navy, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Configure Sport
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ width: CARD_W, height: CARD_H, background: colors.pageBg, borderRadius: 10, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      )}

      {/* No brackets */}
      {sport && !loading && !hasPos && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: `1px solid ${colors.borderSoft}` }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: colors.border, display: 'block', marginBottom: 14 }}>
            {bracketType === null || bracketType === 'null' ? 'info' : 'bracket'}
          </span>
          <h3 style={{ fontWeight: 700, color: colors.navy, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>
            {bracketType === null || bracketType === 'null' ? 'No bracket format for this sport' : 'No brackets generated yet'}
          </h3>
          <p style={{ color: colors.inkMuted, fontSize: 14, marginBottom: 20 }}>
            {bracketType === null || bracketType === 'null'
              ? 'This sport uses direct scoring only. Use the Scorer section to score matches directly.'
              : 'Re-save the sport configuration to auto-generate brackets from your teams.'}
          </p>
          <button onClick={() => navigate('/organizer/sports/config')} style={{ padding: '10px 22px', background: colors.navy, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            {bracketType === null || bracketType === 'null' ? 'View Config' : 'Regenerate Brackets'}
          </button>
        </div>
      )}

      {/* Progress metrics */}
      {sport && !loading && hasPos && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Matches', value: total, color: colors.navy },
            { label: 'Completed', value: completed, color: colors.success },
            { label: 'Live Active', value: brackets.filter(b => b.status === 'in_progress').length, color: colors.accent },
            { label: 'Remaining', value: brackets.filter(b => b.status === 'pending').length, color: colors.inkMuted },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '12px 18px', border: `1px solid ${colors.borderSoft}`, flex: 1, minWidth: 100, boxShadow: '0 2px 6px rgba(15,23,42,0.02)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: colors.inkMuted }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bracket / Canvas View */}
      {sport && !loading && hasPos && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: `1px solid ${colors.borderSoft}`, marginBottom: 20, boxShadow: '0 4px 16px rgba(15,23,42,0.02)' }}>
          {bracketType === 'round_robin' ? (
            <RoundRobinTable brackets={brackets} teams={teams} onMatchClick={b => navigate(`/organizer/sports/score/${b.id}`)} />
          ) : (
            <BracketCanvas 
              brackets={brackets} 
              teams={teams} 
              onMatchClick={b => navigate(`/organizer/sports/score/${b.id}`)} 
              navigate={navigate} 
              eventId={selectedEvent.id} 
              hoveredTeamId={hoveredTeamId}
              setHoveredTeamId={setHoveredTeamId}
            />
          )}
        </div>
      )}

      {/* Interactive touch tip */}
      {sport && !loading && hasPos && bracketType !== 'round_robin' && (
        <p style={{ fontSize: 12, color: colors.inkMuted, textAlign: 'center', margin: '12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 15, color: colors.accent }}>info</span>
          Drag canvas to pan · Use mouse wheel to zoom · Hover over players to trace their journey
        </p>
      )}
    </div>
  );
}
