import React, { useState, useEffect } from 'react';
import { useEventContext } from './OrganizerLayout';
import { colors } from '../../styles/colors';
import { API_URL } from '../../config';

// ─── Offline Fallback (when Claude API is unavailable) ─────────────────────
const getOfflineSuggestion = (step, eventTitle = '', gameName = '') => {
  const query = `${eventTitle} ${gameName}`.toLowerCase();

  const gameKeywords = {
    tugOfWar: ['tug', 'war', 'tarik'],
    patintero: ['patintero', 'harangang'],
    agawanBase: ['agawan', 'base'],
    luksong: ['luksong', 'tinik', 'baka'],
    piko: ['piko', 'hopscotch'],
    batuhan: ['batuhan', 'bato'],
  };

  const detectGame = () => {
    if (query.includes('tug') || query.includes('war')) return 'Tug of War';
    if (query.includes('patintero')) return 'Patintero';
    if (query.includes('agawan')) return 'Agawan Base';
    if (query.includes('luksong')) return 'Luksong Tinik';
    return 'Traditional Game';
  };

  if (step === 0) {
    const gType = detectGame();
    return {
      gameType: gType,
      category: gType === 'Tug of War' ? 'team' : 'team',
      description: `A classic Filipino traditional game where teams compete in exciting rounds.`,
      suggestedTeamCount: 4,
      suggestedRoundsPerMatch: 3,
      reason: 'Based on the event title, this appears to be a traditional team-based game.'
    };
  }
  if (step === 1) return { teamCount: 4, teamNames: ['Team A', 'Team B', 'Team C', 'Team D'], reason: '4 teams allows for a clean single-elimination bracket with 2 rounds.' };
  if (step === 2) return { roundsPerMatch: 3, format: 'Best of 3', advancementRule: 'Winner of each match advances to the next round.', reason: 'Best of 3 provides a fair competition while keeping matches moving.' };
  if (step === 3) return { bracketFormat: 'single_elimination', formatLabel: 'Single Elimination', reason: 'Single elimination is the most exciting format, building up to a Grand Final.' };
  if (step === 4) return { scoringFields: [{ id: 'result', label: 'Round Result', type: 'win_loss', description: 'Who wins this round' }], trackPoints: false, reason: 'Traditional games are typically decided by round wins rather than points.' };
  if (step === 5) return { summary: 'A fair and exciting traditional games tournament using single elimination format. Teams compete in best-of-3 matches, with winners advancing until a champion is crowned.', keyRules: ['Best of 3 rounds per match', 'Winners advance to the next round', 'Grand Final determines the champion'], estimatedDuration: '2-3 hours', judgeRole: 'Judges record round results and confirm match winners.' };
  return {};
};

const STEP_LABELS = ['Overview', 'Teams', 'Rounds', 'Bracket', 'Scoring', 'Review'];

export default function GameSetupBuilderPage() {
  const { selectedEvent, showToast, eventsLoading, participants = [] } = useEventContext();

  const isLocked = ['active', 'ongoing', 'completed'].includes((selectedEvent?.status || '').toLowerCase());

  const uniqueTeamNames = React.useMemo(() => {
    const names = participants
      .map(p => p.team?.trim() || p.name?.trim())
      .filter(Boolean);
    return [...new Set(names)];
  }, [participants]);

  const [setupStep, setSetupStep] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [existingSetup, setExistingSetup] = useState(null);
  const [hasActiveSetupScreen, setHasActiveSetupScreen] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customVal, setCustomVal] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [config, setConfig] = useState({
    gameName: '',
    gameType: '',
    category: 'team',
    description: '',
    teamCount: 4,
    teams: [],
    roundsPerMatch: 3,
    bracketFormat: 'single_elimination',
    advancementRule: '',
    scoringFields: [],
    trackPoints: false,
    summary: '',
    keyRules: [],
    estimatedDuration: '',
    judgeRole: '',
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // Check if this event is a game event
  const isGameEvent = selectedEvent?.competition_mode === 'game';

  // Fetch existing game setup on mount
  useEffect(() => {
    if (!selectedEvent) { setIsInitialLoading(false); return; }
    if (!isGameEvent) { setIsInitialLoading(false); return; }

    const fetchSetup = async () => {
      setIsInitialLoading(true);
      try {
        const res = await fetch(`${API_URL}/game/setup?event_id=${selectedEvent.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setExistingSetup(json.data);
          setHasActiveSetupScreen(true);
          const cfg = json.data.config || {};
          setConfig(prev => ({ ...prev, ...cfg }));
        } else {
          setExistingSetup(null);
          setHasActiveSetupScreen(false);
          setSetupStep(0);
        }
      } catch (err) {
        console.error('Error loading game setup:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchSetup();
  }, [selectedEvent]);

  const getAISuggestion = async (stepNumber, isRegen = false) => {
    if (!selectedEvent) return null;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/claude/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: stepNumber,
          eventTitle: selectedEvent.name,
          eventDescription: selectedEvent.description || '',
          gameName: config.gameName || config.gameType || '',
          currentConfig: config,
          isRegenerating: isRegen
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLoading(false);
        return json.data;
      }
      throw new Error(json.error || 'No data');
    } catch (err) {
      console.warn('Claude API fallback:', err.message);
      setLoading(false);
      return getOfflineSuggestion(stepNumber, selectedEvent.name, config.gameName);
    }
  };

  const triggerStepSuggestion = async (step, isRegen = false) => {
    setIsCustomizing(false);
    const sug = await getAISuggestion(step, isRegen);
    setSuggestion(sug);

    if (step === 0) {
      setCustomVal({ gameName: config.gameType || sug?.gameType || '', description: sug?.description || '' });
    } else if (step === 1) {
      const tc = uniqueTeamNames.length;
      setCustomVal({ teamCount: tc, teamNames: uniqueTeamNames });
    } else if (step === 2) {
      setCustomVal({ roundsPerMatch: config.roundsPerMatch || sug?.roundsPerMatch || 3, advancementRule: config.advancementRule || sug?.advancementRule || '' });
    } else if (step === 3) {
      setCustomVal({ bracketFormat: config.bracketFormat || sug?.bracketFormat || 'single_elimination' });
    } else if (step === 4) {
      setCustomVal({ scoringFields: config.scoringFields?.length > 0 ? config.scoringFields : (sug?.scoringFields || [{ id: 'result', label: 'Round Result', type: 'win_loss', description: 'Who wins this round' }]), trackPoints: config.trackPoints ?? sug?.trackPoints ?? false });
    }
  };

  // Start wizard
  useEffect(() => {
    if (!isInitialLoading && !hasActiveSetupScreen && isGameEvent && selectedEvent) {
      triggerStepSuggestion(0);
    }
  }, [isInitialLoading, hasActiveSetupScreen, isGameEvent, selectedEvent?.id]);

  const handleAccept = () => {
    if (!suggestion) return;
    if (setupStep === 0) {
      setConfig(prev => ({ ...prev, gameType: suggestion.gameType, category: suggestion.category, description: suggestion.description, teamCount: suggestion.suggestedTeamCount || prev.teamCount, gameName: suggestion.gameType }));
      setSetupStep(1);
      triggerStepSuggestion(1);
    } else if (setupStep === 1) {
      const tc = uniqueTeamNames.length;
      const teams = uniqueTeamNames.map((n, i) => ({ id: `team-${i}`, name: n, color: TEAM_COLORS[i % TEAM_COLORS.length] }));
      setConfig(prev => ({ ...prev, teamCount: tc, teams }));
      setSetupStep(2);
      triggerStepSuggestion(2);

    } else if (setupStep === 2) {
      setConfig(prev => ({ ...prev, roundsPerMatch: suggestion.roundsPerMatch || 3, advancementRule: suggestion.advancementRule || '' }));
      setSetupStep(3);
      triggerStepSuggestion(3);
    } else if (setupStep === 3) {
      setConfig(prev => ({ ...prev, bracketFormat: suggestion.bracketFormat || 'single_elimination' }));
      setSetupStep(4);
      triggerStepSuggestion(4);
    } else if (setupStep === 4) {
      setConfig(prev => ({ ...prev, scoringFields: suggestion.scoringFields || prev.scoringFields, trackPoints: suggestion.trackPoints ?? prev.trackPoints }));
      setSetupStep(5);
      triggerStepSuggestion(5);
    }
  };

  const handleApplyCustom = () => {
    if (setupStep === 0) {
      setConfig(prev => ({ ...prev, gameType: customVal.gameName || prev.gameType, gameName: customVal.gameName || prev.gameName, description: customVal.description || prev.description }));
      setSetupStep(1);
      triggerStepSuggestion(1);
    } else if (setupStep === 1) {
      const tc = Number(customVal.teamCount) || 4;
      const names = customVal.teamNames || [];
      const teams = Array.from({ length: tc }, (_, i) => ({ id: `team-${i}`, name: names[i] || `Team ${String.fromCharCode(65 + i)}`, color: TEAM_COLORS[i % TEAM_COLORS.length] }));
      setConfig(prev => ({ ...prev, teamCount: tc, teams }));
      setSetupStep(2);
      triggerStepSuggestion(2);
    } else if (setupStep === 2) {
      setConfig(prev => ({ ...prev, roundsPerMatch: Number(customVal.roundsPerMatch) || 3, advancementRule: customVal.advancementRule || prev.advancementRule }));
      setSetupStep(3);
      triggerStepSuggestion(3);
    } else if (setupStep === 3) {
      setConfig(prev => ({ ...prev, bracketFormat: customVal.bracketFormat || 'single_elimination' }));
      setSetupStep(4);
      triggerStepSuggestion(4);
    } else if (setupStep === 4) {
      setConfig(prev => ({ ...prev, scoringFields: customVal.scoringFields || prev.scoringFields, trackPoints: customVal.trackPoints ?? prev.trackPoints }));
      setSetupStep(5);
      triggerStepSuggestion(5);
    }
  };

  const handleBack = () => {
    const prev = setupStep - 1;
    setSetupStep(prev);
    if (prev >= 0) triggerStepSuggestion(prev);
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      const userId = localStorage.getItem('user_id');
      const finalConfig = { ...config };

      const res = await fetch(`${API_URL}/game/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent.id, config: finalConfig, created_by: userId })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Generate brackets from the teams
      await fetch(`${API_URL}/game/brackets/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          teams: finalConfig.teams.map(t => t.name),
          bracketFormat: finalConfig.bracketFormat,
          roundsPerMatch: finalConfig.roundsPerMatch
        })
      });

      showToast('Game setup saved and bracket generated!', 'success');
      setExistingSetup(json.data);
      setHasActiveSetupScreen(true);
    } catch (err) {
      console.error(err);
      showToast('Failed to save game setup.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const TEAM_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  // ─── Guard: Not a game event ────────────────────────────────────────────────
  if (!isGameEvent && !eventsLoading && selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: colors.accentBg, display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: colors.accent }}>sports_esports</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>Standard Event Mode</h2>
        <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          This event uses the standard scoring mode. The Game Setup Builder is only available for events with <strong>Game</strong> competition mode. Change the event's competition mode in Event Settings.
        </p>
      </div>
    );
  }

  // ─── Guard: No participants registered ───────────────────────────────────────
  if (isGameEvent && !eventsLoading && selectedEvent && !existingSetup && uniqueTeamNames.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#EF4444' }}>groups_2</span>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: colors.navy, marginBottom: '10px' }}>No Teams Registered</h2>
        <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Traditional game tournaments require team participants to be registered first. Please head over to the <strong>Participants</strong> page in the sidebar to add your competing teams.
        </p>
      </div>
    );
  }


  if (isInitialLoading || eventsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${colors.borderSoft}`, borderTopColor: colors.accent, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: colors.inkMuted, fontWeight: '600' }}>Loading game setup...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '48px', color: colors.border, display: 'block', marginBottom: '12px' }}>event_busy</span>
        <p style={{ color: colors.inkMuted, fontSize: '15px' }}>No event selected.</p>
      </div>
    );
  }

  // ─── Active Setup Dashboard ─────────────────────────────────────────────────
  if (hasActiveSetupScreen && existingSetup) {
    const cfg = existingSetup.config || {};
    return (
      <div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '12px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.success }}>check_circle</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: colors.success, letterSpacing: '0.04em' }}>Game Setup Active</span>
            </div>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '32px', fontWeight: '800', color: colors.navy, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              {cfg.gameName || cfg.gameType || 'Game Setup'}
            </h1>
            <p style={{ color: colors.inkMid, fontSize: '15px', margin: 0, maxWidth: '520px', lineHeight: '1.55' }}>
              {cfg.description || 'Tournament configuration is active.'}
            </p>
          </div>
          <button
            onClick={() => { setHasActiveSetupScreen(false); setSetupStep(0); triggerStepSuggestion(0); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, transition: 'all 0.2s' }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
            Reconfigure Setup
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { icon: 'groups', label: 'Teams', value: cfg.teamCount || cfg.teams?.length || '—', color: colors.accent },
            { icon: 'repeat', label: 'Rounds/Match', value: cfg.roundsPerMatch ? `Best of ${cfg.roundsPerMatch}` : '—', color: '#8B5CF6' },
            { icon: 'account_tree', label: 'Bracket', value: cfg.bracketFormat === 'single_elimination' ? 'Single Elim.' : 'Round Robin', color: '#10B981' },
            { icon: 'timer', label: 'Est. Duration', value: cfg.estimatedDuration || '—', color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '18px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${s.color}14`, display: 'grid', placeItems: 'center' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px', color: s.color }}>{s.icon}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.inkMuted }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: '800', color: colors.navy }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Teams */}
        {cfg.teams && cfg.teams.length > 0 && (
          <div style={{ background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '22px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.navy }}>groups</span>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: '700', color: colors.navy, margin: 0 }}>Registered Teams</h3>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {cfg.teams.map((t, i) => (
                <div key={t.id || i} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '100px', background: `${t.color || colors.accent}14`, border: `1.5px solid ${t.color || colors.accent}30` }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color || colors.accent }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: colors.navy }}>{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Rules */}
        {cfg.keyRules && cfg.keyRules.length > 0 && (
          <div style={{ background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '22px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.navy }}>rule</span>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: '700', color: colors.navy, margin: 0 }}>Tournament Rules</h3>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cfg.keyRules.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: colors.accentBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: colors.accent }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: '14px', color: colors.inkMid, lineHeight: '1.5', paddingTop: '3px' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Wizard ─────────────────────────────────────────────────────────────────
  const LoaderDots = () => (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.accent, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }`}</style>
    </div>
  );

  const renderStepContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'grid', placeItems: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '28px', color: '#fff', animation: 'spin 2s linear infinite' }}>auto_awesome</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: colors.navy, margin: '0 0 4px' }}>Claude AI is thinking...</p>
            <p style={{ fontSize: '13px', color: colors.inkMuted, margin: 0 }}>Analyzing {selectedEvent.name} to suggest the best setup</p>
          </div>
          <LoaderDots />
        </div>
      );
    }

    switch (setupStep) {
      case 0:
        return (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1E2D4A 0%, #2E4268 100%)', borderRadius: '20px', padding: '32px', color: '#fff', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '26px' }}>sports_martial_arts</span>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, marginBottom: '2px' }}>Claude AI Detected</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif" }}>{suggestion?.gameType || 'Traditional Game'}</div>
                </div>
              </div>
              <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.6', margin: '0 0 12px' }}>{suggestion?.description || 'A classic Filipino traditional game competition.'}</p>
              {suggestion?.reason && (
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', opacity: 0.75 }}>
                  💡 {suggestion.reason}
                </div>
              )}
            </div>

            {isCustomizing && (
              <div style={{ borderTop: `1.5px dashed ${colors.borderSoft}`, paddingTop: '24px', marginTop: '8px', animation: 'fadeIn 0.25s ease-out' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.inkMuted, marginBottom: '8px', display: 'block' }}>Game Name</label>
                  <input type="text" value={customVal.gameName || ''} onChange={e => setCustomVal(p => ({ ...p, gameName: e.target.value }))} placeholder="e.g. Tug of War, Patintero..." style={{ width: '100%', height: '42px', padding: '0 14px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', color: colors.navy, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.inkMuted, marginBottom: '8px', display: 'block' }}>Brief Description</label>
                  <textarea value={customVal.description || ''} onChange={e => setCustomVal(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', color: colors.navy, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div>
            <div style={{ background: colors.pageBg, borderRadius: '18px', padding: '24px', marginBottom: '20px', border: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.accent }}>groups</span>
                <span style={{ fontWeight: 700, color: colors.navy }}>Registered Teams List</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '800', color: colors.navy, margin: '0 0 10px' }}>
                {uniqueTeamNames.length} Competing Teams Detected
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                {uniqueTeamNames.map((name, i) => (
                  <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: '#fff', border: `1.5px solid ${colors.borderSoft}` }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: TEAM_COLORS[i % TEAM_COLORS.length] }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: colors.navy }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ background: 'rgba(59,130,246,0.04)', borderRadius: '14px', padding: '16px 20px', border: `1px dashed ${colors.border}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span className="material-symbols-rounded" style={{ color: colors.accent, fontSize: '20px', flexShrink: 0 }}>info</span>
              <span style={{ fontSize: '13px', color: colors.inkMid, lineHeight: '1.5' }}>
                Teams are automatically synced from the <strong>Participants</strong> page. Any changes to team names or participant seeds must be done inside the Participants configuration tab.
              </span>
            </div>
          </div>
        );


      case 2:
        return (
          <div>
            <div style={{ background: colors.pageBg, borderRadius: '18px', padding: '24px', marginBottom: '20px', border: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px', color: colors.accent }}>repeat</span>
                <span style={{ fontWeight: 700, color: colors.navy }}>AI Suggestion</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: colors.navy, margin: '0 0 4px' }}>{suggestion?.format || 'Best of 3'}</p>
              <p style={{ fontSize: '13px', color: colors.inkMid, margin: '0 0 8px' }}>{suggestion?.advancementRule || ''}</p>
              {suggestion?.reason && <p style={{ fontSize: '13px', color: colors.inkMid, margin: 0, fontStyle: 'italic' }}>{suggestion.reason}</p>}
            </div>
            {isCustomizing && (
              <div style={{ borderTop: `1.5px dashed ${colors.borderSoft}`, paddingTop: '24px', animation: 'fadeIn 0.25s ease-out' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.inkMuted, marginBottom: '8px', display: 'block' }}>Rounds Per Match</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 3, 5].map(n => (
                      <button key={n} onClick={() => setCustomVal(p => ({ ...p, roundsPerMatch: n }))} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${customVal.roundsPerMatch === n ? colors.accent : colors.borderSoft}`, background: customVal.roundsPerMatch === n ? colors.accentBg : '#fff', fontWeight: 700, color: customVal.roundsPerMatch === n ? colors.accentDeep : colors.inkSoft, cursor: 'pointer', fontSize: '14px' }}>
                        Best of {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.inkMuted, marginBottom: '8px', display: 'block' }}>Advancement Rule</label>
                  <input type="text" value={customVal.advancementRule || ''} onChange={e => setCustomVal(p => ({ ...p, advancementRule: e.target.value }))} placeholder="e.g. Winner advances to next round" style={{ width: '100%', height: '42px', padding: '0 14px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', outline: 'none', color: colors.navy, boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        const formats = [
          { id: 'single_elimination', label: 'Single Elimination', icon: 'account_tree', desc: 'Lose once and you\'re out. Fast, exciting, and leads to a clear champion.' },
          { id: 'round_robin', label: 'Round Robin', icon: 'refresh', desc: 'Every team plays every other team. Fair and comprehensive.' },
        ];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formats.map(f => {
              const isSelected = (isCustomizing ? customVal.bracketFormat : suggestion?.bracketFormat || 'single_elimination') === f.id;
              return (
                <div key={f.id} onClick={() => { setIsCustomizing(true); setCustomVal(p => ({ ...p, bracketFormat: f.id })); }} style={{ padding: '20px 24px', borderRadius: '18px', border: `2px solid ${isSelected ? colors.accent : colors.borderSoft}`, background: isSelected ? colors.accentBg : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isSelected ? colors.accent : colors.pageBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '22px', color: isSelected ? '#fff' : colors.inkMuted }}>{f.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: isSelected ? colors.accentDeep : colors.navy, fontSize: '15px', marginBottom: '4px' }}>{f.label}</div>
                      <div style={{ fontSize: '13px', color: colors.inkMid }}>{f.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? colors.accent : colors.border}`, background: isSelected ? colors.accent : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </div>
                </div>
              );
            })}
            {suggestion?.reason && !isCustomizing && (
              <div style={{ background: colors.pageBg, borderRadius: '14px', padding: '14px 18px', border: `1px solid ${colors.borderSoft}` }}>
                <p style={{ fontSize: '13px', color: colors.inkMid, margin: 0 }}>💡 {suggestion.reason}</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <div style={{ background: colors.pageBg, borderRadius: '18px', padding: '24px', marginBottom: '20px', border: `1px solid ${colors.borderSoft}` }}>
              <p style={{ fontWeight: 700, color: colors.navy, margin: '0 0 8px' }}>Scoring Fields</p>
              {(suggestion?.scoringFields || []).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${colors.borderSoft}` }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px', color: colors.accent }}>{f.type === 'win_loss' ? 'sports_score' : f.type === 'points' ? 'pin' : 'timer'}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: colors.navy, fontSize: '14px' }}>{f.label}</div>
                    <div style={{ fontSize: '12px', color: colors.inkMuted }}>{f.description}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: '100px', background: colors.accentBg, fontSize: '11px', fontWeight: 700, color: colors.accentDeep }}>{f.type}</div>
                </div>
              ))}
              {suggestion?.reason && <p style={{ fontSize: '13px', color: colors.inkMid, margin: '12px 0 0', fontStyle: 'italic' }}>{suggestion.reason}</p>}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1E2D4A 0%, #2E4268 100%)', borderRadius: '20px', padding: '28px', color: '#fff', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '24px', color: '#FCD34D' }}>emoji_events</span>
                <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: "'DM Sans', sans-serif" }}>Tournament Summary</span>
              </div>
              <p style={{ fontSize: '14px', opacity: 0.85, lineHeight: '1.7', margin: '0 0 16px' }}>{suggestion?.summary || config.summary || 'Your tournament is ready to begin!'}</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.12)', fontSize: '12px', fontWeight: 600 }}>⏱ {suggestion?.estimatedDuration || config.estimatedDuration || '—'}</div>
                <div style={{ padding: '6px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.12)', fontSize: '12px', fontWeight: 600 }}>👥 {config.teamCount} Teams</div>
                <div style={{ padding: '6px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.12)', fontSize: '12px', fontWeight: 600 }}>🏆 {config.bracketFormat === 'single_elimination' ? 'Single Elimination' : 'Round Robin'}</div>
              </div>
            </div>
            {suggestion?.keyRules && (
              <div style={{ background: '#fff', border: `1px solid ${colors.borderSoft}`, borderRadius: '18px', padding: '20px 24px' }}>
                <p style={{ fontWeight: 700, color: colors.navy, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>rule</span> Key Rules
                </p>
                {(suggestion.keyRules || config.keyRules || []).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: colors.accentBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: colors.accent }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: colors.inkMid, lineHeight: '1.5', paddingTop: '2px' }}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* 🔒 Lock overlay */}
      {isLocked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '24px', padding: '36px 28px', maxWidth: '400px', boxShadow: '0 20px 48px rgba(15,23,42,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FFF9E6', color: '#D97706', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(217,119,6,0.15)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>lock</span>
            </div>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: colors.navy, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Game Setup Locked
              </h3>
              <p style={{ fontSize: '13.5px', color: colors.inkSoft, lineHeight: 1.5, margin: 0 }}>
                This event is <strong>{selectedEvent?.status}</strong>. Game setup is locked to preserve bracket integrity and scoring data.
              </p>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', background: colors.pageBg, padding: '6px 14px', borderRadius: '100px', border: `1px solid ${colors.borderSoft}` }}>
              Status: {selectedEvent?.status}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)', marginBottom: '12px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#6366f1' }}>sports_martial_arts</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', letterSpacing: '0.04em' }}>Game Setup Builder</span>
        </div>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '32px', fontWeight: '800', color: colors.navy, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Configure Your Tournament</h1>
        <p style={{ color: colors.inkMid, fontSize: '15px', maxWidth: '580px', lineHeight: '1.55', margin: 0 }}>Claude AI will guide you through setting up the perfect tournament structure for <strong>{selectedEvent.name}</strong>.</p>
      </div>

      {/* Step Tracker */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
        {STEP_LABELS.map((label, i) => {
          const isActive = i === setupStep;
          const isDone = i < setupStep;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '100px', background: isDone ? 'rgba(16, 185, 129, 0.08)' : isActive ? colors.accentBg : 'transparent', border: isDone ? '1px solid rgba(16,185,129,0.2)' : isActive ? `1px solid ${colors.accentGlow}` : '1px solid transparent', whiteSpace: 'nowrap' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isDone ? colors.success : isActive ? colors.accent : colors.borderSoft, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {isDone ? <span className="material-symbols-rounded" style={{ fontSize: '13px', color: '#fff' }}>check</span> : <span style={{ fontSize: '10px', fontWeight: 800, color: isActive ? '#fff' : colors.inkMuted }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: isDone ? colors.success : isActive ? colors.accentDeep : colors.inkMuted }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Wizard Card */}
      <div style={{ background: '#fff', border: `1.5px solid ${colors.borderSoft}`, borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(15,23,42,0.02)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: '800', color: colors.navy, margin: '0 0 6px' }}>
            {['Identify the Game', 'Set Up Teams', 'Configure Rounds', 'Choose Bracket Format', 'Scoring Sheet', 'Review & Confirm'][setupStep]}
          </h2>
          <p style={{ fontSize: '14px', color: colors.inkMid, margin: 0 }}>
            {['Claude AI will identify the game and suggest the perfect tournament structure.', 'How many teams will compete? Customize their names.', 'How many rounds per match? Define the advancement rule.', 'Choose how the tournament bracket will be structured.', 'What gets tracked per round in each match.', 'Review the complete setup before saving.'][setupStep]}
          </p>
        </div>
        {renderStepContent()}
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {setupStep > 0 && (
            <button onClick={handleBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, transition: 'all 0.2s' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span> Back
            </button>
          )}
          {setupStep < 5 && (
            <button onClick={() => triggerStepSuggestion(setupStep, true)} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', background: 'rgba(99,102,241,0.06)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)', opacity: loading ? 0.5 : 1, transition: 'all 0.2s' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>refresh</span> Regenerate
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {setupStep < 5 && !isCustomizing && !loading && (
            <button onClick={() => { setIsCustomizing(true); if (setupStep === 0) setCustomVal({ gameName: config.gameType || '', description: config.description || '' }); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: colors.inkSoft, border: `1px solid ${colors.border}`, transition: 'all 0.2s' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>tune</span> Customize
            </button>
          )}
          {setupStep < 5 && (
            <button
              onClick={isCustomizing ? handleApplyCustom : handleAccept}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', background: colors.navy, color: '#fff', border: 'none', opacity: loading ? 0.5 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(30,45,74,0.2)' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{isCustomizing ? 'check' : 'arrow_forward'}</span>
              {isCustomizing ? 'Apply & Continue' : 'Accept & Continue'}
            </button>
          )}
          {setupStep === 5 && (
            <button
              onClick={handleFinalSave}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '14px', fontSize: '14.5px', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer', background: isSaving ? colors.inkMuted : colors.success, color: '#fff', border: 'none', opacity: isSaving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              {isSaving ? <><span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>cached</span> Saving...</> : <><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>rocket_launch</span> Save Game Setup</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
