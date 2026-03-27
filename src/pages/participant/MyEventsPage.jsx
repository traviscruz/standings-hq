import React, { useState } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { Link } from 'react-router-dom';

export default function MyEventsPage() {
  const { myEvents } = useParticipantContext();
  const [activeTab, setActiveTab] = useState('All Events');

  const filteredEvents = myEvents.filter(e => {
    if (activeTab === 'All Events') return true;
    return e.status === activeTab;
  });

  return (
    <div className="events-view">
      <header className="page-header">
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-description">Manage and view all events you are currently registered for, past and future.</p>
        </div>
        <div className="header-actions">
           <button className="btn-outline">
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>history</span>
            Archive
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="card col-span-12" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', padding: '0 24px' }}>
             {['All Events', 'Active', 'Upcoming', 'Completed'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 style={{ 
                   padding: '20px 0', 
                   border: 'none', 
                   background: 'none', 
                   color: activeTab === tab ? 'var(--accent)' : 'var(--ink-muted)', 
                   borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', 
                   fontWeight: activeTab === tab ? 700 : 600, 
                   fontSize: '14px', 
                   marginRight: '32px', 
                   cursor: 'pointer',
                   transition: 'all 0.2s'
                 }}
               >
                 {tab === 'Active' ? 'Live Now' : tab}
               </button>
             ))}
          </div>

          <div style={{ padding: 0 }}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div key={event.id} className="event-item-card" style={{ padding: '24px 32px' }}>
                  <div className="event-date-box" style={{ background: event.status === 'Active' ? 'var(--accent)' : 'var(--navy)' }}>
                    <div className="date-day">{event.date.split(' ')[1].replace(',', '')}</div>
                    <div className="date-month">{event.date.split(' ')[0]}</div>
                  </div>
                  
                  <div className="event-item-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 className="event-item-name">{event.name}</h3>
                      <span className={`badge ${event.status === 'Active' ? 'badge-blue' : event.status === 'Completed' ? 'badge-green' : 'badge-gold'}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="event-item-meta">
                      <span><span className="material-symbols-rounded">category</span> {event.type}</span>
                      <span><span className="material-symbols-rounded">location_on</span> Online</span>
                      <span><span className="material-symbols-rounded">schedule</span> Dec 05 - Dec 06</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Rank</div>
                       <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>{event.rank}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Score</div>
                       <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>{event.score}</div>
                    </div>
                    
                    <div style={{ marginLeft: '12px' }}>
                      <Link to="/participant/leaderboard" className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>View Details</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '56px', color: 'var(--border)', marginBottom: '20px', display: 'block' }}>event_available</span>
                <p style={{ fontSize: '16px', color: 'var(--ink-soft)', fontWeight: 600 }}>No events found for "{activeTab}".</p>
                <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginTop: '8px' }}>Join events from your invitations or through public discovery.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
