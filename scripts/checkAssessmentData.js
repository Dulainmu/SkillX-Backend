const mongoose = require('mongoose');
const QuizResult = require('../src/models/QuizResult');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

async function checkAssessmentData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    // Check career roles
    const careerRoles = await CareerRole.find({});
    console.log(`\n📊 Career Roles in Database:`);
    careerRoles.forEach(role => {
      console.log(`• ${role.name} (ID: ${role._id}, Slug: ${role.slug})`);
    });
    
    // Check quiz results
    const quizResults = await QuizResult.find({});
    console.log(`\n📊 Quiz Results in Database: ${quizResults.length}`);
    
    if (quizResults.length > 0) {
      quizResults.forEach((result, index) => {
        console.log(`\nQuiz Result ${index + 1}:`);
        console.log(`• User: ${result.user}`);
        console.log(`• Submitted: ${result.submittedAt}`);
        console.log(`• Top Matches: ${result.topMatches?.length || 0}`);
        
        if (result.topMatches && result.topMatches.length > 0) {
          console.log(`• Career Paths:`);
          result.topMatches.forEach(match => {
            console.log(`  - ${match.name} (ID: ${match.pathId})`);
          });
        }
      });
    }
    
    // Check for any data-analyst references
    console.log(`\n🔍 Checking for data-analyst references...`);
    
    // Check in quiz results
    const dataAnalystResults = await QuizResult.find({
      $or: [
        { 'topMatches.pathId': 'data-analyst' },
        { 'topMatches.name': { $regex: 'data.*analyst', $options: 'i' } }
      ]
    });
    
    if (dataAnalystResults.length > 0) {
      console.log(`❌ Found ${dataAnalystResults.length} quiz results with data-analyst references`);
      dataAnalystResults.forEach(result => {
        console.log(`• User: ${result.user}, Submitted: ${result.submittedAt}`);
      });
    } else {
      console.log(`✅ No data-analyst references found in quiz results`);
    }
    
    // Check in career roles
    const dataAnalystRoles = await CareerRole.find({
      $or: [
        { slug: 'data-analyst' },
        { name: { $regex: 'data.*analyst', $options: 'i' } }
      ]
    });
    
    if (dataAnalystRoles.length > 0) {
      console.log(`❌ Found ${dataAnalystRoles.length} career roles with data-analyst references`);
      dataAnalystRoles.forEach(role => {
        console.log(`• ${role.name} (ID: ${role._id}, Slug: ${role.slug})`);
      });
    } else {
      console.log(`✅ No data-analyst references found in career roles`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('Error checking assessment data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkAssessmentData();
