const express = require('express');

const router = express.Router();

const {
  authenticate,
  authenticateAdmin
} = require('../middleware/auth.middleware');

const clarificationController = require('../controllers/clarification.controller');


// ============================================================
// TEAM ROUTES
// ============================================================

// Team creates a clarification
router.post(
  '/',
  authenticate,
  clarificationController.createClarification
);


// Team gets their own clarifications
router.get(
  '/',
  authenticate,
  clarificationController.getTeamClarifications
);


// Team gets announcements
router.get(
  '/announcements/list',
  authenticate,
  clarificationController.getAnnouncements
);

router.get(
  '/public',
  authenticate,
  clarificationController.getPublicClarifications
);

// Team gets one of their own clarifications
router.get(
  '/:id',
  authenticate,
  clarificationController.getTeamClarification
);


// ============================================================
// ADMIN ROUTES
// ============================================================

// Admin gets ALL clarifications
router.get(
  '/admin/all',
  authenticateAdmin,
  clarificationController.getAllClarifications
);


// Admin responds to a clarification
router.post(
  '/admin/:id/messages',
  authenticateAdmin,
  clarificationController.respondToClarification
);


// Admin sends an announcement to everyone
router.post(
  '/admin/announcements',
  authenticateAdmin,
  clarificationController.createAnnouncement
);


module.exports = router;