import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { createClient } from '../../utils/supabase/client';
import { API_URL as API_BASE } from '../../config';

// ── Safe formula evaluator (no eval) ─────────────────────────────────────────
function safeEval(formula, vals) {
  const expr = formula.replace(/\b([a-z_][a-z0-9_]*)\b/gi, m => {
    const v = Number(vals[m]); return isNaN(v) ? '0' : String(v);
  });
  function tok(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      if (/\s/.test(s[i])) { i++; continue; }
      if (/[\d.]/.test(s[i])) { let n = ''; while (i < s.length && /[\d.]/.test(s[i])) n += s[i++]; t.push({ k: 'n', v: parseFloat(n) }); }
      else if (['+','-','*','/','(',')'].includes(s[i])) t.push({ k: 'o', v: s[i++] });
      else return null;
    }
    return t;
  }
  const tokens = tok(expr); if (!tokens) return 0;
  let p = 0;
  const expr_ = () => { let l = term(); while (p<tokens.length && (tokens[p].v==='+'||tokens[p].v==='-')) { const op=tokens[p++].v; const r=term(); l=op==='+'?l+r:l-r; } return l; };
  const term  = () => { let l = fact(); while (p<tokens.length && (tokens[p].v==='*'||tokens[p].v==='/')) { const op=tokens[p++].v; const r=fact(); l=op==='*'?l*r:(r!==0?l/r:0); } return l; };
  const fact  = () => { if (p<tokens.length && tokens[p].v==='(') { p++; const v=expr_(); if(p<tokens.length&&tokens[p].v===')') p++; return v; } if(p<tokens.length&&tokens[p].k==='n') return tokens[p++].v; return 0; };
  try { return expr_(); } catch { return 0; }
}

// ── computeTotals ─────────────────────────────────────────────────────────────
function computeTotals(matchEvents, config) {
  const ss = config?.scoring_sheet; if (!ss) return {};
  const state = {};

  for (const ev of matchEvents) {
    const { team_id, player_name, action, value } = ev;
    const ci = action ? action.indexOf(':') : -1;
    const op  = ci > -1 ? action.slice(0, ci) : (action || '');
    const fid = ci > -1 ? action.slice(ci + 1) : (action || '');
    const tk = team_id || '__global__';
    if (!state[tk]) state[tk] = { players: {}, team_level: {}, eliminated: [], period_scores: {} };

    if (op === 'eliminate_player') {
      if (player_name && !state[tk].eliminated.includes(player_name)) state[tk].eliminated.push(player_name);
      continue;
    }
    if (op === 'period_end' || op === 'swap') continue;

    const target = player_name
      ? (state[tk].players[player_name] = state[tk].players[player_name] || {})
      : state[tk].team_level;

    if (op === 'increment') target[fid] = (target[fid] ?? 0) + (value ?? 1);
    else if (op === 'decrement') target[fid] = Math.max(0, (target[fid] ?? 0) - (value ?? 1));
    else if (op === 'set') target[fid] = value;
    else if (op === 'log' || op === 'log_targeted') target[`${fid}_count`] = (target[`${fid}_count`] ?? 0) + 1;
  }

  // Resolve computed fields
  for (const tk of Object.keys(state)) {
    for (const pn of Object.keys(state[tk].players)) {
      const ps = state[tk].players[pn];
      for (const g of ss.groups || [])
        for (const f of g.fields || [])
          if (f.type === 'computed' && f.formula) ps[f.id] = safeEval(f.formula, ps);
    }
  }
  return state;
}

// ── Helper to calculate Running Score sequentially for FIBA ──────────────────
function getFibaRunningScore(matchEvents, teamA, teamB) {
  const scoreSheet = []; // Array of { point: number, teamA: string|null, teamB: string|null, isLastScore: boolean }
  let scoreA = 0;
  let scoreB = 0;

  for (const ev of matchEvents) {
    if (!ev.team_id) continue;
    const isTeamA = ev.team_id === teamA?.id;
    const isTeamB = ev.team_id === teamB?.id;
    if (!isTeamA && !isTeamB) continue;

    // Detect if this is a score-incrementing action
    const action = ev.action || '';
    let addedPoints = 0;
    if (action.includes('increment:score')) {
      addedPoints = ev.value || 1;
    } else if (action.includes('increment:pts') || action.includes('increment:ft')) {
      addedPoints = 1;
    } else if (action.includes('increment:fg2')) {
      addedPoints = 2;
    } else if (action.includes('increment:fg3')) {
      addedPoints = 3;
    }

    if (addedPoints <= 0) continue;

    const jersey = ev.player_name ? ev.player_name.match(/\d+/) || ev.player_name.charAt(0) : '—';

    for (let p = 1; p <= addedPoints; p++) {
      if (isTeamA) {
        scoreA++;
        scoreSheet.push({ point: scoreA, team: 'A', jersey, finalScoreOfAction: p === addedPoints });
      } else {
        scoreB++;
        scoreSheet.push({ point: scoreB, team: 'B', jersey, finalScoreOfAction: p === addedPoints });
      }
    }
  }
  return scoreSheet;
}

// ── StatCell ──────────────────────────────────────────────────────────────────
function StatCell({ field, value, playerName, teamId, onTap, disabled }) {
  const [pressed, setPressed] = useState(false);
  const lpRef = useRef(null);
  const v = value ?? (field.type === 'countdown' ? (field.start ?? 0) : 0);

  const startLP = () => { lpRef.current = setTimeout(() => { onTap({ op: 'decrement', fid: field.id, playerName, teamId }); }, 550); };
  const endLP   = () => clearTimeout(lpRef.current);

  if (field.type === 'static') return (
    <td style={{ padding: '8px 12px', textAlign: field.id === 'name' ? 'left' : 'center', fontSize: '13px', fontWeight: field.id === 'name' ? '700' : '400', color: colors.navy, borderRight: `1px solid ${colors.borderSoft}` }}>
      {value ?? '—'}
    </td>
  );

  if (field.type === 'computed') return (
    <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: colors.accent, background: colors.accentBg, borderRight: `1px solid ${colors.accentGlow}` }}>
      {Math.round(v * 10) / 10}
    </td>
  );

  const isWarn   = field.warn_at    && v >= field.warn_at && (!field.foul_out_at || v < field.foul_out_at);
  const isFoulOut= field.foul_out_at && v >= field.foul_out_at;

  const bg = isFoulOut ? '#FEE2E2' : isWarn ? '#FEF3C7' : pressed ? colors.accentBg : 'transparent';
  const fc = isFoulOut ? colors.error : isWarn ? '#92400e' : colors.navy;

  return (
    <td
      onMouseDown={() => { if (!disabled && !isFoulOut) { setPressed(true); startLP(); } }}
      onMouseUp={() => { endLP(); setPressed(false); if (!disabled && !isFoulOut) onTap({ op: 'increment', fid: field.id, playerName, teamId }); }}
      onMouseLeave={() => { endLP(); setPressed(false); }}
      onTouchStart={() => { if (!disabled && !isFoulOut) { setPressed(true); startLP(); } }}
      onTouchEnd={() => { endLP(); setPressed(false); if (!disabled && !isFoulOut) onTap({ op: 'increment', fid: field.id, playerName, teamId }); }}
      style={{
        padding: '8px 12px', textAlign: 'center', cursor: (disabled || isFoulOut) ? 'default' : 'pointer',
        background: bg, color: fc, fontSize: '14px', fontWeight: '700',
        borderRight: `1px solid ${colors.borderSoft}`,
        transition: 'background 0.12s', userSelect: 'none',
      }}
    >
      {isFoulOut ? '🚫' : field.type === 'countdown' ? (v === (field.start ?? 0) ? '●'.repeat(v) : `${v}`) : v}
    </td>
  );
}

// ── Generic Stats Grid ────────────────────────────────────────────────────────
function PlayerStatsSheet({ config, teamA, teamB, teamAPlayers, teamBPlayers, totals, onTap, matchEnded }) {
  const ss = config.scoring_sheet;
  const groups = ss.groups || [];
  const allFields = groups.flatMap(g => g.fields || []);
  const tlf = ss.team_level_fields || [];

  const sumField = (teamId, fid) =>
    Object.values(totals[teamId]?.players || {}).reduce((s, p) => s + (p[fid] ?? 0), 0);

  const renderTeam = (team, players, teamId) => {
    if (!team) return null;
    const tl = totals[teamId]?.team_level || {};
    const eliminated = totals[teamId]?.eliminated || [];

    return (
      <div style={{ marginBottom: '28px', background: '#fff', borderRadius: 16, border: `1px solid ${colors.borderSoft}`, overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
        {/* Team header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', background: `linear-gradient(90deg, ${colors.navy} 0%, ${colors.navySoft} 100%)` }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: '850', color: '#fff', flexShrink: 0 }}>
            {team.name?.charAt(0)}
          </div>
          <span style={{ fontWeight: '800', color: '#fff', fontSize: '15px', flex: 1 }}>{team.name}</span>
          
          {/* Team level indicators */}
          {tlf.filter(f => tl[f.id] !== undefined || f.type === 'countdown').map(f => {
            const v = tl[f.id] ?? (f.type === 'countdown' ? f.start ?? 0 : 0);
            const isWarn = f.bonus_at && v >= f.bonus_at;
            return (
              <div 
                key={f.id}
                onClick={() => !matchEnded && onTap({ op: f.type === 'countdown' ? 'decrement' : 'increment', fid: f.id, playerName: null, teamId })}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: isWarn ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.12)', borderRadius: '8px', cursor: matchEnded ? 'default' : 'pointer', border: isWarn ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent', transition: 'all 0.2s' }}
              >
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{f.label}</span>
                <span style={{ fontSize: 13, fontWeight: '900', color: isWarn ? '#fca5a5' : '#fff' }}>
                  {f.type === 'countdown'
                    ? Array.from({ length: f.start ?? 0 }, (_, i) => <span key={i} style={{ opacity: i < v ? 1 : 0.2, marginRight: 2 }}>●</span>)
                    : v}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: Math.max(500, allFields.length * 60) }}>
            <thead>
              <tr style={{ background: colors.pageBg, borderBottom: `1px solid ${colors.borderSoft}` }}>
                {allFields.map(f => (
                  <th key={f.id} style={{ padding: '9px 12px', fontSize: '10px', fontWeight: '800', color: f.type === 'computed' ? colors.accent : colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: f.type === 'static' && f.id === 'name' ? 'left' : 'center', borderRight: `1px solid ${colors.borderSoft}`, whiteSpace: 'nowrap', background: f.type === 'computed' ? colors.accentBg : 'transparent' }}>
                    {f.label}{f.point_value ? <span style={{ opacity: 0.6 }}> ×{f.point_value}</span> : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => {
                const ps = totals[teamId]?.players?.[player.name] || {};
                const isElim = eliminated.includes(player.name);
                return (
                  <tr key={player.id} style={{ background: idx % 2 === 0 ? '#fff' : '#FAFBFC', opacity: isElim ? 0.35 : 1, borderBottom: `1px solid ${colors.borderSoft}` }}>
                    {allFields.map(f => {
                      let val;
                      if (f.type === 'static') val = f.id === 'name' ? player.name : f.id === 'jersey' ? (player.jersey ?? idx + 1) : ps[f.id];
                      else val = ps[f.id];
                      return <StatCell key={f.id} field={f} value={val} playerName={player.name} teamId={teamId} onTap={onTap} disabled={matchEnded || isElim} />;
                    })}
                  </tr>
                );
              })}
              {players.length === 0 && (
                <tr><td colSpan={allFields.length} style={{ padding: '24px', textAlign: 'center', color: colors.inkMuted, fontStyle: 'italic', fontSize: '13px' }}>No players on roster</td></tr>
              )}
            </tbody>
            {players.length > 0 && (
              <tfoot>
                <tr style={{ background: colors.pageBg, borderTop: `2px solid ${colors.border}` }}>
                  {allFields.map((f, i) => {
                    if (f.type === 'static') return <td key={f.id} style={{ padding: '9px 12px', fontSize: '11px', fontWeight: '800', color: colors.inkMuted, borderRight: `1px solid ${colors.borderSoft}` }}>{i === 0 ? '' : 'TOTAL'}</td>;
                    const total = sumField(teamId, f.id);
                    return <td key={f.id} style={{ padding: '9px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '900', color: f.type === 'computed' ? colors.accent : colors.navy, borderRight: `1px solid ${colors.borderSoft}`, background: f.type === 'computed' ? colors.accentBg : 'transparent' }}>{total}</td>;
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderTeam(teamA, teamAPlayers, teamA?.id)}
      {renderTeam(teamB, teamBPlayers, teamB?.id)}
    </div>
  );
}

// ── 🏀 Specialized FIBA Basketball Scoresheet ──────────────────────────────
function FibaBasketballScoresheet({ config, teamA, teamB, teamAPlayers, teamBPlayers, totals, matchEvents, onTap, matchEnded }) {
  const runningScore = getFibaRunningScore(matchEvents, teamA, teamB);
  
  // Reconstruct rosters
  const renderRoster = (team, players, teamId) => {
    if (!team) return null;
    const tl = totals[teamId]?.team_level || {};
    const tf = tl.team_fouls ?? 0;
    const to = tl.timeouts ?? 5;

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: colors.navy, color: '#fff', borderRadius: '12px 12px 0 0' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>{team.name}</span>
          
          {/* Team Fouls */}
          <div 
            onClick={() => !matchEnded && onTap({ op: 'increment', fid: 'team_fouls', playerName: null, teamId })}
            style={{ 
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', 
              background: tf >= 4 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.1)', 
              borderRadius: 8, cursor: 'pointer', border: tf >= 4 ? '1px solid #EF4444' : 'none' 
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>FOULS</span>
            <span style={{ fontWeight: 900, fontSize: 14, color: tf >= 4 ? '#fca5a5' : '#fff' }}>{tf}</span>
          </div>

          {/* Timeouts */}
          <div 
            onClick={() => !matchEnded && onTap({ op: 'decrement', fid: 'timeouts', playerName: null, teamId })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>T.O.</span>
            <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: 2 }}>{'●'.repeat(to)}</span>
          </div>
        </div>

        {/* Players Grid */}
        <div style={{ background: '#fff', border: `1px solid ${colors.borderSoft}`, borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: colors.pageBg, borderBottom: `1px solid ${colors.borderSoft}` }}>
                <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 800, color: colors.inkMuted, width: 30 }}>#</th>
                <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 800, color: colors.inkMuted, textAlign: 'left' }}>PLAYER</th>
                <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 800, color: colors.inkMuted, width: 90 }}>FOULS</th>
                <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 800, color: colors.inkMuted, width: 120 }}>SCORING</th>
                <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 800, color: colors.accent, width: 44 }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => {
                const ps = totals[teamId]?.players?.[player.name] || {};
                const pf = ps.pf ?? 0;
                const jersey = player.jersey ?? idx + 1;
                const isFouledOut = pf >= 5;

                return (
                  <tr key={player.id} style={{ borderBottom: `1px solid ${colors.borderSoft}`, opacity: isFouledOut ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 850, color: colors.navy }}>{jersey}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: colors.navy }}>{player.name}</td>
                    
                    {/* FIBA Foul Circular Checklist */}
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(fNum => {
                          const active = pf >= fNum;
                          return (
                            <div
                              key={fNum}
                              onClick={() => !matchEnded && !isFouledOut && onTap({ op: 'increment', fid: 'pf', playerName: player.name, teamId })}
                              style={{
                                width: 14, height: 14, borderRadius: '50%', 
                                border: `1.5px solid ${active ? (fNum === 5 ? colors.error : colors.warning) : colors.border}`,
                                background: active ? (fNum === 5 ? colors.error : colors.warning) : 'transparent',
                                cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 8, fontWeight: 800, color: active ? '#fff' : 'transparent',
                              }}
                            >
                              {fNum}
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Quick Scoring Actions */}
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['ft', 'fg2', 'fg3'].map(col => {
                          const label = col === 'ft' ? '+1' : col === 'fg2' ? '+2' : '+3';
                          return (
                            <button
                              key={col}
                              disabled={matchEnded || isFouledOut}
                              onClick={() => onTap({ op: 'increment', fid: col, playerName: player.name, teamId })}
                              style={{
                                flex: 1, padding: '4px 6px', fontSize: 10, fontWeight: 800,
                                background: colors.pageBg, border: `1px solid ${colors.border}`, borderRadius: 6,
                                color: colors.navy, cursor: 'pointer', transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = colors.accent}
                              onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* PTS computed */}
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 900, color: colors.accent, background: colors.accentBg }}>
                      {ps.pts ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {/* Team A Roster */}
      {teamA && renderRoster(teamA, teamAPlayers, teamA.id)}

      {/* 📜 FIBA Paper-Style Running Score Ledger */}
      <div style={{ width: 180, background: '#fff', borderRadius: 16, border: `1px solid ${colors.borderSoft}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 420, boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
        <div style={{ padding: '10px 14px', background: colors.navy, color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>
          Running Score
        </div>
        
        {/* Ledger Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', textAlign: 'center', borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: colors.inkMuted }}>TEAM A</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: colors.inkMuted }}>PTS</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: colors.inkMuted }}>TEAM B</span>
          </div>
          
          {Array.from({ length: Math.max(100, runningScore.length + 10) }, (_, i) => {
            const pt = i + 1;
            const itemA = runningScore.find(x => x.point === pt && x.team === 'A');
            const itemB = runningScore.find(x => x.point === pt && x.team === 'B');

            return (
              <div 
                key={pt} 
                style={{ 
                  display: 'grid', gridTemplateColumns: '1fr 40px 1fr', 
                  alignItems: 'center', height: 26, 
                  borderBottom: `1px solid ${colors.borderSoft}`,
                  background: (itemA || itemB) ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                }}
              >
                {/* Team A Jersey */}
                <div style={{ 
                  fontSize: 12, fontWeight: 900, color: colors.success, 
                  textDecoration: itemA?.finalScoreOfAction ? 'underlineCircle' : 'none',
                }}>
                  {itemA?.jersey ?? ''}
                </div>

                {/* Point Number */}
                <div style={{ 
                  fontSize: 10, fontWeight: 800, color: colors.navy, 
                  background: (itemA || itemB) ? colors.borderSoft : 'transparent', 
                  height: '100%', display: 'grid', placeItems: 'center',
                  textDecoration: (itemA || itemB) ? 'line-through' : 'none',
                }}>
                  {pt}
                </div>

                {/* Team B Jersey */}
                <div style={{ 
                  fontSize: 12, fontWeight: 900, color: colors.coral,
                  textDecoration: itemB?.finalScoreOfAction ? 'underlineCircle' : 'none',
                }}>
                  {itemB?.jersey ?? ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team B Roster */}
      {teamB && renderRoster(teamB, teamBPlayers, teamB.id)}
    </div>
  );
}

// ── 🏐 Specialized FIVB Volleyball Scoresheet ──────────────────────────────
function FivbVolleyballScoresheet({ config, teamA, teamB, totals, onTap, matchEnded }) {
  const setScore = (teamId, setNum) => {
    // Reconstruct score for sets from totals or fallback
    return totals[teamId]?.team_level?.[`set_${setNum}`] ?? 0;
  };

  const currentSet = totals.__global__?.team_level?.current_set ?? 1;

  const renderTeamControls = (team, teamId) => {
    if (!team) return null;
    const tl = totals[teamId]?.team_level || {};
    const pts = tl.points ?? 0;
    const to = tl.timeouts ?? 2;

    return (
      <div style={{ flex: 1, minWidth: 280, background: '#fff', borderRadius: 16, border: `1px solid ${colors.borderSoft}`, padding: 20, boxShadow: '0 4px 12px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: colors.navy, marginBottom: 4 }}>{team.name}</div>
        <div style={{ fontSize: 11, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Set Points Scorer</div>
        
        {/* Set Points display */}
        <div style={{ fontSize: 72, fontWeight: 900, color: colors.navy, lineHeight: 1, fontFamily: "'DM Sans', sans-serif", margin: '12px 0 20px' }}>{pts}</div>

        {!matchEnded && (
          <div style={{ display: 'flex', gap: 14, width: '100%', justifyContent: 'center', marginBottom: 20 }}>
            <button 
              onClick={() => onTap({ op: 'decrement', fid: 'points', playerName: null, teamId })} 
              style={{ width: 48, height: 48, borderRadius: '50%', background: colors.pageBg, border: `1px solid ${colors.border}`, fontSize: 24, cursor: 'pointer', color: colors.inkMuted, display: 'grid', placeItems: 'center', fontWeight: '800' }}
            >−</button>
            <button 
              onClick={() => onTap({ op: 'increment', fid: 'points', playerName: null, teamId })} 
              style={{ width: 60, height: 60, borderRadius: '50%', background: colors.navy, border: 'none', fontSize: 28, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', boxShadow: '0 6px 16px rgba(15,23,42,0.2)' }}
            >+</button>
          </div>
        )}

        {/* FIVB Circular Timeouts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: colors.pageBg, borderRadius: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors.inkMuted }}>TIMEOUTS:</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2].map(tNum => {
              const active = to < tNum; // decreased means timeout taken
              return (
                <div 
                  key={tNum}
                  onClick={() => !matchEnded && onTap({ op: 'decrement', fid: 'timeouts', playerName: null, teamId })}
                  style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `1.5px solid ${active ? colors.error : colors.border}`,
                    background: active ? colors.error : 'transparent',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Sets display */}
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${colors.borderSoft}`, padding: '16px 20px', boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: colors.inkMuted }}>Set scores progression</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map(sNum => {
            const active = sNum === currentSet;
            const scoreA = setScore(teamA?.id, sNum);
            const scoreB = setScore(teamB?.id, sNum);
            return (
              <div 
                key={sNum} 
                onClick={() => !matchEnded && onTap({ op: 'set', fid: 'current_set', value: sNum, teamId: '__global__' })}
                style={{ 
                  flex: 1, minWidth: 70, border: `1.5px solid ${active ? colors.accent : colors.borderSoft}`, 
                  background: active ? colors.accentBg : '#fff', padding: '8px 10px', 
                  borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' 
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 800, color: active ? colors.accent : colors.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>Set {sNum}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: colors.navy }}>{scoreA} : {scoreB}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scorer blocks */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {teamA && renderTeamControls(teamA, teamA.id)}
        
        {/* FIVB Rotation / Position Sheet Mockup */}
        <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 16, border: `1px solid ${colors.borderSoft}`, padding: 20, boxShadow: '0 4px 12px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>FIVB Court Rotation Position</span>
          
          <div style={{ width: '100%', maxWidth: 220, border: '2.5px solid #F59E0B', background: '#3B82F610', borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 8, gap: 8, height: 160, position: 'relative' }}>
            {/* Center Net */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 1.5px)', width: 3, background: '#F59E0B', zIndex: 1 }} />
            
            {/* Team A Side Positions (I, VI, V) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: colors.navy }}>IV (Front)</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: colors.navy }}>III (Center)</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: colors.navy }}>II (Back)</div>
            </div>
            {/* Team B Side Positions (II, III, IV) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 0', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: colors.navy }}>II (Front)</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: colors.navy }}>III (Center)</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: colors.navy }}>IV (Back)</div>
            </div>
          </div>
          
          <button 
            disabled={matchEnded}
            onClick={() => onTap({ op: 'log', fid: 'rotation_swap', playerName: null, teamId: null })}
            style={{ 
              marginTop: 16, padding: '8px 18px', background: colors.navy, color: '#fff', border: 'none', 
              borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>rotate_right</span>Rotate Rotation
          </button>
        </div>

        {teamB && renderTeamControls(teamB, teamB.id)}
      </div>
    </div>
  );
}

// ── 🏸 Specialized BWF Badminton Scoresheet ──────────────────────────────
function BwfBadmintonScoresheet({ teamA, teamB, totals, onTap, matchEnded }) {
  const scoreA = totals[teamA?.id]?.team_level?.score ?? 0;
  const scoreB = totals[teamB?.id]?.team_level?.score ?? 0;

  // Rule-based service court location (even score = right, odd = left)
  const isServerA = totals.__global__?.team_level?.server === 'A';
  const serverCourtA = (scoreA % 2 === 0) ? 'Right' : 'Left';
  const serverCourtB = (scoreB % 2 === 0) ? 'Right' : 'Left';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Visual BWF Umpire Green Court */}
      <div style={{ background: '#0F766E', borderRadius: 20, padding: '24px 32px', border: '3px solid #115E59', boxShadow: '0 8px 24px rgba(15,118,110,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>BWF Court visualizer</div>
        
        {/* The Court */}
        <div style={{ width: '100%', maxWidth: 460, height: 180, border: '3px solid #fff', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0D9488' }}>
          {/* Net Line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 1.5px)', width: 3, background: '#FFE600', zIndex: 10 }} />
          
          {/* Center Lines dividing left/right service courts */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5, background: '#fff' }} />
          
          {/* TEAM A Side (Left) */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateRows: '1fr 1fr', padding: 8 }}>
            <div style={{ borderRight: '1.5px solid #fff', display: 'grid', placeItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>Left Court</span>
              {isServerA && serverCourtA === 'Left' && <div style={{ background: '#FFE600', color: '#0F766E', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, marginTop: 4 }}>🏸 SERVING</div>}
            </div>
            <div style={{ borderRight: '1.5px solid #fff', display: 'grid', placeItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>Right Court</span>
              {isServerA && serverCourtA === 'Right' && <div style={{ background: '#FFE600', color: '#0F766E', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, marginTop: 4 }}>🏸 SERVING</div>}
            </div>
          </div>

          {/* TEAM B Side (Right) */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateRows: '1fr 1fr', padding: 8 }}>
            <div style={{ borderLeft: '1.5px solid #fff', display: 'grid', placeItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>Left Court</span>
              {!isServerA && serverCourtB === 'Left' && <div style={{ background: '#FFE600', color: '#0F766E', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, marginTop: 4 }}>🏸 SERVING</div>}
            </div>
            <div style={{ borderLeft: '1.5px solid #fff', display: 'grid', placeItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>Right Court</span>
              {!isServerA && serverCourtB === 'Right' && <div style={{ background: '#FFE600', color: '#0F766E', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, marginTop: 4 }}>🏸 SERVING</div>}
            </div>
          </div>
        </div>

        {/* Change Server */}
        {!matchEnded && (
          <button 
            onClick={() => onTap({ op: 'set', fid: 'server', value: isServerA ? 'B' : 'A', teamId: '__global__' })}
            style={{ marginTop: 16, padding: '7px 16px', background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            Switch Serve Side
          </button>
        )}
      </div>

      {/* Main Digital Panels */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        {[teamA, teamB].filter(Boolean).map((team, idx) => {
          const isA = idx === 0;
          const score = isA ? scoreA : scoreB;
          const activeServer = isA ? isServerA : !isServerA;

          return (
            <div key={team.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, minWidth: 180, background: '#fff', borderRadius: 16, border: `1.5px solid ${activeServer ? colors.accent : colors.borderSoft}`, padding: 24, boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: colors.navy }}>{team.name}</div>
              {activeServer && <span style={{ fontSize: 10, fontWeight: 900, color: colors.accent, background: colors.accentBg, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Serving</span>}
              <div style={{ fontSize: 88, fontWeight: 900, color: colors.navy, lineHeight: 1, fontFamily: "'DM Sans', monospace" }}>{score}</div>
              
              {!matchEnded && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={() => onTap({ op: 'decrement', fid: 'score', playerName: null, teamId: team.id })} style={{ width: 44, height: 44, borderRadius: '50%', background: colors.pageBg, border: `1px solid ${colors.border}`, fontSize: 22, cursor: 'pointer', color: colors.inkMuted, display: 'grid', placeItems: 'center', fontWeight: '800' }}>−</button>
                  <button onClick={() => {
                    onTap({ op: 'increment', fid: 'score', playerName: null, teamId: team.id });
                    // BWF rules: gain serve upon winning point against server
                    if (!activeServer) onTap({ op: 'set', fid: 'server', value: isA ? 'A' : 'B', teamId: '__global__' });
                  }} style={{ width: 54, height: 54, borderRadius: '50%', background: colors.navy, border: 'none', fontSize: 26, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', boxShadow: '0 4px 14px rgba(15,23,42,0.2)' }}>+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PeriodScores ──────────────────────────────────────────────────────────────
function PeriodScores({ config, matchEvents, teamA, teamB, currentPeriod }) {
  const pt = config.scoring_sheet?.period_tracking;
  if (!pt?.enabled || !pt.total_periods) return null;

  const scoreAtPeriod = (teamId, upToPeriod) => {
    const events = matchEvents.filter(e => (e.period || 1) <= upToPeriod && e.team_id === teamId);
    const t = computeTotals(events, config);
    const ps = t[teamId]?.players || {};
    return Object.values(ps).reduce((s, p) => s + (p.pts ?? p.score ?? 0), 0)
      + (t[teamId]?.team_level?.score ?? 0)
      + (t[teamId]?.team_level?.points ?? 0);
  };

  const periods = Array.from({ length: pt.total_periods }, (_, i) => i + 1);

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${colors.borderSoft}`, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 300 }}>
          <thead>
            <tr style={{ background: colors.navy }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team</th>
              {periods.map(p => (
                <th key={p} style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: p === currentPeriod ? '#fff' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', background: p === currentPeriod ? 'rgba(59,130,246,0.3)' : 'transparent' }}>
                  {pt.period_label?.charAt(0) || 'P'}{p}
                </th>
              ))}
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {[teamA, teamB].filter(Boolean).map((team, ti) => (
              <tr key={team.id} style={{ background: ti === 0 ? '#fff' : colors.pageBg, borderBottom: `1px solid ${colors.borderSoft}` }}>
                <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '750', color: colors.navy, whiteSpace: 'nowrap' }}>{team.name}</td>
                {periods.map(p => {
                  const s = p <= currentPeriod ? scoreAtPeriod(team.id, p) : null;
                  return (
                    <td key={p} style={{ padding: '10px 16px', textAlign: 'center', fontSize: '14px', fontWeight: p === currentPeriod ? '900' : '500', color: p === currentPeriod ? colors.navy : colors.inkMuted, background: p === currentPeriod ? colors.accentBg : 'transparent' }}>
                      {s !== null ? s : <span style={{ color: colors.borderSoft }}>—</span>}
                    </td>
                  );
                })}
                <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: '15px', fontWeight: '900', color: colors.navy }}>
                  {scoreAtPeriod(team.id, currentPeriod)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main SportsScoringPage Component ──────────────────────────────────────────
export default function SportsScoringPage({ bracketIdProp }) {
  const params = useParams();
  const navigate = useNavigate();
  const supabase = createClient();
  const bracketId = bracketIdProp || params.bracketId;

  const [bracket,      setBracket]      = useState(null);
  const [event,        setEvent]        = useState(null);
  const [sportConfig,  setSportConfig]  = useState(null);
  const [teamA,        setTeamA]        = useState(null);
  const [teamB,        setTeamB]        = useState(null);
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [matchEvents,  setMatchEvents]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentPeriod,setCurrentPeriod]= useState(1);
  const [toast,        setToast]        = useState(null);
  const [foulConfirm,  setFoulConfirm]  = useState(null);
  const [tagModal,     setTagModal]     = useState(false);
  const [tagAction,    setTagAction]    = useState(null);
  const [winnerModal,  setWinnerModal]  = useState(false);
  const toastRef = useRef(null);

  const showToast = (msg, type = 'info') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };

  // Load everything
  useEffect(() => {
    if (!bracketId) return;
    (async () => {
      try {
        const { data: br } = await supabase
          .from('brackets')
          .select('*, team_a:team_a_id(id,name,color,seed), team_b:team_b_id(id,name,color,seed), winner:winner_id(id,name)')
          .eq('id', bracketId).maybeSingle();

        if (!br) { setLoading(false); return; }
        setBracket(br); setTeamA(br.team_a); setTeamB(br.team_b);

        const evRes = await fetch(`${API_BASE}/events/${br.event_id}`, { cache: 'no-store' });
        const evData = await evRes.json();
        if (evData.success && evData.data) { setEvent(evData.data); setSportConfig(evData.data.sport_config || null); }

        const pRes  = await fetch(`${API_BASE}/participants?event_id=${br.event_id}`, { cache: 'no-store' });
        const pData = await pRes.json();
        if (pData.success) {
          setTeamAPlayers(pData.data.filter(p => br.team_a && p.team === br.team_a.name));
          setTeamBPlayers(pData.data.filter(p => br.team_b && p.team === br.team_b.name));
        }

        const mRes  = await fetch(`${API_BASE}/sports/match-events?bracket_id=${bracketId}`, { cache: 'no-store' });
        const mData = await mRes.json();
        if (mData.success) setMatchEvents(mData.data);

        if (br.status === 'pending') {
          await fetch(`${API_BASE}/sports/brackets/${bracketId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'in_progress' }),
          });
          setBracket(b => ({ ...b, status: 'in_progress' }));
        }

        const lastPeriodEnd = [...(mData.data || [])].reverse().find(e => e.action?.startsWith('period_end'));
        if (lastPeriodEnd && lastPeriodEnd.period) setCurrentPeriod(lastPeriodEnd.period + 1);

      } catch (err) { console.error('[SportsScoringPage]', err); }
      finally { setLoading(false); }
    })();
  }, [bracketId]);

  // Realtime subscription
  useEffect(() => {
    if (!bracketId) return;
    const ch = supabase.channel(`me_${bracketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `bracket_id=eq.${bracketId}` }, p => {
        setMatchEvents(prev => prev.some(e => e.id === p.new.id) ? prev : [...prev, p.new]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_events', filter: `bracket_id=eq.${bracketId}` }, p => {
        setMatchEvents(prev => prev.filter(e => e.id !== p.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [bracketId]);

  // Synchronize scores with bracket table
  const syncBracketScores = async (scoreA, scoreB) => {
    try {
      await fetch(`${API_BASE}/sports/brackets/${bracketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_score: { total: scoreA },
          team_b_score: { total: scoreB }
        }),
      });
    } catch (err) {
      console.error('Bracket score syncing failed:', err);
    }
  };

  // Trigger bracket score syncing upon matchEvents changes
  useEffect(() => {
    if (!sportConfig || !bracket || loading) return;
    const totals = computeTotals(matchEvents, sportConfig);
    const ss = sportConfig.scoring_sheet || {};
    const unit = ss.unit;

    const sumPts = (teamId) => Object.values(totals[teamId]?.players || {}).reduce((s, p) => s + (p.pts ?? p.score ?? 0), 0);
    const teamAScore = unit === 'team_only' ? (totals[teamA?.id]?.team_level?.score ?? 0) : (unit === 'player' && sportConfig.sport === 'volleyball' ? (totals[teamA?.id]?.team_level?.points ?? 0) : sumPts(teamA?.id));
    const teamBScore = unit === 'team_only' ? (totals[teamB?.id]?.team_level?.score ?? 0) : (unit === 'player' && sportConfig.sport === 'volleyball' ? (totals[teamB?.id]?.team_level?.points ?? 0) : sumPts(teamB?.id));

    syncBracketScores(teamAScore, teamBScore);
  }, [matchEvents, sportConfig, bracket, loading]);

  const handleTap = useCallback(async ({ op, fid, playerName, teamId, value }) => {
    if (!sportConfig || bracket?.status === 'completed') return;

    if (op === 'increment') {
      const field = (sportConfig.scoring_sheet?.groups || []).flatMap(g => g.fields || []).find(f => f.id === fid);
      if (field?.foul_out_at) {
        const totals = computeTotals(matchEvents, sportConfig);
        const tk = teamId || '__global__';
        const cur = playerName
          ? (totals[tk]?.players?.[playerName]?.[fid] ?? 0)
          : (totals[tk]?.team_level?.[fid] ?? 0);
        if (cur + 1 >= field.foul_out_at) {
          setFoulConfirm({ op, fid, playerName, teamId, value, cur: cur + 1, max: field.foul_out_at, label: field.label });
          return;
        }
      }
    }
    await commitEvent({ op, fid, playerName, teamId, value: value ?? 1 });
  }, [matchEvents, sportConfig, bracket, bracketId]);

  const commitEvent = async ({ op, fid, playerName, teamId, value }) => {
    const action = (fid && fid !== op) ? `${op}:${fid}` : op;
    const payload = {
      bracket_id: bracketId, event_id: event?.id,
      team_id: teamId || null, player_name: playerName || null,
      action, value: typeof value === 'number' ? value : 1,
      period: currentPeriod, timestamp_ms: Date.now(),
    };

    const tempId = `t_${Date.now()}_${Math.random()}`;
    setMatchEvents(p => [...p, { ...payload, id: tempId }]);

    try {
      const res  = await fetch(`${API_BASE}/sports/match-events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMatchEvents(p => p.map(e => e.id === tempId ? data.data : e));
    } catch {
      setMatchEvents(p => p.filter(e => e.id !== tempId));
      showToast('Failed to save. Check connection.', 'error');
    }
  };

  const handleUndo = async () => {
    const last = [...matchEvents].reverse().find(e => !String(e.id).startsWith('t_'));
    if (!last) return;
    setMatchEvents(p => p.filter(e => e.id !== last.id));
    try { 
      await fetch(`${API_BASE}/sports/match-events/${last.id}`, { method: 'DELETE' }); 
      showToast('Undone.', 'info'); 
    } catch { 
      setMatchEvents(p => [...p, last]); 
      showToast('Undo failed.', 'error'); 
    }
  };

  const handleEndPeriod = async () => {
    const pt = sportConfig?.scoring_sheet?.period_tracking;
    if (pt?.total_periods && currentPeriod >= pt.total_periods) { setWinnerModal(true); return; }
    await commitEvent({ op: 'period_end', fid: 'period_end', playerName: null, teamId: null, value: currentPeriod });
    setCurrentPeriod(p => p + 1);
    showToast(`${pt?.period_label || 'Period'} ${currentPeriod} ended.`, 'info');
  };

  const handleDeclareWinner = async (winnerId) => {
    try {
      const res  = await fetch(`${API_BASE}/sports/brackets/${bracketId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: winnerId, status: 'completed' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setBracket(b => ({ ...b, winner_id: winnerId, status: 'completed' }));
      setWinnerModal(false);
      showToast('Match complete! Winner declared.', 'success');
    } catch (err) { showToast(err.message || 'Failed.', 'error'); }
  };

  if (loading) return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ height: '100px', background: colors.pageBg, borderRadius: '16px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '400px', background: colors.pageBg, borderRadius: '18px', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  if (!bracket || !sportConfig) return (
    <div style={{ textAlign: 'center', padding: '80px', color: colors.inkMuted, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <span className="material-symbols-rounded" style={{ fontSize: '48px', display: 'block', marginBottom: '12px', color: colors.border }}>sports_score</span>
      <h3 style={{ color: colors.navy, fontFamily: "'DM Sans', sans-serif", margin: '0 0 8px' }}>Match not ready</h3>
      <p style={{ fontSize: '14px', margin: '0 0 20px' }}>Either the bracket doesn't exist or the sport hasn't been configured yet.</p>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 22px', background: colors.navy, color: '#fff', border: 'none', borderRadius: '11px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Go Back</button>
    </div>
  );

  const totals = computeTotals(matchEvents, sportConfig);
  const ss     = sportConfig.scoring_sheet || {};
  const pt     = ss.period_tracking || {};
  const acts   = ss.actions || [];
  const unit   = ss.unit;
  const matchEnded = bracket.status === 'completed';
  const sportKey = sportConfig.sport || '';

  // Header display score
  const sumPts = (teamId) => Object.values(totals[teamId]?.players || {}).reduce((s, p) => s + (p.pts ?? p.score ?? 0), 0);
  const teamAScore = unit === 'team_only' ? (totals[teamA?.id]?.team_level?.score ?? 0) : (unit === 'player' && sportKey === 'volleyball' ? (totals[teamA?.id]?.team_level?.points ?? 0) : sumPts(teamA?.id));
  const teamBScore = unit === 'team_only' ? (totals[teamB?.id]?.team_level?.score ?? 0) : (unit === 'player' && sportKey === 'volleyball' ? (totals[teamB?.id]?.team_level?.points ?? 0) : sumPts(teamB?.id));

  // Determine which scoresheet layout to render
  const isBasketball = sportKey === 'basketball' || sportConfig.display_name?.toLowerCase().includes('basketball');
  const isVolleyball = sportKey === 'volleyball' || sportConfig.display_name?.toLowerCase().includes('volleyball');
  const isBadminton  = sportKey === 'badminton' || sportConfig.display_name?.toLowerCase().includes('badminton');

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pillIn{from{opacity:0;transform:translateY(-18px)scale(0.92)}to{opacity:1;transform:translateY(0)scale(1)}}
      `}</style>

      {/* ── Match Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)`, borderRadius: '20px', padding: '24px 28px', marginBottom: '20px', boxShadow: '0 8px 32px rgba(30,45,74,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '2px', fontWeight: 800 }}>{event?.name} · {sportConfig.display_name}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Round {bracket.round_number} · Match {bracket.match_number}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {pt.enabled && (
              <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.13)', borderRadius: '100px', fontSize: '12px', fontWeight: '850', color: '#fff' }}>
                {pt.period_label || 'Period'} {currentPeriod}{pt.total_periods ? ` / ${pt.total_periods}` : ''}
              </div>
            )}
            <div style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '850', textTransform: 'uppercase', background: matchEnded ? colors.successBg : (bracket.status === 'in_progress' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.12)'), color: matchEnded ? colors.success : (bracket.status === 'in_progress' ? '#4ade80' : 'rgba(255,255,255,0.7)') }}>
              {matchEnded ? '✓ Final' : bracket.status === 'in_progress' ? '● LIVE' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Scoreboard Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '750', color: 'rgba(255,255,255,0.75)', marginBottom: '4px' }}>{teamA?.name || 'TBD'}</div>
            <div style={{ fontSize: '56px', fontWeight: '950', color: '#fff', lineHeight: 1, fontFamily: "'DM Sans', monospace" }}>{teamAScore}</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '300', color: 'rgba(255,255,255,0.15)' }}>|</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '750', color: 'rgba(255,255,255,0.75)', marginBottom: '4px' }}>{teamB?.name || 'TBD'}</div>
            <div style={{ fontSize: '56px', fontWeight: '950', color: '#fff', lineHeight: 1, fontFamily: "'DM Sans', monospace" }}>{teamBScore}</div>
          </div>
        </div>

        {/* Winner banner */}
        {matchEnded && bracket.winner && (
          <div style={{ marginTop: '16px', padding: '10px 16px', background: 'rgba(16,185,129,0.15)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-rounded" style={{ color: '#4ade80', fontSize: '20px' }}>emoji_events</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#4ade80' }}>Winner: {bracket.winner.name}</span>
          </div>
        )}
      </div>

      {/* ── Period scores grid (Basketball/Generic only) ── */}
      {pt.enabled && teamA && teamB && !isVolleyball && !isBadminton && (
        <PeriodScores config={sportConfig} matchEvents={matchEvents} teamA={teamA} teamB={teamB} currentPeriod={currentPeriod} />
      )}

      {/* ── Advanced Official scoresheet Layout Router ── */}
      <div style={{ marginBottom: 20 }}>
        {isBasketball ? (
          <FibaBasketballScoresheet config={sportConfig} teamA={teamA} teamB={teamB} teamAPlayers={teamAPlayers} teamBPlayers={teamBPlayers} totals={totals} matchEvents={matchEvents} onTap={handleTap} matchEnded={matchEnded} />
        ) : isVolleyball ? (
          <FivbVolleyballScoresheet config={sportConfig} teamA={teamA} teamB={teamB} totals={totals} onTap={handleTap} matchEnded={matchEnded} />
        ) : isBadminton ? (
          <BwfBadmintonScoresheet teamA={teamA} teamB={teamB} totals={totals} onTap={handleTap} matchEnded={matchEnded} />
        ) : (
          /* Generic Fallbacks */
          unit === 'player' ? (
            <PlayerStatsSheet config={sportConfig} teamA={teamA} teamB={teamB} teamAPlayers={teamAPlayers} teamBPlayers={teamBPlayers} totals={totals} onTap={handleTap} matchEnded={matchEnded} />
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${colors.borderSoft}`, padding: 24, boxShadow: '0 4px 12px rgba(15,23,42,0.02)', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 44, color: colors.border, display: 'block', marginBottom: 12 }}>scoreboard</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: colors.navy, marginBottom: 8 }}>Match score tracker</div>
              <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'center', padding: '24px 0' }}>
                {[teamA, teamB].filter(Boolean).map(team => (
                  <div key={team.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors.navy }}>{team.name}</span>
                    <span style={{ fontSize: 64, fontWeight: 900, color: colors.navy, fontFamily: "'DM Sans', monospace" }}>{totals[team.id]?.team_level?.score ?? 0}</span>
                    {!matchEnded && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleTap({ op: 'decrement', fid: 'score', playerName: null, teamId: team.id })} style={{ width: 36, height: 36, borderRadius: '50%', background: colors.pageBg, border: `1px solid ${colors.border}`, fontSize: 18, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>−</button>
                        <button onClick={() => handleTap({ op: 'increment', fid: 'score', playerName: null, teamId: team.id })} style={{ width: 36, height: 36, borderRadius: '50%', background: colors.navy, border: 'none', fontSize: 18, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>+</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Floating Scorer Control Bar ── */}
      {!matchEnded && (
        <div style={{ position: 'sticky', bottom: '20px', marginTop: '20px', zIndex: 100 }}>
          <div style={{ background: 'rgba(30,45,74,0.94)', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 12px 40px rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {acts.map(a => {
              if (a.type === 'undo' || a.type === 'sub') return null;
              if (a.type === 'period_end') return (
                <button key={a.id} onClick={handleEndPeriod} style={{ padding: '8px 16px', borderRadius: '10px', background: colors.accent, border: 'none', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>{a.label}</button>
              );
              if (a.type === 'log') return (
                <button key={a.id} onClick={() => commitEvent({ op: 'log', fid: a.id, playerName: null, teamId: null, value: 1 })} style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>{a.label}</button>
              );
              if (a.type === 'log_targeted') return (
                <button key={a.id} onClick={() => { setTagAction(a); setTagModal(true); }} style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {a.label} <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>expand_more</span>
                </button>
              );
              return null;
            })}

            <button onClick={handleUndo} style={{ padding: '8px 14px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>undo</span>Undo
            </button>

            <button onClick={() => setWinnerModal(true)} style={{ marginLeft: 'auto', padding: '9px 18px', borderRadius: '10px', background: colors.success, border: 'none', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>emoji_events</span>Declare End Match
            </button>
          </div>
        </div>
      )}

      {/* ── Foul Confirm Dialog ── */}
      {foulConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '340px', width: '90%', animation: 'slideDown 0.18s' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: colors.errorBg, display: 'grid', placeItems: 'center', marginBottom: '14px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '22px', color: colors.error }}>warning</span>
            </div>
            <h3 style={{ fontWeight: '850', color: colors.navy, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>Confirm Personal Foul</h3>
            <p style={{ color: colors.inkMuted, fontSize: '13px', marginBottom: '20px', lineHeight: 1.4 }}>
              Register foul #{foulConfirm.cur} for <strong>{foulConfirm.playerName}</strong>? {foulConfirm.cur >= 5 ? <span style={{ color: colors.error, fontWeight: 800 }}>This is a FOUL OUT.</span> : ''}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setFoulConfirm(null)} style={{ flex: 1, padding: '11px', borderRadius: '11px', background: colors.pageBg, border: `1px solid ${colors.border}`, fontWeight: '700', cursor: 'pointer', color: colors.inkSoft, fontSize: '13px' }}>Cancel</button>
              <button onClick={() => { const c = foulConfirm; setFoulConfirm(null); commitEvent(c); }} style={{ flex: 1, padding: '11px', borderRadius: '11px', background: colors.error, border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Confirm Foul</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tag Target Player Modal ── */}
      {tagModal && tagAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '380px', width: '90%', animation: 'slideDown 0.18s' }}>
            <h3 style={{ fontWeight: '850', color: colors.navy, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>{tagAction.label}</h3>
            <p style={{ color: colors.inkMuted, fontSize: '13px', marginBottom: '16px' }}>Select targeted player from roster:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
              {[...teamAPlayers.map(p => ({ ...p, teamId: teamA?.id })), ...teamBPlayers.map(p => ({ ...p, teamId: teamB?.id }))].map(p => (
                <button key={p.id} onClick={() => {
                  setTagModal(false);
                  commitEvent({ op: 'log_targeted', fid: tagAction.id, playerName: p.name, teamId: p.teamId, value: 1 });
                  if (tagAction.effect === 'eliminate_player') {
                    commitEvent({ op: 'eliminate_player', fid: 'eliminate_player', playerName: p.name, teamId: p.teamId, value: 1 });
                  }
                }} style={{ padding: '10px 14px', borderRadius: '10px', background: colors.pageBg, border: `1px solid ${colors.border}`, textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: colors.navy, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: colors.accentBg, display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: '800', color: colors.accent }}>{p.name?.charAt(0)}</div>
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: '11px', color: colors.inkMuted }}>{p.team}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setTagModal(false)} style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '10px', background: colors.pageBg, border: `1px solid ${colors.border}`, fontWeight: '750', cursor: 'pointer', color: colors.inkSoft, fontSize: '13px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Winner Modal ── */}
      {winnerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '90%', animation: 'slideDown 0.18s' }}>
            <h3 style={{ fontWeight: '850', color: colors.navy, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>Declare Final Winner</h3>
            <p style={{ color: colors.inkMuted, fontSize: '14px', marginBottom: '18px', lineHeight: 1.4 }}>This will end the match and lock scoring records. Final score: {teamAScore} – {teamBScore}. Who won?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {[{ team: teamA, score: teamAScore }, { team: teamB, score: teamBScore }].filter(x => x.team).map(({ team, score }) => (
                <button key={team.id} onClick={() => handleDeclareWinner(team.id)} style={{ padding: '15px 18px', borderRadius: '14px', background: colors.navy, border: 'none', color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.navySoft}
                  onMouseLeave={e => e.currentTarget.style.background = colors.navy}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '20px', color: '#FFD700' }}>emoji_events</span>
                  <span style={{ flex: 1 }}>{team.name}</span>
                  <span style={{ fontSize: '20px', fontWeight: '950', fontFamily: "'DM Sans', monospace" }}>{score}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setWinnerModal(false)} style={{ width: '100%', padding: '11px', borderRadius: '12px', background: colors.pageBg, border: `1px solid ${colors.border}`, fontWeight: '700', cursor: 'pointer', color: colors.inkSoft, fontSize: '13px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Toast Overlay ── */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, animation: 'pillIn 0.28s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 20px', background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)', borderRadius: '100px', color: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px', color: toast.type === 'success' ? '#4ade80' : toast.type === 'error' ? '#f87171' : '#60a5fa' }}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
