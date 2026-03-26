import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import '../../styles/organizer.css';

const EventContext = createContext();
export const useEventContext = () => useContext(EventContext);

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
  const [isSwitcherSearchOpen, setIsSwitcherSearchOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const [eventsList, setEventsList] = useState(SEED_EVENTS);
  const [participantsData, setParticipantsData] = useState(SEED_PARTICIPANTS);
  const [judgesData, setJudgesData] = useState(SEED_JUDGES);
  const [rubricsData, setRubricsData] = useState(SEED_RUBRICS);
  const [toast, setToast] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(2); // Start on the active one

  const selectedEvent = eventsList.find(e => e.id === selectedEventId) || eventsList[0];

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
            {/* Logo */}
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

            {/* Event Switcher */}
            <div className="event-switcher" ref={dropdownRef}>
              <div className="event-switcher-btn" onClick={() => { setIsDropdownOpen(!isDropdownOpen); setSwitcherSearch(''); }}>
                <div className="event-switcher-icon">{selectedEvent.name.substring(0, 1)}</div>
                <div className="event-switcher-info">
                  <div className="event-switcher-label">Workspace</div>
                  <div className="event-switcher-name">{selectedEvent.name}</div>
                </div>
                <span className="material-symbols-rounded" style={{ color: 'var(--ink-muted)', fontSize: '18px' }}>unfold_more</span>
              </div>

              {isDropdownOpen && (
                <div className="event-switcher-dropdown">
                  <div style={{ padding: '8px 8px 4px' }}>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-rounded" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--ink-muted)' }}>search</span>
                      <input
                        type="text"
                        value={switcherSearch}
                        onChange={e => setSwitcherSearch(e.target.value)}
                        placeholder="Search events..."
                        style={{ width: '100%', padding: '8px 10px 8px 32px', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-sm)', fontSize: '13px', outline: 'none' }}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {filteredEvents.length === 0 && (
                      <div style={{ padding: '12px 16px', color: 'var(--ink-muted)', fontSize: '13px', textAlign: 'center' }}>No events found</div>
                    )}
                    {filteredEvents.map(ev => (
                      <div
                        key={ev.id}
                        className={`event-option ${ev.id === selectedEventId ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedEventId(ev.id);
                          setIsDropdownOpen(false);
                          navigate('/organizer/dashboard');
                          showToast(`Switched to "${ev.name}"`, 'info');
                        }}
                      >
                        <div className="event-switcher-icon" style={{ background: ev.id === selectedEventId ? 'var(--accent)' : 'var(--navy)', width: '28px', height: '28px', fontSize: '12px' }}>
                          {ev.name.substring(0, 1)}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{ev.status}</div>
                        </div>
                        {ev.id === selectedEventId && <span className="material-symbols-rounded" style={{ color: 'var(--accent)', fontSize: '16px' }}>check</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '4px 8px 8px', borderTop: '1px solid var(--border-soft)' }}>
                    <div
                      className="event-option"
                      style={{ color: 'var(--accent)', fontWeight: 600 }}
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
          <nav className="sidebar-nav">
            <div className="nav-section-title">Overview</div>
            <NavLink to="/organizer/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">space_dashboard</span>
              Dashboard
            </NavLink>

            <div className="nav-section-title">Event Configuration</div>
            <NavLink to="/organizer/events/manage" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">calendar_month</span>
              My Events
            </NavLink>
            <NavLink to="/organizer/events/settings" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">settings</span>
              Event Settings
            </NavLink>
            <NavLink to="/organizer/rubrics" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">rule</span>
              Rubrics & Scoring
            </NavLink>

            <div className="nav-section-title">People & Scoring</div>
            <NavLink to="/organizer/participants" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">groups</span>
              Participants {pCount > 0 && <span className="sidebar-badge">{pCount}</span>}
            </NavLink>
            <NavLink to="/organizer/judges" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">gavel</span>
              Judges {jCount > 0 && <span className="sidebar-badge">{jCount}</span>}
            </NavLink>

            <div className="nav-section-title">Post-Event</div>
            <NavLink to="/organizer/results" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">leaderboard</span>
              Results & Standings
            </NavLink>
            <NavLink to="/organizer/certificates" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">workspace_premium</span>
              Certificates
            </NavLink>
            <NavLink to="/organizer/publish" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="material-symbols-rounded">campaign</span>
              Publish Hub
            </NavLink>
          </nav>

          {/* User Footer */}
          <div className="sidebar-footer">
            <div className="user-profile-sm">
              <div className="user-avatar">JD</div>
              <div className="user-info">
                <span className="user-name">Juan Dela Cruz</span>
                <span className="user-role">Organizer</span>
              </div>
              <button className="btn-icon" onClick={() => { navigate('/'); showToast('Signed out. See you!', 'info'); }} title="Sign out">
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
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
              <button 
                className="pill-action-btn" 
                onClick={() => { toast.onUndo(); setToast(null); }}
              >
                Undo
              </button>
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
    </EventContext.Provider>
  );
}
