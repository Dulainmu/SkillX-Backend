const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get recommendations for the user
router.get('/', authMiddleware, recommendationsController.getRecommendations);
router.get('/careers', recommendationsController.getAllCareers);

module.exports = router; 