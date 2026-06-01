const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ── GET /api/sports/setup ───────────────────────────────────────────
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
    console.error('[GET /api/sports/setup]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/sports/setup ──────────────────────────────────────────
router.post('/setup', async (req, res) => {
  try {
    const { event_id, config, created_by } = req.body;
    if (!event_id || !config) return res.status(400).json({ success: false, error: 'event_id and config are required' });

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
      data = result.data; error = result.error;
    } else {
      const result = await supabase
        .from('game_setups')
        .insert({ event_id, config, status: 'published', created_by: created_by || null })
        .select()
        .single();
      data = result.data; error = result.error;
    }

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('[POST /api/sports/setup]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/sports/brackets ────────────────────────────────────────
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
    console.error('[GET /api/sports/brackets]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/sports/brackets/generate ─────────────────────────────
router.post('/brackets/generate', async (req, res) => {
  try {
    const { event_id, teams, bracketFormat } = req.body;
    if (!event_id || !teams || teams.length < 2) {
      return res.status(400).json({ success: false, error: 'event_id and at least 2 teams are required' });
    }

    await supabase.from('match_brackets').delete().eq('event_id', event_id);

    const brackets = generateBrackets(event_id, teams, bracketFormat || 'single_elimination');
    if (brackets.length === 0) return res.json({ success: true, data: [] });

    const { data, error } = await supabase.from('match_brackets').insert(brackets).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('[POST /api/sports/brackets/generate]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/sports/brackets/:id ─────────────────────────────────
// Save period scores and optionally finalize to determine winner + auto-advance
router.patch('/brackets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { score_a, score_b, finalize } = req.body;

    // Fetch current match
    const { data: match } = await supabase
      .from('match_brackets')
      .select('*')
      .eq('id', id)
      .single();

    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

    const updates = {
      score_a: score_a || match.score_a || {},
      score_b: score_b || match.score_b || {},
      status: 'ongoing',
      updated_at: new Date().toISOString()
    };

    if (finalize) {
      // Fetch sport setup to get winCondition
      const { data: setup } = await supabase
        .from('game_setups')
        .select('config')
        .eq('event_id', match.event_id)
        .maybeSingle();

      const winCondition = setup?.config?.winCondition || 'most_points';
      const bracketFormat = setup?.config?.bracketFormat || 'single_elimination';
      const sa = score_a || match.score_a || {};
      const sb = score_b || match.score_b || {};

      let winner = null;

      if (winCondition === 'most_points') {
        const totalA = Object.values(sa).reduce((s, v) => s + (Number(v) || 0), 0);
        const totalB = Object.values(sb).reduce((s, v) => s + (Number(v) || 0), 0);
        if (totalA > totalB) winner = match.team_a;
        else if (totalB > totalA) winner = match.team_b;
      } else {
        // most_sets: count periods won by each team
        const periods = Object.keys(sa).filter(k => k.startsWith('p'));
        let winsA = 0, winsB = 0;
        periods.forEach(k => {
          const vA = Number(sa[k]) || 0;
          const vB = Number(sb[k]) || 0;
          if (vA > vB) winsA++;
          else if (vB > vA) winsB++;
        });
        if (winsA > winsB) winner = match.team_a;
        else if (winsB > winsA) winner = match.team_b;
      }

      updates.winner = winner;
      updates.status = 'completed';

      // Auto-advance winner in single elimination
      if (winner && bracketFormat === 'single_elimination') {
        const nextRound = match.round + 1;
        const nextMatchOrder = Math.ceil(match.match_order / 2);

        const { data: nextMatch } = await supabase
          .from('match_brackets')
          .select('*')
          .eq('event_id', match.event_id)
          .eq('round', nextRound)
          .eq('match_order', nextMatchOrder)
          .maybeSingle();

        if (nextMatch) {
          const isTeamA = match.match_order % 2 !== 0;
          await supabase
            .from('match_brackets')
            .update({
              [isTeamA ? 'team_a' : 'team_b']: winner,
              updated_at: new Date().toISOString()
            })
            .eq('id', nextMatch.id);
        }
      }
    }

    const { data, error } = await supabase
      .from('match_brackets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('[PATCH /api/sports/brackets/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/sports/match-scores ───────────────────────────────────
router.get('/match-scores', async (req, res) => {
  try {
    const { event_id, match_id, judge_id } = req.query;
    if (!event_id) return res.status(400).json({ success: false, error: 'event_id is required' });

    let query = supabase.from('game_match_scores').select('*').eq('event_id', event_id);
    if (match_id) query = query.eq('match_id', match_id);
    if (judge_id) query = query.eq('judge_id', judge_id);

    const { data, error } = await query.order('round_num', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[GET /api/sports/match-scores]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/sports/match-scores ──────────────────────────────────
// Save a period score from a judge. When finalize=true, compute winner and advance bracket.
router.post('/match-scores', async (req, res) => {
  try {
    const { event_id, match_id, judge_id, period_num, team_a_score, team_b_score, notes, submitted, finalize } = req.body;
    if (!event_id || !match_id || !judge_id || period_num === undefined) {
      return res.status(400).json({ success: false, error: 'event_id, match_id, judge_id, period_num are required' });
    }

    const { data: scoreData, error } = await supabase
      .from('game_match_scores')
      .upsert({
        event_id, match_id, judge_id,
        round_num: period_num,
        team_a_score: team_a_score ?? null,
        team_b_score: team_b_score ?? null,
        notes: notes || null,
        submitted: submitted || false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id,judge_id,round_num' })
      .select().single();

    if (error) throw error;

    // ── UNLOCK (submitted = false): revert match bracket if it was completed ──
    if (!submitted && !finalize) {
      const { data: currentMatch } = await supabase
        .from('match_brackets').select('*').eq('id', match_id).single();

      if (currentMatch && currentMatch.status === 'completed') {
        const { data: setup } = await supabase
          .from('game_setups').select('config').eq('event_id', event_id).maybeSingle();

        const bracketFormat = setup?.config?.bracketFormat || 'single_elimination';

        // For single elimination: clear the advanced winner from the next round
        if (bracketFormat === 'single_elimination') {
          const nextRound = currentMatch.round + 1;
          const nextMatchOrder = Math.ceil(currentMatch.match_order / 2);
          const { data: nextMatch } = await supabase
            .from('match_brackets').select('*')
            .eq('event_id', event_id).eq('round', nextRound).eq('match_order', nextMatchOrder)
            .maybeSingle();

          if (nextMatch) {
            let nextUpdates = {};
            if (nextMatch.team_a === currentMatch.winner) nextUpdates.team_a = null;
            else if (nextMatch.team_b === currentMatch.winner) nextUpdates.team_b = null;

            if (Object.keys(nextUpdates).length > 0) {
              await supabase.from('match_brackets')
                .update({ ...nextUpdates, status: 'pending', winner: null, updated_at: new Date().toISOString() })
                .eq('id', nextMatch.id);
            }
          }
        }

        // Revert this match back to ongoing with no winner
        await supabase.from('match_brackets').update({
          winner: null, status: 'ongoing', score_a: {}, score_b: {},
          updated_at: new Date().toISOString()
        }).eq('id', match_id);
      }

      // Delete the score row so the period is fully cleared
      await supabase.from('game_match_scores')
        .delete()
        .eq('match_id', match_id)
        .eq('judge_id', judge_id)
        .eq('round_num', period_num);

      return res.json({ success: true, data: scoreData });
    }

    // Finalize match: compute winner from all locked periods
    if (finalize || submitted) {
      const { data: setup } = await supabase
        .from('game_setups').select('config').eq('event_id', event_id).maybeSingle();

      const winCondition = setup?.config?.winCondition || 'most_points';
      const bracketFormat = setup?.config?.bracketFormat || 'single_elimination';
      const periodsPerMatch = setup?.config?.periodsPerMatch || 4;

      const { data: currentMatch } = await supabase
        .from('match_brackets').select('*').eq('id', match_id).single();

      if (currentMatch && currentMatch.status !== 'completed') {
        const { data: allPeriods } = await supabase
          .from('game_match_scores')
          .select('*').eq('match_id', match_id).eq('submitted', true);

        if (finalize || (allPeriods && allPeriods.length >= periodsPerMatch)) {
          let winner = null;

          if (winCondition === 'most_points') {
            const totA = (allPeriods || []).reduce((s, p) => s + (Number(p.team_a_score) || 0), 0);
            const totB = (allPeriods || []).reduce((s, p) => s + (Number(p.team_b_score) || 0), 0);
            if (totA > totB) winner = currentMatch.team_a;
            else if (totB > totA) winner = currentMatch.team_b;
          } else {
            let wA = 0, wB = 0;
            (allPeriods || []).forEach(p => {
              if ((Number(p.team_a_score) || 0) > (Number(p.team_b_score) || 0)) wA++;
              else if ((Number(p.team_b_score) || 0) > (Number(p.team_a_score) || 0)) wB++;
            });
            if (wA > wB) winner = currentMatch.team_a;
            else if (wB > wA) winner = currentMatch.team_b;
          }

          if (winner) {
            // Build score_a/score_b jsonb from all periods
            const score_a = {}, score_b = {};
            (allPeriods || []).forEach(p => {
              score_a[`p${p.round_num}`] = Number(p.team_a_score) || 0;
              score_b[`p${p.round_num}`] = Number(p.team_b_score) || 0;
            });

            await supabase.from('match_brackets').update({
              winner, status: 'completed', score_a, score_b,
              updated_at: new Date().toISOString()
            }).eq('id', match_id);

            // Auto-advance in single elimination
            if (bracketFormat === 'single_elimination') {
              const nextRound = currentMatch.round + 1;
              const nextMatchOrder = Math.ceil(currentMatch.match_order / 2);
              const { data: nextMatch } = await supabase
                .from('match_brackets').select('*')
                .eq('event_id', event_id).eq('round', nextRound).eq('match_order', nextMatchOrder)
                .maybeSingle();

              if (nextMatch) {
                const isTeamA = currentMatch.match_order % 2 !== 0;
                await supabase.from('match_brackets').update({
                  [isTeamA ? 'team_a' : 'team_b']: winner,
                  updated_at: new Date().toISOString()
                }).eq('id', nextMatch.id);
              }
            }
          }
        }
      }
    }

    res.json({ success: true, data: scoreData });
  } catch (err) {
    console.error('[POST /api/sports/match-scores]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/sports/brackets/event/:event_id ─────────────────────
router.delete('/brackets/event/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;
    const { error } = await supabase.from('match_brackets').delete().eq('event_id', event_id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/sports/brackets/event/:event_id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Bracket generation helpers ──────────────────────────────────────
function generateBrackets(eventId, teams, format) {
  if (format === 'round_robin') return generateRoundRobin(eventId, teams);

  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const totalRounds = Math.ceil(Math.log2(shuffled.length));

  const getRoundLabel = (round, total) => {
    if (round === total) return 'Grand Final';
    if (round === total - 1) return total > 2 ? 'Semifinals' : 'Final';
    if (round === total - 2 && total > 3) return 'Quarterfinals';
    return `Round ${round}`;
  };

  let round1Teams = [...shuffled];
  while (round1Teams.length < Math.pow(2, Math.ceil(Math.log2(shuffled.length)))) {
    round1Teams.push('BYE');
  }

  const brackets = [];
  let matchOrder = 1;
  for (let i = 0; i < round1Teams.length; i += 2) {
    brackets.push({
      event_id: eventId, round: 1, match_order: matchOrder++,
      round_label: getRoundLabel(1, totalRounds),
      team_a: round1Teams[i], team_b: round1Teams[i + 1],
      winner: null, score_a: {}, score_b: {}, status: 'pending'
    });
  }

  let teamsInRound = round1Teams.length / 2;
  for (let r = 2; r <= totalRounds; r++) {
    teamsInRound = teamsInRound / 2;
    for (let m = 1; m <= teamsInRound; m++) {
      brackets.push({
        event_id: eventId, round: r, match_order: m,
        round_label: getRoundLabel(r, totalRounds),
        team_a: null, team_b: null,
        winner: null, score_a: {}, score_b: {}, status: 'pending'
      });
    }
  }

  return brackets;
}

function generateRoundRobin(eventId, teams) {
  const brackets = [];
  let matchOrder = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      brackets.push({
        event_id: eventId, round: 1, match_order: matchOrder++,
        round_label: 'Round Robin',
        team_a: teams[i], team_b: teams[j],
        winner: null, score_a: {}, score_b: {}, status: 'pending'
      });
    }
  }
  return brackets;
}

module.exports = router;
