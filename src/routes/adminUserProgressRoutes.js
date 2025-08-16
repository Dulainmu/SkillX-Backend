const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getAllUserProgress,
  getUserProgress,
  resetUserProgress,
  getUserProgressAnalytics,
  getUserAchievements,
  exportUserProgress,
  resetAllMemberProgress,
  resetIndividualMemberProgress,
  getResetStatistics
} = require('../controllers/adminUserProgressController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// Get all user progress with analytics
router.get('/', getAllUserProgress);

// Get single user progress
router.get('/:userId/:careerId', getUserProgress);

// Reset user progress
router.delete('/:userId/:careerId', resetUserProgress);

// Get user progress analytics for a career
router.get('/analytics/:careerId', getUserProgressAnalytics);

// Get user achievements
router.get('/:userId/achievements', getUserAchievements);

// Export user progress data
router.get('/export', exportUserProgress);

// Reset functionality
router.get('/reset-statistics', getResetStatistics);
router.post('/reset-all', resetAllMemberProgress);
router.post('/reset-user/:userId', resetIndividualMemberProgress);

module.exports = router;
