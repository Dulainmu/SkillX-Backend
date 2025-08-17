//careerController.js
// src/controllers/careerController.js
const mongoose = require('mongoose');
const QuizResult = require('../models/QuizResult');
const { matchCareerRoles, normalizeUserData, validateProfile, getCareerRolesFromDatabase } = require('../utils/unifiedCareerMatch');
const { scorePersonality, mapProfileToTraitFlags } = require('../utils/personalityScoring');

// --- Admin CRUD for CareerRole ---
const CareerRole = require('../models/CareerRole');

// Input validation helper
function validateAssessmentInput(body) {
    const errors = [];
    
    if (!body.skills || typeof body.skills !== 'object') {
        errors.push('Skills object is required');
    } else {
        const selectedSkills = Object.values(body.skills).filter(s => s.selected && s.level > 0);
        if (selectedSkills.length === 0) {
            errors.push('At least one skill must be selected with level > 0');
        }
    }
    
    if (!body.preferences || typeof body.preferences !== 'object') {
        errors.push('Preferences object is required');
    } else {
        if (!body.preferences.learningStyle || !Array.isArray(body.preferences.learningStyle) || body.preferences.learningStyle.length === 0) {
            errors.push('Learning style preferences are required');
        }
    }
    
    if (!body.answers || typeof body.answers !== 'object') {
        errors.push('Quiz answers are required');
    } else {
        const answerCount = Object.keys(body.answers).length;
        if (answerCount < 20) {
            errors.push(`Expected at least 20 quiz answers, got ${answerCount}`);
        }
    }
    
    return errors;
}

// --- Assessment Functions ---

exports.submitQuiz = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`Assessment submission started for user ${userId}`);

        // Accept either:
        // 1) New schema: { skills, answers: { "1":1..5, ... }, preferences: { learningStyle?: string[] } }
        // 2) Legacy:     { skills, personalityTraits: {...}, preferences }
        const { skills, answers, personalityTraits, preferences } = req.body || {};

        // Input validation
        const validationErrors = validateAssessmentInput(req.body);
        if (validationErrors.length > 0) {
            console.warn(`Assessment validation failed for user ${userId}:`, validationErrors);
            return res.status(400).json({ 
                message: 'Invalid assessment data', 
                errors: validationErrors,
                details: 'Please check your inputs and try again'
            });
        }

        console.log(`Assessment validation passed for user ${userId}, processing...`);

        // Build map if array was sent
        let answersMap = {};
        if (Array.isArray(answers)) {
            for (const a of answers) answersMap[a.questionId] = a.score;
        } else if (answers && typeof answers === 'object') {
            answersMap = answers;
        }

        // Compute profile (Mini-IPIP-20 + RIASEC + WorkValues). Merge learning preferences.
        let profile = null;
        try {
            if (Object.keys(answersMap).length) {
                profile = scorePersonality(answersMap, preferences);
                console.log(`Personality profile computed for user ${userId}:`, {
                    RIASEC: Object.keys(profile.RIASEC).length,
                    BigFive: Object.keys(profile.BigFive).length,
                    WorkValues: Object.keys(profile.WorkValues).length,
                    learningStyle: profile.learningStyle
                });
            } else {
                // Neutral stub if no answers provided (not recommended but keeps API robust)
                profile = {
                    RIASEC: { Realistic:0.5, Investigative:0.5, Artistic:0.5, Social:0.5, Enterprising:0.5, Conventional:0.5 },
                    BigFive: { Openness:0.5, Conscientiousness:0.5, Extraversion:0.5, Agreeableness:0.5, Neuroticism:0.5 },
                    WorkValues: { Achievement:0.5, Independence:0.5, Recognition:0.5, Relationships:0.5, Support:0.5, WorkingConditions:0.5 },
                    learningStyle: preferences.learningStyle || []
                };
                console.warn(`Using neutral personality profile for user ${userId} - no quiz answers provided`);
            }
        } catch (profileError) {
            console.error(`Personality scoring failed for user ${userId}:`, profileError);
            return res.status(500).json({ 
                message: 'Failed to process personality assessment', 
                error: 'Personality scoring error',
                details: 'Please try again or contact support if the issue persists'
            });
        }

        // Validate profile completeness
        if (!validateProfile(profile)) {
            console.warn(`Incomplete profile for user ${userId}, using fallback values`);
        }

        // Legacy boolean flags still supported
        const traitFlags = (personalityTraits && typeof personalityTraits === 'object')
            ? personalityTraits
            : mapProfileToTraitFlags(profile);

        // Load career roles from database
        const careerRoles = await getCareerRolesFromDatabase(CareerRole);
        console.log(`Loaded ${careerRoles.length} career roles from database for matching`);

        // Check if we have any valid career roles
        if (careerRoles.length === 0) {
            console.error(`No valid career roles found in database for user ${userId}`);
            return res.status(404).json({ 
                message: 'No career paths available', 
                error: 'No career paths found',
                details: 'No career paths have been properly set up in the admin panel. Please contact an administrator to set up career paths with required skills and roadmaps.',
                debug: {
                    totalRolesInDB: 0,
                    validRoles: 0,
                    reason: 'No career roles with required skills and roadmaps found'
                }
            });
        }

        // Normalize user data for unified matching
        const normalizedUser = normalizeUserData({
            skills,
            personalityTraits: traitFlags,
            preferences
        });

        // Unified career matching using database career roles
        let ranked;
        try {
            ranked = matchCareerRoles(careerRoles, normalizedUser, { profile });
            console.log(`Unified career matching completed for user ${userId}, found ${ranked.length} matches`);
        } catch (matchingError) {
            console.error(`Career matching failed for user ${userId}:`, matchingError);
            return res.status(500).json({ 
                message: 'Failed to match careers', 
                error: 'Career matching error',
                details: 'Please try again or contact support if the issue persists'
            });
        }

        // Extract top matches from unified results
        const topMatches = ranked.slice(0, 3).map((match) => ({
            pathId: match.id,
            name: match.name,
            description: match.description,
            industry: 'Technology', // Default since CareerRole doesn't have industry
            averageSalary: match.averageSalary,
            jobGrowth: match.jobGrowth,
            displaySkills: match.displaySkills,
            displayTasks: match.displayTasks,
            currentRole: match.currentRole
                ? { title: match.currentRole.title, level: match.currentRole.level, score: match.currentRole.score }
                : null,
            nextRole: match.nextRole
                ? { title: match.nextRole.title, level: match.nextRole.level, missingSkills: match.nextRole.missingSkills }
                : null,
            source: 'database'
        }));

        // Validate top matches have valid scores
        const validMatches = topMatches.filter(match => {
            if (match.currentRole && typeof match.currentRole.score === 'number' && 
                !isNaN(match.currentRole.score) && match.currentRole.score >= 0 && match.currentRole.score <= 100) {
                return true;
            }
            console.warn(`Match ${match.pathId} has invalid score:`, match.currentRole?.score);
            return false;
        });

        if (validMatches.length === 0) {
            console.error(`No valid matches found for user ${userId} - all matches have invalid scores`);
            return res.status(500).json({ 
                message: 'Career matching failed', 
                error: 'No valid matches generated',
                details: 'Please try again or contact support if the issue persists'
            });
        }

        console.log(`Generated ${validMatches.length} valid top matches for user ${userId}`);

        // Save to database
        try {
            await QuizResult.findOneAndUpdate(
                { user: userId },
                { 
                    user: userId, 
                    topMatches: validMatches, 
                    submittedAt: new Date(), 
                    timestamp: new Date(),
                    answers: Object.entries(answersMap).map(([questionId, score]) => ({ 
                        questionId, 
                        score: Number(score) 
                    }))
                },
                { upsert: true, new: true }
            );
            console.log(`Quiz results saved for user ${userId}`);
        } catch (dbError) {
            console.error(`Failed to save quiz results for user ${userId}:`, dbError);
            // Continue with response even if save fails
        }

        return res.status(200).json({
            topMatches: validMatches,
            profile, // useful for UI (radar charts, explanations)
            paths: ranked.map((match) => ({
                id: match.id,
                name: match.name,
                description: match.description,
                industry: 'Technology',
                averageSalary: match.averageSalary,
                jobGrowth: match.jobGrowth,
                currentRole: match.currentRole,
                nextRole: match.nextRole,
                skills: match.skills,
                roadmap: match.roadmap,
                detailedRoadmap: match.detailedRoadmap,
                displaySkills: match.displaySkills,
                displayTasks: match.displayTasks
            }))
        });
    } catch (err) {
        console.error('submitQuiz error:', err);
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message,
            details: 'An unexpected error occurred. Please try again or contact support.'
        });
    }
};

// Defensive programming for recommendations (example for getMyRecommendation)
exports.getMyRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;
        const doc = await QuizResult.findOne({ user: userId });
        if (!doc || !Array.isArray(doc.topMatches)) return res.status(404).json({ message: 'No quiz result yet.' });
        res.json(doc);
    } catch (err) {
        console.error('getMyRecommendation error:', err);
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message,
            details: 'Failed to retrieve your recommendations. Please try again.'
        });
    }
};

// --- Admin CRUD Operations ---

// Get all career roles (for admin)
exports.getAllCareers = async (req, res) => {
  try {
    const careers = await CareerRole.find({}).sort({ name: 1 });
    
    // Transform _id to id for frontend compatibility
    console.log('Original career _id:', careers[0]?._id);
    const transformedCareers = careers.map(career => {
      const careerObj = career.toObject();
      console.log('CareerObj _id:', careerObj._id);
      const { _id, ...rest } = careerObj;
      console.log('Extracted _id:', _id);
      const result = {
        ...rest,
        id: _id
      };
      console.log('Final result id:', result.id);
      return result;
    });
    
    res.status(200).json(transformedCareers);
  } catch (err) {
    console.error('Error fetching careers:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create new career role (admin)
exports.createCareer = async (req, res) => {
  try {
    const careerData = req.body;
    
    // Validate required fields
    if (!careerData.name) {
      return res.status(400).json({ message: 'Career name is required' });
    }
    
    // Generate slug if not provided
    if (!careerData.slug) {
      careerData.slug = careerData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Ensure vector is 12-dimensional
    if (!careerData.vector || careerData.vector.length !== 12) {
      careerData.vector = Array(12).fill(0.5);
    }
    
    // Set default personality data if not provided
    if (!careerData.desiredRIASEC) {
      careerData.desiredRIASEC = {
        R: 0.5, I: 0.5, A: 0.5, S: 0.5, E: 0.5, C: 0.5
      };
    }
    
    if (!careerData.desiredBigFive) {
      careerData.desiredBigFive = {
        Openness: 0.5, Conscientiousness: 0.5, Extraversion: 0.5, Agreeableness: 0.5, Neuroticism: 0.5
      };
    }
    
    if (!careerData.workValues) {
      careerData.workValues = ['Achievement', 'Independence', 'Working Conditions'];
    }
    
    // Set default values
    careerData.isActive = careerData.isActive !== undefined ? careerData.isActive : true;
    careerData.skills = careerData.skills || [];
    careerData.roadmap = careerData.roadmap || [];
    careerData.detailedRoadmap = careerData.detailedRoadmap || [];
    careerData.displaySkills = careerData.displaySkills || [];
    careerData.displayTasks = careerData.displayTasks || [];
    
    const newCareer = new CareerRole(careerData);
    const savedCareer = await newCareer.save();
    
    res.status(201).json(savedCareer);
  } catch (err) {
    console.error('Error creating career:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Career with this name or slug already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

// Update career role (admin)
exports.updateCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate career exists
    const existingCareer = await CareerRole.findById(id);
    if (!existingCareer) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Ensure vector is 12-dimensional if provided
    if (updateData.vector && updateData.vector.length !== 12) {
      return res.status(400).json({ message: 'Vector must be 12-dimensional' });
    }
    
    // Update the career
    const updatedCareer = await CareerRole.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    // Transform _id to id for frontend compatibility
    const careerObj = updatedCareer.toObject();
    const { _id, ...rest } = careerObj;
    const transformedCareer = {
      ...rest,
      id: _id
    };
    
    res.status(200).json(transformedCareer);
  } catch (err) {
    console.error('Error updating career:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Career with this name or slug already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

// Delete career role (admin)
exports.deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if career exists
    const career = await CareerRole.findById(id);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Check if there are any users enrolled in this career
    // This would require checking UserCareerProgress or similar
    // For now, we'll allow deletion but log a warning
    
    await CareerRole.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Career deleted successfully' });
  } catch (err) {
    console.error('Error deleting career:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get career by ID (admin)
exports.getCareerById = async (req, res) => {
  const { id } = req.params;
  try {
    const career = await CareerRole.findById(id);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Transform _id to id for frontend compatibility
    const careerObj = career.toObject();
    const transformedCareer = {
      ...careerObj,
      id: careerObj._id,
      _id: undefined
    };
    
    res.status(200).json(transformedCareer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a career path by slug (name)
exports.getCareerBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const career = await CareerRole.findOne({ slug });
    if (!career) {
      return res.status(404).json({ message: 'Career path not found' });
    }
    
    // Transform _id to id for frontend compatibility
    const careerObj = career.toObject();
    const { _id, ...rest } = careerObj;
    const transformedCareer = {
      ...rest,
      id: _id
    };
    
    res.status(200).json(transformedCareer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update career role by slug (admin)
exports.updateCareerBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;
    
    // Validate career exists
    const existingCareer = await CareerRole.findOne({ slug });
    if (!existingCareer) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Ensure vector is 12-dimensional if provided
    if (updateData.vector && updateData.vector.length !== 12) {
      return res.status(400).json({ message: 'Vector must be 12-dimensional' });
    }
    
    // Update the career
    const updatedCareer = await CareerRole.findOneAndUpdate(
      { slug },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    // Transform _id to id for frontend compatibility
    const careerObj = updatedCareer.toObject();
    const { _id, ...rest } = careerObj;
    const transformedCareer = {
      ...rest,
      id: _id
    };
    
    res.status(200).json(transformedCareer);
  } catch (err) {
    console.error('Error updating career:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Career with this name or slug already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

// Get brief roadmap overview for a career
exports.getBriefRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching brief roadmap for career ID: ${id}`);
    
    // Handle both ObjectId and slug
    let career;
    if (mongoose.Types.ObjectId.isValid(id)) {
      career = await CareerRole.findById(id);
    } else {
      career = await CareerRole.findOne({ slug: id });
    }
    
    if (!career) {
      console.log(`Career not found for ID: ${id}`);
      return res.status(404).json({ 
        message: 'Career not found',
        error: 'Career path does not exist or has not been set up properly',
        details: 'Please ensure the career path exists in the admin panel with proper roadmaps and skills.'
      });
    }

    console.log(`Found career: ${career.name} (ID: ${career._id})`);

    // Check if career has required data
    if (!career.detailedRoadmap || career.detailedRoadmap.length === 0) {
      console.log(`Career ${career.name} has no detailed roadmap`);
      return res.status(404).json({ 
        message: 'Roadmap not available',
        error: 'This career path does not have a detailed roadmap set up',
        details: 'Please contact an administrator to set up the roadmap for this career path.'
      });
    }

    // Extract skills from requiredSkills if available, otherwise use legacy skills field
    const skills = career.requiredSkills?.map(rs => rs.skillName) || career.skills || [];

    // Create brief roadmap overview
    const briefRoadmap = {
      id: career._id,
      name: career.name,
      slug: career.slug,
      description: career.description,
      averageSalary: career.averageSalary || 'Not specified',
      jobGrowth: career.jobGrowth || 'Not specified',
      skills: skills,
      overview: {
        totalSteps: career.detailedRoadmap?.length || 0,
        totalProjects: career.detailedRoadmap?.reduce((sum, step) => sum + (step.projects?.length || 0), 0) || 0,
        estimatedDuration: career.detailedRoadmap?.reduce((sum, step) => {
          const time = step.estimatedTime;
          if (time) {
            const weeks = time.match(/(\d+)\s*weeks?/i);
            if (weeks) {
              return sum + parseInt(weeks[1]);
            }
          }
          return sum + 2; // Default 2 weeks per step
        }, 0) || 8,
        totalXp: career.detailedRoadmap?.reduce((sum, step) => sum + (step.xpReward || 0), 0) || 0
      },
      steps: career.detailedRoadmap?.map(step => ({
        id: step.id,
        title: step.title,
        description: step.description,
        estimatedTime: step.estimatedTime,
        xpReward: step.xpReward,
        projectCount: step.projects?.length || 0,
        skills: step.skills?.slice(0, 3) || [], // Show only first 3 skills
        difficulty: step.projects?.length > 0 ? 
          step.projects.reduce((acc, proj) => {
            if (proj.difficulty === 'Advanced') return 'Advanced';
            if (proj.difficulty === 'Intermediate' || acc === 'Intermediate') return 'Intermediate';
            return 'Beginner';
          }, 'Beginner') : 'Beginner',
        resources: step.resources || [], // Include learning materials
        projects: step.projects?.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          difficulty: project.difficulty,
          estimatedTime: project.estimatedTime,
          xpReward: project.xpReward,
          requirements: project.requirements || [],
          deliverables: project.deliverables || [],
          resources: project.resources || [] // Include project-level learning materials
        })) || []
      })) || []
    };

    console.log(`Successfully created brief roadmap for ${career.name} with ${briefRoadmap.steps.length} steps`);
    res.status(200).json(briefRoadmap);
  } catch (err) {
    console.error('Error in getBriefRoadmap:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      details: 'An unexpected error occurred while loading the career roadmap. Please try again.'
    });
  }
};