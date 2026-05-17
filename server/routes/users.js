const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ── GET /api/users/search ──────────────────────────────────────────
// Search users by name or email
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(20);

    if (error) throw error;

    // Map the database fields to match the frontend expectations
    const mappedData = data.map(u => ({
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User',
      email: u.email,
      role: u.role || 'User',
      team: 'TBD', // Placeholder since profiles don't inherently have teams
      expertise: 'General' // Placeholder since profiles don't inherently have expertise
    }));

    res.json({ success: true, data: mappedData });
  } catch (err) {
    console.error('[GET /users/search]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
