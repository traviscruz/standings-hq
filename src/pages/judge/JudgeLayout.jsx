import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { API_URL as API_BASE } from '../../config';
import { createClient } from '../../utils/supabase/client';

const JudgeContext = createContext();
export const useJudgeContext = () => useContext(JudgeContext);

export default function JudgeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  // Dynamic States
  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [segments, setSegments] = useState([]);
  const [scores, setScores] = useState({});
  const [submittedSegments, setSubmittedSegments] = useState({});
  const [invitations, setInvitations] = useState([]);

  // Switcher Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const [isSearchHovered, setIsSearchHovered] = useState(false);

  const dropdownRef = useRef(null);
  const userEmail = localStorage.getItem('email');
  const selectedEvent = eventsList.find(e => e.id === selectedEventId);

  // Fetch Pending Invitations
  useEffect(() => {
    if (!userEmail) return;

    fetch(`${API_BASE}/judges/my-invitations?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setInvitations(data.data.map(inv => ({ ...inv, status: 'pending' })));
      })
      .catch(err => console.error('Error fetching judge invitations:', err));
  }, [userEmail]);

  // Fetch Accepted Events
  useEffect(() => {
    if (!userEmail) {
      setEventsLoading(false);
      return;
    }
    setEventsLoading(true);
    fetch(`${API_BASE}/judges/my-events?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setEventsList(data.data);
          setSelectedEventId(data.data[0].id);
        } else {
          setEventsList([]);
          setSelectedEventId(null);
        }
      })
      .catch(err => console.error('Error fetching accepted events:', err))
      .finally(() => setEventsLoading(false));
  }, [userEmail]);

  // Fetch active event participants & rubric configuration
  useEffect(() => {
    if (!selectedEventId) {
      setParticipants([]);
      setSegments([]);
      return;
    }

    // 1. Fetch participants
    fetch(`${API_BASE}/participants?event_id=${selectedEventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const formatted = data.data.map((p, index) => ({
            id: p.id,
            name: p.name,
            number: index + 1,
            barangay: p.team || 'Independent',
            email: p.email,
            status: p.status,
          }));
          setParticipants(formatted);
        }
      })
      .catch(err => console.error('Error fetching participants:', err));

    // 2. Fetch rubric config from supabase
    const fetchRubrics = async () => {
      try {
        const { data, error } = await supabase
          .from('event_rubrics')
          .select('*')
          .eq('event_id', selectedEventId)
          .maybeSingle();

        if (error) throw error;
        if (data && data.config && data.config.rubrics) {
          const scaleMax = data.config.scale?.max || 10;
          const mapped = data.config.rubrics.map((r, idx) => ({
            id: r.id,
            label: r.label,
            weight: r.weight,
            icon: idx % 4 === 0 ? 'emoji_events' : idx % 4 === 1 ? 'military_tech' : idx % 4 === 2 ? 'workspace_premium' : 'hotel_class',
            color: idx % 4 === 0 ? '#D25E41' : idx % 4 === 1 ? '#1E2D4A' : idx % 4 === 2 ? '#7A5C8A' : '#8BA888',
            colorBg: idx % 4 === 0 ? 'rgba(210,94,65,0.08)' : idx % 4 === 1 ? 'rgba(30,45,74,0.08)' : idx % 4 === 2 ? 'rgba(122,92,138,0.08)' : 'rgba(139,168,136,0.08)',
            criteria: [
              {
                id: r.id + '_score',
                name: 'Score',
                maxScore: scaleMax,
              }
            ]
          }));
          setSegments(mapped);
        } else {
          setSegments([]);
        }
      } catch (err) {
        console.error('Error fetching event rubric config:', err);
      }
    };

    fetchRubrics();
  }, [selectedEventId, supabase]);

  // Scores Initialization Effect
  useEffect(() => {
    if (!participants.length || !segments.length) return;
    setScores(prev => {
      const s = { ...prev };
      participants.forEach(p => {
        if (!s[p.id]) s[p.id] = {};
        segments.forEach(seg => {
          if (!s[p.id][seg.id]) s[p.id][seg.id] = {};
          seg.criteria.forEach(c => {
            if (s[p.id][seg.id][c.id] === undefined) {
              s[p.id][seg.id][c.id] = '';
            }
          });
        });
      });
      return s;
    });
  }, [participants, segments]);

  // Fetch existing scores & submissions from backend
  useEffect(() => {
    if (!selectedEventId || !selectedEvent?.eventJudgeId) return;

    fetch(`${API_BASE}/scores?event_id=${selectedEventId}&judge_id=${selectedEvent.eventJudgeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.scores) {
            setScores(data.scores);
          }
          if (data.submittedSegments) {
            setSubmittedSegments(data.submittedSegments);
          }
        }
      })
      .catch(err => console.error('Error fetching scores:', err));
  }, [selectedEventId, selectedEvent?.eventJudgeId]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const userName = localStorage.getItem('username') || 'Official Judge';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const updateScore = (participantId, segmentId, criterionId, value) => {
    // 1. Update state locally (for instant UI feedback)
    setScores(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [segmentId]: { ...prev[participantId][segmentId], [criterionId]: value },
      },
    }));

    // 2. Persist to backend in the background (autosave)
    if (!selectedEventId || !selectedEvent?.eventJudgeId) return;
    fetch(`${API_BASE}/scores/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: selectedEventId,
        judge_id: selectedEvent.eventJudgeId,
        participant_id: participantId,
        segment_id: segmentId,
        criterion_id: criterionId,
        score: value === '' ? null : parseFloat(value)
      })
    })
    .catch(err => console.error('Error saving score:', err));
  };

  const submitSegment = (segmentId) => {
    const prevSubmitted = { ...submittedSegments };
    
    // 1. Update UI state optimistically
    setSubmittedSegments(prev => ({ ...prev, [segmentId]: true }));
    
    // 2. Submit to backend
    if (!selectedEventId || !selectedEvent?.eventJudgeId) return;
    fetch(`${API_BASE}/scores/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: selectedEventId,
        judge_id: selectedEvent.eventJudgeId,
        segment_id: segmentId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(`Scores for "${segments.find(s => s.id === segmentId)?.label}" locked and submitted.`, 'success', () => {
          // Revert (Undo) submission on the backend
          fetch(`${API_BASE}/scores/revert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: selectedEventId,
              judge_id: selectedEvent.eventJudgeId,
              segment_id: segmentId
            })
          })
          .then(r => r.json())
          .then(d => {
            if (d.success) {
              setSubmittedSegments(prevSubmitted);
              showToast('Submission reverted.', 'info');
            } else {
              showToast('Failed to revert submission.', 'error');
            }
          })
          .catch(err => console.error('Error reverting submission:', err));
        });
      } else {
        // Rollback optimistic state
        setSubmittedSegments(prevSubmitted);
        showToast(data.error || 'Failed to submit scores.', 'error');
      }
    })
    .catch(err => {
      console.error('Error submitting segment:', err);
      setSubmittedSegments(prevSubmitted);
      showToast('Connection error. Failed to submit.', 'error');
    });
  };

  const handleInvitation = async (id, action) => {
    const prevInvs = [...invitations];
    const invite = invitations.find(inv => inv.id === id);
    if (!invite) return;

    // Optimistic UI
    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: action } : inv));

    try {
      const res = await fetch(`${API_BASE}/judges/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accepted' ? 'Accepted' : 'Declined' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const msg = action === 'accepted' ? 'Attendance confirmed. Event added to dashboard.' : 'Invitation declined.';
      showToast(msg, action === 'accepted' ? 'success' : 'info', async () => {
        // Undo
        await fetch(`${API_BASE}/judges/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Pending' })
        });
        setInvitations(prevInvs);
      });
    } catch (err) {
      console.error('Failed to update invitation status:', err);
      setInvitations(prevInvs);
      showToast('Failed to update status.', 'error');
    }
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
    padding: '11px 16px',
    borderRadius: '14px',
    color: isActive ? '#fff' : (hoveredLink === linkId ? colors.navy : colors.inkSoft),
    textDecoration: 'none',
    fontSize: '14.5px',
    fontWeight: isActive ? '700' : '600',
    background: isActive ? `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)` : (hoveredLink === linkId ? '#F1F5F9' : 'transparent'),
    transition: 'all 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
    boxShadow: isActive ? '0 10px 25px -4px rgba(30, 45, 74, 0.25)' : 'none',
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

  const filteredEvents = eventsList.filter(e =>
    e.name.toLowerCase().includes(switcherSearch.toLowerCase())
  );

  return (
    <JudgeContext.Provider value={{
      event: selectedEvent,
      participants,
      segments,
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

            {/* Event Switcher */}
            <div style={{ ...eventSwitcherStyle, zIndex: 999 }} ref={dropdownRef}>
              <div
                style={{
                  ...eventSwitcherBtnStyle,
                  backgroundColor: hoveredLink === 'switcher' ? '#fff' : colors.pageBg,
                  border: `1px solid ${hoveredLink === 'switcher' ? colors.accentGlow : colors.borderSoft}`,
                  boxShadow: hoveredLink === 'switcher' ? '0 4px 12px rgba(26,24,20,0.06)' : 'none',
                  transform: hoveredLink === 'switcher' ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={() => setHoveredLink('switcher')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => { setIsDropdownOpen(!isDropdownOpen); setSwitcherSearch(''); }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: colors.navy,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  {eventsLoading ? <span className="material-symbols-rounded" style={{ fontSize: '16px', color: '#fff' }}>hourglass_top</span> : (selectedEvent?.name?.substring(0, 1) || '—')}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.inkMuted, marginBottom: '1px', textAlign: 'left' }}>Assigned Room</div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                    {eventsLoading ? 'Loading rooms...' : (selectedEvent?.name || 'No assigned room')}
                  </div>
                </div>
                <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '18px' }}>unfold_more</span>
              </div>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: `1px solid ${colors.borderSoft}`,
                  borderRadius: '16px',
                  boxShadow: '0 16px 48px rgba(26,24,20,0.12)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  padding: '6px',
                }}>
                  <div style={{ padding: '8px 8px 4px' }}>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-rounded" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: colors.inkMuted }}>search</span>
                      <input
                        type="text"
                        value={switcherSearch}
                        onChange={e => setSwitcherSearch(e.target.value)}
                        placeholder="Search rooms..."
                        onMouseEnter={() => setIsSearchHovered(true)}
                        onMouseLeave={() => setIsSearchHovered(false)}
                        style={{
                          width: '100%',
                          padding: '8px 10px 8px 32px',
                          border: `1px solid ${isSearchHovered ? colors.accent : colors.borderSoft}`,
                          borderRadius: '10px',
                          fontSize: '13px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box'
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredEvents.length === 0 && (
                      <div style={{ padding: '12px 16px', color: colors.inkMuted, fontSize: '13px', textAlign: 'center' }}>No assigned rooms found</div>
                    )}
                    {filteredEvents.map(ev => {
                      const isSelected = ev.id === selectedEventId;
                      const isThisHovered = hoveredLink === `ev-${ev.id}`;
                      return (
                        <div
                          key={ev.id}
                          style={{
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isSelected ? colors.accentBg : (isThisHovered ? colors.pageBg : 'transparent'),
                          }}
                          onMouseEnter={() => setHoveredLink(`ev-${ev.id}`)}
                          onMouseLeave={() => setHoveredLink(null)}
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            setIsDropdownOpen(false);
                            navigate('/judge/dashboard');
                            showToast(`Switched room to "${ev.name}"`, 'info');
                          }}
                        >
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: isSelected ? colors.accent : (isThisHovered ? colors.navySoft : colors.navy),
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontWeight: '700',
                            fontSize: '12px',
                          }}>
                            {ev.name.substring(0, 1)}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                            <div style={{ fontSize: '11px', color: colors.inkMuted }}>{ev.status}</div>
                          </div>
                          {isSelected && <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '16px' }}>check</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
              <Link to="/judge/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flex: 1, overflow: 'hidden' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: colors.navy, color: '#fff', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: '700' }}>{userInitials}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: colors.navy, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
                  <span style={{ fontSize: '11px', color: colors.inkMuted }}>Official Judge</span>
                </div>
              </Link>
              <button
                style={{ background: isLogoutHovered ? colors.borderSoft : 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all 0.22s' }}
                onClick={handleLogout}
                onMouseEnter={() => setIsLogoutHovered(true)}
                onMouseLeave={() => setIsLogoutHovered(false)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>logout</span>
              </button>
            </div>
          </div>
        </aside>

        <main style={mainStyle}>
          {(!selectedEventId && location.pathname !== '/judge/invites' && location.pathname !== '/judge/profile') ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              maxWidth: '500px',
              margin: '0 auto',
              gap: '24px',
              animation: 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: 'rgba(59, 130, 246, 0.08)',
                color: colors.accent,
                display: 'grid',
                placeItems: 'center',
                marginBottom: '8px'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '40px' }}>event_busy</span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.navy, margin: 0, letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>No Active Event</h2>
              <p style={{ fontSize: '15px', color: colors.inkSoft, lineHeight: 1.6, margin: 0 }}>
                You don't have any accepted events yet. Please accept pending invitations to activate your dashboard.
              </p>
              <button
                onClick={() => navigate('/judge/invites')}
                style={{
                  padding: '12px 28px',
                  background: colors.navy,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: '0.2s',
                  boxShadow: '0 4px 12px rgba(15, 31, 61, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.background = colors.navySoft}
                onMouseLeave={(e) => e.target.style.background = colors.navy}
              >
                <span className="material-symbols-rounded">mail</span>
                View Pending Invites
              </button>
            </div>
          ) : (
            <Outlet />
          )}
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