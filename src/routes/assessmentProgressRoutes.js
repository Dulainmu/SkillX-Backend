const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/assessmentProgressController');

// All routes require auth
router.get('/me', authMiddleware, ctrl.getMyProgress);
router.post('/me', authMiddleware, ctrl.saveMyProgress);
router.delete('/me', authMiddleware, ctrl.clearMyProgress);

// Test endpoint for debugging
router.post('/test', authMiddleware, ctrl.testProgress);

module.exports = router;


