const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ── GET /api/game/setup ─────────────────────────────────────────────
// Fetch game setup for an event
router.get('/setup', async (req, res) => {
  try {
    const { event_id } = req.query;
    if (!event_id) return res.status(400).json({ success: false, error: 'event_id is required' });

    const { data, error } = await supabase
      .from('game_setups')
      .select('*')
      .eq('event_id', event_id)
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, data: data || null });
  } catch (err) {
    console.error('[GET /api/game/setup]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/game/setup ────────────────────────────────────────────
// Create or update game setup (upsert by event_id)
router.post('/setup', async (req, res) => {
  try {
    const { event_id, config, created_by } = req.body;
    if (!event_id || !config) return res.status(400).json({ success: false, error: 'event_id and config are required' });

    // Check if existing setup exists
    const { data: existing } = await supabase
      .from('game_setups')
      .select('id')
      .eq('event_id', event_id)
      .maybeSingle();

    let data, error;
    if (existing) {
      const result = await supabase
        .from('game_setups')
        .update({ config, status: 'published', updated_at: new Date().toISOString() })
        .eq('event_id', event_id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('game_setups')
        .insert({ event_id, config, status: 'published', created_by: created_by || null })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('[POST /api/game/setup]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/game/brackets ──────────────────────────────────────────
// Fetch all match brackets for an event
router.get('/brackets', async (req, res) => {
  try {
    const { event_id } = req.query;
    if (!event_id) return res.status(400).json({ success: false, error: 'event_id is required' });

    const { data, error } = await supabase
      .from('match_brackets')
      .select('*')
      .eq('event_id', event_id)
      .order('round', { ascending: true })
      .order('match_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[GET /api/game/brackets]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/game/brackets/generate ───────────────────────────────
// Generate/reset bracket matches from the game setup config
router.post('/brackets/generate', async (req, res) => {
  try {
    const { event_id, teams, bracketFormat, roundsPerMatch } = req.body;
    if (!event_id || !teams || teams.length < 2) {
      return res.status(400).json({ success: false, error: 'event_id and at least 2 teams are required' });
    }

    // Delete existing brackets for this event
    await supabase.from('match_brackets').delete().eq('event_id', event_id);

    const brackets = generateBrackets(event_id, teams, bracketFormat || 'single_elimination');
    
    if (brackets.length === 0) {
      return res.json({ success: true, data: [], message: 'No brackets to generate' });
    }

    const { data, error } = await supabase
      .from('match_brackets')
      .insert(brackets)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('[POST /api/game/brackets/generate]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/game/brackets/:id ───────────────────────────────────
// Update match result (winner, scores, status)
router.patch('/brackets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('match_brackets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('[PATCH /api/game/brackets/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/game/brackets/event/:event_id ──────────────────────
// Reset all brackets for an event
router.delete('/brackets/event/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;
    const { error } = await supabase
      .from('match_brackets')
      .delete()
      .eq('event_id', event_id);

    if (error) throw error;
    res.json({ success: true, message: 'All brackets reset successfully' });
  } catch (err) {
    console.error('[DELETE /api/game/brackets/event/:event_id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/game/match-scores ──────────────────────────────────────
// Fetch all game match scores for an event (optionally filtered by match/judge)
router.get('/match-scores', async (req, res) => {
  try {
    const { event_id, match_id, judge_id } = req.query;
    if (!event_id) return res.status(400).json({ success: false, error: 'event_id is required' });

    let query = supabase
      .from('game_match_scores')
      .select('*')
      .eq('event_id', event_id);

    if (match_id) query = query.eq('match_id', match_id);
    if (judge_id) query = query.eq('judge_id', judge_id);

    const { data, error } = await query.order('round_num', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[GET /api/game/match-scores]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/game/match-scores ─────────────────────────────────────
// Save/upsert a round score & auto-calculate match winners / bracket advancement
router.post('/match-scores', async (req, res) => {
  try {
    const { event_id, match_id, judge_id, round_num, team_a_score, team_b_score, notes, submitted } = req.body;
    if (!event_id || !match_id || !judge_id || round_num === undefined) {
      return res.status(400).json({ success: false, error: 'event_id, match_id, judge_id, round_num are required' });
    }

    const { data: scoreData, error } = await supabase
      .from('game_match_scores')
      .upsert({
        event_id,
        match_id,
        judge_id,
        round_num,
        team_a_score: team_a_score ?? null,
        team_b_score: team_b_score ?? null,
        notes: notes || null,
        submitted: submitted || false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id,judge_id,round_num' })
      .select()
      .single();

    if (error) throw error;

    // Auto-advance logic if the judge is locking/submitting the round score
    if (submitted) {
      // 1. Fetch game setup to know the Best-Of settings and format
      const { data: setup } = await supabase
        .from('game_setups')
        .select('config')
        .eq('event_id', event_id)
        .maybeSingle();

      const roundsPerMatch = setup?.config?.roundsPerMatch || 3;
      const bracketFormat = setup?.config?.bracketFormat || 'single_elimination';

      // 2. Fetch the bracket match details
      const { data: currentMatch } = await supabase
        .from('match_brackets')
        .select('*')
        .eq('id', match_id)
        .single();

      if (currentMatch && currentMatch.status !== 'completed') {
        // 3. Fetch all submitted round scores for this match
        const { data: allSubmittedScores } = await supabase
          .from('game_match_scores')
          .select('*')
          .eq('match_id', match_id)
          .eq('submitted', true);

        // 4. Tally wins for each team
        let winsA = 0;
        let winsB = 0;
        allSubmittedScores.forEach(s => {
          if (s.team_a_score > s.team_b_score) winsA++;
          else if (s.team_b_score > s.team_a_score) winsB++;
        });

        // 5. Check if threshold for winning the match is met
        const majorityThreshold = Math.ceil(roundsPerMatch / 2);
        let matchWinner = null;
        if (winsA >= majorityThreshold) {
          matchWinner = currentMatch.team_a;
        } else if (winsB >= majorityThreshold) {
          matchWinner = currentMatch.team_b;
        }

        // Check if all rounds completed and no clear majority
        if (!matchWinner && allSubmittedScores.length >= roundsPerMatch) {
          if (winsA > winsB) matchWinner = currentMatch.team_a;
          else if (winsB > winsA) matchWinner = currentMatch.team_b;
        }

        // 6. If winner decided, write to match bracket and auto-advance
        if (matchWinner) {
          await supabase
            .from('match_brackets')
            .update({
              winner: matchWinner,
              status: 'completed',
              score_a: { wins: winsA },
              score_b: { wins: winsB },
              updated_at: new Date().toISOString()
            })
            .eq('id', match_id);

          // Advance winner in single elimination brackets
          if (bracketFormat === 'single_elimination') {
            const nextRound = currentMatch.round + 1;
            const nextMatchOrder = Math.ceil(currentMatch.match_order / 2);

            const { data: nextMatch } = await supabase
              .from('match_brackets')
              .select('*')
              .eq('event_id', event_id)
              .eq('round', nextRound)
              .eq('match_order', nextMatchOrder)
              .maybeSingle();

            if (nextMatch) {
              const isTeamA = currentMatch.match_order % 2 !== 0;
              const nextUpdates = isTeamA ? { team_a: matchWinner } : { team_b: matchWinner };
              
              await supabase
                .from('match_brackets')
                .update({ ...nextUpdates, updated_at: new Date().toISOString() })
                .eq('id', nextMatch.id);
            }
          }
        }
      }
    } else {
      // Revert completed match bracket state if it was locked previously
      const { data: currentMatch } = await supabase
        .from('match_brackets')
        .select('*')
        .eq('id', match_id)
        .single();

      if (currentMatch && currentMatch.status === 'completed') {
        const { data: setup } = await supabase
          .from('game_setups')
          .select('config')
          .eq('event_id', event_id)
          .maybeSingle();

        const bracketFormat = setup?.config?.bracketFormat || 'single_elimination';

        if (bracketFormat === 'single_elimination') {
          const nextRound = currentMatch.round + 1;
          const nextMatchOrder = Math.ceil(currentMatch.match_order / 2);

          const { data: nextMatch } = await supabase
            .from('match_brackets')
            .select('*')
            .eq('event_id', event_id)
            .eq('round', nextRound)
            .eq('match_order', nextMatchOrder)
            .maybeSingle();

          if (nextMatch) {
            let nextUpdates = {};
            if (nextMatch.team_a === currentMatch.winner) {
              nextUpdates.team_a = null;
            } else if (nextMatch.team_b === currentMatch.winner) {
              nextUpdates.team_b = null;
            }

            if (Object.keys(nextUpdates).length > 0) {
              await supabase
                .from('match_brackets')
                .update({ ...nextUpdates, status: 'pending', winner: null, updated_at: new Date().toISOString() })
                .eq('id', nextMatch.id);
            }
          }
        }

        await supabase
          .from('match_brackets')
          .update({
            winner: null,
            status: 'ongoing',
            score_a: null,
            score_b: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', match_id);
      }
    }

    res.json({ success: true, data: scoreData });
  } catch (err) {
    console.error('[POST /api/game/match-scores]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ── Helper: Generate Single Elimination Brackets ────────────────────
function generateBrackets(eventId, teams, format) {
  const brackets = [];
  
  if (format === 'round_robin') {
    return generateRoundRobin(eventId, teams);
  }
  
  // Single elimination
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const count = shuffled.length;

  // Round labels
  const getRoundLabel = (round, totalRounds) => {
    if (round === totalRounds) return 'Grand Final';
    if (round === totalRounds - 1) return totalRounds > 2 ? 'Semifinals' : 'Final';
    if (round === totalRounds - 2 && totalRounds > 3) return 'Quarterfinals';
    return `Round ${round}`;
  };

  const totalRounds = Math.ceil(Math.log2(count));
  
  // Build round 1 matchups
  let round1Teams = [...shuffled];
  // Pad with "BYE" if odd number
  while (round1Teams.length < Math.pow(2, Math.ceil(Math.log2(count)))) {
    round1Teams.push('BYE');
  }

  let matchOrder = 1;
  for (let i = 0; i < round1Teams.length; i += 2) {
    const teamA = round1Teams[i];
    const teamB = round1Teams[i + 1];
    
    brackets.push({
      event_id: eventId,
      round: 1,
      match_order: matchOrder++,
      round_label: getRoundLabel(1, totalRounds),
      team_a: teamA,
      team_b: teamB,
      winner: null,
      score_a: {},
      score_b: {},
      status: 'pending'
    });
  }

  // Build subsequent empty rounds
  let teamsInRound = round1Teams.length / 2;
  for (let r = 2; r <= totalRounds; r++) {
    teamsInRound = teamsInRound / 2;
    for (let m = 1; m <= teamsInRound; m++) {
      brackets.push({
        event_id: eventId,
        round: r,
        match_order: m,
        round_label: getRoundLabel(r, totalRounds),
        team_a: null,
        team_b: null,
        winner: null,
        score_a: {},
        score_b: {},
        status: 'pending'
      });
    }
  }

  return brackets;
}

function generateRoundRobin(eventId, teams) {
  const brackets = [];
  let matchOrder = 1;
  const roundLabel = 'Round Robin';

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      brackets.push({
        event_id: eventId,
        round: 1,
        match_order: matchOrder++,
        round_label: roundLabel,
        team_a: teams[i],
        team_b: teams[j],
        winner: null,
        score_a: {},
        score_b: {},
        status: 'pending'
      });
    }
  }

  return brackets;
}

module.exports = router;
