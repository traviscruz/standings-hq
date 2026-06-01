const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── POST /api/claude/suggest ────────────────────────────────────────
// Returns AI-powered suggestions for each Game Setup Builder step
router.post('/suggest', async (req, res) => {
  try {
    const { step, eventTitle, eventDescription, gameName, currentConfig, isRegenerating } = req.body;

    if (step === undefined || step === null) {
      return res.status(400).json({ success: false, error: 'step is required' });
    }

    const systemPrompt = buildSystemPrompt(step, eventTitle, eventDescription, gameName, currentConfig, isRegenerating);

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: systemPrompt
        }
      ]
    });

    const rawText = message.content[0].text;

    // Extract JSON from Claude's response (handle markdown code blocks)
    let jsonText = rawText.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonText);

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('[POST /api/claude/suggest]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

function buildSystemPrompt(step, eventTitle, eventDescription, gameName, currentConfig, isRegenerating) {
  const baseContext = `
You are an expert traditional Filipino games and sports competition coordinator.
Event: "${eventTitle || 'Traditional Games Event'}"
Game Type: "${gameName || 'Traditional Game'}"
Description: "${eventDescription || 'A traditional games competition'}"
${isRegenerating ? 'Generate a DIFFERENT suggestion than before.' : ''}

Return ONLY a raw JSON object. No markdown, no explanation, no backticks.
`;

  const stepPrompts = {
    0: `${baseContext}
Identify and describe the game type based on the event name/description.
Return JSON: {
  "gameType": "exact game name (e.g., Tug of War, Patintero, Agawan Base, Luksong Tinik, etc.)",
  "category": "team | individual | relay",
  "description": "one sentence description of how this game is played",
  "suggestedTeamCount": number (typical number of teams, usually 4-8),
  "suggestedRoundsPerMatch": number (1, 3, or 5),
  "reason": "brief friendly explanation"
}`,

    1: `${baseContext}
Current game type: "${gameName || 'Unknown'}"
Suggest the number of competing teams for this traditional game tournament.
Return JSON: {
  "teamCount": number (2, 4, 8, or 16 — must be a power of 2 for elimination brackets),
  "teamNames": ["Team 1", "Team 2", ...] (generic placeholder names, same length as teamCount),
  "reason": "brief friendly explanation of why this team count works for this game"
}`,

    2: `${baseContext}
Current game type: "${gameName || 'Unknown'}"
Suggest the number of rounds per match (best-of format).
Return JSON: {
  "roundsPerMatch": number (1, 3, or 5),
  "format": "Best of 1 | Best of 3 | Best of 5",
  "advancementRule": "single string describing who advances (e.g., 'Winner of each match advances to the next round')",
  "reason": "brief friendly explanation"
}`,

    3: `${baseContext}
Current game type: "${gameName || 'Unknown'}"
Suggest the bracket format for this tournament.
Return JSON: {
  "bracketFormat": "single_elimination | round_robin",
  "formatLabel": "Single Elimination | Round Robin",
  "reason": "brief friendly explanation of why this format suits the game"
}`,

    4: `${baseContext}
Current game type: "${gameName || 'Unknown'}"
Suggest what scoring/tracking fields to record per round.
For traditional games, this is usually win/loss, but some games track points.
Return JSON: {
  "scoringFields": [
    { "id": "result", "label": "Round Result", "type": "win_loss", "description": "Who wins this round" }
  ],
  "trackPoints": boolean (true if the game has numeric scores, false for pure win/loss),
  "reason": "brief friendly explanation"
}
Note: type can be "win_loss", "points", or "time"`,

    5: `${baseContext}
Current game type: "${gameName || 'Unknown'}"
Current config: ${JSON.stringify(currentConfig || {})}
Generate a summary overview of the complete tournament setup.
Return JSON: {
  "summary": "2-3 sentence overview of the tournament format",
  "keyRules": ["rule 1", "rule 2", "rule 3"],
  "estimatedDuration": "estimated total tournament duration (e.g., '2-3 hours')",
  "judgeRole": "brief description of what judges will do in this game setup"
}`
  };

  return stepPrompts[step] || stepPrompts[0];
}

module.exports = router;
