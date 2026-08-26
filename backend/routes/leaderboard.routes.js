const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');

// GET /api/leaderboard/:contestId
router.get('/:contestId', leaderboardController.getLeaderboard);

// GET /api/leaderboard/matrix/:contestId
router.get('/matrix/:contestId', leaderboardController.getMatrixLeaderboard);

// GET /api/leaderboard/admin/:contestId
router.get('/admin/:contestId', leaderboardController.adminLeaderboard);

// GET /api/leaderboard/admin/:contestId/:teamId
router.get('/admin/:contestId/:teamId', leaderboardController.adminLeaderboardTeamByID);

module.exports = router;
