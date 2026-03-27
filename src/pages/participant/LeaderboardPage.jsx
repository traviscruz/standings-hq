import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { colors } from '../../styles/colors';

export default function LeaderboardPage() {
  const { myEvents } = useParticipantContext();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const activeEvent = myEvents.find(e => e.status === 'Active') || myEvents[0];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const leaderboardData = [
    { rank: 11, name: 'Gabriela Silang', team: 'Team Alpha', score: 86.4, change: 'up' },
    { rank: 12, name: 'Riley Cruz', team: 'Self', score: 84.5, change: 'none', current: true },
    { rank: 13, name: 'Andres Bonifacio', team: 'Magdiwang', score: 83.2, change: 'down' },
    { rank: 14, name: 'Jose Rizal', team: 'La Solidaridad', score: 82.8, change: 'up' },
    { rank: 15, name: 'Emilio Aguinaldo', team: 'Magdalo', score: 81.5, change: 'down' }
  ];

  const isMobile = windowWidth <= 768;

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
          <p style={pageDescriptionStyle}>Real-time ranking of participants for your active competition: {activeEvent.name}.</p>
        </div>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
           <select 
             style={{ 
               padding: '10px 16px', 
               borderRadius: '12px', 
               border: `1px solid ${colors.border}`, 
               background: '#fff',
               fontSize: '14px',
               fontWeight: 600,
               color: colors.navy,
               outline: 'none',
               width: isMobile ? '100%' : 'auto'
             }}
           >
             {myEvents.map(e => (
               <option key={e.id}>{e.name}</option>
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
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>#12 <span style={{ fontSize: '18px', fontWeight: 600, opacity: 0.6 }}>/ 45</span></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: colors.accentBright, textTransform: 'uppercase', marginBottom: '8px' }}>Total Score</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>84.50</div>
                 </div>
                 <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: colors.accentBright, textTransform: 'uppercase', marginBottom: '8px' }}>Avg Grade</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>9.2 / 10</div>
                 </div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
                 <div style={{ fontSize: '13px', color: '#fff', opacity: 0.9, marginBottom: '12px' }}>Next rank threshold: 86.4</div>
                 <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: colors.accentBright }}></div>
                 </div>
              </div>
           </div>
         </div>

         {/* Ranking Table */}
         <div style={{ ...cardStyle('table'), ...getColSpanStyle(8), padding: 0 }}>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 800, color: colors.navy, fontFamily: "'DM Sans', system-ui, sans-serif", margin: 0 }}>Standings</h3>
               <div style={{ fontSize: '13px', color: colors.inkMuted }}>Updated 2 mins ago</div>
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
                      {leaderboardData.map(row => (
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
                           <td style={{ padding: '16px', fontWeight: 800, color: colors.navy, fontSize: '16px' }}>{row.score.toFixed(2)}</td>
                           <td style={{ padding: '16px' }}>
                              <span className="material-symbols-rounded" style={{ 
                                color: row.change === 'up' ? colors.success : row.change === 'down' ? colors.error : colors.inkMuted,
                                fontSize: '20px'
                              }}>
                                 {row.change === 'up' ? 'trending_up' : row.change === 'down' ? 'trending_down' : 'remove'}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
            </div>
            
            <div style={{ padding: '20px', textAlign: 'center', borderTop: `1px solid ${colors.borderSoft}` }}>
               <button 
                style={{ 
                    padding: '10px 24px', 
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
                    background: '#fff',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = colors.navy; }}
                onMouseLeave={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = colors.border; }}
               >
                   Load more rankings
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

