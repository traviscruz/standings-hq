import React from 'react';
import { useParticipantContext } from './ParticipantLayout';

export default function LeaderboardPage() {
  const { myEvents } = useParticipantContext();
  const activeEvent = myEvents.find(e => e.status === 'Active') || myEvents[0];

  const leaderboardData = [
    { rank: 11, name: 'Gabriela Silang', team: 'Team Alpha', score: 86.4, change: 'up' },
    { rank: 12, name: 'Riley Cruz', team: 'Self', score: 84.5, change: 'none', current: true },
    { rank: 13, name: 'Andres Bonifacio', team: 'Magdiwang', score: 83.2, change: 'down' },
    { rank: 14, name: 'Jose Rizal', team: 'La Solidaridad', score: 82.8, change: 'up' },
    { rank: 15, name: 'Emilio Aguinaldo', team: 'Magdalo', score: 81.5, change: 'down' }
  ];

  return (
    <div className="leaderboard-view">
      <header className="page-header">
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>trending_up</span>
            Live Standings
          </div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-description">Real-time ranking of participants for your active competition: {activeEvent.name}.</p>
        </div>
        <div className="header-actions">
           <select 
             style={{ 
               padding: '10px 16px', 
               borderRadius: '12px', 
               border: '1px solid var(--border)', 
               background: '#fff',
               fontSize: '14px',
               fontWeight: 600,
               color: 'var(--navy)',
               outline: 'none'
             }}
           >
             {myEvents.map(e => (
               <option key={e.id}>{e.name}</option>
             ))}
           </select>
        </div>
      </header>

      <div className="dashboard-grid">
         {/* Live Performance Card */}
         <div className="card col-span-4" style={{ background: 'var(--navy)', color: '#fff' }}>
           <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', opacity: 0.8, marginBottom: '24px' }}>My Live Performance</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-bright)', textTransform: 'uppercase', marginBottom: '8px' }}>Global Rank</div>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>#12 <span style={{ fontSize: '18px', fontWeight: 600, opacity: 0.6 }}>/ 45</span></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-bright)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Score</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>84.50</div>
                 </div>
                 <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-bright)', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Grade</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>9.2 / 10</div>
                 </div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
                 <div style={{ fontSize: '13px', color: '#fff', opacity: 0.9, marginBottom: '12px' }}>Next rank threshold: 86.4</div>
                 <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: 'var(--accent-bright)' }}></div>
                 </div>
              </div>
           </div>
         </div>

         {/* Ranking Table */}
         <div className="card col-span-8" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>Standings</h3>
               <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>Updated 2 mins ago</div>
            </div>

            <table className="leaderboard-table">
               <thead>
                  <tr>
                     <th>Rank</th>
                     <th>Participant</th>
                     <th>Score</th>
                     <th>Trend</th>
                  </tr>
               </thead>
               <tbody>
                  {leaderboardData.map(row => (
                    <tr key={row.rank} style={{ background: row.current ? 'var(--accent-bg)' : 'transparent' }}>
                       <td>
                          <div className={`rank-box rank-${row.rank <= 3 ? row.rank : 'default'}`} style={{ 
                            background: row.rank <= 3 ? '' : 'var(--page-bg)', 
                            color: row.rank <= 3 ? '' : 'var(--navy)'
                          }}>
                             {row.rank}
                          </div>
                       </td>
                       <td>
                          <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--navy)' }}>{row.name} {row.current && <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, background: 'var(--accent-muted)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>YOU</span>}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{row.team}</div>
                       </td>
                       <td style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '16px' }}>{row.score.toFixed(2)}</td>
                       <td>
                          <span className="material-symbols-rounded" style={{ 
                            color: row.change === 'up' ? 'var(--sage)' : row.change === 'down' ? 'var(--coral)' : 'var(--ink-muted)',
                            fontSize: '20px'
                          }}>
                             {row.change === 'up' ? 'trending_up' : row.change === 'down' ? 'trending_down' : 'remove'}
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            
            <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid var(--border-soft)' }}>
               <button className="btn-outline" style={{ fontSize: '13px', padding: '10px 24px' }}>Load more rankings</button>
            </div>
         </div>
      </div>
    </div>
  );
}
