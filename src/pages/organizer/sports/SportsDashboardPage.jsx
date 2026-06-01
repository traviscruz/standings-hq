import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../../../styles/colors';
import { createClient } from '../../../utils/supabase/client';
import { API_URL as API_BASE } from '../../../config';

const BRACKET_LABELS = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  round_robin: 'Round Robin',
  swiss: 'Swiss',
  null: 'No Bracket',
};

function BracketView({ brackets, teams }) {
  if (!brackets || brackets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: colors.inkMuted }}>
        <span className="material-symbols-rounded" style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>bracket</span>
        <p>No bracket generated yet.</p>
      </div>
    );
  }

  const rounds = [...new Set(brackets.map(b => b.round_number))].sort((a, b) => a - b);
  const positiveRounds = rounds.filter(r => r > 0);
  const negativeRounds = rounds.filter(r => r < 0);

  const renderBracketCol = (roundBrackets, label) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.inkMuted, marginBottom: '4px', textAlign: 'center' }}>{label}</div>
      {roundBrackets.map(b => {
        const ta = b.team_a;
        const tb = b.team_b;
        const winner = b.winner;
        return (
          <div key={b.id} style={{
            background: '#fff', border: `1px solid ${b.status === 'completed' ? colors.success + '40' : colors.borderSoft}`,
            borderRadius: '14px', padding: '12px', boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
          }}>
            <div style={{ fontSize: '10px', color: colors.inkMuted, marginBottom: '8px' }}>Match {b.match_number}</div>
            {[ta, tb].map((team, idx) => {
              const isTop = idx === 0;
              const isWinner = winner && winner.id === team?.id;
              const scoreVal = isTop
                ? (b.team_a_score?.total ?? b.team_a_score?.score ?? (typeof b.team_a_score === 'number' ? b.team_a_score : null))
                : (b.team_b_score?.total ?? b.team_b_score?.score ?? (typeof b.team_b_score === 'number' ? b.team_b_score : null));
              const showScore = b.status !== 'pending' || scoreVal !== undefined;

              return (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
                  borderRadius: '8px', marginBottom: idx === 0 ? '4px' : 0,
                  background: isWinner ? colors.successBg : 'transparent',
                  border: `1px solid ${isWinner ? colors.success + '30' : 'transparent'}`,
                }}>
                  {team ? (
                    <>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px', background: colors.accentBg,
                        display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: '700', color: colors.accent,
                      }}>{team.name?.charAt(0)}</div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: colors.navy, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
                      
                      {showScore && (
                        <span style={{ fontSize: '12px', fontWeight: '800', color: isWinner ? colors.success : colors.navy, marginRight: 4, fontFamily: "'DM Sans', monospace" }}>
                          {scoreVal ?? 0}
                        </span>
                      )}

                      {isWinner && (
                        <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.success }}>emoji_events</span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '12px', color: colors.inkMuted, fontStyle: 'italic' }}>TBD</span>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px',
                background: b.status === 'completed' ? colors.successBg : b.status === 'in_progress' ? colors.accentBg : colors.pageBg,
                color: b.status === 'completed' ? colors.success : b.status === 'in_progress' ? colors.accent : colors.inkMuted,
              }}>{b.status?.replace('_', ' ')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
      {negativeRounds.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Losers Bracket</p>
          <div style={{ display: 'flex', gap: '32px' }}>
            {negativeRounds.map(r => {
              const roundBrackets = brackets.filter(b => b.round_number === r);
              return renderBracketCol(roundBrackets, `Losers R${Math.abs(r)}`);
            })}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '32px' }}>
        {positiveRounds.map(r => {
          const roundBrackets = brackets.filter(b => b.round_number === r);
          return renderBracketCol(roundBrackets, r === Math.max(...positiveRounds) ? 'Final' : `Round ${r}`);
        })}
      </div>
    </div>
  );
}

function LeaderboardView({ brackets, teams }) {
  const standings = React.useMemo(() => {
    const stats = {};
    teams.forEach(t => {
      stats[t.id] = { team: t, wins: 0, losses: 0, played: 0 };
    });
    brackets.filter(b => b.status === 'completed' && b.winner).forEach(b => {
      const winnerId = b.winner?.id;
      const loserId = winnerId === b.team_a?.id ? b.team_b?.id : b.team_a?.id;
      if (stats[winnerId]) { stats[winnerId].wins++; stats[winnerId].played++; }
      if (loserId && stats[loserId]) { stats[loserId].losses++; stats[loserId].played++; }
    });
    return Object.values(stats).sort((a, b) => b.wins - a.wins || a.losses - b.losses);
  }, [brackets, teams]);

  if (standings.length === 0) {
    return <div style={{ textAlign: 'center', padding: '48px', color: colors.inkMuted }}>No teams to display.</div>;
  }

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: `1px solid ${colors.borderSoft}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 60px', gap: '0', background: colors.navy, padding: '12px 20px' }}>
          {['#', 'Team', 'W', 'L', 'P'].map(h => (
            <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Team' ? 'left' : 'center' }}>{h}</div>
          ))}
        </div>
        {standings.map((s, i) => (
          <div key={s.team.id} style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 60px', gap: '0',
            padding: '14px 20px', borderBottom: i < standings.length - 1 ? `1px solid ${colors.borderSoft}` : 'none',
            background: i === 0 ? 'rgba(16,185,129,0.03)' : '#fff',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: i === 0 ? colors.success : colors.inkMuted, textAlign: 'center', alignSelf: 'center' }}>
              {i === 0 ? '🏆' : i + 1}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: colors.accentBg, display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: '700', color: colors.accent, flexShrink: 0 }}>
                {s.team.name?.charAt(0)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: colors.navy }}>{s.team.name}</span>
            </div>
            {[s.wins, s.losses, s.played].map((val, vi) => (
              <div key={vi} style={{ fontSize: '13px', fontWeight: vi === 0 ? '700' : '500', color: vi === 0 ? colors.success : vi === 1 ? colors.error : colors.inkSoft, textAlign: 'center', alignSelf: 'center' }}>{val}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SportsDashboardPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const supabase = createClient();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [brackets, setBrackets] = useState([]);
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [judges, setJudges] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    supabase.from('events').select('*').eq('id', eventId).single()
      .then(({ data }) => { setEvent(data); setLoading(false); });
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    setDataLoading(true);
    Promise.all([
      fetch(`${API_BASE}/sports/brackets?event_id=${eventId}`).then(r => r.json()),
      fetch(`${API_BASE}/sports/teams?event_id=${eventId}`).then(r => r.json()),
      fetch(`${API_BASE}/participants?event_id=${eventId}`).then(r => r.json()),
      fetch(`${API_BASE}/judges?event_id=${eventId}`).then(r => r.json()),
    ]).then(([bRes, tRes, pRes, jRes]) => {
      if (bRes.success) setBrackets(bRes.data);
      if (tRes.success) setTeams(tRes.data);
      if (pRes.success) setParticipants(pRes.data);
      if (jRes.success) setJudges(jRes.data);
    }).catch(console.error)
      .finally(() => setDataLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ height: '80px', background: colors.pageBg, borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  if (!event) {
    return <div style={{ textAlign: 'center', padding: '80px', color: colors.inkMuted }}>Event not found.</div>;
  }

  const sport = event.sport_config || {};
  const ss = sport.scoring_sheet || {};
  const pt = ss.period_tracking || {};
  const teamCount = teams.length;
  const completedMatches = brackets.filter(b => b.status === 'completed').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'bracket', label: 'Bracket', icon: 'bracket' },
    { id: 'scoring', label: 'Scoring', icon: 'edit_note' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
    { id: 'participants', label: 'Participants', icon: 'groups' },
    { id: 'scorers', label: 'Scorers', icon: 'gavel' },
  ];

  const cardStyle = {
    background: '#fff', borderRadius: '20px', padding: '24px',
    border: `1px solid ${colors.borderSoft}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/organizer/sports/events')} style={{ background: 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', padding: '0 0 12px', fontWeight: '500' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>arrow_back</span>
          My Sports Events
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navySoft})`,
            display: 'grid', placeItems: 'center',
          }}>
            <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: '26px' }}>sports</span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: colors.navy, margin: '0 0 4px', fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '-0.02em' }}>{event.name}</h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {sport.display_name && <span style={{ fontSize: '13px', color: colors.inkMuted }}>{sport.display_name} · {sport.ruleset}</span>}
              <span style={{
                fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '100px',
                background: event.status === 'ongoing' ? colors.successBg : colors.accentBg,
                color: event.status === 'ongoing' ? colors.success : colors.accent,
              }}>{event.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '2px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px',
              fontWeight: activeTab === tab.id ? '700' : '500', whiteSpace: 'nowrap',
              background: activeTab === tab.id ? colors.navy : 'transparent',
              color: activeTab === tab.id ? '#fff' : colors.inkSoft,
              transition: 'all 0.18s',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: 'groups', label: 'Teams', value: teamCount, color: colors.accent },
            { icon: 'person', label: 'Participants', value: participants.length, color: '#7A5C8A' },
            { icon: 'sports_score', label: 'Matches', value: brackets.filter(b => b.round_number > 0).length, color: colors.navy },
            { icon: 'check_circle', label: 'Completed', value: completedMatches, color: colors.success },
            { icon: 'gavel', label: 'Scorers', value: judges.length, color: colors.warning },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color + '15', display: 'grid', placeItems: 'center', marginBottom: '8px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '22px', color }}>{icon}</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: colors.navy }}>{value}</div>
              <div style={{ fontSize: '12px', color: colors.inkMuted }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bracket' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '700', color: colors.navy, fontSize: '16px' }}>
              {BRACKET_LABELS[String(sport.structure?.bracket_type)] || 'Bracket'}
            </h3>
          </div>
          {dataLoading ? <p style={{ color: colors.inkMuted }}>Loading bracket...</p> : <BracketView brackets={brackets} teams={teams} />}
        </div>
      )}

      {activeTab === 'scoring' && (
        <div>
          <div style={{ marginBottom: '12px', fontSize: '13px', color: colors.inkMuted }}>
            Click any match to open the live scoring sheet.
          </div>
          {dataLoading ? <p style={{ color: colors.inkMuted }}>Loading matches...</p> : brackets.filter(b => b.round_number > 0).length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px', color: colors.inkMuted }}>No matches generated yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {brackets.filter(b => b.round_number > 0).map(b => {
                const ta = b.team_a;
                const tb = b.team_b;
                return (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/organizer/sports/score/${b.id}`)}
                    style={{
                      ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px',
                      cursor: 'pointer', transition: 'all 0.2s', padding: '16px 20px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accentGlow; e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = colors.borderSoft; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase' }}>Round {b.round_number}</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: colors.navy }}>M{b.match_number}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: ta ? colors.navy : colors.inkMuted }}>{ta?.name || 'TBD'}</div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: colors.inkMuted, padding: '4px 8px', background: colors.pageBg, borderRadius: '8px' }}>vs</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: tb ? colors.navy : colors.inkMuted }}>{tb?.name || 'TBD'}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', flexShrink: 0,
                      background: b.status === 'completed' ? colors.successBg : b.status === 'in_progress' ? colors.accentBg : colors.pageBg,
                      color: b.status === 'completed' ? colors.success : b.status === 'in_progress' ? colors.accent : colors.inkMuted,
                    }}>{b.status?.replace('_', ' ')}</span>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', color: colors.inkMuted }}>chevron_right</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px', fontWeight: '700', color: colors.navy, fontSize: '16px' }}>Standings</h3>
          {dataLoading ? <p style={{ color: colors.inkMuted }}>Loading standings...</p> : <LeaderboardView brackets={brackets} teams={teams} />}
        </div>
      )}

      {activeTab === 'participants' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '700', color: colors.navy, fontSize: '16px' }}>Participants ({participants.length})</h3>
            <button
              onClick={() => { localStorage.setItem('selected_event_id', eventId); navigate('/organizer/participants'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: colors.navy, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>open_in_new</span>
              Manage
            </button>
          </div>
          {participants.length === 0 ? (
            <p style={{ color: colors.inkMuted, textAlign: 'center', padding: '32px' }}>No participants registered yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {participants.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: colors.pageBg, borderRadius: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: colors.accentBg, display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: '700', color: colors.accent }}>{p.name?.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: colors.navy }}>{p.name}</div>
                    {p.team && <div style={{ fontSize: '11px', color: colors.inkMuted }}>{p.team}</div>}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '100px', background: p.status === 'Registered' ? colors.successBg : colors.pageBg, color: p.status === 'Registered' ? colors.success : colors.inkMuted }}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'scorers' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '700', color: colors.navy, fontSize: '16px' }}>Scorer ({judges.length})</h3>
            <button
              onClick={() => { localStorage.setItem('selected_event_id', eventId); navigate('/organizer/judges'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: colors.navy, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>open_in_new</span>
              Manage
            </button>
          </div>
          {judges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: colors.inkMuted, marginBottom: '16px' }}>No scorer assigned yet. Sports events need 1 scorer.</p>
              <button
                onClick={() => { localStorage.setItem('selected_event_id', eventId); navigate('/organizer/judges'); }}
                style={{ padding: '10px 20px', background: colors.navy, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              >
                Assign Scorer
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {judges.map(j => (
                <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: colors.pageBg, borderRadius: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.navy, display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: '700', color: '#fff' }}>{j.name?.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: colors.navy }}>{j.name}</div>
                    <div style={{ fontSize: '11px', color: colors.inkMuted }}>{j.email} · {j.role || 'Scorer'}</div>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px',
                    background: j.status === 'Accepted' ? colors.successBg : j.status === 'Declined' ? colors.errorBg : colors.warningBg,
                    color: j.status === 'Accepted' ? colors.success : j.status === 'Declined' ? colors.error : colors.warning,
                  }}>{j.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
