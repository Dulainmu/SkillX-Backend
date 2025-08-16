const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const adminProjectSubmissionsController = require('../controllers/adminProjectSubmissionsController');

// All routes require admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// Project Submissions Management
router.get('/', adminProjectSubmissionsController.getAllSubmissions);
router.get('/:id', adminProjectSubmissionsController.getSubmission);
router.put('/:id/review', adminProjectSubmissionsController.reviewSubmission);
router.post('/bulk-review', adminProjectSubmissionsController.bulkReviewSubmissions);
router.put('/:id/assign-mentor', adminProjectSubmissionsController.assignMentor);
router.delete('/:id', adminProjectSubmissionsController.deleteSubmission);

// Analytics and Reports
router.get('/mentor-workload', adminProjectSubmissionsController.getMentorWorkload);
router.get('/careers/:careerId/submissions', adminProjectSubmissionsController.getSubmissionsByCareer);
router.get('/users/:userId/submissions', adminProjectSubmissionsController.getSubmissionsByUser);

module.exports = router;
