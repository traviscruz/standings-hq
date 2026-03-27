import React from 'react';
import { useParticipantContext } from './ParticipantLayout';

export default function AcceptInvitePage() {
  const { invitations, acceptInvitation, declineInvitation } = useParticipantContext();

  const handleAction = (id, action) => {
    if (action === 'accept') {
      acceptInvitation(id);
    } else {
      declineInvitation(id);
    }
  };

  return (
    <div className="invites-view">
      <header className="page-header">
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>mail</span>
            Invitation Hub
          </div>
          <h1 className="page-title">Event Invitations</h1>
          <p className="page-description">You have {invitations.length} pending invitations from organizers. Accept or decline them to manage your event roster.</p>
        </div>
        <div className="header-actions">
           <button className="btn-outline">
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>notifications</span>
            Notification Settings
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {invitations.length === 0 ? (
          <div className="widget-card" style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '56px', color: 'var(--border)', marginBottom: '20px', display: 'block' }}>mail_outline</span>
            <p style={{ fontSize: '16px', color: 'var(--ink-soft)', fontWeight: 600 }}>No pending invitations.</p>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginTop: '8px' }}>Keep an eye on this space for new event opportunities!</p>
          </div>
        ) : (
          invitations.map(invite => (
            <div key={invite.id} className="widget-card" style={{ display: 'flex', gap: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'var(--page-bg)', color: 'var(--navy)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                border: '1px solid var(--border-soft)'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>event_note</span>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{invite.eventName}</h3>
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>{invite.type}</span>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--ink-muted)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>person</span>
                    By <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{invite.organizer}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--ink-muted)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>calendar_today</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{invite.date}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" onClick={() => handleAction(invite.id, 'accept')} style={{ padding: '10px 24px', fontSize: '13px' }}>
                    Accept
                  </button>
                  <button className="btn-outline" onClick={() => handleAction(invite.id, 'decline')} style={{ padding: '10px 24px', fontSize: '13px' }}>
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
