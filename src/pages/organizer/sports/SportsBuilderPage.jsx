import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../styles/colors';
import { createClient } from '../../../utils/supabase/client';
import { generateSportConfig } from '../../../services/claudeService';
import { API_URL as API_BASE } from '../../../config';

const EXAMPLE_CHIPS = [
  'FIBA 3x3 basketball, single elimination',
  'FIVB volleyball, round robin then finals',
  'Tumbang Preso, traditional Filipino rules',
  'Amateur boxing, single elimination, 3 rounds',
  'Badminton singles, double elimination',
  'Patintero, team vs team, 5 rounds',
];

const BRACKET_LABELS = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  round_robin: 'Round Robin',
  swiss: 'Swiss',
  null: 'No Bracket',
};

const SEEDING_LABELS = {
  random: 'Random',
  manual: 'Manual',
  ranked: 'By Ranking',
};

function nextPowerOf2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function generateBracketSkeleton(eventId, teams, bracketType) {
  if (!bracketType || bracketType === 'null') return [];

  const brackets = [];

  if (bracketType === 'single_elimination') {
    const bracketSize = nextPowerOf2(teams.length);
    const rounds = Math.log2(bracketSize);
    for (let m = 0; m < bracketSize / 2; m++) {
      const teamA = teams[m * 2] || null;
      const teamB = teams[m * 2 + 1] || null;
      brackets.push({
        event_id: eventId,
        round_number: 1,
        match_number: m + 1,
        team_a_id: teamA?.id || null,
        team_b_id: teamB?.id || null,
        status: 'pending',
      });
    }
    for (let r = 2; r <= rounds; r++) {
      const matchCount = bracketSize / Math.pow(2, r);
      for (let m = 0; m < matchCount; m++) {
        brackets.push({
          event_id: eventId,
          round_number: r,
          match_number: m + 1,
          team_a_id: null,
          team_b_id: null,
          status: 'pending',
        });
      }
    }
  } else if (bracketType === 'round_robin') {
    let match = 1;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        brackets.push({
          event_id: eventId,
          round_number: 1,
          match_number: match++,
          team_a_id: teams[i].id,
          team_b_id: teams[j].id,
          status: 'pending',
        });
      }
    }
  } else if (bracketType === 'double_elimination') {
    const bracketSize = nextPowerOf2(teams.length);
    const rounds = Math.log2(bracketSize);
    for (let m = 0; m < bracketSize / 2; m++) {
      const teamA = teams[m * 2] || null;
      const teamB = teams[m * 2 + 1] || null;
      brackets.push({
        event_id: eventId,
        round_number: 1,
        match_number: m + 1,
        team_a_id: teamA?.id || null,
        team_b_id: teamB?.id || null,
        status: 'pending',
      });
    }
    for (let r = 2; r <= rounds; r++) {
      const matchCount = bracketSize / Math.pow(2, r);
      for (let m = 0; m < matchCount; m++) {
        brackets.push({
          event_id: eventId,
          round_number: r,
          match_number: m + 1,
          team_a_id: null,
          team_b_id: null,
          status: 'pending',
        });
      }
    }
    // Losers bracket rounds (round_number negative to distinguish)
    for (let r = 1; r <= rounds - 1; r++) {
      const matchCount = Math.max(1, bracketSize / Math.pow(2, r + 1));
      for (let m = 0; m < matchCount; m++) {
        brackets.push({
          event_id: eventId,
          round_number: -(r),
          match_number: m + 1,
          team_a_id: null,
          team_b_id: null,
          status: 'pending',
        });
      }
    }
  }

  return brackets;
}

export default function SportsBuilderPage() {
  const navigate = useNavigate();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventContext, setEventContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [sportDescription, setSportDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [sportConfig, setSportConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [hoveredChip, setHoveredChip] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Fetch events without sport_config
  useEffect(() => {
    const organizerId = localStorage.getItem('user_id');
    if (!organizerId) { setEventsLoading(false); return; }

    supabase
      .from('events')
      .select('id, name, start_date, type, status')
      .eq('organizer_id', organizerId)
      .is('sport_config', null)
      .is('competition_category', null)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setAvailableEvents(data || []);
        setEventsLoading(false);
      });
  }, []);

  // Fetch event context when event is selected
  useEffect(() => {
    if (!selectedEventId) { setEventContext(null); return; }
    setContextLoading(true);

    Promise.all([
      fetch(`${API_BASE}/participants?event_id=${selectedEventId}`).then(r => r.json()),
      fetch(`${API_BASE}/judges?event_id=${selectedEventId}`).then(r => r.json()),
    ]).then(([pRes, jRes]) => {
      const parts = pRes.success ? pRes.data : [];
      const judges = jRes.success ? jRes.data : [];
      const teams = [...new Set(parts.map(p => p.team).filter(Boolean))];
      setEventContext({ participantCount: parts.length, teams, judgeCount: judges.length });
    }).catch(() => setEventContext(null))
      .finally(() => setContextLoading(false));
  }, [selectedEventId]);

  // Fetch participants for Step 3
  const fetchParticipants = useCallback(() => {
    if (!selectedEventId) return;
    setParticipantsLoading(true);
    fetch(`${API_BASE}/participants?event_id=${selectedEventId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setParticipants(data.data); })
      .catch(console.error)
      .finally(() => setParticipantsLoading(false));
  }, [selectedEventId]);

  const handleGenerate = async () => {
    if (!sportDescription.trim()) return;
    setIsGenerating(true);
    setGenerateError('');
    try {
      const eventData = { teams: eventContext?.teams, participantCount: eventContext?.participantCount };
      const config = await generateSportConfig(sportDescription, eventData);
      setSportConfig(config);
      setStep(2);
    } catch (err) {
      setGenerateError(err.message || 'Generation failed. Check your server configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunch = async () => {
    if (!selectedEventId || !sportConfig) return;
    setIsSaving(true);
    setSaveError('');

    try {
      // 1. Save sport_config to event
      const { error: evErr } = await supabase
        .from('events')
        .update({ sport_config: sportConfig, competition_category: 'sports' })
        .eq('id', selectedEventId);
      if (evErr) throw new Error(evErr.message);

      // 2. Create teams from distinct participant.team values
      const teamNames = [...new Set(participants.map(p => p.team).filter(Boolean))];
      let createdTeams = [];
      if (teamNames.length > 0) {
        const teamsPayload = teamNames.map((name, i) => ({
          event_id: selectedEventId,
          name,
          seed: i + 1,
        }));
        const tRes = await fetch(`${API_BASE}/sports/teams/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teams: teamsPayload }),
        });
        const tData = await tRes.json();
        if (!tData.success) throw new Error(tData.error || 'Failed to create teams');
        createdTeams = tData.data;
      }

      // 3. Generate bracket skeleton
      const bracketType = sportConfig.structure?.bracket_type;
      const skeleton = generateBracketSkeleton(selectedEventId, createdTeams, bracketType);
      if (skeleton.length > 0) {
        const bRes = await fetch(`${API_BASE}/sports/brackets/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brackets: skeleton }),
        });
        const bData = await bRes.json();
        if (!bData.success) throw new Error(bData.error || 'Failed to generate brackets');
      }

      navigate(`/organizer/sports/events/${selectedEventId}`);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Group participants by team for Step 3
  const teamGroups = React.useMemo(() => {
    const groups = {};
    participants.forEach(p => {
      const key = p.team || '__unassigned__';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [participants]);

  const selectedEvent = availableEvents.find(e => e.id === selectedEventId);
  const bracketType = sportConfig?.structure?.bracket_type;
  const unit = sportConfig?.scoring_sheet?.unit;

  const cardStyle = {
    background: '#fff',
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
  };

  const sectionTitleStyle = {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.inkMuted,
    marginBottom: '8px',
  };

  const stepIndicator = (num, label, active, done) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: active || done ? 1 : 0.4 }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', display: 'grid', placeItems: 'center',
        background: done ? colors.success : active ? colors.navy : colors.borderSoft,
        color: done || active ? '#fff' : colors.inkMuted,
        fontSize: '13px', fontWeight: '700', flexShrink: 0,
      }}>
        {done ? <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check</span> : num}
      </div>
      <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', color: active ? colors.navy : colors.inkSoft }}>{label}</span>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>Select Event</p>
        <p style={{ fontSize: '13px', color: colors.inkMuted, marginBottom: '12px' }}>
          Choose the event you want to configure as a sports competition.
        </p>
        {eventsLoading ? (
          <div style={{ height: '48px', background: colors.pageBg, borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
        ) : availableEvents.length === 0 ? (
          <div style={{ padding: '16px', background: colors.warningBg, borderRadius: '12px', border: `1px solid ${colors.warning}20` }}>
            <p style={{ fontSize: '13px', color: colors.warning, margin: 0 }}>
              No available events found. All your events may already have a sports configuration, or you haven't created any events yet.
            </p>
          </div>
        ) : (
          <select
            value={selectedEventId}
            onChange={e => { setSelectedEventId(e.target.value); setEventContext(null); }}
            style={{
              width: '100%', padding: '12px 14px', border: `1px solid ${colors.border}`,
              borderRadius: '12px', fontSize: '14px', color: colors.navy, background: '#fff',
              outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
            }}
          >
            <option value="">Select an event...</option>
            {availableEvents.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name} — {ev.start_date ? new Date(ev.start_date).toLocaleDateString() : 'No date'}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedEventId && (
        <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${colors.accentBg} 0%, #fff 100%)`, border: `1px solid ${colors.accentGlow}` }}>
          <p style={{ ...sectionTitleStyle, color: colors.accent }}>Event Context</p>
          {contextLoading ? (
            <p style={{ fontSize: '13px', color: colors.inkMuted }}>Loading event data...</p>
          ) : eventContext ? (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: colors.navy }}>{eventContext.participantCount}</div>
                <div style={{ fontSize: '11px', color: colors.inkMuted }}>Participants registered</div>
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: colors.navy }}>{eventContext.teams.length}</div>
                <div style={{ fontSize: '11px', color: colors.inkMuted }}>
                  {eventContext.teams.length > 0 ? `Teams detected` : 'No teams yet'}
                </div>
                {eventContext.teams.length > 0 && (
                  <div style={{ fontSize: '11px', color: colors.inkMuted, marginTop: '4px' }}>
                    {eventContext.teams.slice(0, 4).join(', ')}{eventContext.teams.length > 4 ? `... +${eventContext.teams.length - 4} more` : ''}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: colors.navy }}>{eventContext.judgeCount}</div>
                <div style={{ fontSize: '11px', color: colors.inkMuted }}>Scorer{eventContext.judgeCount !== 1 ? 's' : ''} assigned</div>
              </div>
            </div>
          ) : null}
          {eventContext?.teams.length === 0 && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: colors.warningBg, borderRadius: '10px', fontSize: '12px', color: '#92400e' }}>
              No teams detected yet. You can add participants and assign them to teams first, or continue and assign teams here.
            </div>
          )}
        </div>
      )}

      <div style={cardStyle}>
        <p style={sectionTitleStyle}>Describe the Sport</p>
        <p style={{ fontSize: '13px', color: colors.inkMuted, marginBottom: '12px' }}>
          Describe your competition. What sport? What ruleset? Any special rules or format?
        </p>
        <textarea
          value={sportDescription}
          onChange={e => setSportDescription(e.target.value)}
          placeholder="e.g. FIBA 3x3 basketball, single elimination, 10 minute quarters..."
          rows={4}
          style={{
            width: '100%', padding: '14px', border: `1px solid ${colors.border}`,
            borderRadius: '12px', fontSize: '14px', color: colors.navy, resize: 'vertical',
            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5,
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {EXAMPLE_CHIPS.map((chip, i) => (
            <button
              key={i}
              onClick={() => setSportDescription(chip)}
              onMouseEnter={() => setHoveredChip(i)}
              onMouseLeave={() => setHoveredChip(null)}
              style={{
                padding: '6px 14px', borderRadius: '100px',
                border: `1px solid ${hoveredChip === i ? colors.accent : colors.border}`,
                background: hoveredChip === i ? colors.accentBg : '#fff',
                color: hoveredChip === i ? colors.accent : colors.inkSoft,
                fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
        {generateError && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: colors.errorBg, borderRadius: '10px', fontSize: '12px', color: colors.error }}>
            {generateError}
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={!selectedEventId || !sportDescription.trim() || isGenerating}
          onMouseEnter={() => setHoveredBtn('gen')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            marginTop: '16px', width: '100%', padding: '14px',
            background: (!selectedEventId || !sportDescription.trim() || isGenerating)
              ? colors.borderSoft
              : (hoveredBtn === 'gen' ? colors.navySoft : colors.navy),
            color: (!selectedEventId || !sportDescription.trim() || isGenerating) ? colors.inkMuted : '#fff',
            border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700',
            cursor: (!selectedEventId || !sportDescription.trim() || isGenerating) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {isGenerating ? (
            <>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>autorenew</span>
              Analyzing sport and generating scoring sheet...
            </>
          ) : (
            <>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>auto_awesome</span>
              Generate Scoring Sheet
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (!sportConfig) return null;
    const ss = sportConfig.scoring_sheet || {};
    const pt = ss.period_tracking || {};
    const allFields = (ss.groups || []).flatMap(g => g.fields || []);

    return (
      <div>
        <div style={{ ...cardStyle, border: `2px solid ${colors.accent}20` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: colors.accentBg, display: 'grid', placeItems: 'center' }}>
              <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '22px' }}>sports</span>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: colors.navy }}>{sportConfig.display_name || sportConfig.sport}</div>
              <div style={{ fontSize: '12px', color: colors.inkMuted }}>{sportConfig.ruleset} · Scoring: {ss.unit === 'player' ? 'Player Stats' : ss.unit === 'team' ? 'Team Event Log' : 'Basic Score'}</div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Tournament Structure</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {['single_elimination', 'double_elimination', 'round_robin', 'swiss', null].map(bt => (
              <button
                key={String(bt)}
                onClick={() => setSportConfig(prev => ({ ...prev, structure: { ...prev.structure, bracket_type: bt } }))}
                style={{
                  padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                  border: `1px solid ${bracketType === bt ? colors.accent : colors.border}`,
                  background: bracketType === bt ? colors.accentBg : '#fff',
                  color: bracketType === bt ? colors.accent : colors.inkSoft,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {BRACKET_LABELS[String(bt)]}
              </button>
            ))}
          </div>
          <p style={{ ...sectionTitleStyle, marginTop: '16px' }}>Seeding</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['random', 'manual', 'ranked'].map(s => (
              <button
                key={s}
                onClick={() => setSportConfig(prev => ({ ...prev, structure: { ...prev.structure, seeding: s } }))}
                style={{
                  padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                  border: `1px solid ${sportConfig.structure?.seeding === s ? colors.accent : colors.border}`,
                  background: sportConfig.structure?.seeding === s ? colors.accentBg : '#fff',
                  color: sportConfig.structure?.seeding === s ? colors.accent : colors.inkSoft,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {SEEDING_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {ss.groups && ss.groups.length > 0 && (
          <div style={cardStyle}>
            <p style={sectionTitleStyle}>Scoring Sheet Fields</p>
            <p style={{ fontSize: '12px', color: colors.inkMuted, marginBottom: '12px' }}>Fields on the scorer's sheet. Toggle on/off.</p>
            {ss.groups.map(group => (
              <div key={group.id} style={{ marginBottom: '12px' }}>
                {group.label && <p style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', marginBottom: '6px' }}>{group.label}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {group.fields.filter(f => f.type !== 'static').map(field => {
                    const isActive = true;
                    return (
                      <div
                        key={field.id}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                          background: colors.accentBg, color: colors.accent, border: `1px solid ${colors.accentGlow}`,
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check</span>
                        {field.label}
                        {field.type === 'computed' && <span style={{ fontSize: '10px', opacity: 0.7 }}>(auto)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {pt.enabled && (
          <div style={cardStyle}>
            <p style={sectionTitleStyle}>Period Tracking</p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11px', color: colors.inkMuted, display: 'block', marginBottom: '4px' }}>Period Label</label>
                <input
                  value={pt.period_label || ''}
                  onChange={e => setSportConfig(prev => ({
                    ...prev,
                    scoring_sheet: { ...prev.scoring_sheet, period_tracking: { ...pt, period_label: e.target.value } }
                  }))}
                  style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '13px', width: '120px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: colors.inkMuted, display: 'block', marginBottom: '4px' }}>Total Periods</label>
                <input
                  type="number"
                  min="1"
                  value={pt.total_periods || ''}
                  onChange={e => setSportConfig(prev => ({
                    ...prev,
                    scoring_sheet: { ...prev.scoring_sheet, period_tracking: { ...pt, total_periods: parseInt(e.target.value) || null } }
                  }))}
                  style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '13px', width: '80px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: colors.inkMuted, display: 'block', marginBottom: '4px' }}>Duration (min)</label>
                <input
                  type="number"
                  min="1"
                  value={pt.period_duration_minutes || ''}
                  onChange={e => setSportConfig(prev => ({
                    ...prev,
                    scoring_sheet: { ...prev.scoring_sheet, period_tracking: { ...pt, period_duration_minutes: parseInt(e.target.value) || null } }
                  }))}
                  style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '13px', width: '80px' }}
                />
              </div>
            </div>
          </div>
        )}

        {ss.actions && ss.actions.length > 0 && (
          <div style={cardStyle}>
            <p style={sectionTitleStyle}>Scorer Actions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ss.actions.map(action => (
                <div
                  key={action.id}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                    background: colors.pageBg, color: colors.inkSoft, border: `1px solid ${colors.border}`,
                  }}
                >
                  {action.label}
                  <span style={{ marginLeft: '6px', fontSize: '10px', color: colors.inkMuted }}>({action.type})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => { fetchParticipants(); setStep(3); }}
          onMouseEnter={() => setHoveredBtn('next2')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            width: '100%', padding: '14px', background: hoveredBtn === 'next2' ? colors.navySoft : colors.navy,
            color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          Confirm Config — Review Teams
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_forward</span>
        </button>
      </div>
    );
  };

  const renderStep3 = () => {
    const unit = sportConfig?.scoring_sheet?.unit;
    const teamCount = Object.keys(teamGroups).filter(k => k !== '__unassigned__').length;
    const bracketType = sportConfig?.structure?.bracket_type;
    const bracketSize = nextPowerOf2(teamCount);
    const showByeWarning = bracketType === 'single_elimination' && teamCount > 1 && teamCount !== bracketSize;

    return (
      <div>
        {participantsLoading ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '32px', color: colors.inkMuted, display: 'block', marginBottom: '12px' }}>hourglass_top</span>
            <p style={{ color: colors.inkMuted }}>Loading roster...</p>
          </div>
        ) : participants.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '40px', color: colors.inkMuted, display: 'block', marginBottom: '12px' }}>group_off</span>
            <p style={{ fontWeight: '700', color: colors.navy, marginBottom: '8px' }}>No participants registered for this event yet.</p>
            <p style={{ color: colors.inkMuted, fontSize: '13px', marginBottom: '20px' }}>
              You can continue and the scoring sheet will show empty rosters, or go add participants first.
            </p>
            <button
              onClick={() => navigate('/organizer/participants')}
              style={{ padding: '10px 24px', background: colors.navy, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Add Participants
            </button>
          </div>
        ) : (
          <>
            {showByeWarning && (
              <div style={{ ...cardStyle, background: colors.warningBg, border: `1px solid ${colors.warning}30` }}>
                <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                  ⚠ Single elimination works best with {bracketSize} teams. You have {teamCount} — some teams will receive byes.
                </p>
              </div>
            )}

            {Object.entries(teamGroups).map(([teamName, members]) => {
              const isUnassigned = teamName === '__unassigned__';
              return (
                <div key={teamName} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: isUnassigned ? colors.warningBg : colors.accentBg,
                      display: 'grid', placeItems: 'center',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '18px', color: isUnassigned ? colors.warning : colors.accent }}>
                        {isUnassigned ? 'person_off' : 'groups'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: colors.navy, fontSize: '15px' }}>
                        {isUnassigned ? 'Unassigned' : teamName}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.inkMuted }}>{members.length} {unit === 'player' ? 'player' : 'member'}{members.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {members.map((m, i) => (
                      <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '8px 12px', background: colors.pageBg, borderRadius: '8px',
                      }}>
                        <span style={{ fontSize: '12px', color: colors.inkMuted, minWidth: '20px', textAlign: 'right' }}>{i + 1}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: colors.navy, flex: 1 }}>{m.name}</span>
                        {m.email && <span style={{ fontSize: '11px', color: colors.inkMuted }}>{m.email}</span>}
                        <span style={{
                          fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '100px',
                          background: m.status === 'Registered' ? colors.successBg : colors.pageBg,
                          color: m.status === 'Registered' ? colors.success : colors.inkMuted,
                          border: `1px solid ${m.status === 'Registered' ? colors.success + '30' : colors.border}`,
                        }}>{m.status || 'Pending'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        <button
          onClick={() => setStep(4)}
          onMouseEnter={() => setHoveredBtn('next3')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            width: '100%', padding: '14px', background: hoveredBtn === 'next3' ? colors.navySoft : colors.navy,
            color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          Confirm Rosters — Review Summary
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_forward</span>
        </button>
      </div>
    );
  };

  const renderStep4 = () => {
    const teamNames = [...new Set(participants.map(p => p.team).filter(Boolean))];
    const ss = sportConfig?.scoring_sheet || {};
    const pt = ss.period_tracking || {};

    return (
      <div>
        <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navySoft} 100%)`, border: 'none' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Ready to Launch</p>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '0' }}>{selectedEvent?.name}</p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{sportConfig?.display_name} · {sportConfig?.ruleset}</p>
        </div>

        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Summary</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Sport', value: `${sportConfig?.display_name} (${sportConfig?.ruleset})` },
              { label: 'Tournament Format', value: BRACKET_LABELS[String(sportConfig?.structure?.bracket_type)] || 'No Bracket' },
              { label: 'Seeding', value: SEEDING_LABELS[sportConfig?.structure?.seeding] || '—' },
              { label: 'Scoring Mode', value: ss.unit === 'player' ? 'Player Stats Sheet' : ss.unit === 'team' ? 'Team Event Log' : 'Basic Score' },
              { label: 'Teams', value: `${teamNames.length} team${teamNames.length !== 1 ? 's' : ''}: ${teamNames.join(', ') || 'None detected'}` },
              { label: 'Participants', value: `${participants.length} registered` },
              { label: 'Periods', value: pt.enabled ? `${pt.total_periods || '?'} × ${pt.period_label || 'Period'}` : 'None' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', paddingBottom: '10px', borderBottom: `1px solid ${colors.borderSoft}` }}>
                <span style={{ fontSize: '13px', color: colors.inkMuted, fontWeight: '500', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: '13px', color: colors.navy, fontWeight: '600', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {saveError && (
          <div style={{ ...cardStyle, background: colors.errorBg, border: `1px solid ${colors.error}30` }}>
            <p style={{ fontSize: '13px', color: colors.error, margin: 0 }}>{saveError}</p>
          </div>
        )}

        <button
          onClick={handleLaunch}
          disabled={isSaving}
          onMouseEnter={() => setHoveredBtn('launch')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            width: '100%', padding: '16px',
            background: isSaving ? colors.borderSoft : (hoveredBtn === 'launch' ? colors.accentDeep : colors.accent),
            color: isSaving ? colors.inkMuted : '#fff',
            border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: isSaving ? 'none' : '0 8px 20px rgba(59,130,246,0.3)',
          }}
        >
          {isSaving ? (
            <>
              <span className="material-symbols-rounded" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>autorenew</span>
              Launching...
            </>
          ) : (
            <>
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>rocket_launch</span>
              Launch Sports Event
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navySoft})`,
            display: 'grid', placeItems: 'center',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '24px', color: '#fff' }}>sports</span>
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: colors.navy, margin: 0, letterSpacing: '-0.02em', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              Sports Builder
            </h1>
            <p style={{ fontSize: '13px', color: colors.inkMuted, margin: 0 }}>AI-powered scoring sheet generator for any sport</p>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {stepIndicator(1, 'Describe', step === 1, step > 1)}
        <span className="material-symbols-rounded" style={{ color: colors.borderSoft, fontSize: '20px', alignSelf: 'center' }}>chevron_right</span>
        {stepIndicator(2, 'Review Config', step === 2, step > 2)}
        <span className="material-symbols-rounded" style={{ color: colors.borderSoft, fontSize: '20px', alignSelf: 'center' }}>chevron_right</span>
        {stepIndicator(3, 'Teams & Rosters', step === 3, step > 3)}
        <span className="material-symbols-rounded" style={{ color: colors.borderSoft, fontSize: '20px', alignSelf: 'center' }}>chevron_right</span>
        {stepIndicator(4, 'Confirm & Launch', step === 4, false)}
      </div>

      {/* Back button */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px',
            background: 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', padding: '0',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
          Back
        </button>
      )}

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}
