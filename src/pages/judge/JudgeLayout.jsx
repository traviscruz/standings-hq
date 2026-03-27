import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

const JudgeContext = createContext();
export const useJudgeContext = () => useContext(JudgeContext);

// Mock event & rubric data
const mockEvent = {
  name: 'Mutya ng Barangay 2026',
  date: 'Apr 12, 2026',
  type: 'Barangay Pageant',
};

const pageantSegments = [
  {
    id: 'swimwear',
    label: 'Swimwear / Casual Wear',
    icon: 'beach_access',
    color: '#D25E41',
    colorBg: 'rgba(210,94,65,0.08)',
    criteria: [
      { id: 'sw1', name: 'Poise & Confidence', maxScore: 10 },
      { id: 'sw2', name: 'Body Fitness & Proportion', maxScore: 10 },
      { id: 'sw3', name: 'Overall Presentation', maxScore: 10 },
    ],
  },
  {
    id: 'natcos',
    label: 'National Costume (NatCos)',
    icon: 'style',
    color: '#1E2D4A',
    colorBg: 'rgba(30,45,74,0.08)',
    criteria: [
      { id: 'nc1', name: 'Cultural Authenticity', maxScore: 10 },
      { id: 'nc2', name: 'Creativity & Design', maxScore: 10 },
      { id: 'nc3', name: 'Stage Presence', maxScore: 10 },
    ],
  },
  {
    id: 'qa',
    label: 'Question & Answer',
    icon: 'record_voice_over',
    color: '#7A5C8A',
    colorBg: 'rgba(122,92,138,0.08)',
    criteria: [
      { id: 'qa1', name: 'Clarity & Articulation', maxScore: 10 },
      { id: 'qa2', name: 'Content & Intelligence', maxScore: 10 },
      { id: 'qa3', name: 'Confidence & Poise', maxScore: 10 },
    ],
  },
  {
    id: 'eveninggown',
    label: 'Long Gown / Evening Gown',
    icon: 'diamond',
    color: '#8BA888',
    colorBg: 'rgba(139,168,136,0.08)',
    criteria: [
      { id: 'eg1', name: 'Elegance & Grace', maxScore: 10 },
      { id: 'eg2', name: 'Gown Appropriateness', maxScore: 10 },
      { id: 'eg3', name: 'Walk & Overall Bearing', maxScore: 10 },
    ],
  },
];

const mockParticipants = [
  { id: 1, name: 'Maria Santos', number: 1, barangay: 'Brgy. 001 - Bagong Silang' },
  { id: 2, name: 'Ana Reyes', number: 2, barangay: 'Brgy. 002 - Maliwanag' },
  { id: 3, name: 'Luz Dela Cruz', number: 3, barangay: 'Brgy. 003 - Masagana' },
  { id: 4, name: 'Rosa Bautista', number: 4, barangay: 'Brgy. 004 - Pagasa' },
  { id: 5, name: 'Elena Flores', number: 5, barangay: 'Brgy. 005 - Silangan' },
];

const buildInitialScores = () => {
  const s = {};
  mockParticipants.forEach(p => {
    s[p.id] = {};
    pageantSegments.forEach(seg => {
      s[p.id][seg.id] = {};
      seg.criteria.forEach(c => { s[p.id][seg.id][c.id] = ''; });
    });
  });
  return s;
};

export default function JudgeLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  const [scores, setScores] = useState(buildInitialScores);
  const [submittedSegments, setSubmittedSegments] = useState({});
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (message, type = 'success', onUndo = null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type, onUndo });
    timeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  const updateScore = (participantId, segmentId, criterionId, value) => {
    setScores(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [segmentId]: { ...prev[participantId][segmentId], [criterionId]: value },
      },
    }));
  };

  const submitSegment = (segmentId) => {
    const prevSubmitted = { ...submittedSegments };
    setSubmittedSegments(prev => ({ ...prev, [segmentId]: true }));
    showToast(`Scores for "${pageantSegments.find(s => s.id === segmentId)?.label}" locked and submitted.`, 'success', () => {
      setSubmittedSegments(prevSubmitted);
      showToast('Submission reverted.', 'info');
    });
  };

  const handleInvitation = (id, action) => {
    const prevInvs = [...invitations];
    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: action } : inv));

    const msg = action === 'accepted' ? 'Attendance confirmed. Event added to dashboard.' : 'Invitation declined.';
    showToast(msg, action === 'accepted' ? 'success' : 'info', () => {
      setInvitations(prevInvs);
      showToast('Action reverted.', 'info');
    });
  };

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

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  };

  const brandStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: '-0.03em',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const eventSwitcherStyle = {
    marginTop: '12px',
    position: 'relative',
    width: '100%',
  };

  const eventSwitcherBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const navStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const sectionTitleStyle = {
    fontSize: '10.5px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.inkMuted,
    margin: '20px 0 8px 12px',
  };

  const getSidebarLinkStyle = (isActive, linkId) => ({
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

  const footerStyle = {
    padding: '16px',
    borderTop: `1px solid ${colors.borderSoft}`,
  };

  const userProfileStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '14px',
    background: '#F8FAFC',
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

  const mainStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: isMobile ? '24px 20px' : '48px',
    position: 'relative',
  };

  const notificationStyle = {
    position: 'fixed',
    top: isMobile ? '16px' : '32px',
    left: isMobile ? '16px' : '50%',
    right: isMobile ? '16px' : 'auto',
    transform: isMobile ? 'none' : 'translateX(-50%)',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  const pillStyle = {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 20px',
    background: 'rgba(15, 23, 42, 0.82)',
    backdropFilter: 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '100px',
    color: '#fff',
    minWidth: isMobile ? '0' : '320px',
    width: isMobile ? '100%' : 'auto',
    maxWidth: '500px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
    position: 'relative',
    overflow: 'hidden',
    animation: 'pillDrop 0.4s cubic-bezier(0.2, 1.2, 0.5, 1.2)',
  };

  return (
    <JudgeContext.Provider value={{
      event: mockEvent,
      participants: mockParticipants,
      segments: pageantSegments,
      scores,
      submittedSegments,
      invitations,
      updateScore,
      submitSegment,
      handleInvitation,
      showToast,
    }}>
      <style>
        {`
          @keyframes pillDrop {
            from { opacity: 0; transform: translateY(-20px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pillTimer {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .pill-progress-bar-anim {
            animation: pillTimer 5s linear forwards;
          }
          .slide-up-anim {
            animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}
      </style>
      <div style={layoutStyle}>

        {/* Mobile Header */}
        <div style={mobileHeaderStyle}>
          <Link to="/" style={logoStyle}>
            <div style={{ background: colors.navy, width: '28px', height: '28px', borderRadius: '6px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
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
            <span className="material-symbols-rounded" style={{ fontSize: '26px' }}>menu</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/" style={logoStyle}>
                <div style={{ background: colors.navy, width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
                  </svg>
                </div>
                <span style={{ ...brandStyle, fontSize: '18px' }}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
              </Link>
              {isSidebarOpen && isMobile && (
                <button 
                  style={{ background: isCloseHovered ? colors.borderSoft : 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all 0.22s', marginLeft: 'auto' }} 
                  onClick={() => setIsSidebarOpen(false)}
                  onMouseEnter={() => setIsCloseHovered(true)}
                  onMouseLeave={() => setIsCloseHovered(false)}
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              )}
            </div>

            <div style={eventSwitcherStyle}>
              <div style={eventSwitcherBtnStyle}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: colors.accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '700', fontSize: '14px' }}>G</div>
                <div style={{ flex: 1, textAlignment: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.inkMuted, marginBottom: '1px' }}>Assigned Room</div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Guest Judge Portal</div>
                </div>
                <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '18px' }}>gavel</span>
              </div>
            </div>
          </div>

          <nav style={navStyle}>
            <div style={sectionTitleStyle}>Overview</div>
            <NavLink 
              to="/judge/dashboard" 
              style={({ isActive }) => getSidebarLinkStyle(isActive, 'dashboard')}
              onMouseEnter={() => setHoveredLink('dashboard')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>space_dashboard</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/judge/invites" 
              style={({ isActive }) => getSidebarLinkStyle(isActive, 'invites')}
              onMouseEnter={() => setHoveredLink('invites')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>mail</span>
              <span>Pending Invites</span>
              {invitations.filter(i => i.status === 'pending').length > 0 && (
                <span style={sidebarBadgeStyle}>{invitations.filter(i => i.status === 'pending').length}</span>
              )}
            </NavLink>

            <div style={sectionTitleStyle}>Scoring Loop</div>
            <NavLink 
              to="/judge/scoring" 
              style={({ isActive }) => getSidebarLinkStyle(isActive, 'scoring')}
              onMouseEnter={() => setHoveredLink('scoring')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit_note</span>
              <span>Scoring Sheet</span>
            </NavLink>
            <NavLink 
              to="/judge/rubric" 
              style={({ isActive }) => getSidebarLinkStyle(isActive, 'rubric')}
              onMouseEnter={() => setHoveredLink('rubric')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>rule</span>
              <span>Criteria Specs</span>
            </NavLink>
          </nav>

          <div style={footerStyle}>
            <div style={userProfileStyle}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: colors.navy, color: '#fff', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: '700' }}>MR</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.navy, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Marian Rivera</span>
                <span style={{ fontSize: '11px', color: colors.inkMuted }}>Official Judge</span>
              </div>
              <button 
                style={{ background: isLogoutHovered ? colors.borderSoft : 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all 0.22s' }} 
                onClick={() => navigate('/')}
                onMouseEnter={() => setIsLogoutHovered(true)}
                onMouseLeave={() => setIsLogoutHovered(false)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>logout</span>
              </button>
            </div>
          </div>
        </aside>

        <main style={mainStyle}>
          <Outlet />
        </main>
      </div>

      {/* ── GLOBAL NOTIFICATIONS (HUD Style) ── */}
      {toast && (
        <div style={notificationStyle}>
          <div style={pillStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: toast.type === 'success' ? '#4ade80' : toast.type === 'error' ? '#f87171' : '#60a5fa' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
            </div>
            <span style={{ fontSize: '13.5px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.95)', flex: 1, whiteSpace: isMobile ? 'normal' : 'nowrap', lineHeight: isMobile ? '1.4' : 'normal' }}>{toast.message}</span>
            {toast.onUndo && (
              <button 
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '4px 14px', borderRadius: '100px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.22s' }} 
                onClick={() => { toast.onUndo(); setToast(null); }}
              >
                Undo
              </button>
            )}
            <button style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer', padding: '4px', display: 'flex', transition: 'color 0.2s' }} onClick={() => setToast(null)}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255, 255, 255, 0.05)' }}>
              <div 
                className="pill-progress-bar-anim"
                style={{ height: '100%', width: '100%', background: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : colors.accent, transformOrigin: 'left' }} 
              />
            </div>
          </div>
        </div>
      )}
    </JudgeContext.Provider>
  );
}