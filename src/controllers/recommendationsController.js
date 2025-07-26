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
    console.log('User vector:', userVector); // Debug log
    
    const roles = await CareerRole.find({});
    const scored = roles.map(role => {
      const similarity = cosineSimilarity(userVector, role.vector);
      const matchPercentage = Math.round(similarity * 100);
      console.log(`Role: ${role.name}, Similarity: ${similarity}, Match: ${matchPercentage}%`); // Debug log
      
      return {
        id: role._id,
        name: role.name,
        description: role.description,
        matchPercentage: matchPercentage,
        skills: role.skills,
        roadmap: role.roadmap,
        detailedRoadmap: role.detailedRoadmap,
        averageSalary: role.averageSalary,
        jobGrowth: role.jobGrowth
      };
    });
    
    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const top6 = scored.slice(0, 6); // Return top 6 instead of 3
    
    res.status(200).json({ 
      recommendations: top6, 
      userId: req.user.id, 
      timestamp: new Date().toISOString(),
      debug: {
        userVector: userVector,
        totalRoles: roles.length,
        scoreRange: {
          min: Math.min(...scored.map(s => s.matchPercentage)),
          max: Math.max(...scored.map(s => s.matchPercentage))
        }
      }
    });
  } catch (err) {
    console.error('Recommendations error:', err);
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

// Get all careers with match scores for authenticated users
exports.getAllCareersWithScores = async (req, res) => {
  try {
    const quizResult = await QuizResult.findOne({ user: req.user.id }).sort({ timestamp: -1 });
    if (!quizResult) {
      return res.status(404).json({ message: 'No quiz result found. Please take the quiz first.' });
    }
    
    const userVector = quizResult.answers.map(a => a.score);
    const roles = await CareerRole.find({});
    
    const scored = roles.map(role => {
      const similarity = cosineSimilarity(userVector, role.vector);
      const matchPercentage = Math.round(similarity * 100);
      
      return {
        id: role._id,
        name: role.name,
        description: role.description,
        matchPercentage: matchPercentage,
        skills: role.skills,
        roadmap: role.roadmap,
        detailedRoadmap: role.detailedRoadmap,
        averageSalary: role.averageSalary,
        jobGrowth: role.jobGrowth
      };
    });
    
    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    res.status(200).json({ 
      careers: scored,
      userId: req.user.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Get all careers with scores error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Debug endpoint to check quiz results and calculations
exports.debugQuizResults = async (req, res) => {
  try {
    const quizResult = await QuizResult.findOne({ user: req.user.id }).sort({ timestamp: -1 });
    if (!quizResult) {
      return res.status(404).json({ message: 'No quiz result found.' });
    }
    
    const userVector = quizResult.answers.map(a => a.score);
    const roles = await CareerRole.find({});
    
    const debugData = {
      userId: req.user.id,
      quizResult: {
        id: quizResult._id,
        timestamp: quizResult.timestamp,
        answers: quizResult.answers,
        userVector: userVector
      },
      careerRoles: roles.map(role => ({
        name: role.name,
        vector: role.vector,
        similarity: cosineSimilarity(userVector, role.vector),
        matchPercentage: Math.round(cosineSimilarity(userVector, role.vector) * 100)
      })),
      analysis: {
        userVectorSum: userVector.reduce((a, b) => a + b, 0),
        userVectorAvg: userVector.reduce((a, b) => a + b, 0) / userVector.length,
        userVectorMin: Math.min(...userVector),
        userVectorMax: Math.max(...userVector),
        totalRoles: roles.length
      }
    };
    
    res.status(200).json(debugData);
  } catch (err) {
    console.error('Debug quiz results error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 