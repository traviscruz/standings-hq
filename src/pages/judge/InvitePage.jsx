import React, { useState } from 'react';
import { useJudgeContext } from './JudgeLayout';
import { useNavigate } from 'react-router-dom';

export default function InvitePage() {
  const { showToast } = useJudgeContext();
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([
    {
      id: 1,
      eventName: "Mutya ng Barangay 2026",
      organizer: "Juan Dela Cruz",
      role: "Guest Judge",
      date: "April 12, 2026",
      status: "pending" 
    },
    {
      id: 2,
      eventName: "QC Tech Pitch Deck 2026",
      organizer: "Maria Lim",
      role: "Technical Judge",
      date: "May 05, 2026",
      status: "pending"
    }
  ]);

  const handleAction = (id, action) => {
    const prevInvs = [...invitations];
    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: action } : inv));
    
    const msg = action === 'accepted' ? 'Attendance confirmed. Event added to dashboard.' : 'Invitation declined.';
    showToast(msg, action === 'accepted' ? 'success' : 'info', () => {
      setInvitations(prevInvs);
      showToast('Action reverted.', 'info');
    });

    if (action === 'accepted') {
       // redirect shortly after
       // setTimeout(() => { navigate('/judge/dashboard'); }, 3000); 
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <div className="eyebrow-badge">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--accent)' }}>mail</span>
            Invitation Hub
          </div>
          <h1 className="page-title">Pending Requests</h1>
          <p className="page-description">Manage your judging invitations. Accepted events will appear in your live dashboard.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {invitations.length === 0 ? (
           <div className="widget-card" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '40px', color: 'var(--border)', marginBottom: '12px' }}>inbox</span>
              <p style={{ color: 'var(--ink-muted)', fontWeight: 600 }}>No pending invitations found.</p>
           </div>
        ) : (
          invitations.map(inv => (
            <div key={inv.id} className="widget-card" style={{ display: 'flex', gap: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
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
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{inv.eventName}</h3>
                  {inv.status !== 'pending' && (
                    <div className={`status-badge ${inv.status === 'accepted' ? 'status-active' : 'status-pending'}`} style={{ fontSize: '10px' }}>
                      {inv.status === 'accepted' ? 'Confirmed' : 'Declined'}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>person</span>
                    By <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{inv.organizer}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>work</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{inv.role}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>calendar_today</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{inv.date}</span>
                  </div>
                </div>

                {inv.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="primary-btn" onClick={() => handleAction(inv.id, 'accepted')} style={{ padding: '8px 16px', fontSize: '13px', background: '#16A34A', border: 'none' }}>
                      Accept
                    </button>
                    <button className="secondary-btn" onClick={() => handleAction(inv.id, 'rejected')} style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
