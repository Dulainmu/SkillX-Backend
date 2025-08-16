const mongoose = require('mongoose');
const UserSkill = require('../models/UserSkill');
const User = require('../models/User');
const Skill = require('../models/Skill');
require('dotenv').config();

const seedUserSkills = async () => {
  try {
    console.log('🌱 Starting user skills seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({ role: 'user' }).limit(5);
    const skills = await Skill.find({ status: 'active' });

    if (users.length === 0) {
      console.log('⚠️  No users found. Please create some users first.');
      return;
    }
    if (skills.length === 0) {
      console.log('⚠️  No skills found. Please seed skills first.');
      return;
    }

    console.log(`📊 Found ${users.length} users and ${skills.length} skills`);
    await UserSkill.deleteMany({});
    console.log('🗑️  Cleared existing user skills');

    const userSkillsData = [];
    for (const user of users) {
      // Select 8-15 random skills per user
      const numSkills = Math.floor(Math.random() * 8) + 8; // 8-15 skills
      const selectedSkills = skills
        .sort(() => 0.5 - Math.random())
        .slice(0, numSkills);

      const userSkillProgress = selectedSkills.map(skill => {
        const level = Math.floor(Math.random() * 5); // 0-4 levels
        const progress = Math.floor(Math.random() * 100); // 0-100%
        const xpEarned = Math.floor(Math.random() * skill.xpReward);
        const timeSpent = Math.floor(Math.random() * 100) + 10; // 10-110 hours
        const selfAssessment = Math.floor(Math.random() * 5) + 1; // 1-5 rating

        // Generate realistic status based on level and progress
        let status = 'learning';
        if (level >= 3 && progress >= 80) status = 'proficient';
        else if (level >= 2 && progress >= 60) status = 'practicing';
        else if (level >= 1 && progress >= 30) status = 'learning';
        else status = 'learning';

        // Generate some completed resources
        const resourcesCompleted = [];
        if (skill.resources && skill.resources.length > 0) {
          const numCompleted = Math.floor(Math.random() * Math.min(3, skill.resources.length));
          for (let i = 0; i < numCompleted; i++) {
            if (skill.resources[i]) {
              resourcesCompleted.push(skill.resources[i].url);
            }
          }
        }

        // Generate some quiz scores
        const quizScores = [];
        if (Math.random() > 0.5) {
          const score = Math.floor(Math.random() * 20) + 80; // 80-100 score
          quizScores.push({
            quizId: `quiz_${skill._id}`,
            score: score,
            maxScore: 100,
            completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within 30 days
          });
        }

        // Generate some completed projects
        const projectsCompleted = [];
        if (Math.random() > 0.6) {
          const projectScore = Math.floor(Math.random() * 20) + 80; // 80-100 score
          projectsCompleted.push({
            projectId: `project_${skill._id}`,
            projectTitle: `${skill.name} Project`,
            score: projectScore,
            completedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within 60 days
          });
        }

        // Generate learning goals
        const learningGoals = [];
        if (level < 4) {
          const nextLevel = level + 1;
          const levelNames = ['beginner', 'intermediate', 'advanced', 'expert'];
          learningGoals.push(`Reach ${levelNames[nextLevel]} level in ${skill.name}`);
        }
        if (progress < 100) {
          learningGoals.push(`Complete ${skill.name} learning path`);
        }

        return {
          skill: skill._id,
          skillName: skill.name,
          skillSlug: skill.slug,
          level: ['not-started', 'beginner', 'intermediate', 'advanced', 'expert'][level],
          progress: progress,
          xpEarned: xpEarned,
          startedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within 1 year
          lastPracticedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within 1 week
          timeSpent: timeSpent,
          resourcesCompleted: resourcesCompleted,
          selfAssessment: selfAssessment,
          projectsCompleted: projectsCompleted,
          quizScores: quizScores,
          status: status,
          isActive: true,
          notes: Math.random() > 0.7 ? `Working on ${skill.name} - making good progress!` : '',
          targetLevel: level < 4 ? ['beginner', 'intermediate', 'advanced', 'expert'][level + 1] : 'expert',
          targetDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date within 6 months
          learningGoals: learningGoals
        };
      });

      // Calculate category progress
      const categoryProgress = [];
      const categories = [...new Set(userSkillProgress.map(s => s.skillName.split(' - ')[0] || 'Other'))];
      categories.forEach(category => {
        const categorySkills = userSkillProgress.filter(s => 
          s.skillName.includes(category) || s.skillName.startsWith(category)
        );
        const completedCount = categorySkills.filter(s => s.status === 'proficient' || s.status === 'mastered').length;
        const averageProgress = categorySkills.reduce((sum, s) => sum + s.progress, 0) / categorySkills.length;
        
        categoryProgress.push({
          category: category,
          skillsCount: categorySkills.length,
          completedCount: completedCount,
          averageProgress: Math.round(averageProgress)
        });
      });

      // Generate learning streak
      const currentStreak = Math.floor(Math.random() * 14) + 1; // 1-14 days
      const longestStreak = Math.max(currentStreak, Math.floor(Math.random() * 30) + 10); // 10-40 days

      // Generate learning goals
      const learningGoals = [];
      const targetSkills = userSkillProgress
        .filter(s => s.level !== 'expert')
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      targetSkills.forEach(skill => {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(skill.level);
        if (currentIndex < levels.length - 1) {
          learningGoals.push({
            skillId: skill.skill,
            skillName: skill.skillName,
            targetLevel: levels[currentIndex + 1],
            targetDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within 3 months
            isCompleted: false
          });
        }
      });

      const userSkill = new UserSkill({
        user: user._id,
        skills: userSkillProgress,
        totalSkills: userSkillProgress.length,
        skillsInProgress: userSkillProgress.filter(s => s.status === 'learning' || s.status === 'practicing').length,
        skillsCompleted: userSkillProgress.filter(s => s.status === 'proficient' || s.status === 'mastered').length,
        totalXpEarned: userSkillProgress.reduce((sum, skill) => sum + skill.xpEarned, 0),
        totalTimeSpent: userSkillProgress.reduce((sum, skill) => sum + skill.timeSpent, 0),
        categoryProgress: categoryProgress,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        lastActivityDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        learningGoals: learningGoals,
        preferredLearningStyle: ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed'][Math.floor(Math.random() * 5)],
        preferredDifficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        notifications: {
          skillReminders: Math.random() > 0.3,
          goalDeadlines: Math.random() > 0.3,
          achievementAlerts: Math.random() > 0.3,
          mentorFeedback: Math.random() > 0.3
        }
      });

      userSkillsData.push(userSkill);
    }

    const savedUserSkills = await UserSkill.insertMany(userSkillsData);
    console.log(`✅ Successfully seeded ${savedUserSkills.length} user skill profiles`);

    // Update skill statistics
    for (const skill of skills) {
      const usersWithSkill = await UserSkill.find({
        'skills.skill': skill._id
      });
      skill.totalUsers = usersWithSkill.length;
      
      // Calculate average completion time and success rate
      const skillProgress = usersWithSkill.flatMap(us => 
        us.skills.filter(s => s.skill.toString() === skill._id.toString())
      );
      
      if (skillProgress.length > 0) {
        const avgTime = skillProgress.reduce((sum, sp) => sum + sp.timeSpent, 0) / skillProgress.length;
        const successCount = skillProgress.filter(sp => sp.status === 'proficient' || sp.status === 'mastered').length;
        const successRate = (successCount / skillProgress.length) * 100;
        
        skill.averageCompletionTime = Math.round(avgTime);
        skill.successRate = Math.round(successRate);
        skill.rating = Math.round((skillProgress.reduce((sum, sp) => sum + (sp.selfAssessment || 3), 0) / skillProgress.length) * 10) / 10;
        skill.reviewCount = skillProgress.length;
      }
      
      await skill.save();
    }

    // Log statistics
    console.log('\n📊 User Skills Statistics:');
    console.log(`  Total users with skills: ${savedUserSkills.length}`);
    console.log(`  Average skills per user: ${Math.round(savedUserSkills.reduce((sum, us) => sum + us.totalSkills, 0) / savedUserSkills.length)}`);
    console.log(`  Total XP earned: ${savedUserSkills.reduce((sum, us) => sum + us.totalXpEarned, 0)}`);
    console.log(`  Total time spent: ${savedUserSkills.reduce((sum, us) => sum + us.totalTimeSpent, 0)} hours`);

    const categoryStats = await UserSkill.aggregate([
      { $unwind: '$categoryProgress' },
      { $group: { _id: '$categoryProgress.category', totalSkills: { $sum: '$categoryProgress.skillsCount' }, avgProgress: { $avg: '$categoryProgress.averageProgress' } } },
      { $sort: { totalSkills: -1 } }
    ]);

    console.log('\n📊 Skills by Category (User Data):');
    categoryStats.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.totalSkills} skills, ${Math.round(cat.avgProgress)}% avg progress`);
    });

  } catch (error) {
    console.error('❌ Error seeding user skills:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

if (require.main === module) {
  seedUserSkills();
}

module.exports = { seedUserSkills };
