const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ── GET /api/judges/my-invitations ─────────────────────────────
// Fetch invitations for a judge by email
router.get('/my-invitations', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const { data, error } = await supabase
      .from('event_judges')
      .select('*, event:events(name, start_date, type, profiles(first_name, last_name))')
      .eq('email', email)
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format for frontend
    const formatted = data.map(inv => ({
      id: inv.id,
      eventName: inv.event?.name || 'Unknown Event',
      organizer: inv.event?.profiles ? `${inv.event.profiles.first_name} ${inv.event.profiles.last_name}` : 'Unknown Organizer',
      date: inv.event?.start_date || 'TBD',
      role: inv.role || 'Judge'
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /judges/my-invitations]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/judges/my-events ─────────────────────────────
// Fetch accepted events for a judge by email
router.get('/my-events', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'email is required' });

    const { data, error } = await supabase
      .from('event_judges')
      .select('*, event:events(id, name, type, description, start_date, start_time, end_date, end_time, location, status, visibility, profiles(first_name, last_name))')
      .eq('email', email)
      .eq('status', 'Accepted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format for frontend
    const formatted = data
      .filter(inv => inv.event) // Safeguard against null events
      .map(inv => ({
        id: inv.event.id,
        eventJudgeId: inv.id,
        name: inv.event.name || 'Unknown Event',
        organizer: inv.event.profiles ? `${inv.event.profiles.first_name} ${inv.event.profiles.last_name}` : 'Unknown Organizer',
        date: inv.event.start_date || 'TBD',
        type: inv.event.type || 'Other',
        role: inv.role || 'Judge',
        expertise: inv.expertise || '',
        status: inv.event.status || 'upcoming',
        description: inv.event.description || '',
      }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /judges/my-events]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/judges ────────────────────────────────────────────────
// Fetch all judges for an event
router.get('/', async (req, res) => {
  try {
    const { event_id } = req.query;
    if (!event_id) {
      return res.status(400).json({ success: false, error: 'event_id is required' });
    }

    const { data, error } = await supabase
      .from('event_judges')
      .select('*')
      .eq('event_id', event_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('[GET /judges]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/judges ───────────────────────────────────────────────
// Add a judge to an event
router.post('/', async (req, res) => {
  try {
    const { event_id, name, email, expertise, role, status } = req.body;

    if (!event_id || !name) {
      return res.status(400).json({ success: false, error: 'event_id and name are required' });
    }

    // Check for duplicate by email to avoid PK conflicts
    if (email) {
      const { data: existing } = await supabase
        .from('event_judges')
        .select('id')
        .eq('event_id', event_id)
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        // Already invited — return existing record without error
        return res.status(200).json({ success: true, data: existing, already_exists: true });
      }
    }

    const { data, error } = await supabase
      .from('event_judges')
      .insert([{
        event_id,
        name,
        email: email || null,
        expertise: expertise || null,
        role: role || null,
        status: status || 'Pending',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[POST /judges]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/judges/:id ──────────────────────────────────────────
// Update a judge
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('event_judges')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ success: false, error: 'Judge not found.' });

    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('[PATCH /judges/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/judges/:id ─────────────────────────────────────────
// Remove a judge
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('event_judges').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: `Judge ${id} deleted successfully.` });
  } catch (err) {
    console.error('[DELETE /judges/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
