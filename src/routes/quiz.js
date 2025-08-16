const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const { authMiddleware } = require('../middlewares/authMiddleware');

// List all quizzes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({});
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a quiz
router.post('/', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a quiz
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a quiz
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
