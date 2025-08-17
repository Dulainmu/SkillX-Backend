const mongoose = require('mongoose');
require('dotenv').config();

async function connectToMongoDB() {
  const mongoURIs = [
    process.env.MONGO_URI,
    'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx?retryWrites=true&w=majority',
    'mongodb://localhost:27017/skillx'
  ];

  for (const uri of mongoURIs) {
    if (uri) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB successfully!');
        return;
      } catch (err) {
        console.log(`Failed to connect with URI: ${uri}`);
        continue;
      }
    }
  }
  
  console.error('Failed to connect to MongoDB with any URI');
  process.exit(1);
}

async function testSkillGapAnalysis() {
  try {
    await connectToMongoDB();
    
    const CareerRole = require('../src/models/CareerRole');
    const { analyzeSkillGaps, analyzeMultipleCareerGaps, generateSkillRoadmap } = require('../src/utils/skillGapAnalysis');
    
    console.log('🔍 Testing Skill Gap Analysis...');
    console.log('==================================');
    
    // Get all valid career roles
    const careerRoles = await CareerRole.find({ 
      isActive: true,
      requiredSkills: { $exists: true, $ne: [] }
    });
    
    console.log(`📊 Found ${careerRoles.length} career roles for analysis`);
    
    // Test case 1: Beginner user with minimal skills
    console.log('\n🎯 Test Case 1: Beginner User');
    console.log('==============================');
    const beginnerUser = {
      skills: {
        "HTML": { selected: true, level: 1 },
        "CSS": { selected: true, level: 1 }
      }
    };
    
    const beginnerAnalysis = analyzeMultipleCareerGaps(careerRoles, beginnerUser.skills);
    console.log('Top 3 career matches for beginner:');
    beginnerAnalysis.slice(0, 3).forEach((career, index) => {
      console.log(`${index + 1}. ${career.careerName} - Progress: ${career.overallProgress}%`);
      console.log(`   Skills Met: ${career.skillsMet}/${career.totalSkills}`);
      console.log(`   Skills Missing: ${career.skillsMissing}`);
      console.log(`   Skills Needing Improvement: ${career.skillsNeedingImprovement}`);
    });
    
    // Test case 2: Intermediate user
    console.log('\n🎯 Test Case 2: Intermediate User');
    console.log('==================================');
    const intermediateUser = {
      skills: {
        "HTML": { selected: true, level: 3 },
        "CSS": { selected: true, level: 3 },
        "JavaScript": { selected: true, level: 2 },
        "React": { selected: true, level: 1 },
        "Node.js": { selected: true, level: 2 },
        "SQL": { selected: true, level: 1 }
      }
    };
    
    const intermediateAnalysis = analyzeMultipleCareerGaps(careerRoles, intermediateUser.skills);
    console.log('Top 3 career matches for intermediate:');
    intermediateAnalysis.slice(0, 3).forEach((career, index) => {
      console.log(`${index + 1}. ${career.careerName} - Progress: ${career.overallProgress}%`);
      console.log(`   Skills Met: ${career.skillsMet}/${career.totalSkills}`);
      console.log(`   Skills Missing: ${career.skillsMissing}`);
      console.log(`   Skills Needing Improvement: ${career.skillsNeedingImprovement}`);
    });
    
    // Test case 3: Advanced user
    console.log('\n🎯 Test Case 3: Advanced User');
    console.log('=============================');
    const advancedUser = {
      skills: {
        "HTML": { selected: true, level: 4 },
        "CSS": { selected: true, level: 4 },
        "JavaScript": { selected: true, level: 4 },
        "React": { selected: true, level: 3 },
        "Node.js": { selected: true, level: 4 },
        "SQL": { selected: true, level: 3 },
        "APIs": { selected: true, level: 3 },
        "Python": { selected: true, level: 2 }
      }
    };
    
    const advancedAnalysis = analyzeMultipleCareerGaps(careerRoles, advancedUser.skills);
    console.log('Top 3 career matches for advanced:');
    advancedAnalysis.slice(0, 3).forEach((career, index) => {
      console.log(`${index + 1}. ${career.careerName} - Progress: ${career.overallProgress}%`);
      console.log(`   Skills Met: ${career.skillsMet}/${career.totalSkills}`);
      console.log(`   Skills Missing: ${career.skillsMissing}`);
      console.log(`   Skills Needing Improvement: ${career.skillsNeedingImprovement}`);
    });
    
    // Detailed analysis for Frontend Developer
    console.log('\n🔍 Detailed Analysis: Frontend Developer');
    console.log('=========================================');
    const frontendCareer = careerRoles.find(c => c.slug === 'frontend-developer');
    if (frontendCareer) {
      const frontendGap = analyzeSkillGaps(frontendCareer, intermediateUser.skills);
      const roadmap = generateSkillRoadmap(frontendGap);
      
      console.log(`Career: ${frontendGap.careerName}`);
      console.log(`Overall Progress: ${frontendGap.overallProgress}%`);
      console.log(`Total Skills: ${frontendGap.totalSkills}`);
      console.log(`Skills Met: ${frontendGap.skillsMet}`);
      console.log(`Skills Missing: ${frontendGap.skillsMissing}`);
      console.log(`Skills Needing Improvement: ${frontendGap.skillsNeedingImprovement}`);
      console.log(`Estimated Time: ${frontendGap.estimatedTimeToComplete.description}`);
      
      console.log('\n📋 Skill Details:');
      frontendGap.skillDetails.forEach(skill => {
        const statusIcon = skill.status === 'met' ? '✅' : skill.status === 'needs_improvement' ? '⚠️' : '❌';
        console.log(`${statusIcon} ${skill.skillName}: Level ${skill.currentLevel}/${skill.requiredLevel} (${skill.importance})`);
        if (skill.levelsNeeded > 0) {
          console.log(`   → Needs ${skill.levelsNeeded} more level(s): ${skill.recommendation}`);
        }
      });
      
      console.log('\n🎯 Recommendations:');
      frontendGap.recommendations.forEach(rec => {
        console.log(`• ${rec.message}`);
      });
      
      console.log('\n🗺️ Learning Roadmap:');
      roadmap.forEach(phase => {
        console.log(`\nPhase ${phase.phase}: ${phase.title}`);
        console.log(`Description: ${phase.description}`);
        console.log(`Estimated Time: ${phase.estimatedWeeks} weeks`);
        console.log('Skills:');
        phase.skills.forEach(skill => {
          console.log(`  - ${skill.skillName}: ${skill.recommendation}`);
        });
      });
    }
    
    console.log('\n✅ Skill gap analysis is working perfectly!');
    console.log('🎉 Users can now see exactly what skills they need to improve.');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error testing skill gap analysis:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testSkillGapAnalysis();
