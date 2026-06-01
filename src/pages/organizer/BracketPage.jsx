import React, { useState, useEffect, useCallback } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { API_URL } from '../../config';
import { createClient } from '../../utils/supabase/client';

// ─── Bracket Layout Utility ────────────────────────────────────────────────
function groupByRound(matches) {
  const rounds = {};
  matches.forEach(m => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });
  return Object.entries(rounds)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([round, mList]) => ({ round: Number(round), label: mList[0]?.round_label || `Round ${round}`, matches: mList.sort((a, b) => a.match_order - b.match_order) }));
}

export default function BracketPage() {
  const { selectedEvent, showToast, eventsLoading } = useEventContext();
  const [matches, setMatches] = useState([]);
  const [gameSetup, setGameSetup] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [hoveredMatch, setHoveredMatch] = useState(null);
  const [hoveredWinner, setHoveredWinner] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [selectedTieBreakerWinner, setSelectedTieBreakerWinner] = useState('');
  const [isSavingTieBreaker, setIsSavingTieBreaker] = useState(false);

  const handleRecordTieBreaker = async (winnerName) => {
    if (!winnerName) return;
    setIsSavingTieBreaker(true);
    try {
      const userId = localStorage.getItem('user_id');
      const updatedConfig = {
        ...gameSetup.config,
        tieBreakerWinner: winnerName
      };

      const res = await fetch(`${API_URL}/game/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent.id, config: updatedConfig, created_by: userId })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setGameSetup(prev => ({ ...prev, config: updatedConfig }));
      showToast(`Tie-breaker winner recorded: ${winnerName}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to record tie-breaker winner.', 'error');
    } finally {
      setIsSavingTieBreaker(false);
    }
  };

  const handleResetTieBreaker = async () => {
    setIsSavingTieBreaker(true);
    try {
      const userId = localStorage.getItem('user_id');
      const updatedConfig = { ...gameSetup.config };
      delete updatedConfig.tieBreakerWinner;

      const res = await fetch(`${API_URL}/game/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent.id, config: updatedConfig, created_by: userId })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setGameSetup(prev => ({ ...prev, config: updatedConfig }));
      setSelectedTieBreakerWinner('');
      showToast('Tie-breaker cleared successfully.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to clear tie-breaker.', 'error');
    } finally {
      setIsSavingTieBreaker(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset hasData when event changes so the spinner shows for the new event
  useEffect(() => {
    setHasData(false);
  }, [selectedEvent?.id]);

  const isMobile = windowWidth <= 768;
  const isGameEvent = selectedEvent?.competition_mode === 'game';

  const fetchData = useCallback(async () => {
    if (!selectedEvent) return;
    try {
      const [setupRes, bracketsRes] = await Promise.all([
        fetch(`${API_URL}/game/setup?event_id=${selectedEvent.id}`),
        fetch(`${API_URL}/game/brackets?event_id=${selectedEvent.id}`)
      ]);
      const setupJson = await setupRes.json();
      const bracketsJson = await bracketsRes.json();
      if (setupJson.success) setGameSetup(setupJson.data);
      if (bracketsJson.success) setMatches(bracketsJson.data || []);
      // Mark data as arrived — loading spinner hides permanently
      setHasData(true);
    } catch (err) {
      console.error('Error fetching bracket:', err);
      setHasData(true); // still hide spinner even on error
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);

    if (selectedEvent?.id) {
      const supabase = createClient();
      const channel = supabase
        .channel('brackets-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_brackets',
            filter: `event_id=eq.${selectedEvent.id}`
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
  }, [fetchData, selectedEvent?.id]);

  // Determine overall champion
  const roundedData = groupByRound(matches);
  const isRoundRobin = gameSetup?.config?.bracketFormat === 'round_robin' || matches.some(m => m.round_label === 'Round Robin');
  const allMatchesCompleted = matches.length > 0 && matches.every(m => m.status === 'completed');

  const teamWins = React.useMemo(() => {
    const wins = {};
    const teamsList = gameSetup?.config?.teams || [];
    teamsList.forEach(t => {
      wins[t.name] = { team: t.name, color: t.color, winsCount: 0, matchesPlayed: 0 };
    });
    matches.forEach(m => {
      if (m.status === 'completed' && m.winner) {
        if (!wins[m.winner]) {
          wins[m.winner] = { team: m.winner, winsCount: 0, matchesPlayed: 0 };
        }
        wins[m.winner].winsCount += 1;
      }
      if (m.team_a && m.team_a !== 'BYE') {
        if (!wins[m.team_a]) wins[m.team_a] = { team: m.team_a, winsCount: 0, matchesPlayed: 0 };
        if (m.status === 'completed') wins[m.team_a].matchesPlayed += 1;
      }
      if (m.team_b && m.team_b !== 'BYE') {
        if (!wins[m.team_b]) wins[m.team_b] = { team: m.team_b, winsCount: 0, matchesPlayed: 0 };
        if (m.status === 'completed') wins[m.team_b].matchesPlayed += 1;
      }
    });
    return Object.values(wins).sort((a, b) => {
      if (b.winsCount !== a.winsCount) {
        return b.winsCount - a.winsCount;
      }
      const tbWinner = gameSetup?.config?.tieBreakerWinner;
      if (tbWinner) {
        if (a.team === tbWinner) return -1;
        if (b.team === tbWinner) return 1;
      }
      return b.matchesPlayed - a.matchesPlayed;
    });
  }, [matches, gameSetup]);

  const champion = React.useMemo(() => {
    if (matches.length === 0 || !gameSetup) return null;
    
    if (isRoundRobin) {
      if (gameSetup?.config?.tieBreakerWinner) {
        return gameSetup.config.tieBreakerWinner;
      }
      if (allMatchesCompleted && teamWins.length > 0) {
        const maxWins = teamWins[0].winsCount;
        const topTeams = teamWins.filter(t => t.winsCount === maxWins);
        if (topTeams.length === 1) {
          return topTeams[0].team;
        }
      }
      return null;
    } else {
      const maxRound = roundedData.length > 0 ? Math.max(...roundedData.map(r => r.round)) : 0;
      const finalMatch = roundedData.find(r => r.round === maxRound)?.matches[0];
      return finalMatch?.winner || null;
    }
  }, [matches, gameSetup, isRoundRobin, allMatchesCompleted, teamWins, roundedData]);

  const handleSetWinner = async (matchId, winner, currentMatch) => {
    // Optimistic update
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, winner, status: 'completed' } : m));

    // Advance winner to next round if single elimination
    const cfg = gameSetup?.config;
    if (cfg?.bracketFormat === 'single_elimination') {
      const m = matches.find(m => m.id === matchId);
      if (m) {
        // Find next round match that this position feeds into
        const nextRound = m.round + 1;
        const nextMatchOrder = Math.ceil(m.match_order / 2);
        const nextMatch = matches.find(nm => nm.round === nextRound && nm.match_order === nextMatchOrder);
        if (nextMatch) {
          const isTeamA = m.match_order % 2 !== 0; // odd match_order → team_a slot
          const nextUpdates = isTeamA ? { team_a: winner } : { team_b: winner };
          setMatches(prev => prev.map(nm => nm.id === nextMatch.id ? { ...nm, ...nextUpdates } : nm));
          // Persist next match update
          await fetch(`${API_URL}/game/brackets/${nextMatch.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextUpdates)
          });
        }
      }
    }

    // Persist winner
    try {
      const res = await fetch(`${API_URL}/game/brackets/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner, status: 'completed' })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(`${winner} advances!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to record winner.', 'error');
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, winner: null, status: 'pending' } : m));
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch(`${API_URL}/game/brackets/event/${selectedEvent.id}`, { method: 'DELETE' });
      const cfg = gameSetup?.config;
      if (cfg?.teams) {
        const res = await fetch(`${API_URL}/game/brackets/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: selectedEvent.id, teams: cfg.teams.map(t => t.name), bracketFormat: cfg.bracketFormat, roundsPerMatch: cfg.roundsPerMatch })
        });
        const json = await res.json();
        if (json.success) setMatches(json.data || []);
      }
      showToast('Bracket reset successfully.', 'success');
    } catch (err) {
      showToast('Failed to reset bracket.', 'error');
    } finally {
      setIsResetting(false);
      setConfirmReset(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!isGameEvent && !eventsLoading && selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: colors.accentBg, display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: colors.accent }}>account_tree</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>Bracket Unavailable</h2>
        <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
          The Tournament Bracket is only available for events with <strong>Game</strong> competition mode.
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

  if (!gameSetup) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#F59E0B' }}>settings</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>No Game Setup Found</h2>
        <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '440px', margin: '0 auto', lineHeight: '1.6' }}>
          Please complete the Game Setup Builder first to generate the tournament bracket.
        </p>
      </div>
    );
  }

  const cfg = gameSetup.config || {};
  const teamColors = {};
  (cfg.teams || []).forEach(t => { teamColors[t.name] = t.color; });

  const MatchCard = ({ match }) => {
    const isHovered = hoveredMatch === match.id;
    const isPending = match.status === 'pending' || !match.status;
    const isCompleted = match.status === 'completed';
    const isBye = match.team_a === 'BYE' || match.team_b === 'BYE';

    const teamAColor = teamColors[match.team_a] || colors.accent;
    const teamBColor = teamColors[match.team_b] || '#8B5CF6';

    return (
      <div
        onMouseEnter={() => setHoveredMatch(match.id)}
        onMouseLeave={() => setHoveredMatch(null)}
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: `1.5px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : isHovered ? colors.accentGlow : colors.borderSoft}`,
          boxShadow: isHovered ? '0 10px 30px rgba(15,23,42,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.25s',
          overflow: 'hidden',
          width: isMobile ? '100%' : '220px',
          flexShrink: 0,
        }}
      >
        {/* Match Header */}
        <div style={{ padding: '8px 14px', background: isCompleted ? 'rgba(16,185,129,0.05)' : '#FAFBFC', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.inkMuted }}>Match {match.match_order}</span>
          {isCompleted && <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.success }}>verified</span>}
          {isPending && match.team_a && match.team_b && !isBye && <span style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.08)', padding: '2px 8px', borderRadius: '100px' }}>PENDING</span>}
        </div>

        {/* Teams */}
        <div style={{ padding: '12px' }}>
          {[{ team: match.team_a, side: 'a' }, { team: match.team_b, side: 'b' }].map(({ team, side }) => {
            const isWinner = match.winner === team;
            const isLoser = match.winner && match.winner !== team && team;
            const teamColor = side === 'a' ? teamAColor : teamBColor;
            const isTBD = !team || team === 'BYE';
            const isHoveredWinner = hoveredWinner === `${match.id}-${side}`;

            return (
              <div
                key={side}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  marginBottom: side === 'a' ? '8px' : '0',
                  background: isWinner ? `${teamColor}12` : 'transparent',
                  border: `1.5px solid ${isWinner ? `${teamColor}35` : 'transparent'}`,
                  cursor: 'default',
                  transition: 'all 0.2s',
                  opacity: isLoser ? 0.45 : 1,
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isTBD ? colors.borderSoft : teamColor, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {isWinner ? <span className="material-symbols-rounded" style={{ fontSize: '15px', color: '#fff' }}>emoji_events</span> : isTBD ? <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.inkMuted }}>more_horiz</span> : <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{team?.substring(0, 1) || '?'}</span>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: isWinner ? 800 : 600, color: isTBD ? colors.inkMuted : isWinner ? teamColor : colors.navy, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isTBD ? 'TBD' : team}
                </span>
              </div>
            );
          })}

        </div>
      </div>
    );
  };

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes champPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(252, 211, 77, 0.4); } 50% { box-shadow: 0 0 0 16px rgba(252, 211, 77, 0); } }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', marginBottom: '12px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#8B5CF6' }}>account_tree</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6', letterSpacing: '0.04em' }}>Tournament Bracket</span>
          </div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '32px', fontWeight: '800', color: colors.navy, letterSpacing: '-0.03em', margin: '0 0 8px' }}>{cfg.gameName || cfg.gameType || 'Tournament'} Bracket</h1>
          <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '520px', lineHeight: '1.55', margin: 0 }}>
            Winner results and bracket advancement are automatically calculated from the Judge Scoring Sheet in real-time.
          </p>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: '#EF4444', border: `1px solid rgba(239,68,68,0.2)`, transition: 'all 0.2s' }}
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
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>🏆 Grand Champion</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '28px', fontWeight: '900', color: '#FCD34D', letterSpacing: '-0.02em' }}>{champion}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{cfg.gameName || cfg.gameType} · {selectedEvent.name}</div>
          </div>
        </div>
      )}

            {/* Tie-Breaker Console */}
            {isRoundRobin && allMatchesCompleted && (() => {
              const maxWins = teamWins[0]?.winsCount || 0;
              const tiedTeams = teamWins.filter(t => t.winsCount === maxWins);
              const hasTiedTeams = tiedTeams.length > 1;
              const recordedWinner = gameSetup?.config?.tieBreakerWinner;

              if (!hasTiedTeams) return null;

              return (
                <div style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '22px',
                  padding: '24px',
                  marginBottom: '32px',
                  boxShadow: '0 4px 15px rgba(251, 191, 36, 0.1)',
                  animation: 'fadeIn 0.4s ease-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F59E0B', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '22px', color: '#fff' }}>bolt</span>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: '800', color: '#92400E', margin: 0 }}>
                        {recordedWinner ? 'Recorded Tie-Breaker Decision' : 'Leaderboard Tie Detected!'}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#B45309', margin: '2px 0 0' }}>
                        {recordedWinner 
                          ? `The organizer has recorded a tie-breaker decision in favor of ${recordedWinner}.` 
                          : `${tiedTeams.map(t => t.team).join(' and ')} are tied for 1st place with ${maxWins} wins.`}
                      </p>
                    </div>
                  </div>

                  {recordedWinner ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.12)', border: '1.5px solid #FCD34D' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
                          🏆 Winner: {recordedWinner}
                        </span>
                      </div>
                      <button
                        onClick={handleResetTieBreaker}
                        disabled={isSavingTieBreaker}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background: '#fff',
                          color: '#DC2626',
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
                        Clear Tie-Breaker Decision
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#92400E', marginBottom: '12px' }}>
                        Select the team that won the tie-breaker round:
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {tiedTeams.map(t => {
                          const isSelected = selectedTieBreakerWinner === t.team;
                          return (
                            <button
                              key={t.team}
                              onClick={() => setSelectedTieBreakerWinner(t.team)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: `2px solid ${isSelected ? '#F59E0B' : '#E2E8F0'}`,
                                background: isSelected ? '#FEF3C7' : '#fff',
                                color: isSelected ? '#92400E' : colors.inkSoft,
                                fontWeight: '700',
                                fontSize: '13.5px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color || '#F59E0B' }} />
                              {t.team}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handleRecordTieBreaker(selectedTieBreakerWinner)}
                        disabled={!selectedTieBreakerWinner || isSavingTieBreaker}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '13.5px',
                          fontWeight: '700',
                          cursor: (!selectedTieBreakerWinner || isSavingTieBreaker) ? 'not-allowed' : 'pointer',
                          background: '#F59E0B',
                          color: '#fff',
                          border: 'none',
                          opacity: (!selectedTieBreakerWinner || isSavingTieBreaker) ? 0.6 : 1,
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check</span>
                        {isSavingTieBreaker ? 'Saving...' : 'Record Tie-Breaker Decision'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

      {/* Bracket Display */}
      <div style={{ overflowX: 'auto', paddingBottom: '24px' }}>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', background: '#fff', borderRadius: '24px', border: `1.5px dashed ${colors.borderSoft}` }}>
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>sports</span>
            <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No bracket generated yet. Complete the Game Setup Builder first.</p>
          </div>
        ) : isMobile ? (
          // Mobile: Stacked rounds
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {roundedData.map(({ round, label, matches: rMatches }) => (
              <div key={round}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: colors.navy, display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{round}</span>
                  </div>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: '800', color: colors.navy, margin: 0 }}>{label}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: Horizontal bracket
          <div style={{ display: 'flex', gap: '0', alignItems: 'flex-start' }}>
            {roundedData.map(({ round, label, matches: rMatches }, ridx) => {
              const totalRounds = roundedData.length;
              const totalMatches = rMatches.length;
              const matchHeight = Math.pow(2, ridx) * 160;

              return (
                <div key={round} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '260px' }}>
                  {/* Round Label */}
                  <div style={{ marginBottom: '20px', padding: '6px 16px', borderRadius: '100px', background: round === totalRounds ? 'rgba(252,211,77,0.12)' : colors.accentBg, border: `1px solid ${round === totalRounds ? 'rgba(252,211,77,0.3)' : colors.accentGlow}` }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: round === totalRounds ? '#B45309' : colors.accentDeep }}>{label}</span>
                  </div>

                  {/* Matches */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(24, matchHeight - 160)}px`, alignItems: 'center', width: '100%', paddingLeft: ridx === 0 ? '0' : '24px' }}>
                    {rMatches.map((m, midx) => (
                      <div key={m.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        {/* Connector lines (not for first round) */}
                        {ridx > 0 && (
                          <div style={{ position: 'absolute', left: '-24px', top: '50%', width: '24px', height: '1.5px', background: colors.borderSoft }} />
                        )}
                        <MatchCard match={m} />
                        {/* Right connector lines (not for last round) */}
                        {ridx < totalRounds - 1 && (
                          <div style={{ position: 'absolute', right: '-24px', top: '50%', width: '24px', height: '1.5px', background: colors.borderSoft }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {confirmReset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.5)', backdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setConfirmReset(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '420px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', display: 'grid', placeItems: 'center', marginBottom: '20px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '28px', color: '#EF4444' }}>restart_alt</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: '800', color: colors.navy, marginBottom: '8px' }}>Reset Bracket?</h2>
            <p style={{ fontSize: '14.5px', color: colors.inkMid, lineHeight: '1.6', marginBottom: '28px' }}>All match results will be cleared and the bracket will be regenerated from the original team seedings. This cannot be undone.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleReset} disabled={isResetting} style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#EF4444', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '700', cursor: isResetting ? 'not-allowed' : 'pointer', opacity: isResetting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isResetting ? <><span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>cached</span> Resetting...</> : 'Yes, Reset Bracket'}
              </button>
              <button onClick={() => setConfirmReset(false)} style={{ width: '100%', height: '46px', borderRadius: '12px', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
