const UserCareerProgress = require('../models/UserCareerProgress');
const CareerRole = require('../models/CareerRole');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const nodemailer = require('nodemailer');

// Helper to award an achievement if not already earned
async function awardAchievement(userId, achievementKey) {
  const user = await User.findById(userId);
  if (!user) return;
  if (!user.achievements.includes(achievementKey)) {
    user.achievements.push(achievementKey);
    await user.save();
    
    // Check if achievement notifications are enabled
    if (user.notificationSettings && user.notificationSettings.achievement) {
      console.log(`Achievement earned: ${achievementKey} for user ${user.email}`);
      
      // Send email notification if email notifications are also enabled
      if (user.notificationSettings.email) {
        try {
          const achievement = await Achievement.findOne({ key: achievementKey });
          if (achievement) {
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

// Start a new career for a user
exports.startCareer = async (req, res) => {
  try {
    const { careerRoleId } = req.body;
    if (!careerRoleId) return res.status(400).json({ message: 'careerRoleId is required.' });
    const career = await CareerRole.findById(careerRoleId);
    if (!career) return res.status(404).json({ message: 'Career role not found.' });
    // Initialize steps
    const steps = (career.roadmap || []).map((_, idx) => ({ stepIndex: idx, completed: false }));
    // Prevent duplicate progress
    let progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) {
      // Check if this is the user's first career path BEFORE creating the new progress
      const existingProgressCount = await UserCareerProgress.countDocuments({ user: req.user.id });
      progress = new UserCareerProgress({
        user: req.user.id,
        careerRole: careerRoleId,
        steps
      });
      await progress.save();
      // Award the achievement for starting first career path
      if (existingProgressCount === 0) {
        await awardAchievement(req.user.id, 'first_career_path');
      }
    }
    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user progress for a career
exports.getProgress = async (req, res) => {
  try {
    const { careerRoleId } = req.params;
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a step's completion status
exports.updateStep = async (req, res) => {
  try {
    const { careerRoleId, stepIndex } = req.params;
    const { completed } = req.body;
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    const step = progress.steps.find(s => s.stepIndex === parseInt(stepIndex));
    if (!step) return res.status(404).json({ message: 'Step not found.' });
    step.completed = completed;
    step.completedAt = completed ? new Date() : null;
    // If all steps complete, set completedAt
    if (progress.steps.every(s => s.completed)) {
      progress.completedAt = new Date();
    } else {
      progress.completedAt = null;
    }
    await progress.save();

    // --- Achievements ---
    // Skill Collector: 10 completed steps (across all careers)
    const allProgress = await UserCareerProgress.find({ user: req.user.id });
    const totalSkills = allProgress.reduce((sum, prog) => sum + prog.steps.filter(s => s.completed).length, 0);
    if (totalSkills === 10) {
      await awardAchievement(req.user.id, 'skill_collector');
    }
    // Dedicated Learner: 7-day streak (completed a step each day for 7 consecutive days)
    // Gather all completedAt dates
    const completedDates = allProgress.flatMap(prog => prog.steps.filter(s => s.completedAt).map(s => s.completedAt));
    // Remove time, keep only date
    const dateSet = new Set(completedDates.map(d => d.toISOString().slice(0, 10)));
    const dateArr = Array.from(dateSet).sort();
    // Check for any 7 consecutive days
    let streak = 1;
    for (let i = 1; i < dateArr.length; i++) {
      const prev = new Date(dateArr[i - 1]);
      const curr = new Date(dateArr[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        if (streak >= 7) {
          await awardAchievement(req.user.id, 'dedicated_learner');
          break;
        }
      } else {
        streak = 1;
      }
    }
    // --- End Achievements ---

    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all user progress for all careers
exports.getAllProgress = async (req, res) => {
  try {
    console.log('getAllProgress called for user:', req.user.id);
    const progress = await UserCareerProgress.find({ user: req.user.id });
    console.log('Found progress records:', progress.length);
    res.status(200).json(progress);
  } catch (err) {
    console.error('Error in getAllProgress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark a resource as complete
exports.completeResource = async (req, res) => {
  try {
    const { careerRoleId, stepIndex } = req.params;
    const { resourceUrl } = req.body;
    if (!resourceUrl) return res.status(400).json({ message: 'resourceUrl is required.' });
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    // Prevent duplicates
    if (!progress.completedResources.some(r => r.stepIndex === parseInt(stepIndex) && r.resourceUrl === resourceUrl)) {
      progress.completedResources.push({ stepIndex: parseInt(stepIndex), resourceUrl });
      await progress.save();
    }
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark a resource as incomplete
exports.incompleteResource = async (req, res) => {
  try {
    const { careerRoleId, stepIndex } = req.params;
    const { resourceUrl } = req.body;
    if (!resourceUrl) return res.status(400).json({ message: 'resourceUrl is required.' });
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    progress.completedResources = progress.completedResources.filter(r => !(r.stepIndex === parseInt(stepIndex) && r.resourceUrl === resourceUrl));
    await progress.save();
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 