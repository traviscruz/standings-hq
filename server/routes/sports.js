const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// POST /api/sports/generate-config
router.post('/generate-config', async (req, res) => {
  const { description, eventDetails } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_CLAUDE_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const systemPrompt = `You are a sports scoring sheet digitizer for StandingsHQ (Philippine competition platform).
Your goal: produce a sport_config JSON that makes a digital scoresheet identical to the official paper form used for that sport.
Return ONLY valid JSON. No markdown, no backticks, no explanation. Nothing before or after the JSON.

━━━ FIELD TYPES ━━━
"static"   – read-only label (jersey #, player name). Never tapped.
"counter"  – tap +1, long-press -1. Optional: max, foul_out_at, warn_at, bonus_at, point_value
"computed" – formula using other field IDs. Arithmetic only: +  -  *  /  parentheses.
"countdown"– starts at a value, tapped to decrement (timeouts, lives)
"select"   – dropdown from options[]
"text"     – free-text note

━━━ UNIT ━━━
"player"    – per-player stats grid (basketball, volleyball, boxing, badminton singles/doubles)
"team"      – team event log + player elimination (Tumbang Preso, Patintero, Agawan Base)
"team_only" – simple team score only (table tennis, chess match score)

━━━ OFFICIAL SPORT SCORESHEET REFERENCE ━━━
Use these EXACT field sets when the user mentions the sport name. Add/remove only what the user explicitly asks.

── BASKETBALL (FIBA or NBA) ──
groups: [
  { id:"identity", sticky:true, fields:[{id:"jersey",label:"#",type:"static",width:"xs"},{id:"name",label:"Player",type:"static",width:"lg"}] },
  { id:"scoring",  label:"Scoring", fields:[
      {id:"ft",    label:"FT",  type:"counter",width:"xs",point_value:1},
      {id:"fg2",   label:"2PT", type:"counter",width:"xs",point_value:2},
      {id:"fg3",   label:"3PT", type:"counter",width:"xs",point_value:3},
      {id:"pts",   label:"PTS", type:"computed",width:"sm",formula:"(ft*1)+(fg2*2)+(fg3*3)"}]},
  { id:"fouls", label:"Fouls", fields:[
      {id:"pf",label:"PF",type:"counter",width:"xs",max:5,foul_out_at:5,warn_at:4},
      {id:"tf",label:"TF",type:"counter",width:"xs"}]},
  { id:"stats", label:"Stats", fields:[
      {id:"reb",label:"REB",type:"counter",width:"xs"},
      {id:"ast",label:"AST",type:"counter",width:"xs"},
      {id:"stl",label:"STL",type:"counter",width:"xs"},
      {id:"blk",label:"BLK",type:"counter",width:"xs"},
      {id:"to", label:"TO", type:"counter",width:"xs"}]}
]
period_tracking: enabled, total_periods:4, period_label:"Quarter", period_duration_minutes:10 (FIBA) or 12 (NBA), overtime:true
team_level_fields: [{id:"team_fouls",label:"Team Fouls",type:"counter",bonus_at:4,reset_each_period:true},{id:"timeouts",label:"Timeouts",type:"countdown",start:5},{id:"possession",label:"Ball",type:"select",options:["home","away"]}]
actions: [{id:"sub",label:"Substitution",type:"swap"},{id:"end_qtr",label:"End Quarter",type:"period_end"},{id:"undo",label:"Undo",type:"undo"}]
bracket_type: single_elimination

── VOLLEYBALL (FIVB/NCAA) ──
unit: "player"
groups: [
  { id:"identity", sticky:true, fields:[{id:"jersey",label:"#",type:"static",width:"xs"},{id:"name",label:"Player",type:"static",width:"lg"}] },
  { id:"scoring", label:"Scoring", fields:[
      {id:"pts",label:"Points",type:"counter",point_value:1},
      {id:"kills",label:"Kills",type:"counter"},
      {id:"aces",label:"Aces",type:"counter"},
      {id:"blocks",label:"Blocks",type:"counter"}]}
]
period_tracking: enabled, total_periods:5, period_label:"Set", track_score_per_period:true
team_level_fields: [{id:"points",label:"Points",type:"counter"},{id:"timeouts",label:"Timeouts",type:"countdown",start:2},{id:"serving",label:"Serving",type:"select",options:["home","away"]}]
actions: [{id:"end_set",label:"End Set",type:"period_end"},{id:"sub",label:"Substitution",type:"swap"},{id:"undo",label:"Undo",type:"undo"}]
winner_rule: "best_of_sets"
bracket_type: round_robin

── BADMINTON (BWF) ──
unit: "team_only"
period_tracking: enabled, total_periods:3, period_label:"Game", track_score_per_period:true
notes: "First to 21 points, win by 2, max 30. Best of 3 games."
team_level_fields: [{id:"score",label:"Score",type:"counter"}]
actions: [{id:"end_game",label:"End Game",type:"period_end"},{id:"undo",label:"Undo",type:"undo"}]
winner_rule: "best_of_sets"
bracket_type: single_elimination

── BOXING ──
unit: "player"
groups: [
  { id:"identity", sticky:true, fields:[{id:"name",label:"Fighter",type:"static",width:"lg"},{id:"weight",label:"Class",type:"static",width:"md"}] },
  { id:"rounds", label:"Round Scores", fields: generate one counter per round e.g. r1..r12 }
  { id:"totals", label:"Total", fields:[{id:"total_pts",label:"Total",type:"computed",formula:"r1+r2+r3+..."}]}
]
period_tracking: enabled, period_label:"Round", total_periods based on division (3 amateur / 12 pro)
bracket_type: single_elimination

── TABLE TENNIS (ITTF) ──
unit: "team_only"
period_tracking: enabled, total_periods:7, period_label:"Game", track_score_per_period:true
team_level_fields: [{id:"score",label:"Score",type:"counter"}]
winner_rule: "best_of_sets"

── TUMBANG PRESO (traditional Filipino) ──
unit: "team"
scoring_sheet.groups: []  (no per-player stats columns)
team_level_fields: [{id:"rounds_won",label:"Rounds Won",type:"counter"}]
period_tracking: enabled, period_label:"Round", total_periods:null (open-ended)
actions: [
  {id:"can_knocked",label:"Can Knocked",type:"log",description:"Attacker knocks can — IT resets"},
  {id:"player_tagged",label:"Tag Player",type:"log_targeted",description:"IT tags a player",effect:"eliminate_player",requires_player_select:true},
  {id:"end_round",label:"End Round",type:"period_end"},
  {id:"undo",label:"Undo",type:"undo"}
]
bracket_type: null  winner_rule: "last_standing"

── PATINTERO ──
unit: "team"
Similar to Tumbang Preso but grid-based. players cross lines.
actions: [{id:"player_crossed",label:"Player Crossed",type:"log"},{id:"player_caught",label:"log_targeted",effect:"eliminate_player"},{id:"end_round",label:"End Round",type:"period_end"},{id:"undo",label:"Undo",type:"undo"}]
bracket_type: null

── SEPAK TAKRAW ──
unit: "team_only"  best of 3 sets, first to 21 (win by 2)
Same structure as badminton.

── ARNIS / ESKRIMA ──
unit: "player"
groups: identity + scoring per round (points, warnings, disqualifications)
period_tracking: rounds

━━━ FOR UNKNOWN SPORTS ━━━
If the sport is not in the reference above, infer field types from:
- Individual sports → unit:"player" with scoring and stat columns
- Team sports with elimination → unit:"team"
- Simple match sports → unit:"team_only"

━━━ ALWAYS INCLUDE ━━━
schema_version: "1.0"
display_name: proper capitalized sport name
ruleset: official body name (FIBA, FIVB, BWF, etc.) or "Standard Rules"
competition_category: "sports"
structure: { bracket_type, seeding }

Return the JSON only. Nothing else.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Generate sport_config for: "${description}"\nContext: ${JSON.stringify(eventDetails)}`
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Claude API error: ${response.status}`);
    }

    const raw = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    const config = JSON.parse(raw);
    return res.json({ success: true, config });
  } catch (err) {
    console.error('[sports/generate-config]', err.message);
    return res.status(500).json({ error: err.message || 'Failed to generate sport config' });
  }
});

// GET /api/sports/teams?event_id=X
router.get('/teams', async (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.status(400).json({ error: 'event_id required' });

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('event_id', event_id)
    .order('seed', { nullsFirst: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data: data || [] });
});

// POST /api/sports/teams/bulk
router.post('/teams/bulk', async (req, res) => {
  const { teams } = req.body;
  if (!teams || !teams.length) return res.status(400).json({ error: 'teams array required' });

  const { data, error } = await supabase
    .from('teams')
    .insert(teams)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data });
});

// DELETE /api/sports/teams/by-event — remove all teams for an event
router.delete('/teams/by-event', async (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.status(400).json({ error: 'event_id required' });

  const { error } = await supabase.from('teams').delete().eq('event_id', event_id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// GET /api/sports/brackets?event_id=X
router.get('/brackets', async (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.status(400).json({ error: 'event_id required' });

  const { data, error } = await supabase
    .from('brackets')
    .select('*, team_a:team_a_id(id,name,color,seed), team_b:team_b_id(id,name,color,seed), winner:winner_id(id,name)')
    .eq('event_id', event_id)
    .order('round_number')
    .order('match_number');

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data: data || [] });
});

// POST /api/sports/brackets/bulk
router.post('/brackets/bulk', async (req, res) => {
  const { brackets } = req.body;
  if (!brackets || !brackets.length) return res.status(400).json({ error: 'brackets array required' });

  const { data, error } = await supabase
    .from('brackets')
    .insert(brackets)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data });
});

// PATCH /api/sports/brackets/:id
router.patch('/brackets/:id', async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.status === 'completed') updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('brackets')
    .update(updates)
    .eq('id', id)
    .select('*, team_a:team_a_id(id,name), team_b:team_b_id(id,name), winner:winner_id(id,name)')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data });
});

// DELETE /api/sports/brackets/by-event?event_id=X
router.delete('/brackets/by-event', async (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.status(400).json({ error: 'event_id required' });
  const { error } = await supabase.from('brackets').delete().eq('event_id', event_id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// GET /api/sports/match-events?bracket_id=X
router.get('/match-events', async (req, res) => {
  const { bracket_id } = req.query;
  if (!bracket_id) return res.status(400).json({ error: 'bracket_id required' });

  const { data, error } = await supabase
    .from('match_events')
    .select('*')
    .eq('bracket_id', bracket_id)
    .order('created_at');

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data: data || [] });
});

// POST /api/sports/match-events
router.post('/match-events', async (req, res) => {
  const { data, error } = await supabase
    .from('match_events')
    .insert(req.body)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, data });
});

// DELETE /api/sports/match-events/:id
router.delete('/match-events/:id', async (req, res) => {
  const { error } = await supabase
    .from('match_events')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

module.exports = router;
