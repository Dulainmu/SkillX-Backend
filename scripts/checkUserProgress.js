const mongoose = require('mongoose');
const UserCareerProgress = require('../src/models/UserCareerProgress');
require('dotenv').config();

async function checkUserProgress() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    // Check all user progress records
    const allProgress = await UserCareerProgress.find({});
    console.log(`📊 Total user progress records: ${allProgress.length}`);
    
    if (allProgress.length === 0) {
      console.log('❌ No user progress records found');
      return;
    }
    
    // Show sample records
    console.log('\n📋 Sample user progress records:');
    allProgress.slice(0, 5).forEach(progress => {
      console.log(`• ID: ${progress._id}`);
      console.log(`  User: ${progress.user}`);
      console.log(`  Career: ${progress.careerRole}`);
      console.log(`  Steps: ${progress.steps ? progress.steps.length : 0}`);
      console.log(`  Projects: ${progress.projects ? progress.projects.length : 0}`);
      console.log(`  Total XP: ${progress.totalXP || 0}`);
      console.log(`  Average Score: ${progress.averageScore || 0}`);
      console.log(`  Last Activity: ${progress.lastActivity || 'N/A'}`);
      console.log('---');
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('Error checking user progress:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkUserProgress();
