const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Register
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Get user profile (protected)
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile (protected)
router.put('/profile', authMiddleware, userController.updateProfile);

// Reset account (delete all progress, submissions, quiz results)
router.post('/reset-account', authMiddleware, userController.resetAccount);

// Upload or update user avatar (protected)
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// Change password (protected)
router.post('/change-password', authMiddleware, userController.changePassword);

// Achievements endpoints
router.get('/achievements', authMiddleware, userController.getAllAchievements);
router.get('/my-achievements', authMiddleware, userController.getUserAchievements);
router.post('/earn-achievement', authMiddleware, userController.earnAchievement);

module.exports = router; 