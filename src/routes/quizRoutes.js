const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Submit quiz answers
router.post('/submit', authMiddleware, quizController.submitQuiz);

// Get latest quiz result
router.get('/result', authMiddleware, quizController.getQuizResult);

module.exports = router; 