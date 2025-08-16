const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

async function checkCareerById() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    const careerId = '68a0131427821a3749e9eb53';
    console.log(`🔍 Checking career with ID: ${careerId}`);
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(careerId)) {
      console.log('❌ Invalid ObjectId format');
      return;
    }
    
    // Find the career role
    const career = await CareerRole.findById(careerId);
    
    if (!career) {
      console.log('❌ Career not found in database');
    } else {
      console.log('✅ Career found:');
      console.log(`• Name: ${career.name}`);
      console.log(`• Slug: ${career.slug}`);
      console.log(`• ID: ${career._id}`);
      console.log(`• Is Active: ${career.isActive}`);
      console.log(`• Has detailedRoadmap: ${career.detailedRoadmap ? career.detailedRoadmap.length : 0} steps`);
      console.log(`• Has requiredSkills: ${career.requiredSkills ? career.requiredSkills.length : 0} skills`);
      console.log(`• Description: ${career.description?.substring(0, 100)}...`);
    }
    
    // Also list all career roles for reference
    console.log('\n📊 All career roles in database:');
    const allCareers = await CareerRole.find({});
    allCareers.forEach(career => {
      console.log(`• ${career.name} (ID: ${career._id}, Slug: ${career.slug})`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('Error checking career by ID:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkCareerById();
