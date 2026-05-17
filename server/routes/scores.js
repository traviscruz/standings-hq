const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ── HELPER: Recalculate Overall Participant Scores ─────────────────
async function recalculateParticipantScores(eventId) {
  try {
    console.log(`[Scores Backend] Starting recalculation for event: ${eventId}`);

    // 1. Fetch event rubric configuration
    const { data: rubric, error: rubricError } = await supabase
      .from('event_rubrics')
      .select('config')
      .eq('event_id', eventId)
      .maybeSingle();

    if (rubricError) throw rubricError;
    if (!rubric || !rubric.config) {
      console.warn(`[Scores Backend] No rubric config found for event ${eventId}. Skipping recalculation.`);
      return;
    }

    const config = rubric.config;
    const segments = config.rubrics || []; // Array of { id, label, weight }
    const scoringMethod = (config.scoringMethod || 'average').toLowerCase();
    const scaleMax = config.scale?.max || 10;

    // 2. Fetch all participants for the event
    const { data: participants, error: participantsError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId);

    if (participantsError) throw participantsError;
    if (!participants || participants.length === 0) {
      console.log(`[Scores Backend] No participants found for event ${eventId}.`);
      return;
    }

    // 3. Fetch all raw scores for the event
    const { data: allScores, error: scoresError } = await supabase
      .from('event_scores')
      .select('*')
      .eq('event_id', eventId);

    if (scoresError) throw scoresError;

    // 4. Fetch all segment submissions (locks) for this event
    const { data: allSubmissions, error: subError } = await supabase
      .from('event_submissions')
      .select('*')
      .eq('event_id', eventId);

    if (subError) throw subError;

    // Map submissions: submissionsMap[segmentId] = array of judgeIds who finalized this segment
    const submissionsMap = {};
    (allSubmissions || []).forEach(sub => {
      if (!submissionsMap[sub.segment_id]) {
        submissionsMap[sub.segment_id] = [];
      }
      submissionsMap[sub.segment_id].push(sub.judge_id);
    });

    console.log(`[Scores Backend] Scoring Configuration - Method: ${scoringMethod}, Scale Max: ${scaleMax}`);
    console.log(`[Scores Backend] Active submissions by segment:`, submissionsMap);

    // 5. Recalculate standings for each participant
    for (const p of participants) {
      let overallScore = 0;
      let totalWeightUsed = 0;

      for (const seg of segments) {
        const submittingJudges = submissionsMap[seg.id] || [];
        // Only count segments that have been locked/finalized by at least one judge
        if (submittingJudges.length === 0) continue;

        const judgeScoresForSeg = [];

        submittingJudges.forEach(jId => {
          // Filter scores submitted by this judge for this participant & segment
          const criteriaScores = (allScores || []).filter(s =>
            s.participant_id === p.id &&
            s.segment_id === seg.id &&
            s.judge_id === jId &&
            s.score !== null
          );

          if (criteriaScores.length > 0) {
            // Sum criteria scores inside the segment (normally 1 score criterion, but supports more)
            const sum = criteriaScores.reduce((acc, s) => acc + Number(s.score), 0);
            judgeScoresForSeg.push(sum);
          }
        });

        if (judgeScoresForSeg.length === 0) continue;

        // Combine judges' segment scores using the event's scoring method
        let combinedSegScore = 0;
        if (scoringMethod === 'sum') {
          combinedSegScore = judgeScoresForSeg.reduce((acc, s) => acc + s, 0);
        } else if (scoringMethod === 'drop' && judgeScoresForSeg.length >= 3) {
          // Drop highest and lowest scores, then average the remaining ones
          const sorted = [...judgeScoresForSeg].sort((a, b) => a - b);
          const trimmed = sorted.slice(1, -1); // Remove index 0 (min) and last element (max)
          combinedSegScore = trimmed.reduce((acc, s) => acc + s, 0) / trimmed.length;
        } else {
          // Default: standard average
          combinedSegScore = judgeScoresForSeg.reduce((acc, s) => acc + s, 0) / judgeScoresForSeg.length;
        }

        // Add weighted normalized score to the overall rating
        // overallScore += (combinedScore / scaleMax) * weight
        overallScore += (combinedSegScore / scaleMax) * Number(seg.weight);
        totalWeightUsed += Number(seg.weight);
      }

      // If at least one segment was evaluated, compute final score normalized to 100%
      let finalParticipantScore = null;
      if (totalWeightUsed > 0) {
        const rawCalculated = (overallScore / totalWeightUsed) * 100;
        finalParticipantScore = Math.round(rawCalculated * 10) / 10; // Round to 1 decimal place, e.g., 94.2
      }

      console.log(`[Scores Backend] Participant ID ${p.id} calculated score: ${finalParticipantScore} (weights used: ${totalWeightUsed})`);

      // Update the score on the participant row
      const { error: updateError } = await supabase
        .from('event_participants')
        .update({ score: finalParticipantScore, updated_at: new Date().toISOString() })
        .eq('id', p.id);

      if (updateError) {
        console.error(`[Scores Backend] Failed to update score for participant ${p.id}:`, updateError.message);
      }
    }

    console.log(`[Scores Backend] Recalculation completed successfully for event ${eventId}.`);
  } catch (err) {
    console.error('[Scores Backend] Recalculation error:', err.message);
  }
}

// ── GET /api/scores ────────────────────────────────────────────────
// Fetch saved scores and submitted segments list for a judge and event
router.get('/', async (req, res) => {
  try {
    const { event_id, judge_id } = req.query;

    if (!event_id || !judge_id) {
      return res.status(400).json({ success: false, error: 'event_id and judge_id are required' });
    }

    // 1. Fetch raw scores
    const { data: scoresData, error: scoresError } = await supabase
      .from('event_scores')
      .select('*')
      .eq('event_id', event_id)
      .eq('judge_id', judge_id);

    if (scoresError) throw scoresError;

    // 2. Fetch segment submissions/locks
    const { data: submissionsData, error: subError } = await supabase
      .from('event_submissions')
      .select('segment_id')
      .eq('event_id', event_id)
      .eq('judge_id', judge_id);

    if (subError) throw subError;

    // 3. Format scores into: { [participantId]: { [segmentId]: { [criterionId]: value } } }
    const scoresMap = {};
    (scoresData || []).forEach(item => {
      const pId = item.participant_id;
      const sId = item.segment_id;
      const cId = item.criterion_id;
      
      if (!scoresMap[pId]) scoresMap[pId] = {};
      if (!scoresMap[pId][sId]) scoresMap[pId][sId] = {};
      scoresMap[pId][sId][cId] = item.score !== null ? String(item.score) : '';
    });

    // 4. Format submissions into: { [segmentId]: true }
    const submissionsMap = {};
    (submissionsData || []).forEach(item => {
      submissionsMap[item.segment_id] = true;
    });

    res.json({
      success: true,
      scores: scoresMap,
      submittedSegments: submissionsMap
    });
  } catch (err) {
    console.error('[GET /api/scores]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/scores/save ──────────────────────────────────────────
// Background autosave of a single score value
router.post('/save', async (req, res) => {
  try {
    const { event_id, judge_id, participant_id, segment_id, criterion_id, score } = req.body;

    if (!event_id || !judge_id || !participant_id || !segment_id || !criterion_id) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const numericScore = score === '' || score === null ? null : parseFloat(score);

    // Upsert the score
    const { data, error } = await supabase
      .from('event_scores')
      .upsert({
        event_id,
        judge_id,
        participant_id,
        segment_id,
        criterion_id,
        score: numericScore,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'judge_id,participant_id,segment_id,criterion_id'
      })
      .select();

    if (error) throw error;

    res.json({ success: true, message: 'Score saved successfully', data: data[0] });
  } catch (err) {
    console.error('[POST /api/scores/save]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/scores/submit ────────────────────────────────────────
// Submit and lock scores for a segment, and recalculate standing scores
router.post('/submit', async (req, res) => {
  try {
    const { event_id, judge_id, segment_id } = req.body;

    if (!event_id || !judge_id || !segment_id) {
      return res.status(400).json({ success: false, error: 'event_id, judge_id, and segment_id are required' });
    }

    // Insert lock submission row
    const { error: subError } = await supabase
      .from('event_submissions')
      .upsert({
        event_id,
        judge_id,
        segment_id
      }, {
        onConflict: 'judge_id,segment_id'
      });

    if (subError) throw subError;

    // Recalculate standings asynchronously in the background
    recalculateParticipantScores(event_id);

    res.json({ success: true, message: 'Segment locked and submitted successfully' });
  } catch (err) {
    console.error('[POST /api/scores/submit]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/scores/revert ────────────────────────────────────────
// Revert (unlock) submissions and recalculate standing scores
router.post('/revert', async (req, res) => {
  try {
    const { event_id, judge_id, segment_id } = req.body;

    if (!event_id || !judge_id || !segment_id) {
      return res.status(400).json({ success: false, error: 'event_id, judge_id, and segment_id are required' });
    }

    // Delete submission lock row
    const { error: delError } = await supabase
      .from('event_submissions')
      .delete()
      .eq('event_id', event_id)
      .eq('judge_id', judge_id)
      .eq('segment_id', segment_id);

    if (delError) throw delError;

    // Recalculate standings in the background
    recalculateParticipantScores(event_id);

    res.json({ success: true, message: 'Segment unlocked and reverted successfully' });
  } catch (err) {
    console.error('[POST /api/scores/revert]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
