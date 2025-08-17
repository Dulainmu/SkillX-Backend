const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getSkillGapAnalysis,
  getAllCareerGapAnalysis,
  getSkillRoadmap,
  getSkillGapSummary
} = require('../controllers/skillGapController');

// All routes require authentication
router.use(protect);

// Get skill gap analysis for all career roles
router.get('/', getAllCareerGapAnalysis);

// Get skill gap summary for dashboard
router.get('/summary', getSkillGapSummary);

// Get skill gap analysis for a specific career role
router.get('/:careerSlug', getSkillGapAnalysis);

// Get detailed skill roadmap for a career
router.get('/:careerSlug/roadmap', getSkillRoadmap);

module.exports = router;
