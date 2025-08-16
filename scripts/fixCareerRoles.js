const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

async function fixCareerRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    // Get existing career roles
    const existingRoles = await CareerRole.find({});
    console.log(`📊 Found ${existingRoles.length} career roles to fix`);
    
    for (const role of existingRoles) {
      console.log(`\n🔧 Fixing: ${role.name}`);
      
      // Define proper data for each career role
      let updateData = {};
      
      if (role.name === 'Frontend Developer') {
        updateData = {
          isActive: true,
          slug: 'frontend-developer',
          requiredSkills: [
            { skillId: 'javascript', skillName: 'JavaScript', requiredLevel: 3, importance: 'essential' },
            { skillId: 'react', skillName: 'React', requiredLevel: 2, importance: 'important' },
            { skillId: 'css', skillName: 'CSS', requiredLevel: 3, importance: 'essential' },
            { skillId: 'html', skillName: 'HTML', requiredLevel: 2, importance: 'essential' }
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
            },
            {
              id: 'step-2',
              title: 'Frontend Framework',
              description: 'Learn React and modern frontend development',
              skills: ['React', 'JavaScript', 'CSS'],
              estimatedTime: '3 weeks',
              xpReward: 300,
              projects: [
                {
                  id: 'proj-2',
                  title: 'Task Manager App',
                  description: 'Build a React task manager',
                  difficulty: 'Intermediate',
                  estimatedTime: '2 weeks',
                  skills: ['React', 'JavaScript'],
                  xpReward: 150
                }
              ]
            }
          ]
        };
      } else if (role.name === 'Backend Developer') {
        updateData = {
          isActive: true,
          slug: 'backend-developer',
          requiredSkills: [
            { skillId: 'javascript', skillName: 'JavaScript', requiredLevel: 3, importance: 'essential' },
            { skillId: 'nodejs', skillName: 'Node.js', requiredLevel: 2, importance: 'important' },
            { skillId: 'database', skillName: 'Database', requiredLevel: 3, importance: 'essential' },
            { skillId: 'api', skillName: 'API Design', requiredLevel: 2, importance: 'important' }
          ],
          detailedRoadmap: [
            {
              id: 'step-1',
              title: 'Backend Foundations',
              description: 'Learn Node.js and database fundamentals',
              skills: ['JavaScript', 'Node.js', 'Database'],
              estimatedTime: '3 weeks',
              xpReward: 250,
              projects: [
                {
                  id: 'proj-1',
                  title: 'REST API',
                  description: 'Build a REST API with Node.js',
                  difficulty: 'Intermediate',
                  estimatedTime: '2 weeks',
                  skills: ['Node.js', 'JavaScript'],
                  xpReward: 150
                }
              ]
            },
            {
              id: 'step-2',
              title: 'Database & Authentication',
              description: 'Learn database design and user authentication',
              skills: ['Database', 'Authentication', 'Security'],
              estimatedTime: '2 weeks',
              xpReward: 200,
              projects: [
                {
                  id: 'proj-2',
                  title: 'User Management System',
                  description: 'Build a user authentication system',
                  difficulty: 'Intermediate',
                  estimatedTime: '2 weeks',
                  skills: ['Database', 'Authentication'],
                  xpReward: 150
                }
              ]
            }
          ]
        };
      } else if (role.name === 'Full Stack Developer') {
        updateData = {
          isActive: true,
          slug: 'full-stack-developer',
          requiredSkills: [
            { skillId: 'javascript', skillName: 'JavaScript', requiredLevel: 4, importance: 'essential' },
            { skillId: 'react', skillName: 'React', requiredLevel: 3, importance: 'important' },
            { skillId: 'nodejs', skillName: 'Node.js', requiredLevel: 3, importance: 'important' },
            { skillId: 'database', skillName: 'Database', requiredLevel: 3, importance: 'essential' }
          ],
          detailedRoadmap: [
            {
              id: 'step-1',
              title: 'Full Stack Fundamentals',
              description: 'Learn both frontend and backend basics',
              skills: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
              estimatedTime: '4 weeks',
              xpReward: 300,
              projects: [
                {
                  id: 'proj-1',
                  title: 'Full Stack Blog',
                  description: 'Build a complete blog application',
                  difficulty: 'Intermediate',
                  estimatedTime: '3 weeks',
                  skills: ['React', 'Node.js', 'Database'],
                  xpReward: 200
                }
              ]
            },
            {
              id: 'step-2',
              title: 'Advanced Full Stack',
              description: 'Learn advanced concepts and deployment',
              skills: ['Deployment', 'DevOps', 'Testing'],
              estimatedTime: '3 weeks',
              xpReward: 250,
              projects: [
                {
                  id: 'proj-2',
                  title: 'E-commerce Platform',
                  description: 'Build a complete e-commerce application',
                  difficulty: 'Advanced',
                  estimatedTime: '4 weeks',
                  skills: ['React', 'Node.js', 'Database', 'Payment'],
                  xpReward: 300
                }
              ]
            }
          ]
        };
      }
      
      if (Object.keys(updateData).length > 0) {
        await CareerRole.findByIdAndUpdate(role._id, updateData, { new: true });
        console.log(`✅ Fixed: ${role.name}`);
      } else {
        console.log(`⚠️  No update data for: ${role.name}`);
      }
    }
    
    // Verify the results
    const finalRoles = await CareerRole.find({});
    console.log(`\n📊 Final result: ${finalRoles.length} career roles in database`);
    
    const validRoles = finalRoles.filter(role => 
      role.isActive && 
      role.requiredSkills && role.requiredSkills.length > 0 &&
      role.detailedRoadmap && role.detailedRoadmap.length > 0
    );
    
    console.log(`✅ Valid career roles: ${validRoles.length}`);
    
    if (validRoles.length > 0) {
      console.log('\n🎉 Success! Career roles are now ready for assessment.');
      console.log('\n🧪 Test the career assessment:');
      console.log('1. Go to http://localhost:5173/career-assessment');
      console.log('2. Complete the assessment');
      console.log('3. You should now see proper career recommendations');
    } else {
      console.log('\n❌ No valid career roles found. Check the data structure.');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Script completed!');
    
  } catch (error) {
    console.error('Error fixing career roles:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixCareerRoles();
