import React, { useState, useEffect } from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

// Template data from Organizer Certificate Builder for uniformity
const BORDER_TEMPLATES = [
  { id: 'classic',   name: 'Classic Gold',    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '#D4AF37', accent: '#D4AF37' },
  { id: 'navy',      name: 'Navy Royal',      bg: 'linear-gradient(135deg, #0F1F3D 0%, #1A3460 100%)', border: 'rgba(59,130,246,0.8)', accent: '#60A5FA' },
];

const MiniCertificate = ({ achievement, eventName }) => {
  const template = achievement === 'Champion' ? BORDER_TEMPLATES[0] : BORDER_TEMPLATES[1];
  
  return (
    <div style={{ 
      background: template.bg, 
      padding: '16px', 
      border: `2px solid ${template.border}`, 
      borderRadius: '12px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      position: 'relative',
      height: '160px',
      overflow: 'hidden'
    }}>
      <div style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: template.accent, marginBottom: '6px' }}>
        Certificate
      </div>
      <div style={{ fontSize: '12px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, color: '#fff', margin: '4px 0', borderBottom: `1px solid ${template.border}`, paddingBottom: '4px' }}>
        {achievement}
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
        {eventName}
      </div>
      <div style={{ position: 'absolute', bottom: '8px', right: '8px', opacity: 0.3 }}>
         <span className="material-symbols-rounded" style={{ fontSize: '18px', color: '#fff' }}>verified_user</span>
      </div>
    </div>
  );
};

export default function ParticipantDashboard() {
  const { myEvents, invitations, certificates } = useParticipantContext();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredCard, setHoveredCard] = useState(null); // id or type

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeEvents = myEvents.filter(e => e.status === 'Active');
  const isMobile = windowWidth <= 768;

  const getColSpanStyle = (span) => {
    if (isMobile) return { gridColumn: 'span 12' };
    return { gridColumn: `span ${span}` };
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
    padding: '24px',
    boxShadow: hoveredCard === id ? '0 10px 15px -3px rgba(0, 0, 0, 0.05)' : 'none',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    transform: hoveredCard === id ? 'translateY(-2px)' : 'none',
  });

  const statLabelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
  };

  const statValueStyle = {
    fontSize: '32px',
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: '-0.02em',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const statMetaStyle = {
    fontSize: '13px',
    color: colors.inkMuted,
    marginTop: '8px',
  };

  const badgeStyle = {
    padding: '4px 10px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: colors.accentBg,
    color: colors.accentDeep,
    marginBottom: '8px',
    display: 'inline-block',
  };

  return (
    <div className="slide-up-anim">
      <header style={pageHeaderStyle}>
        <div>
          <div style={eyebrowBadgeStyle}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>waving_hand</span>
            Welcome back, Riley!
          </div>
          <h1 style={pageTitleStyle}>Participant Dashboard</h1>
          <p style={pageDescriptionStyle}>Your competition journey at a glance. All live scores, upcoming events, and achievements.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        {/* Quick Stats */}
        <div 
          style={{ ...cardStyle('stat-1'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-1')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={statLabelStyle}>Joined Events</div>
          <div style={statValueStyle}>{myEvents.length}</div>
          <div style={statMetaStyle}>Across {new Set(myEvents.map(e => e.type)).size} categories</div>
        </div>
        <div 
          style={{ ...cardStyle('stat-2'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-2')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={statLabelStyle}>Active Events</div>
          <div style={{ ...statValueStyle, color: colors.accent }}>{activeEvents.length}</div>
          <div style={statMetaStyle}>In progress right now</div>
        </div>
        <div 
          style={{ ...cardStyle('stat-3'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-3')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={statLabelStyle}>Certificates</div>
          <div style={{ ...statValueStyle, color: colors.success }}>{certificates.length}</div>
          <div style={statMetaStyle}>Verified achievements</div>
        </div>
        <div 
          style={{ ...cardStyle('stat-4'), ...getColSpanStyle(3) }}
          onMouseEnter={() => setHoveredCard('stat-4')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={statLabelStyle}>Pending Invites</div>
          <div style={{ ...statValueStyle, color: colors.error }}>{invitations.length}</div>
          <div style={statMetaStyle}>Waiting for your response</div>
        </div>

        {/* Currently Participating / Active */}
        <div style={{ ...cardStyle('active-section'), ...getColSpanStyle(8) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '800', fontFamily: "'DM Sans', system-ui, sans-serif", color: colors.navy, fontSize: '18px', margin: 0 }}>Active Competition</h3>
            <Link to="/participant/leaderboard" style={{ fontSize: '12px', fontWeight: 600, color: colors.accent, textDecoration: 'none' }}>View Detailed Stats</Link>
          </div>
          
          {activeEvents.length > 0 ? (
            activeEvents.map(event => (
              <div key={event.id} style={{ 
                background: '#F8FAFC', 
                display: 'flex',
                justifyContent: 'space-between',
                padding: '24px',
                borderRadius: '16px',
                border: `1px solid ${colors.borderSoft}`,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '20px' : '0'
              }}>
                <div>
                  <div style={badgeStyle}>In Progress</div>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, color: colors.navy, margin: '0 0 4px 0' }}>{event.name}</h4>
                  <p style={{ fontSize: '14px', color: colors.inkMuted, margin: 0 }}>{event.type} • {event.date}</p>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', marginBottom: '4px' }}>Current Standing</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: colors.navy }}>{event.rank} <span style={{ fontSize: '14px', color: colors.inkMuted, fontWeight: 600 }}>/ 45</span></div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: colors.accent }}>Score: {event.score}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: colors.inkMuted }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, marginBottom: '16px', display: 'block' }}>event_busy</span>
              <p>No active competitions at the moment.</p>
            </div>
          )}
        </div>

        {/* Fast Action / Invitations */}
        <div style={{ ...cardStyle('invites-section'), ...getColSpanStyle(4) }}>
          <h3 style={{ fontWeight: '800', fontFamily: "'DM Sans', system-ui, sans-serif", color: colors.navy, fontSize: '18px', marginBottom: '24px', margin: 0 }}>Pending Invitations</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invitations.length > 0 ? (
              invitations.map(invite => (
                <div key={invite.id} style={{ 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: `1px solid ${colors.borderSoft}`,
                  background: '#FDFDFD'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: colors.navy, marginBottom: '2px' }}>{invite.eventName}</div>
                  <div style={{ fontSize: '12px', color: colors.inkMuted, marginBottom: '12px' }}>From: {invite.organizer}</div>
                  <Link 
                    to="/participant/invites" 
                    style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        padding: '10px', 
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: '10px',
                        fontWeight: '600',
                        color: colors.navy,
                        border: `1px solid ${colors.border}`,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        background: '#fff'
                    }}
                    onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = colors.navy; }}
                    onMouseLeave={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = colors.border; }}
                  >
                    Review Invite
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: colors.inkMuted, textAlign: 'center', padding: '20px' }}>You're all caught up!</p>
            )}
            
            <Link to="/participant/invites" style={{ textAlign: 'center', fontSize: '12px', color: colors.accent, fontWeight: 600, marginTop: '8px', textDecoration: 'none' }}>Manage all invitations</Link>
          </div>
        </div>

        {/* Recently Earned */}
        <div style={{ ...cardStyle('certs-section'), ...getColSpanStyle(12) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '800', fontFamily: "'DM Sans', system-ui, sans-serif", color: colors.navy, fontSize: '18px', margin: 0 }}>Recent Certificates</h3>
            <Link to="/participant/certificates" style={{ fontSize: '12px', fontWeight: 600, color: colors.accent, textDecoration: 'none' }}>View All Certificates</Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {certificates.slice(0, 4).map((cert) => (
              <div key={cert.id}>
                <Link to="/participant/certificates" style={{ textDecoration: 'none' }}>
                  <MiniCertificate achievement={cert.achievement} eventName={cert.eventName} />
                </Link>
              </div>
            ))}
            
            {certificates.length === 0 && (
              <div style={{ gridColumn: '1 / -1', border: `1px dashed ${colors.border}`, borderRadius: '16px', textAlign: 'center', padding: '40px' }}>
                 <p style={{ color: colors.inkMuted, fontSize: '14px' }}>Participate in events to earn certificates!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

