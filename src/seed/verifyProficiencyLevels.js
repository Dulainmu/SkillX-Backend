const mongoose = require('mongoose');
const Skill = require('../models/Skill');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MongoDB URI found. Please set MONGO_URI or MONGODB_URI environment variable.');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Verify proficiency levels
const verifyProficiencyLevels = async () => {
  try {
    console.log('Verifying proficiency levels for all skills...\n');
    
    // Get all skills
    const skills = await Skill.find({}).select('name category proficiencyLevels');
    
    let skillsWithLevels = 0;
    let skillsWithoutLevels = 0;
    
    console.log('=== SKILL PROFICIENCY LEVELS SUMMARY ===\n');
    
    for (const skill of skills) {
      if (skill.proficiencyLevels && skill.proficiencyLevels.length > 0) {
        skillsWithLevels++;
        console.log(`✅ ${skill.name} (${skill.category})`);
        console.log(`   Levels: ${skill.proficiencyLevels.length} (${skill.proficiencyLevels.map(l => l.level).join(', ')})`);
        console.log(`   First level: ${skill.proficiencyLevels[0].title}`);
        console.log('');
      } else {
        skillsWithoutLevels++;
        console.log(`❌ ${skill.name} (${skill.category}) - NO PROFICIENCY LEVELS`);
        console.log('');
      }
    }
    
    console.log('=== SUMMARY ===');
    console.log(`Total skills: ${skills.length}`);
    console.log(`Skills with proficiency levels: ${skillsWithLevels}`);
    console.log(`Skills without proficiency levels: ${skillsWithoutLevels}`);
    console.log(`Coverage: ${((skillsWithLevels / skills.length) * 100).toFixed(1)}%`);
    
    if (skillsWithoutLevels > 0) {
      console.log('\n⚠️  Skills missing proficiency levels:');
      skills.forEach(skill => {
        if (!skill.proficiencyLevels || skill.proficiencyLevels.length === 0) {
          console.log(`   - ${skill.name}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error verifying proficiency levels:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await verifyProficiencyLevels();
  await mongoose.disconnect();
  console.log('\nDatabase connection closed');
  process.exit(0);
};

run().catch(console.error);
