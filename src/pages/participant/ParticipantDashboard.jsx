import React from 'react';
import { useParticipantContext } from './ParticipantLayout';
import { Link } from 'react-router-dom';

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

  const activeEvents = myEvents.filter(e => e.status === 'Active');
  
  return (
    <div className="dashboard-view">
      <header className="page-header">
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>waving_hand</span>
            Welcome back, Riley!
          </div>
          <h1 className="page-title">Participant Dashboard</h1>
          <p className="page-description">Your competition journey at a glance. All live scores, upcoming events, and achievements.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <Link to="/participant/events" className="btn-primary">
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>explore</span>
            Find Events
          </Link>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="card col-span-3 stat-card">
          <span className="stat-label">Joined Events</span>
          <span className="stat-value">{myEvents.length}</span>
          <span className="stat-meta">Across {new Set(myEvents.map(e => e.type)).size} categories</span>
        </div>
        <div className="card col-span-3 stat-card">
          <span className="stat-label">Active Events</span>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>{activeEvents.length}</span>
          <span className="stat-meta">In progress right now</span>
        </div>
        <div className="card col-span-3 stat-card">
          <span className="stat-label">Certificates</span>
          <span className="stat-value" style={{ color: 'var(--sage)' }}>{certificates.length}</span>
          <span className="stat-meta">Verified achievements</span>
        </div>
        <div className="card col-span-3 stat-card">
          <span className="stat-label">Pending Invites</span>
          <span className="stat-value" style={{ color: 'var(--coral)' }}>{invitations.length}</span>
          <span className="stat-meta">Waiting for your response</span>
        </div>

        {/* Currently Participating / Active */}
        <div className="card col-span-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '800', fontFamily: 'var(--font-head)', color: 'var(--navy)', fontSize: '18px' }}>Active Competition</h3>
            <Link to="/participant/leaderboard" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textShadow: 'none' }}>View Detailed Stats</Link>
          </div>
          
          {activeEvents.length > 0 ? (
            activeEvents.map(event => (
              <div key={event.id} className="widget-card" style={{ 
                background: 'var(--page-bg)', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px',
                border: '1px solid var(--border-soft)'
              }}>
                <div>
                  <div className="badge badge-blue" style={{ marginBottom: '8px' }}>In Progress</div>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>{event.name}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>{event.type} • {event.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Current Standing</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy)' }}>{event.rank} <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontWeight: 600 }}>/ 45</span></div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>Score: {event.score}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-muted)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--border)', marginBottom: '16px', display: 'block' }}>event_busy</span>
              <p>No active competitions at the moment.</p>
            </div>
          )}
        </div>

        {/* Fast Action / Invitations */}
        <div className="card col-span-4">
          <h3 style={{ fontWeight: '800', fontFamily: 'var(--font-head)', color: 'var(--navy)', fontSize: '18px', marginBottom: '24px' }}>Pending Invitations</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invitations.length > 0 ? (
              invitations.map(invite => (
                <div key={invite.id} className="widget-card" style={{ 
                  padding: '16px', 
                  border: '1px solid var(--border-soft)',
                  background: '#FDFDFD'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginBottom: '2px' }}>{invite.eventName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '12px' }}>From: {invite.organizer}</div>
                  <Link to="/participant/invites" className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px' }}>Review Invite</Link>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center', padding: '20px' }}>You're all caught up!</p>
            )}
            
            <Link to="/participant/invites" style={{ textAlign: 'center', fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginTop: '8px' }}>Manage all invitations</Link>
          </div>
        </div>

        {/* Recently Earned */}
        <div className="card col-span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '800', fontFamily: 'var(--font-head)', color: 'var(--navy)', fontSize: '18px' }}>Recent Certificates</h3>
            <Link to="/participant/certificates" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>View All Certificates</Link>
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
              <div className="widget-card" style={{ gridColumn: '1 / -1', borderStyle: 'dashed', textAlign: 'center', padding: '40px' }}>
                 <p style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>Participate in events to earn certificates!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
