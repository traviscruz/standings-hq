import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function MyEventsPage() {
  const { myEvents } = useParticipantContext();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredEvents = myEvents
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    .filter(e => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return e.status === 'Active';
      if (activeTab === 'upcoming') return e.status === 'Upcoming';
      if (activeTab === 'past') return e.status === 'Completed';
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

  return (
    <div className="slide-up-anim">
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
              filteredEvents.map(event => (
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
                    <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>{event.date.split(' ')[1].replace(',', '')}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, marginTop: '2px' }}>{event.date.split(' ')[0]}</div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.navy, margin: 0 }}>{event.name}</h3>
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
                       <div style={{ fontSize: '18px', fontWeight: 800, color: colors.navy }}>{event.rank}</div>
                    </div>
                    <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                       <div style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase' }}>Score</div>
                       <div style={{ fontSize: '18px', fontWeight: 800, color: colors.navy }}>{event.score}</div>
                    </div>
                    
                    {!isMobile && (
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
                    )}
                  </div>
                  {isMobile && (
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
              ))
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

