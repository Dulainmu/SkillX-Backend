const mongoose = require('mongoose');
const QuizResult = require('../src/models/QuizResult');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

async function cleanupOldData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    // Get valid career role IDs
    const validCareerRoles = await CareerRole.find({ isActive: true });
    const validIds = validCareerRoles.map(role => role._id.toString());
    const validSlugs = validCareerRoles.map(role => role.slug);
    
    console.log(`📊 Valid career roles: ${validIds.length}`);
    validIds.forEach((id, index) => {
      console.log(`• ${validCareerRoles[index].name} (ID: ${id}, Slug: ${validSlugs[index]})`);
    });
    
    // Find quiz results with invalid career path references
    const quizResults = await QuizResult.find({});
    console.log(`\n📊 Found ${quizResults.length} quiz results`);
    
    let cleanedCount = 0;
    
    for (const result of quizResults) {
      let needsUpdate = false;
      const updatedTopMatches = [];
      
      if (result.topMatches && Array.isArray(result.topMatches)) {
        for (const match of result.topMatches) {
          // Check if the pathId references a valid career role
          const isValidId = validIds.includes(match.pathId);
          const isValidSlug = validSlugs.includes(match.pathId);
          
          if (isValidId || isValidSlug) {
            updatedTopMatches.push(match);
          } else {
            console.log(`❌ Removing invalid career path: ${match.pathId} (${match.name})`);
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        if (updatedTopMatches.length > 0) {
          // Update with only valid matches
          await QuizResult.findByIdAndUpdate(result._id, {
            topMatches: updatedTopMatches
          });
          console.log(`✅ Updated quiz result for user ${result.user} - kept ${updatedTopMatches.length} valid matches`);
        } else {
          // Delete quiz result if no valid matches remain
          await QuizResult.findByIdAndDelete(result._id);
          console.log(`🗑️  Deleted quiz result for user ${result.user} - no valid matches`);
        }
        cleanedCount++;
      }
    }
    
    console.log(`\n🎉 Cleanup completed!`);
    console.log(`• Processed: ${quizResults.length} quiz results`);
    console.log(`• Updated/Deleted: ${cleanedCount} quiz results`);
    console.log(`• Valid career roles: ${validIds.length}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Cleanup completed!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupOldData();
