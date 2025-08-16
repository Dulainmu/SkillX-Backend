const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// ===== PUBLIC ROUTES =====

// Get skill categories
router.get('/categories', skillController.getSkillCategories);

// Search skills
router.get('/search', skillController.searchSkills);

// Get skills by category
router.get('/category/:category', skillController.getSkillsByCategory);

// Get single skill by ID or slug
router.get('/:id', skillController.getSkill);

// ===== AUTHENTICATED USER ROUTES =====

// Get user's skill progress
router.get('/user/:userId', authMiddleware, skillController.getUserSkills);

// Update user skill progress
router.put('/user/:userId', authMiddleware, skillController.updateUserSkill);

// Add skill to user's learning path
router.post('/user/:userId', authMiddleware, skillController.addSkillToUser);

// Get skill recommendations for user
router.get('/user/:userId/recommendations', authMiddleware, skillController.getSkillRecommendations);

// ===== ADMIN ROUTES =====

// Get all skills (admin)
router.get('/', authMiddleware, requireRole('admin'), skillController.getAllSkills);

// Create new skill (admin)
router.post('/', authMiddleware, requireRole('admin'), skillController.createSkill);

// Update skill (admin)
router.put('/:id', authMiddleware, requireRole('admin'), skillController.updateSkill);

// Delete skill (admin)
router.delete('/:id', authMiddleware, requireRole('admin'), skillController.deleteSkill);

// Get skill analytics (admin)
router.get('/:skillId/analytics', authMiddleware, requireRole('admin'), skillController.getSkillAnalytics);

module.exports = router;
