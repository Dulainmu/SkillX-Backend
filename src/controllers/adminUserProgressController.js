const UserCareerProgress = require('../models/UserCareerProgress');
const User = require('../models/User');
const CareerRole = require('../models/CareerRole');
const ProjectSubmission = require('../models/ProjectSubmission');
const Achievement = require('../models/Achievement');
const QuizResult = require('../models/QuizResult'); // Added QuizResult import

// Get all user progress with analytics
const getAllUserProgress = async (req, res) => {
  try {
    const { 
      career, 
      progress, 
      role, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'lastActivity',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('Admin user progress request:', { page, limit, sortBy, sortOrder });
    
    // Build filter object - simplified to avoid complex queries
    const filter = {};
    
    // Get user progress with pagination - simplified query
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let userProgress = await UserCareerProgress.find(filter)
      .populate('user', 'name email role createdAt')
      .populate('careerRole', 'name description')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    console.log(`Found ${userProgress.length} user progress records`);

    // Get total count
    const total = await UserCareerProgress.countDocuments(filter);

    // Calculate basic analytics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await UserCareerProgress.countDocuments({});

    const analytics = {
      totalUsers,
      activeUsers,
      averageProgress: 0,
      completionRate: 0,
      averageTimeToComplete: 0,
      topPerformers: 0
    };

    // Transform user progress data safely
    const transformedUserProgress = userProgress.map(progress => {
      // Safely access nested properties with defaults
      const user = progress.user || {};
      const careerRole = progress.careerRole || {};
      const steps = progress.steps || [];
      const projects = progress.projects || [];
      
      const completedSteps = steps.filter(step => step && step.completed).length;
      const totalSteps = steps.length;
      const completedProjects = projects.filter(project => project && project.completed).length;
      const totalProjects = projects.length;
      
      return {
        id: progress._id.toString(),
        user: {
          id: user._id ? user._id.toString() : '',
          name: user.name || 'Unknown User',
          email: user.email || 'No email',
          role: user.role || 'user',
          createdAt: user.createdAt || new Date()
        },
        career: {
          id: careerRole._id ? careerRole._id.toString() : '',
          name: careerRole.name || 'Unknown Career',
          description: careerRole.description || 'No description'
        },
        progress: {
          completedSteps,
          totalSteps,
          completedProjects,
          totalProjects,
          averageScore: progress.averageScore || 0,
          totalXP: progress.totalXP || 0,
          lastActivity: progress.lastActivity || new Date()
        },
        submissions: {
          total: totalProjects,
          pending: 0,
          approved: 0,
          rejected: 0
        },
        achievements: [],
        timeSpent: progress.totalTimeSpent || 0
      };
    });

    console.log(`Transformed ${transformedUserProgress.length} user progress records`);

    res.json({
      userProgress: transformedUserProgress,
      analytics,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user progress',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get single user progress
const getUserProgress = async (req, res) => {
  try {
    const { userId, careerId } = req.params;

    const userProgress = await UserCareerProgress.findOne({
      user: userId,
      careerRole: careerId
    })
    .populate('user', 'name email role createdAt')
    .populate('careerRole', 'name description')
    .populate('achievements', 'name icon rarity category');

    if (!userProgress) {
      return res.status(404).json({ error: 'User progress not found' });
    }

    // Get user's project submissions
    const submissions = await ProjectSubmission.find({
      user: userId,
      careerRole: careerId
    }).sort({ submittedAt: -1 });

    // Calculate detailed statistics
    const completedSteps = userProgress.steps.filter(step => step.completed).length;
    const totalSteps = userProgress.steps.length;
    const completedProjects = userProgress.projects.filter(project => project.completed).length;
    const totalProjects = userProgress.projects.length;

    const detailedProgress = {
      ...userProgress.toObject(),
      statistics: {
        completedSteps,
        totalSteps,
        completedProjects,
        totalProjects,
        stepProgress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
        projectProgress: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
        submissions: submissions.length,
        approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
        rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
        pendingSubmissions: submissions.filter(s => s.status === 'pending').length
      },
      submissions
    };

    res.json(detailedProgress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
};

// Reset user progress
const resetUserProgress = async (req, res) => {
  try {
    const { userId, careerId } = req.params;

    // Delete user career progress
    await UserCareerProgress.findOneAndDelete({
      user: userId,
      careerRole: careerId
    });

    // Delete related project submissions
    await ProjectSubmission.deleteMany({
      user: userId,
      careerRole: careerId
    });

    res.json({ message: 'User progress reset successfully' });
  } catch (error) {
    console.error('Error resetting user progress:', error);
    res.status(500).json({ error: 'Failed to reset user progress' });
  }
};

// Reset all member progress (admin only)
const resetAllMemberProgress = async (req, res) => {
  try {
    console.log('🔄 Admin requested reset of all member progress');
    
    // Get all users except admin
    const users = await User.find({ role: { $ne: 'admin' } });
    console.log(`📊 Found ${users.length} non-admin users to reset`);
    
    let resetCount = 0;
    const resetResults = [];
    
    for (const user of users) {
      try {
        // Reset user progress
        await UserCareerProgress.deleteMany({ user: user._id });
        
        // Reset quiz results
        await QuizResult.deleteMany({ user: user._id });
        
        // Reset project submissions
        await ProjectSubmission.deleteMany({ user: user._id });
        
        // Reset user achievements
        await Achievement.deleteMany({ user: user._id });
        
        // Reset user to basic state (keep login credentials)
        await User.findByIdAndUpdate(user._id, {
          totalXp: 0,
          level: 1,
          bio: '',
          avatar: '',
          achievements: [],
          currentCareer: null,
          learningPath: null,
          lastActivity: new Date(),
          // Keep: name, email, password, role, createdAt
        });
        
        resetCount++;
        resetResults.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          status: 'success'
        });
        
        console.log(`✅ Reset progress for user: ${user.name} (${user.email})`);
        
      } catch (userError) {
        console.error(`❌ Failed to reset user ${user.name}:`, userError);
        resetResults.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          status: 'failed',
          error: userError.message
        });
      }
    }
    
    console.log(`🎉 Reset completed: ${resetCount}/${users.length} users successfully reset`);
    
    res.json({
      message: `Successfully reset progress for ${resetCount} out of ${users.length} users`,
      resetCount,
      totalUsers: users.length,
      results: resetResults,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error resetting all member progress:', error);
    res.status(500).json({ 
      error: 'Failed to reset all member progress',
      details: error.message
    });
  }
};

// Reset individual member progress
const resetIndividualMemberProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🔄 Admin requested reset for user: ${userId}`);
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is admin (prevent resetting admin)
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot reset admin user progress' });
    }
    
    // Reset user progress
    await UserCareerProgress.deleteMany({ user: user._id });
    console.log(`🗑️  Deleted career progress for user: ${user.name}`);
    
    // Reset quiz results
    await QuizResult.deleteMany({ user: user._id });
    console.log(`🗑️  Deleted quiz results for user: ${user.name}`);
    
    // Reset project submissions
    await ProjectSubmission.deleteMany({ user: user._id });
    console.log(`🗑️  Deleted project submissions for user: ${user.name}`);
    
    // Reset user achievements
    await Achievement.deleteMany({ user: user._id });
    console.log(`🗑️  Deleted achievements for user: ${user.name}`);
    
    // Reset user to basic state (keep login credentials)
    await User.findByIdAndUpdate(user._id, {
      totalXp: 0,
      level: 1,
      bio: '',
      avatar: '',
      achievements: [],
      currentCareer: null,
      learningPath: null,
      lastActivity: new Date(),
      // Keep: name, email, password, role, createdAt
    });
    console.log(`🔄 Reset user data for: ${user.name}`);
    
    console.log(`✅ Successfully reset progress for user: ${user.name} (${user.email})`);
    
    res.json({
      message: `Successfully reset progress for ${user.name}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      resetData: {
        careerProgress: 'deleted',
        quizResults: 'deleted',
        projectSubmissions: 'deleted',
        achievements: 'deleted',
        userData: 'reset to basic state'
      },
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error resetting individual member progress:', error);
    res.status(500).json({ 
      error: 'Failed to reset member progress',
      details: error.message
    });
  }
};

// Get reset statistics
const getResetStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalCareerProgress = await UserCareerProgress.countDocuments({});
    const totalQuizResults = await QuizResult.countDocuments({});
    const totalProjectSubmissions = await ProjectSubmission.countDocuments({});
    const totalAchievements = await Achievement.countDocuments({});
    
    res.json({
      statistics: {
        totalUsers,
        totalCareerProgress,
        totalQuizResults,
        totalProjectSubmissions,
        totalAchievements
      },
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error getting reset statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get reset statistics',
      details: error.message
    });
  }
};

// Get user progress analytics
const getUserProgressAnalytics = async (req, res) => {
  try {
    const { careerId } = req.params;

    // Get all progress for this career
    const careerProgress = await UserCareerProgress.find({
      careerRole: careerId,
      isActive: true
    }).populate('user', 'name email');

    // Calculate step completion rates
    const stepAnalytics = {};
    if (careerProgress.length > 0) {
      const totalSteps = careerProgress[0].steps.length;
      for (let i = 0; i < totalSteps; i++) {
        const completedCount = careerProgress.filter(progress => 
          progress.steps[i] && progress.steps[i].completed
        ).length;
        stepAnalytics[`step_${i + 1}`] = {
          completed: completedCount,
          total: careerProgress.length,
          completionRate: Math.round((completedCount / careerProgress.length) * 100)
        };
      }
    }

    // Calculate project completion rates
    const projectAnalytics = {};
    if (careerProgress.length > 0) {
      const totalProjects = careerProgress[0].projects.length;
      for (let i = 0; i < totalProjects; i++) {
        const completedCount = careerProgress.filter(progress => 
          progress.projects[i] && progress.projects[i].completed
        ).length;
        projectAnalytics[`project_${i + 1}`] = {
          completed: completedCount,
          total: careerProgress.length,
          completionRate: Math.round((completedCount / careerProgress.length) * 100)
        };
      }
    }

    // Calculate overall statistics
    const totalUsers = careerProgress.length;
    const activeUsers = careerProgress.filter(progress => 
      progress.lastActivity >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const completedUsers = careerProgress.filter(progress => 
      progress.completedAt
    ).length;

    const averageScore = careerProgress.length > 0
      ? careerProgress.reduce((sum, progress) => sum + (progress.averageScore || 0), 0) / careerProgress.length
      : 0;

    const averageTimeSpent = careerProgress.length > 0
      ? careerProgress.reduce((sum, progress) => sum + (progress.totalTimeSpent || 0), 0) / careerProgress.length
      : 0;

    const analytics = {
      totalUsers,
      activeUsers,
      completedUsers,
      completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0,
      averageScore: Math.round(averageScore * 100) / 100,
      averageTimeSpent: Math.round(averageTimeSpent * 100) / 100,
      stepAnalytics,
      projectAnalytics
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching user progress analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user progress analytics' });
  }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const userProgress = await UserCareerProgress.find({ user: userId })
      .populate('achievements', 'name description icon category rarity xpReward')
      .populate('careerRole', 'name');

    const achievements = userProgress.reduce((acc, progress) => {
      return [...acc, ...progress.achievements];
    }, []);

    // Remove duplicates
    const uniqueAchievements = achievements.filter((achievement, index, self) => 
      index === self.findIndex(a => a._id.toString() === achievement._id.toString())
    );

    res.json(uniqueAchievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
};

// Export user progress data
const exportUserProgress = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const userProgress = await UserCareerProgress.find({ isActive: true })
      .populate('user', 'name email role')
      .populate('careerRole', 'name')
      .populate('achievements', 'name category rarity');

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = userProgress.map(progress => ({
        'User Name': progress.user.name,
        'User Email': progress.user.email,
        'Career Path': progress.careerRole.name,
        'Total XP': progress.totalXP,
        'Average Score': progress.averageScore,
        'Time Spent (hours)': progress.totalTimeSpent,
        'Steps Completed': progress.steps.filter(s => s.completed).length,
        'Total Steps': progress.steps.length,
        'Projects Completed': progress.projects.filter(p => p.completed).length,
        'Total Projects': progress.projects.length,
        'Achievements': progress.achievements.length,
        'Started At': progress.startedAt,
        'Last Activity': progress.lastActivity,
        'Completed At': progress.completedAt || 'Not completed'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=user-progress.csv');
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json(userProgress);
    }
  } catch (error) {
    console.error('Error exporting user progress:', error);
    res.status(500).json({ error: 'Failed to export user progress' });
  }
};

module.exports = {
  getAllUserProgress,
  getUserProgress,
  resetUserProgress,
  getUserProgressAnalytics,
  getUserAchievements,
  exportUserProgress,
  resetAllMemberProgress,
  resetIndividualMemberProgress,
  getResetStatistics
};
