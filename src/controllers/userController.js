const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserCareerProgress = require('../models/UserCareerProgress');
const ProjectSubmission = require('../models/ProjectSubmission');
const QuizResult = require('../models/QuizResult');
const PasswordReset = require('../models/PasswordReset');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Achievement = require('../models/Achievement');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    // Name validation: only letters, spaces, hyphens, apostrophes
    if (!/^[A-Za-z\s'-]+$/.test(name)) {
      return res.status(400).json({ message: 'Name can only contain letters, spaces, hyphens, and apostrophes.' });
    }
    // Email validation: not only-numeric before @
    const [local] = email.split('@');
    if (/^\d+$/.test(local)) {
      return res.status(400).json({ message: 'Email cannot have only numbers before @.' });
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
      joinDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
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

// Helper to award an achievement if not already earned
async function awardAchievement(userId, achievementKey) {
  const user = await User.findById(userId);
  if (!user) return;
  
  if (!user.achievements.includes(achievementKey)) {
    user.achievements.push(achievementKey);
    await user.save();
    
    // Check if achievement notifications are enabled
    if (user.notificationSettings && user.notificationSettings.achievement) {
      // Send achievement notification (you can implement email notification here)
      console.log(`Achievement earned: ${achievementKey} for user ${user.email}`);
      
      // Optional: Send email notification if email notifications are also enabled
      if (user.notificationSettings.email) {
        try {
          const achievement = await Achievement.findOne({ key: achievementKey });
          if (achievement) {
            // Send email notification
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
              }
            });

            const mailOptions = {
              from: process.env.EMAIL_USER || 'your-email@gmail.com',
              to: user.email,
              subject: `🎉 Achievement Unlocked: ${achievement.title} - SkillX`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3b82f6;">🎉 Achievement Unlocked!</h2>
                  <p>Congratulations ${user.name}!</p>
                  <p>You've earned the <strong>${achievement.title}</strong> achievement!</p>
                  <p><em>${achievement.description}</em></p>
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #fbbf24; color: white; padding: 20px; border-radius: 10px; display: inline-block;">
                      <h3 style="margin: 0;">🏆 ${achievement.title}</h3>
                    </div>
                  </div>
                  <p>Keep up the great work and continue your learning journey!</p>
                  <p>Best regards,<br>The SkillX Team</p>
                </div>
              `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Achievement email sent to ${user.email}`);
          }
        } catch (error) {
          console.error('Failed to send achievement email:', error);
        }
      }
    }
  }
}

// Update user profile (protected)
exports.updateProfile = async (req, res) => {
  try {
    const updates = (({ name, bio, avatar, level }) => ({ name, bio, avatar, level }))(req.body);
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Award 'Expert Level' achievement if user reaches level 15
    if (user.level >= 15) {
      await awardAchievement(user._id, 'expert_level');
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

// Delete user account (protected)
exports.deleteAccount = async (req, res) => {
  try {
    // Delete all progress, submissions, and quiz results
    await UserCareerProgress.deleteMany({ user: req.user.id });
    await ProjectSubmission.deleteMany({ user: req.user.id });
    await QuizResult.deleteMany({ user: req.user.id });
    // Delete the user
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: 'Account deleted successfully.' });
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

// Forgot password - send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ message: 'If this email is registered, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token to database
    await PasswordReset.create({
      email: user.email,
      token: resetTokenHash,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    // Create email transporter (using Gmail for demo)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset Request - SkillX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your SkillX account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The SkillX Team</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'If this email is registered, a password reset link has been sent.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    console.log('Reset password request:', { email, hasToken: !!token, hasPassword: !!newPassword });
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Token, email, and new password are required.' });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Looking for reset token with hash:', resetTokenHash.substring(0, 10) + '...');

    // Find the reset token
    const passwordReset = await PasswordReset.findOne({
      email: email,
      token: resetTokenHash,
      expiresAt: { $gt: Date.now() }
    });

    if (!passwordReset) {
      console.log('No valid reset token found for email:', email);
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    console.log('Valid reset token found, updating password for user:', email);

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete the used reset token
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    console.log('Password reset successful for user:', email);
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Update notification settings (protected)
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { email, achievement } = req.body;
    
    if (typeof email !== 'boolean' || typeof achievement !== 'boolean') {
      return res.status(400).json({ message: 'Email and achievement must be boolean values.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.notificationSettings = {
      email,
      achievement
    };

    await user.save();

    res.status(200).json({ 
      message: 'Notification settings updated successfully.',
      notificationSettings: user.notificationSettings
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 