const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ── GET /api/participants/my-invitations ──────────────────────────
// Fetch invitations for a participant by email
router.get('/my-invitations', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const { data, error } = await supabase
      .from('event_participants')
      .select('*, event:events(name, start_date, type, profiles(first_name, last_name))')
      .ilike('email', email)
      .in('status', ['Pending', 'pending'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format for frontend
    const formatted = data.map(inv => ({
      id: inv.id,
      eventName: inv.event?.name || 'Unknown Event',
      organizer: inv.event?.profiles ? `${inv.event.profiles.first_name} ${inv.event.profiles.last_name}` : 'Unknown Organizer',
      date: inv.event?.start_date || 'TBD',
      type: inv.event?.type || 'Other',
      status: inv.status || 'Pending'
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /participants/my-invitations]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/participants/my-events ──────────────────────────────
// Fetch joined events for a participant by email
router.get('/my-events', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const { data, error } = await supabase
      .from('event_participants')
      .select('*, event:events(*, profiles(first_name, last_name))')
      .ilike('email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format for frontend
    const formatted = data.map(inv => ({
      id: inv.event?.id,
      name: inv.event?.name || 'Unknown Event',
      organizer: inv.event?.profiles ? `${inv.event.profiles.first_name} ${inv.event.profiles.last_name}` : 'Unknown Organizer',
      date: inv.event?.start_date || 'TBD',
      status: inv.event?.status || 'upcoming',
      type: inv.event?.type || 'Other',
      score: inv.score || '-',
      rank: '-', // Logic for rank would be complex, leaving as '-' for now
      registrationId: inv.id,
      registrationStatus: inv.status
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /participants/my-events]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/participants ──────────────────────────────────────────
// Fetch all participants for an event
router.get('/', async (req, res) => {
  try {
    const { event_id } = req.query;
    if (!event_id) {
      return res.status(400).json({ success: false, error: 'event_id is required' });
    }

    const { data, error } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', event_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('[GET /participants]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/participants ─────────────────────────────────────────
// Add a participant to an event
router.post('/', async (req, res) => {
  try {
    const { event_id, name, email, team, score, status } = req.body;

    if (!event_id || !name) {
      return res.status(400).json({ success: false, error: 'event_id and name are required' });
    }

    // Check for duplicate by email to avoid PK conflicts
    if (email) {
      const { data: existing } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event_id)
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        // Already invited — return existing record without error
        return res.status(200).json({ success: true, data: existing, already_exists: true });
      }
    }

    // Look up real name from profiles table if registered in system
    let finalName = name;
    if (email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        finalName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || name;
      }
    }

    const { data, error } = await supabase
      .from('event_participants')
      .insert([{
        event_id,
        name: finalName,
        email: email || null,
        team: team || null,
        score: score || null,
        status: status || 'Pending',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[POST /participants]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/participants/:id ────────────────────────────────────
// Update a participant
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('event_participants')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ success: false, error: 'Participant not found.' });

    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('[PATCH /participants/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/participants/:id ───────────────────────────────────
// Remove a participant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('event_participants').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: `Participant ${id} deleted successfully.` });
  } catch (err) {
    console.error('[DELETE /participants/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
