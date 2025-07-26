const mongoose = require('mongoose');
const User = require('./src/models/User');
const Achievement = require('./src/models/Achievement');
require('dotenv').config();

async function testNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('No test user found. Please create a user first.');
      return;
    }

    console.log('Testing notification settings for user:', user.email);
    console.log('Current notification settings:', user.notificationSettings);

    // Test updating notification settings
    user.notificationSettings = {
      email: true,
      achievement: true
    };
    await user.save();
    console.log('Updated notification settings:', user.notificationSettings);

    // Test achievement awarding
    const achievement = await Achievement.findOne({ key: 'first_career_path' });
    if (achievement) {
      console.log('Testing achievement notification for:', achievement.title);
      
      // Simulate achievement earning
      if (!user.achievements.includes('first_career_path')) {
        user.achievements.push('first_career_path');
        await user.save();
        console.log('Achievement awarded! Check email for notification.');
      } else {
        console.log('Achievement already earned');
      }
    }

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testNotifications(); 