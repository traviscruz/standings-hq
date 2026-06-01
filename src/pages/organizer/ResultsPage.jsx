import React, { useState, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { API_URL } from '../../config';
import { createClient } from '../../utils/supabase/client';

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
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

export default function ResultsPage() {
  const { selectedEvent, participants, judges, showToast, eventsLoading, rubricConfig } = useEventContext();
  const [, forceUpdate] = useState(0);
  const [liveToggle, setLiveToggle] = useState(true);
  const [activeBtnHover, setActiveBtnHover] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [gameSetup, setGameSetup] = useState(null);
  const [matches, setMatches] = useState([]);
  const [hasGameData, setHasGameData] = useState(false);

  const isGameMode = selectedEvent?.competition_mode === 'game';

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



  // Reset hasGameData when event changes so spinner shows for the new event
  useEffect(() => {
    setHasGameData(false);
  }, [selectedEvent?.id]);

  useEffect(() => {
    if (!selectedEvent || !isGameMode) return;
    const fetchGameData = async () => {
      try {
        const [setupRes, bracketsRes] = await Promise.all([
          fetch(`${API_URL}/game/setup?event_id=${selectedEvent.id}`),
          fetch(`${API_URL}/game/brackets?event_id=${selectedEvent.id}`)
        ]);
        const setupJson = await setupRes.json();
        const bracketsJson = await bracketsRes.json();
        if (setupJson.success) setGameSetup(setupJson.data);
        if (bracketsJson.success) setMatches(bracketsJson.data || []);
      } catch (err) {
        console.error('Error fetching game results:', err);
      } finally {
        setHasGameData(true); // permanently show content after first fetch
      }
    };
    fetchGameData();

    let interval;
    if (liveToggle) {
      interval = setInterval(fetchGameData, 5000); // refresh every 5s if live
    }

    const supabase = createClient();
    const channel = supabase
      .channel('results-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_brackets',
          filter: `event_id=eq.${selectedEvent.id}`
        },
        () => {
          fetchGameData();
        }
      )
      .subscribe();

    return () => {
      if (interval) clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [selectedEvent, isGameMode, liveToggle]);

  const isRoundRobin = gameSetup?.config?.bracketFormat === 'round_robin' || matches.some(m => m.round_label === 'Round Robin');
  const allMatchesCompleted = matches.length > 0 && matches.every(m => m.status === 'completed');

  const teamWins = React.useMemo(() => {
    if (!isGameMode) return [];
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
  }, [matches, gameSetup, isGameMode]);

  const champion = React.useMemo(() => {
    if (!isGameMode || matches.length === 0 || !gameSetup) return null;
    
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
      const maxRound = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;
      const finalMatch = matches.find(m => m.round === maxRound && m.match_order === 1);
      return finalMatch?.winner || null;
    }
  }, [matches, gameSetup, isGameMode, isRoundRobin, allMatchesCompleted, teamWins]);

  const isGroupOrTeam = rubricConfig?.format === 'group' || rubricConfig?.format === 'team';

  const uniqueTeams = React.useMemo(() => {
    if (!isGroupOrTeam) return [];
    const teamsMap = {};
    participants.forEach(p => {
      const teamName = p.team?.trim() || 'Independent';
      if (!teamsMap[teamName]) {
        teamsMap[teamName] = {
          id: p.id,
          name: teamName,
          team: teamName,
          status: p.status,
          score: null,
          members: []
        };
      }
      teamsMap[teamName].members.push(p);
      if (p.score !== null && p.score !== undefined) {
        teamsMap[teamName].score = p.score;
      }
    });
    return Object.values(teamsMap);
  }, [participants, isGroupOrTeam]);

  const displayList = isGroupOrTeam ? uniqueTeams : participants;

  const handleExportPDF = () => {
    if (isGameMode) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('Could not open print window. Please check popup blocker.', 'error');
        return;
      }
      const title = `${selectedEvent.name} - Tournament Standings`;
      const date = new Date().toLocaleDateString();
      const scoredCount = matches.filter(m => m.status === 'completed').length;
      
      const htmlContent = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;800;900&family=Inter:wght@400;600;700;800&display=swap');
              body {
                font-family: 'Inter', -apple-system, sans-serif;
                color: #0f172a;
                padding: 40px;
                margin: 0;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .brand {
                font-size: 20px;
                font-weight: 800;
                color: #0f172a;
                font-family: 'DM Sans', sans-serif;
              }
              .brand span {
                color: #3b82f6;
              }
              .title {
                font-size: 24px;
                font-weight: 800;
                margin: 0 0 8px 0;
                font-family: 'DM Sans', sans-serif;
              }
              .meta {
                font-size: 13px;
                color: #64748b;
              }
              .kpis {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 30px;
              }
              .kpi-card {
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                background: #f8fafc;
              }
              .kpi-label {
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                color: #64748b;
                margin-bottom: 6px;
              }
              .kpi-value {
                font-size: 18px;
                font-weight: 800;
              }
              .champ-banner {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                color: #fff;
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 30px;
                display: flex;
                align-items: center;
                gap: 16px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th {
                background: #f8fafc;
                padding: 12px 16px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                color: #475569;
                border-bottom: 2px solid #cbd5e1;
                text-align: left;
              }
              td {
                padding: 14px 16px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">${title}</h1>
                <div class="meta">Exported on ${date} • Event Status: ${selectedEvent.status}</div>
              </div>
              <div class="brand">Standings<span>HQ</span></div>
            </div>
            
            ${champion ? `
              <div class="champ-banner">
                <div style="font-size: 32px;">🏆</div>
                <div>
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7;">Grand Champion</div>
                  <div style="font-size: 24px; font-weight: 900; color: #fcd34d;">${champion}</div>
                </div>
              </div>
            ` : ''}

            <div class="kpis">
              <div class="kpi-card">
                <div class="kpi-label">Game Type</div>
                <div class="kpi-value">${gameSetup?.config?.gameName || gameSetup?.config?.gameType || '—'}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Tournament Format</div>
                <div class="kpi-value">${gameSetup?.config?.bracketFormat === 'single_elimination' ? 'Single Elimination' : 'Round Robin'}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Matches Completed</div>
                <div class="kpi-value">${scoredCount} / ${matches.length}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Total Teams</div>
                <div class="kpi-value">${teamWins.length}</div>
              </div>
            </div>

            <h2>Team Leaderboard (By Match Wins)</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 70px; text-align: center;">Rank</th>
                  <th>Team</th>
                  <th style="text-align: center;">Matches Played</th>
                  <th style="text-align: right;">Wins</th>
                </tr>
              </thead>
              <tbody>
                ${teamWins.length === 0 ? `
                  <tr>
                    <td colspan="4" style="text-align: center; color: #64748b; padding: 40px;">No teams registered.</td>
                  </tr>
                ` : teamWins.map((t, idx) => {
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                  return `
                    <tr>
                      <td style="text-align: center; font-weight: 800; font-size: ${idx < 3 ? '16px' : '14px'}">${medal ? `${medal} ${idx + 1}` : idx + 1}</td>
                      <td style="font-weight: 700;">${t.team}</td>
                      <td style="text-align: center;">${t.matchesPlayed}</td>
                      <td style="text-align: right; font-weight: 800; font-size: 16px; color: ${idx === 0 ? '#16a34a' : '#0f172a'}">${t.winsCount}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <h2>Match Log</h2>
            <table>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Matchup</th>
                  <th style="text-align: center;">Status</th>
                  <th style="text-align: right;">Winner</th>
                </tr>
              </thead>
              <tbody>
                ${matches.map(m => `
                  <tr>
                    <td>${m.round_label} (M${m.match_order})</td>
                    <td style="font-weight: 600;">${m.team_a || 'TBD'} vs ${m.team_b || 'TBD'}</td>
                    <td style="text-align: center; text-transform: uppercase; font-size: 12px; font-weight: 700; color: ${m.status === 'completed' ? '#16a34a' : '#f59e0b'}">${m.status}</td>
                    <td style="text-align: right; font-weight: 700; color: #3b82f6;">${m.winner || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      showToast('PDF Rankings Report generated!', 'success');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Could not open print window. Please check popup blocker.', 'error');
      return;
    }

    const title = `${selectedEvent.name} - Official Leaderboard`;

    const date = new Date().toLocaleDateString();

    const ranked = [...displayList].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    const scoredCount = displayList.filter(p => p.score != null).length;
    const highScore = ranked.find(p => p.score != null)?.score ?? null;
    const avgScore = scoredCount > 0
      ? (displayList.filter(p => p.score != null).reduce((s, p) => s + p.score, 0) / scoredCount).toFixed(1)
      : '—';

    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;800;900&family=Inter:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #0f172a;
              padding: 40px;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .brand {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              font-family: 'DM Sans', sans-serif;
            }
            .brand span {
              color: #3b82f6;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 8px 0;
              font-family: 'DM Sans', sans-serif;
            }
            .meta {
              font-size: 13px;
              color: #64748b;
            }
            .kpis {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin-bottom: 30px;
            }
            .kpi-card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              background: #f8fafc;
            }
            .kpi-label {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 6px;
            }
            .kpi-value {
              font-size: 18px;
              font-weight: 800;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: #f8fafc;
              padding: 12px 16px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
              border-bottom: 2px solid #cbd5e1;
              text-align: left;
            }
            td {
              padding: 14px 16px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${title}</h1>
              <div class="meta">Exported on ${date} • Event Status: ${selectedEvent.status}</div>
            </div>
            <div class="brand">Standings<span>HQ</span></div>
          </div>
          
          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-label">Total Participants</div>
              <div class="kpi-value">${participants.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Scores Submitted</div>
              <div class="kpi-value">${scoredCount} / ${participants.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Highest Score</div>
              <div class="kpi-value">${highScore ?? '—'}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Average Score</div>
              <div class="kpi-value">${avgScore}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 70px; text-align: center;">Rank</th>
                <th>Participant</th>
                <th>Team</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: right;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${ranked.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: #64748b; padding: 40px;">No participants added yet.</td>
                </tr>
              ` : ranked.map((p, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                const rankDisplay = p.score != null ? (medal ? `${medal} ${idx + 1}` : idx + 1) : '—';
                const nameDisplay = isGroupOrTeam 
                  ? `${p.name} <br/><span style="font-size:11px; font-weight:normal; color:#64748b;">Members: ${p.members.map(m => m.name).join(', ')}</span>`
                  : p.name;
                const teamDisplay = isGroupOrTeam ? `${p.members.length} members` : (p.team || '');
                return `
                  <tr>
                    <td style="text-align: center; font-weight: 800; font-size: ${idx < 3 ? '16px' : '14px'}">${rankDisplay}</td>
                    <td style="font-weight: 700;">${nameDisplay}</td>
                    <td>${teamDisplay}</td>
                    <td style="text-align: center; color: ${p.score != null ? '#16a34a' : '#64748b'}; font-weight: 600;">
                      ${p.score != null ? 'Scored' : 'Pending'}
                    </td>
                    <td style="text-align: right; font-weight: 800; font-size: 16px;">${p.score ?? '—'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('PDF Rankings Report generated!', 'success');
  };

  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  if (eventsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: '12px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.accent, animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Loading results…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>event_busy</span>
        <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No event selected.</p>
      </div>
    );
  }

  const ranked = [...displayList].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const scoredCount = displayList.filter(p => p.score != null).length;
  const highScore = ranked.find(p => p.score != null)?.score ?? null;
  const avgScore = scoredCount > 0
    ? (displayList.filter(p => p.score != null).reduce((s, p) => s + p.score, 0) / scoredCount).toFixed(1)
    : null;
  const elapsed = getElapsed(selectedEvent.startDate, selectedEvent.startTime);
  const isLive = selectedEvent.status === 'Active';

  const styles = {
    pageHeader: {
      marginBottom: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '24px',
    },
    pageTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '28px' : '32px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.03em',
      lineHeight: '1.1',
      margin: 0,
      marginBottom: '8px',
    },
    pageDescription: {
      color: colors.inkMid,
      fontSize: '15px',
      maxWidth: '600px',
      lineHeight: '1.55',
      margin: 0,
    },
    btn: (hovered, primary = false) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: '14px',
      fontSize: '13.5px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', sans-serif",
      whiteSpace: 'nowrap',
      background: primary ? (hovered ? colors.navySoft : colors.navy) : (hovered ? colors.pageBg : '#fff'),
      color: primary ? '#fff' : (hovered ? colors.navy : colors.inkSoft),
      border: primary ? 'none' : `1px solid ${hovered ? colors.navy : colors.border}`,
      boxShadow: hovered ? '0 4px 12px rgba(15, 31, 61, 0.15)' : '0 1px 3px rgba(26,24,20,0.06)',
      transform: hovered ? 'translateY(-1px)' : 'none',
      height: '42px',
    }),
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
      gap: '24px',
      marginBottom: '28px',
    },
    widgetCard: (span) => ({
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '18px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      gridColumn: isMobile ? 'span 1' : `span ${span}`,
    }),
    statLabel: {
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.inkMuted,
      marginBottom: '8px',
      display: 'block',
    },
    statValue: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '32px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.04em',
      lineHeight: '1',
    },
    tableContainer: {
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '22px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    tableHeader: {
      padding: '20px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    },
    tableTitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '18px',
      fontWeight: '700',
      color: colors.navy,
      margin: 0,
    },
    dataTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
    },
    th: {
      padding: '14px 24px',
      background: '#F8FAFC',
      fontSize: '11.5px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: colors.inkMuted,
      borderBottom: `1px solid ${colors.borderSoft}`,
    },
    td: {
      padding: '16px 24px',
      borderBottom: `1px solid ${colors.borderSoft}`,
      fontSize: '14px',
      color: colors.inkMid,
    },
    userAvatar: (size = 34, fontSize = 11, bg = colors.accentBg, text = colors.accentDeep) => ({
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: bg,
      color: text,
      display: 'grid',
      placeItems: 'center',
      fontSize: `${fontSize}px`,
      fontWeight: '700',
    }),
  };

  return (
    <>
      {isGameMode && (() => {
        const scoredCount = matches.filter(m => m.status === 'completed').length;
        return (
          <>
            {/* Header */}
            <div style={styles.pageHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {isLive && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                      color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: '100px',
                    }}>
                      <span style={{ width: '6px', height: '6px', background: '#DC2626', borderRadius: '50%', animation: 'blink 1.2s infinite' }} />
                      Live Tournament
                    </span>
                  )}
                  {elapsed && <span style={{ fontSize: '13px', color: colors.inkMuted }}>Running for {elapsed}</span>}
                </div>
                <h1 style={styles.pageTitle}>{gameSetup?.config?.gameName || gameSetup?.config?.gameType || 'Game'} Results</h1>
                <p style={styles.pageDescription}>
                  Live tournament overview and standings for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  style={styles.btn(activeBtnHover === 'pause')}
                  onMouseEnter={() => setActiveBtnHover('pause')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                  onClick={() => { setLiveToggle(!liveToggle); showToast(liveToggle ? 'Live refresh paused.' : 'Live refresh resumed.', 'info'); }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{liveToggle ? 'pause' : 'play_arrow'}</span>
                  {liveToggle ? 'Pause Live' : 'Resume Live'}
                </button>
                <button
                  style={styles.btn(activeBtnHover === 'export', true)}
                  onMouseEnter={() => setActiveBtnHover('export')}
                  onMouseLeave={() => setActiveBtnHover(null)}
                  onClick={handleExportPDF}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
                  Export PDF
                </button>
              </div>
            </div>

            {/* Champion Banner */}
            {champion && (
              <div style={{ background: 'linear-gradient(135deg, #1E2D4A 0%, #2E4268 100%)', borderRadius: '20px', padding: '28px 32px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(252,211,77,0.15)', border: '2px solid rgba(252,211,77,0.3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '34px', color: '#FCD34D' }}>emoji_events</span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>🏆 Grand Champion Winner</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '28px', fontWeight: '900', color: '#FCD34D', letterSpacing: '-0.02em' }}>{champion}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{gameSetup?.config?.gameName || gameSetup?.config?.gameType} · {selectedEvent.name}</div>
                </div>
              </div>
            )}

            {/* KPIs */}
            <div style={styles.dashboardGrid}>
              <div style={styles.widgetCard(3)}>
                <span style={styles.statLabel}>Matches Played</span>
                <div style={styles.statValue}>
                  {scoredCount}
                  <span style={{ fontSize: '16px', color: colors.inkMuted, marginLeft: '4px' }}>/{matches.length}</span>
                </div>
                {matches.length > 0 && (
                  <div style={{ marginTop: '10px', height: '5px', background: colors.borderSoft, borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(scoredCount / matches.length) * 100}%`, background: colors.accent, borderRadius: '100px', transition: 'width 0.5s' }} />
                  </div>
                )}
              </div>
              <div style={styles.widgetCard(3)}>
                <span style={styles.statLabel}>Total Teams</span>
                <div style={styles.statValue}>{teamWins.length}</div>
              </div>
              <div style={styles.widgetCard(3)}>
                <span style={styles.statLabel}>Tournament Format</span>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: colors.navy, marginTop: '8px' }}>
                  {gameSetup?.config?.bracketFormat === 'single_elimination' ? 'Single Elimination' : 'Round Robin'}
                </div>
              </div>
              <div style={styles.widgetCard(3)}>
                <span style={styles.statLabel}>Est. Duration</span>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: colors.navy, marginTop: '8px' }}>
                  {gameSetup?.config?.estimatedDuration || '—'}
                </div>
              </div>
            </div>



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

            {/* Leaderboard Table (Wins Tally) */}
            <div style={{ ...styles.tableContainer, marginBottom: '32px' }}>
              <div style={styles.tableHeader}>
                <h3 style={{ ...styles.tableTitle, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.navy }}>leaderboard</span>
                  Team Leaderboard (Wins Tally)
                </h3>
              </div>
              <table style={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '70px', textAlign: 'center' }}>Rank</th>
                    <th style={styles.th}>Team Name</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Matches Played</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Match Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {teamWins.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: colors.inkMuted }}>
                        No teams setup yet.
                      </td>
                    </tr>
                  ) : teamWins.map((t, idx) => {
                    let rank = 1;
                    for (let i = 0; i < idx; i++) {
                      const p = teamWins[i];
                      const tbWinner = gameSetup?.config?.tieBreakerWinner;
                      const isPrecedenceByTb = tbWinner && (p.team === tbWinner || t.team === tbWinner);
                      const isTied = p.winsCount === t.winsCount && 
                                     p.matchesPlayed === t.matchesPlayed && 
                                     !isPrecedenceByTb;
                      if (!isTied) {
                        rank = i + 2;
                      } else {
                        break;
                      }
                    }
                    const medal = rank === 1 && t.winsCount > 0 ? '🥇' : rank === 2 && t.winsCount > 0 ? '🥈' : rank === 3 && t.winsCount > 0 ? '🥉' : null;
                    return (
                      <tr key={t.team} style={{ background: rank === 1 && t.winsCount > 0 ? 'rgba(250,204,21,0.04)' : 'transparent' }}>
                        <td style={{ ...styles.td, textAlign: 'center', fontWeight: 800, fontSize: rank < 4 && t.winsCount > 0 ? '20px' : '15px' }}>
                          {medal || rank}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 700, color: colors.navy }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color || colors.accent }} />
                            {t.team}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>{t.matchesPlayed}</td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '20px', color: idx === 0 && t.winsCount > 0 ? '#16A34A' : colors.navy }}>
                          {t.winsCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tournament Bracket Reference Summary */}
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <h3 style={{ ...styles.tableTitle, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.navy }}>account_tree</span>
                  Match Log &amp; Progress
                </h3>
              </div>
              <table style={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Round</th>
                    <th style={styles.th}>Match Order</th>
                    <th style={styles.th}>Matchup</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: colors.inkMuted }}>
                        No matches generated yet.
                      </td>
                    </tr>
                  ) : matches.map(m => (
                    <tr key={m.id}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{m.round_label}</td>
                      <td style={styles.td}>Match {m.match_order}</td>
                      <td style={{ ...styles.td, fontWeight: 700, color: colors.navy }}>
                        {m.team_a || 'TBD'} <span style={{ color: colors.inkMuted, fontWeight: 'normal' }}>vs</span> {m.team_b || 'TBD'}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                          background: m.status === 'completed' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                          color: m.status === 'completed' ? colors.success : '#B45309'
                        }}>
                          {m.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800, color: colors.accent }}>
                        {m.winner || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      })()}

      {!isGameMode && (
        <>
          <div style={styles.pageHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>

            {isLive && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: '100px',
              }}>
                <span style={{ width: '6px', height: '6px', background: '#DC2626', borderRadius: '50%', animation: 'blink 1.2s infinite' }} />
                Live
              </span>
            )}
            {elapsed && <span style={{ fontSize: '13px', color: colors.inkMuted }}>Running for {elapsed}</span>}
          </div>
          <h1 style={styles.pageTitle}>Results &amp; Standings</h1>
          <p style={styles.pageDescription}>
            Live scoring overview for <strong style={{ color: colors.navy }}>{selectedEvent.name}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            style={styles.btn(activeBtnHover === 'pause')}
            onMouseEnter={() => setActiveBtnHover('pause')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={() => { setLiveToggle(!liveToggle); showToast(liveToggle ? 'Live refresh paused.' : 'Live refresh resumed.', 'info'); }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{liveToggle ? 'pause' : 'play_arrow'}</span>
            {liveToggle ? 'Pause Live' : 'Resume Live'}
          </button>
          <button
            style={styles.btn(activeBtnHover === 'export', true)}
            onMouseEnter={() => setActiveBtnHover('export')}
            onMouseLeave={() => setActiveBtnHover(null)}
            onClick={handleExportPDF}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Event Summary KPIs ── */}
      <div style={styles.dashboardGrid}>
        {[
          { label: 'Event Status', value: selectedEvent.status, icon: 'info', color: isLive ? '#16A34A' : colors.navy },
          { label: 'Schedule Ends', value: `${formatDate(selectedEvent.endDate)} at ${selectedEvent.endTime || '—'}`, icon: 'event', color: colors.navy },
          { label: 'Participants', value: `${participants.length} total`, icon: 'groups', color: colors.navy },
          { label: 'Judges', value: `${judges.filter(j => j.status === 'Accepted' || j.rsvp === 'Accepted').length} active`, icon: 'gavel', color: colors.navy },
        ].map(k => (
          <div key={k.label} style={styles.widgetCard(3)}>
            <span style={styles.statLabel}>{k.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '22px', color: k.color }}>{k.icon}</span>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '17px', fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Score Stats ── */}
      <div style={styles.dashboardGrid}>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Scores Submitted</span>
          <div style={styles.statValue}>
            {scoredCount}
            <span style={{ fontSize: '16px', color: colors.inkMuted, marginLeft: '4px' }}>/{displayList.length}</span>
          </div>
          {displayList.length > 0 && (
            <div style={{ marginTop: '10px', height: '5px', background: colors.borderSoft, borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(scoredCount / displayList.length) * 100}%`, background: colors.accent, borderRadius: '100px', transition: 'width 0.5s' }} />
            </div>
          )}
        </div>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Highest Score</span>
          <div style={{ ...styles.statValue, color: highScore != null ? '#16A34A' : colors.inkMuted }}>
            {highScore ?? '—'}
          </div>
          {ranked[0] && highScore != null && (
            <div style={{ marginTop: '10px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>emoji_events</span>
              {ranked[0].name}
            </div>
          )}
        </div>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Average Score</span>
          <div style={{ ...styles.statValue, color: avgScore ? colors.navy : colors.inkMuted }}>{avgScore ?? '—'}</div>
        </div>
        <div style={styles.widgetCard(3)}>
          <span style={styles.statLabel}>Current Leader</span>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: 800, color: colors.navy, marginTop: '10px' }}>
            {ranked[0] && ranked[0].score != null ? ranked[0].name : '—'}
          </div>
          {ranked[0] && ranked[0].score != null && (
            <div style={{ fontSize: '12px', color: colors.inkMuted, marginTop: '4px' }}>{ranked[0].team}</div>
          )}
        </div>
      </div>



      {/* ── Leaderboard Table ── */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={{ ...styles.tableTitle, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.navy }}>leaderboard</span>
            Official Leaderboard
            {isLive && liveToggle && (
              <span style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%', animation: 'blink 1.2s infinite', marginLeft: '4px' }} />
            )}
          </h3>
          <span style={{ fontSize: '12px', color: colors.inkMuted }}>{liveToggle ? 'Auto-refreshing...' : 'Paused'}</span>
        </div>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '70px', textAlign: 'center' }}>Rank</th>
              <th style={styles.th}>Participant</th>
              <th style={styles.th}>Team</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Criteria</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '64px', textAlign: 'center', color: colors.inkMuted }}>
                  No participants added yet.
                </td>
              </tr>
            ) : ranked.map((p, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
              const rankDisplay = p.score != null ? (medal || idx + 1) : '—';
              return (
                <tr key={p.id}
                  style={{ background: hoveredRow === p.id ? colors.pageBg : (idx === 0 && p.score != null ? 'rgba(250,204,21,0.04)' : 'transparent'), transition: 'background 0.2s' }}
                  onMouseEnter={() => setHoveredRow(p.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ ...styles.td, textAlign: 'center', fontWeight: 800, fontSize: idx < 3 && p.score != null ? '20px' : '16px', color: p.score != null ? colors.navy : colors.inkMuted }}>
                    {rankDisplay}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, color: colors.navy }}>
                      <div style={styles.userAvatar(32, 11, idx === 0 && p.score != null ? 'rgba(250,204,21,0.15)' : colors.accentBg, idx === 0 && p.score != null ? '#B45309' : colors.accentDeep)}>
                        {p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{p.name}</div>
                        {isGroupOrTeam && p.members && (
                          <div style={{ fontSize: '11px', fontWeight: 'normal', color: colors.inkMuted, marginTop: '2px' }}>
                            Members: {p.members.map(m => m.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ ...styles.td, fontSize: '13px' }}>
                    {isGroupOrTeam ? `${p.members.length} members` : p.team}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ background: colors.pageBg, color: p.score != null ? colors.success : colors.inkMuted, borderRadius: '100px', padding: '3px 12px', fontSize: '12px', fontWeight: 700 }}>
                      {p.score != null ? 'Scored' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '22px', color: p.score != null ? (idx === 0 ? '#16A34A' : colors.navy) : colors.inkMuted }}>
                    {p.score ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>
      )}
    </>
  );
}


