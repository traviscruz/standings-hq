import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { API_URL as API_BASE } from '../../config';
import { createClient } from '../../utils/supabase/client';

const EventContext = createContext();
export const useEventContext = () => useContext(EventContext);
// ... SEED DATA REMAINS UNCHANGED ...


// Normalize DB snake_case → camelCase & capitalize status
const normalizeEvent = (e) => {
  let status = 'Upcoming';
  if (e.status) {
    const dbStatus = e.status.toLowerCase();
    if (dbStatus === 'ongoing' || dbStatus === 'active') {
      status = 'Active';
    } else {
      status = dbStatus.charAt(0).toUpperCase() + dbStatus.slice(1);
    }
  }
  return {
    ...e,
    startDate:  e.start_date  || e.startDate  || '',
    startTime:  e.start_time  || e.startTime  || '',
    endDate:    e.end_date    || e.endDate    || '',
    endTime:    e.end_time    || e.endTime    || '',
    createdAt:  e.created_at  || e.createdAt  || '',
    status,
    visibility: e.visibility  || 'Public',
  };
};

const SEED_PARTICIPANTS = {};
const SEED_JUDGES      = {};

const SEED_RUBRICS = {};

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

  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [participantsData, setParticipantsData] = useState(SEED_PARTICIPANTS);
  const [judgesData, setJudgesData] = useState(SEED_JUDGES);
  const [rubricsData, setRubricsData] = useState(SEED_RUBRICS);
  const [toast, setToast] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Persist selected event whenever it changes
  useEffect(() => {
    if (selectedEventId) localStorage.setItem('selected_event_id', selectedEventId);
  }, [selectedEventId]);
  const [rubricConfig, setRubricConfig] = useState(null);

  const selectedEvent = eventsList.find(e => e.id === selectedEventId) || eventsList[0];
  const userName = localStorage.getItem('username') || 'Event Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  const getParticipants = (id = selectedEventId) => participantsData[id] || [];
  const getJudges = (id = selectedEventId) => judgesData[id] || [];
  const getRubrics = (id = selectedEventId) => {
    if (selectedEventId === id && rubricConfig) {
      return (rubricConfig.rubrics || []).map(r => ({
        ...r,
        name: r.label || r.name
      }));
    }
    return rubricsData[id] || [];
  };

  // ─── CRUD HELPERS ──────────────────────────────────────────────────────────
  const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
  };

  const addParticipant = (eventId, p) => {
    // Generate a temporary local id for optimistic UI
    const tempId = generateId();
    const newP = { ...p, id: tempId };
    setParticipantsData(prev => ({ ...prev, [eventId]: [newP, ...(prev[eventId] || [])] }));
    fetch(`${API_BASE}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Don't pass the user's profile id as the row PK — let the DB generate one
      body: JSON.stringify({ event_id: eventId, name: p.name, email: p.email, team: p.team, score: p.score, status: p.status })
    })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          // Swap temp id with real DB data so future PATCH/DELETE work correctly, and use server resolved name
          setParticipantsData(prev => ({
            ...prev,
            [eventId]: (prev[eventId] || []).map(x => x.id === tempId ? { ...x, ...json.data } : x)
          }));
        }
      })
      .catch(console.error);
  };

  const removeParticipant = (eventId, pid) => {
    setParticipantsData(prev => ({ ...prev, [eventId]: (prev[eventId] || []).filter(x => x.id !== pid) }));
    fetch(`${API_BASE}/participants/${pid}`, { method: 'DELETE' }).catch(console.error);
  };
  const updateParticipant = (eventId, pid, changes) => {
    setParticipantsData(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || []).map(x => x.id === pid ? { ...x, ...changes } : x)
    }));
    fetch(`${API_BASE}/participants/${pid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes)
    }).catch(console.error);
  };

  const addJudge = (eventId, j) => {
    // Generate a temporary local id for optimistic UI
    const tempId = generateId();
    const newJ = { ...j, id: tempId };
    setJudgesData(prev => ({ ...prev, [eventId]: [newJ, ...(prev[eventId] || [])] }));
    fetch(`${API_BASE}/judges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Don't pass the user's profile id as the row PK — let the DB generate one
      body: JSON.stringify({ event_id: eventId, name: j.name, email: j.email, expertise: j.expertise, role: j.role, status: j.status || j.rsvp || 'Pending' })
    })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          // Swap temp id with real DB data so future PATCH/DELETE work correctly, and use server resolved name
          setJudgesData(prev => ({
            ...prev,
            [eventId]: (prev[eventId] || []).map(x => x.id === tempId ? { ...x, ...json.data } : x)
          }));
        }
      })
      .catch(console.error);
  };
  const removeJudge = (eventId, jid) => {
    setJudgesData(prev => ({ ...prev, [eventId]: (prev[eventId] || []).filter(x => x.id !== jid) }));
    fetch(`${API_BASE}/judges/${jid}`, { method: 'DELETE' }).catch(console.error);
  };
  const updateJudge = (eventId, jid, changes) => {
    setJudgesData(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || []).map(x => x.id === jid ? { ...x, ...changes } : x)
    }));
    fetch(`${API_BASE}/judges/${jid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes)
    }).catch(console.error);
  };

  const setRubrics = (eventId, criteria) =>
    setRubricsData(prev => ({ ...prev, [eventId]: criteria }));

  // ─── FETCH EVENTS ON MOUNT ─────────────────────────────────────────────────
  useEffect(() => {
    const organizerId = localStorage.getItem('user_id');
    const url = organizerId
      ? `${API_BASE}/events?organizer_id=${organizerId}`
      : `${API_BASE}/events`;

    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const normalized = json.data.map(normalizeEvent);
          setEventsList(normalized);
          if (normalized.length > 0) {
            // Restore the previously selected event, fall back to first
            const saved = localStorage.getItem('selected_event_id');
            const match = saved && normalized.find(e => e.id === saved);
            setSelectedEventId(match ? match.id : normalized[0].id);
          }
        } else {
          setEventsError(json.error || 'Failed to load events.');
        }
      })
      .catch(err => setEventsError(err.message))
      .finally(() => setEventsLoading(false));
  }, []);

  // Fetch Participants and Judges when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;

    const supabase = createClient();

    fetch(`${API_BASE}/participants?event_id=${selectedEventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setParticipantsData(prev => ({ ...prev, [selectedEventId]: data.data }));
      })
      .catch(console.error);

    fetch(`${API_BASE}/judges?event_id=${selectedEventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setJudgesData(prev => ({ ...prev, [selectedEventId]: data.data }));
      })
      .catch(console.error);

    const fetchRubric = async () => {
      try {
        const { data, error } = await supabase
          .from('event_rubrics')
          .select('*')
          .eq('event_id', selectedEventId)
          .maybeSingle();

        if (error) throw error;
        if (data && data.config) {
          setRubricConfig(data.config);
        } else {
          setRubricConfig(null);
        }
      } catch (err) {
        console.error("Error loading rubric in layout:", err);
        setRubricConfig(null);
      }
    };
    fetchRubric();
  }, [selectedEventId]);

  const addEvent = (eventData, isRestore = false) => {
    const normalized = normalizeEvent(isRestore ? eventData : {
      ...eventData,
      status: 'upcoming',
      created_at: new Date().toISOString(),
    });
    setEventsList(prev => [normalized, ...prev]);
    setSelectedEventId(normalized.id);
    return normalized.id;
  };

  const updateEvent = async (eventId, changes) => {
    // Format db changes to use DB conventions (snake_case and database status values)
    const dbChanges = {};
    for (const key of Object.keys(changes)) {
      // Map frontend camelCase to backend snake_case
      let dbKey = key;
      if (key === 'startDate') dbKey = 'start_date';
      else if (key === 'startTime') dbKey = 'start_time';
      else if (key === 'endDate') dbKey = 'end_date';
      else if (key === 'endTime') dbKey = 'end_time';
      else if (key === 'createdAt') dbKey = 'created_at';

      let val = changes[key];
      if (key === 'status' && val) {
        const s = String(val).toLowerCase();
        if (s === 'active' || s === 'ongoing') val = 'ongoing';
        else if (s === 'upcoming') val = 'upcoming';
        else if (s === 'completed') val = 'completed';
        else if (s === 'cancelled') val = 'cancelled';
      }
      dbChanges[dbKey] = val;
    }

    // Optimistic local update using normalized event
    setEventsList(prev => prev.map(e => {
      if (e.id === eventId) {
        return normalizeEvent({ ...e, ...changes });
      }
      return e;
    }));

    try {
      const res = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbChanges),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update event.');
      }
    } catch (err) {
      console.error('[updateEvent]', err.message);
      throw err;
    }
  };

  const deleteEvent = async (eventId) => {
    // Optimistic local removal
    setEventsList(prev => prev.filter(e => e.id !== eventId));
    if (selectedEventId === eventId) {
      const remaining = eventsList.filter(e => e.id !== eventId);
      if (remaining.length > 0) setSelectedEventId(remaining[0].id);
      else setSelectedEventId(null);
    }
    try {
      await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[deleteEvent]', err.message);
    }
  };

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'info', onUndo = null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type, onUndo });
    timeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
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

  const [isSubscribed, setIsSubscribed] = useState(localStorage.getItem('is_subscribed') === 'true');

  // Verify subscription on mount or navigation if we think they are not subscribed
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    fetch(`${API_BASE}/billing/subscription/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.subscription && (data.subscription.status === 'active' || data.subscription.status === 'cancelled')) {
          setIsSubscribed(true);
          localStorage.setItem('is_subscribed', 'true');
          localStorage.setItem('plan_name', data.subscription.plan_name);
        } else {
          setIsSubscribed(false);
          localStorage.setItem('is_subscribed', 'false');
        }
      })
      .catch(err => console.error('Layout sub check error:', err));
  }, [location.pathname]);

  // Listen to custom events
  useEffect(() => {
    const handleStorageChange = () => setIsSubscribed(localStorage.getItem('is_subscribed') === 'true');
    window.addEventListener('subscriptionChanged', handleStorageChange);
    return () => window.removeEventListener('subscriptionChanged', handleStorageChange);
  }, []);

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
    sidebarLink: (isActive, linkId, disabled = false) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '11px 16px',
      borderRadius: '14px',
      color: isActive ? '#fff' : (hoveredLink === linkId ? (disabled ? colors.inkMuted : colors.navy) : colors.inkSoft),
      textDecoration: 'none',
      fontSize: '14.5px',
      fontWeight: isActive ? '700' : '600',
      background: isActive ? `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)` : (hoveredLink === linkId ? colors.pageBg : 'transparent'),
      transition: 'all 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      boxShadow: isActive ? '0 10px 25px -4px rgba(30, 45, 74, 0.25)' : 'none',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
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
  const maxP = rubricConfig?.maxParticipants;
  const maxJ = rubricConfig?.judges;

  const contextValue = {
    selectedEvent, eventsList, eventsLoading, eventsError,
    participants: getParticipants(), judges: getJudges(), rubrics: getRubrics(),
    getParticipants, getJudges, getRubrics,
    addParticipant, removeParticipant, updateParticipant,
    addJudge, removeJudge, updateJudge,
    setRubrics,
    addEvent, updateEvent, deleteEvent,
    setSelectedEventId,
    showToast,
    rubricConfig,
    setRubricConfig,
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
                <div style={styles.eventSwitcherIcon}>
                  {eventsLoading ? <span className="material-symbols-rounded" style={{ fontSize: '16px', color: '#fff' }}>hourglass_top</span> : (selectedEvent?.name?.substring(0, 1) || '+')}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={styles.eventSwitcherLabel}>Workspace</div>
                  <div style={styles.eventSwitcherName}>
                    {eventsLoading ? 'Loading events…' : (selectedEvent?.name || 'No event selected')}
                  </div>
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
              style={({ isActive }) => styles.sidebarLink(isActive, 'dashboard', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('dashboard')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>space_dashboard</span>
              Dashboard
            </NavLink>
            <NavLink
              to="/organizer/analytics"
              style={({ isActive }) => styles.sidebarLink(isActive, 'analytics', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('analytics')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>analytics</span>
              Analytics & Insights
            </NavLink>

            <div style={styles.navSectionTitle}>Event Configuration</div>
            <NavLink
              to="/organizer/events/manage"
              style={({ isActive }) => styles.sidebarLink(isActive, 'manage', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('manage')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>calendar_month</span>
              My Events
            </NavLink>
            <NavLink
              to="/organizer/events/settings"
              style={({ isActive }) => styles.sidebarLink(isActive, 'settings', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('settings')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>settings</span>
              Event Settings
            </NavLink>
            <NavLink
              to="/organizer/rubrics"
              style={({ isActive }) => styles.sidebarLink(isActive, 'rubrics', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('rubrics')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>rule</span>
              Rubrics & Scoring
            </NavLink>

            <div style={styles.navSectionTitle}>People & Scoring</div>
            <NavLink
              to="/organizer/participants"
              style={({ isActive }) => styles.sidebarLink(isActive, 'participants', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('participants')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>groups</span>
              Participants {(pCount > 0 || maxP) && <span style={styles.sidebarBadge}>{pCount}{maxP ? `/${maxP}` : ''}</span>}
            </NavLink>
            <NavLink
              to="/organizer/judges"
              style={({ isActive }) => styles.sidebarLink(isActive, 'judges', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('judges')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>gavel</span>
              Judges {(jCount > 0 || maxJ) && <span style={styles.sidebarBadge}>{jCount}{maxJ ? `/${maxJ}` : ''}</span>}
            </NavLink>

            <div style={styles.navSectionTitle}>Post-Event</div>
            <NavLink
              to="/organizer/results"
              style={({ isActive }) => styles.sidebarLink(isActive, 'results', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('results')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>leaderboard</span>
              Results & Standings
            </NavLink>
            <NavLink
              to="/organizer/certificates"
              style={({ isActive }) => styles.sidebarLink(isActive, 'certs', !isSubscribed)}
              onMouseEnter={() => setHoveredLink('certs')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>workspace_premium</span>
              Certificates
            </NavLink>
           </nav>

          {!isSubscribed && (
            <div style={{ padding: '0 14px 16px 14px' }}>
              <div style={{ 
                background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)`, 
                padding: '16px', borderRadius: '18px', color: '#fff', 
                boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.3)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '60px' }}>workspace_premium</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '800', marginBottom: '6px', position: 'relative' }}>Pro Plan Required</p>
                <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '14px', lineHeight: 1.4, position: 'relative' }}>To fully experience StandingsHQ, you need to subscribe.</p>
                <button 
                   onClick={() => navigate('/organizer/profile', { state: { activeTab: 'plan' } })}
                   style={{ 
                     width: '100%', padding: '10px', background: colors.accent, border: 'none', 
                     borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: '900', 
                     cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                   }}
                   onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                   onMouseLeave={(e) => e.target.style.transform = 'none'}
                >
                  SUBSCRIBE NOW
                </button>
              </div>
            </div>
          )}

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
                onClick={handleLogout}
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
            {(!isSubscribed && !location.pathname.endsWith('/profile')) ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', textAlign: 'center', maxWidth: '500px', margin: '0 auto', gap: '24px'
              }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(59, 130, 246, 0.1)',
                  color: colors.accent, display: 'grid', placeItems: 'center', marginBottom: '8px'
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '40px' }}>lock</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: colors.navy, margin: 0, letterSpacing: '-0.02em' }}>Feature Locked</h2>
                <p style={{ fontSize: '16px', color: colors.inkSoft, lineHeight: 1.6, margin: 0 }}>
                  To fully experience StandingsHQ and access this feature, you need to subscribe to a Pro plan.
                </p>
                <button
                  onClick={() => navigate('/organizer/profile', { state: { activeTab: 'plan' } })}
                  style={{
                    padding: '16px 32px', background: colors.navy, color: '#fff', border: 'none',
                    borderRadius: '16px', fontWeight: '700', cursor: 'pointer', transition: '0.2s'
                  }}
                >
                  View Subscription Plans
                </button>
              </div>
            ) : (
              <Outlet />
            )}
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
