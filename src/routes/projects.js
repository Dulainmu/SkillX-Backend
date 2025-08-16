const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authMiddleware } = require('../middlewares/authMiddleware');

// List all projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({});
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
