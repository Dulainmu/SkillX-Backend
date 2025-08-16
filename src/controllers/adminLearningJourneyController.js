const CareerRole = require('../models/CareerRole');
const User = require('../models/User');
const ProjectSubmission = require('../models/ProjectSubmission');
const UserCareerProgress = require('../models/UserCareerProgress');

// Get all learning journeys with analytics
exports.getAllLearningJourneys = async (req, res) => {
  try {
    const careerRoles = await CareerRole.find({ isActive: true });
    
    // Get total users count
    const totalUsers = await User.countDocuments({});
    
    // Get all project submissions
    const allSubmissions = await ProjectSubmission.find({});
    
    const learningJourneys = await Promise.all(careerRoles.map(async (career) => {
      // Get submissions for this career
      const submissions = allSubmissions.filter(s => s.careerRole?.toString() === career._id.toString());
      const approvedSubmissions = submissions.filter(s => s.status === 'approved');
      
      // Get detailed roadmap info
      const totalSteps = career.detailedRoadmap?.length || 0;
      const totalProjects = career.detailedRoadmap?.reduce((sum, step) => sum + (step.projects?.length || 0), 0) || 0;
      
      // Calculate completion rate based on approved submissions vs total users
      const completionRate = totalUsers > 0 ? (approvedSubmissions.length / totalUsers * 100).toFixed(1) : '0.0';
      
      return {
        id: career._id,
        name: career.name,
        slug: career.slug,
        description: career.description,
        totalSteps,
        totalProjects,
        totalUsers,
        totalSubmissions: submissions.length,
        approvedSubmissions: approvedSubmissions.length,
        completionRate: `${completionRate}%`,
        lastModified: career.updatedAt,
        isActive: career.isActive,
        // New fields for unified system
        skills: career.skills || [],
        averageSalary: career.averageSalary,
        jobGrowth: career.jobGrowth,
        vector: career.vector,
        desiredRIASEC: career.desiredRIASEC,
        desiredBigFive: career.desiredBigFive,
        workValues: career.workValues
      };
    }));
    
    res.status(200).json(learningJourneys);
  } catch (error) {
    console.error('Error fetching learning journeys:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed learning journey by career ID
exports.getLearningJourney = async (req, res) => {
  try {
    const { careerId } = req.params;
    
    const career = await CareerRole.findById(careerId);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Get all project submissions for this career
    const submissions = await ProjectSubmission.find({ careerRole: careerId });
    const approvedSubmissions = submissions.filter(s => s.status === 'approved');
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');
    
    // Calculate step analytics
    const stepAnalytics = (career.detailedRoadmap || []).map((step, index) => {
      const stepSubmissions = submissions.filter(s => 
        s.project && s.project.stepId === step.id
      );
      const stepApprovedSubmissions = stepSubmissions.filter(s => s.status === 'approved');
      
      // Get user progress for this step
      const stepProgress = UserCareerProgress.find({
        careerRole: careerId,
        'progress.stepId': step.id
      });
      
      return {
        stepId: step.id,
        stepTitle: step.title,
        totalUsers: stepProgress ? stepProgress.length : 0,
        completedUsers: stepApprovedSubmissions.length,
        completionRate: stepProgress && stepProgress.length > 0 
          ? (stepApprovedSubmissions.length / stepProgress.length * 100).toFixed(1) 
          : 0,
        averageTimeToComplete: '2-3 weeks', // Default, could be calculated from actual data
        projectSubmissions: stepSubmissions.length,
        approvedSubmissions: stepApprovedSubmissions.length
      };
    });
    
    const detailedJourney = {
      career: {
        id: career._id,
        name: career.name,
        slug: career.slug,
        description: career.description,
        skills: career.skills || [],
        averageSalary: career.averageSalary,
        jobGrowth: career.jobGrowth,
        detailedRoadmap: career.detailedRoadmap || [],
        isActive: career.isActive,
        adminNotes: career.adminNotes || '',
        lastModified: career.updatedAt,
        // New personality fields
        vector: career.vector,
        desiredRIASEC: career.desiredRIASEC,
        desiredBigFive: career.desiredBigFive,
        workValues: career.workValues
      },
      analytics: {
        totalSubmissions: submissions.length,
        pendingSubmissions: pendingSubmissions.length,
        approvedSubmissions: approvedSubmissions.length,
        rejectedSubmissions: rejectedSubmissions.length,
        stepAnalytics
      }
    };
    
    res.status(200).json(detailedJourney);
  } catch (error) {
    console.error('Error fetching learning journey:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update learning journey
exports.updateLearningJourney = async (req, res) => {
  try {
    const { careerId } = req.params;
    const updateData = req.body;
    
    const career = await CareerRole.findById(careerId);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Update career with new data
    const updatedCareer = await CareerRole.findByIdAndUpdate(
      careerId,
      {
        ...updateData,
        lastModifiedBy: req.user.id,
        version: (career.version || 1) + 1
      },
      { new: true }
    );
    
    res.status(200).json(updatedCareer);
  } catch (error) {
    console.error('Error updating learning journey:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add step to learning journey
exports.addStep = async (req, res) => {
  try {
    const { careerId } = req.params;
    const { step } = req.body;
    
    const career = await CareerRole.findById(careerId);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Add step to detailed roadmap
    const updatedCareer = await CareerRole.findByIdAndUpdate(
      careerId,
      {
        $push: { detailedRoadmap: step },
        lastModifiedBy: req.user.id,
        version: (career.version || 1) + 1
      },
      { new: true }
    );
    
    res.status(200).json(updatedCareer);
  } catch (error) {
    console.error('Error adding step:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update step in learning journey
exports.updateStep = async (req, res) => {
  try {
    const { careerId, stepId } = req.params;
    const { step } = req.body;
    
    const career = await CareerRole.findById(careerId);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Update step in detailed roadmap
    const updatedCareer = await CareerRole.findByIdAndUpdate(
      careerId,
      {
        $set: {
          'detailedRoadmap.$[step]': step,
          lastModifiedBy: req.user.id,
          version: (career.version || 1) + 1
        }
      },
      {
        new: true,
        arrayFilters: [{ 'step.id': stepId }]
      }
    );
    
    res.status(200).json(updatedCareer);
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete step from learning journey
exports.deleteStep = async (req, res) => {
  try {
    const { careerId, stepId } = req.params;
    
    const career = await CareerRole.findById(careerId);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    
    // Remove step from detailed roadmap
    const updatedCareer = await CareerRole.findByIdAndUpdate(
      careerId,
      {
        $pull: { detailedRoadmap: { id: stepId } },
        lastModifiedBy: req.user.id,
        version: (career.version || 1) + 1
      },
      { new: true }
    );
    
    res.status(200).json(updatedCareer);
  } catch (error) {
    console.error('Error deleting step:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
