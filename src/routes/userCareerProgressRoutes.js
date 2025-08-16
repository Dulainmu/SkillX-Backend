const express = require('express');
const router = express.Router();
const userCareerProgressController = require('../controllers/userCareerProgressController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Start a new career (initialize progress)
router.post('/start', authMiddleware, userCareerProgressController.startCareer);

// Get user progress for a career
router.get('/:careerRoleId', authMiddleware, userCareerProgressController.getProgress);

// Get all user progress for all careers
router.get('/all', authMiddleware, userCareerProgressController.getAllProgress);

// Update a step's completion status
router.put('/:careerRoleId/step/:stepIndex', authMiddleware, userCareerProgressController.updateStep);

// Mark a resource as complete
router.post('/:careerRoleId/step/:stepIndex/resource/complete', authMiddleware, userCareerProgressController.completeResource);
// Mark a resource as incomplete
router.post('/:careerRoleId/step/:stepIndex/resource/incomplete', authMiddleware, userCareerProgressController.incompleteResource);

module.exports = router; 