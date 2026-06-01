import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { API_URL as API_BASE } from '../../config';

const TEAM_COLORS = ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#14B8A6','#F97316'];
const PERIOD_LABELS = ['Quarter','Set','Game','Half','Period','Inning','Round'];
const SPORT_ICONS = {
  basketball: 'sports_basketball', volleyball: 'sports_volleyball', badminton: 'sports',
  football: 'sports_soccer', tennis: 'sports_tennis', 'table tennis': 'sports',
  default: 'emoji_events'
};

export default function SportsSetupPage() {
  const { selectedEvent, participants, showToast, gameSetupConfig, eventsLoading } = useEventContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const isMobile = windowWidth <= 768;

  const [config, setConfig] = useState({
    sportName: selectedEvent?.name || '',
    sportType: '',
    category: 'team',
    description: '',
    teamCount: 4,
    teams: [],
    bracketFormat: 'single_elimination',
    periodsPerMatch: 4,
    periodLabel: 'Quarter',
    winCondition: 'most_points',
    summary: '',
    keyRules: [],
    estimatedDuration: '',
  });

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  // Load existing setup if editing
  useEffect(() => {
    if (gameSetupConfig && gameSetupConfig.sportType) {
      setConfig(prev => ({ ...prev, ...gameSetupConfig }));
      setStep(0);
    }
  }, []);

  // Auto-populate teams from participants
  useEffect(() => {
    const registered = participants.filter(p => p.status === 'Registered');
    if (registered.length > 0 && config.teams.length === 0) {
      const teamNames = [...new Set(
        registered.map(p => p.team?.trim() || p.name?.trim()).filter(Boolean)
      )];
      const teams = teamNames.slice(0, 16).map((name, i) => ({
        id: `team-${i}`,
        name,
        color: TEAM_COLORS[i % TEAM_COLORS.length]
      }));
      setConfig(prev => ({ ...prev, teams, teamCount: teams.length }));
    }
  }, [participants]);

  const merge = (obj) => setConfig(prev => ({ ...prev, ...obj }));

  const getSuggestion = async (isRegen = false) => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/claude/sports-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 0,
          eventTitle: selectedEvent?.name,
          eventDescription: selectedEvent?.description,
          sportName: config.sportName,
          currentConfig: config,
          isRegenerating: isRegen,
        })
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        setAiSuggestion(d);
        merge({
          sportType: d.sportType || config.sportName,
          category: d.category || 'team',
          description: d.description || '',
          periodsPerMatch: d.periodsPerMatch || 4,
          periodLabel: d.periodLabel || 'Quarter',
          winCondition: d.winCondition || 'most_points',
        });
      } else {
        showToast('AI suggestion unavailable. Configure manually.', 'warning');
      }
    } catch {
      showToast('AI unavailable. Configure manually.', 'warning');
    } finally {
      setAiLoading(false);
    }
  };

  const getReviewSuggestion = async () => {
    try {
      const res = await fetch(`${API_BASE}/claude/sports-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 2, eventTitle: selectedEvent?.name, sportName: config.sportType, currentConfig: config })
      });
      const json = await res.json();
      if (json.success) {
        setReviewData(json.data);
        merge({ summary: json.data.summary, keyRules: json.data.keyRules || [], estimatedDuration: json.data.estimatedDuration });
      }
    } catch { /* silently skip */ }
  };

  const addTeam = () => {
    const i = config.teams.length;
    setConfig(prev => ({
      ...prev,
      teams: [...prev.teams, { id: `team-${Date.now()}`, name: `Team ${i + 1}`, color: TEAM_COLORS[i % TEAM_COLORS.length] }]
    }));
  };

  const removeTeam = (id) => setConfig(prev => ({ ...prev, teams: prev.teams.filter(t => t.id !== id) }));

  const updateTeam = (id, field, val) =>
    setConfig(prev => ({ ...prev, teams: prev.teams.map(t => t.id === id ? { ...t, [field]: val } : t) }));

  const handlePublish = async () => {
    if (config.teams.length < 2) return showToast('Add at least 2 teams.', 'error');
    setSaving(true);
    try {
      const userId = localStorage.getItem('user_id');
      const setupRes = await fetch(`${API_BASE}/sports/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent.id, config, created_by: userId })
      });
      const setupJson = await setupRes.json();
      if (!setupJson.success) throw new Error(setupJson.error);

      const teamNames = config.teams.map(t => t.name);
      const bracketRes = await fetch(`${API_BASE}/sports/brackets/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent.id, teams: teamNames, bracketFormat: config.bracketFormat })
      });
      const bracketJson = await bracketRes.json();
      if (!bracketJson.success) throw new Error(bracketJson.error);

      showToast('Sports setup published! Brackets generated.', 'success');
      navigate('/organizer/sports-bracket');
    } catch (err) {
      showToast(err.message || 'Failed to save. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sportIcon = SPORT_ICONS[config.sportType?.toLowerCase()] || SPORT_ICONS.default;

  const registeredParticipants = participants.filter(p => p.status === 'Registered');

  // Guard: no participants registered and no existing setup
  if (!eventsLoading && selectedEvent && !gameSetupConfig && registeredParticipants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#EF4444' }}>groups_2</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>No Participants Registered</h2>
        <p style={{ color: colors.inkMuted, fontSize: '15px', maxWidth: '480px', margin: '0 auto 28px', lineHeight: '1.6' }}>
          Sports competitions require participants to be registered first. Teams are automatically pulled from the <strong>Participants</strong> page — add your teams there before setting up the sport.
        </p>
        <button
          onClick={() => navigate('/organizer/participants')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', background: colors.navy, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>groups</span>
          Go to Participants
        </button>
      </div>
    );
  }

  const stepLabels = ['Identify Sport', 'Teams', 'Format & Bracket', 'Review'];

  const card = { background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '20px', padding: '28px' };

  return (
    <div className="slide-up-anim">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: '100px', fontSize: '11px', fontWeight: 800, color: colors.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.accent }}>sports</span>
          Sport Setup Builder
        </div>
        <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobile ? '26px' : '32px', fontWeight: 900, color: colors.navy, letterSpacing: '-0.04em', margin: '0 0 8px' }}>
          {selectedEvent?.name}
        </h1>
        <p style={{ color: colors.inkSoft, fontSize: '15px', margin: 0 }}>
          Configure your sport competition — brackets, scoring, and match format.
        </p>
      </header>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {stepLabels.map((label, i) => (
          <div
            key={i}
            onClick={() => i < step && setStep(i)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px', cursor: i < step ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s',
              background: i === step ? colors.navy : i < step ? colors.accentBg : colors.pageBg,
              color: i === step ? '#fff' : i < step ? colors.accent : colors.inkMuted,
              border: `1px solid ${i === step ? colors.navy : i < step ? colors.accent : colors.borderSoft}`,
            }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800,
              background: i === step ? 'rgba(255,255,255,0.2)' : i < step ? colors.accent : colors.borderSoft,
              color: i < step ? '#fff' : i === step ? '#fff' : colors.inkMuted }}>
              {i < step ? <span className="material-symbols-rounded" style={{ fontSize: '13px' }}>check</span> : i + 1}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── STEP 0: Identify Sport ── */}
      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
          <div style={card}>
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, color: colors.navy, marginBottom: '20px' }}>Sport Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Sport Name</label>
                <input
                  value={config.sportName}
                  onChange={e => merge({ sportName: e.target.value })}
                  placeholder="e.g. Basketball, Volleyball..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Periods per Match</label>
                  <input
                    type="number" min="1" max="10"
                    value={config.periodsPerMatch}
                    onChange={e => merge({ periodsPerMatch: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Period Label</label>
                  <select
                    value={config.periodLabel}
                    onChange={e => merge({ periodLabel: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${colors.border}`, fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    {PERIOD_LABELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Win Condition</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'most_points', label: 'Highest Total Score', desc: 'Basketball, Football', icon: 'scoreboard' },
                    { id: 'most_sets', label: 'Most Periods Won', desc: 'Volleyball, Badminton', icon: 'military_tech' },
                  ].map(opt => (
                    <div key={opt.id} onClick={() => merge({ winCondition: opt.id })}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                        border: `2px solid ${config.winCondition === opt.id ? colors.accent : colors.borderSoft}`,
                        background: config.winCondition === opt.id ? colors.accentBg : '#fff' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '22px', color: config.winCondition === opt.id ? colors.accent : colors.inkMuted, display: 'block', marginBottom: '6px' }}>{opt.icon}</span>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: colors.navy }}>{opt.label}</div>
                      <div style={{ fontSize: '11px', color: colors.inkMuted, marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AI Panel */}
            <div style={{ ...card, background: colors.navy, border: 'none', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>auto_awesome</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>AI Sport Detect</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>Auto-configure from your event name</div>
                </div>
              </div>
              {aiSuggestion && (
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '13px', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{aiSuggestion.sportType}</div>
                  <div style={{ opacity: 0.8 }}>{aiSuggestion.description}</div>
                  {aiSuggestion.reason && <div style={{ opacity: 0.6, marginTop: '6px', fontStyle: 'italic' }}>{aiSuggestion.reason}</div>}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => getSuggestion(false)}
                  disabled={aiLoading}
                  style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: colors.accent, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {aiLoading ? <span style={{ animation: 'pulse 1.5s infinite' }}>Detecting…</span> : <><span className="material-symbols-rounded" style={{ fontSize: '16px' }}>auto_awesome</span> Detect Sport</>}
                </button>
                {aiSuggestion && (
                  <button onClick={() => getSuggestion(true)} disabled={aiLoading} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>refresh</span>
                  </button>
                )}
              </div>
            </div>

            {/* Preview */}
            {config.sportType && (
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: colors.accentBg, display: 'grid', placeItems: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '26px', color: colors.accent }}>{sportIcon}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: colors.navy, fontSize: '16px' }}>{config.sportType}</div>
                    <div style={{ fontSize: '13px', color: colors.inkMuted }}>
                      {config.periodsPerMatch} {config.periodLabel}{config.periodsPerMatch > 1 ? 's' : ''} · {config.winCondition === 'most_points' ? 'Total Points' : 'Most Sets Won'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ gridColumn: isMobile ? '1' : '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { if (!config.sportName) return showToast('Enter a sport name first.', 'error'); setStep(1); }}
              style={{ padding: '12px 28px', borderRadius: '14px', background: colors.navy, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              Next: Teams <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Teams ── */}
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '24px' }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, color: colors.navy, margin: 0 }}>
                Teams <span style={{ fontSize: '13px', fontWeight: 600, color: colors.inkMuted, marginLeft: '8px' }}>{config.teams.length} registered</span>
              </h3>
              <button onClick={addTeam} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: colors.accentBg, color: colors.accent, border: `1px solid ${colors.accent}`, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span> Add Team
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {config.teams.map((team) => (
                <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '14px', background: colors.pageBg, border: `1px solid ${colors.borderSoft}` }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: team.color, flexShrink: 0 }} />
                  <input
                    value={team.name}
                    onChange={e => updateTeam(team.id, 'name', e.target.value)}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: colors.navy, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {TEAM_COLORS.map(c => (
                      <div key={c} onClick={() => updateTeam(team.id, 'color', c)}
                        style={{ width: '18px', height: '18px', borderRadius: '50%', background: c, cursor: 'pointer', outline: team.color === c ? `2px solid ${colors.navy}` : 'none', outlineOffset: '2px' }} />
                    ))}
                  </div>
                  <button onClick={() => removeTeam(team.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.inkMuted, display: 'grid', placeItems: 'center', padding: '4px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              ))}
              {config.teams.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: colors.inkMuted }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '40px', display: 'block', marginBottom: '8px', color: colors.border }}>group_add</span>
                  <p style={{ fontSize: '13px' }}>No teams yet. Add teams or check your Participants page.</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ ...card, background: colors.accentBg, border: `1px solid ${colors.accent}` }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px' }}>info</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: colors.accentDeep }}>Teams from Participants</span>
              </div>
              <p style={{ fontSize: '13px', color: colors.accentDeep, margin: 0, lineHeight: 1.5 }}>
                Teams are auto-loaded from the Participants page. Go there to add more, then return here.
              </p>
            </div>
            <div style={card}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', marginBottom: '12px' }}>Bracket Format</div>
              {[
                { id: 'single_elimination', label: 'Single Elimination', icon: 'account_tree', desc: 'Lose once and you are out' },
                { id: 'round_robin', label: 'Round Robin', icon: 'loop', desc: 'Everyone plays everyone' },
              ].map(f => (
                <div key={f.id} onClick={() => merge({ bracketFormat: f.id })}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer', transition: 'all 0.2s',
                    border: `2px solid ${config.bracketFormat === f.id ? colors.accent : colors.borderSoft}`,
                    background: config.bracketFormat === f.id ? colors.accentBg : '#fff' }}>
                  <span className="material-symbols-rounded" style={{ color: config.bracketFormat === f.id ? colors.accent : colors.inkMuted, fontSize: '22px' }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: colors.navy }}>{f.label}</div>
                    <div style={{ fontSize: '11px', color: colors.inkMuted }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: isMobile ? '1' : '1 / -1', display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(0)} style={{ padding: '12px 24px', borderRadius: '14px', background: '#fff', color: colors.navy, border: `1px solid ${colors.border}`, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle' }}>arrow_back</span> Back
            </button>
            <button
              onClick={() => { if (config.teams.length < 2) return showToast('Add at least 2 teams.', 'error'); setStep(2); getReviewSuggestion(); }}
              style={{ padding: '12px 28px', borderRadius: '14px', background: colors.navy, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              Next: Review <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Format & Review ── */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
          {/* Config Summary */}
          <div style={card}>
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, color: colors.navy, marginBottom: '20px' }}>Configuration Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { icon: sportIcon, label: 'Sport', value: config.sportType || config.sportName },
                { icon: 'rule', label: 'Win Condition', value: config.winCondition === 'most_points' ? 'Highest Total Score' : 'Most Periods Won' },
                { icon: 'timer', label: 'Periods per Match', value: `${config.periodsPerMatch} ${config.periodLabel}${config.periodsPerMatch > 1 ? 's' : ''}` },
                { icon: 'account_tree', label: 'Bracket Format', value: config.bracketFormat === 'single_elimination' ? 'Single Elimination' : 'Round Robin' },
                { icon: 'groups', label: 'Teams', value: `${config.teams.length} teams` },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.borderSoft}` : 'none' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: colors.accentBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '17px', color: colors.accent }}>{row.icon}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: colors.inkMuted, fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: colors.navy }}>{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Teams preview */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', marginBottom: '10px' }}>Participating Teams</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {config.teams.map(t => (
                  <div key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', background: t.color + '18', border: `1px solid ${t.color}40` }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: colors.navy }}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ ...card, background: colors.navy, border: 'none', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>auto_awesome</span>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>AI Summary</span>
              </div>
              {reviewData ? (
                <>
                  <p style={{ fontSize: '13px', opacity: 0.85, lineHeight: 1.65, marginBottom: '16px' }}>{reviewData.summary}</p>
                  {reviewData.keyRules?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.55, marginBottom: '8px' }}>Key Rules</div>
                      {reviewData.keyRules.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '12.5px', opacity: 0.8 }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>check_circle</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                  {reviewData.estimatedDuration && (
                    <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '6px' }}>schedule</span>
                      Estimated Duration: {reviewData.estimatedDuration}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '13px', opacity: 0.6 }}>Generating summary…</p>
              )}
            </div>

            <div style={{ ...card, border: `2px solid ${colors.success}`, background: '#F0FDF4' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span className="material-symbols-rounded" style={{ color: colors.success, fontSize: '20px' }}>check_circle</span>
                <span style={{ fontWeight: 700, color: '#166534' }}>Ready to Publish</span>
              </div>
              <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                Brackets will be generated automatically. You can record match scores from the Bracket page.
              </p>
            </div>
          </div>

          <div style={{ gridColumn: isMobile ? '1' : '1 / -1', display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(1)} style={{ padding: '12px 24px', borderRadius: '14px', background: '#fff', color: colors.navy, border: `1px solid ${colors.border}`, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', verticalAlign: 'middle' }}>arrow_back</span> Back
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              style={{ padding: '12px 32px', borderRadius: '14px', background: saving ? colors.inkMuted : colors.success, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{saving ? 'hourglass_top' : 'rocket_launch'}</span>
              {saving ? 'Publishing…' : 'Publish & Generate Brackets'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
