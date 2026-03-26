import React, { useState, createContext, useContext, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import '../../styles/organizer.css';
import '../../styles/judge.css';

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
  { id: 2, name: 'Ana Reyes',    number: 2, barangay: 'Brgy. 002 - Maliwanag'    },
  { id: 3, name: 'Luz Dela Cruz',number: 3, barangay: 'Brgy. 003 - Masagana'     },
  { id: 4, name: 'Rosa Bautista', number: 4, barangay: 'Brgy. 004 - Pagasa'       },
  { id: 5, name: 'Elena Flores', number: 5, barangay: 'Brgy. 005 - Silangan'      },
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

  return (
    <JudgeContext.Provider value={{
      event: mockEvent,
      participants: mockParticipants,
      segments: pageantSegments,
      scores,
      submittedSegments,
      updateScore,
      submitSegment,
      showToast,
    }}>
      <div className="organizer-layout">

        {/* Mobile Header */}
        <div className="mobile-header">
          <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--navy)', width: '28px', height: '28px', borderRadius: '6px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12.5" cy="5" r="2" fill="var(--accent)"/>
              </svg>
            </div>
            <span className="sidebar-brand">Standings<span>HQ</span></span>
          </Link>
          <button className="btn-icon" onClick={() => setIsSidebarOpen(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: '26px' }}>menu</span>
          </button>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div onClick={() => setIsSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.45)',
            backdropFilter: 'blur(4px)', zIndex: 90
          }} />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`organizer-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--navy)', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12.5" cy="5" r="2" fill="var(--accent)"/>
                  </svg>
                </div>
                <span className="sidebar-brand">Standings<span>HQ</span></span>
              </Link>
              {isSidebarOpen && (
                <button className="btn-icon" onClick={() => setIsSidebarOpen(false)} style={{ marginLeft: 'auto' }}>
                  <span className="material-symbols-rounded">close</span>
                </button>
              )}
            </div>

            <div className="event-switcher" style={{ marginTop: '12px' }}>
              <div className="event-switcher-btn" style={{ background: '#fff' }}>
                <div className="event-switcher-icon" style={{ background: 'var(--accent)' }}>G</div>
                <div className="event-switcher-info">
                  <div className="event-switcher-label">Assigned Room</div>
                  <div className="event-switcher-name">Guest Judge Portal</div>
                </div>
                <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '18px' }}>gavel</span>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">Overview</div>
            <NavLink to="/judge/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">space_dashboard</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/judge/invites" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">mail</span>
              <span>Pending Invites</span>
            </NavLink>

            <div className="nav-section-title">Scoring Loop</div>
            <NavLink to="/judge/scoring" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">edit_note</span>
              <span>Scoring Sheet</span>
            </NavLink>
            <NavLink to="/judge/rubric" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">rule</span>
              <span>Criteria Specs</span>
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile-sm">
              <div className="user-avatar" style={{ background: 'var(--navy)', color: '#fff' }}>MR</div>
              <div className="user-info">
                <span className="user-name">Marian Rivera</span>
                <span className="user-role">Official Judge</span>
              </div>
              <button className="btn-icon" onClick={() => navigate('/')}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>logout</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="organizer-main">
          <Outlet />
        </main>
      </div>

      {/* ── GLOBAL NOTIFICATIONS (HUD Style) ── */}
      {toast && (
        <div className="notification-container">
          <div className={`notification-pill pill-${toast.type || 'info'}`} style={{ '--duration': '5s' }}>
            <div className={`pill-icon ${toast.type || 'info'}`}>
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
            </div>
            <span className="pill-message">{toast.message}</span>
            {toast.onUndo && (
              <button className="pill-action-btn" onClick={() => { toast.onUndo(); setToast(null); }}>Undo</button>
            )}
            <button className="pill-close-btn" onClick={() => setToast(null)}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
            </button>
            <div className="pill-progress">
              <div className="pill-progress-bar" />
            </div>
          </div>
        </div>
      )}
    </JudgeContext.Provider>
  );
}
