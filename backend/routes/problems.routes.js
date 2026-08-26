const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problems.controller');

router.get('/:contestId', problemController.getAllProblemsForContest);
router.get('/:contestId/:id', problemController.getProblemById);
router.get('/:contestId/:id/test-cases', problemController.getAllTestCasesForProblem);
router.put('/:contestId/:id', problemController.updateProblem);
router.post('/:contestId/:id/test-cases', problemController.addTestCase);
router.put('/:contestId/:id/test-cases/:testCaseId', problemController.updateTestCase);
router.delete('/:contestId/:id/test-cases/:testCaseId', problemController.deleteTestCase);

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // temp folder

router.post('/admin/:contestId', upload.single('file'), problemController.createProblem);

module.exports = router;
