const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contest.controller');

router.get('/', contestController.getAllContests);
router.get('/:id', contestController.getContestById);
router.post('/', contestController.createContest);

module.exports = router;
