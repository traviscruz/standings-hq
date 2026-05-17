import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { colors } from '../../styles/colors';
import { API_URL as API_BASE } from '../../config';

export default function LeaderboardPage() {
  const { myEvents } = useParticipantContext();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const registeredEvents = myEvents.filter(e => e.registrationStatus === 'Registered');
  
  // Find default active or first event
  const activeEvent = registeredEvents.find(e => e.status === 'Active') || registeredEvents[0];
  
  const [selectedEventId, setSelectedEventId] = useState(activeEvent?.id);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = windowWidth <= 768;

  const currentEvent = registeredEvents.find(e => e.id === selectedEventId) || activeEvent;
  const myEmail = localStorage.getItem('email');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync selectedEventId if activeEvent resolves later
  useEffect(() => {
    if (activeEvent && !selectedEventId) {
      setSelectedEventId(activeEvent.id);
    }
  }, [activeEvent, selectedEventId]);

  // Fetch participant list for selected event
  useEffect(() => {
    if (!selectedEventId) return;

    setLoading(true);
    fetch(`${API_BASE}/participants?event_id=${selectedEventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setParticipants(data.data || []);
        }
      })
      .catch(err => console.error('Error fetching participants:', err))
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  if (!currentEvent) {
    return (
      <div className="slide-up-anim" style={{ padding: '60px 20px', textAlign: 'center', color: colors.inkMuted }}>
        <span className="material-symbols-rounded" style={{ fontSize: '64px', color: colors.border, marginBottom: '20px' }}>event_busy</span>
        <h2 style={{ color: colors.navy, marginBottom: '12px' }}>No Events Found</h2>
        <p style={{ maxWidth: '400px', margin: '0 auto' }}>You need to be registered in an active event to view the leaderboard standings.</p>
      </div>
    );
  }

  // Calculate live ranking standings
  const registeredParticipants = participants
    .filter(p => p.status === 'Registered')
    .sort((a, b) => {
      const scoreA = a.score !== null && a.score !== undefined ? Number(a.score) : 0;
      const scoreB = b.score !== null && b.score !== undefined ? Number(b.score) : 0;
      return scoreB - scoreA; // Descending score
    });

  const leaderboardData = registeredParticipants.map((p, idx) => ({
    rank: idx + 1,
    name: p.name,
    team: p.team || 'Individual',
    score: p.score !== null && p.score !== undefined ? Number(p.score) : 0,
    change: 'none',
    current: p.email?.toLowerCase() === myEmail?.toLowerCase()
  }));

  // Find currently logged-in participant's performance stats
  const myPerf = leaderboardData.find(row => row.current);
  const nextPerson = myPerf && myPerf.rank > 1 ? leaderboardData[myPerf.rank - 2] : null;
  const progressPercent = myPerf && nextPerson ? Math.min(100, Math.max(0, (myPerf.score / nextPerson.score) * 100)) : 0;

  const pageHeaderStyle = {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexDirection: isMobile ? 'column' : 'row',
  };

  const eyebrowBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: 'rgba(59, 130, 246, 0.08)',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '800',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
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

  const cardStyle = (id) => ({
    background: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(26,24,20,0.06)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  });

  const getColSpanStyle = (span) => {
    if (isMobile) return { gridColumn: 'span 12' };
    return { gridColumn: `span ${span}` };
  };

  const getRankBoxStyle = (rank) => {
    const base = {
      width: '28px', height: '28px',
      display: 'grid', placeItems: 'center',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '13px',
    };
    if (rank === 1) return { ...base, background: '#FEF3C7', color: '#92400E' };
    if (rank === 2) return { ...base, background: '#F1F5F9', color: '#475569' };
    if (rank === 3) return { ...base, background: '#FFEDD5', color: '#9A3412' };
    return { ...base, background: '#F8FAFC', color: colors.navy };
  };

  return (
    <div className="slide-up-anim">
      <header style={pageHeaderStyle}>
        <div>
          <div style={eyebrowBadgeStyle}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>trending_up</span>
            Live Standings
          </div>
          <h1 style={pageTitleStyle}>Leaderboard</h1>
          <p style={pageDescriptionStyle}>Real-time ranking of participants for your competition: {currentEvent.name}.</p>
        </div>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
           <select 
             value={selectedEventId || ''}
             onChange={(e) => setSelectedEventId(e.target.value)}
             style={{ 
               padding: '10px 16px', 
               borderRadius: '12px', 
               border: `1px solid ${colors.border}`, 
               background: '#fff',
               fontSize: '14px',
               fontWeight: 600,
               color: colors.navy,
               outline: 'none',
               width: isMobile ? '100%' : 'auto',
               cursor: 'pointer'
             }}
           >
             {registeredEvents.map(e => (
               <option key={e.id} value={e.id}>{e.name}</option>
             ))}
           </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
         {/* Live Performance Card */}
         <div style={{ ...cardStyle('perf'), ...getColSpanStyle(4), background: colors.navy, color: '#fff', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', opacity: 0.8, marginBottom: '24px', marginTop: 0 }}>My Live Performance</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
               <div>
                 <div style={{ fontSize: '11px', fontWeight: 700, color: colors.accentBright, textTransform: 'uppercase', marginBottom: '8px' }}>Global Rank</div>
                 {myPerf ? (
                   <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>#{myPerf.rank} <span style={{ fontSize: '18px', fontWeight: 600, opacity: 0.6 }}>/ {leaderboardData.length}</span></div>
                 ) : (
                   <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>— <span style={{ fontSize: '18px', fontWeight: 600, opacity: 0.6 }}>/ {leaderboardData.length}</span></div>
                 )}
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                     <div style={{ fontSize: '11px', fontWeight: 700, color: colors.accentBright, textTransform: 'uppercase', marginBottom: '8px' }}>Total Score</div>
                     <div style={{ fontSize: '24px', fontWeight: 700 }}>{myPerf ? myPerf.score.toFixed(1) : '0.0'}</div>
                  </div>
                  <div>
                     <div style={{ fontSize: '11px', fontWeight: 700, color: colors.accentBright, textTransform: 'uppercase', marginBottom: '8px' }}>Avg Grade</div>
                     <div style={{ fontSize: '24px', fontWeight: 700 }}>{myPerf ? `${(myPerf.score / 10).toFixed(1)} / 10` : '—'}</div>
                  </div>
               </div>
               
               <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
                  {nextPerson ? (
                    <>
                      <div style={{ fontSize: '13px', color: '#fff', opacity: 0.9, marginBottom: '12px' }}>Next rank threshold: {nextPerson.score.toFixed(1)}</div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                         <div style={{ width: `${progressPercent}%`, height: '100%', background: colors.accentBright }}></div>
                      </div>
                    </>
                  ) : myPerf && myPerf.rank === 1 ? (
                    <div style={{ fontSize: '13px', color: '#fff', opacity: 0.9, fontWeight: '700' }}>You are leading the board! 🎉</div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#fff', opacity: 0.7 }}>No evaluation scores yet.</div>
                  )}
               </div>
            </div>
          </div>

          {/* Ranking Table */}
          <div style={{ ...cardStyle('table'), ...getColSpanStyle(8), padding: 0 }}>
             <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: colors.navy, fontFamily: "'DM Sans', system-ui, sans-serif", margin: 0 }}>Standings</h3>
                <div style={{ fontSize: '13px', color: colors.inkMuted }}>Live Standings Dashboard</div>
             </div>

             <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                       <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Rank</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Participant</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Score</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Trend</th>
                       </tr>
                    </thead>
                    <tbody>
                       {loading ? (
                         <tr>
                           <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: colors.inkMuted }}>
                              <span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite', fontSize: '24px', display: 'block', marginBottom: '8px' }}>progress_activity</span>
                              Loading standings...
                              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                           </td>
                         </tr>
                       ) : leaderboardData.length === 0 ? (
                         <tr>
                           <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: colors.inkMuted }}>
                              No registered participants found.
                           </td>
                         </tr>
                       ) : (
                         leaderboardData.map(row => (
                           <tr key={row.rank} style={{ borderBottom: `1px solid ${colors.borderSoft}`, background: row.current ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                              <td style={{ padding: '16px' }}>
                                 <div style={getRankBoxStyle(row.rank)}>
                                    {row.rank}
                                 </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                 <div style={{ fontSize: '14.5px', fontWeight: 700, color: colors.navy }}>{row.name} {row.current && <span style={{ fontSize: '10px', color: colors.accent, fontWeight: 800, background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>YOU</span>}</div>
                                 <div style={{ fontSize: '12px', color: colors.inkMuted }}>{row.team}</div>
                              </td>
                              <td style={{ padding: '16px', fontWeight: 800, color: colors.navy, fontSize: '16px' }}>{row.score.toFixed(1)}</td>
                              <td style={{ padding: '16px' }}>
                                 <span className="material-symbols-rounded" style={{ 
                                   color: colors.inkMuted,
                                   fontSize: '20px'
                                 }}>
                                    remove
                                 </span>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
             </div>
          </div>
      </div>
    </div>
  );
}
