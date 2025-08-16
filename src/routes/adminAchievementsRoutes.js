const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getAllAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  assignAchievementToUsers,
  getAchievementStats,
  bulkAssignAchievements
} = require('../controllers/adminAchievementsController');

// All routes require admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// Get all achievements with analytics
router.get('/', getAllAchievements);

// Get single achievement
router.get('/:id', getAchievement);

// Create new achievement
router.post('/', createAchievement);

// Update achievement
router.put('/:id', updateAchievement);

// Delete achievement
router.delete('/:id', deleteAchievement);

// Assign achievement to users
router.post('/:id/assign', assignAchievementToUsers);

// Get achievement statistics
router.get('/:id/stats', getAchievementStats);

// Bulk assign achievements
router.post('/bulk-assign', bulkAssignAchievements);

module.exports = router;
