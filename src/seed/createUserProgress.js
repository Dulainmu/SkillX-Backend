const mongoose = require('mongoose');
const UserCareerProgress = require('../models/UserCareerProgress');
const User = require('../models/User');
const CareerRole = require('../models/CareerRole');
const Achievement = require('../models/Achievement');

const createUserProgress = async () => {
  try {
    console.log('🌱 Creating user progress data...');

    // Get existing users and career roles
    const students = await User.find({ role: 'user' }).limit(10);
    const careerRoles = await CareerRole.find().limit(3);
    const achievements = await Achievement.find().limit(5);

    if (students.length === 0) {
      console.log('⚠️ No students found. Please create some users first.');
      return [];
    }

    if (careerRoles.length === 0) {
      console.log('⚠️ No career roles found. Please create some career roles first.');
      return [];
    }

    console.log(`Found ${students.length} students and ${careerRoles.length} career roles`);

    const progressData = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const careerRole = careerRoles[i % careerRoles.length];
      
      // Generate random progress data
      const totalSteps = 12; // Assuming 12 steps per career
      const totalProjects = 8; // Assuming 8 projects per career
      const completedSteps = Math.floor(Math.random() * (totalSteps + 1));
      const completedProjects = Math.floor(Math.random() * (totalProjects + 1));
      const averageScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const totalXP = completedSteps * 50 + completedProjects * 100 + Math.floor(Math.random() * 500);
      const totalTimeSpent = Math.floor(Math.random() * 100) + 10; // 10-110 hours
      
      // Determine if journey is completed
      const isCompleted = completedSteps === totalSteps && completedProjects === totalProjects;
      const completedAt = isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null;
      
      // Generate step progress
      const steps = [];
      for (let j = 0; j < totalSteps; j++) {
        const isCompleted = j < completedSteps;
        steps.push({
          stepIndex: j,
          stepId: `step_${j + 1}`,
          stepTitle: `Step ${j + 1}: ${careerRole.name} Fundamentals`,
          completed: isCompleted,
          completedAt: isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          timeSpent: Math.floor(Math.random() * 5) + 1, // 1-6 hours
          score: isCompleted ? Math.floor(Math.random() * 20) + 80 : 0, // 80-100 if completed
          projectsCompleted: j < completedSteps ? Math.floor(Math.random() * 2) + 1 : 0,
          totalProjects: Math.floor(Math.random() * 2) + 1
        });
      }

      // Generate project progress
      const projects = [];
      for (let k = 0; k < totalProjects; k++) {
        const isCompleted = k < completedProjects;
        const submissionStatus = isCompleted ? 
          ['approved', 'rejected'][Math.floor(Math.random() * 2)] : 
          ['not-started', 'in-progress'][Math.floor(Math.random() * 2)];
        
        projects.push({
          projectId: `project_${k + 1}`,
          projectTitle: `Project ${k + 1}: ${careerRole.name} Application`,
          completed: isCompleted,
          completedAt: isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          score: isCompleted ? Math.floor(Math.random() * 20) + 80 : 0, // 80-100 if completed
          submissionStatus: submissionStatus,
          timeSpent: Math.floor(Math.random() * 10) + 2 // 2-12 hours
        });
      }

      // Assign random achievements
      const userAchievements = achievements.slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 achievements

      const progress = new UserCareerProgress({
        user: student._id,
        careerRole: careerRole._id,
        steps: steps,
        projects: projects,
        completedResources: steps.filter(s => s.completed).map(s => ({
          stepIndex: s.stepIndex,
          resourceUrl: `https://example.com/resources/${careerRole.name.toLowerCase()}/step-${s.stepIndex + 1}`
        })),
        startedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Started within last 90 days
        completedAt: completedAt,
        totalXP: totalXP,
        averageScore: averageScore,
        totalTimeSpent: totalTimeSpent,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Activity within last 7 days
        achievements: userAchievements.map(a => a._id),
        isActive: true
      });

      progressData.push(progress);
    }

    // Save all progress data
    const savedProgress = await UserCareerProgress.insertMany(progressData);
    console.log(`✅ Created ${savedProgress.length} user progress records`);

    // Update achievements with assigned users
    for (const achievement of achievements) {
      const usersWithAchievement = savedProgress.filter(p => 
        p.achievements.includes(achievement._id)
      );
      achievement.assignedTo = usersWithAchievement.map(p => p.user);
      achievement.unlockRate = students.length > 0 ? (usersWithAchievement.length / students.length) * 100 : 0;
      await achievement.save();
    }

    console.log('🎉 User progress data creation completed!');
    return savedProgress;
  } catch (error) {
    console.error('❌ Error creating user progress:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGO_URI)
    .then(() => createUserProgress())
    .then(() => {
      console.log('✅ User progress creation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ User progress creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createUserProgress };
