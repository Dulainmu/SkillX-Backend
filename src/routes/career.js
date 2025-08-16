// routes/career.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const { submitQuiz, getMyRecommendation, getAllCareers, createCareer, updateCareer, updateCareerBySlug, deleteCareer, getCareerById, getCareerBySlug, getBriefRoadmap } = require('../controllers/careerController');
const CareerRole = require('../models/CareerRole');

// Assessment and recommendations
router.post('/submit-quiz', authMiddleware, submitQuiz);
router.get('/mine', authMiddleware, getMyRecommendation);

// Debug endpoint (public) - must come before /:id routes
router.get('/debug/all-slugs', async (req, res) => {
  try {
    const careers = await CareerRole.find({}, { slug: 1, name: 1 });
    res.status(200).json(careers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public career browsing (no auth required) - specific routes first
router.get('/slug/:slug', getCareerBySlug);

// Get brief roadmap overview (must come before /:id)
router.get('/:id/brief-roadmap', getBriefRoadmap);

// Get career skills and learning content (must come before /:id)
router.get('/:id/skills', async (req, res) => {
  try {
    const { id } = req.params;
    const career = await CareerRole.findById(id);
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    res.status(200).json({
      career: {
        id: career._id,
        name: career.name,
        description: career.description,
        skills: career.skills,
        averageSalary: career.averageSalary,
        jobGrowth: career.jobGrowth
      },
      skills: career.skills.map(skill => ({
        name: skill,
        description: `Essential skill for ${career.name}`,
        importance: 'High',
        resources: [] // Could be populated from LearningMaterial collection
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Generic career by ID route (must come after specific routes)
router.get('/:id', getCareerById);

// List all careers (public) - must be last to avoid catching other routes
router.get('/', async (req, res) => {
  try {
    const careers = await CareerRole.find({});
    res.status(200).json(careers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin CRUD endpoints (admin only)
router.post('/', authMiddleware, requireRole('admin'), createCareer);
router.put('/:id', authMiddleware, requireRole('admin'), updateCareer);
router.put('/slug/:slug', authMiddleware, requireRole('admin'), updateCareerBySlug);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCareer);

module.exports = router;
