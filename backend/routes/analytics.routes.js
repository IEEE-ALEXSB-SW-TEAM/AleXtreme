const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// GET /api/analytics/:contestId
router.get('/:contestId', analyticsController.getContestAnalytics);

module.exports = router;
