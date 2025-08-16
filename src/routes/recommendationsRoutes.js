const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get recommendations for the user
router.get('/', authMiddleware, recommendationsController.getRecommendations);
// Personalized recommendations endpoint (alias for the main endpoint)
router.get('/personalized', authMiddleware, recommendationsController.getRecommendations);
router.get('/careers', recommendationsController.getAllCareers);
// Get all careers with match scores for authenticated users
router.get('/careers-with-scores', authMiddleware, recommendationsController.getAllCareersWithScores);
// Debug endpoint to check quiz results and calculations
router.get('/debug', authMiddleware, recommendationsController.debugQuizResults);

module.exports = router; 