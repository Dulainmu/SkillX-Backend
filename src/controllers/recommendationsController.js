const QuizResult = require('../models/QuizResult');
const CareerRole = require('../models/CareerRole');

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

exports.getRecommendations = async (req, res) => {
  try {
    const quizResult = await QuizResult.findOne({ user: req.user.id }).sort({ timestamp: -1 });
    if (!quizResult) {
      return res.status(404).json({ message: 'No quiz result found.' });
    }
    const userVector = quizResult.answers.map(a => a.score);
    const roles = await CareerRole.find({});
    const scored = roles.map(role => {
      const similarity = cosineSimilarity(userVector, role.vector);
      return {
        id: role._id,
        name: role.name,
        description: role.description,
        matchPercentage: Math.round(similarity * 100),
        skills: role.skills,
        roadmap: role.roadmap,
        detailedRoadmap: role.detailedRoadmap,
        averageSalary: role.averageSalary,
        jobGrowth: role.jobGrowth
      };
    });
    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const top3 = scored.slice(0, 3);
    res.status(200).json({ recommendations: top3, userId: req.user.id, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllCareers = async (req, res) => {
  try {
    const careers = await CareerRole.find({});
    res.status(200).json({ careers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 