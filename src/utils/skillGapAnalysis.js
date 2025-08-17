/**
 * Skill Gap Analysis Utility
 * Compares user's current skill levels with career requirements
 * and provides detailed improvement recommendations
 */

/**
 * Analyze skill gaps for a specific career role
 * @param {Object} careerRole - Career role with requiredSkills
 * @param {Object} userSkills - User's current skills {skillName: {level, selected}}
 * @returns {Object} Detailed gap analysis
 */
function analyzeSkillGaps(careerRole, userSkills) {
  if (!careerRole.requiredSkills || !Array.isArray(careerRole.requiredSkills)) {
    return {
      careerName: careerRole.name,
      totalSkills: 0,
      skillsAnalyzed: 0,
      skillsMet: 0,
      skillsNeedingImprovement: 0,
      skillsMissing: 0,
      overallProgress: 0,
      skillDetails: [],
      recommendations: []
    };
  }

  const skillDetails = [];
  let skillsMet = 0;
  let skillsNeedingImprovement = 0;
  let skillsMissing = 0;
  let totalSkillLevels = 0;
  let currentSkillLevels = 0;

  careerRole.requiredSkills.forEach(requiredSkill => {
    const userSkill = userSkills[requiredSkill.skillName];
    const requiredLevel = requiredSkill.requiredLevel || 1;
    const importance = requiredSkill.importance || 'medium';
    
    totalSkillLevels += requiredLevel;
    
    if (!userSkill || !userSkill.selected) {
      // Skill is missing
      skillsMissing++;
      skillDetails.push({
        skillName: requiredSkill.skillName,
        requiredLevel: requiredLevel,
        currentLevel: 0,
        levelsNeeded: requiredLevel,
        status: 'missing',
        importance: importance,
        priority: getPriorityScore(importance, requiredLevel),
        recommendation: `Start learning ${requiredSkill.skillName} from the basics`
      });
    } else {
      const currentLevel = userSkill.level || 0;
      currentSkillLevels += Math.min(currentLevel, requiredLevel);
      
      if (currentLevel >= requiredLevel) {
        // Skill requirement met
        skillsMet++;
        skillDetails.push({
          skillName: requiredSkill.skillName,
          requiredLevel: requiredLevel,
          currentLevel: currentLevel,
          levelsNeeded: 0,
          status: 'met',
          importance: importance,
          priority: 0,
          recommendation: `Great! You've mastered ${requiredSkill.skillName}`
        });
      } else {
        // Skill needs improvement
        skillsNeedingImprovement++;
        const levelsNeeded = requiredLevel - currentLevel;
        skillDetails.push({
          skillName: requiredSkill.skillName,
          requiredLevel: requiredLevel,
          currentLevel: currentLevel,
          levelsNeeded: levelsNeeded,
          status: 'needs_improvement',
          importance: importance,
          priority: getPriorityScore(importance, levelsNeeded),
          recommendation: `Improve ${requiredSkill.skillName} by ${levelsNeeded} level(s)`
        });
      }
    }
  });

  const overallProgress = totalSkillLevels > 0 ? (currentSkillLevels / totalSkillLevels) * 100 : 0;
  
  // Sort skills by priority (missing skills first, then by importance and levels needed)
  skillDetails.sort((a, b) => {
    if (a.status === 'missing' && b.status !== 'missing') return -1;
    if (b.status === 'missing' && a.status !== 'missing') return 1;
    return b.priority - a.priority;
  });

  // Generate recommendations
  const recommendations = generateRecommendations(skillDetails, careerRole.name);

  return {
    careerName: careerRole.name,
    totalSkills: careerRole.requiredSkills.length,
    skillsAnalyzed: skillDetails.length,
    skillsMet: skillsMet,
    skillsNeedingImprovement: skillsNeedingImprovement,
    skillsMissing: skillsMissing,
    overallProgress: Math.round(overallProgress),
    skillDetails: skillDetails,
    recommendations: recommendations,
    estimatedTimeToComplete: estimateTimeToComplete(skillDetails)
  };
}

/**
 * Analyze skill gaps for multiple career roles
 * @param {Array} careerRoles - Array of career roles
 * @param {Object} userSkills - User's current skills
 * @returns {Array} Gap analysis for each career role
 */
function analyzeMultipleCareerGaps(careerRoles, userSkills) {
  return careerRoles.map(careerRole => ({
    ...analyzeSkillGaps(careerRole, userSkills),
    careerId: careerRole._id,
    careerSlug: careerRole.slug
  })).sort((a, b) => b.overallProgress - a.overallProgress);
}

/**
 * Get priority score for skill improvement
 * @param {string} importance - Skill importance (high/medium/low)
 * @param {number} levelsNeeded - Number of levels needed
 * @returns {number} Priority score
 */
function getPriorityScore(importance, levelsNeeded) {
  const importanceMultiplier = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  return (importanceMultiplier[importance] || 2) * levelsNeeded;
}

/**
 * Generate personalized recommendations
 * @param {Array} skillDetails - Detailed skill analysis
 * @param {string} careerName - Career role name
 * @returns {Array} List of recommendations
 */
function generateRecommendations(skillDetails, careerName) {
  const recommendations = [];
  
  // Count skills by status
  const missingSkills = skillDetails.filter(s => s.status === 'missing');
  const improvementSkills = skillDetails.filter(s => s.status === 'needs_improvement');
  const masteredSkills = skillDetails.filter(s => s.status === 'met');
  
  // Overall progress recommendation
  if (masteredSkills.length === skillDetails.length) {
    recommendations.push({
      type: 'success',
      message: `🎉 Congratulations! You've mastered all skills for ${careerName}`,
      priority: 'high'
    });
  } else if (missingSkills.length > improvementSkills.length) {
    recommendations.push({
      type: 'focus',
      message: `Focus on learning ${missingSkills.length} new skills first, then improve existing ones`,
      priority: 'high'
    });
  } else {
    recommendations.push({
      type: 'improve',
      message: `Focus on improving ${improvementSkills.length} existing skills`,
      priority: 'high'
    });
  }
  
  // High priority skills
  const highPrioritySkills = skillDetails
    .filter(s => s.status !== 'met' && s.importance === 'high')
    .slice(0, 3);
    
  if (highPrioritySkills.length > 0) {
    recommendations.push({
      type: 'priority',
      message: `Prioritize these high-importance skills: ${highPrioritySkills.map(s => s.skillName).join(', ')}`,
      priority: 'high'
    });
  }
  
  // Quick wins (skills needing only 1 level improvement)
  const quickWins = skillDetails.filter(s => s.status === 'needs_improvement' && s.levelsNeeded === 1);
  if (quickWins.length > 0) {
    recommendations.push({
      type: 'quick_win',
      message: `Quick wins: ${quickWins.length} skills need only 1 level improvement`,
      priority: 'medium'
    });
  }
  
  return recommendations;
}

/**
 * Estimate time to complete skill requirements
 * @param {Array} skillDetails - Detailed skill analysis
 * @returns {Object} Time estimation
 */
function estimateTimeToComplete(skillDetails) {
  const missingSkills = skillDetails.filter(s => s.status === 'missing');
  const improvementSkills = skillDetails.filter(s => s.status === 'needs_improvement');
  
  // Rough estimates (in weeks)
  const timePerNewSkill = 4; // 4 weeks to learn a new skill from scratch
  const timePerLevel = 2; // 2 weeks per skill level improvement
  
  const totalWeeks = (missingSkills.length * timePerNewSkill) + 
                    (improvementSkills.reduce((sum, skill) => sum + skill.levelsNeeded, 0) * timePerLevel);
  
  const months = Math.ceil(totalWeeks / 4);
  const weeks = totalWeeks % 4;
  
  return {
    totalWeeks: totalWeeks,
    months: months,
    weeks: weeks,
    description: `${months} month${months !== 1 ? 's' : ''}${weeks > 0 ? ` and ${weeks} week${weeks !== 1 ? 's' : ''}` : ''}`
  };
}

/**
 * Get skill improvement roadmap
 * @param {Object} gapAnalysis - Skill gap analysis result
 * @returns {Array} Structured roadmap
 */
function generateSkillRoadmap(gapAnalysis) {
  const roadmap = [];
  
  // Phase 1: High priority missing skills
  const highPriorityMissing = gapAnalysis.skillDetails
    .filter(s => s.status === 'missing' && s.importance === 'high');
  
  if (highPriorityMissing.length > 0) {
    roadmap.push({
      phase: 1,
      title: 'Foundation Skills',
      description: 'Learn essential high-priority skills',
      skills: highPriorityMissing,
      estimatedWeeks: highPriorityMissing.length * 4
    });
  }
  
  // Phase 2: Other missing skills
  const otherMissing = gapAnalysis.skillDetails
    .filter(s => s.status === 'missing' && s.importance !== 'high');
  
  if (otherMissing.length > 0) {
    roadmap.push({
      phase: 2,
      title: 'Additional Skills',
      description: 'Learn remaining required skills',
      skills: otherMissing,
      estimatedWeeks: otherMissing.length * 4
    });
  }
  
  // Phase 3: Skill improvements
  const improvements = gapAnalysis.skillDetails
    .filter(s => s.status === 'needs_improvement')
    .sort((a, b) => b.priority - a.priority);
  
  if (improvements.length > 0) {
    roadmap.push({
      phase: 3,
      title: 'Skill Enhancement',
      description: 'Improve existing skills to required levels',
      skills: improvements,
      estimatedWeeks: improvements.reduce((sum, skill) => sum + skill.levelsNeeded, 0) * 2
    });
  }
  
  return roadmap;
}

module.exports = {
  analyzeSkillGaps,
  analyzeMultipleCareerGaps,
  generateSkillRoadmap,
  estimateTimeToComplete
};
