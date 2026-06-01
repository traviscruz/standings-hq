import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { API_URL as API_BASE } from '../../config';

export default function MyEventsPage() {
  const { myEvents, acceptInvitation, declineInvitation } = useParticipantContext();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [eventStats, setEventStats] = useState({});

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const registeredEventsList = myEvents.filter(e => e.registrationStatus === 'Registered');
    if (registeredEventsList.length === 0) return;

    const myEmail = localStorage.getItem('email')?.toLowerCase();
    if (!myEmail) return;

    registeredEventsList.forEach(async (event) => {
      try {
        if (event.competition_mode === 'game' || event.competition_mode === 'sports') {
          const setupEndpoint = event.competition_mode === 'sports' ? 'sports' : 'game';
          const [setupRes, bracketsRes, participantsRes] = await Promise.all([
            fetch(`${API_BASE}/${setupEndpoint}/setup?event_id=${event.id}`).then(res => res.json()),
            fetch(`${API_BASE}/${setupEndpoint}/brackets?event_id=${event.id}`).then(res => res.json()),
            fetch(`${API_BASE}/participants?event_id=${event.id}`).then(res => res.json())
          ]);

          if (setupRes.success && bracketsRes.success && participantsRes.success) {
            const gameSetup = setupRes.data;
            const matches = bracketsRes.data || [];
            const participantsList = participantsRes.data || [];

            // Group participants by team
            const teamsMap = {};
            const teamsList = gameSetup?.config?.teams || [];
            teamsList.forEach(t => {
              teamsMap[t.name] = {
                name: t.name,
                members: [],
                score: 0,
                winsCount: 0,
                matchesPlayed: 0,
                hasMe: false
              };
            });

            const registeredParticipants = participantsList.filter(p => p.status === 'Registered');
            registeredParticipants.forEach(p => {
              const teamName = p.team?.trim() || p.name?.trim() || 'Independent';
              if (!teamsMap[teamName]) {
                teamsMap[teamName] = {
                  name: teamName,
                  members: [],
                  score: 0,
                  winsCount: 0,
                  matchesPlayed: 0,
                  hasMe: false
                };
              }
              teamsMap[teamName].members.push(p);
              if (p.email?.toLowerCase() === myEmail) {
                teamsMap[teamName].hasMe = true;
              }
            });

            // Calculate matches/wins
            matches.forEach(m => {
              if (m.status === 'completed' && m.winner) {
                if (teamsMap[m.winner]) {
                  teamsMap[m.winner].winsCount += 1;
                  teamsMap[m.winner].score += 1;
                }
              }
              if (m.team_a && m.team_a !== 'BYE') {
                if (teamsMap[m.team_a] && m.status === 'completed') {
                  teamsMap[m.team_a].matchesPlayed += 1;
                }
              }
              if (m.team_b && m.team_b !== 'BYE') {
                if (teamsMap[m.team_b] && m.status === 'completed') {
                  teamsMap[m.team_b].matchesPlayed += 1;
                }
              }
            });

            const sortedStandings = Object.values(teamsMap)
              .sort((a, b) => {
                if (b.score !== a.score) {
                  return b.score - a.score;
                }
                const tbWinner = gameSetup?.config?.tieBreakerWinner;
                if (tbWinner) {
                  if (a.name === tbWinner) return -1;
                  if (b.name === tbWinner) return 1;
                }
                return b.matchesPlayed - a.matchesPlayed;
              });

            const myTeamIndex = sortedStandings.findIndex(t => t.hasMe);
            if (myTeamIndex !== -1) {
              const myTeamData = sortedStandings[myTeamIndex];
              setEventStats(prev => ({
                ...prev,
                [event.id]: {
                  rank: myTeamIndex + 1,
                  score: myTeamData.winsCount
                }
              }));
            }
          }
        } else {
          // Standard Rubric Event
          const rubricRes = await fetch(`${API_BASE}/participants?event_id=${event.id}`).then(res => res.json());
          if (rubricRes.success) {
            const participantsList = rubricRes.data || [];
            const registeredParticipants = participantsList.filter(p => p.status === 'Registered');

            const sortedParticipants = [...registeredParticipants].sort((a, b) => {
              const scoreA = a.score !== null && a.score !== undefined ? Number(a.score) : 0;
              const scoreB = b.score !== null && b.score !== undefined ? Number(b.score) : 0;
              return scoreB - scoreA;
            });

            const myParticipantIndex = sortedParticipants.findIndex(p => p.email?.toLowerCase() === myEmail);
            if (myParticipantIndex !== -1) {
              const myPart = sortedParticipants[myParticipantIndex];
              const hasScore = myPart.score !== null && myPart.score !== undefined;
              setEventStats(prev => ({
                ...prev,
                [event.id]: {
                  rank: hasScore ? myParticipantIndex + 1 : null,
                  score: hasScore ? Number(myPart.score) : null
                }
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching event stats in MyEventsPage:', err);
      }
    });
  }, [myEvents]);

  const filteredEvents = myEvents
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    .filter(e => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return e.status === 'Active' && e.registrationStatus === 'Registered';
      if (activeTab === 'upcoming') return e.status === 'Upcoming';
      if (activeTab === 'past') return e.status === 'Completed' && e.registrationStatus === 'Registered';
      return true;
    });

  const isMobile = windowWidth <= 768;

  const pageHeaderStyle = {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexDirection: isMobile ? 'column' : 'row',
  };

  const pageTitleStyle = {
    fontSize: isMobile ? '26px' : '32px',
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '8px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const pageDescriptionStyle = {
    color: colors.inkMuted,
    fontSize: '15px',
    maxWidth: '600px',
    lineHeight: '1.55',
  };

  const cardStyle = {
    background: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
    overflow: 'hidden',
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Active': return { background: 'rgba(59, 130, 246, 0.08)', color: colors.accentDeep };
      case 'Completed': return { background: 'rgba(16, 185, 129, 0.1)', color: colors.success };
      case 'Upcoming': return { background: 'rgba(245, 158, 11, 0.1)', color: colors.warning };
      default: return {};
    }
  };

  const getRegistrationBadgeStyle = (status) => {
    switch (status) {
      case 'Registered': return { background: 'rgba(16, 185, 129, 0.08)', color: colors.success || '#10B981' };
      case 'Pending': return { background: 'rgba(245, 158, 11, 0.08)', color: colors.warning || '#F59E0B' };
      default: return { background: 'rgba(16, 185, 129, 0.08)', color: colors.success || '#10B981' };
    }
  };

  return (
    <div className="slide-up-anim">
      <style>
        {`
          .action-btn-success {
            background: ${colors.success || '#10B981'};
            color: #fff;
            padding: 8px 16px;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 12px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .action-btn-success:hover {
            filter: brightness(0.9);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          }
          .action-btn-danger {
            background: transparent;
            color: ${colors.error || '#EF4444'};
            padding: 8px 16px;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 12px;
            font-weight: 600;
            border: 1px solid ${colors.error || '#EF4444'};
            cursor: pointer;
            transition: all 0.2s;
          }
          .action-btn-danger:hover {
            background: rgba(239, 68, 68, 0.05);
            transform: translateY(-1px);
          }
        `}
      </style>

      <header style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>My Events</h1>
          <p style={pageDescriptionStyle}>Manage and view all events you are currently registered for, past and future.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        <div style={{ ...cardStyle, gridColumn: 'span 12' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '16px' : '20px 24px',
            borderBottom: `1px solid ${colors.borderSoft}`,
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
               {[
                 { id: 'all', label: 'All' },
                 { id: 'active', label: 'Active' },
                 { id: 'upcoming', label: 'Upcoming' },
                 { id: 'past', label: 'Past' }
               ].map(f => {
                 const isActive = activeTab === f.id;
                 return (
                   <button 
                     key={f.id}
                     onClick={() => setActiveTab(f.id)}
                     style={{ 
                       padding: '6px 14px', 
                       border: 'none', 
                       borderRadius: '100px',
                       background: isActive ? colors.navy : 'transparent', 
                       color: isActive ? '#fff' : colors.inkMuted, 
                       fontWeight: 600, 
                       fontSize: '13px', 
                       cursor: 'pointer',
                       transition: 'all 0.2s',
                       whiteSpace: 'nowrap'
                     }}
                   >
                     {f.label}
                   </button>
                 );
               })}
            </div>
            
            <div style={{ position: 'relative', width: isMobile ? '100%' : '240px' }}>
                <span className="material-symbols-rounded" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: colors.inkMuted }}>search</span>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '8px 12px 8px 38px', 
                    borderRadius: '100px', 
                    height: '40px',
                    border: `1px solid ${colors.border}`,
                    outline: 'none',
                    fontSize: '13.5px',
                    fontFamily: 'inherit',
                    background: '#fff',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = colors.accent; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
                />
            </div>
          </div>

          <div style={{ padding: 0 }}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => {
                const regStatus = event.registrationStatus || 'Registered';
                return (
                  <div 
                    key={event.id} 
                    style={{ 
                        padding: isMobile ? '20px' : '24px 32px', 
                        display: 'flex', 
                        alignItems: isMobile ? 'flex-start' : 'center', 
                        gap: '20px', 
                        borderBottom: `1px solid ${colors.borderSoft}`,
                        background: hoveredEvent === event.id ? '#F8FAFC' : 'transparent',
                        transition: 'background 0.2s',
                        flexDirection: isMobile ? 'column' : 'row'
                    }}
                    onMouseEnter={() => setHoveredEvent(event.id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    <div style={{ 
                        width: '54px', height: '54px', 
                        borderRadius: '12px', 
                        background: event.status === 'Active' ? colors.accent : colors.navy, 
                        color: '#fff', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>{event.date.split(' ')[1]?.replace(',', '') || 'TBD'}</div>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, marginTop: '2px' }}>{event.date.split(' ')[0] || ''}</div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.navy, margin: 0 }}>{event.name}</h3>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '100px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              textTransform: 'uppercase',
                              ...getBadgeStyle(event.status)
                          }}>
                            {event.status}
                          </span>
                          
                          <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '100px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              ...getRegistrationBadgeStyle(regStatus)
                          }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>
                              {regStatus === 'Registered' ? 'check_circle' : 'pending'}
                            </span>
                            {regStatus === 'Registered' ? 'Registered' : 'Pending Invitation'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: colors.inkMuted, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '16px' }}>category</span> {event.type}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '16px' }}>location_on</span> Online</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-rounded" style={{ fontSize: '16px' }}>schedule</span> Dec 05 - Dec 06</span>
                      </div>
                    </div>

                    <div style={{ 
                        textAlign: isMobile ? 'left' : 'right', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '24px',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: isMobile ? 'space-between' : 'flex-end',
                        marginTop: isMobile ? '12px' : '0'
                    }}>
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                         <div style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase' }}>Rank</div>
                         <div style={{ fontSize: '18px', fontWeight: 800, color: colors.navy }}>
                           {regStatus === 'Pending' ? '-' : (eventStats[event.id]?.rank != null ? `#${eventStats[event.id].rank}` : '—')}
                         </div>
                      </div>
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                         <div style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase' }}>{(event.competition_mode === 'game' || event.competition_mode === 'sports') ? 'Wins' : 'Score'}</div>
                         <div style={{ fontSize: '18px', fontWeight: 800, color: colors.navy }}>
                           {regStatus === 'Pending' ? '-' : (
                             eventStats[event.id]?.score != null
                               ? ((event.competition_mode === 'game' || event.competition_mode === 'sports') ? eventStats[event.id].score : eventStats[event.id].score.toFixed(1))
                               : '—'
                           )}
                         </div>
                      </div>
                      
                      {regStatus === 'Pending' ? (
                        !isMobile && (
                          <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                            <button
                              onClick={() => acceptInvitation(event.registrationId)}
                              className="action-btn-success"
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check_circle</span>
                              Accept
                            </button>
                            <button
                              onClick={() => declineInvitation(event.registrationId)}
                              className="action-btn-danger"
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>cancel</span>
                              Decline
                            </button>
                          </div>
                        )
                      ) : (
                        !isMobile && (
                          <div style={{ marginLeft: '12px' }}>
                            <Link 
                              to="/participant/leaderboard" 
                              style={{ 
                                  padding: '8px 16px', 
                                  fontSize: '13px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  borderRadius: '12px',
                                  fontWeight: '600',
                                  color: colors.navy,
                                  border: `1px solid ${colors.border}`,
                                  textDecoration: 'none',
                                  transition: 'all 0.2s',
                                  background: '#fff'
                              }}
                              onMouseEnter={(e) => { e.target.style.background = colors.offWhite; e.target.style.borderColor = colors.navy; }}
                              onMouseLeave={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = colors.border; }}
                            >
                              View Details
                            </Link>
                          </div>
                        )
                      )}
                    </div>

                    {isMobile && regStatus === 'Pending' && (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '12px' }}>
                        <button
                          onClick={() => acceptInvitation(event.registrationId)}
                          className="action-btn-success"
                          style={{ flex: 1, justifyContent: 'center', height: '40px' }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check_circle</span>
                          Accept
                        </button>
                        <button
                          onClick={() => declineInvitation(event.registrationId)}
                          className="action-btn-danger"
                          style={{ flex: 1, justifyContent: 'center', height: '40px' }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>cancel</span>
                          Decline
                        </button>
                      </div>
                    )}

                    {isMobile && regStatus !== 'Pending' && (
                        <Link 
                          to="/participant/leaderboard" 
                          style={{ 
                              padding: '10px', 
                              fontSize: '13px',
                              display: 'flex',
                              width: '100%',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '8px',
                              borderRadius: '12px',
                              fontWeight: '600',
                              color: colors.navy,
                              border: `1px solid ${colors.border}`,
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              background: '#fff',
                              marginTop: '4px'
                          }}
                        >
                          View Details
                        </Link>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '56px', color: colors.border, marginBottom: '20px', display: 'block' }}>event_available</span>
                <p style={{ fontSize: '16px', color: colors.inkSoft, fontWeight: 600 }}>No events found for "{activeTab}".</p>
                <p style={{ fontSize: '14px', color: colors.inkMuted, marginTop: '8px' }}>Join events from your invitations or through public discovery.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
