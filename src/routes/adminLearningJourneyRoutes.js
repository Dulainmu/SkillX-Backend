const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const adminLearningJourneyController = require('../controllers/adminLearningJourneyController');

// All routes require admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// Learning Journey Management
router.get('/', adminLearningJourneyController.getAllLearningJourneys);
router.get('/:careerId', adminLearningJourneyController.getLearningJourney);
router.put('/:careerId', adminLearningJourneyController.updateLearningJourney);

// Step Management
router.post('/:careerId/steps', adminLearningJourneyController.addStep);
router.put('/:careerId/steps/:stepId', adminLearningJourneyController.updateStep);
router.delete('/:careerId/steps/:stepId', adminLearningJourneyController.deleteStep);

module.exports = router;
