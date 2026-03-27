import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import '../../styles/participant.css';

const ParticipantContext = createContext();
export const useParticipantContext = () => useContext(ParticipantContext);

// ─── INITIAL SEED DATA (Synced with Organizer SEED_EVENTS) ───────────────────
const SEED_EVENTS = [
  {
    id: 1,
    name: 'Palarong Pambansa 2026',
    date: 'Dec 05, 2026',
    status: 'Upcoming',
    rank: '-',
    score: '-',
    type: 'Sports'
  },
  {
    id: 2,
    name: 'Metro Manila Debate Open',
    date: 'Oct 15, 2026',
    status: 'Active',
    rank: '12th',
    score: '84.5',
    type: 'Academic'
  },
  {
    id: 3,
    name: 'Quezon City IT Olympics',
    date: 'Nov 20, 2026',
    status: 'Upcoming',
    rank: '-',
    score: '-',
    type: 'Technology'
  },
  {
    id: 4,
    name: 'Regional Science Fair 2025',
    date: 'Aug 10, 2025',
    status: 'Completed',
    rank: '3rd',
    score: '91.0',
    type: 'Academic'
  }
];

const SEED_INVITATIONS = [
  {
    id: 101,
    eventName: 'Global Coding Challenge 2026',
    organizer: 'Tech Alliance',
    date: 'Nov 20, 2026',
    type: 'Technology'
  },
  {
    id: 102,
    eventName: 'Artistry Expo 2026',
    organizer: 'Creative Guild',
    date: 'Dec 12, 2026',
    type: 'Arts'
  }
];

const SEED_CERTIFICATES = [
  {
    id: 4, // ID matching the completed event
    eventName: 'Regional Science Fair 2025',
    achievement: '3rd Place',
    date: 'Aug 11, 2025'
  },
  {
    id: 99,
    eventName: 'Youth Leadership Summit 2025',
    achievement: 'Participation',
    date: 'Jun 15, 2025'
  }
];

export default function ParticipantLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const [myEvents, setMyEvents] = useState(SEED_EVENTS);
  const [invitations, setInvitations] = useState(SEED_INVITATIONS);
  const [certificates, setCertificates] = useState(SEED_CERTIFICATES);

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'info', onUndo = null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type, onUndo });
    timeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  const acceptInvitation = (id) => {
    const invite = invitations.find(inv => inv.id === id);
    if (!invite) return;

    const originalInvitations = [...invitations];
    const originalMyEvents = [...myEvents];

    setInvitations(prev => prev.filter(inv => inv.id !== id));
    setMyEvents(prev => [{
      id: Date.now(),
      name: invite.eventName,
      date: invite.date,
      status: 'Upcoming',
      rank: '-',
      score: '-',
      type: invite.type
    }, ...prev]);

    showToast(`Joined ${invite.eventName}!`, 'success', () => {
      setInvitations(originalInvitations);
      setMyEvents(originalMyEvents);
    });
  };

  const deleteCertificate = (id) => {
    const cert = certificates.find(c => c.id === id);
    if (!cert) return;
    const originalCertificates = [...certificates];
    setCertificates(prev => prev.filter(c => c.id !== id));
    showToast(`Removed certificate for ${cert.eventName}`, 'info', () => {
      setCertificates(originalCertificates);
    });
  };

  const declineInvitation = (id) => {
    const originalInvitations = [...invitations];
    setInvitations(prev => prev.filter(inv => inv.id !== id));
    showToast('Invitation declined.', 'info', () => {
      setInvitations(originalInvitations);
    });
  };

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const contextValue = {
    myEvents,
    invitations,
    certificates,
    acceptInvitation,
    declineInvitation,
    deleteCertificate,
    showToast
  };

  return (
    <ParticipantContext.Provider value={contextValue}>
      <div className="participant-layout">

        {/* Mobile Header */}
        <div className="mobile-header">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--navy)', width: '28px', height: '28px', borderRadius: '6px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12.5" cy="5" r="2" fill="var(--accent)"/>
              </svg>
            </div>
            <span className="sidebar-brand">Standings<span>HQ</span></span>
          </Link>
          <button className="btn-icon" onClick={() => setIsSidebarOpen(true)}>
            <span className="material-symbols-rounded">menu</span>
          </button>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div onClick={() => setIsSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)',
            backdropFilter: 'blur(4px)', zIndex: 90
          }} />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`participant-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <Link to="/" className="sidebar-logo">
              <div style={{ background: 'var(--navy)', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12.5" cy="5" r="2" fill="var(--accent)"/>
                </svg>
              </div>
              <span className="sidebar-brand">Standings<span>HQ</span></span>
            </Link>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">Personal Portal</div>
            <NavLink to="/participant/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">space_dashboard</span>
              Dashboard
            </NavLink>
            <NavLink to="/participant/events" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">event</span>
              My Events
            </NavLink>
            <NavLink to="/participant/leaderboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">leaderboard</span>
              Leaderboard
            </NavLink>
            <NavLink to="/participant/certificates" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">workspace_premium</span>
              Certificates
            </NavLink>
            <NavLink to="/participant/invites" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">mail</span>
              Invitations {invitations.length > 0 && <span className="sidebar-badge">{invitations.length}</span>}
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile-sm">
              <div className="user-avatar">RC</div>
              <div className="user-info">
                <span className="user-name">Riley Cruz</span>
                <span className="user-role">Participant</span>
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--ink-muted)' }}
                onClick={() => { navigate('/'); showToast('Signed out', 'info'); }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="participant-main">
          <Outlet />
        </main>

        {/* ── TOAST HUD ── */}
        {toast && (
          <div className="notification-container">
            <div className={`notification-pill ${toast.onUndo ? 'has-undo' : ''}`}>
              <span className="material-symbols-rounded" style={{ 
                color: toast.type === 'success' ? '#4ade80' : toast.type === 'error' ? '#f87171' : '#60a5fa' 
              }}>
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{toast.message}</span>
              
              {toast.onUndo && (
                <button 
                  className="pill-action-btn"
                  onClick={() => { toast.onUndo(); setToast(null); }}
                >
                  Undo
                </button>
              )}

              <button 
                onClick={() => setToast(null)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginLeft: 'auto', display: 'flex' }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ParticipantContext.Provider>
  );
}
