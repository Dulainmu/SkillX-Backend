const User = require('../models/User');
const CareerRole = require('../models/CareerRole');
const { analyzeSkillGaps, analyzeMultipleCareerGaps, generateSkillRoadmap } = require('../utils/skillGapAnalysis');

/**
 * Get skill gap analysis for a specific career role
 * @route GET /api/skill-gap/:careerSlug
 * @access Private
 */
const getSkillGapAnalysis = async (req, res) => {
  try {
    const { careerSlug } = req.params;
    const userId = req.user.id;

    // Get user with skills
    const user = await User.findById(userId).select('skills');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get career role
    const careerRole = await CareerRole.findOne({ 
      slug: careerSlug, 
      isActive: true 
    });
    
    if (!careerRole) {
      return res.status(404).json({ message: 'Career role not found' });
    }

    // Analyze skill gaps
    const gapAnalysis = analyzeSkillGaps(careerRole, user.skills || {});
    
    // Generate roadmap
    const roadmap = generateSkillRoadmap(gapAnalysis);

    res.json({
      success: true,
      data: {
        ...gapAnalysis,
        roadmap
      }
    });

  } catch (error) {
    console.error('Error in skill gap analysis:', error);
    res.status(500).json({ 
      message: 'Error analyzing skill gaps',
      error: error.message 
    });
  }
};

/**
 * Get skill gap analysis for all career roles
 * @route GET /api/skill-gap
 * @access Private
 */
const getAllCareerGapAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with skills
    const user = await User.findById(userId).select('skills');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active career roles
    const careerRoles = await CareerRole.find({ 
      isActive: true,
      requiredSkills: { $exists: true, $ne: [] }
    });

    // Analyze gaps for all careers
    const allGapAnalysis = analyzeMultipleCareerGaps(careerRoles, user.skills || {});

    res.json({
      success: true,
      data: {
        totalCareers: allGapAnalysis.length,
        userSkills: user.skills || {},
        careerGaps: allGapAnalysis
      }
    });

  } catch (error) {
    console.error('Error in all career gap analysis:', error);
    res.status(500).json({ 
      message: 'Error analyzing career gaps',
      error: error.message 
    });
  }
};

/**
 * Get detailed skill improvement plan for a career
 * @route GET /api/skill-gap/:careerSlug/roadmap
 * @access Private
 */
const getSkillRoadmap = async (req, res) => {
  try {
    const { careerSlug } = req.params;
    const userId = req.user.id;

    // Get user with skills
    const user = await User.findById(userId).select('skills');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get career role
    const careerRole = await CareerRole.findOne({ 
      slug: careerSlug, 
      isActive: true 
    });
    
    if (!careerRole) {
      return res.status(404).json({ message: 'Career role not found' });
    }

    // Analyze skill gaps
    const gapAnalysis = analyzeSkillGaps(careerRole, user.skills || {});
    
    // Generate detailed roadmap
    const roadmap = generateSkillRoadmap(gapAnalysis);

    res.json({
      success: true,
      data: {
        careerName: careerRole.name,
        careerSlug: careerRole.slug,
        gapAnalysis,
        roadmap,
        estimatedTimeToComplete: gapAnalysis.estimatedTimeToComplete
      }
    });

  } catch (error) {
    console.error('Error in skill roadmap generation:', error);
    res.status(500).json({ 
      message: 'Error generating skill roadmap',
      error: error.message 
    });
  }
};

/**
 * Get skill gap summary for dashboard
 * @route GET /api/skill-gap/summary
 * @access Private
 */
const getSkillGapSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with skills
    const user = await User.findById(userId).select('skills');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active career roles
    const careerRoles = await CareerRole.find({ 
      isActive: true,
      requiredSkills: { $exists: true, $ne: [] }
    });

    // Analyze gaps for all careers
    const allGapAnalysis = analyzeMultipleCareerGaps(careerRoles, user.skills || {});

    // Calculate summary statistics
    const summary = {
      totalCareers: allGapAnalysis.length,
      totalSkillsNeeded: 0,
      totalSkillsMissing: 0,
      totalSkillsNeedingImprovement: 0,
      bestCareerMatch: allGapAnalysis[0] || null,
      topCareers: allGapAnalysis.slice(0, 3),
      skillDistribution: {
        mastered: 0,
        needsImprovement: 0,
        missing: 0
      }
    };

    allGapAnalysis.forEach(career => {
      summary.totalSkillsNeeded += career.totalSkills;
      summary.totalSkillsMissing += career.skillsMissing;
      summary.totalSkillsNeedingImprovement += career.skillsNeedingImprovement;
      
      career.skillDetails.forEach(skill => {
        if (skill.status === 'met') summary.skillDistribution.mastered++;
        else if (skill.status === 'needs_improvement') summary.skillDistribution.needsImprovement++;
        else summary.skillDistribution.missing++;
      });
    });

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error in skill gap summary:', error);
    res.status(500).json({ 
      message: 'Error generating skill gap summary',
      error: error.message 
    });
  }
};

module.exports = {
  getSkillGapAnalysis,
  getAllCareerGapAnalysis,
  getSkillRoadmap,
  getSkillGapSummary
};
