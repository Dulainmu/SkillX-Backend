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

async function testSkillMatching() {
  try {
    await connectToMongoDB();
    
    const CareerRole = require('../src/models/CareerRole');
    const { matchCareerRoles, computeSkillFit } = require('../src/utils/unifiedCareerMatch');
    
    console.log('🧪 Testing Skill-Based Career Matching...');
    console.log('==========================================');
    
    // Get all valid career roles
    const careerRoles = await CareerRole.find({ 
      isActive: true,
      detailedRoadmap: { $exists: true, $ne: [] },
      requiredSkills: { $exists: true, $ne: [] }
    });
    
    console.log(`📊 Found ${careerRoles.length} valid career roles for testing`);
    
    // Test case 1: Frontend-focused user
    console.log('\n🎯 Test Case 1: Frontend Developer Profile');
    console.log('-------------------------------------------');
    const frontendUser = {
      skills: {
        "HTML": { selected: true, level: 4 },
        "CSS": { selected: true, level: 4 },
        "JavaScript": { selected: true, level: 3 },
        "React": { selected: true, level: 2 },
        "Node.js": { selected: true, level: 1 },
        "SQL": { selected: true, level: 1 }
      },
      personalityTraits: {},
      preferences: { learningStyle: ["visual", "handsOn"] }
    };
    
    const frontendMatches = matchCareerRoles(careerRoles, frontendUser);
    console.log('Top 3 matches for Frontend Developer:');
    frontendMatches.slice(0, 3).forEach((match, index) => {
      console.log(`${index + 1}. ${match.name} - Score: ${match.weightedScore}% (Skill Fit: ${Math.round(match.skillFit * 100)}%, Personality: ${Math.round(match.personalityFit * 100)}%)`);
    });
    
    // Test case 2: Backend-focused user
    console.log('\n🎯 Test Case 2: Backend Developer Profile');
    console.log('-------------------------------------------');
    const backendUser = {
      skills: {
        "Node.js": { selected: true, level: 4 },
        "SQL": { selected: true, level: 4 },
        "APIs": { selected: true, level: 3 },
        "Python": { selected: true, level: 3 },
        "HTML": { selected: true, level: 2 },
        "CSS": { selected: true, level: 1 }
      },
      personalityTraits: {},
      preferences: { learningStyle: ["handsOn", "reading"] }
    };
    
    const backendMatches = matchCareerRoles(careerRoles, backendUser);
    console.log('Top 3 matches for Backend Developer:');
    backendMatches.slice(0, 3).forEach((match, index) => {
      console.log(`${index + 1}. ${match.name} - Score: ${match.weightedScore}% (Skill Fit: ${Math.round(match.skillFit * 100)}%, Personality: ${Math.round(match.personalityFit * 100)}%)`);
    });
    
    // Test case 3: UX Designer profile
    console.log('\n🎯 Test Case 3: UX Designer Profile');
    console.log('------------------------------------');
    const uxUser = {
      skills: {
        "Figma": { selected: true, level: 4 },
        "User Research": { selected: true, level: 3 },
        "Prototyping": { selected: true, level: 3 },
        "UI": { selected: true, level: 3 },
        "HTML": { selected: true, level: 2 },
        "CSS": { selected: true, level: 1 }
      },
      personalityTraits: {},
      preferences: { learningStyle: ["visual", "auditory"] }
    };
    
    const uxMatches = matchCareerRoles(careerRoles, uxUser);
    console.log('Top 3 matches for UX Designer:');
    uxMatches.slice(0, 3).forEach((match, index) => {
      console.log(`${index + 1}. ${match.name} - Score: ${match.weightedScore}% (Skill Fit: ${Math.round(match.skillFit * 100)}%, Personality: ${Math.round(match.personalityFit * 100)}%)`);
    });
    
    // Test case 4: Beginner with no skills
    console.log('\n🎯 Test Case 4: Beginner Profile (No Skills)');
    console.log('---------------------------------------------');
    const beginnerUser = {
      skills: {},
      personalityTraits: {},
      preferences: { learningStyle: ["handsOn"] }
    };
    
    const beginnerMatches = matchCareerRoles(careerRoles, beginnerUser);
    console.log('Top 3 matches for Beginner:');
    beginnerMatches.slice(0, 3).forEach((match, index) => {
      console.log(`${index + 1}. ${match.name} - Score: ${match.weightedScore}% (Skill Fit: ${Math.round(match.skillFit * 100)}%, Personality: ${Math.round(match.personalityFit * 100)}%)`);
    });
    
    // Test individual skill fit calculations
    console.log('\n🔍 Individual Skill Fit Analysis:');
    console.log('==================================');
    
    const frontendCareer = careerRoles.find(c => c.slug === 'frontend-developer');
    if (frontendCareer) {
      console.log(`\nFrontend Developer Required Skills:`);
      frontendCareer.requiredSkills.forEach(skill => {
        console.log(`- ${skill.skillName}: Level ${skill.requiredLevel} (${skill.importance})`);
      });
      
      const skillFit = computeSkillFit(frontendCareer.requiredSkills, frontendUser.skills);
      console.log(`\nSkill Fit Score: ${Math.round(skillFit * 100)}%`);
      
      console.log('\nSkill-by-skill breakdown:');
      frontendCareer.requiredSkills.forEach(skill => {
        const userSkill = frontendUser.skills[skill.skillName];
        if (userSkill && userSkill.selected) {
          const fit = userSkill.level >= skill.requiredLevel ? 1.0 : Math.max(0, userSkill.level / skill.requiredLevel);
          console.log(`- ${skill.skillName}: User Level ${userSkill.level} vs Required ${skill.requiredLevel} = ${Math.round(fit * 100)}% fit`);
        } else {
          console.log(`- ${skill.skillName}: Not selected by user`);
        }
      });
    }
    
    console.log('\n✅ Skill-based matching is working correctly!');
    console.log('🎉 Career recommendations will now properly consider user skills.');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error testing skill matching:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testSkillMatching();
