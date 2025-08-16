const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
// const LearningMaterialController = require('../controllers/learningMaterialController');

// CRUD
router.get('/', authMiddleware, /*LearningMaterialController.getAll*/ (req, res) => res.json([]));
router.post('/', authMiddleware, requireRole('admin'), /*LearningMaterialController.create*/ (req, res) => res.json({ message: 'Created' }));
router.put('/:id', authMiddleware, requireRole('admin'), /*LearningMaterialController.update*/ (req, res) => res.json({ message: 'Updated' }));
router.delete('/:id', authMiddleware, requireRole('admin'), /*LearningMaterialController.delete*/ (req, res) => res.json({ message: 'Deleted' }));

// Review/approval
router.post('/:id/approve', authMiddleware, requireRole('mentor'), /*LearningMaterialController.approve*/ (req, res) => res.json({ message: 'Approved' }));
router.post('/:id/reject', authMiddleware, requireRole('mentor'), /*LearningMaterialController.reject*/ (req, res) => res.json({ message: 'Rejected' }));

// Feedback
router.post('/:id/feedback', authMiddleware, requireRole('user'), /*LearningMaterialController.addFeedback*/ (req, res) => res.json({ message: 'Feedback added' }));

module.exports = router;
