require('dotenv').config();
require('./jobs/deactivateContests');

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_CORS,
  credentials: true,
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const contestRoutes = require('./routes/contest.routes');
const submissionRoutes = require('./routes/submission.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const problemRoutes = require('./routes/problems.routes');
const languageRoutes = require('./routes/language.routes');
const clarificationRoutes = require('./routes/clarification.routes');
const analyticsRoutes = require('./routes/analytics.routes');

app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/clarifications', clarificationRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Contest System API is running!');
});

// Start server
//const PORT = process.env.PORT || 5000;
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});