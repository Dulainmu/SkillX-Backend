const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

async function testUpdate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');

    // Find the Frontend Developer career
    const frontendRole = await CareerRole.findOne({ name: 'Frontend Developer' });
    
    if (!frontendRole) {
      console.log('❌ Frontend Developer not found');
      return;
    }

    console.log('🔧 Found Frontend Developer, updating...');

    // Create test learning materials
    const testMaterials = [
      {
        title: "HTML Fundamentals",
        type: "course",
        url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        description: "Complete HTML basics and semantic markup"
      },
      {
        title: "CSS Styling Mastery",
        type: "video",
        url: "https://www.youtube.com/watch?v=1PnVor36_40",
        description: "Learn CSS layouts, flexbox, and grid systems"
      }
    ];

    // Update the first step with materials
    const updatedRoadmap = frontendRole.detailedRoadmap.map((step, index) => {
      if (index === 0) {
        console.log(`📝 Updating step ${index + 1} with ${testMaterials.length} materials`);
        return {
          ...step,
          resources: testMaterials
        };
      }
      return step;
    });

    // Update the career role
    const result = await CareerRole.findByIdAndUpdate(
      frontendRole._id,
      { detailedRoadmap: updatedRoadmap },
      { new: true }
    );

    if (result) {
      console.log('✅ Update successful!');
      console.log(`📊 Materials in step 1: ${result.detailedRoadmap[0].resources.length}`);
      
      // Test the API
      const testResponse = await fetch('http://localhost:4000/api/careers/68a0131427821a3749e9eb53/brief-roadmap');
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(`🧪 API test: ${testData.steps[0].resources?.length || 0} materials via API`);
      }
    } else {
      console.log('❌ Update failed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testUpdate();
