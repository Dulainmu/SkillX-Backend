const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');

// Use the same connection string as your server
const MONGODB_URI = 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx?retryWrites=true&w=majority';

async function quickFix() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and update Frontend Developer
    const frontendRole = await CareerRole.findOne({ name: 'Frontend Developer' });
    
    if (!frontendRole) {
      console.log('❌ Frontend Developer not found');
      return;
    }

    console.log('🔧 Updating Frontend Developer...');

    // Add materials to step 1
    const updatedRoadmap = frontendRole.detailedRoadmap.map((step, index) => {
      if (index === 0) {
        return {
          ...step,
          resources: [
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
            },
            {
              title: "JavaScript Essentials",
              type: "tutorial",
              url: "https://javascript.info/",
              description: "Modern JavaScript fundamentals and ES6+ features"
            }
          ]
        };
      }
      return step;
    });

    await CareerRole.findByIdAndUpdate(frontendRole._id, {
      detailedRoadmap: updatedRoadmap
    });

    console.log('✅ Frontend Developer updated successfully!');

    // Verify the update
    const updatedRole = await CareerRole.findById(frontendRole._id);
    console.log(`📊 Materials in step 1: ${updatedRole.detailedRoadmap[0].resources.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

quickFix();
