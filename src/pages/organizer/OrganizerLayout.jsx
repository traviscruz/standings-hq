import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { colors } from '../../styles/colors';

const EventContext = createContext();
export const useEventContext = () => useContext(EventContext);
// ... SEED DATA REMAINS UNCHANGED ...

// ─── INITIAL SEED DATA ───────────────────────────────────────────────────────
const SEED_EVENTS = [
  {
    id: 1,
    name: 'Palarong Pambansa 2026',
    type: 'Sports',
    startDate: '2026-12-05',
    startTime: '08:00',
    endDate: '2026-12-06',
    endTime: '17:00',
    description: 'Annual national athletic competition for students across the Philippines.',
    location: 'Cebu City Sports Center, Cebu',
    visibility: 'Public',
    status: 'Upcoming',
    createdAt: '2026-03-10',
  },
  {
    id: 2,
    name: 'Metro Manila Debate Open',
    type: 'Academic',
    startDate: '2026-10-15',
    startTime: '09:00',
    endDate: '2026-10-15',
    endTime: '18:00',
    description: 'An open debate championship for collegiate teams across Metro Manila.',
    location: 'UP Diliman, Quezon City',
    visibility: 'Private',
    status: 'Active',
    createdAt: '2026-02-20',
  },
  {
    id: 3,
    name: 'Quezon City IT Olympics',
    type: 'Technology',
    startDate: '2026-11-20',
    startTime: '08:00',
    endDate: '2026-11-21',
    endTime: '16:00',
    description: 'A battle of tech skills including coding, networking, and cybersecurity.',
    location: 'SMX Convention Center, Pasay',
    visibility: 'Public',
    status: 'Upcoming',
    createdAt: '2026-03-01',
  },
  {
    id: 4,
    name: 'Regional Science Fair 2025',
    type: 'Academic',
    startDate: '2025-08-10',
    startTime: '07:00',
    endDate: '2025-08-11',
    endTime: '17:00',
    description: 'Concluded annual Science Fair for the region. Archived.',
    location: 'University of Science & Tech, Davao',
    visibility: 'Public',
    status: 'Completed',
    createdAt: '2025-06-01',
  },
];

const SEED_PARTICIPANTS = {
  1: [{ id: 101, name: 'Jose Rizal', email: 'jrizal@calamba.ph', team: 'La Solidaridad', status: 'Registered', score: 88.5 }],
  2: [
    { id: 201, name: 'Antonio Luna', email: 'aluna@pharmy.gov', team: 'Sharpshooters', status: 'Registered', score: 94.2 },
    { id: 202, name: 'Emilio Aguinaldo', email: 'emilio@kawit.ph', team: 'Magdalo', status: 'Pending', score: null },
  ],
  3: [{ id: 301, name: 'Andres Bonifacio', email: 'supremo@kkk.org', team: 'Magdiwang', status: 'Pending', score: null }],
  4: [
    { id: 401, name: 'Gabriela Silang', email: 'gsilang@ilocos.ph', team: 'Team Alpha', status: 'Registered', score: 91.0 },
    { id: 402, name: 'Melchora Aquino', email: 'tandang@sora.ph', team: 'Team Beta', status: 'Registered', score: 87.5 },
    { id: 403, name: 'Diego Silang', email: 'diego@ilocos.ph', team: 'Team Alpha', status: 'Registered', score: 82.0 },
  ],
};

const SEED_JUDGES = {
  1: [{ id: 1001, name: 'Sarah Geronimo', role: 'Head Judge', expertise: 'Performance Arts', status: 'Accepted' }],
  2: [
    { id: 2001, name: 'Marian Rivera', role: 'Technical Judge', expertise: 'Argumentation', status: 'Pending' },
    { id: 2002, name: 'Dingdong Dantes', role: 'Head Judge', expertise: 'Logic & Rhetoric', status: 'Accepted' },
  ],
  3: [],
  4: [
    { id: 4001, name: 'Dr. Jose Reyes', role: 'Head Judge', expertise: 'Applied Sciences', status: 'Accepted' },
    { id: 4002, name: 'Prof. Ana Santos', role: 'Line Judge', expertise: 'Mathematics', status: 'Accepted' },
  ],
};

const SEED_RUBRICS = {
  1: [
    { id: 1, name: 'Athleticism & Technique', weight: 40, description: 'Precision and mastery of athletic skills.' },
    { id: 2, name: 'Teamwork & Coordination', weight: 30, description: 'Synchronization and collaborative effort.' },
    { id: 3, name: 'Showmanship', weight: 20, description: 'Energy, confidence, and stage presence.' },
    { id: 4, name: 'Costume & Props', weight: 10, description: 'Relevance and aesthetics of attire and stage design.' },
  ],
  2: [
    { id: 1, name: 'Content & Logic', weight: 40, description: 'Accuracy, relevance, and strength of arguments.' },
    { id: 2, name: 'Delivery & Rebuttal', weight: 35, description: 'Clarity, pace, and ability to counter arguments.' },
    { id: 3, name: 'Research & Evidence', weight: 25, description: 'Quality of sources and factual support used.' },
  ],
  3: [],
  4: [
    { id: 1, name: 'Scientific Method', weight: 35, description: 'Proper hypothesis, methodology and analysis.' },
    { id: 2, name: 'Innovation', weight: 35, description: 'Uniqueness and real-world applicability of the study.' },
    { id: 3, name: 'Presentation', weight: 30, description: 'Visual design and clarity of communication.' },
  ],
};

export default function OrganizerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const [eventsList, setEventsList] = useState(SEED_EVENTS);
  const [participantsData, setParticipantsData] = useState(SEED_PARTICIPANTS);
  const [judgesData, setJudgesData] = useState(SEED_JUDGES);
  const [rubricsData, setRubricsData] = useState(SEED_RUBRICS);
  const [toast, setToast] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(2); // Start on the active one

  const selectedEvent = eventsList.find(e => e.id === selectedEventId) || eventsList[0];
  const userName = localStorage.getItem('username') || 'Event Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  const getParticipants = (id = selectedEventId) => participantsData[id] || [];
  const getJudges = (id = selectedEventId) => judgesData[id] || [];
  const getRubrics = (id = selectedEventId) => rubricsData[id] || [];

  // ─── CRUD HELPERS ──────────────────────────────────────────────────────────
  const addParticipant = (eventId, p) =>
    setParticipantsData(prev => ({ ...prev, [eventId]: [p, ...(prev[eventId] || [])] }));
  const removeParticipant = (eventId, pid) =>
    setParticipantsData(prev => ({ ...prev, [eventId]: (prev[eventId] || []).filter(x => x.id !== pid) }));
  const updateParticipant = (eventId, pid, changes) =>
    setParticipantsData(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || []).map(x => x.id === pid ? { ...x, ...changes } : x)
    }));

  const addJudge = (eventId, j) =>
    setJudgesData(prev => ({ ...prev, [eventId]: [j, ...(prev[eventId] || [])] }));
  const removeJudge = (eventId, jid) =>
    setJudgesData(prev => ({ ...prev, [eventId]: (prev[eventId] || []).filter(x => x.id !== jid) }));
  const updateJudge = (eventId, jid, changes) =>
    setJudgesData(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || []).map(x => x.id === jid ? { ...x, ...changes } : x)
    }));

  const setRubrics = (eventId, criteria) =>
    setRubricsData(prev => ({ ...prev, [eventId]: criteria }));

  const addEvent = (eventData, isRestore = false) => {
    const newId = isRestore ? eventData.id : Date.now();
    const newEvent = isRestore ? eventData : { ...eventData, id: newId, status: 'Upcoming', createdAt: new Date().toISOString().split('T')[0] };
    setEventsList(prev => [newEvent, ...prev]);
    if (!isRestore) {
      setParticipantsData(prev => ({ ...prev, [newId]: [] }));
      setJudgesData(prev => ({ ...prev, [newId]: [] }));
      setRubricsData(prev => ({ ...prev, [newId]: [] }));
    }
    setSelectedEventId(newId);
    return newId;
  };

  const updateEvent = (eventId, changes) =>
    setEventsList(prev => prev.map(e => e.id === eventId ? { ...e, ...changes } : e));

  const deleteEvent = (eventId) => {
    setEventsList(prev => prev.filter(e => e.id !== eventId));
    if (selectedEventId === eventId) {
      const remaining = eventsList.filter(e => e.id !== eventId);
      if (remaining.length > 0) setSelectedEventId(remaining[0].id);
    }
  };

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'info', onUndo = null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type, onUndo });
    timeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  // Window Resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar/dropdown on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isMobile = windowWidth <= 768;

  /* ── Styles ── */
  const styles = {
    layout: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: colors.pageBg,
      fontFamily: "'Inter', system-ui, sans-serif",
      color: colors.inkSoft,
      flexDirection: isMobile ? 'column' : 'row',
    },
    sidebar: {
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
    },
    sidebarHeader: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    brand: {
      fontSize: '18px',
      fontWeight: '800',
      color: colors.navy,
      letterSpacing: '-0.03em',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    eventSwitcher: {
      position: 'relative',
      width: '100%',
    },
    eventSwitcherBtn: (hovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '10px 12px',
      backgroundColor: hovered ? '#FFFFFF' : colors.pageBg,
      border: `1px solid ${hovered ? colors.accentGlow : colors.borderSoft}`,
      borderRadius: '14px',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: hovered ? '0 4px 12px rgba(26,24,20,0.06)' : 'none',
      transform: hovered ? 'translateY(-1px)' : 'none',
    }),
    eventSwitcherIcon: {
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
    },
    eventSwitcherLabel: {
      fontSize: '10px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: colors.inkMuted,
      marginBottom: '1px',
    },
    eventSwitcherName: {
      fontSize: '13.5px',
      fontWeight: '600',
      color: colors.navy,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'left',
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      right: 0,
      background: '#fff',
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: '16px',
      boxShadow: '0 16px 48px rgba(26,24,20,0.12)',
      zIndex: 110,
      overflow: 'hidden',
      padding: '6px',
      animation: 'pillDrop 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    eventOption: (selected, hovered) => ({
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: selected ? colors.accentBg : (hovered ? colors.pageBg : 'transparent'),
    }),
    sidebarNav: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    navSectionTitle: {
      fontSize: '10.5px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.inkMuted,
      margin: '20px 0 8px 12px',
    },
    sidebarLink: (isActive, linkId) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '11px 16px',
      borderRadius: '14px',
      color: isActive ? '#fff' : (hoveredLink === linkId ? colors.navy : colors.inkSoft),
      textDecoration: 'none',
      fontSize: '14.5px',
      fontWeight: isActive ? '700' : '600',
      background: isActive ? `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)` : (hoveredLink === linkId ? colors.pageBg : 'transparent'),
      transition: 'all 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      boxShadow: isActive ? '0 10px 25px -4px rgba(30, 45, 74, 0.25)' : 'none',
      position: 'relative',
    }),
    sidebarBadge: {
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
    },
    sidebarFooter: {
      padding: '16px',
      borderTop: `1px solid ${colors.borderSoft}`,
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      borderRadius: '14px',
      background: colors.pageBg,
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: colors.accent,
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      fontSize: '13px',
      fontWeight: '700',
    },
    userName: {
      fontSize: '13px',
      fontWeight: '600',
      color: colors.navy,
      display: 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    userRole: {
      fontSize: '11px',
      color: colors.inkMuted,
    },
    mobileHeader: {
      display: isMobile ? 'flex' : 'none',
      padding: '14px 20px',
      background: '#fff',
      borderBottom: `1px solid ${colors.borderSoft}`,
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 50,
      flexShrink: 0,
    },
    main: {
      flex: 1,
      padding: isMobile ? '24px 20px' : '48px',
      overflowY: 'auto',
      position: 'relative',
    },
    notificationContainer: {
      position: 'fixed',
      top: isMobile ? '16px' : '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'center',
      width: isMobile ? 'calc(100% - 32px)' : 'auto',
      pointerEvents: 'none',
    },
    notificationPill: (type) => ({
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '10px 20px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '100px',
      color: '#fff',
      minWidth: isMobile ? '100%' : '320px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      animation: 'pillDrop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      position: 'relative',
      overflow: 'hidden',
    }),
  };

  const filteredEvents = eventsList.filter(e =>
    e.name.toLowerCase().includes(switcherSearch.toLowerCase())
  );

  const pCount = getParticipants().length;
  const jCount = getJudges().length;

  const contextValue = {
    selectedEvent, eventsList,
    participants: getParticipants(), judges: getJudges(), rubrics: getRubrics(),
    getParticipants, getJudges, getRubrics,
    addParticipant, removeParticipant, updateParticipant,
    addJudge, removeJudge, updateJudge,
    setRubrics,
    addEvent, updateEvent, deleteEvent,
    setSelectedEventId,
    showToast,
  };

  return (
    <EventContext.Provider value={contextValue}>
      <style>
        {`
          @keyframes pillDrop { from { opacity: 0; transform: translateY(-20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes pillTimer { from { transform: scaleX(1); } to { transform: scaleX(0); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } }
          .pill-timer-anim { animation: pillTimer 5s linear forwards; }
          .slide-up-anim { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        `}
      </style>
      <div style={styles.layout}>

        {/* Mobile Header */}
        <div style={styles.mobileHeader}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ background: colors.navy, width: '28px', height: '28px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
              </svg>
            </div>
            <span style={{ ...styles.brand, fontSize: '18px' }}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
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
            position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.45)',
            backdropFilter: 'blur(4px)', zIndex: 90
          }} />
        )}

        {/* ── SIDEBAR ── */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div style={{ background: colors.navy, width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
                  </svg>
                </div>
                <span style={{ ...styles.brand, fontSize: '20px' }}>Standings<span style={{ color: colors.accent }}>HQ</span></span>
              </Link>
              {isSidebarOpen && isMobile && (
                <button
                  style={{ background: isMenuHovered ? colors.borderSoft : 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all 0.22s', marginLeft: 'auto' }}
                  onClick={() => setIsSidebarOpen(false)}
                  onMouseEnter={() => setIsMenuHovered(true)}
                  onMouseLeave={() => setIsMenuHovered(false)}
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              )}
            </div>

            {/* Event Switcher */}
            <div style={styles.eventSwitcher} ref={dropdownRef}>
              <div
                style={styles.eventSwitcherBtn(hoveredLink === 'switcher')}
                onMouseEnter={() => setHoveredLink('switcher')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => { setIsDropdownOpen(!isDropdownOpen); setSwitcherSearch(''); }}
              >
                <div style={styles.eventSwitcherIcon}>{selectedEvent.name.substring(0, 1)}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={styles.eventSwitcherLabel}>Workspace</div>
                  <div style={styles.eventSwitcherName}>{selectedEvent.name}</div>
                </div>
                <span className="material-symbols-rounded" style={{ color: colors.inkMuted, fontSize: '18px' }}>unfold_more</span>
              </div>

              {isDropdownOpen && (
                <div style={styles.dropdown}>
                  <div style={{ padding: '8px 8px 4px' }}>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-rounded" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: colors.inkMuted }}>search</span>
                      <input
                        type="text"
                        value={switcherSearch}
                        onChange={e => setSwitcherSearch(e.target.value)}
                        placeholder="Search events..."
                        onMouseEnter={() => setIsSearchHovered(true)}
                        onMouseLeave={() => setIsSearchHovered(false)}
                        style={{
                          width: '100%',
                          padding: '8px 10px 8px 32px',
                          border: `1px solid ${isSearchHovered ? colors.accent : colors.borderSoft}`,
                          borderRadius: '10px',
                          fontSize: '13px',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {filteredEvents.length === 0 && (
                      <div style={{ padding: '12px 16px', color: colors.inkMuted, fontSize: '13px', textAlign: 'center' }}>No events found</div>
                    )}
                    {filteredEvents.map(ev => {
                      const isSelected = ev.id === selectedEventId;
                      const isThisHovered = hoveredLink === `ev-${ev.id}`;
                      return (
                        <div
                          key={ev.id}
                          style={styles.eventOption(isSelected, isThisHovered)}
                          onMouseEnter={() => setHoveredLink(`ev-${ev.id}`)}
                          onMouseLeave={() => setHoveredLink(null)}
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            setIsDropdownOpen(false);
                            navigate('/organizer/dashboard');
                            showToast(`Switched to "${ev.name}"`, 'info');
                          }}
                        >
                          <div style={{ ...styles.eventSwitcherIcon, background: isSelected ? colors.accent : (isThisHovered ? colors.navySoft : colors.navy), width: '28px', height: '28px', fontSize: '12px' }}>
                            {ev.name.substring(0, 1)}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                            <div style={{ fontSize: '11px', color: colors.inkMuted }}>{ev.status}</div>
                          </div>
                          {isSelected && <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '16px' }}>check</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: '4px 8px 8px', borderTop: `1px solid ${colors.borderSoft}` }}>
                    <div
                      style={{
                        ...styles.eventOption(false, hoveredLink === 'create-ev'),
                        color: colors.accent,
                        fontWeight: 600,
                        gap: '10px'
                      }}
                      onMouseEnter={() => setHoveredLink('create-ev')}
                      onMouseLeave={() => setHoveredLink(null)}
                      onClick={() => { setIsDropdownOpen(false); navigate('/organizer/events/create'); }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add_circle</span>
                      <span style={{ fontSize: '13px' }}>Create New Event</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nav Links */}
          <nav style={styles.sidebarNav}>
            <div style={styles.navSectionTitle}>Overview</div>
            <NavLink
              to="/organizer/dashboard"
              style={({ isActive }) => styles.sidebarLink(isActive, 'dashboard')}
              onMouseEnter={() => setHoveredLink('dashboard')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>space_dashboard</span>
              Dashboard
            </NavLink>
            <NavLink
              to="/organizer/analytics"
              style={({ isActive }) => styles.sidebarLink(isActive, 'analytics')}
              onMouseEnter={() => setHoveredLink('analytics')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>analytics</span>
              Analytics & Insights
            </NavLink>

            <div style={styles.navSectionTitle}>Event Configuration</div>
            <NavLink
              to="/organizer/events/manage"
              style={({ isActive }) => styles.sidebarLink(isActive, 'manage')}
              onMouseEnter={() => setHoveredLink('manage')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>calendar_month</span>
              My Events
            </NavLink>
            <NavLink
              to="/organizer/events/settings"
              style={({ isActive }) => styles.sidebarLink(isActive, 'settings')}
              onMouseEnter={() => setHoveredLink('settings')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>settings</span>
              Event Settings
            </NavLink>
            <NavLink
              to="/organizer/rubrics"
              style={({ isActive }) => styles.sidebarLink(isActive, 'rubrics')}
              onMouseEnter={() => setHoveredLink('rubrics')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>rule</span>
              Rubrics & Scoring
            </NavLink>

            <div style={styles.navSectionTitle}>People & Scoring</div>
            <NavLink
              to="/organizer/participants"
              style={({ isActive }) => styles.sidebarLink(isActive, 'participants')}
              onMouseEnter={() => setHoveredLink('participants')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>groups</span>
              Participants {pCount > 0 && <span style={styles.sidebarBadge}>{pCount}</span>}
            </NavLink>
            <NavLink
              to="/organizer/judges"
              style={({ isActive }) => styles.sidebarLink(isActive, 'judges')}
              onMouseEnter={() => setHoveredLink('judges')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>gavel</span>
              Judges {jCount > 0 && <span style={styles.sidebarBadge}>{jCount}</span>}
            </NavLink>

            <div style={styles.navSectionTitle}>Post-Event</div>
            <NavLink
              to="/organizer/results"
              style={({ isActive }) => styles.sidebarLink(isActive, 'results')}
              onMouseEnter={() => setHoveredLink('results')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>leaderboard</span>
              Results & Standings
            </NavLink>
            <NavLink
              to="/organizer/certificates"
              style={({ isActive }) => styles.sidebarLink(isActive, 'certs')}
              onMouseEnter={() => setHoveredLink('certs')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>workspace_premium</span>
              Certificates
            </NavLink>
            <NavLink
              to="/organizer/publish"
              style={({ isActive }) => styles.sidebarLink(isActive, 'publish')}
              onMouseEnter={() => setHoveredLink('publish')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>campaign</span>
              Publish Hub
            </NavLink>
          </nav>

          {/* User Footer */}
          <div style={styles.sidebarFooter}>
            <div style={styles.userProfile}>
              <Link to="/organizer/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flex: 1, overflow: 'hidden' }}>
                <div style={styles.userAvatar}>{userInitials}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <span style={styles.userName}>{userName}</span>
                  <span style={styles.userRole}>Organizer Agent</span>
                </div>
              </Link>
              <button
                style={{ background: isLogoutHovered ? colors.borderSoft : 'none', border: 'none', cursor: 'pointer', display: 'flex', color: colors.inkMuted, padding: '6px', borderRadius: '50%', transition: 'all 0.22s' }}
                onClick={() => { navigate('/'); showToast('Signed out. See you!', 'info'); }}
                onMouseEnter={() => setIsLogoutHovered(true)}
                onMouseLeave={() => setIsLogoutHovered(false)}
                title="Sign out"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={styles.main}>
          <div key={location.pathname} className="slide-up-anim">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── TOAST HUD ── */}
      {toast && (
        <div style={styles.notificationContainer}>
          <div style={styles.notificationPill(toast.type)}>
            <span className="material-symbols-rounded" style={{
              color: toast.type === 'success' ? '#4ade80' : toast.type === 'error' ? '#f87171' : '#60a5fa'
            }}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 500, flex: 1 }}>{toast.message}</span>
            {toast.onUndo && (
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '8px'
                }}
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
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.05)' }}>
              <div
                className="pill-timer-anim"
                style={{
                  height: '100%',
                  width: '100%',
                  background: toast.type === 'success' ? '#22c55e' : (toast.type === 'error' ? '#ef4444' : colors.accent),
                  transformOrigin: 'left'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </EventContext.Provider>
  );
}
