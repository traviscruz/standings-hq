const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const billingRoutes = require('./routes/billing');
const participantRoutes = require('./routes/participants');
const judgeRoutes = require('./routes/judges');
const userRoutes = require('./routes/users');
const scoreRoutes = require('./routes/scores');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('StandingsHQ Backend is running clean and modular!');
});

// JSON 404 for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
