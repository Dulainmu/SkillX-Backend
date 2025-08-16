const Achievement = require('../models/Achievement');
const User = require('../models/User');
const UserCareerProgress = require('../models/UserCareerProgress');

// Get all achievements with analytics
const getAllAchievements = async (req, res) => {
  try {
    const { category, rarity, status, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (rarity && rarity !== 'all') filter.rarity = rarity;
    if (status && status !== 'all') filter.isActive = status === 'active';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get achievements with pagination
    const skip = (page - 1) * limit;
    const achievements = await Achievement.find(filter)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Achievement.countDocuments(filter);

    // Calculate analytics
    const totalAchievements = await Achievement.countDocuments();
    const activeAchievements = await Achievement.countDocuments({ isActive: true });
    
    // Calculate total assignments and average unlock rate based on real user progress
    const achievementsWithStats = await Achievement.aggregate([
      {
        $lookup: {
          from: 'usercareerprogresses',
          localField: '_id',
          foreignField: 'achievements',
          as: 'userProgress'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          icon: 1,
          category: 1,
          rarity: 1,
          isActive: 1,
          xpReward: 1,
          createdAt: 1,
          assignedTo: 1,
          unlockRate: 1,
          assignedCount: { $size: '$assignedTo' },
          realAssignedCount: { $size: '$userProgress' }
        }
      }
    ]);

    const totalAssignments = achievementsWithStats.reduce((sum, achievement) => sum + achievement.realAssignedCount, 0);
    const averageUnlockRate = achievementsWithStats.length > 0 
      ? achievementsWithStats.reduce((sum, achievement) => sum + achievement.unlockRate, 0) / achievementsWithStats.length 
      : 0;

    // Find most and least popular achievements based on real assignments
    const sortedByAssignments = achievementsWithStats.sort((a, b) => b.realAssignedCount - a.realAssignedCount);
    const mostPopular = sortedByAssignments[0]?.name || 'None';
    const leastPopular = sortedByAssignments[sortedByAssignments.length - 1]?.name || 'None';

    const analytics = {
      totalAchievements,
      activeAchievements,
      totalAssignments,
      averageUnlockRate: Math.round(averageUnlockRate * 100) / 100,
      mostPopular,
      leastPopular
    };

    res.json({
      achievements,
      analytics,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

// Get single achievement
const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({ error: 'Failed to fetch achievement' });
  }
};

// Create new achievement
const createAchievement = async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      category,
      rarity,
      criteria,
      xpReward,
      isActive
    } = req.body;

    const achievement = new Achievement({
      name,
      description,
      icon: icon || 'Award',
      category: category || 'progress',
      rarity: rarity || 'common',
      criteria,
      xpReward: xpReward || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    });

    await achievement.save();

    res.status(201).json(achievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
};

// Update achievement
const updateAchievement = async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      category,
      rarity,
      criteria,
      xpReward,
      isActive
    } = req.body;

    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    achievement.name = name || achievement.name;
    achievement.description = description || achievement.description;
    achievement.icon = icon || achievement.icon;
    achievement.category = category || achievement.category;
    achievement.rarity = rarity || achievement.rarity;
    achievement.criteria = criteria || achievement.criteria;
    achievement.xpReward = xpReward !== undefined ? xpReward : achievement.xpReward;
    achievement.isActive = isActive !== undefined ? isActive : achievement.isActive;
    achievement.lastModifiedBy = req.user.id;

    await achievement.save();

    res.json(achievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
};

// Delete achievement
const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check if achievement is assigned to any users
    if (achievement.assignedTo && achievement.assignedTo.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete achievement that is assigned to users. Deactivate it instead.' 
      });
    }

    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
};

// Assign achievement to users
const assignAchievementToUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const achievementId = req.params.id;

    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Add users to achievement's assignedTo array
    const uniqueUserIds = [...new Set([...achievement.assignedTo, ...userIds])];
    achievement.assignedTo = uniqueUserIds;

    // Update unlock rate
    const totalUsers = await User.countDocuments({ role: 'user' });
    achievement.unlockRate = totalUsers > 0 ? (uniqueUserIds.length / totalUsers) * 100 : 0;

    await achievement.save();

    // Update user career progress to include this achievement
    await UserCareerProgress.updateMany(
      { user: { $in: userIds } },
      { $addToSet: { achievements: achievementId } }
    );

    res.json(achievement);
  } catch (error) {
    console.error('Error assigning achievement:', error);
    res.status(500).json({ error: 'Failed to assign achievement' });
  }
};

// Get achievement statistics
const getAchievementStats = async (req, res) => {
  try {
    const achievementId = req.params.id;

    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Get users who have this achievement from real progress data
    const usersWithAchievement = await UserCareerProgress.find({
      achievements: achievementId
    }).populate('user', 'name email');

    // Get recent assignments
    const recentAssignments = await UserCareerProgress.find({
      achievements: achievementId
    })
    .populate('user', 'name email')
    .sort({ updatedAt: -1 })
    .limit(10);

    // Calculate real unlock rate based on actual user progress
    const totalStudents = await User.countDocuments({ role: 'student' });
    const realUnlockRate = totalStudents > 0 ? (usersWithAchievement.length / totalStudents) * 100 : 0;

    const stats = {
      totalAssigned: usersWithAchievement.length, // Use real count instead of assignedTo.length
      unlockRate: realUnlockRate,
      usersWithAchievement: usersWithAchievement.length,
      recentAssignments
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    res.status(500).json({ error: 'Failed to fetch achievement statistics' });
  }
};

// Bulk assign achievements
const bulkAssignAchievements = async (req, res) => {
  try {
    const { achievementIds, userIds } = req.body;

    const achievements = await Achievement.find({ _id: { $in: achievementIds } });
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Update each achievement
    for (const achievement of achievements) {
      const uniqueUserIds = [...new Set([...achievement.assignedTo, ...userIds])];
      achievement.assignedTo = uniqueUserIds;
      achievement.unlockRate = totalUsers > 0 ? (uniqueUserIds.length / totalUsers) * 100 : 0;
      await achievement.save();
    }

    // Update user career progress
    await UserCareerProgress.updateMany(
      { user: { $in: userIds } },
      { $addToSet: { achievements: { $each: achievementIds } } }
    );

    res.json({ message: 'Achievements assigned successfully' });
  } catch (error) {
    console.error('Error bulk assigning achievements:', error);
    res.status(500).json({ error: 'Failed to assign achievements' });
  }
};

module.exports = {
  getAllAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  assignAchievementToUsers,
  getAchievementStats,
  bulkAssignAchievements
};
