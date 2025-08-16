const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

async function createTestCareerRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    // Find existing career roles and update them
    const existingRoles = await CareerRole.find({});
    console.log(`📊 Found ${existingRoles.length} existing career roles`);
    
    for (const role of existingRoles) {
      // Update with proper data
      const updatedData = {
        isActive: true,
        requiredSkills: [
          {
            skillId: 'javascript',
            skillName: 'JavaScript',
            requiredLevel: 3,
            importance: 'essential'
          },
          {
            skillId: 'react',
            skillName: 'React',
            requiredLevel: 2,
            importance: 'important'
          },
          {
            skillId: 'css',
            skillName: 'CSS',
            requiredLevel: 3,
            importance: 'essential'
          }
        ],
        detailedRoadmap: [
          {
            id: 'step-1',
            title: 'Web Foundations',
            description: 'Learn HTML, CSS, and JavaScript basics',
            skills: ['HTML', 'CSS', 'JavaScript'],
            estimatedTime: '2 weeks',
            xpReward: 200,
            projects: [
              {
                id: 'proj-1',
                title: 'Personal Portfolio',
                description: 'Build a portfolio website',
                difficulty: 'Beginner',
                estimatedTime: '1 week',
                skills: ['HTML', 'CSS', 'JavaScript'],
                xpReward: 100
              }
            ]
          }
        ]
      };
      
      await CareerRole.findByIdAndUpdate(role._id, updatedData, { new: true });
      console.log(`✅ Updated: ${role.name}`);
    }
    
    await mongoose.disconnect();
    console.log('✅ Script completed!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestCareerRoles();
