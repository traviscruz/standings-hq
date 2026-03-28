import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { colors } from '../../styles/colors';

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const userName = localStorage.getItem('username') || 'Member';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  const [myEvents, setMyEvents] = useState(SEED_EVENTS);
  const [invitations, setInvitations] = useState(SEED_INVITATIONS);
  const [certificates, setCertificates] = useState(SEED_CERTIFICATES);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const isMobile = windowWidth <= 768;

  const layoutStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Inter', system-ui, sans-serif",
    color: colors.inkSoft,
    flexDirection: isMobile ? 'column' : 'row',
  };

  const sidebarStyle = {
    width: '280px',
    backgroundColor: '#FFFFFF',
    borderRight: `1px solid ${colors.borderSoft}`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    zIndex: 100,
    transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
    position: isMobile ? 'fixed' : 'relative',
    top: 0,
    left: 0,
    bottom: 0,
    transform: (isMobile && !isSidebarOpen) ? 'translateX(-100%)' : 'translateX(0)',
    boxShadow: (isMobile && isSidebarOpen) ? '20px 0 50px rgba(15, 23, 42, 0.15)' : 'none',
  };

  const sidebarHeaderStyle = {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const brandStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: '-0.03em',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const sidebarLinkStyle = (isActive, linkId) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 12px',
    borderRadius: '8px',
    color: isActive ? '#fff' : (hoveredLink === linkId ? colors.navy : colors.inkSoft),
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    background: isActive ? colors.navy : (hoveredLink === linkId ? '#F8FAFC' : 'transparent'),
    transition: 'all 0.2s ease',
    boxShadow: isActive ? '0 4px 12px rgba(15, 31, 61, 0.15)' : 'none',
    position: 'relative',
  });

  const sidebarBadgeStyle = {
    marginLeft: 'auto',
    background: colors.accent,
    color: '#fff',
    fontSize: '10px',
    fontWeight: '800',
    minWidth: '18px',
    height: '18px',
    borderRadius: '100px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
  };

  const mobileHeaderStyle = {
    display: isMobile ? 'flex' : 'none',
    padding: '14px 20px',
    background: '#fff',
    borderBottom: `1px solid ${colors.borderSoft}`,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
  };

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
      <style>
        {`
          @keyframes pillDrop {
            from { opacity: 0; transform: translateY(-20px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .slide-up-anim {
            animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}
      </style>
      <div style={layoutStyle}>

        {/* Mobile Header */}
        <div style={mobileHeaderStyle}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: colors.navy, width: '28px', height: '28px', borderRadius: '6px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12.5" cy="5" r="2" fill={colors.accent}/>
              </svg>
            </div>
            <span style={brandStyle}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
          </Link>
          <button 
            style={{ background: isMenuHovered ? colors.borderSoft : 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all 0.22s' }} 
            onClick={() => setIsSidebarOpen(true)}
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
          >
            <span className="material-symbols-rounded">menu</span>
          </button>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && isMobile && (
          <div onClick={() => setIsSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)',
            backdropFilter: 'blur(4px)', zIndex: 90
          }} />
        )}

        {/* ── SIDEBAR ── */}
        <aside style={sidebarStyle}>
          <div style={sidebarHeaderStyle}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ background: colors.navy, width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12.5" cy="5" r="2" fill={colors.accent}/>
                </svg>
              </div>
              <span style={brandStyle}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
            </Link>
          </div>

          <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.inkMuted, margin: '20px 0 8px 12px' }}>Personal Portal</div>
            <NavLink 
                to="/participant/dashboard" 
                style={({ isActive }) => sidebarLinkStyle(isActive, 'dashboard')}
                onMouseEnter={() => setHoveredLink('dashboard')}
                onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>space_dashboard</span>
              Dashboard
            </NavLink>
            <NavLink 
                to="/participant/events" 
                style={({ isActive }) => sidebarLinkStyle(isActive, 'events')}
                onMouseEnter={() => setHoveredLink('events')}
                onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>event</span>
              My Events
            </NavLink>
            <NavLink 
                to="/participant/leaderboard" 
                style={({ isActive }) => sidebarLinkStyle(isActive, 'leaderboard')}
                onMouseEnter={() => setHoveredLink('leaderboard')}
                onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>leaderboard</span>
              Leaderboard
            </NavLink>
            <NavLink 
                to="/participant/certificates" 
                style={({ isActive }) => sidebarLinkStyle(isActive, 'certificates')}
                onMouseEnter={() => setHoveredLink('certificates')}
                onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>workspace_premium</span>
              Certificates
            </NavLink>
            <NavLink 
                to="/participant/invites" 
                style={({ isActive }) => sidebarLinkStyle(isActive, 'invites')}
                onMouseEnter={() => setHoveredLink('invites')}
                onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>mail</span>
              <span>Invitations</span>
              {invitations.length > 0 && <span style={sidebarBadgeStyle}>{invitations.length}</span>}
            </NavLink>
          </nav>

          <div style={{ padding: '16px', borderTop: `1px solid ${colors.borderSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '14px', background: '#F8FAFC' }}>
              <Link to="/participant/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flex: 1, overflow: 'hidden' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: '700' }}>{userInitials}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: colors.navy, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
                  <span style={{ fontSize: '11px', color: colors.inkMuted }}>Competitor</span>
                </div>
              </Link>
              <button 
                style={{ background: isLogoutHovered ? colors.borderSoft : 'none', border: 'none', cursor: 'pointer', display: 'flex', color: colors.inkMuted, padding: '6px', borderRadius: '50%', transition: 'all 0.22s' }}
                onClick={() => { navigate('/'); showToast('Signed out', 'info'); }}
                onMouseEnter={() => setIsLogoutHovered(true)}
                onMouseLeave={() => setIsLogoutHovered(false)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '24px 20px' : '48px', position: 'relative' }}>
          <Outlet />
        </main>

        {/* ── TOAST HUD ── */}
        {toast && (
          <div style={{ position: 'fixed', top: isMobile ? '16px' : '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: isMobile ? 'calc(100% - 32px)' : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 20px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', color: '#fff', minWidth: isMobile ? '100%' : '300px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', animation: 'pillDrop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)', position: 'relative', overflow: 'hidden' }}>
              <span className="material-symbols-rounded" style={{ 
                color: toast.type === 'success' ? '#4ade80' : toast.type === 'error' ? '#f87171' : '#60a5fa' 
              }}>
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{toast.message}</span>
              
              {toast.onUndo && (
                <button 
                  style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginLeft: '8px' }}
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

