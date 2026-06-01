import React, { useState, useEffect, useCallback } from 'react';
import { useJudgeContext } from './JudgeLayout';
import { colors } from '../../styles/colors';
import { API_URL } from '../../config';
import { createClient } from '../../utils/supabase/client';

// ─── Group matches by round (same utility as BracketPage) ─────────────────────
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

export default function GameScoringPage() {
  const { event, showToast } = useJudgeContext();

  const [matches, setMatches] = useState([]);
  const [gameSetup, setGameSetup] = useState(null);
  const [roundScores, setRoundScores] = useState({});   // { [matchId]: { [roundNum]: { a, b, submitted, notes } } }
  const [hasData, setHasData] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [confirmLock, setConfirmLock] = useState(null); // { matchId, roundNum }
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const judgeId = event?.eventJudgeId || localStorage.getItem('judge_event_id') || null;
  const isLocked = event?.status?.toLowerCase() !== 'active' && event?.status?.toLowerCase() !== 'ongoing';

  // Reset hasData when event changes so spinner shows for the new event
  useEffect(() => {
    setHasData(false);
  }, [event?.id]);

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!event) return;
    try {
      const [setupRes, bracketsRes] = await Promise.all([
        fetch(`${API_URL}/game/setup?event_id=${event.id}`),
        fetch(`${API_URL}/game/brackets?event_id=${event.id}`),
      ]);
      const setupJson = await setupRes.json();
      const bracketsJson = await bracketsRes.json();

      const setup = setupJson.success ? setupJson.data : null;
      const allMatches = bracketsJson.success ? (bracketsJson.data || []) : [];

      setGameSetup(setup);
      setMatches(allMatches);

      // Default to first playable match
      const playable = allMatches.filter(m => m.team_a && m.team_b && m.team_a !== 'BYE' && m.team_b !== 'BYE');
      setActiveMatchId(prev => prev ?? (playable[0]?.id ?? null));

      // Load saved scores
      if (judgeId) {
        const scoresRes = await fetch(`${API_URL}/game/match-scores?event_id=${event.id}&judge_id=${judgeId}`);
        const scoresJson = await scoresRes.json();
        if (scoresJson.success && scoresJson.data) {
          const grouped = {};
          scoresJson.data.forEach(s => {
            if (!grouped[s.match_id]) grouped[s.match_id] = {};
            grouped[s.match_id][s.round_num] = {
              a: s.team_a_score,
              b: s.team_b_score,
              submitted: !!s.submitted,
              notes: s.notes || '',
            };
          });

          setRoundScores(prev => {
            const merged = { ...grouped };
            Object.entries(prev).forEach(([matchId, rounds]) => {
              if (!merged[matchId]) merged[matchId] = {};
              Object.entries(rounds).forEach(([roundNum, rd]) => {
                const dbRound = merged[matchId][roundNum];
                // If local round has an unsaved selection, preserve it
                if (rd && !rd.submitted && (rd.a !== null || rd.b !== null)) {
                  if (!dbRound || !dbRound.submitted) {
                    merged[matchId][roundNum] = {
                      ...dbRound,
                      a: rd.a,
                      b: rd.b,
                      submitted: false,
                      notes: rd.notes || (dbRound?.notes || ''),
                    };
                  }
                }
              });
            });
            return merged;
          });
        }
      }
    } catch (err) {
      console.error('[GameScoringPage] fetch error:', err);
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
        .channel('game-scoring-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_match_scores',
            filter: `event_id=eq.${event.id}`
          },
          () => {
            fetchData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_brackets',
            filter: `event_id=eq.${event.id}`
          },
          () => {
            fetchData();
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }

    return () => clearInterval(interval);
  }, [fetchData, event?.id]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const cfg = gameSetup?.config || {};
  const roundsPerMatch = cfg.roundsPerMatch || 3;
  const teamColors = {};
  (cfg.teams || []).forEach(t => { teamColors[t.name] = t.color; });
  const getColor = name => teamColors[name] || colors.accent;

  const scoringFields = cfg.scoringFields || [{ id: 'result', label: 'Round Result', type: 'win_loss' }];
  const isPureWinLoss = scoringFields.every(f => f.type === 'win_loss');

  const roundedData = groupByRound(matches);

  const getRound = (matchId, roundNum) =>
    roundScores[matchId]?.[roundNum] || { a: null, b: null, submitted: false, notes: '' };

  const setScore = (matchId, roundNum, key, value) => {
    setRoundScores(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        [roundNum]: { ...getRound(matchId, roundNum), [key]: value },
      },
    }));
  };

  const setRoundWinner = (matchId, roundNum, winnerSide) => {
    const currentRound = getRound(matchId, roundNum);
    const isAlreadySelected = (winnerSide === 'a' && currentRound.a === 1) || (winnerSide === 'b' && currentRound.b === 1);
    
    const winnerA = isAlreadySelected ? null : (winnerSide === 'a' ? 1 : 0);
    const winnerB = isAlreadySelected ? null : (winnerSide === 'b' ? 1 : 0);

    setRoundScores(prev => {
      const matchScores = prev[matchId] || {};
      const current = matchScores[roundNum] || { a: null, b: null, submitted: false, notes: '' };
      return {
        ...prev,
        [matchId]: {
          ...matchScores,
          [roundNum]: {
            ...current,
            a: winnerA,
            b: winnerB,
          }
        }
      };
    });

    if (judgeId) {
      fetch(`${API_URL}/game/match-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          match_id: matchId,
          judge_id: judgeId,
          round_num: roundNum,
          team_a_score: winnerA,
          team_b_score: winnerB,
          notes: currentRound.notes || '',
          submitted: false,
        }),
      }).catch(err => console.error('[setRoundWinner] auto-save error:', err));
    }
  };

  const setNotes = (matchId, roundNum, value) => {
    setRoundScores(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        [roundNum]: { ...getRound(matchId, roundNum), notes: value },
      },
    }));
  };

  const handleSaveRound = async (matchId, roundNum, markSubmit = false) => {
    if (!judgeId) { showToast('No judge ID. Please refresh.', 'error'); return; }
    const rd = getRound(matchId, roundNum);
    if (markSubmit && (rd.a == null || rd.b == null)) {
      showToast('Please select a winner before locking this round.', 'info');
      return;
    }
    const scoreA = markSubmit ? (rd.a ?? null) : null;
    const scoreB = markSubmit ? (rd.b ?? null) : null;
    try {
      const res = await fetch(`${API_URL}/game/match-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          match_id: matchId,
          judge_id: judgeId,
          round_num: roundNum,
          team_a_score: scoreA,
          team_b_score: scoreB,
          notes: rd.notes || '',
          submitted: markSubmit,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setRoundScores(prev => ({
        ...prev,
        [matchId]: {
          ...(prev[matchId] || {}),
          [roundNum]: { ...getRound(matchId, roundNum), a: scoreA, b: scoreB, submitted: markSubmit },
        },
      }));

      if (markSubmit) {
        showToast(`Round ${roundNum} locked!`, 'success');
      } else {
        showToast(`Round ${roundNum} unlocked and winner selection reset.`, 'info');
      }
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save scores.', 'error');
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${colors.borderSoft}`, borderTopColor: colors.accent, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: colors.inkMuted, fontWeight: '600' }}>Loading match data...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!gameSetup) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#F59E0B' }}>settings</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '22px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>No Game Setup Yet</h2>
        <p style={{ color: colors.inkMid, fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
          The organizer hasn't completed the Game Setup Builder yet. Check back once the setup is published.
        </p>
      </div>
    );
  }

  const activeMatch = matches.find(m => m.id === activeMatchId) ?? null;

  // Determine champion
  const maxRound = roundedData.length > 0 ? Math.max(...roundedData.map(r => r.round)) : 0;
  const finalMatch = roundedData.find(r => r.round === maxRound)?.matches[0];
  const champion = finalMatch?.winner || null;

  // ── Sub-components ────────────────────────────────────────────────────────

  const TeamBadge = ({ name, size = 28 }) => (
    <div style={{ width: size, height: size, borderRadius: '8px', background: getColor(name), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.43, fontWeight: 800, color: '#fff' }}>{name?.[0]}</span>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes champPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(252,211,77,.4) } 50% { box-shadow: 0 0 0 14px rgba(252,211,77,0) } }
        @keyframes pulseLock  { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4) } 70% { box-shadow: 0 0 0 14px rgba(239,68,68,0) } }
      `}</style>

      <div style={{ position: 'relative', minHeight: '60vh' }}>
        {/* Blurred when event not active */}
        <div style={{ filter: isLocked ? 'blur(8px)' : 'none', pointerEvents: isLocked ? 'none' : 'auto', userSelect: isLocked ? 'none' : 'auto', transition: 'all .4s ease' }}>

          {/* ── Page Header ── */}
          <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.15)', marginBottom: '12px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#8B5CF6' }}>sports_martial_arts</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6', letterSpacing: '.04em' }}>Judge Score Sheet</span>
              </div>
              <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobile ? '26px' : '32px', fontWeight: 800, color: colors.navy, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                {cfg.gameName || cfg.gameType || 'Game'} Scoring
              </h1>
              <p style={{ color: colors.inkMid, fontSize: '14px', maxWidth: '520px', lineHeight: 1.55, margin: 0 }}>
                Select a match below to record round scores. Lock each round once confirmed.
              </p>
            </div>
          </div>

          {/* ── Champion Banner ── */}
          {champion && (
            <div style={{ background: 'linear-gradient(135deg,#1E2D4A 0%,#2E4268 100%)', borderRadius: '20px', padding: '24px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '18px', animation: 'fadeIn .5s ease-out' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(252,211,77,.15)', border: '2px solid rgba(252,211,77,.3)', display: 'grid', placeItems: 'center', flexShrink: 0, animation: 'champPulse 2.5s ease-in-out infinite' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '30px', color: '#FCD34D' }}>emoji_events</span>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.45)', marginBottom: '4px' }}>Grand Champion</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '24px', fontWeight: 900, color: '#FCD34D', letterSpacing: '-0.02em' }}>{champion}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', marginTop: '2px' }}>{cfg.gameName || cfg.gameType} · {event?.name}</div>
              </div>
            </div>
          )}

          {/* ── No matches ── */}
          {matches.length === 0 ? (
            <div style={{ background: '#fff', border: `1.5px dashed ${colors.borderSoft}`, borderRadius: '24px', padding: '80px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.inkMuted }}>sports</span>
              </div>
              <p style={{ fontSize: '18px', color: colors.navy, fontWeight: 800, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>No Bracket Generated Yet</p>
              <p style={{ fontSize: '14.5px', color: colors.inkSoft, margin: 0, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                The event organizer needs to finalize the Game Setup and generate the competition bracket before scoring can begin.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',
              gap: '32px',
              alignItems: 'start'
            }}>
              {/* ── Left Column: Bracket Matches List ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {roundedData.map(({ round, label, matches: rMatches }) => (
                  <div key={round} style={{ background: '#F8FAFC', borderRadius: '20px', padding: '20px', border: `1px solid ${colors.borderSoft}` }}>
                    {/* Round Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: colors.navy, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{round}</span>
                      </div>
                      <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '15px', fontWeight: 800, color: colors.navy, margin: 0 }}>{label}</h3>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(15,23,42,0.06)' }} />
                    </div>

                    {/* Match Cards Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {rMatches.map(m => {
                        const isPlayable = m.team_a && m.team_b && m.team_a !== 'BYE' && m.team_b !== 'BYE';
                        const isActive = m.id === activeMatchId;
                        const isCompleted = m.status === 'completed';
                        const matchRoundData = roundScores[m.id] || {};
                        const submittedCount = Object.values(matchRoundData).filter(r => r.submitted).length;

                        return (
                          <div key={m.id}
                            onClick={() => isPlayable && setActiveMatchId(m.id)}
                            style={{
                              background: '#fff',
                              border: `2px solid ${isActive ? colors.accent : isCompleted ? 'rgba(16,185,129,.15)' : 'transparent'}`,
                              borderRadius: '16px',
                              cursor: isPlayable ? 'pointer' : 'default',
                              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                              transform: (isPlayable && isActive) ? 'translateY(-2px)' : 'none',
                              boxShadow: isActive ? '0 12px 24px -10px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                            className="match-card-hover"
                          >
                            {/* Card Header */}
                            <div style={{
                              padding: '10px 16px',
                              background: isActive ? 'rgba(59, 130, 246, 0.05)' : isCompleted ? 'rgba(16,185,129,.03)' : '#fff',
                              borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderTopLeftRadius: '14px',
                              borderTopRightRadius: '14px'
                            }}>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.05em', color: isActive ? colors.accent : colors.inkMuted }}>
                                Match {m.match_order}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isCompleted ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '800', color: colors.success, background: 'rgba(16,185,129,.08)', padding: '2px 8px', borderRadius: '100px' }}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>verified</span> Finished
                                  </span>
                                ) : isPlayable && submittedCount > 0 ? (
                                  <span style={{ fontSize: '10px', fontWeight: '800', color: colors.accent, background: colors.accentBg, padding: '2px 8px', borderRadius: '100px' }}>
                                    {submittedCount}/{roundsPerMatch} Rounds Locked
                                  </span>
                                ) : isPlayable ? (
                                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '100px' }}>
                                    Ready to Score
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '10px', fontWeight: '800', color: colors.inkMuted, background: '#F8FAFC', padding: '2px 8px', borderRadius: '100px' }}>
                                    Waiting for Opponents
                                  </span>
                                )}
                                <span className="material-symbols-rounded" style={{ fontSize: '16px', color: isActive ? colors.accent : colors.inkMuted }}>
                                  chevron_right
                                </span>
                              </div>
                            </div>

                            {/* Teams Row */}
                            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {[{ team: m.team_a, side: 'a' }, { team: m.team_b, side: 'b' }].map(({ team, side }, idx) => {
                                const isTBD = !team || team === 'BYE';
                                const isWinner = m.winner === team;
                                const isLoser = m.winner && m.winner !== team && !isTBD;
                                return (
                                  <div key={side} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '6px 8px',
                                    borderRadius: '10px',
                                    background: isWinner ? `${getColor(team)}08` : 'transparent',
                                    opacity: isLoser ? .45 : 1
                                  }}>
                                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isTBD ? '#E2E8F0' : getColor(team), display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: isTBD ? 'none' : '0 2px 6px rgba(0,0,0,0.1)' }}>
                                      {isWinner ? (
                                        <span className="material-symbols-rounded" style={{ fontSize: '12px', color: '#fff' }}>emoji_events</span>
                                      ) : isTBD ? (
                                        <span className="material-symbols-rounded" style={{ fontSize: '12px', color: colors.inkMuted }}>more_horiz</span>
                                      ) : (
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#fff' }}>{team[0]}</span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '13.5px', fontWeight: isWinner ? '800' : '600', color: isTBD ? colors.inkMuted : isWinner ? getColor(team) : colors.navy, flex: 1 }}>
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

              {/* ── Right Column: Focused Match Scoring Console ── */}
              <div style={{ position: 'sticky', top: '24px' }}>
                {!activeMatch ? (
                  <div style={{ background: '#fff', border: `1.5px dashed ${colors.borderSoft}`, borderRadius: '24px', padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.06)', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '32px', color: colors.accent }}>ads_click</span>
                    </div>
                    <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '18px', fontWeight: 800, color: colors.navy, margin: '0 0 6px' }}>Select a Match</h3>
                    <p style={{ color: colors.inkSoft, fontSize: '13.5px', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                      Click any active match card on the left to open the real-time scoring console and record round statistics.
                    </p>
                  </div>
                ) : (
                  <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.06)', animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    
                    {/* Console Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}` }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: colors.accent, letterSpacing: '0.05em', marginBottom: '2px' }}>
                          Active Console
                        </div>
                        <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '18px', fontWeight: 800, color: colors.navy, margin: 0 }}>
                          Match {activeMatch.match_order} scoring
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveMatchId(null)}
                        style={{ border: 'none', background: '#F1F5F9', color: colors.inkSoft, cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all 0.2s' }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
                      </button>
                    </div>

                    {/* Premium Versus Display */}
                    <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px', marginBottom: '24px', border: `1px solid ${colors.borderSoft}` }}>
                      {/* Team A */}
                      <div style={{ textAlign: 'center', flex: 1, overflow: 'hidden' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: getColor(activeMatch.team_a), display: 'grid', placeItems: 'center', margin: '0 auto 10px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{activeMatch.team_a?.[0]}</span>
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {activeMatch.team_a}
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: colors.navy, fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                          {Object.values(roundScores[activeMatch.id] || {}).filter(r => r.a === 1).length}
                        </div>
                      </div>

                      {/* VS Badge */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ padding: '6px 12px', borderRadius: '100px', background: '#E2E8F0', color: colors.navy, fontSize: '11px', fontWeight: 900, letterSpacing: '0.05em' }}>
                          VS
                        </div>
                        <div style={{ fontSize: '11px', color: colors.inkMuted, fontWeight: '700', marginTop: '6px', whiteSpace: 'nowrap' }}>
                          Best of {roundsPerMatch}
                        </div>
                      </div>

                      {/* Team B */}
                      <div style={{ textAlign: 'center', flex: 1, overflow: 'hidden' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: getColor(activeMatch.team_b), display: 'grid', placeItems: 'center', margin: '0 auto 10px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{activeMatch.team_b?.[0]}</span>
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {activeMatch.team_b}
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: colors.navy, fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                          {Object.values(roundScores[activeMatch.id] || {}).filter(r => r.b === 1).length}
                        </div>
                      </div>
                    </div>

                    {/* Rounds List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Array.from({ length: roundsPerMatch }, (_, i) => {
                        const roundNum = i + 1;
                        const rd = getRound(activeMatch.id, roundNum);
                        const colorA = getColor(activeMatch.team_a);
                        const colorB = getColor(activeMatch.team_b);

                        // Official decided logic
                        const matchScores = roundScores[activeMatch.id] || {};
                        const submittedRounds = Object.values(matchScores).filter(r => r.submitted);
                        const winsA = submittedRounds.filter(r => r.a === 1).length;
                        const winsB = submittedRounds.filter(r => r.b === 1).length;
                        const majorityThreshold = Math.ceil(roundsPerMatch / 2);
                        const matchWinnerDecided = winsA >= majorityThreshold || winsB >= majorityThreshold;
                        const decidedWinnerName = winsA >= majorityThreshold ? activeMatch.team_a : (winsB >= majorityThreshold ? activeMatch.team_b : null);
                        const isRoundNotRequired = !rd.submitted && matchWinnerDecided;

                        return (
                          <div key={roundNum} style={{
                            background: rd.submitted ? 'rgba(16,185,129,0.03)' : (isRoundNotRequired ? '#F8FAFC' : '#fff'),
                            border: `1.5px ${isRoundNotRequired ? 'dashed' : 'solid'} ${rd.submitted ? 'rgba(16,185,129,0.18)' : (isRoundNotRequired ? '#CBD5E1' : colors.border)}`,
                            borderRadius: '18px',
                            padding: '16px',
                            transition: 'all 0.2s',
                          }}>
                            {/* Round Sub-header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: '800', color: colors.navy }}>Round {roundNum}</span>
                              {rd.submitted ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '800', color: colors.success }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>verified</span> Locked
                                </span>
                              ) : isRoundNotRequired ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '800', color: colors.inkMuted }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>block</span> Not Required
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted }}>In Progress</span>
                              )}
                            </div>

                            {/* Inputs Container - Winner Click Buttons */}
                            {!rd.submitted ? (
                              isRoundNotRequired ? (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px', 
                                  padding: '10px 14px', 
                                  background: '#E2E8F0', 
                                  border: `1px solid ${colors.borderSoft}`, 
                                  borderRadius: '12px', 
                                  marginBottom: '12px',
                                  color: colors.inkSoft,
                                  fontSize: '12px',
                                  fontWeight: '700'
                                }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '18px', color: colors.inkMuted }}>emoji_events</span>
                                  <span>Match won by {decidedWinnerName}</span>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                  <button
                                    onClick={() => {
                                      setRoundWinner(activeMatch.id, roundNum, 'a');
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '10px 12px',
                                      borderRadius: '10px',
                                      border: `2px solid ${rd.a === 1 ? colorA : colors.border}`,
                                      background: rd.a === 1 ? `${colorA}12` : '#F8FAFC',
                                      color: rd.a === 1 ? colorA : colors.inkSoft,
                                      fontSize: '11.5px',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      textAlign: 'center',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    🏆 {activeMatch.team_a} Won
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRoundWinner(activeMatch.id, roundNum, 'b');
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '10px 12px',
                                      borderRadius: '10px',
                                      border: `2px solid ${rd.b === 1 ? colorB : colors.border}`,
                                      background: rd.b === 1 ? `${colorB}12` : '#F8FAFC',
                                      color: rd.b === 1 ? colorB : colors.inkSoft,
                                      fontSize: '11.5px',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      textAlign: 'center',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    🏆 {activeMatch.team_b} Won
                                  </button>
                                </div>
                              )
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '10px 14px', 
                                background: 'rgba(16,185,129,0.06)', 
                                border: '1px solid rgba(16,185,129,0.18)', 
                                borderRadius: '12px', 
                                marginBottom: '12px',
                                color: colors.success,
                                fontSize: '13px',
                                fontWeight: '700'
                              }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check_circle</span>
                                <span>{rd.a === 1 ? activeMatch.team_a : activeMatch.team_b} won this round</span>
                              </div>
                            )}

                            {/* Notes Field */}
                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                              <span className="material-symbols-rounded" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: colors.inkMuted }}>
                                note_alt
                              </span>
                              <input
                                type="text"
                                placeholder="Add notes (optional)..."
                                disabled={rd.submitted || isRoundNotRequired}
                                value={rd.notes || ''}
                                onChange={e => setNotes(activeMatch.id, roundNum, e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '32px',
                                  padding: '0 8px 0 28px',
                                  border: `1.5px solid ${colors.borderSoft}`,
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  color: colors.navy,
                                  background: (rd.submitted || isRoundNotRequired) ? '#F8FAFC' : '#fff',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            {/* Actions bar (Lock / Undo lock) */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {!rd.submitted ? (
                                isRoundNotRequired ? (
                                  <button
                                    disabled
                                    style={{
                                      width: '100%',
                                      height: '36px',
                                      borderRadius: '10px',
                                      background: '#E2E8F0',
                                      color: '#94A3B8',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      cursor: 'not-allowed',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>do_not_disturb_on</span>
                                    Round Not Required
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setConfirmLock({ matchId: activeMatch.id, roundNum })}
                                    disabled={rd.a == null || rd.b == null}
                                    style={{
                                      width: '100%',
                                      height: '36px',
                                      borderRadius: '10px',
                                      background: colors.navy,
                                      color: '#fff',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      cursor: (rd.a == null || rd.b == null) ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      opacity: (rd.a == null || rd.b == null) ? 0.5 : 1,
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { if (rd.a != null && rd.b != null) e.currentTarget.style.background = colors.navySoft; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = colors.navy; }}
                                  >
                                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>lock</span>
                                    Lock Round {roundNum}
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => handleSaveRound(activeMatch.id, roundNum, false)}
                                  style={{
                                    width: '100%',
                                    height: '34px',
                                    borderRadius: '8px',
                                    background: '#FEF2F2',
                                    color: '#DC2626',
                                    border: '1px solid rgba(220,38,38,0.15)',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#FEE2E2';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = '#FEF2F2';
                                  }}
                                >
                                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>undo</span>
                                  Undo Lock (Unlock Round)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Lock Overlay ── */}
        {isLocked && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '40px 20px', animation: 'fadeIn .4s ease-out', background: 'rgba(255,255,255,.3)', backdropFilter: 'blur(3px)', borderRadius: '24px' }}>
            <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'rgba(239,68,68,.08)', color: '#EF4444', display: 'grid', placeItems: 'center', marginBottom: '20px', animation: 'pulseLock 2s infinite', border: '2px solid rgba(239,68,68,.15)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>lock</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: colors.navy, marginBottom: '12px', letterSpacing: '-0.03em', fontFamily: "'DM Sans',sans-serif" }}>Scoring Room Locked</h2>
              <p style={{ fontSize: '14px', color: colors.inkMid, lineHeight: 1.7, marginBottom: '24px', maxWidth: '380px' }}>
                Scoring is not yet open for <strong style={{ color: colors.navy }}>{event?.name}</strong>. Status:{' '}
                <span style={{ padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', background: 'rgba(239,68,68,.08)', color: '#EF4444' }}>{event?.status || 'upcoming'}</span>
              </p>
              <button onClick={() => window.history.back()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '100px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${colors.border}`, background: '#fff', color: colors.inkSoft }}>
                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>arrow_back</span>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm Lock Modal ── */}
      {confirmLock && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px', animation: 'fadeIn .3s ease-out' }}
          onClick={() => setConfirmLock(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '400px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: colors.navy, color: '#fff', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '26px' }}>verified_user</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: colors.navy, marginBottom: '8px', fontFamily: "'DM Sans',sans-serif" }}>Lock Round {confirmLock.roundNum}?</h2>
            <p style={{ fontSize: '14px', color: colors.inkMid, lineHeight: 1.6, marginBottom: '22px' }}>
              This will finalize the scores for Round {confirmLock.roundNum}. You won't be able to modify them after locking.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => { handleSaveRound(confirmLock.matchId, confirmLock.roundNum, true); setConfirmLock(null); }}
                style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#16A34A', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Confirm & Lock
              </button>
              <button onClick={() => setConfirmLock(null)}
                style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
