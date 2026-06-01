import React, { useState, useEffect, useCallback } from 'react';
import { useJudgeContext } from './JudgeLayout';
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
    .map(([round, list]) => ({
      round: Number(round),
      label: list[0]?.round_label || `Round ${round}`,
      matches: list.sort((a, b) => a.match_order - b.match_order),
    }));
}

export default function SportsScoringPage() {
  const { event, showToast } = useJudgeContext();
  const [matches, setMatches] = useState([]);
  const [sportsSetup, setSportsSetup] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // periodScores: { [matchId]: { [periodNum]: { a: number, b: number, locked: boolean } } }
  const [periodScores, setPeriodScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(null);

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => { setHasData(false); }, [event?.id]);

  const isMobile = windowWidth <= 768;
  const judgeId = event?.eventJudgeId || localStorage.getItem('judge_event_id') || null;
  const isLocked = event?.status?.toLowerCase() !== 'active' && event?.status?.toLowerCase() !== 'ongoing';

  const fetchData = useCallback(async () => {
    if (!event) return;
    try {
      const [setupRes, bracketsRes] = await Promise.all([
        fetch(`${API_URL}/sports/setup?event_id=${event.id}`),
        fetch(`${API_URL}/sports/brackets?event_id=${event.id}`),
      ]);
      const setupJson = await setupRes.json();
      const bracketsJson = await bracketsRes.json();

      const setup = setupJson.success ? setupJson.data : null;
      const allMatches = bracketsJson.success ? (bracketsJson.data || []) : [];

      setSportsSetup(setup);
      setMatches(allMatches);

      const playable = allMatches.filter(m => m.team_a && m.team_b && m.team_a !== 'BYE' && m.team_b !== 'BYE');
      setActiveMatchId(prev => prev ?? (playable[0]?.id ?? null));

      // Load saved period scores
      if (judgeId) {
        const scoresRes = await fetch(`${API_URL}/sports/match-scores?event_id=${event.id}&judge_id=${judgeId}`);
        const scoresJson = await scoresRes.json();
        if (scoresJson.success && scoresJson.data) {
          const grouped = {};
          scoresJson.data.forEach(s => {
            if (!grouped[s.match_id]) grouped[s.match_id] = {};
            grouped[s.match_id][s.round_num] = {
              a: s.team_a_score ?? 0,
              b: s.team_b_score ?? 0,
              locked: !!s.submitted,
            };
          });
          setPeriodScores(prev => {
            const merged = { ...grouped };
            // Keep unsaved local changes if not locked
            Object.entries(prev).forEach(([mid, periods]) => {
              if (!merged[mid]) merged[mid] = {};
              Object.entries(periods).forEach(([pNum, pd]) => {
                if (!pd.locked && !merged[mid][pNum]?.locked) {
                  merged[mid][pNum] = pd;
                }
              });
            });
            return merged;
          });
        }
      }
    } catch (err) {
      console.error('[SportsScoringPage] fetch error:', err);
    } finally {
      setHasData(true);
    }
  }, [event, judgeId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    if (event?.id) {
      const supabase = createClient();
      const channel = supabase
        .channel('sports-scoring-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'match_brackets', filter: `event_id=eq.${event.id}` }, fetchData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'game_match_scores', filter: `event_id=eq.${event.id}` }, fetchData)
        .subscribe();
      return () => { clearInterval(interval); supabase.removeChannel(channel); };
    }
    return () => clearInterval(interval);
  }, [fetchData, event?.id]);

  const cfg = sportsSetup?.config || {};
  const periodsPerMatch = cfg.periodsPerMatch || 4;
  const periodLabel = cfg.periodLabel || 'Quarter';
  const winCondition = cfg.winCondition || 'most_points';
  const teamColors = {};
  (cfg.teams || []).forEach(t => { teamColors[t.name] = t.color; });
  const getColor = name => teamColors[name] || colors.accent;

  const roundedData = groupByRound(matches);

  const getPeriod = (matchId, pNum) =>
    periodScores[matchId]?.[pNum] || { a: 0, b: 0, locked: false };

  const adjustScore = (matchId, pNum, side, delta) => {
    const current = getPeriod(matchId, pNum);
    if (current.locked) return;
    const newVal = Math.max(0, (current[side] || 0) + delta);
    setPeriodScores(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        [pNum]: { ...current, [side]: newVal },
      }
    }));
  };

  const setScore = (matchId, pNum, side, val) => {
    const current = getPeriod(matchId, pNum);
    if (current.locked) return;
    setPeriodScores(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        [pNum]: { ...current, [side]: Math.max(0, Number(val) || 0) },
      }
    }));
  };

  const savePeriod = async (matchId, pNum, lock = false) => {
    if (!judgeId) { showToast('No judge ID. Please refresh.', 'error'); return; }
    const pd = getPeriod(matchId, pNum);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/sports/match-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          match_id: matchId,
          judge_id: judgeId,
          period_num: pNum,
          team_a_score: pd.a,
          team_b_score: pd.b,
          submitted: lock,
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      if (!lock) {
        // Unlocking: keep the scores but mark period as unlocked, reset match winner
        setPeriodScores(prev => ({
          ...prev,
          [matchId]: {
            ...(prev[matchId] || {}),
            [pNum]: { ...pd, locked: false },
          },
        }));
        // Also clear local winner on the match if it was completed
        setMatches(prev => prev.map(m =>
          m.id === matchId ? { ...m, winner: null, status: 'ongoing', score_a: {}, score_b: {} } : m
        ));
        showToast(`${periodLabel} ${pNum} unlocked and score cleared.`, 'info');
      } else {
        setPeriodScores(prev => ({
          ...prev,
          [matchId]: { ...(prev[matchId] || {}), [pNum]: { ...pd, locked: true } },
        }));
        showToast(`${periodLabel} ${pNum} locked!`, 'success');
      }
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const finalizeMatch = async (matchId) => {
    if (!judgeId) { showToast('No judge ID.', 'error'); return; }
    setSaving(true);
    try {
      // Lock any remaining unlocked periods first with current scores
      const periods = periodScores[matchId] || {};
      for (let p = 1; p <= periodsPerMatch; p++) {
        const pd = periods[p] || { a: 0, b: 0, locked: false };
        if (!pd.locked) {
          await fetch(`${API_URL}/sports/match-scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: event.id, match_id: matchId, judge_id: judgeId,
              period_num: p, team_a_score: pd.a, team_b_score: pd.b, submitted: true
            })
          });
        }
      }
      // Then finalize
      const res = await fetch(`${API_URL}/sports/match-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id, match_id: matchId, judge_id: judgeId,
          period_num: periodsPerMatch,
          team_a_score: getPeriod(matchId, periodsPerMatch).a,
          team_b_score: getPeriod(matchId, periodsPerMatch).b,
          submitted: true, finalize: true
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast('Match finalized! Winner advanced.', 'success');
      setConfirmFinalize(null);
      setActiveMatchId(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to finalize.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${colors.borderSoft}`, borderTopColor: colors.accent, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: colors.inkMuted, fontWeight: 600 }}>Loading match data...</span>
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
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '22px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>No Sport Setup Yet</h2>
        <p style={{ color: colors.inkMid, fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
          The organizer hasn't completed the Sport Setup yet. Check back once it's published.
        </p>
      </div>
    );
  }

  const activeMatch = matches.find(m => m.id === activeMatchId) ?? null;

  // ── Scoring console helpers ─────────────────────────────────────────────────
  const ScoreButton = ({ onClick, label, disabled, variant = 'neutral' }) => {
    const bgMap = { add: '#DCFCE7', sub: '#FEF2F2', neutral: '#F1F5F9' };
    const colorMap = { add: '#16A34A', sub: '#DC2626', neutral: colors.navy };
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: disabled ? '#F8FAFC' : bgMap[variant], color: disabled ? '#CBD5E1' : colorMap[variant], fontWeight: 800, fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', minWidth: '42px', textAlign: 'center' }}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulseLock { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4) } 70% { box-shadow: 0 0 0 14px rgba(239,68,68,0) } }
      `}</style>

      <div style={{ position: 'relative', minHeight: '60vh' }}>
        <div style={{ filter: isLocked ? 'blur(8px)' : 'none', pointerEvents: isLocked ? 'none' : 'auto', userSelect: isLocked ? 'none' : 'auto', transition: 'all .4s ease' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: '12px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>sports</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: colors.accent, letterSpacing: '0.04em' }}>Sport Score Sheet</span>
            </div>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobile ? '26px' : '32px', fontWeight: 800, color: colors.navy, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              {cfg.sportType || cfg.sportName || 'Sports'} Scoring
            </h1>
            <p style={{ color: colors.inkMid, fontSize: '14px', maxWidth: '520px', lineHeight: 1.55, margin: 0 }}>
              Select a match, record scores per {periodLabel.toLowerCase()}, then finalize to advance the winner.
            </p>
          </div>

          {matches.length === 0 ? (
            <div style={{ background: '#fff', border: `1.5px dashed ${colors.borderSoft}`, borderRadius: '24px', padding: '80px 32px', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>sports</span>
              <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No brackets generated yet. The organizer needs to complete the Sport Setup first.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: '32px', alignItems: 'start' }}>

              {/* Left: Match list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {roundedData.map(({ round, label, matches: rMatches }) => (
                  <div key={round} style={{ background: '#F8FAFC', borderRadius: '20px', padding: '20px', border: `1px solid ${colors.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: colors.navy, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{round}</span>
                      </div>
                      <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '15px', fontWeight: 800, color: colors.navy, margin: 0 }}>{label}</h3>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(15,23,42,0.06)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {rMatches.map(m => {
                        const isPlayable = m.team_a && m.team_b && m.team_a !== 'BYE' && m.team_b !== 'BYE';
                        const isActive = m.id === activeMatchId;
                        const isCompleted = m.status === 'completed';
                        const mPeriods = periodScores[m.id] || {};
                        const lockedCount = Object.values(mPeriods).filter(p => p.locked).length;

                        return (
                          <div key={m.id}
                            onClick={() => isPlayable && !isCompleted && setActiveMatchId(m.id)}
                            style={{
                              background: '#fff',
                              border: `2px solid ${isActive ? colors.accent : isCompleted ? 'rgba(16,185,129,.15)' : 'transparent'}`,
                              borderRadius: '16px',
                              cursor: isPlayable && !isCompleted ? 'pointer' : 'default',
                              transition: 'all 0.22s',
                              transform: isPlayable && isActive ? 'translateY(-2px)' : 'none',
                              boxShadow: isActive ? '0 12px 24px -10px rgba(59,130,246,0.3)' : '0 2px 8px rgba(0,0,0,0.03)',
                            }}>
                            {/* Card header */}
                            <div style={{ padding: '10px 16px', background: isActive ? 'rgba(59,130,246,0.05)' : isCompleted ? 'rgba(16,185,129,.03)' : '#fff', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '14px', borderTopRightRadius: '14px' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: isActive ? colors.accent : colors.inkMuted }}>
                                Match {m.match_order}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isCompleted ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 800, color: colors.success, background: 'rgba(16,185,129,.08)', padding: '2px 8px', borderRadius: '100px' }}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>verified</span> Finished
                                  </span>
                                ) : isPlayable && lockedCount > 0 ? (
                                  <span style={{ fontSize: '10px', fontWeight: 800, color: colors.accent, background: colors.accentBg, padding: '2px 8px', borderRadius: '100px' }}>
                                    {lockedCount}/{periodsPerMatch} {periodLabel}s Locked
                                  </span>
                                ) : isPlayable ? (
                                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '100px' }}>Ready to Score</span>
                                ) : (
                                  <span style={{ fontSize: '10px', fontWeight: 800, color: colors.inkMuted, background: '#F8FAFC', padding: '2px 8px', borderRadius: '100px' }}>Waiting for Teams</span>
                                )}
                                <span className="material-symbols-rounded" style={{ fontSize: '16px', color: isActive ? colors.accent : colors.inkMuted }}>chevron_right</span>
                              </div>
                            </div>

                            {/* Teams */}
                            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {[{ team: m.team_a, side: 'a' }, { team: m.team_b, side: 'b' }].map(({ team, side }) => {
                                const isTBD = !team || team === 'BYE';
                                const isWinner = m.winner === team;
                                const isLoser = m.winner && m.winner !== team && !isTBD;
                                return (
                                  <div key={side} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '10px', background: isWinner ? `${getColor(team)}08` : 'transparent', opacity: isLoser ? 0.45 : 1 }}>
                                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isTBD ? '#E2E8F0' : getColor(team), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                      {isWinner ? <span className="material-symbols-rounded" style={{ fontSize: '12px', color: '#fff' }}>emoji_events</span>
                                        : isTBD ? <span className="material-symbols-rounded" style={{ fontSize: '12px', color: colors.inkMuted }}>more_horiz</span>
                                          : <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{team?.[0]}</span>}
                                    </div>
                                    <span style={{ fontSize: '13.5px', fontWeight: isWinner ? 800 : 600, color: isTBD ? colors.inkMuted : isWinner ? getColor(team) : colors.navy, flex: 1 }}>
                                      {isTBD ? 'Waiting for Team' : team}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Scoring console */}
              <div style={{ position: 'sticky', top: '24px' }}>
                {!activeMatch ? (
                  <div style={{ background: '#fff', border: `1.5px dashed ${colors.borderSoft}`, borderRadius: '24px', padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(59,130,246,0.06)', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '32px', color: colors.accent }}>ads_click</span>
                    </div>
                    <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '18px', fontWeight: 800, color: colors.navy, margin: '0 0 6px' }}>Select a Match</h3>
                    <p style={{ color: colors.inkSoft, fontSize: '13.5px', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                      Click any active match on the left to open the scoring console.
                    </p>
                  </div>
                ) : (
                  <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.06)', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

                    {/* Console header */}
                    <div style={{ padding: '16px 20px', background: colors.navy, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', marginBottom: '2px' }}>Active Console</div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '16px', fontWeight: 800, color: '#fff' }}>Match {activeMatch.match_order}</div>
                      </div>
                      <button onClick={() => setActiveMatchId(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
                      </button>
                    </div>

                    {/* Versus display */}
                    <div style={{ padding: '20px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '12px', background: '#F8FAFC' }}>
                      {[{ team: activeMatch.team_a, side: 'a' }, { team: activeMatch.team_b, side: 'b' }].map(({ team, side }, idx) => {
                        const allPeriods = periodScores[activeMatch.id] || {};
                        let displayScore = 0;
                        if (winCondition === 'most_points') {
                          displayScore = Object.values(allPeriods).reduce((s, p) => s + (Number(p[side]) || 0), 0);
                        } else {
                          const otherSide = side === 'a' ? 'b' : 'a';
                          displayScore = Object.values(allPeriods).filter(p => (Number(p[side]) || 0) > (Number(p[otherSide]) || 0)).length;
                        }
                        return (
                          <div key={side} style={{ textAlign: 'center', flex: 1, overflow: 'hidden' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: getColor(team), display: 'grid', placeItems: 'center', margin: '0 auto 8px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                              <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{team?.[0]}</span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: colors.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team}</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: colors.navy, fontFamily: "'DM Sans',sans-serif" }}>{displayScore}</div>
                            <div style={{ fontSize: '10px', color: colors.inkMuted, fontWeight: 600 }}>{winCondition === 'most_points' ? 'total pts' : `${periodLabel.toLowerCase()}s won`}</div>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <div style={{ padding: '6px 12px', borderRadius: '100px', background: '#E2E8F0', color: colors.navy, fontSize: '11px', fontWeight: 900 }}>VS</div>
                        <div style={{ fontSize: '10px', color: colors.inkMuted, fontWeight: 700 }}>{periodsPerMatch} {periodLabel}s</div>
                      </div>
                    </div>

                    {/* Period scoring rows */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                      {Array.from({ length: periodsPerMatch }, (_, i) => {
                        const pNum = i + 1;
                        const pd = getPeriod(activeMatch.id, pNum);
                        const colorA = getColor(activeMatch.team_a);
                        const colorB = getColor(activeMatch.team_b);

                        return (
                          <div key={pNum} style={{
                            background: pd.locked ? 'rgba(16,185,129,0.03)' : '#fff',
                            border: `1.5px solid ${pd.locked ? 'rgba(16,185,129,0.18)' : colors.border}`,
                            borderRadius: '16px', padding: '14px', transition: 'all 0.2s',
                          }}>
                            {/* Period header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: colors.navy }}>{periodLabel} {pNum}</span>
                              {pd.locked ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: colors.success }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>verified</span> Locked
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', color: colors.inkMuted, fontWeight: 600 }}>In Progress</span>
                              )}
                            </div>

                            {/* Score inputs — two-column layout */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                              {/* Team A */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: colorA, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{activeMatch.team_a}</span>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy, fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}>{pd.a}</div>
                                {!pd.locked && (
                                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'a', -1)} label="−1" variant="sub" disabled={pd.a <= 0 || isLocked} />
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'a', 1)} label="+1" variant="add" disabled={isLocked} />
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'a', 2)} label="+2" variant="add" disabled={isLocked} />
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'a', 3)} label="+3" variant="add" disabled={isLocked} />
                                  </div>
                                )}
                              </div>

                              {/* Divider */}
                              <div style={{ fontSize: '13px', fontWeight: 800, color: colors.inkMuted, textAlign: 'center' }}>—</div>

                              {/* Team B */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: colorB, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{activeMatch.team_b}</span>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: colors.navy, fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}>{pd.b}</div>
                                {!pd.locked && (
                                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'b', -1)} label="−1" variant="sub" disabled={pd.b <= 0 || isLocked} />
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'b', 1)} label="+1" variant="add" disabled={isLocked} />
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'b', 2)} label="+2" variant="add" disabled={isLocked} />
                                    <ScoreButton onClick={() => adjustScore(activeMatch.id, pNum, 'b', 3)} label="+3" variant="add" disabled={isLocked} />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Lock / Unlock */}
                            {!pd.locked ? (
                              <button
                                onClick={() => savePeriod(activeMatch.id, pNum, true)}
                                disabled={saving || isLocked}
                                style={{ width: '100%', height: '36px', borderRadius: '10px', background: colors.navy, color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: saving || isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: saving || isLocked ? 0.5 : 1, transition: 'all 0.2s' }}
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>lock</span>
                                Lock {periodLabel} {pNum}
                              </button>
                            ) : (
                              <button
                                onClick={() => savePeriod(activeMatch.id, pNum, false)}
                                disabled={saving || isLocked}
                                style={{ width: '100%', height: '34px', borderRadius: '8px', background: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)', fontSize: '11px', fontWeight: 700, cursor: saving || isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: saving || isLocked ? 0.5 : 1 }}
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>undo</span>
                                Undo Lock — Unlock {periodLabel} {pNum}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Finalize Match */}
                    <div style={{ padding: '16px', borderTop: `1px solid ${colors.borderSoft}` }}>
                      {activeMatch.status === 'completed' ? (
                        <div style={{ padding: '14px', borderRadius: '14px', background: '#DCFCE7', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '22px', color: '#16A34A', display: 'block', marginBottom: '4px' }}>emoji_events</span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>Winner</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#166534' }}>{activeMatch.winner}</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmFinalize(activeMatch.id)}
                          disabled={saving || isLocked}
                          style={{ width: '100%', height: '46px', borderRadius: '14px', background: saving || isLocked ? colors.inkMuted : colors.success, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: saving || isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>check_circle</span>
                          Finalize Match & Advance Winner
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '40px 20px', animation: 'fadeIn .4s ease-out', background: 'rgba(255,255,255,.3)', backdropFilter: 'blur(3px)', borderRadius: '24px' }}>
            <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'rgba(239,68,68,.08)', color: '#EF4444', display: 'grid', placeItems: 'center', marginBottom: '20px', animation: 'pulseLock 2s infinite', border: '2px solid rgba(239,68,68,.15)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>lock</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: colors.navy, marginBottom: '12px', fontFamily: "'DM Sans',sans-serif" }}>Scoring Room Locked</h2>
              <p style={{ fontSize: '14px', color: colors.inkMid, lineHeight: 1.7, marginBottom: '24px' }}>
                Scoring is not yet open for <strong>{event?.name}</strong>. Status: <span style={{ padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', background: 'rgba(239,68,68,.08)', color: '#EF4444' }}>{event?.status || 'upcoming'}</span>
              </p>
              <button onClick={() => window.history.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '100px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${colors.border}`, background: '#fff', color: colors.inkSoft }}>
                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>arrow_back</span>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Finalize Confirm Modal */}
      {confirmFinalize && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,.5)', backdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px', animation: 'fadeIn .3s ease-out' }} onClick={() => setConfirmFinalize(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '400px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#DCFCE7', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '26px', color: '#16A34A' }}>emoji_events</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: colors.navy, marginBottom: '8px', fontFamily: "'DM Sans',sans-serif" }}>Finalize Match?</h2>
            <p style={{ fontSize: '14px', color: colors.inkMid, lineHeight: 1.6, marginBottom: '22px' }}>
              All period scores will be locked and the winner will be determined and advanced in the bracket. This cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => finalizeMatch(confirmFinalize)} disabled={saving} style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#16A34A', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Finalizing...' : 'Confirm & Advance Winner'}
              </button>
              <button onClick={() => setConfirmFinalize(null)} style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
