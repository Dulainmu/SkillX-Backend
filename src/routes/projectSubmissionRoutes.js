const express = require('express');
const router = express.Router();
const projectSubmissionController = require('../controllers/projectSubmissionController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// User: Submit a project (with file upload)
router.post('/', authMiddleware, upload.single('file'), projectSubmissionController.submitProject);

// User: List their submissions
router.get('/', authMiddleware, projectSubmissionController.listUserSubmissions);

// User: Get a specific submission
router.get('/:id', authMiddleware, projectSubmissionController.getSubmission);

// Download file for a submission
router.get('/:id/file', authMiddleware, projectSubmissionController.downloadFile);

// Mentor: List all submissions (should be protected by mentor role)
router.get('/all/mentor', authMiddleware, projectSubmissionController.listAllSubmissions);

// Mentor: Review a submission (should be protected by mentor role)
router.put('/:id/review', authMiddleware, projectSubmissionController.reviewSubmission);

module.exports = router; 