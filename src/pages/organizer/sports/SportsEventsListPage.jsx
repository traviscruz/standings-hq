import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../styles/colors';
import { createClient } from '../../../utils/supabase/client';

const STATUS_COLORS = {
  upcoming: { bg: 'rgba(59,130,246,0.08)', color: colors.accent, label: 'Upcoming' },
  ongoing: { bg: 'rgba(16,185,129,0.08)', color: colors.success, label: 'Ongoing' },
  completed: { bg: 'rgba(122,92,138,0.08)', color: '#7A5C8A', label: 'Completed' },
  cancelled: { bg: colors.errorBg, color: colors.error, label: 'Cancelled' },
};

export default function SportsEventsListPage() {
  const navigate = useNavigate();
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const organizerId = localStorage.getItem('user_id');
    if (!organizerId) { setLoading(false); return; }

    supabase
      .from('events')
      .select('id, name, type, start_date, end_date, status, location, sport_config')
      .eq('organizer_id', organizerId)
      .eq('competition_category', 'sports')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setEvents(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: colors.navy, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: "'DM Sans', system-ui, sans-serif" }}>My Sports Events</h1>
          <p style={{ fontSize: '14px', color: colors.inkMuted, margin: 0 }}>Loading your sports competitions...</p>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '110px', background: colors.pageBg, borderRadius: '20px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />
        ))}
        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: colors.navy, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            My Sports Events
          </h1>
          <p style={{ fontSize: '14px', color: colors.inkMuted, margin: 0 }}>
            {events.length} sports competition{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/organizer/sports/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: colors.navy, color: '#fff', border: 'none', borderRadius: '14px',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = colors.navySoft}
          onMouseLeave={e => e.currentTarget.style.background = colors.navy}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span>
          New Sports Event
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '64px 32px', textAlign: 'center',
          border: `2px dashed ${colors.border}`,
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '56px', color: colors.border, display: 'block', marginBottom: '16px' }}>sports</span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: colors.navy, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>No sports events yet</h3>
          <p style={{ fontSize: '14px', color: colors.inkMuted, marginBottom: '24px' }}>
            Create an event first, then configure it as a sports competition using the Sports Builder.
          </p>
          <button
            onClick={() => navigate('/organizer/sports/new')}
            style={{
              padding: '12px 28px', background: colors.navy, color: '#fff', border: 'none',
              borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '14px',
            }}
          >
            Set Up Sports Builder
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map(ev => {
            const sport = ev.sport_config;
            const statusInfo = STATUS_COLORS[ev.status] || STATUS_COLORS.upcoming;
            const isHovered = hoveredCard === ev.id;
            return (
              <div
                key={ev.id}
                onClick={() => navigate(`/organizer/sports/events/${ev.id}`)}
                onMouseEnter={() => setHoveredCard(ev.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: '#fff', borderRadius: '20px', padding: '20px 24px',
                  border: `1px solid ${isHovered ? colors.accentGlow : colors.borderSoft}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: isHovered ? '0 8px 24px rgba(15,23,42,0.08)' : '0 2px 8px rgba(15,23,42,0.04)',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '20px',
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.navySoft})`,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                  fontSize: '18px', fontWeight: '800', color: '#fff',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}>
                  {ev.name.charAt(0)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: colors.navy, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {sport && <span style={{ fontSize: '12px', color: colors.inkMuted }}>{sport.display_name} · {sport.ruleset}</span>}
                    {ev.start_date && <span style={{ fontSize: '12px', color: colors.inkMuted }}>📅 {new Date(ev.start_date).toLocaleDateString()}</span>}
                    {ev.location && <span style={{ fontSize: '12px', color: colors.inkMuted }}>📍 {ev.location}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px',
                    background: statusInfo.bg, color: statusInfo.color,
                  }}>{statusInfo.label}</span>
                  {sport?.structure?.bracket_type && sport.structure.bracket_type !== 'null' && (
                    <span style={{ fontSize: '11px', color: colors.inkMuted }}>{sport.structure.bracket_type.replace(/_/g, ' ')}</span>
                  )}
                </div>
                <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.inkMuted }}>chevron_right</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
