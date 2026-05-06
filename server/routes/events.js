const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ── GET /api/events ──────────────────────────────────────────────
// Fetch all events (optionally filter by organizer_id)
router.get('/', async (req, res) => {
  try {
    const { organizer_id, visibility, type } = req.query;

    let query = supabase.from('events').select('*').order('created_at', { ascending: false });

    if (organizer_id) query = query.eq('organizer_id', organizer_id);
    if (visibility)   query = query.eq('visibility', visibility);
    if (type)         query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('[GET /events]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/events/:id ──────────────────────────────────────────
// Fetch a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Event not found.' });

    res.json({ success: true, data });
  } catch (err) {
    console.error('[GET /events/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/events ─────────────────────────────────────────────
// Create a new event
router.post('/', async (req, res) => {
  try {
    const {
      organizer_id,
      name,
      type,
      start_date,
      start_time,
      end_date,
      end_time,
      description,
      location,
      latitude,
      longitude,
      visibility,
    } = req.body;

    // Basic validation
    if (!name || !type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'name, type, start_date, and end_date are required.',
      });
    }

    const { data, error } = await supabase
      .from('events')
      .insert([{
        organizer_id: organizer_id || null,
        name,
        type,
        start_date,
        start_time: start_time || null,
        end_date,
        end_time: end_time || null,
        description: description || null,
        location: location || null,
        latitude: latitude || null,
        longitude: longitude || null,
        visibility: visibility || 'Public',
        status: 'upcoming',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[POST /events]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/events/:id ────────────────────────────────────────
// Update an event (partial update)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Event not found.' });

    res.json({ success: true, data });
  } catch (err) {
    console.error('[PATCH /events/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/events/:id ───────────────────────────────────────
// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: `Event ${id} deleted successfully.` });
  } catch (err) {
    console.error('[DELETE /events/:id]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
