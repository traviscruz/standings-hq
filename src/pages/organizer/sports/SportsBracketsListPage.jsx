import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../styles/colors';
import { createClient } from '../../../utils/supabase/client';
import { API_URL as API_BASE } from '../../../config';

export default function SportsBracketsListPage() {
  const navigate = useNavigate();
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [brackets, setBrackets] = useState({});
  const [bracketsLoading, setBracketsLoading] = useState({});

  useEffect(() => {
    const organizerId = localStorage.getItem('user_id');
    if (!organizerId) { setLoading(false); return; }
    supabase
      .from('events')
      .select('id, name, start_date, status, sport_config')
      .eq('organizer_id', organizerId)
      .eq('competition_category', 'sports')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setEvents(data || []); setLoading(false); });
  }, []);

  const loadBrackets = (eventId) => {
    if (brackets[eventId]) return;
    setBracketsLoading(prev => ({ ...prev, [eventId]: true }));
    fetch(`${API_BASE}/sports/brackets?event_id=${eventId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setBrackets(prev => ({ ...prev, [eventId]: data.data })); })
      .catch(console.error)
      .finally(() => setBracketsLoading(prev => ({ ...prev, [eventId]: false })));
  };

  const toggleExpanded = (eventId) => {
    if (expanded === eventId) { setExpanded(null); return; }
    setExpanded(eventId);
    loadBrackets(eventId);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ height: '60px', background: colors.pageBg, borderRadius: '16px', marginBottom: '32px', animation: 'pulse 1.5s infinite' }} />
        {[1, 2].map(i => <div key={i} style={{ height: '80px', background: colors.pageBg, borderRadius: '16px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />)}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: colors.navy, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Brackets</h1>
        <p style={{ fontSize: '14px', color: colors.inkMuted, margin: 0 }}>View bracket trees across all your sports events.</p>
      </div>

      {events.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '24px', padding: '64px 32px', textAlign: 'center', border: `2px dashed ${colors.border}` }}>
          <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '16px' }}>bracket</span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: colors.navy, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>No brackets yet</h3>
          <p style={{ fontSize: '14px', color: colors.inkMuted, marginBottom: '24px' }}>Create a sports event and configure bracket settings to see them here.</p>
          <button onClick={() => navigate('/organizer/sports/new')} style={{ padding: '12px 28px', background: colors.navy, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
            New Sports Event
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map(ev => {
            const sport = ev.sport_config || {};
            const isOpen = expanded === ev.id;
            const evBrackets = (brackets[ev.id] || []).filter(b => b.round_number > 0);
            const loading = bracketsLoading[ev.id];
            return (
              <div key={ev.id} style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${isOpen ? colors.accentGlow : colors.borderSoft}`, overflow: 'hidden', transition: 'all 0.2s' }}>
                <div
                  onClick={() => toggleExpanded(ev.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', cursor: 'pointer' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${colors.navy}, ${colors.navySoft})`, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '16px', fontWeight: '800', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    {ev.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: colors.navy }}>{ev.name}</div>
                    <div style={{ fontSize: '12px', color: colors.inkMuted }}>{sport.display_name} · {sport.structure?.bracket_type?.replace(/_/g, ' ') || 'No bracket'}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/organizer/sports/events/${ev.id}`); }}
                    style={{ padding: '6px 12px', background: colors.accentBg, color: colors.accent, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Open
                  </button>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.inkMuted, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                </div>

                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${colors.borderSoft}` }}>
                    {loading ? (
                      <p style={{ color: colors.inkMuted, paddingTop: '16px' }}>Loading bracket...</p>
                    ) : evBrackets.length === 0 ? (
                      <p style={{ color: colors.inkMuted, paddingTop: '16px', textAlign: 'center' }}>No matches generated for this event.</p>
                    ) : (
                      <div style={{ overflowX: 'auto', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '24px', minWidth: 'max-content' }}>
                          {[...new Set(evBrackets.map(b => b.round_number))].sort((a, b) => a - b).map(round => {
                            const roundMatches = evBrackets.filter(b => b.round_number === round);
                            return (
                              <div key={round} style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', textAlign: 'center', marginBottom: '4px' }}>Round {round}</div>
                                {roundMatches.map(b => (
                                  <div
                                    key={b.id}
                                    onClick={() => navigate(`/organizer/sports/score/${b.id}`)}
                                    style={{ background: colors.pageBg, borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', border: `1px solid ${colors.borderSoft}`, transition: 'all 0.18s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accentGlow; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = colors.borderSoft; }}
                                  >
                                    <div style={{ fontSize: '10px', color: colors.inkMuted, marginBottom: '6px' }}>M{b.match_number}</div>
                                    {[b.team_a, b.team_b].map((team, i) => (
                                      <div key={i} style={{ fontSize: '12px', fontWeight: '600', color: team ? colors.navy : colors.inkMuted, padding: '2px 0', fontStyle: team ? 'normal' : 'italic' }}>
                                        {team?.name || 'TBD'}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
