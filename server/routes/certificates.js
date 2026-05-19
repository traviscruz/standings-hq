const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Helper to map certType to readable title
const getAchievementTitle = (certType) => {
  switch (certType) {
    case 'champion': return 'Champion';
    case 'participation': return 'Participation';
    case 'recognition': return 'Recognition';
    default: return certType ? (certType.charAt(0).toUpperCase() + certType.slice(1)) : 'Participation';
  }
};

// ── POST /api/certificates/generate ──────────────────────────────
// Generate and save certificates in bulk for a completed event
router.post('/generate', async (req, res) => {
  try {
    const { eventId, bulkRecipient, certType, templateConfig, customText } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'eventId is required' });
    }

    // 1. Verify that the event exists and is completed
    const { data: event, error: eError } = await supabase
      .from('events')
      .select('name, status, start_date')
      .eq('id', eventId)
      .maybeSingle();

    if (eError) throw eError;
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    if (event.status.toLowerCase() !== 'completed') {
      return res.status(400).json({
        success: false,
        error: `Certificates can only be generated for completed events. Current status is '${event.status}'.`
      });
    }

    // 2. Fetch all participants for this event
    const { data: participants, error: pError } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId);

    if (pError) throw pError;
    if (!participants || participants.length === 0) {
      return res.status(400).json({ success: false, error: 'No participants found in this event to generate certificates for.' });
    }

    // 3. Filter target list of participants
    let targetList = [];
    let isWinnersMode = bulkRecipient === 'winners';

    if (isWinnersMode) {
      // Sort by score desc, top 3 are winners
      const sorted = [...participants].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
      targetList = sorted.slice(0, 3);
    } else if (bulkRecipient === 'registered') {
      targetList = participants.filter(p => p.status === 'Registered');
    } else {
      // default: 'all'
      targetList = participants;
    }

    if (targetList.length === 0) {
      return res.status(400).json({ success: false, error: 'No participants match the selected bulk criteria.' });
    }

    // 4. Map to database certificate rows
    const certificatesToUpsert = targetList.map((p, idx) => {
      let achievement = getAchievementTitle(certType);
      
      // Override achievement if in winners mode
      if (isWinnersMode) {
        if (idx === 0) achievement = 'Champion';
        else if (idx === 1) achievement = '1st Runner Up';
        else if (idx === 2) achievement = '2nd Runner Up';
      }

      return {
        event_id: eventId,
        participant_id: p.id,
        achievement,
        custom_text: customText || null,
        template_config: templateConfig || {},
        updated_at: new Date().toISOString()
      };
    });

    // 5. Upsert certificates in the database (will update if already exists)
    const { data, error: upsertError } = await supabase
      .from('certificates')
      .upsert(certificatesToUpsert, { onConflict: 'event_id,participant_id' })
      .select();

    if (upsertError) throw upsertError;

    res.json({
      success: true,
      message: `Successfully generated ${data.length} certificate(s) for the event.`,
      count: data.length
    });
  } catch (err) {
    console.error('[POST /certificates/generate]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/certificates/participant ────────────────────────────
// Fetch dynamic database certificates for a participant by email
router.get('/participant', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, error: 'email query parameter is required' });
    }

    // Query certificates joining on participants and events
    // We filter by participant email and status = Registered
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        id,
        achievement,
        custom_text,
        template_config,
        created_at,
        event:events(id, name, start_date, status, type),
        participant:event_participants!inner(id, name, email, status)
      `)
      .eq('participant.email', email);

    if (error) throw error;

    // Format matches SEED_CERTIFICATES in the React frontend
    const formatted = data.map(cert => ({
      id: cert.id,
      eventId: cert.event?.id,
      eventName: cert.event?.name || 'Unknown Event',
      achievement: cert.achievement,
      date: cert.event?.start_date ? new Date(cert.event.start_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
      customText: cert.custom_text,
      templateConfig: cert.template_config
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /certificates/participant]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/certificates/event/:event_id ──────────────────────────
// Fetch generated certificates for an event (useful for verification/listing)
router.get('/event/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        id,
        achievement,
        custom_text,
        template_config,
        created_at,
        participant:event_participants(id, name, email)
      `)
      .eq('event_id', event_id);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('[GET /certificates/event/:event_id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
