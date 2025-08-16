const mongoose = require('mongoose');
const { seedAchievements } = require('./achievementsSeed');
const { seedProjectSubmissions } = require('./projectSubmissionsSeed');
const { seedUserCareerProgress } = require('./userCareerProgressSeed');

const runAllSeeds = async () => {
  try {
    console.log('🚀 Starting comprehensive database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Run seeds in order
    console.log('📊 Step 1: Seeding achievements...');
    await seedAchievements();
    console.log('✅ Achievements seeded successfully\n');

    console.log('📊 Step 2: Seeding project submissions...');
    await seedProjectSubmissions();
    console.log('✅ Project submissions seeded successfully\n');

    console.log('📊 Step 3: Seeding user career progress...');
    await seedUserCareerProgress();
    console.log('✅ User career progress seeded successfully\n');

    console.log('🎉 All seeds completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Achievements: 12 achievements created');
    console.log('   • Project Submissions: 10 submissions created');
    console.log('   • User Career Progress: Multiple progress records created');
    console.log('\n🔗 The admin pages should now have real data to display!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

const clearAllData = async () => {
  try {
    console.log('🧹 Clearing all seeded data...');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const { clearAchievements } = require('./achievementsSeed');
    const { clearProjectSubmissions } = require('./projectSubmissionsSeed');
    const { clearUserCareerProgress } = require('./userCareerProgressSeed');

    await clearAchievements();
    await clearProjectSubmissions();
    await clearUserCareerProgress();

    console.log('✅ All seeded data cleared successfully');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  
  const command = process.argv[2];
  
  if (command === 'clear') {
    clearAllData()
      .then(() => {
        console.log('🎉 Data clearing completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Data clearing failed:', error);
        process.exit(1);
      });
  } else {
    runAllSeeds()
      .then(() => {
        console.log('🎉 All seeding completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  runAllSeeds,
  clearAllData
};
