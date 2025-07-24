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
  }
];

async function seedAchievements() {
  await mongoose.connect('mongodb://localhost:27017/skillx', { useNewUrlParser: true, useUnifiedTopology: true });
  await Achievement.deleteMany({});
  await Achievement.insertMany(achievements);
  console.log('Achievements seeded!');
  mongoose.disconnect();
}

seedAchievements(); 