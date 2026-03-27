import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { colors } from '../../styles/colors';

export default function AcceptInvitePage() {
  const { invitations, acceptInvitation, declineInvitation } = useParticipantContext();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const handleAction = (id, action) => {
    if (action === 'accept') {
      acceptInvitation(id);
    } else {
      declineInvitation(id);
    }
  };

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
    border: `1px solid ${hoveredCard === id ? colors.border : colors.borderSoft}`,
    borderRadius: '20px',
    padding: isMobile ? '20px' : '24px',
    boxShadow: hoveredCard === id ? '0 10px 15px -3px rgba(0, 0, 0, 0.05)' : 'none',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    transform: hoveredCard === id ? 'translateY(-2px)' : 'none',
    display: 'flex',
    gap: '16px',
    flexDirection: isMobile ? 'column' : 'row',
  });

  const btnPrimaryStyle = {
    background: colors.navy,
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    fontSize: '13px'
  };

  const btnOutlineStyle = {
    background: '#fff',
    color: colors.navy,
    padding: '10px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    fontSize: '13px'
  };

  return (
    <div className="slide-up-anim">
      <header style={pageHeaderStyle}>
        <div>
          <div style={eyebrowBadgeStyle}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>mail</span>
            Invitation Hub
          </div>
          <h1 style={pageTitleStyle}>Event Invitations</h1>
          <p style={pageDescriptionStyle}>You have {invitations.length} pending invitations from organizers. Accept or decline them to manage your event roster.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {invitations.length === 0 ? (
          <div style={{ ...cardStyle('empty'), textAlign: 'center', padding: '60px', gridColumn: '1 / -1', flexDirection: 'column', alignItems: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '56px', color: colors.border, marginBottom: '20px', display: 'block' }}>mail_outline</span>
            <p style={{ fontSize: '16px', color: colors.inkSoft, fontWeight: 600, margin: 0 }}>No pending invitations.</p>
            <p style={{ fontSize: '14px', color: colors.inkMuted, marginTop: '8px', margin: '8px 0 0 0' }}>Keep an eye on this space for new event opportunities!</p>
          </div>
        ) : (
          invitations.map(invite => (
            <div 
                key={invite.id} 
                style={cardStyle(invite.id)}
                onMouseEnter={() => setHoveredCard(invite.id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: colors.offWhite, color: colors.navy,
                display: 'grid', placeItems: 'center', flexShrink: 0,
                border: `1px solid ${colors.borderSoft}`
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>event_note</span>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '12px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: colors.navy, fontFamily: "'DM Sans', system-ui, sans-serif", margin: 0 }}>{invite.eventName}</h3>
                  <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '100px', 
                      fontSize: '10px', 
                      fontWeight: '700', 
                      textTransform: 'uppercase',
                      background: '#FEF3C7',
                      color: '#92400E'
                  }}>{invite.type}</span>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: colors.inkMuted }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>person</span>
                    By <span style={{ color: colors.navy, fontWeight: 600 }}>{invite.organizer}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: colors.inkMuted }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>calendar_today</span>
                    <span style={{ color: colors.navy, fontWeight: 600 }}>{invite.date}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    style={btnPrimaryStyle} 
                    onClick={() => handleAction(invite.id, 'accept')}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 31, 61, 0.15)'; e.currentTarget.style.background = '#1a3a6a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = colors.navy; }}
                  >
                    Accept
                  </button>
                  <button 
                    style={btnOutlineStyle} 
                    onClick={() => handleAction(invite.id, 'decline')}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = colors.navy; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = colors.border; }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

