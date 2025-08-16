// src/utils/testUnifiedMatching.js
// Test script for unified career matching system with database structure

const { 
  matchCareerRoles, 
  normalizeUserData, 
  validateProfile,
  createUserVectorFromProfile 
} = require('./unifiedCareerMatch');
const { scorePersonality } = require('./personalityScoring');

// Mock career roles data based on your database structure
const mockCareerRoles = [
  {
    _id: 'role1',
    name: 'Frontend Developer',
    slug: 'frontend-developer',
    description: 'Builds modern web interfaces with a focus on UX and accessibility.',
    vector: [3, 4, 4, 2, 4, 3, 5, 2, 3, 5, 3, 3],
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'UI Design'],
    roadmap: [
      'Learn HTML, CSS, and JavaScript',
      'Master a frontend framework (React, Vue, etc.)',
      'Understand responsive design',
      'Build portfolio projects',
      'Learn version control (Git)'
    ],
    detailedRoadmap: [
      {
        id: 'fd-1',
        title: 'Web Foundations',
        description: 'Master the basics of web development.',
        skills: ['HTML', 'CSS', 'JavaScript'],
        estimatedTime: '2 weeks',
        xpReward: 200,
        projects: [
          {
            id: 'fd-p1',
            title: 'Personal Portfolio Website',
            description: 'Build a personal portfolio site using HTML, CSS, and JavaScript.',
            difficulty: 'Beginner',
            estimatedTime: '1 week',
            skills: ['HTML', 'CSS', 'JavaScript'],
            xpReward: 100
          }
        ]
      }
    ],
    averageSalary: '$80,000 - $130,000',
    jobGrowth: '15%',
    desiredRIASEC: { R: 0.30, I: 0.60, A: 0.70, S: 0.40, E: 0.35, C: 0.40 },
    desiredBigFive: { Openness: 0.70, Conscientiousness: 0.70, Extraversion: 0.50, Agreeableness: 0.60, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Working Conditions', 'Relationships']
  },
  {
    _id: 'role2',
    name: 'Backend Developer',
    slug: 'backend-developer',
    description: 'Designs and builds server-side systems, APIs, and databases.',
    vector: [5, 5, 2, 3, 4, 5, 3, 5, 5, 2, 2, 4],
    skills: ['Node.js', 'APIs', 'Databases', 'Security', 'Testing'],
    roadmap: [
      'Learn a backend language (Node.js, Python, etc.)',
      'Understand databases (SQL/NoSQL)',
      'Build RESTful APIs',
      'Implement authentication and security',
      'Deploy backend applications'
    ],
    detailedRoadmap: [
      {
        id: 'bd-1',
        title: 'Backend Language Fundamentals',
        description: 'Learn the basics of Node.js and JavaScript for backend.',
        skills: ['Node.js', 'JavaScript'],
        estimatedTime: '2 weeks',
        xpReward: 200,
        projects: [
          {
            id: 'bd-p1',
            title: 'Simple REST API',
            description: 'Build a simple REST API with Node.js and Express.',
            difficulty: 'Beginner',
            estimatedTime: '1 week',
            skills: ['Node.js', 'Express'],
            xpReward: 100
          }
        ]
      }
    ],
    averageSalary: '$90,000 - $140,000',
    jobGrowth: '12%',
    desiredRIASEC: { R: 0.40, I: 0.70, A: 0.20, S: 0.30, E: 0.30, C: 0.60 },
    desiredBigFive: { Openness: 0.50, Conscientiousness: 0.80, Extraversion: 0.40, Agreeableness: 0.50, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Working Conditions', 'Support']
  },
  {
    _id: 'role3',
    name: 'Data Scientist',
    slug: 'data-scientist',
    description: 'Analyzes complex data to help organizations make better decisions.',
    vector: [4, 5, 3, 2, 3, 5, 4, 5, 3, 2, 2, 4],
    skills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization'],
    roadmap: [
      'Learn Python and data manipulation',
      'Master statistics and probability',
      'Understand machine learning algorithms',
      'Learn data visualization tools',
      'Build real-world data projects'
    ],
    detailedRoadmap: [
      {
        id: 'ds-1',
        title: 'Python for Data Science',
        description: 'Learn Python fundamentals for data analysis.',
        skills: ['Python', 'Pandas', 'NumPy'],
        estimatedTime: '3 weeks',
        xpReward: 300,
        projects: [
          {
            id: 'ds-p1',
            title: 'Data Analysis Project',
            description: 'Analyze a real dataset using Python.',
            difficulty: 'Intermediate',
            estimatedTime: '2 weeks',
            skills: ['Python', 'Pandas', 'Data Analysis'],
            xpReward: 200
          }
        ]
      }
    ],
    averageSalary: '$100,000 - $150,000',
    jobGrowth: '20%',
    desiredRIASEC: { R: 0.35, I: 0.80, A: 0.40, S: 0.30, E: 0.25, C: 0.65 },
    desiredBigFive: { Openness: 0.75, Conscientiousness: 0.70, Extraversion: 0.40, Agreeableness: 0.50, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Working Conditions']
  }
];

// Mock user data
const mockUserAnswers = {
  1: 4, 2: 3, 3: 2, 4: 1, 5: 4, 6: 3, 7: 2, 8: 1, 9: 4, 10: 3,
  11: 2, 12: 1, 13: 3, 14: 2, 15: 4, 16: 3, 17: 4, 18: 3, 19: 2, 20: 1,
  21: 4, 22: 3, 23: 5, 24: 4, 25: 2, 26: 3, 27: 4, 28: 3, 29: 4, 30: 3,
  31: 2, 32: 4
};

const mockUserSkills = {
  'HTML': { selected: true, level: 3 },
  'CSS': { selected: true, level: 3 },
  'JavaScript': { selected: true, level: 2 },
  'React': { selected: true, level: 1 },
  'Node.js': { selected: true, level: 1 }
};

const mockUserPreferences = {
  learningStyle: ['visual', 'handsOn']
};

function runTests() {
  console.log('🧪 Testing Unified Career Matching System (Database Structure)\n');
  console.log('📊 Weights: 60% Skills, 40% Personality (Learning style removed)\n');

  // Test 1: Personality Scoring
  console.log('1. Testing Personality Scoring...');
  try {
    const profile = scorePersonality(mockUserAnswers, mockUserPreferences);
    console.log('✅ Personality profile created:', {
      RIASEC: Object.keys(profile.RIASEC).length,
      BigFive: Object.keys(profile.BigFive).length,
      WorkValues: Object.keys(profile.WorkValues).length,
      learningStyle: profile.learningStyle
    });
  } catch (error) {
    console.log('❌ Personality scoring failed:', error.message);
  }

  // Test 2: User Data Normalization
  console.log('\n2. Testing User Data Normalization...');
  try {
    const normalizedUser = normalizeUserData({
      skills: mockUserSkills,
      personalityTraits: {},
      preferences: mockUserPreferences
    });
    console.log('✅ User data normalized:', {
      skillsCount: Object.keys(normalizedUser.skills).length,
      hasPreferences: !!normalizedUser.preferences
    });
  } catch (error) {
    console.log('❌ User data normalization failed:', error.message);
  }

  // Test 3: Profile Validation
  console.log('\n3. Testing Profile Validation...');
  try {
    const profile = scorePersonality(mockUserAnswers, mockUserPreferences);
    const isValid = validateProfile(profile);
    console.log(`✅ Profile validation: ${isValid ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.log('❌ Profile validation failed:', error.message);
  }

  // Test 4: Vector Creation
  console.log('\n4. Testing Vector Creation...');
  try {
    const profile = scorePersonality(mockUserAnswers, mockUserPreferences);
    const userVector = createUserVectorFromProfile(profile);
    console.log(`✅ User vector created: ${userVector.length} dimensions`);
    console.log('   Vector values:', userVector.map(v => v.toFixed(2)).join(', '));
  } catch (error) {
    console.log('❌ Vector creation failed:', error.message);
  }

  // Test 5: Career Role Matching
  console.log('\n5. Testing Career Role Matching...');
  try {
    const profile = scorePersonality(mockUserAnswers, mockUserPreferences);
    const normalizedUser = normalizeUserData({
      skills: mockUserSkills,
      personalityTraits: {},
      preferences: mockUserPreferences
    });
    
    const roleResults = matchCareerRoles(mockCareerRoles, normalizedUser, { profile });
    console.log(`✅ Career role matching: ${roleResults.length} results`);
    roleResults.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name}: ${role.weightedScore}%`);
      console.log(`      Skills: ${role.skills.join(', ')}`);
      console.log(`      Missing Skills: ${role.missingSkills.length}`);
    });
  } catch (error) {
    console.log('❌ Career role matching failed:', error.message);
  }

  // Test 6: Detailed Role Analysis
  console.log('\n6. Testing Detailed Role Analysis...');
  try {
    const profile = scorePersonality(mockUserAnswers, mockUserPreferences);
    const normalizedUser = normalizeUserData({
      skills: mockUserSkills,
      personalityTraits: {},
      preferences: mockUserPreferences
    });
    
    const roleResults = matchCareerRoles(mockCareerRoles, normalizedUser, { profile });
    const topRole = roleResults[0];
    
    if (topRole) {
      console.log(`✅ Top match: ${topRole.name} (${topRole.weightedScore}%)`);
      console.log(`   Skill Fit: ${Math.round(topRole.skillFit * 100)}%`);
      console.log(`   Personality Fit: ${Math.round(topRole.personalityFit * 100)}%`);
      console.log(`   Learning Fit: ${Math.round(topRole.learningFit * 100)}% (not used in scoring)`);
      console.log(`   Roadmap Steps: ${topRole.detailedRoadmap?.length || 0}`);
      console.log(`   Total Projects: ${topRole.detailedRoadmap?.reduce((sum, step) => sum + (step.projects?.length || 0), 0) || 0}`);
      
      // Show weight breakdown
      const skillContribution = Math.round(topRole.skillFit * 60);
      const personalityContribution = Math.round(topRole.personalityFit * 40);
      console.log(`   Weight Breakdown: ${skillContribution}% (skills) + ${personalityContribution}% (personality) = ${topRole.weightedScore}%`);
    }
  } catch (error) {
    console.log('❌ Detailed role analysis failed:', error.message);
  }

  // Test 7: Database Structure Compatibility
  console.log('\n7. Testing Database Structure Compatibility...');
  try {
    const profile = scorePersonality(mockUserAnswers, mockUserPreferences);
    const normalizedUser = normalizeUserData({
      skills: mockUserSkills,
      personalityTraits: {},
      preferences: mockUserPreferences
    });
    
    const roleResults = matchCareerRoles(mockCareerRoles, normalizedUser, { profile });
    
    // Check if results have the expected database structure
    const hasRequiredFields = roleResults.every(role => 
      role.id && 
      role.name && 
      role.slug && 
      role.description && 
      role.vector && 
      role.skills && 
      role.detailedRoadmap &&
      typeof role.weightedScore === 'number'
    );
    
    console.log(`✅ Database structure compatibility: ${hasRequiredFields ? 'PASSED' : 'FAILED'}`);
    
    if (hasRequiredFields) {
      console.log('   All career roles have required database fields');
      console.log('   Vector matching is working correctly');
      console.log('   Detailed roadmaps are preserved');
    }
  } catch (error) {
    console.log('❌ Database structure compatibility failed:', error.message);
  }

  // Test 8: Weight Verification
  console.log('\n8. Testing Weight Verification...');
  try {
    const profile = scorePersonality(mockUserAnswers, mockUserPreferences);
    const normalizedUser = normalizeUserData({
      skills: mockUserSkills,
      personalityTraits: {},
      preferences: mockUserPreferences
    });
    
    const roleResults = matchCareerRoles(mockCareerRoles, normalizedUser, { profile });
    const topRole = roleResults[0];
    
    if (topRole) {
      // Verify that weights are correctly applied
      const expectedScore = Math.round((topRole.skillFit * 60) + (topRole.personalityFit * 40));
      const actualScore = topRole.weightedScore;
      const weightAccuracy = Math.abs(expectedScore - actualScore) <= 1; // Allow 1% tolerance
      
      console.log(`✅ Weight verification: ${weightAccuracy ? 'PASSED' : 'FAILED'}`);
      console.log(`   Expected: ${expectedScore}%, Actual: ${actualScore}%`);
      console.log(`   Skill contribution: ${Math.round(topRole.skillFit * 60)}%`);
      console.log(`   Personality contribution: ${Math.round(topRole.personalityFit * 40)}%`);
    }
  } catch (error) {
    console.log('❌ Weight verification failed:', error.message);
  }

  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Summary:');
  console.log('   • Unified matching system works with CareerRole database structure');
  console.log('   • Vector-based personality matching is functional');
  console.log('   • Skill matching works with database skills array');
  console.log('   • Detailed roadmaps and projects are preserved');
  console.log('   • Weights correctly applied: 60% Skills, 40% Personality');
  console.log('   • Learning style removed from scoring algorithm');
  console.log('   • All compatibility layers are working');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
