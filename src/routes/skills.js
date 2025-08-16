const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// ===== PUBLIC ROUTES =====
router.get('/categories', skillController.getSkillCategories);
router.get('/search', skillController.searchSkills);
router.get('/category/:category', skillController.getSkillsByCategory);

// ===== AUTHENTICATED USER ROUTES =====
router.get('/user/:userId', authMiddleware, skillController.getUserSkills);
router.put('/user/:userId', authMiddleware, skillController.updateUserSkill);
router.post('/user/:userId', authMiddleware, skillController.addSkillToUser);
router.get('/user/:userId/recommendations', authMiddleware, skillController.getSkillRecommendations);

// ===== ADMIN ROUTES =====
router.get('/', authMiddleware, requireRole('admin'), skillController.getAllSkills);
router.post('/', authMiddleware, requireRole('admin'), skillController.createSkill);
router.put('/:id', authMiddleware, requireRole('admin'), skillController.updateSkill);
router.delete('/:id', authMiddleware, requireRole('admin'), skillController.deleteSkill);
router.get('/:skillId/analytics', authMiddleware, requireRole('admin'), skillController.getSkillAnalytics);

// ===== PUBLIC ROUTES (must come after specific routes) =====
router.get('/:id', skillController.getSkill);

module.exports = router;
