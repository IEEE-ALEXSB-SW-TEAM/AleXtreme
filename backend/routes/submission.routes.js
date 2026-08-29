const express = require('express');
const router = express.Router();
const {
  submit,
  getMySubmissions,
  getSubmissionById,
  getSolvedCount,
  getAllSubmissions,
  getSubmissionByIdPublic,
  getSolvedProblems
} = require('../controllers/submission.controller');
const { authenticate, authenticateAdmin } = require('../middleware/auth.middleware');

router.post('/', authenticate, submit);
router.get('/mine', authenticate, getMySubmissions);
router.get('/solved-count', authenticate, getSolvedCount);
router.get('/solved', authenticate, getSolvedProblems);
router.get('/:id', authenticate, getSubmissionById);
router.get('/', authenticateAdmin, getAllSubmissions);
router.get('/public/:id', getSubmissionByIdPublic);


module.exports = router;
