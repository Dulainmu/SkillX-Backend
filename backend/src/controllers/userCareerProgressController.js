const UserCareerProgress = require('../models/UserCareerProgress');
const CareerRole = require('../models/CareerRole');

// Start a new career for a user
exports.startCareer = async (req, res) => {
  try {
    const { careerRoleId } = req.body;
    if (!careerRoleId) return res.status(400).json({ message: 'careerRoleId is required.' });
    const career = await CareerRole.findById(careerRoleId);
    if (!career) return res.status(404).json({ message: 'Career role not found.' });
    // Initialize steps
    const steps = (career.roadmap || []).map((_, idx) => ({ stepIndex: idx, completed: false }));
    // Prevent duplicate progress
    let progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) {
      progress = new UserCareerProgress({
        user: req.user.id,
        careerRole: careerRoleId,
        steps
      });
      await progress.save();
    }
    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user progress for a career
exports.getProgress = async (req, res) => {
  try {
    const { careerRoleId } = req.params;
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a step's completion status
exports.updateStep = async (req, res) => {
  try {
    const { careerRoleId, stepIndex } = req.params;
    const { completed } = req.body;
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    const step = progress.steps.find(s => s.stepIndex === parseInt(stepIndex));
    if (!step) return res.status(404).json({ message: 'Step not found.' });
    step.completed = completed;
    step.completedAt = completed ? new Date() : null;
    // If all steps complete, set completedAt
    if (progress.steps.every(s => s.completed)) {
      progress.completedAt = new Date();
    } else {
      progress.completedAt = null;
    }
    await progress.save();
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all user progress for all careers
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await UserCareerProgress.find({ user: req.user.id });
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark a resource as complete
exports.completeResource = async (req, res) => {
  try {
    const { careerRoleId, stepIndex } = req.params;
    const { resourceUrl } = req.body;
    if (!resourceUrl) return res.status(400).json({ message: 'resourceUrl is required.' });
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    // Prevent duplicates
    if (!progress.completedResources.some(r => r.stepIndex === parseInt(stepIndex) && r.resourceUrl === resourceUrl)) {
      progress.completedResources.push({ stepIndex: parseInt(stepIndex), resourceUrl });
      await progress.save();
    }
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark a resource as incomplete
exports.incompleteResource = async (req, res) => {
  try {
    const { careerRoleId, stepIndex } = req.params;
    const { resourceUrl } = req.body;
    if (!resourceUrl) return res.status(400).json({ message: 'resourceUrl is required.' });
    const progress = await UserCareerProgress.findOne({ user: req.user.id, careerRole: careerRoleId });
    if (!progress) return res.status(404).json({ message: 'No progress found for this career.' });
    progress.completedResources = progress.completedResources.filter(r => !(r.stepIndex === parseInt(stepIndex) && r.resourceUrl === resourceUrl));
    await progress.save();
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 