const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const CareerRole = require('../models/CareerRole');
const User = require('../models/User');

const achievementsData = [
  {
    name: 'First Steps',
    description: 'Complete your first learning step',
    icon: 'Star',
    category: 'progress',
    rarity: 'common',
    criteria: {
      type: 'steps_completed',
      value: 1
    },
    xpReward: 50,
    isActive: true
  },
  {
    name: 'Quick Learner',
    description: 'Complete 5 steps in a single day',
    icon: 'Zap',
    category: 'progress',
    rarity: 'rare',
    criteria: {
      type: 'steps_completed',
      value: 5
    },
    xpReward: 150,
    isActive: true
  },
  {
    name: 'Project Master',
    description: 'Complete 10 projects with 90%+ score',
    icon: 'Trophy',
    category: 'skill',
    rarity: 'epic',
    criteria: {
      type: 'projects_completed',
      value: 10
    },
    xpReward: 500,
    isActive: true
  },
  {
    name: 'Consistent Performer',
    description: 'Maintain 85%+ average score across 20 submissions',
    icon: 'TrendingUp',
    category: 'skill',
    rarity: 'rare',
    criteria: {
      type: 'submissions_approved',
      value: 20
    },
    xpReward: 300,
    isActive: true
  },
  {
    name: 'Speed Learner',
    description: 'Complete a career path in under 30 days',
    icon: 'Zap',
    category: 'special',
    rarity: 'legendary',
    criteria: {
      type: 'time_spent',
      value: 30
    },
    xpReward: 1000,
    isActive: true
  },
  {
    name: 'Frontend Pioneer',
    description: 'Complete all frontend development projects',
    icon: 'Code2',
    category: 'skill',
    rarity: 'epic',
    criteria: {
      type: 'projects_completed',
      value: 15
    },
    xpReward: 750,
    isActive: true
  },
  {
    name: 'Backend Master',
    description: 'Complete all backend development projects',
    icon: 'Server',
    category: 'skill',
    rarity: 'epic',
    criteria: {
      type: 'projects_completed',
      value: 12
    },
    xpReward: 750,
    isActive: true
  },
  {
    name: 'Team Player',
    description: 'Help 5 other users by providing feedback',
    icon: 'Users',
    category: 'social',
    rarity: 'rare',
    criteria: {
      type: 'submissions_approved',
      value: 5
    },
    xpReward: 200,
    isActive: true
  },
  {
    name: 'Early Bird',
    description: 'Start learning before 8 AM for 7 consecutive days',
    icon: 'Sun',
    category: 'special',
    rarity: 'legendary',
    criteria: {
      type: 'time_spent',
      value: 7
    },
    xpReward: 800,
    isActive: true
  },
  {
    name: 'Night Owl',
    description: 'Study after 10 PM for 5 consecutive days',
    icon: 'Moon',
    category: 'special',
    rarity: 'rare',
    criteria: {
      type: 'time_spent',
      value: 5
    },
    xpReward: 400,
    isActive: true
  },
  {
    name: 'Perfect Score',
    description: 'Achieve 100% on any project submission',
    icon: 'Award',
    category: 'skill',
    rarity: 'epic',
    criteria: {
      type: 'score_threshold',
      value: 100
    },
    xpReward: 600,
    isActive: true
  },
  {
    name: 'Marathon Runner',
    description: 'Spend 50+ hours learning in a single month',
    icon: 'Activity',
    category: 'progress',
    rarity: 'legendary',
    criteria: {
      type: 'time_spent',
      value: 50
    },
    xpReward: 1200,
    isActive: true
  }
];

const seedAchievements = async () => {
  try {
    console.log('🌱 Seeding achievements...');

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('✅ Cleared existing achievements');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️ No admin user found, using first user as creator');
    }

    // Create achievements
    const achievements = await Achievement.insertMany(
      achievementsData.map(achievement => ({
        ...achievement,
        createdBy: adminUser?._id,
        lastModifiedBy: adminUser?._id,
        assignedTo: [],
        unlockRate: 0
      }))
    );

    console.log(`✅ Created ${achievements.length} achievements`);

    // Assign some achievements to existing users
    const students = await User.find({ role: 'student' }).limit(10);
    const careerRoles = await CareerRole.find().limit(3);

    if (students.length > 0 && careerRoles.length > 0) {
      // Assign "First Steps" achievement to all students
      const firstStepsAchievement = achievements.find(a => a.name === 'First Steps');
      if (firstStepsAchievement) {
        firstStepsAchievement.assignedTo = students.map(s => s._id);
        firstStepsAchievement.unlockRate = (students.length / await User.countDocuments({ role: 'student' })) * 100;
        await firstStepsAchievement.save();
        console.log(`✅ Assigned "First Steps" to ${students.length} students`);
      }

      // Assign some random achievements to a few students
      const randomAchievements = achievements.filter(a => a.name !== 'First Steps').slice(0, 3);
      for (const achievement of randomAchievements) {
        const randomStudents = students.slice(0, Math.floor(students.length / 2));
        achievement.assignedTo = randomStudents.map(s => s._id);
        achievement.unlockRate = (randomStudents.length / await User.countDocuments({ role: 'student' })) * 100;
        await achievement.save();
        console.log(`✅ Assigned "${achievement.name}" to ${randomStudents.length} students`);
      }
    }

    console.log('🎉 Achievements seeding completed!');
    return achievements;
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  }
};

const clearAchievements = async () => {
  try {
    await Achievement.deleteMany({});
    console.log('✅ Cleared all achievements');
  } catch (error) {
    console.error('❌ Error clearing achievements:', error);
    throw error;
  }
};

module.exports = {
  seedAchievements,
  clearAchievements
};

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGO_URI)
    .then(() => seedAchievements())
    .then(() => {
      console.log('✅ Achievements seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Achievements seeding failed:', error);
      process.exit(1);
    });
} 