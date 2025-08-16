const mongoose = require('mongoose');
const QuizResult = require('../src/models/QuizResult');
require('dotenv').config();

async function clearOldQuizResults() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    // Count existing quiz results
    const count = await QuizResult.countDocuments({});
    console.log(`📊 Found ${count} quiz results in database`);
    
    if (count > 0) {
      // Delete all quiz results
      await QuizResult.deleteMany({});
      console.log(`🗑️  Deleted all ${count} quiz results`);
      console.log('✅ Database cleaned! Users will need to take fresh assessments.');
    } else {
      console.log('✅ No quiz results found - database is already clean');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Cleanup completed!');
    
  } catch (error) {
    console.error('Error clearing quiz results:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

clearOldQuizResults();
