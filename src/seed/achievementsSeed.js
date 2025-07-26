const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');

const achievements = [
  {
    key: 'first_steps',
    title: 'First Steps',
    description: 'Completed your first project',
    icon: 'Trophy'
  },
  {
    key: 'skill_collector',
    title: 'Skill Collector',
    description: 'Learned 10 new skills',
    icon: 'Star'
  },
  {
    key: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Maintained 7-day streak',
    icon: 'Medal'
  },
  {
    key: 'project_master',
    title: 'Project Master',
    description: 'Completed 20 projects',
    icon: 'Target'
  },
  {
    key: 'expert_level',
    title: 'Expert Level',
    description: 'Reach level 15',
    icon: 'Award'
  },
  {
    key: 'first_career_path',
    title: 'Starting 1st Career Path',
    description: 'Started your first career path',
    icon: 'BookOpen'
  }
];

require('dotenv').config();

async function seedAchievements() {
  await mongoose.connect(process.env.MONGO_URI);
  await Achievement.deleteMany({});
  await Achievement.insertMany(achievements);
  console.log('Achievements seeded!');
  mongoose.disconnect();
}

seedAchievements(); 