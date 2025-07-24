const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserCareerProgress = require('../models/UserCareerProgress');
const ProjectSubmission = require('../models/ProjectSubmission');
const QuizResult = require('../models/QuizResult');
const path = require('path');
const fs = require('fs');
const Achievement = require('../models/Achievement');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, location, bio } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      joinDate: new Date().toLocaleString(),
      bio
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    res.status(200).json({ message: 'Login successful.', token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload or update user avatar (protected)
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Remove old avatar file if exists and is not default
    const user = await User.findById(req.user.id);
    if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
      const oldPath = path.join(__dirname, '../../uploads', path.basename(user.avatar));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    // Save new avatar path
    const avatarPath = `/uploads/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();
    res.status(200).json({ avatar: avatarPath });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user profile (protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user profile (protected)
exports.updateProfile = async (req, res) => {
  try {
    const updates = (({ name, phone, location, bio, avatar }) => ({ name, phone, location, bio, avatar }))(req.body);
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset user account (delete all progress, submissions, quiz results, and set all progress to 0)
exports.resetAccount = async (req, res) => {
  try {
    // Delete all progress, submissions, and quiz results
    await UserCareerProgress.deleteMany({ user: req.user.id });
    await ProjectSubmission.deleteMany({ user: req.user.id });
    await QuizResult.deleteMany({ user: req.user.id });

    // Optionally, reset XP and level if tracked in User model
    await User.findByIdAndUpdate(req.user.id, { totalXp: 0, level: 1 });

    res.status(200).json({ message: 'Account reset successfully. All progress, submissions, and quiz results have been deleted, and XP/level reset.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Change user password (protected)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all achievements
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({});
    res.status(200).json(achievements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user's earned achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const achievements = await Achievement.find({ key: { $in: user.achievements || [] } });
    res.status(200).json(achievements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark an achievement as earned for a user
exports.earnAchievement = async (req, res) => {
  try {
    const { key } = req.body;
    const achievement = await Achievement.findOne({ key });
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.achievements.includes(key)) {
      user.achievements.push(key);
      await user.save();
    }
    res.status(200).json({ message: 'Achievement earned', key });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 