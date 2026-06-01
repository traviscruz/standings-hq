import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from '../OrganizerLayout';
import { colors } from '../../../styles/colors';
import { generateSportConfig } from '../../../services/claudeService';
import { API_URL as API_BASE } from '../../../config';

// ── Helpers ──────────────────────────────────────────────────────────────────

function nextPowerOf2(n) { let p = 1; while (p < n) p *= 2; return p; }

function generateBrackets(eventId, teams, bracketType) {
  if (!bracketType || bracketType === 'null' || bracketType === null) return [];
  const out = [];
  if (bracketType === 'single_elimination' || bracketType === 'double_elimination') {
    const size = nextPowerOf2(teams.length);
    const rounds = Math.log2(size);
    for (let m = 0; m < size / 2; m++) {
      out.push({ event_id: eventId, round_number: 1, match_number: m + 1, team_a_id: teams[m * 2]?.id || null, team_b_id: teams[m * 2 + 1]?.id || null, status: 'pending' });
    }
    for (let r = 2; r <= rounds; r++) {
      const mc = size / Math.pow(2, r);
      for (let m = 0; m < mc; m++) out.push({ event_id: eventId, round_number: r, match_number: m + 1, team_a_id: null, team_b_id: null, status: 'pending' });
    }
    if (bracketType === 'double_elimination') {
      for (let r = 1; r <= rounds - 1; r++) {
        const mc = Math.max(1, size / Math.pow(2, r + 1));
        for (let m = 0; m < mc; m++) out.push({ event_id: eventId, round_number: -r, match_number: m + 1, team_a_id: null, team_b_id: null, status: 'pending' });
      }
    }
  } else if (bracketType === 'round_robin') {
    let m = 1;
    for (let i = 0; i < teams.length; i++)
      for (let j = i + 1; j < teams.length; j++)
        out.push({ event_id: eventId, round_number: 1, match_number: m++, team_a_id: teams[i].id, team_b_id: teams[j].id, status: 'pending' });
  }
  return out;
}

const CHIPS = [
  'FIBA 3x3 basketball, single elimination',
  'FIVB volleyball, round robin then finals',
  'Tumbang Preso, traditional Filipino rules',
  'Amateur boxing, single elimination, 3 rounds',
  'Badminton singles, double elimination',
  'Patintero, team vs team, 5 rounds',
  'Sepak Takraw, round robin',
  'Arnis, single elimination',
];

const BRACKET_OPTS = [
  { val: 'single_elimination', label: 'Single Elimination', icon: 'account_tree' },
  { val: 'double_elimination', label: 'Double Elimination', icon: 'device_hub' },
  { val: 'round_robin', label: 'Round Robin', icon: 'change_circle' },
  { val: 'swiss', label: 'Swiss', icon: 'grid_view' },
  { val: null, label: 'No Bracket', icon: 'block' },
];

const SEEDING_OPTS = [
  { val: 'random', label: 'Random Draw' },
  { val: 'manual', label: 'Manual Seeding' },
  { val: 'ranked', label: 'By Ranking' },
];

const UNIT_OPTS = [
  { val: 'player', label: 'Player Stats', desc: 'Track individual stats per player (basketball, volleyball, boxing)', icon: 'person' },
  { val: 'team', label: 'Team Event Log', desc: 'Log team events & eliminations (Tumbang Preso, Patintero)', icon: 'groups' },
  { val: 'team_only', label: 'Basic Score', desc: 'Simple team score tracker — just + and −', icon: 'scoreboard' },
];

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, accent = colors.accent }) {
  return (
    <div style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${colors.borderSoft}`, marginBottom: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${colors.borderSoft}`, background: colors.pageBg }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: accent + '18', display: 'grid', placeItems: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '17px', color: accent }}>{icon}</span>
        </div>
        <span style={{ fontWeight: '700', color: colors.navy, fontSize: '14px' }}>{title}</span>
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}

// ── Toggle Chip ───────────────────────────────────────────────────────────────
function ToggleChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        border: `1px solid ${active ? colors.accent : colors.border}`,
        background: active ? colors.accentBg : '#fff',
        color: active ? colors.accent : colors.inkSoft,
        transition: 'all 0.15s',
      }}
    >{children}</button>
  );
}

// ── FieldRow ─────────────────────────────────────────────────────────────────
function FieldRow({ field, enabled, onToggle }) {
  const typeColors = { counter: '#7C3AED', computed: colors.accent, countdown: '#D97706', static: colors.inkMuted, select: '#059669' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: `1px solid ${colors.borderSoft}` }}>
      <input
        type="checkbox"
        checked={enabled}
        onChange={onToggle}
        style={{ width: '16px', height: '16px', accentColor: colors.accent, cursor: 'pointer', flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: '600', color: enabled ? colors.navy : colors.inkMuted, fontSize: '13px' }}>{field.label}</span>
        {field.formula && <span style={{ fontSize: '11px', color: colors.inkMuted, marginLeft: '8px' }}>= {field.formula}</span>}
        {field.foul_out_at && <span style={{ fontSize: '10px', color: colors.error, marginLeft: '8px' }}>foul-out at {field.foul_out_at}</span>}
      </div>
      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: (typeColors[field.type] || colors.inkMuted) + '18', color: typeColors[field.type] || colors.inkMuted }}>
        {field.type}
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SportsConfigPage() {
  const navigate = useNavigate();
  const { selectedEvent, participants, showToast, updateEvent } = useEventContext();

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [existingConfig, setExistingConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Editable config state (populated after AI generation)
  const [sportName, setSportName] = useState('');
  const [ruleset, setRuleset] = useState('');
  const [bracketType, setBracketType] = useState('single_elimination');
  const [seeding, setSeeding] = useState('random');
  const [unit, setUnit] = useState('player');
  const [enabledFields, setEnabledFields] = useState({}); // { fieldId: true/false }
  const [allFields, setAllFields] = useState([]); // flat list of all fields from AI
  const [periodEnabled, setPeriodEnabled] = useState(true);
  const [periodLabel, setPeriodLabel] = useState('Quarter');
  const [totalPeriods, setTotalPeriods] = useState(4);
  const [periodDuration, setPeriodDuration] = useState(10);
  const [overtime, setOvertime] = useState(true);
  const [teamLevelFields, setTeamLevelFields] = useState([]);
  const [enabledTeamFields, setEnabledTeamFields] = useState({});
  const [actions, setActions] = useState([]);
  const [enabledActions, setEnabledActions] = useState({});
  const [rawGroups, setRawGroups] = useState([]); // original group structure

  // Load existing config from backend (bypasses RLS)
  useEffect(() => {
    if (!selectedEvent?.id) { setConfigLoading(false); return; }
    setConfigLoading(true);
    fetch(`${API_BASE}/events/${selectedEvent.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.sport_config) {
          setExistingConfig(d.data.sport_config);
        } else {
          setExistingConfig(null);
        }
      })
      .catch(() => setExistingConfig(selectedEvent?.sport_config || null))
      .finally(() => setConfigLoading(false));
  }, [selectedEvent?.id]);

  const teamNames = [...new Set(participants.map(p => p.team).filter(Boolean))];
  const hasParticipants = participants.length > 0;

  // Populate editable state from AI-generated config
  const populateFromConfig = (cfg) => {
    setSportName(cfg.display_name || cfg.sport || '');
    setRuleset(cfg.ruleset || '');
    setBracketType(cfg.structure?.bracket_type ?? 'single_elimination');
    setSeeding(cfg.structure?.seeding || 'random');
    const ss = cfg.scoring_sheet || {};
    setUnit(ss.unit || 'player');
    setRawGroups(ss.groups || []);
    const flat = (ss.groups || []).flatMap(g => g.fields || []);
    setAllFields(flat);
    const initEnabled = {};
    flat.forEach(f => { initEnabled[f.id] = true; });
    setEnabledFields(initEnabled);
    const pt = ss.period_tracking || {};
    setPeriodEnabled(pt.enabled !== false);
    setPeriodLabel(pt.period_label || 'Quarter');
    setTotalPeriods(pt.total_periods || 4);
    setPeriodDuration(pt.period_duration_minutes || 10);
    setOvertime(pt.overtime !== false);
    const tlf = ss.team_level_fields || [];
    setTeamLevelFields(tlf);
    const initTlf = {};
    tlf.forEach(f => { initTlf[f.id] = true; });
    setEnabledTeamFields(initTlf);
    const acts = ss.actions || [];
    setActions(acts);
    const initActs = {};
    acts.forEach(a => { initActs[a.id] = true; });
    setEnabledActions(initActs);
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setGenError('');
    try {
      const cfg = await generateSportConfig(description, {
        name: selectedEvent?.name,
        type: selectedEvent?.type,
        description: selectedEvent?.description,
        teams: teamNames,
        participantCount: participants.length,
      });
      populateFromConfig(cfg);
      setStep(2);
    } catch (err) {
      setGenError(err.message || 'Generation failed. Check that ANTHROPIC_API_KEY is set in server .env');
    } finally {
      setIsGenerating(false);
    }
  };

  // Build final config from user approvals
  const buildFinalConfig = () => {
    // Reconstruct groups with only enabled fields
    const filteredGroups = rawGroups.map(g => ({
      ...g,
      fields: (g.fields || []).filter(f => enabledFields[f.id] !== false),
    })).filter(g => g.fields.length > 0);

    return {
      schema_version: '1.0',
      sport: sportName.toLowerCase().replace(/\s+/g, '_'),
      display_name: sportName,
      ruleset,
      competition_category: 'sports',
      structure: { bracket_type: bracketType, seeding },
      scoring_sheet: {
        unit,
        unit_label: unit === 'player' ? 'Players' : 'Teams',
        groups: filteredGroups,
        period_tracking: periodEnabled ? {
          enabled: true,
          period_label: periodLabel,
          total_periods: totalPeriods,
          period_duration_minutes: periodDuration,
          overtime,
          track_score_per_period: true,
        } : { enabled: false },
        team_level_fields: teamLevelFields.filter(f => enabledTeamFields[f.id] !== false),
        actions: actions.filter(a => enabledActions[a.id] !== false),
      },
    };
  };

  const handleSave = async () => {
    if (!selectedEvent?.id) return;
    setIsSaving(true);
    try {
      const finalConfig = buildFinalConfig();

      // 1. Save sport_config via backend (service-role key, bypasses RLS)
      const patchRes = await fetch(`${API_BASE}/events/${selectedEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport_config: finalConfig, competition_category: 'sports' }),
        cache: 'no-store',
      });
      const patchData = await patchRes.json();
      if (!patchData.success) throw new Error(patchData.error || 'Failed to update event');

      // 2. Update context with real server data
      if (updateEvent) {
        try { await updateEvent(selectedEvent.id, { sport_config: finalConfig, competition_category: 'sports' }); }
        catch { /* context update is best-effort */ }
      }

      // 3. Remove old teams and brackets via backend
      await fetch(`${API_BASE}/sports/teams/by-event?event_id=${selectedEvent.id}`, { method: 'DELETE' });
      await fetch(`${API_BASE}/sports/brackets/by-event?event_id=${selectedEvent.id}`, { method: 'DELETE' });

      // 4. Create teams from participant team assignments
      let createdTeams = [];
      if (teamNames.length > 0) {
        const tRes = await fetch(`${API_BASE}/sports/teams/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teams: teamNames.map((name, i) => ({ event_id: selectedEvent.id, name, seed: i + 1 })) }),
        });
        const tData = await tRes.json();
        if (!tData.success) throw new Error(tData.error || 'Failed to create teams');
        createdTeams = tData.data;
      }

      // 5. Generate bracket skeleton
      const skeleton = generateBrackets(selectedEvent.id, createdTeams, bracketType);
      if (skeleton.length > 0) {
        const bRes = await fetch(`${API_BASE}/sports/brackets/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brackets: skeleton }),
        });
        const bData = await bRes.json();
        if (!bData.success) throw new Error(bData.error || 'Failed to create brackets');
      }

      setExistingConfig(finalConfig);
      showToast('Sports configuration saved!', 'success');
      setStep(1);
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!selectedEvent) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '16px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border }}>event_busy</span>
      <p style={{ color: colors.inkMuted }}>Select a Sports event from the workspace switcher.</p>
    </div>
  );

  if (selectedEvent.type !== 'Sports') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '16px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border }}>block</span>
      <p style={{ color: colors.inkMuted }}>Selected event type is <strong>{selectedEvent.type}</strong>, not Sports.</p>
    </div>
  );

  const btn = (label, onClick, opts = {}) => (
    <button
      onClick={onClick}
      disabled={opts.disabled}
      style={{
        padding: opts.small ? '8px 18px' : '13px 24px',
        background: opts.disabled ? colors.borderSoft : (opts.secondary ? '#fff' : colors.navy),
        color: opts.disabled ? colors.inkMuted : (opts.secondary ? colors.navy : '#fff'),
        border: opts.secondary ? `1px solid ${colors.border}` : 'none',
        borderRadius: '12px', fontSize: '13px', fontWeight: '700',
        cursor: opts.disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s',
      }}
    >{label}</button>
  );

  // ── Step 1: Describe ──────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div style={{ maxWidth: '680px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Existing config banner */}
      {!configLoading && existingConfig && (
        <div style={{ background: colors.successBg, border: `1px solid ${colors.success}30`, borderRadius: '16px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-rounded" style={{ color: colors.success, fontSize: '20px' }}>check_circle</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', color: '#065f46', fontSize: '14px' }}>{existingConfig.display_name} — Already Configured</div>
            <div style={{ fontSize: '12px', color: '#065f46', opacity: 0.7 }}>{existingConfig.ruleset} · {existingConfig.structure?.bracket_type?.replace(/_/g, ' ')} · {existingConfig.scoring_sheet?.unit === 'player' ? 'Player stats' : existingConfig.scoring_sheet?.unit === 'team' ? 'Team log' : 'Basic score'}</div>
          </div>
          <button onClick={() => { populateFromConfig(existingConfig); setStep(2); }} style={{ padding: '7px 14px', background: '#fff', border: `1px solid ${colors.success}40`, borderRadius: '9px', fontWeight: '700', cursor: 'pointer', fontSize: '12px', color: '#065f46' }}>Edit Config</button>
        </div>
      )}

      {/* Participants warning */}
      {!hasParticipants && (
        <div style={{ background: colors.warningBg, border: `1px solid ${colors.warning}30`, borderRadius: '16px', padding: '14px 18px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span className="material-symbols-rounded" style={{ color: colors.warning, fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>warning</span>
          <div>
            <div style={{ fontWeight: '700', color: '#92400e', fontSize: '13px', marginBottom: '4px' }}>Add participants before configuring</div>
            <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '12px', lineHeight: 1.5 }}>The scoring sheet depends on your participant roster and team assignments. Add participants first, then come back here.</div>
            <button onClick={() => navigate('/organizer/participants')} style={{ padding: '8px 16px', background: colors.navy, color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>groups</span>Add Participants
            </button>
          </div>
        </div>
      )}

      {/* Roster summary */}
      {hasParticipants && (
        <div style={{ background: colors.accentBg, border: `1px solid ${colors.accentGlow}`, borderRadius: '16px', padding: '14px 20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.accent, marginBottom: '10px' }}>Roster Detected</div>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: '22px', fontWeight: '800', color: colors.navy }}>{participants.length}</div><div style={{ fontSize: '11px', color: colors.inkMuted }}>Participants</div></div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: colors.navy }}>{teamNames.length}</div>
              <div style={{ fontSize: '11px', color: colors.inkMuted }}>Teams</div>
              {teamNames.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>{teamNames.map(t => <span key={t} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '5px', background: '#fff', color: colors.navy, border: `1px solid ${colors.border}`, fontWeight: '600' }}>{t}</span>)}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Describe card */}
      <SectionCard title="Describe the Sport" icon="auto_awesome">
        <p style={{ fontSize: '13px', color: colors.inkMuted, margin: '0 0 12px', lineHeight: 1.5 }}>
          Tell Claude what sport this is, the format, and any specific rules. It will generate a complete scoring sheet blueprint that you can review and approve section by section.
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={`e.g. "FIBA 3x3 basketball, single elimination, track FT/2PT/3PT/fouls/rebounds, 10-minute halves, foul out at 5 personal fouls"`}
          rows={4}
          style={{ width: '100%', padding: '12px 14px', border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', color: colors.navy, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {CHIPS.map((c, i) => (
            <button key={i} onClick={() => setDescription(c)} style={{ padding: '5px 11px', borderRadius: '100px', border: `1px solid ${colors.border}`, background: '#fff', color: colors.inkSoft, fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.inkSoft; }}
            >{c}</button>
          ))}
        </div>
        {genError && <div style={{ marginTop: '10px', padding: '10px 14px', background: colors.errorBg, borderRadius: '10px', fontSize: '12px', color: colors.error }}>{genError}</div>}
        <button
          onClick={handleGenerate}
          disabled={!description.trim() || isGenerating || !hasParticipants}
          style={{
            marginTop: '14px', width: '100%', padding: '14px',
            background: (!description.trim() || isGenerating || !hasParticipants) ? colors.borderSoft : colors.navy,
            color: (!description.trim() || isGenerating || !hasParticipants) ? colors.inkMuted : '#fff',
            border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
            cursor: (!description.trim() || isGenerating || !hasParticipants) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
          }}
        >
          {isGenerating
            ? <><span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>autorenew</span>Generating scoring sheet...</>
            : <><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>auto_awesome</span>Analyze & Generate Scoring Sheet</>}
        </button>
      </SectionCard>
    </div>
  );

  // ── Step 2: Approve Each Section ─────────────────────────────────────────
  const renderStep2 = () => (
    <div style={{ maxWidth: '720px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.navy, fontFamily: "'DM Sans', sans-serif" }}>Review & Approve Configuration</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: colors.inkMuted }}>Check each section. Enable or disable fields to match your needs.</p>
        </div>
        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>arrow_back</span>Back
        </button>
      </div>

      {/* 1. Sport Identity */}
      <SectionCard title="Sport Identity" icon="sports" accent="#7C3AED">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Sport Name</label>
            <input value={sportName} onChange={e => setSportName(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${colors.border}`, borderRadius: '9px', fontSize: '13px', fontWeight: '600', color: colors.navy, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Ruleset</label>
            <input value={ruleset} onChange={e => setRuleset(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${colors.border}`, borderRadius: '9px', fontSize: '13px', color: colors.navy, boxSizing: 'border-box', outline: 'none' }} />
          </div>
        </div>
      </SectionCard>

      {/* 2. Tournament Format */}
      <SectionCard title="Tournament Format" icon="account_tree" accent={colors.navy}>
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Bracket Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {BRACKET_OPTS.map(o => (
              <button key={String(o.val)} onClick={() => setBracketType(o.val)}
                style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${String(bracketType) === String(o.val) ? colors.navy : colors.border}`, background: String(bracketType) === String(o.val) ? colors.navy : '#fff', color: String(bracketType) === String(o.val) ? '#fff' : colors.inkSoft, transition: 'all 0.15s' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{o.icon}</span>{o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Seeding</div>
          <div style={{ display: 'flex', gap: '7px' }}>
            {SEEDING_OPTS.map(o => <ToggleChip key={o.val} active={seeding === o.val} onClick={() => setSeeding(o.val)}>{o.label}</ToggleChip>)}
          </div>
        </div>
      </SectionCard>

      {/* 3. Scoring Mode */}
      <SectionCard title="Scoring Mode" icon="scoreboard" accent={colors.success}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {UNIT_OPTS.map(o => (
            <div key={o.val} onClick={() => setUnit(o.val)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${unit === o.val ? colors.accent : colors.borderSoft}`, background: unit === o.val ? colors.accentBg : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
              <input type="radio" checked={unit === o.val} readOnly style={{ accentColor: colors.accent, width: '15px', height: '15px', flexShrink: 0 }} />
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: unit === o.val ? colors.accent + '20' : colors.pageBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px', color: unit === o.val ? colors.accent : colors.inkMuted }}>{o.icon}</span>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: unit === o.val ? colors.navy : colors.inkSoft, fontSize: '13px' }}>{o.label}</div>
                <div style={{ fontSize: '11px', color: colors.inkMuted, lineHeight: 1.4 }}>{o.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Scoring Fields (player mode only) */}
      {unit === 'player' && allFields.filter(f => f.type !== 'static').length > 0 && (
        <SectionCard title="Scoring Fields" icon="table_chart" accent={colors.accent}>
          <p style={{ fontSize: '12px', color: colors.inkMuted, margin: '0 0 10px' }}>Check the fields you want to appear on the scorer's sheet. Uncheck to hide a field.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <button onClick={() => { const o = {}; allFields.forEach(f => { o[f.id] = true; }); setEnabledFields(o); }} style={{ fontSize: '11px', fontWeight: '600', color: colors.accent, background: 'none', border: 'none', cursor: 'pointer' }}>Enable All</button>
            <button onClick={() => { const o = {}; allFields.filter(f => f.type === 'static').forEach(f => { o[f.id] = true; }); setEnabledFields(o); }} style={{ fontSize: '11px', fontWeight: '600', color: colors.inkMuted, background: 'none', border: 'none', cursor: 'pointer' }}>Disable Optional</button>
          </div>
          {rawGroups.map(g => (
            <div key={g.id} style={{ marginBottom: '8px' }}>
              {g.label && <div style={{ fontSize: '10px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '10px 0 4px' }}>{g.label}</div>}
              {(g.fields || []).filter(f => f.type !== 'static').map(f => (
                <FieldRow key={f.id} field={f} enabled={enabledFields[f.id] !== false} onToggle={() => setEnabledFields(p => ({ ...p, [f.id]: !p[f.id] }))} />
              ))}
            </div>
          ))}
        </SectionCard>
      )}

      {/* 5. Period Tracking */}
      <SectionCard title="Period Tracking" icon="timer" accent="#D97706">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: periodEnabled ? '14px' : '0' }}>
          <input type="checkbox" checked={periodEnabled} onChange={e => setPeriodEnabled(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: colors.accent, cursor: 'pointer' }} />
          <label style={{ fontSize: '13px', fontWeight: '600', color: colors.navy, cursor: 'pointer' }}>Enable period tracking ({periodLabel}s, quarters, sets…)</label>
        </div>
        {periodEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', paddingTop: '4px' }}>
            {[
              { label: 'Period Label', val: periodLabel, set: setPeriodLabel, type: 'text', placeholder: 'Quarter' },
              { label: 'Total Periods', val: totalPeriods, set: v => setTotalPeriods(Number(v)), type: 'number', placeholder: '4' },
              { label: 'Duration (min)', val: periodDuration, set: v => setPeriodDuration(Number(v)), type: 'number', placeholder: '10' },
            ].map(({ label, val, set, type, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>{label}</label>
                <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: '9px', fontSize: '13px', color: colors.navy, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Overtime</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <ToggleChip active={overtime} onClick={() => setOvertime(true)}>Yes</ToggleChip>
                <ToggleChip active={!overtime} onClick={() => setOvertime(false)}>No</ToggleChip>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* 6. Team-Level Fields */}
      {teamLevelFields.length > 0 && (
        <SectionCard title="Team-Level Trackers" icon="group" accent="#059669">
          <p style={{ fontSize: '12px', color: colors.inkMuted, margin: '0 0 10px' }}>These appear in each team's header during scoring (timeouts, team fouls, possession, etc.)</p>
          {teamLevelFields.map(f => (
            <FieldRow key={f.id} field={f} enabled={enabledTeamFields[f.id] !== false} onToggle={() => setEnabledTeamFields(p => ({ ...p, [f.id]: !p[f.id] }))} />
          ))}
        </SectionCard>
      )}

      {/* 7. Scorer Actions */}
      {actions.length > 0 && (
        <SectionCard title="Scorer Actions" icon="touch_app" accent={colors.navy}>
          <p style={{ fontSize: '12px', color: colors.inkMuted, margin: '0 0 10px' }}>Buttons that appear in the action bar during scoring.</p>
          {actions.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <input type="checkbox" checked={enabledActions[a.id] !== false} onChange={() => setEnabledActions(p => ({ ...p, [a.id]: !p[a.id] }))} style={{ width: '16px', height: '16px', accentColor: colors.accent, cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: '600', color: enabledActions[a.id] !== false ? colors.navy : colors.inkMuted, fontSize: '13px' }}>{a.label}</span>
                {a.description && <span style={{ fontSize: '11px', color: colors.inkMuted, marginLeft: '8px' }}>{a.description}</span>}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: colors.pageBg, color: colors.inkMuted, border: `1px solid ${colors.borderSoft}` }}>{a.type}</span>
            </div>
          ))}
        </SectionCard>
      )}

      {/* Teams preview */}
      <SectionCard title={`Teams from Participants (${teamNames.length})`} icon="groups" accent={colors.accent}>
        {teamNames.length === 0
          ? <p style={{ fontSize: '13px', color: colors.inkMuted, fontStyle: 'italic', margin: 0 }}>No team assignments yet. Participants without a team will be shown as unassigned.</p>
          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {teamNames.map(t => {
              const count = participants.filter(p => p.team === t).length;
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', background: colors.pageBg, borderRadius: '10px', border: `1px solid ${colors.borderSoft}` }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: colors.accentBg, display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: '800', color: colors.accent }}>{t.charAt(0)}</div>
                  <span style={{ fontWeight: '600', color: colors.navy, fontSize: '13px' }}>{t}</span>
                  <span style={{ fontSize: '11px', color: colors.inkMuted }}>{count} player{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        }
      </SectionCard>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !sportName.trim()}
        style={{
          width: '100%', padding: '15px', marginTop: '8px',
          background: (isSaving || !sportName.trim()) ? colors.borderSoft : colors.accent,
          color: (isSaving || !sportName.trim()) ? colors.inkMuted : '#fff',
          border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800',
          cursor: (isSaving || !sportName.trim()) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
          boxShadow: (isSaving || !sportName.trim()) ? 'none' : '0 8px 20px rgba(59,130,246,0.25)',
          transition: 'all 0.2s',
        }}
      >
        {isSaving
          ? <><span className="material-symbols-rounded" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>autorenew</span>Saving configuration...</>
          : <><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>save</span>Save Sports Configuration</>}
      </button>
    </div>
  );

  return (
    <div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Event header */}
      <div style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.navySoft})`, borderRadius: '18px', padding: '18px 22px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', maxWidth: step === 2 ? '720px' : '680px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '24px', color: '#fff' }}>sports</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sports Configuration</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontFamily: "'DM Sans', system-ui, sans-serif" }}>{selectedEvent.name}</div>
        </div>
        {step === 2 && (
          <div style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
            Step 2 of 2 — Review
          </div>
        )}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
}
