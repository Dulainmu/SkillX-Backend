const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');
const User = require('../models/User');
const CareerRole = require('../models/CareerRole');

// ===== SKILL MANAGEMENT =====

// Get all skills with filtering and pagination
exports.getAllSkills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      difficulty,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const skills = await Skill.find(filter)
      .populate('careerPaths', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Skill.countDocuments(filter);

    res.json({
      skills,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single skill by ID or slug
exports.getSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    let skill;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      skill = await Skill.findById(id)
        .populate('prerequisites.skillId', 'name slug difficulty')
        .populate('relatedSkills', 'name slug difficulty category')
        .populate('careerPaths', 'name slug description');
    } else {
      // Slug
      skill = await Skill.findOne({ slug: id })
        .populate('prerequisites.skillId', 'name slug difficulty')
        .populate('relatedSkills', 'name slug difficulty category')
        .populate('careerPaths', 'name slug description');
    }

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new skill
exports.createSkill = async (req, res) => {
  try {
    const skillData = req.body;
    skillData.createdBy = req.user.id;
    skillData.lastModifiedBy = req.user.id;

    const skill = new Skill(skillData);
    await skill.save();

    res.status(201).json(skill);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Skill with this name or slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update skill
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.lastModifiedBy = req.user.id;
    updateData.version = { $inc: 1 };

    const skill = await Skill.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if skill is being used by any career paths
    const careerPathsUsingSkill = await CareerRole.find({
      'detailedRoadmap.skills': id
    });

    if (careerPathsUsingSkill.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete skill. It is being used by career paths.',
        careerPaths: careerPathsUsingSkill.map(cp => ({ id: cp._id, name: cp.name }))
      });
    }

    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ===== USER SKILL MANAGEMENT =====

// Get user's skill progress
exports.getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userSkills = await UserSkill.findOne({ user: userId })
      .populate('skills.skill', 'name slug description category difficulty');

    if (!userSkills) {
      // Create new user skills document if it doesn't exist
      userSkills = new UserSkill({ user: userId, skills: [] });
      await userSkills.save();
    }

    res.json(userSkills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user skill progress
exports.updateUserSkill = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skillId, progressData } = req.body;

    let userSkills = await UserSkill.findOne({ user: userId });
    
    if (!userSkills) {
      userSkills = new UserSkill({ user: userId, skills: [] });
    }

    // Find existing skill progress or create new one
    const skillIndex = userSkills.skills.findIndex(s => s.skill.toString() === skillId);
    
    if (skillIndex >= 0) {
      // Update existing skill progress
      userSkills.skills[skillIndex] = {
        ...userSkills.skills[skillIndex],
        ...progressData,
        updatedAt: new Date()
      };
    } else {
      // Add new skill progress
      const skill = await Skill.findById(skillId);
      if (!skill) {
        return res.status(404).json({ message: 'Skill not found' });
      }

      userSkills.skills.push({
        skill: skillId,
        skillName: skill.name,
        skillSlug: skill.slug,
        ...progressData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await userSkills.save();
    res.json(userSkills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add skill to user's learning path
exports.addSkillToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skillId, targetLevel, targetDate, learningGoals } = req.body;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    let userSkills = await UserSkill.findOne({ user: userId });
    if (!userSkills) {
      userSkills = new UserSkill({ user: userId, skills: [] });
    }

    // Check if skill already exists
    const existingSkill = userSkills.skills.find(s => s.skill.toString() === skillId);
    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already added to user profile' });
    }

    // Add skill to user's learning goals
    userSkills.learningGoals.push({
      skillId,
      skillName: skill.name,
      targetLevel,
      targetDate,
      isCompleted: false
    });

    // Add skill to skills array
    userSkills.skills.push({
      skill: skillId,
      skillName: skill.name,
      skillSlug: skill.slug,
      targetLevel,
      targetDate,
      learningGoals: learningGoals || [],
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await userSkills.save();
    res.json(userSkills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ===== SKILL ANALYTICS =====

// Get skill analytics
exports.getSkillAnalytics = async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Get user statistics for this skill
    const userSkills = await UserSkill.find({
      'skills.skill': skillId
    });

    const analytics = {
      skill: {
        id: skill._id,
        name: skill.name,
        category: skill.category,
        difficulty: skill.difficulty
      },
      totalUsers: userSkills.length,
      averageProgress: 0,
      levelDistribution: {
        'not-started': 0,
        'beginner': 0,
        'intermediate': 0,
        'advanced': 0,
        'expert': 0
      },
      statusDistribution: {
        'learning': 0,
        'practicing': 0,
        'proficient': 0,
        'mastered': 0,
        'maintaining': 0
      },
      averageTimeSpent: 0,
      averageXpEarned: 0,
      completionRate: 0
    };

    if (userSkills.length > 0) {
      let totalProgress = 0;
      let totalTimeSpent = 0;
      let totalXpEarned = 0;
      let completedCount = 0;

      userSkills.forEach(userSkill => {
        const skillProgress = userSkill.skills.find(s => s.skill.toString() === skillId);
        if (skillProgress) {
          totalProgress += skillProgress.progress;
          totalTimeSpent += skillProgress.timeSpent;
          totalXpEarned += skillProgress.xpEarned;
          
          analytics.levelDistribution[skillProgress.level]++;
          analytics.statusDistribution[skillProgress.status]++;
          
          if (skillProgress.status === 'proficient' || skillProgress.status === 'mastered') {
            completedCount++;
          }
        }
      });

      analytics.averageProgress = totalProgress / userSkills.length;
      analytics.averageTimeSpent = totalTimeSpent / userSkills.length;
      analytics.averageXpEarned = totalXpEarned / userSkills.length;
      analytics.completionRate = (completedCount / userSkills.length) * 100;
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get skills by category
exports.getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const skills = await Skill.find({ 
      category, 
      status: 'active',
      isPublic: true 
    }).select('name slug description difficulty estimatedTimeToLearn marketDemand');

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get skill recommendations for user
exports.getSkillRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const userSkills = await UserSkill.findOne({ user: userId })
      .populate('skills.skill', 'name slug category difficulty');

    if (!userSkills) {
      // Return popular skills for new users
      const popularSkills = await Skill.find({ 
        status: 'active', 
        isPublic: true 
      })
      .sort({ totalUsers: -1 })
      .limit(parseInt(limit))
      .select('name slug description category difficulty marketDemand');

      return res.json(popularSkills);
    }

    // Get user's current skill categories
    const userCategories = userSkills.skills.map(s => s.skill.category);
    const uniqueCategories = [...new Set(userCategories)];

    // Find skills in user's preferred categories that they haven't learned
    const userSkillIds = userSkills.skills.map(s => s.skill._id.toString());
    
    const recommendations = await Skill.find({
      _id: { $nin: userSkillIds },
      category: { $in: uniqueCategories },
      status: 'active',
      isPublic: true
    })
    .sort({ marketDemand: -1, totalUsers: -1 })
    .limit(parseInt(limit))
    .select('name slug description category difficulty marketDemand estimatedTimeToLearn');

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ===== SKILL SEARCH AND DISCOVERY =====

// Search skills
exports.searchSkills = async (req, res) => {
  try {
    const { q, category, difficulty, limit = 20 } = req.query;

    const filter = {
      status: 'active',
      isPublic: true
    };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    const skills = await Skill.find(filter)
      .select('name slug description category difficulty marketDemand estimatedTimeToLearn proficiencyLevels')
      .limit(parseInt(limit));

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get skill categories
exports.getSkillCategories = async (req, res) => {
  try {
    const categories = await Skill.aggregate([
      { $match: { status: 'active', isPublic: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          skills: { $push: { name: '$name', slug: '$slug', difficulty: '$difficulty' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
