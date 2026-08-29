const express = require('express');
const router = express.Router();
const {
  submit,
  getMySubmissions,
  getSubmissionById,
  getSolvedCount,
  getAllSubmissions,
  getSubmissionByIdPublic
} = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, submit);
router.get('/mine', authenticate, getMySubmissions);
router.get('/solved-count', authenticate, getSolvedCount);
router.get('/:id', authenticate, getSubmissionById);
router.get('/', authenticate, getAllSubmissions);
router.get('/public/:id', getSubmissionByIdPublic); // Public route to get submission by ID


module.exports = router;
