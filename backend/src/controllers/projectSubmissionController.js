const ProjectSubmission = require('../models/ProjectSubmission');
const CareerRole = require('../models/CareerRole');
const User = require('../models/User');

// Helper to award an achievement if not already earned
async function awardAchievement(userId, achievementKey) {
  const User = require('../models/User');
  const Achievement = require('../models/Achievement');
  const nodemailer = require('nodemailer');
  
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

// User: Submit a project
exports.submitProject = async (req, res) => {
  try {
    const { careerRoleId, stepIndex, projectId, title, description, submissionUrl } = req.body;
    if (!careerRoleId || stepIndex === undefined || !projectId || !title) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Find the project definition in the career's roadmap (if available)
    let skills = [];
    const CareerRole = require('../models/CareerRole');
    const career = await CareerRole.findById(careerRoleId);
    if (career && Array.isArray(career.roadmap)) {
      for (const step of career.roadmap) {
        if (step.projects && Array.isArray(step.projects)) {
          const found = step.projects.find(p => p.id === projectId);
          if (found && found.skills) {
            skills = found.skills;
            break;
          }
        }
      }
    }
    let fileUrl = undefined;
    if (req.file) {
      // Save relative path for download endpoint
      fileUrl = `/api/submissions/${req.file.filename}/file`;
    }
    const submission = new ProjectSubmission({
      user: req.user.id,
      careerRole: careerRoleId,
      stepIndex,
      projectId,
      title,
      description,
      submissionUrl,
      fileUrl,
      skills
    });
    await submission.save();
    // Award 'First Steps' achievement if this is the user's first project
    const totalProjects = await ProjectSubmission.countDocuments({ user: req.user.id });
    if (totalProjects === 1) {
      await awardAchievement(req.user.id, 'first_steps');
    }
    // Award 'Project Master' achievement if this is the user's 20th project
    if (totalProjects === 20) {
      await awardAchievement(req.user.id, 'project_master');
    }
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User: List their submissions
exports.listUserSubmissions = async (req, res) => {
  try {
    const submissions = await ProjectSubmission.find({ user: req.user.id });
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User: Get a specific submission
exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await ProjectSubmission.findById(id);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });
    if (submission.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden.' });
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mentor: List all submissions
exports.listAllSubmissions = async (req, res) => {
  try {
    const submissions = await ProjectSubmission.find({}).populate('user', 'name email');
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mentor: Review a submission
exports.reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, score } = req.body;
    const submission = await ProjectSubmission.findById(id);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });
    submission.status = status || submission.status;
    submission.feedback = feedback || submission.feedback;
    submission.score = score !== undefined ? score : submission.score;
    submission.mentor = req.user.id;
    await submission.save();
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Download file for a submission
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await ProjectSubmission.findById(id);
    if (!submission || !submission.fileUrl) {
      return res.status(404).json({ message: 'File not found.' });
    }
    // Extract filename from fileUrl
    const path = require('path');
    const fs = require('fs');
    const filename = submission.fileUrl.split('/')[3];
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server.' });
    }
    res.download(filePath, submission.title + path.extname(filePath));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 