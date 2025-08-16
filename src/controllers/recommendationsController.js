const QuizResult = require('../models/QuizResult');
const CareerRole = require('../models/CareerRole');
const LearningMaterial = require('../models/LearningMaterial');
const { matchCareerRoles, normalizeUserData, validateProfile, createUserVectorFromProfile, getCareerRolesFromDatabase } = require('../utils/unifiedCareerMatch');
const { scorePersonality } = require('../utils/personalityScoring');

exports.getRecommendations = async (req, res) => {
  try {
    const quizResult = await QuizResult.findOne({ user: req.user.id }).sort({ timestamp: -1 });
    if (!quizResult) {
      return res.status(404).json({ message: 'No quiz result found.' });
    }
    
    // Handle both legacy answers array and new answers schema
    let userAnswers = {};
    if (Array.isArray(quizResult.answers)) {
      // Convert array format to object format
      quizResult.answers.forEach(answer => {
        userAnswers[answer.questionId] = answer.score;
      });
    } else if (quizResult.answers && typeof quizResult.answers === 'object') {
      userAnswers = quizResult.answers;
    } else {
      return res.status(404).json({ message: 'No quiz answers found for this user.' });
    }
    
    console.log('User answers:', userAnswers); // Debug log
    
    // Compute personality profile from quiz answers
    let profile = null;
    try {
      profile = scorePersonality(userAnswers, {});
      console.log('Personality profile computed:', {
        RIASEC: Object.keys(profile.RIASEC).length,
        BigFive: Object.keys(profile.BigFive).length,
        WorkValues: Object.keys(profile.WorkValues).length
      });
    } catch (profileError) {
      console.error('Personality scoring failed:', profileError);
      return res.status(500).json({ message: 'Failed to process personality assessment' });
    }
    
    // Validate profile completeness
    if (!validateProfile(profile)) {
      console.warn('Incomplete profile, using fallback values');
    }
    
    // Load career roles from database
    const careerRoles = await getCareerRolesFromDatabase(CareerRole);
    console.log(`Loaded ${careerRoles.length} career roles from database`);
    
    // Check if we have any valid career roles
    if (careerRoles.length === 0) {
      console.error('No valid career roles found in database for recommendations');
      return res.status(404).json({ 
        message: 'No career paths available', 
        error: 'No career paths found',
        details: 'No career paths have been properly set up in the admin panel. Please contact an administrator to set up career paths with required skills and roadmaps.',
        debug: {
          totalRolesInDB: 0,
          validRoles: 0,
          reason: 'No career roles with required skills and roadmaps found'
        }
      });
    }
    
    // Create normalized user object for unified matching
    const normalizedUser = normalizeUserData({
      skills: {}, // No skills data in this endpoint
      personalityTraits: {},
      preferences: { learningStyle: profile.learningStyle || [] }
    });
    
    // Use unified matching system
    const ranked = matchCareerRoles(careerRoles, normalizedUser, { profile });
    
    // Load learning content and format results
    const scored = await Promise.all(ranked.slice(0, 6).map(async (match) => {
      const skills = match.skills || [];
      
      // Load learning content for skills
      const learningContent = await LearningMaterial.find({ skill: { $in: skills } });
      
      return {
        id: match.id,
        name: match.name,
        description: match.description,
        matchPercentage: match.weightedScore || 0,
        skills: skills,
        learningContent,
        roadmap: match.roadmap || [],
        detailedRoadmap: match.detailedRoadmap || [],
        averageSalary: match.averageSalary,
        jobGrowth: match.jobGrowth,
        source: 'database'
      };
    }));
    
    res.status(200).json({ 
      recommendations: scored, 
      userId: req.user.id, 
      timestamp: new Date().toISOString(),
      debug: {
        profile: {
          RIASEC: Object.keys(profile.RIASEC).length,
          BigFive: Object.keys(profile.BigFive).length,
          WorkValues: Object.keys(profile.WorkValues).length
        },
        totalRoles: careerRoles.length,
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
    
    // Handle both legacy answers array and new answers schema
    let userAnswers = {};
    if (Array.isArray(quizResult.answers)) {
      quizResult.answers.forEach(answer => {
        userAnswers[answer.questionId] = answer.score;
      });
    } else if (quizResult.answers && typeof quizResult.answers === 'object') {
      userAnswers = quizResult.answers;
    } else {
      return res.status(404).json({ message: 'No quiz answers found for this user.' });
    }
    
    // Compute personality profile
    let profile = null;
    try {
      profile = scorePersonality(userAnswers, {});
    } catch (profileError) {
      console.error('Personality scoring failed:', profileError);
      return res.status(500).json({ message: 'Failed to process personality assessment' });
    }
    
    // Load career roles from database
    const careerRoles = await getCareerRolesFromDatabase(CareerRole);
    
    // Create normalized user object
    const normalizedUser = normalizeUserData({
      skills: {},
      personalityTraits: {},
      preferences: { learningStyle: profile.learningStyle || [] }
    });
    
    // Use unified matching system
    const ranked = matchCareerRoles(careerRoles, normalizedUser, { profile });
    
    const scored = ranked.map(match => ({
      id: match.id,
      name: match.name,
      description: match.description,
      matchPercentage: match.weightedScore || 0,
      skills: match.skills || [],
      roadmap: match.roadmap || [],
      detailedRoadmap: match.detailedRoadmap || [],
      averageSalary: match.averageSalary,
      jobGrowth: match.jobGrowth,
      source: 'database'
    }));
    
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
    
    // Handle both legacy answers array and new answers schema
    let userAnswers = {};
    if (Array.isArray(quizResult.answers)) {
      quizResult.answers.forEach(answer => {
        userAnswers[answer.questionId] = answer.score;
      });
    } else if (quizResult.answers && typeof quizResult.answers === 'object') {
      userAnswers = quizResult.answers;
    } else {
      return res.status(404).json({ message: 'No quiz answers found for this user.' });
    }
    
    // Compute personality profile
    let profile = null;
    try {
      profile = scorePersonality(userAnswers, {});
    } catch (profileError) {
      console.error('Personality scoring failed:', profileError);
      return res.status(500).json({ message: 'Failed to process personality assessment' });
    }
    
    // Create user vector for legacy compatibility
    const userVector = createUserVectorFromProfile(profile);
    
    const careerRoles = await CareerRole.find({});
    
    const debugData = {
      userId: req.user.id,
      quizResult: {
        id: quizResult._id,
        timestamp: quizResult.timestamp,
        answers: quizResult.answers,
        userAnswers: userAnswers,
        userVector: userVector
      },
      profile: {
        RIASEC: profile.RIASEC,
        BigFive: profile.BigFive,
        WorkValues: profile.WorkValues,
        learningStyle: profile.learningStyle
      },
      careerRoles: careerRoles.map(role => ({
        name: role.name,
        vector: role.vector,
        vectorLength: role.vector?.length || 0,
        skills: role.skills || []
      })),
      analysis: {
        userVectorSum: userVector.reduce((a, b) => a + b, 0),
        userVectorAvg: userVector.reduce((a, b) => a + b, 0) / userVector.length,
        userVectorMin: Math.min(...userVector),
        userVectorMax: Math.max(...userVector),
        totalRoles: careerRoles.length,
        profileValidation: validateProfile(profile)
      }
    };
    
    res.status(200).json(debugData);
  } catch (err) {
    console.error('Debug quiz results error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 