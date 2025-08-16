const User = require('../models/User');
const UserCareerProgress = require('../models/UserCareerProgress');
const QuizResult = require('../models/QuizResult');
const ProjectSubmission = require('../models/ProjectSubmission');

exports.getAnalytics = async (req, res) => {
  try {
    // Total users
    const users = await User.countDocuments();
    // Total completions (career completions)
    const completions = await UserCareerProgress.countDocuments({ completedAt: { $ne: null } });
    // Average quiz score
    const quizResults = await QuizResult.find({}, 'answers');
    let totalQuizScore = 0;
    let quizCount = 0;
    quizResults.forEach(qr => {
      if (Array.isArray(qr.answers)) {
        const sum = qr.answers.reduce((acc, a) => acc + (a.score || 0), 0);
        totalQuizScore += sum;
        quizCount += qr.answers.length;
      }
    });
    const avgQuizScore = quizCount > 0 ? Math.round((totalQuizScore / quizCount) * 100) / 100 : 0;
    // Average project score
    const projectSubmissions = await ProjectSubmission.find({ score: { $ne: null } }, 'score');
    const totalProjectScore = projectSubmissions.reduce((acc, p) => acc + (p.score || 0), 0);
    const avgProjectScore = projectSubmissions.length > 0 ? Math.round((totalProjectScore / projectSubmissions.length) * 100) / 100 : 0;
    // Active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await UserCareerProgress.countDocuments({ updatedAt: { $gte: today } });
    res.status(200).json({
      users,
      completions,
      avgQuizScore,
      avgProjectScore,
      activeToday,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
