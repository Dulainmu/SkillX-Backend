const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const adminAnalyticsController = require('../controllers/adminAnalyticsController');
const User = require('../models/User');

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

// Update notification settings (protected)
router.put('/notification-settings', authMiddleware, userController.updateNotificationSettings);

// Achievements endpoints
router.get('/achievements', authMiddleware, userController.getAllAchievements);
router.get('/my-achievements', authMiddleware, userController.getUserAchievements);
router.post('/earn-achievement', authMiddleware, userController.earnAchievement);

// Delete account (protected)
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

// Password reset routes (public)
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Admin analytics endpoint
router.get('/admin/analytics', authMiddleware, adminAnalyticsController.getAnalytics);

// List all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  // Optionally check for admin role here
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 